"""
AI Mock Interview routes.

Endpoints
---------
POST /api/interview/start                   → generate session + 10 questions
POST /api/interview/{session_id}/answer/{n} → submit answer, get AI feedback
GET  /api/interview/{session_id}/report     → full report (completed sessions)
GET  /api/interview/sessions                → user's past sessions list
DELETE /api/interview/{session_id}          → delete a session

Access: Starter + Pro only (Free users get 403 with upgrade prompt).
Daily limits: Starter → 3 sessions/day, Pro → 10 sessions/day.
"""

import logging
from datetime import datetime, date
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User, SubscriptionType
from app.models.interview import InterviewSession, InterviewQuestion, InterviewAnswer
from app.schemas.interview import (
    StartInterviewRequest,
    StartInterviewResponse,
    SubmitAnswerRequest,
    AnswerFeedbackResponse,
    InterviewReportResponse,
    ReportQuestionDetail,
    SessionListResponse,
    SessionSummary,
    QuestionOut,
)
from app.services.interview_service import interview_service

logger = logging.getLogger(__name__)
router = APIRouter()

# ── Daily session limits per plan ──────────────────────────────────────────
DAILY_LIMITS: dict[str, int] = {
    "starter": 3,
    "pro":     10,
}


# ── Plan gate dependency ───────────────────────────────────────────────────

def require_paid_plan(current_user: User = Depends(get_current_user)) -> User:
    """
    Blocks free-tier users. Allows starter + pro.
    """
    plan = current_user.subscription_type.value.lower()
    if plan == "free":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "code":    "UPGRADE_REQUIRED",
                "message": "AI Mock Interview is available on Starter and Pro plans.",
                "upgrade_url": "/pricing",
            },
        )
    return current_user


def _check_daily_limit(user: User, db: Session) -> None:
    """Raise 429 if the user has hit today's session quota."""
    plan  = user.subscription_type.value.lower()
    limit = DAILY_LIMITS.get(plan, 3)

    today_start = datetime.combine(date.today(), datetime.min.time())
    count = (
        db.query(InterviewSession)
        .filter(
            InterviewSession.user_id   == user.id,
            InterviewSession.created_at >= today_start,
        )
        .count()
    )

    if count >= limit:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail={
                "code":    "DAILY_LIMIT_REACHED",
                "message": f"You've used all {limit} interview sessions for today. Come back tomorrow!",
                "limit":   limit,
                "used":    count,
            },
        )


# ── Helper: get session or 404 ─────────────────────────────────────────────

def _get_session(session_id: int, user_id: int, db: Session) -> InterviewSession:
    session = (
        db.query(InterviewSession)
        .filter(
            InterviewSession.id      == session_id,
            InterviewSession.user_id == user_id,
        )
        .first()
    )
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Interview session {session_id} not found.",
        )
    return session


# ── POST /api/interview/start ──────────────────────────────────────────────

@router.post("/start", response_model=StartInterviewResponse, status_code=201)
def start_interview(
    body:    StartInterviewRequest,
    db:      Session = Depends(get_db),
    user:    User    = Depends(require_paid_plan),
):
    """
    Upload resume + JD → AI generates 10 personalised questions.
    Returns session_id + all questions so the frontend can render the room.
    """
    _check_daily_limit(user, db)

    try:
        session = interview_service.generate_questions(
            resume_text     = body.resume_text,
            job_description = body.job_description,
            db              = db,
            user_id         = user.id,
        )
    except ValueError as exc:
        logger.error(f"Question generation failed for user {user.id}: {exc}")
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(exc),
        )
    except Exception as exc:
        logger.error(f"Interview start error for user {user.id}: {exc}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="AI service temporarily unavailable. Please try again.",
        )

    questions_out = [
        QuestionOut(
            id              = q.id,
            question_number = q.question_number,
            question_text   = q.question_text,
            category        = q.category,
            difficulty      = q.difficulty,
            tip             = q.tip,
        )
        for q in session.questions
    ]

    return StartInterviewResponse(
        session_id = session.id,
        job_role   = session.job_role,
        questions  = questions_out,
    )


# ── POST /api/interview/{session_id}/answer/{question_number} ──────────────

@router.post("/{session_id}/answer/{question_number}", response_model=AnswerFeedbackResponse)
def submit_answer(
    session_id:      int,
    question_number: int,
    body:            SubmitAnswerRequest,
    db:              Session = Depends(get_db),
    user:            User    = Depends(require_paid_plan),
):
    """
    Submit one answer → AI scores it → returns feedback + next question.
    When all 10 are answered, finalises the report automatically.
    """
    session = _get_session(session_id, user.id, db)

    if session.status == "completed":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This interview session is already completed.",
        )

    if question_number < 1 or question_number > 10:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="question_number must be between 1 and 10.",
        )

    # Check question exists
    question = (
        db.query(InterviewQuestion)
        .filter(
            InterviewQuestion.session_id      == session_id,
            InterviewQuestion.question_number == question_number,
        )
        .first()
    )
    if not question:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Question {question_number} not found in this session.",
        )

    # Prevent re-answering
    existing = (
        db.query(InterviewAnswer)
        .filter(
            InterviewAnswer.session_id      == session_id,
            InterviewAnswer.question_number == question_number,
        )
        .first()
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Question {question_number} was already answered.",
        )

    try:
        answer = interview_service.evaluate_answer(
            session       = session,
            question      = question,
            answer_text   = body.answer_text,
            answer_method = body.answer_method,
            db            = db,
        )
    except Exception as exc:
        logger.error(f"Answer evaluation error session={session_id} q={question_number}: {exc}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="AI evaluation temporarily unavailable. Please try again.",
        )

    # Check if all 10 answered → auto-finalise
    answered_count = (
        db.query(InterviewAnswer)
        .filter(InterviewAnswer.session_id == session_id)
        .count()
    )
    session_complete = answered_count >= 10

    if session_complete:
        session = interview_service.finalise_report(session, db)

    # Next question (None if last)
    next_q = None
    if not session_complete:
        next_question_row = (
            db.query(InterviewQuestion)
            .filter(
                InterviewQuestion.session_id      == session_id,
                InterviewQuestion.question_number == question_number + 1,
            )
            .first()
        )
        if next_question_row:
            next_q = QuestionOut(
                id              = next_question_row.id,
                question_number = next_question_row.question_number,
                question_text   = next_question_row.question_text,
                category        = next_question_row.category,
                difficulty      = next_question_row.difficulty,
                tip             = next_question_row.tip,
            )

    return AnswerFeedbackResponse(
        question_number   = answer.question_number,
        score             = answer.score,
        score_label       = answer.score_label,
        score_color       = answer.score_color,
        strengths         = answer.strengths or [],
        improvements      = answer.improvements or [],
        ideal_answer_hint = answer.ideal_answer_hint,
        next_question     = next_q,
        session_complete  = session_complete,
    )


# ── GET /api/interview/{session_id}/report ─────────────────────────────────

@router.get("/{session_id}/report", response_model=InterviewReportResponse)
def get_report(
    session_id: int,
    db:         Session = Depends(get_db),
    user:       User    = Depends(require_paid_plan),
):
    """
    Return the full interview report for a completed session.
    """
    session = _get_session(session_id, user.id, db)

    if session.status != "completed":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Report is only available after all 10 questions are answered.",
        )

    # Build per-question detail
    answers_map = {a.question_number: a for a in session.answers}
    question_details: list[ReportQuestionDetail] = []

    for q in session.questions:
        ans = answers_map.get(q.question_number)
        question_details.append(
            ReportQuestionDetail(
                question_number   = q.question_number,
                question_text     = q.question_text,
                category          = q.category,
                difficulty        = q.difficulty,
                answer_text       = ans.answer_text if ans else "",
                score             = ans.score if ans else 0.0,
                score_label       = ans.score_label if ans else "N/A",
                score_color       = ans.score_color if ans else "red",
                strengths         = ans.strengths if ans else [],
                improvements      = ans.improvements if ans else [],
                ideal_answer_hint = ans.ideal_answer_hint if ans else None,
            )
        )

    return InterviewReportResponse(
        session_id          = session.id,
        job_role            = session.job_role,
        overall_score       = session.overall_score or 0.0,
        readiness_level     = session.readiness_level or "not_ready",
        readiness_label     = session.readiness_label,
        score_technical     = session.score_technical,
        score_behavioral    = session.score_behavioral,
        score_situational   = session.score_situational,
        score_role_specific = session.score_role_specific,
        top_strengths       = session.top_strengths or [],
        top_improvements    = session.top_improvements or [],
        questions           = question_details,
        completed_at        = session.completed_at,
    )


# ── GET /api/interview/sessions ────────────────────────────────────────────

@router.get("/sessions", response_model=SessionListResponse)
def list_sessions(
    limit:  int     = 10,
    offset: int     = 0,
    db:     Session = Depends(get_db),
    user:   User    = Depends(require_paid_plan),
):
    """
    Return the user's past interview sessions, newest first.
    """
    query = (
        db.query(InterviewSession)
        .filter(InterviewSession.user_id == user.id)
        .order_by(InterviewSession.created_at.desc())
    )
    total    = query.count()
    sessions = query.offset(offset).limit(min(limit, 20)).all()

    summaries = [
        SessionSummary(
            id              = s.id,
            job_role        = s.job_role,
            status          = s.status,
            overall_score   = s.overall_score,
            readiness_level = s.readiness_level,
            readiness_label = s.readiness_label,
            questions_answered = s.questions_answered,
            created_at      = s.created_at,
        )
        for s in sessions
    ]

    return SessionListResponse(sessions=summaries, total=total)


# ── DELETE /api/interview/{session_id} ─────────────────────────────────────

@router.delete("/{session_id}", status_code=204)
def delete_session(
    session_id: int,
    db:         Session = Depends(get_db),
    user:       User    = Depends(require_paid_plan),
):
    """Delete an interview session and all its questions/answers."""
    session = _get_session(session_id, user.id, db)
    db.delete(session)
    db.commit()
    return None

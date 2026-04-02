"""
AI Mock Interview service.

Uses Claude Haiku (fast + cheap) for two operations:
  1. generate_questions() — 10 personalised questions from resume + JD
  2. evaluate_answer()    — scores one answer 0-10 with specific feedback

Average cost per full 10-question session: ~$0.04-0.08 with Haiku.
"""

import json
import logging
import re
from datetime import datetime
from typing import Optional

from anthropic import Anthropic, APIError, APITimeoutError, RateLimitError
from sqlalchemy.orm import Session
from tenacity import retry, retry_if_exception_type, stop_after_attempt, wait_exponential

from app.config import get_settings
from app.models.interview import InterviewAnswer, InterviewQuestion, InterviewSession

logger = logging.getLogger(__name__)
settings = get_settings()

# ── Constants ──────────────────────────────────────────────────────────────

# Haiku: fast, cheap — perfect for interview scoring
HAIKU_MODEL = "claude-haiku-4-5-20251001"

# Question distribution across 10 questions
QUESTION_DISTRIBUTION = {
    "technical":     3,
    "behavioral":    3,
    "situational":   2,
    "role_specific": 2,
}

CATEGORY_LABELS = {
    "technical":     "Technical",
    "behavioral":    "Behavioral",
    "situational":   "Situational",
    "role_specific": "Role-Specific",
}

DIFFICULTY_MAP = {
    "technical":     ["medium", "medium", "hard"],
    "behavioral":    ["easy", "medium", "medium"],
    "situational":   ["medium", "hard"],
    "role_specific": ["easy", "medium"],
}


# ── Prompt templates ───────────────────────────────────────────────────────

QUESTION_GEN_SYSTEM = """\
You are an expert technical interviewer and career coach with 15+ years of \
experience conducting interviews at top Indian IT companies (TCS, Infosys, \
Wipro, Cognizant, Flipkart, Paytm, etc.) and MNCs.

Generate highly personalised interview questions based on the candidate's \
actual resume and the specific job description. Questions must be:
- Directly relevant to the candidate's experience and the JD requirements
- Progressively challenging within each category
- Specific enough that generic answers won't score well

Return ONLY valid JSON — no markdown, no commentary.
"""

QUESTION_GEN_USER = """\
Generate exactly 10 interview questions for this candidate.

RESUME:
{resume}

JOB DESCRIPTION:
{jd}

Distribution REQUIRED:
- 3 Technical questions (skills/tools from resume + JD)
- 3 Behavioral questions (STAR-format: past experience, teamwork, conflict)
- 2 Situational questions (hypothetical problem-solving scenarios)
- 2 Role-specific questions (domain/company/industry knowledge)

Return this exact JSON:
{{
  "job_role": "<extracted job title from JD, max 60 chars>",
  "questions": [
    {{
      "question_number": 1,
      "question_text": "<specific question text>",
      "category": "technical",
      "difficulty": "easy|medium|hard",
      "tip": "<one-line hint about what interviewers look for — shown before answering>"
    }},
    ...10 total...
  ]
}}

Order: technical(1-3), behavioral(4-6), situational(7-8), role_specific(9-10)
"""

EVAL_SYSTEM = """\
You are a strict but fair interview evaluator. Score answers honestly — \
most real answers score between 4-7. Reserve 9-10 for truly exceptional \
answers with specific metrics, perfect structure, and deep insight.

Return ONLY valid JSON — no markdown, no commentary.
"""

EVAL_USER = """\
Evaluate this interview answer.

QUESTION ({category}, {difficulty}):
{question}

CANDIDATE'S ANSWER:
{answer}

CONTEXT — Candidate's resume summary:
{resume_summary}

Target role: {job_role}

Score the answer and return this exact JSON:
{{
  "score": <0.0-10.0, one decimal place>,
  "strengths": [
    "<specific strength 1 — reference actual content from their answer>",
    "<specific strength 2>"
  ],
  "improvements": [
    "<specific, actionable improvement 1 — tell them exactly what to add/change>",
    "<specific improvement 2>"
  ],
  "ideal_answer_hint": "<2-3 sentence note on ideal answer structure for this question>"
}}

Scoring guide:
  9-10: Exceptional — specific metrics, perfect STAR/structure, deep insight
  7-8:  Good — clear, relevant, mostly complete, minor gaps
  5-6:  Average — relevant but vague, missing specifics or structure
  3-4:  Below average — partially relevant, significant gaps
  0-2:  Poor — irrelevant, too short, or completely wrong
"""


# ── Helper ─────────────────────────────────────────────────────────────────

def _resume_summary(resume_text: str, max_chars: int = 800) -> str:
    """Truncate resume to first max_chars for evaluation prompts."""
    return resume_text[:max_chars].strip() + ("..." if len(resume_text) > max_chars else "")


def _clean_json(raw: str) -> str:
    """Strip markdown fences if present."""
    raw = raw.strip()
    if raw.startswith("```"):
        raw = re.sub(r"^```[a-z]*\n?", "", raw)
        raw = raw.rstrip("`").strip()
    return raw


# ── Service class ──────────────────────────────────────────────────────────

class InterviewService:
    """
    Handles AI question generation and answer evaluation for mock interviews.

    Uses Claude Haiku for cost efficiency (~$0.04-0.08 per full session).
    """

    def __init__(self) -> None:
        self.client     = Anthropic(api_key=settings.ANTHROPIC_API_KEY)
        self.model      = HAIKU_MODEL
        self.max_tokens = 4096

    # ── Internal Claude call ───────────────────────────────────────────────

    @retry(
        retry=retry_if_exception_type((APITimeoutError, RateLimitError)),
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=15),
    )
    def _call(self, system: str, user: str, max_tokens: Optional[int] = None) -> str:
        resp = self.client.messages.create(
            model=self.model,
            max_tokens=max_tokens or self.max_tokens,
            system=system,
            messages=[{"role": "user", "content": user}],
        )
        return resp.content[0].text

    # ── 1. Generate questions ──────────────────────────────────────────────

    def generate_questions(
        self,
        resume_text: str,
        job_description: str,
        db: Session,
        user_id: int,
    ) -> InterviewSession:
        """
        Create a new InterviewSession with 10 AI-generated questions.

        Returns the persisted session (with questions loaded).
        Raises on Claude error or JSON parse failure.
        """
        user_prompt = QUESTION_GEN_USER.format(
            resume=resume_text[:3000],   # keep prompt size reasonable
            jd=job_description[:2000],
        )

        raw = self._call(QUESTION_GEN_SYSTEM, user_prompt, max_tokens=2000)
        data = json.loads(_clean_json(raw))

        job_role: str = data.get("job_role", "")[:255]
        questions_data: list[dict] = data["questions"]

        if len(questions_data) != 10:
            raise ValueError(
                f"Expected 10 questions from AI, got {len(questions_data)}"
            )

        # ── Persist session ────────────────────────────────────────────────
        session = InterviewSession(
            user_id         = user_id,
            resume_text     = resume_text,
            job_description = job_description,
            job_role        = job_role,
            status          = "in_progress",
            current_question= 1,
        )
        db.add(session)
        db.flush()   # get session.id

        for q in questions_data:
            db.add(InterviewQuestion(
                session_id      = session.id,
                question_number = q["question_number"],
                question_text   = q["question_text"],
                category        = q.get("category", "technical"),
                difficulty      = q.get("difficulty", "medium"),
                tip             = q.get("tip"),
            ))

        db.commit()
        db.refresh(session)

        logger.info(
            f"Created interview session {session.id} for user {user_id} "
            f"(role='{job_role}')"
        )
        return session

    # ── 2. Evaluate one answer ─────────────────────────────────────────────

    def evaluate_answer(
        self,
        session: InterviewSession,
        question: InterviewQuestion,
        answer_text: str,
        answer_method: str,
        db: Session,
    ) -> InterviewAnswer:
        """
        Score a single answer and persist the result.

        Returns the saved InterviewAnswer row.
        """
        user_prompt = EVAL_USER.format(
            category      = CATEGORY_LABELS.get(question.category, question.category),
            difficulty     = question.difficulty.capitalize(),
            question      = question.question_text,
            answer        = answer_text,
            resume_summary= _resume_summary(session.resume_text),
            job_role      = session.job_role or "the target role",
        )

        raw = self._call(EVAL_SYSTEM, user_prompt, max_tokens=1024)
        data = json.loads(_clean_json(raw))

        score       = float(data["score"])
        strengths   = data.get("strengths", [])[:4]
        improvements= data.get("improvements", [])[:4]
        hint        = data.get("ideal_answer_hint", "")

        answer = InterviewAnswer(
            session_id        = session.id,
            question_id       = question.id,
            question_number   = question.question_number,
            answer_text       = answer_text,
            answer_method     = answer_method,
            score             = round(score, 1),
            strengths         = strengths,
            improvements      = improvements,
            ideal_answer_hint = hint,
            evaluated_at      = datetime.utcnow(),
        )
        db.add(answer)

        # Advance session progress
        session.current_question = question.question_number + 1
        session.updated_at       = datetime.utcnow()

        db.flush()
        db.commit()
        db.refresh(answer)

        logger.info(
            f"Evaluated answer for session {session.id} "
            f"q{question.question_number}: score={score}"
        )
        return answer

    # ── 3. Finalise report ─────────────────────────────────────────────────

    def finalise_report(self, session: InterviewSession, db: Session) -> InterviewSession:
        """
        Calculate overall + category scores once all 10 answers are submitted.
        Updates session status → 'completed'.
        """
        answers = (
            db.query(InterviewAnswer)
            .filter(InterviewAnswer.session_id == session.id)
            .all()
        )
        questions = {q.id: q for q in session.questions}

        if not answers:
            return session

        # ── Per-category scores ────────────────────────────────────────────
        cat_scores: dict[str, list[float]] = {
            "technical":     [],
            "behavioral":    [],
            "situational":   [],
            "role_specific": [],
        }

        all_strengths:    list[str] = []
        all_improvements: list[str] = []

        for ans in answers:
            q = questions.get(ans.question_id)
            cat = q.category if q else "technical"
            if cat in cat_scores:
                cat_scores[cat].append(ans.score)
            all_strengths.extend(ans.strengths or [])
            all_improvements.extend(ans.improvements or [])

        def avg(lst: list[float]) -> Optional[float]:
            return round(sum(lst) / len(lst) * 10, 1) if lst else None

        session.score_technical     = avg(cat_scores["technical"])
        session.score_behavioral    = avg(cat_scores["behavioral"])
        session.score_situational   = avg(cat_scores["situational"])
        session.score_role_specific = avg(cat_scores["role_specific"])

        # Overall = mean of all answer scores, scaled to 100
        all_scores = [a.score for a in answers]
        session.overall_score   = round(sum(all_scores) / len(all_scores) * 10, 1)
        session.readiness_level = InterviewSession.score_to_readiness(session.overall_score)

        # Top 3 unique strengths / improvements (most frequent)
        session.top_strengths    = list(dict.fromkeys(all_strengths))[:3]
        session.top_improvements = list(dict.fromkeys(all_improvements))[:3]

        session.status       = "completed"
        session.completed_at = datetime.utcnow()
        session.updated_at   = datetime.utcnow()

        db.commit()
        db.refresh(session)

        logger.info(
            f"Session {session.id} finalised — "
            f"overall={session.overall_score}, level={session.readiness_level}"
        )
        return session


# ── Singleton ──────────────────────────────────────────────────────────────

interview_service = InterviewService()

"""
Pydantic schemas for AI Mock Interview feature.
"""

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


# ── Request schemas ────────────────────────────────────────────────────────

class StartInterviewRequest(BaseModel):
    resume_text:     str = Field(..., min_length=100,  description="Resume content as plain text")
    job_description: str = Field(..., min_length=50,   description="Job description to prepare for")


class SubmitAnswerRequest(BaseModel):
    answer_text:   str = Field(..., min_length=10, description="User's answer to the question")
    answer_method: str = Field(default="typed",   description="typed or voice")


# ── Shared sub-schemas ─────────────────────────────────────────────────────

class QuestionOut(BaseModel):
    id:              int
    question_number: int
    question_text:   str
    category:        str      # technical/behavioral/situational/role_specific
    difficulty:      str      # easy/medium/hard
    tip:             Optional[str] = None

    model_config = {"from_attributes": True}


class AnswerOut(BaseModel):
    id:                 int
    question_number:    int
    answer_text:        str
    answer_method:      str
    score:              float
    strengths:          list[str]
    improvements:       list[str]
    ideal_answer_hint:  Optional[str] = None
    evaluated_at:       datetime

    model_config = {"from_attributes": True}


# ── Response schemas ───────────────────────────────────────────────────────

class StartInterviewResponse(BaseModel):
    session_id:  int
    job_role:    Optional[str]
    questions:   list[QuestionOut]
    message:     str = "Interview started. Answer each question to get AI feedback."

    model_config = {"from_attributes": True}


class AnswerFeedbackResponse(BaseModel):
    """Returned immediately after submitting one answer."""
    question_number:    int
    score:              float          # 0-10
    score_label:        str            # Excellent / Good / Average / Needs Work
    score_color:        str            # green / yellow / red
    strengths:          list[str]
    improvements:       list[str]
    ideal_answer_hint:  Optional[str]
    next_question:      Optional[QuestionOut]   # None when all 10 answered
    session_complete:   bool


class SessionSummary(BaseModel):
    """Lightweight session card for history list."""
    id:              int
    job_role:        Optional[str]
    status:          str
    overall_score:   Optional[float]
    readiness_level: Optional[str]
    readiness_label: str
    questions_answered: int
    created_at:      datetime

    model_config = {"from_attributes": True}


class ReportQuestionDetail(BaseModel):
    """One Q+A row in the full report."""
    question_number: int
    question_text:   str
    category:        str
    difficulty:      str
    answer_text:     str
    score:           float
    score_label:     str
    score_color:     str
    strengths:       list[str]
    improvements:    list[str]
    ideal_answer_hint: Optional[str]


class InterviewReportResponse(BaseModel):
    """Full report returned after session completes."""
    session_id:          int
    job_role:            Optional[str]
    overall_score:       float          # 0-100
    readiness_level:     str
    readiness_label:     str

    # Category breakdowns
    score_technical:     Optional[float]
    score_behavioral:    Optional[float]
    score_situational:   Optional[float]
    score_role_specific: Optional[float]

    # Summary
    top_strengths:    list[str]
    top_improvements: list[str]

    # Per-question details
    questions: list[ReportQuestionDetail]

    completed_at: Optional[datetime]

    model_config = {"from_attributes": True}


class SessionListResponse(BaseModel):
    sessions: list[SessionSummary]
    total:    int


class SessionStateResponse(BaseModel):
    """Current state of an in-progress (or completed) session — used to resume."""
    session_id:               int
    job_role:                 Optional[str]
    status:                   str            # in_progress / completed
    current_question_number:  int            # next question to answer (1-10)
    questions_answered:       int
    answered_question_numbers: list[int]     # e.g. [1, 2]
    questions:                list[QuestionOut]

    model_config = {"from_attributes": True}

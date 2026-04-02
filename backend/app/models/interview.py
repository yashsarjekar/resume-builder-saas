"""
AI Mock Interview models.

Three tables:
  InterviewSession  — one per interview attempt (holds resume + JD + final scores)
  InterviewQuestion — 10 questions generated per session
  InterviewAnswer   — user answer + AI evaluation per question
"""

from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, Float, Boolean, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship

from app.database import Base


class InterviewSession(Base):
    __tablename__ = "interview_sessions"

    id                  = Column(Integer, primary_key=True, index=True)
    user_id             = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    # Input
    resume_text         = Column(Text, nullable=False)
    job_description     = Column(Text, nullable=False)
    job_role            = Column(String(255), nullable=True)

    # State
    status              = Column(String(20), default="in_progress", nullable=False)  # in_progress/completed/abandoned
    current_question    = Column(Integer, default=1, nullable=False)  # 1-10

    # Results
    overall_score       = Column(Float, nullable=True)   # 0-100
    readiness_level     = Column(String(30), nullable=True)  # not_ready/needs_work/interview_ready/confident
    score_technical     = Column(Float, nullable=True)
    score_behavioral    = Column(Float, nullable=True)
    score_situational   = Column(Float, nullable=True)
    score_role_specific = Column(Float, nullable=True)
    top_strengths       = Column(JSONB, default=list)
    top_improvements    = Column(JSONB, default=list)

    # Timestamps
    completed_at        = Column(DateTime, nullable=True)
    created_at          = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at          = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    questions           = relationship("InterviewQuestion", back_populates="session",
                                       cascade="all, delete-orphan", order_by="InterviewQuestion.question_number")
    answers             = relationship("InterviewAnswer", back_populates="session",
                                       cascade="all, delete-orphan", order_by="InterviewAnswer.question_number")

    def __repr__(self) -> str:
        return f"<InterviewSession(id={self.id}, user={self.user_id}, status='{self.status}', score={self.overall_score})>"

    @property
    def questions_answered(self) -> int:
        return len(self.answers) if self.answers else 0

    @property
    def readiness_label(self) -> str:
        labels = {
            "not_ready":       "Not Ready",
            "needs_work":      "Needs Work",
            "interview_ready": "Interview Ready",
            "confident":       "Highly Confident",
        }
        return labels.get(self.readiness_level or "", "In Progress")

    @staticmethod
    def score_to_readiness(score: float) -> str:
        if score >= 80:
            return "confident"
        if score >= 65:
            return "interview_ready"
        if score >= 45:
            return "needs_work"
        return "not_ready"


class InterviewQuestion(Base):
    __tablename__ = "interview_questions"

    id              = Column(Integer, primary_key=True, index=True)
    session_id      = Column(Integer, ForeignKey("interview_sessions.id", ondelete="CASCADE"), nullable=False, index=True)
    question_number = Column(Integer, nullable=False)   # 1-10
    question_text   = Column(Text, nullable=False)
    category        = Column(String(30), nullable=False)  # technical/behavioral/situational/role_specific
    difficulty      = Column(String(10), default="medium", nullable=False)  # easy/medium/hard
    tip             = Column(Text, nullable=True)         # shown before answering
    created_at      = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    session         = relationship("InterviewSession", back_populates="questions")
    answer          = relationship("InterviewAnswer", back_populates="question",
                                   uselist=False, cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<InterviewQuestion(id={self.id}, session={self.session_id}, q={self.question_number}, cat='{self.category}')>"


class InterviewAnswer(Base):
    __tablename__ = "interview_answers"

    id              = Column(Integer, primary_key=True, index=True)
    session_id      = Column(Integer, ForeignKey("interview_sessions.id", ondelete="CASCADE"), nullable=False, index=True)
    question_id     = Column(Integer, ForeignKey("interview_questions.id", ondelete="CASCADE"), nullable=False, index=True)
    question_number = Column(Integer, nullable=False)

    # User's answer
    answer_text     = Column(Text, nullable=False)
    answer_method   = Column(String(10), default="typed")  # typed / voice

    # AI evaluation
    score           = Column(Float, nullable=False)         # 0-10
    strengths       = Column(JSONB, default=list)           # ["..."]
    improvements    = Column(JSONB, default=list)           # ["..."]
    ideal_answer_hint = Column(Text, nullable=True)
    evaluated_at    = Column(DateTime, default=datetime.utcnow, nullable=False)

    created_at      = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    session         = relationship("InterviewSession", back_populates="answers")
    question        = relationship("InterviewQuestion", back_populates="answer")

    def __repr__(self) -> str:
        return f"<InterviewAnswer(id={self.id}, session={self.session_id}, q={self.question_number}, score={self.score})>"

    @property
    def score_label(self) -> str:
        if self.score >= 8:
            return "Excellent"
        if self.score >= 6:
            return "Good"
        if self.score >= 4:
            return "Average"
        return "Needs Work"

    @property
    def score_color(self) -> str:
        if self.score >= 8:
            return "green"
        if self.score >= 6:
            return "yellow"
        return "red"

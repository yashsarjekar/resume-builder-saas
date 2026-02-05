"""
Resume model for the Resume Builder application.

This module defines the Resume database model for storing user resumes,
including original content, AI-optimized versions, and ATS scores.
"""

from sqlalchemy import Column, Integer, String, Text, JSON, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from ..database import Base
from typing import Optional, Dict, Any


class Resume(Base):
    """
    Resume model for storing resume data and AI optimizations.

    Attributes:
        id: Primary key identifier
        user_id: Foreign key to the user who owns this resume
        title: User-defined title for the resume
        job_description: Target job description for optimization
        content: Original resume data as JSON
        optimized_content: AI-optimized resume data as JSON
        ats_score: ATS compatibility score (0-100)
        template_name: Name of the PDF template to use
        created_at: Timestamp when resume was created
        updated_at: Timestamp when resume was last updated
        user: Relationship to the User who owns this resume
    """

    __tablename__ = "resumes"

    # Primary fields
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    title = Column(String, nullable=False)

    # Job targeting
    job_description = Column(Text, nullable=True)

    # Resume content (stored as JSON)
    content = Column(JSON, nullable=False)
    optimized_content = Column(JSON, nullable=True)

    # ATS scoring
    ats_score = Column(Integer, nullable=True)

    # Template settings
    template_name = Column(String, default="modern", nullable=False)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False
    )

    # Relationships
    user = relationship("User", back_populates="resumes")

    def __repr__(self) -> str:
        """String representation of Resume."""
        return f"<Resume(id={self.id}, title='{self.title}', user_id={self.user_id})>"

    def has_optimization(self) -> bool:
        """
        Check if resume has been optimized by AI.

        Returns:
            bool: True if optimized_content exists, False otherwise
        """
        return self.optimized_content is not None

    def has_ats_score(self) -> bool:
        """
        Check if resume has an ATS score.

        Returns:
            bool: True if ats_score exists, False otherwise
        """
        return self.ats_score is not None

    def get_ats_score_category(self) -> Optional[str]:
        """
        Get the ATS score category based on the score value.

        Returns:
            str: Score category ('Excellent', 'Good', 'Fair', 'Poor') or None
        """
        if self.ats_score is None:
            return None

        if self.ats_score >= 80:
            return "Excellent"
        elif self.ats_score >= 60:
            return "Good"
        elif self.ats_score >= 40:
            return "Fair"
        else:
            return "Poor"

    def update_content(self, new_content: Dict[str, Any]) -> None:
        """
        Update resume content and reset optimization.

        Args:
            new_content: New resume content as dictionary
        """
        self.content = new_content
        # Reset optimization when content changes
        self.optimized_content = None
        self.ats_score = None
        self.updated_at = datetime.utcnow()

    def set_optimization(
        self,
        optimized_content: Dict[str, Any],
        ats_score: Optional[int] = None
    ) -> None:
        """
        Set AI-optimized content and ATS score.

        Args:
            optimized_content: Optimized resume content as dictionary
            ats_score: ATS compatibility score (0-100)
        """
        self.optimized_content = optimized_content
        if ats_score is not None:
            self.ats_score = ats_score
        self.updated_at = datetime.utcnow()

    def to_dict(self, include_content: bool = True) -> Dict[str, Any]:
        """
        Convert resume to dictionary for API responses.

        Args:
            include_content: Whether to include full content in response

        Returns:
            dict: Resume data as dictionary
        """
        result = {
            "id": self.id,
            "user_id": self.user_id,
            "title": self.title,
            "job_description": self.job_description,
            "ats_score": self.ats_score,
            "ats_category": self.get_ats_score_category(),
            "template_name": self.template_name,
            "has_optimization": self.has_optimization(),
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }

        if include_content:
            result["content"] = self.content
            result["optimized_content"] = self.optimized_content

        return result

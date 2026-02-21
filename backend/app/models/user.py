"""
User model for the Resume Builder application.

This module defines the User database model with subscription management,
usage tracking, and relationships to resumes and payments.
"""

from sqlalchemy import Column, Integer, String, DateTime, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
from ..database import Base
import enum


class SubscriptionType(str, enum.Enum):
    """Enum for different subscription tiers."""
    FREE = "free"
    STARTER = "starter"
    PRO = "pro"


class User(Base):
    """
    User model for storing user account information.

    Attributes:
        id: Primary key identifier
        email: Unique email address for the user
        name: Full name of the user
        password_hash: Hashed password (never store plaintext)
        subscription_type: Current subscription tier (FREE, STARTER, PRO)
        subscription_expiry: Expiration date for paid subscriptions
        resume_count: Number of resumes created by user
        ats_analysis_count: Number of ATS analyses performed
        created_at: Timestamp when user was created
        updated_at: Timestamp when user was last updated
        resumes: Relationship to user's resumes
        payments: Relationship to user's payments
    """

    __tablename__ = "users"

    # Primary fields
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    password_hash = Column(String, nullable=False)

    # Subscription management
    subscription_type = Column(
        Enum(SubscriptionType),
        default=SubscriptionType.FREE,
        nullable=False
    )
    subscription_expiry = Column(DateTime, nullable=True)
    billing_duration = Column(Integer, default=1, nullable=False)  # 1, 3, 6, or 12 months

    # Razorpay customer ID for recurring subscriptions
    razorpay_customer_id = Column(String, nullable=True)

    # User region for subscription limits ("IN" for India, "INTL" for international)
    region = Column(String(10), default="IN", nullable=False)

    # Usage tracking
    resume_count = Column(Integer, default=0, nullable=False)
    ats_analysis_count = Column(Integer, default=0, nullable=False)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False
    )

    # Relationships
    resumes = relationship(
        "Resume",
        back_populates="user",
        cascade="all, delete-orphan"
    )
    payments = relationship(
        "Payment",
        back_populates="user",
        cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        """String representation of User."""
        return f"<User(id={self.id}, email='{self.email}', subscription='{self.subscription_type.value}')>"

    def is_subscription_active(self) -> bool:
        """
        Check if the user's paid subscription is still active.

        Returns:
            bool: True if subscription is active, False otherwise
        """
        if self.subscription_type == SubscriptionType.FREE:
            return True

        if self.subscription_expiry is None:
            return False

        return datetime.utcnow() < self.subscription_expiry

    def get_scaled_limit(self, base_limit: int) -> int:
        """
        Scale a limit based on billing duration.
        Quarterly gets 3x, Half-yearly gets 6x, Yearly gets 12x.

        Args:
            base_limit: The base monthly limit

        Returns:
            int: Scaled limit based on billing duration
        """
        if base_limit >= 999:  # Pro/unlimited
            return base_limit
        duration = self.billing_duration if self.billing_duration else 1
        return base_limit * duration

    def can_create_resume(self, limit_config: dict) -> bool:
        """
        Check if user can create another resume based on subscription limits.

        Args:
            limit_config: Dictionary containing subscription limits (should be region-specific)

        Returns:
            bool: True if user can create resume, False otherwise
        """
        if not self.is_subscription_active():
            return False

        limit_key = f"{self.subscription_type.value.upper()}_RESUME_LIMIT"
        base_limit = limit_config.get(limit_key, 1)
        limit = self.get_scaled_limit(base_limit)

        return self.resume_count < limit

    def can_analyze_ats(self, limit_config: dict) -> bool:
        """
        Check if user can perform ATS analysis based on subscription limits.

        Args:
            limit_config: Dictionary containing subscription limits (should be region-specific)

        Returns:
            bool: True if user can analyze ATS, False otherwise
        """
        if not self.is_subscription_active():
            return False

        limit_key = f"{self.subscription_type.value.upper()}_ATS_ANALYSIS_LIMIT"
        base_limit = limit_config.get(limit_key, 2)
        limit = self.get_scaled_limit(base_limit)

        return self.ats_analysis_count < limit

    def get_region(self) -> str:
        """
        Get user's region for limit calculations.

        Returns:
            str: "IN" for India, "INTL" for international
        """
        return self.region if self.region else "IN"

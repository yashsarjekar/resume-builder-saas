"""
Payment model for the Resume Builder application.

This module defines the Payment database model for tracking Razorpay
payment transactions and subscription purchases.
"""

from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
from ..database import Base
import enum
from typing import Optional


class PaymentStatus(str, enum.Enum):
    """Enum for payment transaction status."""
    PENDING = "pending"
    SUCCESS = "success"
    FAILED = "failed"


class Payment(Base):
    """
    Payment model for storing payment transaction data.

    Attributes:
        id: Primary key identifier
        user_id: Foreign key to the user who made the payment
        razorpay_order_id: Razorpay order ID
        razorpay_payment_id: Razorpay payment ID (after successful payment)
        razorpay_signature: Razorpay signature for verification
        amount: Payment amount in paise (Indian currency subunit)
        currency: Currency code (default: INR)
        status: Payment status (PENDING, SUCCESS, FAILED)
        plan: Subscription plan (starter/pro)
        duration_months: Subscription duration in months
        created_at: Timestamp when payment was initiated
        updated_at: Timestamp when payment was last updated
        user: Relationship to the User who made the payment
    """

    __tablename__ = "payments"

    # Primary fields
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)

    # Razorpay fields
    razorpay_order_id = Column(String, nullable=True, index=True)
    razorpay_payment_id = Column(String, nullable=True, index=True)
    razorpay_signature = Column(String, nullable=True)

    # Payment details
    amount = Column(Integer, nullable=False)  # Amount in paise
    currency = Column(String, default="INR", nullable=False)
    status = Column(
        Enum(PaymentStatus),
        default=PaymentStatus.PENDING,
        nullable=False
    )
    plan = Column(String, nullable=False)  # starter/pro
    duration_months = Column(Integer, nullable=False)  # 1, 3, 6, 12

    # Timestamp
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    user = relationship("User", back_populates="payments")

    def __repr__(self) -> str:
        """String representation of Payment."""
        return (
            f"<Payment(id={self.id}, "
            f"user_id={self.user_id}, "
            f"plan={self.plan}, "
            f"amount={self.amount}, "
            f"status='{self.status.value}')>"
        )

    def is_successful(self) -> bool:
        """
        Check if payment was successful.

        Returns:
            bool: True if payment status is SUCCESS, False otherwise
        """
        return self.status == PaymentStatus.SUCCESS

    def is_pending(self) -> bool:
        """
        Check if payment is still pending.

        Returns:
            bool: True if payment status is PENDING, False otherwise
        """
        return self.status == PaymentStatus.PENDING

    def mark_success(
        self,
        razorpay_payment_id: str,
        razorpay_signature: str
    ) -> None:
        """
        Mark payment as successful with Razorpay IDs.

        Args:
            razorpay_payment_id: Razorpay payment ID
            razorpay_signature: Razorpay signature for verification
        """
        self.status = PaymentStatus.SUCCESS
        self.razorpay_payment_id = razorpay_payment_id
        self.razorpay_signature = razorpay_signature

    def mark_failed(self) -> None:
        """Mark payment as failed."""
        self.status = PaymentStatus.FAILED

    def get_amount_in_rupees(self) -> float:
        """
        Convert amount from paise to rupees.

        Returns:
            float: Amount in rupees (INR)
        """
        return self.amount / 100.0

    def to_dict(self) -> dict:
        """
        Convert payment to dictionary for API responses.

        Returns:
            dict: Payment data as dictionary
        """
        return {
            "id": self.id,
            "user_id": self.user_id,
            "razorpay_order_id": self.razorpay_order_id,
            "razorpay_payment_id": self.razorpay_payment_id,
            "amount": self.amount,
            "amount_rupees": self.get_amount_in_rupees(),
            "currency": self.currency,
            "status": self.status.value,
            "plan": self.plan,
            "duration_months": self.duration_months,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }


"""
Pydantic schemas for user-related requests and responses.

This module defines all data validation models for user authentication
and profile management.
"""

from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional
from datetime import datetime
from app.models.user import SubscriptionType


class UserBase(BaseModel):
    """Base user schema with common fields."""
    email: EmailStr
    name: str = Field(..., min_length=2, max_length=100)


class UserCreate(UserBase):
    """
    Schema for user registration.

    Attributes:
        email: Valid email address
        name: Full name (2-100 characters)
        password: Password (minimum 8 characters)
    """
    password: str = Field(..., min_length=8, max_length=100)

    @validator('password')
    def validate_password(cls, v: str) -> str:
        """
        Validate password strength.

        Args:
            v: Password string

        Returns:
            str: Validated password

        Raises:
            ValueError: If password doesn't meet requirements
        """
        if not any(char.isdigit() for char in v):
            raise ValueError('Password must contain at least one digit')
        if not any(char.isalpha() for char in v):
            raise ValueError('Password must contain at least one letter')
        return v

    @validator('name')
    def validate_name(cls, v: str) -> str:
        """
        Validate and clean name.

        Args:
            v: Name string

        Returns:
            str: Cleaned name
        """
        # Remove extra whitespace
        v = ' '.join(v.split())
        if not v:
            raise ValueError('Name cannot be empty')
        return v


class UserLogin(BaseModel):
    """
    Schema for user login.

    Attributes:
        email: Valid email address
        password: User password
    """
    email: EmailStr
    password: str


class UserResponse(UserBase):
    """
    Schema for user data in API responses.

    Attributes:
        id: User ID
        email: Email address
        name: Full name
        subscription_type: Current subscription tier
        subscription_expiry: Subscription expiration date
        resume_count: Number of resumes created
        ats_analysis_count: Number of ATS analyses performed
        created_at: Account creation timestamp
    """
    id: int
    subscription_type: SubscriptionType
    subscription_expiry: Optional[datetime] = None
    resume_count: int
    ats_analysis_count: int
    created_at: datetime

    class Config:
        """Pydantic configuration."""
        from_attributes = True  # Enables ORM mode for SQLAlchemy models


class Token(BaseModel):
    """
    Schema for JWT token response.

    Attributes:
        access_token: JWT access token
        token_type: Token type (always "bearer")
    """
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    """
    Schema for data stored in JWT token.

    Attributes:
        email: User email from token
        user_id: User ID from token
    """
    email: Optional[str] = None
    user_id: Optional[int] = None


class UserUpdate(BaseModel):
    """
    Schema for updating user profile.

    All fields are optional for partial updates.

    Attributes:
        name: Updated name
        email: Updated email
    """
    name: Optional[str] = Field(None, min_length=2, max_length=100)
    email: Optional[EmailStr] = None

    @validator('name')
    def validate_name(cls, v: Optional[str]) -> Optional[str]:
        """
        Validate and clean name if provided.

        Args:
            v: Name string or None

        Returns:
            str: Cleaned name or None
        """
        if v is not None:
            v = ' '.join(v.split())
            if not v:
                raise ValueError('Name cannot be empty')
        return v


class PasswordChange(BaseModel):
    """
    Schema for changing user password.

    Attributes:
        current_password: Current password for verification
        new_password: New password to set
    """
    current_password: str
    new_password: str = Field(..., min_length=8, max_length=100)

    @validator('new_password')
    def validate_password(cls, v: str) -> str:
        """
        Validate new password strength.

        Args:
            v: Password string

        Returns:
            str: Validated password

        Raises:
            ValueError: If password doesn't meet requirements
        """
        if not any(char.isdigit() for char in v):
            raise ValueError('Password must contain at least one digit')
        if not any(char.isalpha() for char in v):
            raise ValueError('Password must contain at least one letter')
        return v


class SubscriptionInfo(BaseModel):
    """
    Schema for subscription information.

    Attributes:
        subscription_type: Current subscription tier
        subscription_expiry: Expiration date
        is_active: Whether subscription is currently active
        resume_count: Resumes created
        resume_limit: Maximum resumes allowed
        ats_analysis_count: ATS analyses performed
        ats_analysis_limit: Maximum ATS analyses allowed
    """
    subscription_type: SubscriptionType
    subscription_expiry: Optional[datetime]
    is_active: bool
    resume_count: int
    resume_limit: int
    ats_analysis_count: int
    ats_analysis_limit: int

    class Config:
        """Pydantic configuration."""
        from_attributes = True

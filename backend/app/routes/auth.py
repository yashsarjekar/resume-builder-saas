"""
Authentication routes for user signup, login, and profile management.

This module handles all authentication-related API endpoints including
user registration, login, and profile retrieval.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Dict, Any
import logging

from app.database import get_db
from app.models.user import User, SubscriptionType
from app.schemas.user import (
    UserCreate,
    UserLogin,
    UserResponse,
    Token,
    SubscriptionInfo,
    UserUpdate,
    PasswordChange
)
from app.utils.auth import hash_password, verify_password, create_access_token
from app.dependencies import get_current_user, get_current_active_user
from app.config import get_settings
from app.services.email_service import email_service

# Initialize router
router = APIRouter()

# Initialize logger
logger = logging.getLogger(__name__)

# Get settings
settings = get_settings()


@router.post("/signup", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def signup(
    user_data: UserCreate,
    db: Session = Depends(get_db)
) -> User:
    """
    Register a new user account.

    Creates a new user with FREE subscription tier. Validates that email
    is not already registered.

    Args:
        user_data: User registration data (email, name, password)
        db: Database session

    Returns:
        UserResponse: Created user data (without password)

    Raises:
        HTTPException 400: If email already registered
        HTTPException 422: If validation fails

    Example:
        POST /api/auth/signup
        {
            "email": "user@example.com",
            "name": "John Doe",
            "password": "securepass123"
        }
    """
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == user_data.email).first()

    if existing_user:
        logger.warning(f"Signup attempt with existing email: {user_data.email}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    # Hash the password
    hashed_password = hash_password(user_data.password)

    # Determine region based on country (IN = India, else = International)
    country = getattr(user_data, 'country', 'IN') or 'IN'
    region = "IN" if country.upper() == "IN" else "INTL"

    # Create new user
    new_user = User(
        email=user_data.email,
        name=user_data.name,
        password_hash=hashed_password,
        subscription_type=SubscriptionType.FREE,
        region=region,
        resume_count=0,
        ats_analysis_count=0
    )

    # Add to database
    try:
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        logger.info(f"New user registered: {new_user.email} (ID: {new_user.id})")

        # Send welcome email
        try:
            email_service.send_welcome_email(
                user_email=new_user.email,
                user_name=new_user.name
            )
        except Exception as email_error:
            # Don't fail signup if email fails
            logger.error(f"Failed to send welcome email to {new_user.email}: {str(email_error)}")

        return new_user

    except Exception as e:
        db.rollback()
        logger.error(f"Error creating user: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create user account"
        )


@router.post("/login", response_model=Token)
async def login(
    credentials: UserLogin,
    db: Session = Depends(get_db)
) -> Dict[str, str]:
    """
    Authenticate user and return JWT token.

    Validates user credentials and returns a JWT access token
    for authenticated requests.

    Args:
        credentials: Login credentials (email, password)
        db: Database session

    Returns:
        Token: JWT access token and token type

    Raises:
        HTTPException 401: If credentials are invalid

    Example:
        POST /api/auth/login
        {
            "email": "user@example.com",
            "password": "securepass123"
        }

        Response:
        {
            "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
            "token_type": "bearer"
        }
    """
    # Find user by email
    user = db.query(User).filter(User.email == credentials.email).first()

    # Verify user exists and password is correct
    if not user or not verify_password(credentials.password, user.password_hash):
        logger.warning(f"Failed login attempt for email: {credentials.email}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Create access token
    access_token = create_access_token(
        data={"sub": user.email, "user_id": user.id}
    )

    logger.info(f"Successful login: {user.email} (ID: {user.id})")

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }


@router.get("/me", response_model=UserResponse)
async def get_current_user_profile(
    current_user: User = Depends(get_current_user)
) -> User:
    """
    Get current authenticated user's profile.

    Returns the profile information of the currently authenticated user
    based on the JWT token.

    Args:
        current_user: Authenticated user from JWT token

    Returns:
        UserResponse: User profile data

    Raises:
        HTTPException 401: If not authenticated

    Example:
        GET /api/auth/me
        Headers: Authorization: Bearer <token>

        Response:
        {
            "id": 1,
            "email": "user@example.com",
            "name": "John Doe",
            "subscription_type": "free",
            "resume_count": 0,
            "ats_analysis_count": 0,
            ...
        }
    """
    return current_user


@router.get("/subscription", response_model=SubscriptionInfo)
async def get_subscription_info(
    current_user: User = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Get detailed subscription information for current user.

    Returns subscription status, limits, and usage counts.

    Args:
        current_user: Authenticated user from JWT token

    Returns:
        SubscriptionInfo: Detailed subscription information

    Example:
        GET /api/auth/subscription
        Headers: Authorization: Bearer <token>
    """
    # Get region-specific limits
    user_region = current_user.get_region() if hasattr(current_user, 'get_region') else "IN"

    return {
        "subscription_type": current_user.subscription_type,
        "subscription_expiry": current_user.subscription_expiry,
        "is_active": current_user.is_subscription_active(),
        "resume_count": current_user.resume_count,
        "resume_limit": settings.get_resume_limit(
            current_user.subscription_type.value, user_region
        ),
        "ats_analysis_count": current_user.ats_analysis_count,
        "ats_analysis_limit": settings.get_ats_limit(
            current_user.subscription_type.value, user_region
        ),
        "region": user_region,
    }


@router.put("/profile", response_model=UserResponse)
async def update_profile(
    update_data: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> User:
    """
    Update current user's profile information.

    Allows updating name and email. Email must be unique.

    Args:
        update_data: Profile update data
        current_user: Authenticated user
        db: Database session

    Returns:
        UserResponse: Updated user profile

    Raises:
        HTTPException 400: If email already in use
    """
    # Update name if provided
    if update_data.name is not None:
        current_user.name = update_data.name

    # Update email if provided and check uniqueness
    if update_data.email is not None:
        if update_data.email != current_user.email:
            existing = db.query(User).filter(User.email == update_data.email).first()
            if existing:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Email already in use"
                )
            current_user.email = update_data.email

    try:
        db.commit()
        db.refresh(current_user)
        logger.info(f"Profile updated for user ID: {current_user.id}")
        return current_user

    except Exception as e:
        db.rollback()
        logger.error(f"Error updating profile: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update profile"
        )


@router.post("/change-password", status_code=status.HTTP_200_OK)
async def change_password(
    password_data: PasswordChange,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Dict[str, str]:
    """
    Change user password.

    Requires current password for verification before setting new password.

    Args:
        password_data: Current and new password
        current_user: Authenticated user
        db: Database session

    Returns:
        dict: Success message

    Raises:
        HTTPException 401: If current password is incorrect
    """
    # Verify current password
    if not verify_password(password_data.current_password, current_user.password_hash):
        logger.warning(f"Failed password change for user ID: {current_user.id}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Current password is incorrect"
        )

    # Hash and set new password
    current_user.password_hash = hash_password(password_data.new_password)

    try:
        db.commit()
        logger.info(f"Password changed for user ID: {current_user.id}")
        return {"message": "Password changed successfully"}

    except Exception as e:
        db.rollback()
        logger.error(f"Error changing password: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to change password"
        )


@router.delete("/account", status_code=status.HTTP_200_OK)
async def delete_account(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Dict[str, str]:
    """
    Delete user account permanently.

    This will delete the user and all associated data (resumes, payments)
    due to cascade delete configuration.

    Args:
        current_user: Authenticated user
        db: Database session

    Returns:
        dict: Success message

    Warning:
        This action is irreversible. All user data will be permanently deleted.
    """
    user_id = current_user.id
    user_email = current_user.email

    try:
        db.delete(current_user)
        db.commit()
        logger.info(f"Account deleted: {user_email} (ID: {user_id})")
        return {"message": "Account deleted successfully"}

    except Exception as e:
        db.rollback()
        logger.error(f"Error deleting account: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete account"
        )

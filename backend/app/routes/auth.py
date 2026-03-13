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
    PasswordChange,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    GoogleAuthRequest,
)
from app.utils.auth import hash_password, verify_password, create_access_token, create_password_reset_token, verify_password_reset_token
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

    # Handle Google-only users who try password login
    if user and user.password_hash is None:
        logger.warning(f"Google-only user tried password login: {credentials.email}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="This account uses Google Sign-In. Please log in with Google or set a password first.",
            headers={"WWW-Authenticate": "Bearer"},
        )

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


@router.post("/google", response_model=Token)
async def google_auth(
    google_data: GoogleAuthRequest,
    db: Session = Depends(get_db)
) -> Dict[str, str]:
    """
    Authenticate or register a user via Google OAuth.

    Handles three scenarios:
    1. New user: Creates account with Google, returns JWT
    2. Existing Google user: Logs them in, returns JWT
    3. Existing email/password user: Links Google account, returns JWT

    Args:
        google_data: Google credential and optional country
        db: Database session

    Returns:
        Token: JWT access token

    Raises:
        HTTPException 401: If Google credentials are invalid
    """
    if not settings.GOOGLE_CLIENT_ID:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Google Sign-In is not configured"
        )

    # Verify the Google ID token
    try:
        from google.oauth2 import id_token
        from google.auth.transport import requests as google_requests

        idinfo = id_token.verify_oauth2_token(
            google_data.credential,
            google_requests.Request(),
            settings.GOOGLE_CLIENT_ID
        )
    except ValueError as e:
        logger.warning(f"Invalid Google ID token: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Google credentials"
        )
    except Exception as e:
        logger.error(f"Google token verification error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Unable to verify Google credentials. Please try again later."
        )

    # Extract user info from verified token
    google_email = idinfo.get("email")
    google_name = idinfo.get("name", "")
    google_id = idinfo.get("sub")
    email_verified = idinfo.get("email_verified", False)

    if not google_email or not email_verified:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Google account email not verified"
        )

    # Look up user - first by google_id, then by email
    user = db.query(User).filter(User.google_id == google_id).first()

    if not user:
        # No user with this google_id - check by email
        user = db.query(User).filter(User.email == google_email).first()

        if user:
            # Existing email/password user - link Google account
            user.google_id = google_id
            user.auth_provider = "both"
            db.commit()
            db.refresh(user)
            logger.info(f"Google account linked to existing user: {user.email} (ID: {user.id})")
        else:
            # Brand new user - create account
            country = google_data.country or "US"
            region = "IN" if country.upper() == "IN" else "INTL"

            user = User(
                email=google_email,
                name=google_name,
                password_hash=None,
                google_id=google_id,
                auth_provider="google",
                subscription_type=SubscriptionType.FREE,
                region=region,
                resume_count=0,
                ats_analysis_count=0
            )

            try:
                db.add(user)
                db.commit()
                db.refresh(user)
                logger.info(f"New Google user registered: {user.email} (ID: {user.id})")

                # Send welcome email
                try:
                    email_service.send_welcome_email(
                        user_email=user.email,
                        user_name=user.name
                    )
                except Exception as email_error:
                    logger.error(f"Failed to send welcome email to {user.email}: {str(email_error)}")

            except Exception as e:
                db.rollback()
                logger.error(f"Error creating Google user: {str(e)}")
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Failed to create user account"
                )

    # Create and return JWT
    access_token = create_access_token(
        data={"sub": user.email, "user_id": user.id}
    )

    logger.info(f"Google auth successful: {user.email} (ID: {user.id})")

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
    # Google-only user setting password for the first time
    if current_user.password_hash is None:
        current_user.password_hash = hash_password(password_data.new_password)
        if current_user.auth_provider == "google":
            current_user.auth_provider = "both"
        try:
            db.commit()
            logger.info(f"Password set for Google user ID: {current_user.id}")
            return {"message": "Password set successfully"}
        except Exception as e:
            db.rollback()
            logger.error(f"Error setting password: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to set password"
            )

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


@router.post("/forgot-password", status_code=status.HTTP_200_OK)
async def forgot_password(
    request: ForgotPasswordRequest,
    db: Session = Depends(get_db)
) -> Dict[str, str]:
    """
    Request a password reset email.

    Sends a password reset link to the user's email if the account exists.
    Always returns success even if email doesn't exist (security best practice).

    Args:
        request: Forgot password request with email
        db: Database session

    Returns:
        dict: Success message

    Example:
        POST /api/auth/forgot-password
        {
            "email": "user@example.com"
        }
    """
    # Find user by email
    user = db.query(User).filter(User.email == request.email).first()

    # Always return success (don't reveal if email exists)
    if not user:
        logger.info(f"Password reset requested for non-existent email: {request.email}")
        return {"message": "If the email exists, a password reset link has been sent"}

    try:
        # Generate reset token
        reset_token = create_password_reset_token(user.email)

        # Send reset email
        email_service.send_password_reset_email(
            user_email=user.email,
            user_name=user.name,
            reset_token=reset_token
        )

        logger.info(f"Password reset email sent to: {user.email}")
        return {"message": "If the email exists, a password reset link has been sent"}

    except Exception as e:
        logger.error(f"Error sending password reset email: {str(e)}")
        # Still return success to not reveal if email exists
        return {"message": "If the email exists, a password reset link has been sent"}


@router.post("/reset-password", status_code=status.HTTP_200_OK)
async def reset_password(
    request: ResetPasswordRequest,
    db: Session = Depends(get_db)
) -> Dict[str, str]:
    """
    Reset password using a reset token.

    Args:
        request: Reset password request with token and new password
        db: Database session

    Returns:
        dict: Success message

    Raises:
        HTTPException 400: If token is invalid or expired
        HTTPException 422: If new password doesn't meet requirements

    Example:
        POST /api/auth/reset-password
        {
            "token": "eyJ0eXAiOiJKV1QiLC...",
            "new_password": "newpassword123"
        }
    """
    # Verify token and get email
    email = verify_password_reset_token(request.token)

    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token"
        )

    # Find user
    user = db.query(User).filter(User.email == email).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User not found"
        )

    # Password validation is handled by Pydantic schema
    try:
        # Hash and set new password
        user.password_hash = hash_password(request.new_password)

        # Update auth_provider for Google-only users
        if user.auth_provider == "google":
            user.auth_provider = "both"

        db.commit()

        logger.info(f"Password reset successful for user: {user.email}")
        return {"message": "Password reset successful"}

    except Exception as e:
        db.rollback()
        logger.error(f"Error resetting password: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to reset password"
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

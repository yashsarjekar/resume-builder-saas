"""
FastAPI dependencies for authentication and database access.

This module provides reusable dependencies for route handlers,
including authentication and database session management.
"""

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer
from fastapi.security.http import HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from typing import Optional

from app.database import get_db
from app.models.user import User
from app.schemas.user import TokenData
from app.utils.auth import verify_token
from app.config import get_settings

settings = get_settings()

# HTTP Bearer token scheme
security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """
    Get the current authenticated user from JWT token.

    This dependency validates the JWT token and returns the authenticated user.
    If the token is invalid or the user doesn't exist, raises HTTP 401.

    Args:
        credentials: HTTP Bearer credentials containing JWT token
        db: Database session

    Returns:
        User: Authenticated user object

    Raises:
        HTTPException: If token is invalid or user not found (401)

    Example:
        @app.get("/protected")
        def protected_route(current_user: User = Depends(get_current_user)):
            return {"user": current_user.email}
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    # Get token from credentials
    token = credentials.credentials

    # Verify and decode token
    payload = verify_token(token)
    if payload is None:
        raise credentials_exception

    # Extract email from token
    email: Optional[str] = payload.get("sub")
    user_id: Optional[int] = payload.get("user_id")

    if email is None:
        raise credentials_exception

    # Query user from database
    user = db.query(User).filter(User.email == email).first()

    if user is None:
        raise credentials_exception

    # Verify user_id matches if present in token
    if user_id is not None and user.id != user_id:
        raise credentials_exception

    return user


async def get_current_active_user(
    current_user: User = Depends(get_current_user)
) -> User:
    """
    Get the current active user with valid subscription.

    This dependency extends get_current_user to also check if the
    user's subscription is active.

    Args:
        current_user: Current authenticated user

    Returns:
        User: Active user object

    Raises:
        HTTPException: If user's subscription is inactive (403)

    Example:
        @app.get("/premium")
        def premium_route(user: User = Depends(get_current_active_user)):
            return {"message": "Premium content"}
    """
    if not current_user.is_subscription_active():
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your subscription has expired. Please renew to continue."
        )

    return current_user


def get_optional_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: Session = Depends(get_db)
) -> Optional[User]:
    """
    Get the current user if authenticated, None otherwise.

    This dependency is useful for routes that work differently for
    authenticated vs anonymous users, but don't require authentication.

    Args:
        credentials: Optional HTTP Bearer credentials
        db: Database session

    Returns:
        User: Authenticated user or None

    Example:
        @app.get("/content")
        def get_content(user: Optional[User] = Depends(get_optional_current_user)):
            if user:
                return {"content": "Premium content", "user": user.email}
            return {"content": "Free content"}
    """
    if credentials is None:
        return None

    try:
        token = credentials.credentials
        payload = verify_token(token)

        if payload is None:
            return None

        email = payload.get("sub")
        if email is None:
            return None

        user = db.query(User).filter(User.email == email).first()
        return user

    except Exception:
        return None


def check_subscription_limit(
    feature: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> User:
    """
    Check if user can use a feature based on subscription limits.

    Args:
        feature: Feature name ('resume' or 'ats_analysis')
        current_user: Current authenticated user
        db: Database session

    Returns:
        User: User if limit not exceeded

    Raises:
        HTTPException: If limit exceeded (403)

    Example:
        @app.post("/resume")
        def create_resume(
            user: User = Depends(lambda: check_subscription_limit("resume"))
        ):
            # Create resume logic
            pass
    """
    limit_config = settings.get_limit_config()

    if feature == "resume":
        if not current_user.can_create_resume(limit_config):
            limit = settings.get_resume_limit(current_user.subscription_type.value)
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Resume limit reached ({limit}). Upgrade your subscription."
            )

    elif feature == "ats_analysis":
        if not current_user.can_analyze_ats(limit_config):
            limit = settings.get_ats_limit(current_user.subscription_type.value)
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"ATS analysis limit reached ({limit}). Upgrade your subscription."
            )

    return current_user


# Re-export get_db for convenience
__all__ = [
    "get_db",
    "get_current_user",
    "get_current_active_user",
    "get_optional_current_user",
    "check_subscription_limit",
]

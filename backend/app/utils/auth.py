"""
Authentication utilities for JWT and password management.

This module provides functions for password hashing, verification,
and JWT token creation and validation.
"""

from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from jose import JWTError, jwt
import bcrypt
from app.config import get_settings

settings = get_settings()


def hash_password(password: str) -> str:
    """
    Hash a password using bcrypt.

    Args:
        password: Plain text password

    Returns:
        str: Hashed password

    Example:
        >>> hashed = hash_password("mypassword123")
        >>> verify_password("mypassword123", hashed)
        True
    """
    # Convert password to bytes
    password_bytes = password.encode('utf-8')
    # Generate salt and hash
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password_bytes, salt)
    # Return as string
    return hashed.decode('utf-8')


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a password against its hash.

    Args:
        plain_password: Plain text password to verify
        hashed_password: Hashed password to check against

    Returns:
        bool: True if password matches, False otherwise

    Example:
        >>> hashed = hash_password("mypassword123")
        >>> verify_password("mypassword123", hashed)
        True
        >>> verify_password("wrongpassword", hashed)
        False
    """
    # Convert to bytes
    password_bytes = plain_password.encode('utf-8')
    hashed_bytes = hashed_password.encode('utf-8')
    # Verify
    return bcrypt.checkpw(password_bytes, hashed_bytes)


def create_access_token(
    data: Dict[str, Any],
    expires_delta: Optional[timedelta] = None
) -> str:
    """
    Create a JWT access token.

    Args:
        data: Dictionary of data to encode in the token
        expires_delta: Optional custom expiration time

    Returns:
        str: Encoded JWT token

    Example:
        >>> token = create_access_token({"sub": "user@example.com", "user_id": 1})
        >>> # Token can be decoded with verify_token()
    """
    to_encode = data.copy()

    # Set expiration time
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )

    to_encode.update({"exp": expire})

    # Encode JWT
    encoded_jwt = jwt.encode(
        to_encode,
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM
    )

    return encoded_jwt


def verify_token(token: str) -> Optional[Dict[str, Any]]:
    """
    Verify and decode a JWT token.

    Args:
        token: JWT token string

    Returns:
        dict: Decoded token payload if valid, None otherwise

    Example:
        >>> token = create_access_token({"sub": "user@example.com"})
        >>> payload = verify_token(token)
        >>> payload["sub"]
        'user@example.com'
    """
    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM]
        )
        return payload
    except JWTError:
        return None


def get_token_data(token: str) -> Optional[Dict[str, Any]]:
    """
    Extract data from a JWT token without full verification.

    This is useful for debugging but should not be used for authentication.

    Args:
        token: JWT token string

    Returns:
        dict: Token payload or None if invalid

    Warning:
        This does NOT verify the token signature. Use verify_token() for
        authentication purposes.
    """
    try:
        # Decode without verification (for debugging only)
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM],
            options={"verify_signature": False}
        )
        return payload
    except JWTError:
        return None


def create_password_reset_token(email: str) -> str:
    """
    Create a password reset token.

    Args:
        email: User email address

    Returns:
        str: Password reset token (expires in 1 hour)
    """
    expires_delta = timedelta(hours=1)
    return create_access_token(
        data={"sub": email, "type": "password_reset"},
        expires_delta=expires_delta
    )


def verify_password_reset_token(token: str) -> Optional[str]:
    """
    Verify a password reset token and return the email.

    Args:
        token: Password reset token

    Returns:
        str: Email address if token is valid, None otherwise
    """
    payload = verify_token(token)

    if payload is None:
        return None

    # Verify token type
    if payload.get("type") != "password_reset":
        return None

    return payload.get("sub")

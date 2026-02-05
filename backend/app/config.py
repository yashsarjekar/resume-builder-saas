"""
Application configuration management.

This module uses Pydantic Settings to manage environment variables
and application configuration with validation and type safety.
"""

from pydantic_settings import BaseSettings
from functools import lru_cache
from typing import Optional


class Settings(BaseSettings):
    """
    Application settings loaded from environment variables.

    All settings are loaded from .env file or environment variables.
    Validation is performed automatically by Pydantic.
    """

    # Database Configuration
    DATABASE_URL: str

    # JWT Configuration
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 10080  # 7 days

    # Claude AI Configuration
    ANTHROPIC_API_KEY: str

    # Razorpay Configuration
    RAZORPAY_KEY_ID: str
    RAZORPAY_KEY_SECRET: str
    RAZORPAY_WEBHOOK_SECRET: str

    # Application Settings
    ENVIRONMENT: str = "development"
    FRONTEND_URL: str = "http://localhost:3000"

    # Redis Configuration
    REDIS_URL: str = "redis://localhost:6379/0"
    REDIS_MAX_CONNECTIONS: int = 50
    REDIS_SOCKET_TIMEOUT: int = 5
    REDIS_SOCKET_CONNECT_TIMEOUT: int = 5
    REDIS_RETRY_ON_TIMEOUT: bool = True
    REDIS_HEALTH_CHECK_INTERVAL: int = 30

    # Subscription Limits
    FREE_RESUME_LIMIT: int = 1
    FREE_ATS_ANALYSIS_LIMIT: int = 2
    STARTER_RESUME_LIMIT: int = 5
    STARTER_ATS_ANALYSIS_LIMIT: int = 10
    PRO_RESUME_LIMIT: int = 999
    PRO_ATS_ANALYSIS_LIMIT: int = 999

    # Rate Limiting
    RATE_LIMIT_ENABLED: bool = True
    RATE_LIMIT_PER_MINUTE: int = 60  # Global default (user-based)
    RATE_LIMIT_PER_HOUR: int = 1000

    # Authentication rate limits (per IP)
    AUTH_RATE_LIMIT_PER_MINUTE: int = 5
    AUTH_RATE_LIMIT_PER_HOUR: int = 20

    # AI endpoint rate limits (per user)
    AI_RATE_LIMIT_PER_MINUTE: int = 10
    AI_RATE_LIMIT_PER_HOUR: int = 50

    # Public endpoint rate limits (per IP)
    PUBLIC_RATE_LIMIT_PER_MINUTE: int = 30

    # Cache Configuration
    CACHE_ENABLED: bool = True
    CACHE_DEFAULT_TTL: int = 300  # 5 minutes
    CACHE_PRICING_TTL: int = 3600  # 1 hour
    CACHE_SUBSCRIPTION_TTL: int = 300  # 5 minutes
    CACHE_RESUME_TTL: int = 600  # 10 minutes
    CACHE_AI_RESPONSE_TTL: int = 3600  # 1 hour

    # AI Assist Quotas (daily limits)
    FREE_AI_ASSIST_LIMIT: int = 10
    STARTER_AI_ASSIST_LIMIT: int = 50
    PRO_AI_ASSIST_LIMIT: int = 999

    # Email Configuration (SMTP)
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    SMTP_FROM_EMAIL: str = "noreply@resumebuilder.com"
    SMTP_FROM_NAME: str = "Resume Builder"
    EMAIL_ENABLED: bool = True

    class Config:
        """Pydantic configuration."""
        env_file = ".env"
        case_sensitive = True

    def is_production(self) -> bool:
        """
        Check if application is running in production.

        Returns:
            bool: True if ENVIRONMENT is 'production'
        """
        return self.ENVIRONMENT.lower() == "production"

    def is_development(self) -> bool:
        """
        Check if application is running in development.

        Returns:
            bool: True if ENVIRONMENT is 'development'
        """
        return self.ENVIRONMENT.lower() == "development"

    def get_resume_limit(self, subscription_type: str) -> int:
        """
        Get resume creation limit for a subscription type.

        Args:
            subscription_type: Subscription type (free, starter, pro)

        Returns:
            int: Resume creation limit
        """
        limits = {
            "free": self.FREE_RESUME_LIMIT,
            "starter": self.STARTER_RESUME_LIMIT,
            "pro": self.PRO_RESUME_LIMIT,
        }
        return limits.get(subscription_type.lower(), self.FREE_RESUME_LIMIT)

    def get_ats_limit(self, subscription_type: str) -> int:
        """
        Get ATS analysis limit for a subscription type.

        Args:
            subscription_type: Subscription type (free, starter, pro)

        Returns:
            int: ATS analysis limit
        """
        limits = {
            "free": self.FREE_ATS_ANALYSIS_LIMIT,
            "starter": self.STARTER_ATS_ANALYSIS_LIMIT,
            "pro": self.PRO_ATS_ANALYSIS_LIMIT,
        }
        return limits.get(subscription_type.lower(), self.FREE_ATS_ANALYSIS_LIMIT)

    def get_ai_assist_limit(self, subscription_type: str) -> int:
        """
        Get AI assist daily limit for a subscription type.

        Args:
            subscription_type: Subscription type (free, starter, pro)

        Returns:
            int: AI assist daily limit
        """
        limits = {
            "free": self.FREE_AI_ASSIST_LIMIT,
            "starter": self.STARTER_AI_ASSIST_LIMIT,
            "pro": self.PRO_AI_ASSIST_LIMIT,
        }
        return limits.get(subscription_type.lower(), self.FREE_AI_ASSIST_LIMIT)

    def get_limit_config(self) -> dict:
        """
        Get all subscription limits as a dictionary.

        Returns:
            dict: Dictionary with all subscription limits
        """
        return {
            "FREE_RESUME_LIMIT": self.FREE_RESUME_LIMIT,
            "FREE_ATS_ANALYSIS_LIMIT": self.FREE_ATS_ANALYSIS_LIMIT,
            "STARTER_RESUME_LIMIT": self.STARTER_RESUME_LIMIT,
            "STARTER_ATS_ANALYSIS_LIMIT": self.STARTER_ATS_ANALYSIS_LIMIT,
            "PRO_RESUME_LIMIT": self.PRO_RESUME_LIMIT,
            "PRO_ATS_ANALYSIS_LIMIT": self.PRO_ATS_ANALYSIS_LIMIT,
        }


@lru_cache()
def get_settings() -> Settings:
    """
    Get cached application settings.

    Using lru_cache ensures settings are loaded only once
    and reused across the application.

    Returns:
        Settings: Application settings instance
    """
    return Settings()

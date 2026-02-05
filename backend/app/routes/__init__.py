"""
API routes package.

This module exports all API routers for inclusion in the main application.
"""

from .auth import router as auth_router
from .resume import router as resume_router
from .ai import router as ai_router
from .payment import router as payment_router

__all__ = [
    "auth_router",
    "resume_router",
    "ai_router",
    "payment_router",
]

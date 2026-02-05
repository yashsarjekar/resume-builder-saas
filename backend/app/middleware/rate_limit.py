"""
Rate limiting middleware for FastAPI.

This middleware implements per-endpoint rate limiting using Redis
with support for both IP-based and user-based rate limits.
"""

import logging
import time
from typing import Tuple, Optional
from starlette.middleware.base import BaseHTTPMiddleware
from fastapi import Request
from fastapi.responses import JSONResponse

from app.services.redis_service import RedisService
from app.config import Settings
from app.utils.auth import verify_token

logger = logging.getLogger(__name__)


class RateLimitMiddleware(BaseHTTPMiddleware):
    """FastAPI middleware for automatic rate limiting."""

    def __init__(self, app, redis_service: RedisService, settings: Settings):
        """
        Initialize rate limiting middleware.

        Args:
            app: FastAPI application
            redis_service: Redis service instance
            settings: Application settings
        """
        super().__init__(app)
        self.redis = redis_service
        self.settings = settings

    async def dispatch(self, request: Request, call_next):
        """
        Process request with rate limiting.

        Args:
            request: FastAPI request
            call_next: Next middleware/route handler

        Returns:
            Response with rate limit headers
        """
        # Skip rate limiting for certain paths
        if request.url.path in ["/health", "/docs", "/openapi.json", "/redoc"]:
            return await call_next(request)

        # Skip if rate limiting is disabled
        if not self.settings.RATE_LIMIT_ENABLED:
            return await call_next(request)

        # Determine rate limit parameters
        limit_key, limit, window = await self._get_rate_limit_params(request)

        # Check rate limit
        is_allowed, remaining = await self.redis.check_rate_limit(
            limit_key, limit, window
        )

        if not is_allowed:
            # Rate limit exceeded
            logger.warning(
                f"Rate limit exceeded: {limit_key} on {request.url.path}",
                extra={
                    "key": limit_key,
                    "endpoint": request.url.path,
                    "method": request.method,
                    "limit": limit,
                    "window": window,
                },
            )

            return JSONResponse(
                status_code=429,
                headers={
                    "Retry-After": str(window),
                    "X-RateLimit-Limit": str(limit),
                    "X-RateLimit-Remaining": "0",
                    "X-RateLimit-Reset": str(int(time.time() + window)),
                },
                content={
                    "detail": f"Rate limit exceeded. Try again in {window} seconds."
                },
            )

        # Add rate limit headers to successful response
        response = await call_next(request)
        response.headers["X-RateLimit-Limit"] = str(limit)
        response.headers["X-RateLimit-Remaining"] = str(remaining)

        return response

    async def _get_rate_limit_params(
        self, request: Request
    ) -> Tuple[str, int, int]:
        """
        Determine rate limit key and limits based on endpoint and user.

        Args:
            request: FastAPI request

        Returns:
            Tuple[str, int, int]: (limit_key, limit, window_seconds)
        """
        path = request.url.path
        user_id = await self._extract_user_id(request)

        # Authentication endpoints - IP-based (5 req/min)
        if path.startswith("/api/auth/"):
            client_ip = self._get_client_ip(request)
            key = f"rate_limit:auth:{client_ip}"
            return key, self.settings.AUTH_RATE_LIMIT_PER_MINUTE, 60

        # AI endpoints - User-based (10 req/min)
        if path.startswith("/api/ai/"):
            if user_id:
                key = f"rate_limit:ai:user:{user_id}"
                return key, self.settings.AI_RATE_LIMIT_PER_MINUTE, 60
            else:
                # Shouldn't happen (protected by auth), but fallback to IP
                client_ip = self._get_client_ip(request)
                key = f"rate_limit:ai:ip:{client_ip}"
                return key, 5, 60

        # Authenticated endpoints - User-based (60 req/min)
        if user_id:
            key = f"rate_limit:user:{user_id}"
            return key, self.settings.RATE_LIMIT_PER_MINUTE, 60

        # Public endpoints - IP-based (30 req/min)
        client_ip = self._get_client_ip(request)
        key = f"rate_limit:public:{client_ip}"
        return key, self.settings.PUBLIC_RATE_LIMIT_PER_MINUTE, 60

    def _get_client_ip(self, request: Request) -> str:
        """
        Extract client IP address from request.

        Handles X-Forwarded-For header for proxies.

        Args:
            request: FastAPI request

        Returns:
            str: Client IP address
        """
        # Check X-Forwarded-For header (set by proxies/load balancers)
        forwarded_for = request.headers.get("X-Forwarded-For")
        if forwarded_for:
            # Take first IP (original client)
            return forwarded_for.split(",")[0].strip()

        # Fall back to direct connection
        return request.client.host

    async def _extract_user_id(self, request: Request) -> Optional[int]:
        """
        Extract user ID from JWT token if present.

        Args:
            request: FastAPI request

        Returns:
            Optional[int]: User ID or None if not authenticated
        """
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            return None

        try:
            token = auth_header.split(" ")[1]
            payload = verify_token(token)
            return payload.get("user_id")
        except Exception:
            # Invalid token, return None
            return None

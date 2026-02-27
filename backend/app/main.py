"""
FastAPI application entry point.

This is the main application file that initializes FastAPI,
configures middleware, and includes all API routers.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging
from contextlib import asynccontextmanager

from app.config import get_settings
from app.routes import auth_router, resume_router, ai_router, payment_router
from app.services.redis_service import RedisService
from app.middleware.rate_limit import RateLimitMiddleware
import app.services.redis_service as redis_service_module

# Get settings
settings = get_settings()

# Configure logging
logging.basicConfig(
    level=logging.INFO if settings.is_production() else logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan manager.

    Handles startup and shutdown events.
    """
    # Startup
    logger.info("Starting Resume Builder API...")
    logger.info(f"Environment: {settings.ENVIRONMENT}")

    # Initialize Redis
    redis_service = RedisService(settings)
    redis_connected = await redis_service.connect()

    if not redis_connected:
        logger.warning("⚠️  Redis unavailable - rate limiting and caching degraded")
    else:
        logger.info(f"✅ Redis connected at {settings.REDIS_URL}")

    # Store in module for global access
    redis_service_module.redis_service = redis_service

    yield

    # Shutdown
    logger.info("Shutting down Resume Builder API...")
    if redis_service:
        await redis_service.disconnect()


# Initialize FastAPI application
app = FastAPI(
    title="Resume Builder API",
    description="AI-powered ATS-optimized resume builder for Indian job seekers",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs" if not settings.is_production() else None,
    redoc_url="/redoc" if not settings.is_production() else None,
)

# Configure CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL] if settings.is_production() else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add rate limiting middleware (after CORS)
if settings.RATE_LIMIT_ENABLED:
    # Note: Middleware is added after lifespan, so redis_service will be available
    @app.middleware("http")
    async def rate_limit_middleware(request, call_next):
        from app.services.redis_service import get_redis_service
        redis = get_redis_service()
        middleware = RateLimitMiddleware(app, redis, settings)
        return await middleware.dispatch(request, call_next)

# Include routers
app.include_router(auth_router, prefix="/api/auth", tags=["Authentication"])
app.include_router(resume_router, prefix="/api/resume", tags=["Resume"])
app.include_router(ai_router, prefix="/api/ai", tags=["AI Features"])
app.include_router(payment_router, prefix="/api/payment", tags=["Payment"])


@app.get("/", tags=["Root"])
async def root():
    """
    Root endpoint.

    Returns:
        dict: API information
    """
    return {
        "message": "Resume Builder API",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs",
    }


@app.get("/health", tags=["Health"])
async def health_check():
    """
    Health check endpoint with Redis status.

    Returns:
        dict: Health status including Redis connection
    """
    try:
        from app.services.redis_service import get_redis_service
        redis = get_redis_service()
        redis_status = "healthy" if redis.is_connected else "degraded"
    except RuntimeError:
        redis_status = "not_initialized"

    # Add template debugging
    try:
        from app.services.pdf_service import PDFService
        available_templates = list(PDFService.TEMPLATES.keys())
    except Exception as e:
        available_templates = [f"Error loading templates: {str(e)}"]

    return {
        "status": "healthy",
        "environment": settings.ENVIRONMENT,
        "redis": redis_status,
        "cache_enabled": settings.CACHE_ENABLED,
        "rate_limit_enabled": settings.RATE_LIMIT_ENABLED,
        "available_templates": available_templates,
    }


# Error handlers will be added here in later phases

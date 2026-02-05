"""
Caching utilities and decorators.

This module provides reusable cache decorators and helper functions
for easy caching with Redis.
"""

import hashlib
import json
import logging
from functools import wraps
from typing import Optional, Callable, Any

from app.services.redis_service import get_redis_service
from app.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()


def cache_result(ttl: Optional[int] = None, key_prefix: Optional[str] = None):
    """
    Decorator to cache function results in Redis.

    Args:
        ttl: Time to live in seconds (uses CACHE_DEFAULT_TTL if not specified)
        key_prefix: Prefix for cache key (uses function name if not specified)

    Usage:
        @cache_result(ttl=3600, key_prefix="pricing")
        async def get_pricing():
            # expensive operation
            return pricing_data

    Returns:
        Decorated function with caching
    """

    def decorator(func: Callable):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Get Redis service
            try:
                redis = get_redis_service()
            except RuntimeError:
                # Redis not initialized, execute function without caching
                logger.warning(f"Redis not initialized, bypassing cache for {func.__name__}")
                return await func(*args, **kwargs)

            # Skip cache if disabled
            if not settings.CACHE_ENABLED:
                return await func(*args, **kwargs)

            # Generate cache key
            cache_key = _generate_cache_key(func, key_prefix, args, kwargs)

            # Try to get from cache
            try:
                cached = await redis.get(cache_key)
                if cached is not None:
                    logger.debug(f"Cache hit: {cache_key}")
                    return cached
            except Exception as e:
                logger.error(f"Cache get failed: {e}")

            # Execute function (cache miss)
            logger.debug(f"Cache miss: {cache_key}")
            result = await func(*args, **kwargs)

            # Store in cache
            try:
                actual_ttl = ttl or settings.CACHE_DEFAULT_TTL
                await redis.set(cache_key, result, actual_ttl)
                logger.debug(f"Cached result for {cache_key} with TTL {actual_ttl}s")
            except Exception as e:
                logger.error(f"Cache set failed: {e}")

            return result

        return wrapper

    return decorator


def _generate_cache_key(
    func: Callable, key_prefix: Optional[str], args: tuple, kwargs: dict
) -> str:
    """
    Generate cache key from function and arguments.

    Args:
        func: Function being cached
        key_prefix: Optional prefix
        args: Positional arguments
        kwargs: Keyword arguments

    Returns:
        str: Cache key
    """
    prefix = key_prefix or func.__name__

    # Create a stable representation of arguments
    # Filter out database session and other non-cacheable arguments
    filtered_kwargs = {
        k: v
        for k, v in kwargs.items()
        if k not in ["db", "current_user", "redis"]
    }

    # Create argument hash
    arg_str = json.dumps(
        {"args": [str(a) for a in args], "kwargs": filtered_kwargs}, sort_keys=True
    )
    arg_hash = hashlib.md5(arg_str.encode()).hexdigest()

    return f"cache:{prefix}:{arg_hash}"


# Cache invalidation helpers

async def invalidate_user_cache(user_id: int):
    """
    Invalidate all cache entries for a user.

    Args:
        user_id: User ID
    """
    try:
        redis = get_redis_service()
        pattern = f"cache:user:{user_id}:*"
        await redis.delete_pattern(pattern)
        logger.info(f"Invalidated cache for user {user_id}")
    except Exception as e:
        logger.error(f"Failed to invalidate user cache: {e}")


async def invalidate_resume_cache(resume_id: int, user_id: Optional[int] = None):
    """
    Invalidate cache for a specific resume.

    Args:
        resume_id: Resume ID
        user_id: Optional user ID to also invalidate user's resume list
    """
    try:
        redis = get_redis_service()

        # Invalidate resume-specific cache
        await redis.delete(f"cache:resume:{resume_id}")

        # Invalidate user's resume list if provided
        if user_id:
            await redis.delete_pattern(f"cache:user:{user_id}:resumes:*")
            await redis.delete(f"cache:resume_stats:user:{user_id}")

        logger.info(f"Invalidated cache for resume {resume_id}")
    except Exception as e:
        logger.error(f"Failed to invalidate resume cache: {e}")


async def invalidate_pricing_cache():
    """Invalidate pricing cache (typically on deployment or manual trigger)."""
    try:
        redis = get_redis_service()
        await redis.delete("cache:pricing")
        logger.info("Invalidated pricing cache")
    except Exception as e:
        logger.error(f"Failed to invalidate pricing cache: {e}")


async def invalidate_subscription_cache(user_id: int):
    """
    Invalidate subscription cache for a user.

    Args:
        user_id: User ID
    """
    try:
        redis = get_redis_service()
        await redis.delete(f"cache:user:{user_id}:subscription")
        logger.info(f"Invalidated subscription cache for user {user_id}")
    except Exception as e:
        logger.error(f"Failed to invalidate subscription cache: {e}")


async def invalidate_all_caches():
    """
    Invalidate all application caches.

    Use with caution - typically only for emergency cache clearing.
    """
    try:
        redis = get_redis_service()
        await redis.delete_pattern("cache:*")
        logger.warning("Invalidated ALL application caches")
    except Exception as e:
        logger.error(f"Failed to invalidate all caches: {e}")


# Cache warming helpers

async def warm_pricing_cache():
    """
    Pre-populate pricing cache.

    This can be called during application startup to ensure
    pricing data is immediately available.
    """
    try:
        from app.services.razorpay_service import razorpay_service

        pricing = razorpay_service.get_pricing_info()
        redis = get_redis_service()
        await redis.set("cache:pricing", pricing, settings.CACHE_PRICING_TTL)
        logger.info("Pricing cache warmed")
    except Exception as e:
        logger.error(f"Failed to warm pricing cache: {e}")

"""
Redis service for caching and rate limiting.

This module provides a centralized Redis client with connection pooling,
graceful degradation, and support for both caching and rate limiting operations.
"""

import json
import time
import asyncio
import logging
from typing import Optional, Any, Tuple, Dict
import redis.asyncio as aioredis
from redis.exceptions import ConnectionError as RedisConnectionError

from app.config import Settings

logger = logging.getLogger(__name__)


class RedisService:
    """Redis client wrapper with connection pooling and graceful degradation."""

    def __init__(self, settings: Settings):
        """
        Initialize Redis service.

        Args:
            settings: Application settings
        """
        self.settings = settings
        self.redis: Optional[aioredis.Redis] = None
        self.is_connected = False
        self._fallback_cache: Dict[str, Any] = {}  # In-memory fallback
        self._reconnect_task: Optional[asyncio.Task] = None

    async def connect(self) -> bool:
        """
        Initialize Redis connection with error handling.

        Returns:
            bool: True if connected successfully, False otherwise
        """
        try:
            self.redis = await aioredis.from_url(
                self.settings.REDIS_URL,
                max_connections=self.settings.REDIS_MAX_CONNECTIONS,
                socket_timeout=self.settings.REDIS_SOCKET_TIMEOUT,
                socket_connect_timeout=self.settings.REDIS_SOCKET_CONNECT_TIMEOUT,
                retry_on_timeout=self.settings.REDIS_RETRY_ON_TIMEOUT,
                decode_responses=True,
            )
            await self.redis.ping()
            self.is_connected = True
            logger.info("✅ Redis connected successfully")
            return True
        except Exception as e:
            logger.error(f"❌ Redis connection failed: {e}")
            logger.warning("⚠️  Falling back to in-memory cache")
            self.is_connected = False
            return False

    async def disconnect(self):
        """Close Redis connection."""
        if self.redis:
            await self.redis.close()
            self.is_connected = False
            logger.info("Redis connection closed")

    async def health_check(self) -> bool:
        """
        Check Redis connection health.

        Returns:
            bool: True if Redis is healthy, False otherwise
        """
        if not self.is_connected:
            return False

        try:
            await self.redis.ping()
            return True
        except Exception as e:
            logger.warning(f"Redis health check failed: {e}")
            self.is_connected = False
            if not self._reconnect_task:
                self._reconnect_task = asyncio.create_task(self._reconnect())
            return False

    async def _reconnect(self):
        """Background task to reconnect to Redis."""
        for attempt in range(1, 11):
            wait_time = min(30 * attempt, 300)  # Max 5 minutes
            await asyncio.sleep(wait_time)

            try:
                await self.connect()
                if self.is_connected:
                    logger.info(f"✅ Redis reconnected after {attempt} attempts")
                    self._reconnect_task = None
                    return
            except Exception as e:
                logger.warning(f"Reconnect attempt {attempt} failed: {e}")

        logger.error("Failed to reconnect to Redis after 10 attempts")
        self._reconnect_task = None

    # =====================
    # Rate Limiting Methods
    # =====================

    async def check_rate_limit(
        self, key: str, limit: int, window: int
    ) -> Tuple[bool, int]:
        """
        Check if request is within rate limit using sliding window algorithm.

        Args:
            key: Rate limit key (e.g., "rate_limit:user:123")
            limit: Maximum requests allowed in window
            window: Time window in seconds

        Returns:
            Tuple[bool, int]: (is_allowed, remaining_requests)
        """
        if not self.is_connected:
            # Fallback: permissive rate limiting
            return True, limit

        try:
            now = time.time()
            window_start = now - window

            # Use pipeline for atomic operations
            pipe = self.redis.pipeline()

            # Remove old requests outside window
            pipe.zremrangebyscore(key, 0, window_start)

            # Count current requests in window
            pipe.zcard(key)

            # Add current request timestamp
            pipe.zadd(key, {str(now): now})

            # Set expiry on key
            pipe.expire(key, window)

            results = await pipe.execute()
            current_count = results[1]

            if current_count < limit:
                # Request allowed
                return True, limit - current_count - 1
            else:
                # Request denied - remove the request we just added
                await self.redis.zrem(key, str(now))
                return False, 0

        except Exception as e:
            logger.error(f"Rate limit check failed: {e}")
            # On error, allow request (fail open)
            return True, limit

    async def get_rate_limit_info(self, key: str, window: int) -> dict:
        """
        Get rate limit information for a key.

        Args:
            key: Rate limit key
            window: Time window in seconds

        Returns:
            dict: Rate limit information
        """
        if not self.is_connected:
            return {"current": 0, "window_start": time.time()}

        try:
            now = time.time()
            window_start = now - window

            # Remove old requests
            await self.redis.zremrangebyscore(key, 0, window_start)

            # Get current count
            current = await self.redis.zcard(key)

            return {"current": current, "window_start": window_start}

        except Exception:
            return {"current": 0, "window_start": time.time()}

    # ===============
    # Cache Methods
    # ===============

    async def get(self, key: str) -> Optional[Any]:
        """
        Get value from Redis cache with fallback to in-memory.

        Args:
            key: Cache key

        Returns:
            Optional[Any]: Cached value or None
        """
        if not self.is_connected:
            return self._fallback_cache.get(key)

        try:
            value = await asyncio.wait_for(
                self.redis.get(key), timeout=self.settings.REDIS_SOCKET_TIMEOUT
            )
            if value:
                return json.loads(value)
            return None
        except asyncio.TimeoutError:
            logger.warning(f"Redis timeout on GET {key}")
            return self._fallback_cache.get(key)
        except RedisConnectionError:
            logger.error("Redis connection lost, using fallback")
            self.is_connected = False
            if not self._reconnect_task:
                self._reconnect_task = asyncio.create_task(self._reconnect())
            return self._fallback_cache.get(key)
        except Exception as e:
            logger.error(f"Cache GET failed for {key}: {e}")
            return None

    async def set(self, key: str, value: Any, ttl: int):
        """
        Set value in Redis cache with TTL.

        Args:
            key: Cache key
            value: Value to cache (will be JSON serialized)
            ttl: Time to live in seconds
        """
        # Always update fallback cache
        self._fallback_cache[key] = value

        if not self.is_connected:
            return

        try:
            serialized = json.dumps(value)
            await self.redis.setex(key, ttl, serialized)
        except Exception as e:
            logger.error(f"Cache SET failed for {key}: {e}")

    async def delete(self, key: str):
        """
        Delete cache entry.

        Args:
            key: Cache key to delete
        """
        # Remove from fallback cache
        self._fallback_cache.pop(key, None)

        if not self.is_connected:
            return

        try:
            await self.redis.delete(key)
        except Exception as e:
            logger.error(f"Cache DELETE failed for {key}: {e}")

    async def delete_pattern(self, pattern: str):
        """
        Delete all keys matching pattern.

        Args:
            pattern: Key pattern (e.g., "cache:user:123:*")
        """
        if not self.is_connected:
            # Clear matching keys from fallback cache
            keys_to_delete = [k for k in self._fallback_cache.keys() if self._match_pattern(k, pattern)]
            for key in keys_to_delete:
                del self._fallback_cache[key]
            return

        try:
            keys = []
            async for key in self.redis.scan_iter(match=pattern):
                keys.append(key)

            if keys:
                await self.redis.delete(*keys)
                logger.info(f"Deleted {len(keys)} keys matching {pattern}")
        except Exception as e:
            logger.error(f"Cache DELETE_PATTERN failed for {pattern}: {e}")

    def _match_pattern(self, key: str, pattern: str) -> bool:
        """Simple pattern matching for fallback cache."""
        import re
        regex_pattern = pattern.replace("*", ".*").replace("?", ".")
        return bool(re.match(f"^{regex_pattern}$", key))

    # =============
    # Quota Methods
    # =============

    async def increment_quota(self, key: str, ttl: int) -> int:
        """
        Increment quota counter with TTL.

        Args:
            key: Quota key (e.g., "quota:ai_assist:user:123:2026-02-05")
            ttl: Time to live in seconds

        Returns:
            int: Current count after increment
        """
        if not self.is_connected:
            # Fallback: return 1 (first request)
            return 1

        try:
            # Increment counter
            count = await self.redis.incr(key)

            # Set TTL if this is the first increment
            if count == 1:
                await self.redis.expire(key, ttl)

            return count
        except Exception as e:
            logger.error(f"Quota increment failed for {key}: {e}")
            return 1

    async def get_quota(self, key: str) -> int:
        """
        Get current quota count.

        Args:
            key: Quota key

        Returns:
            int: Current count
        """
        if not self.is_connected:
            return 0

        try:
            count = await self.redis.get(key)
            return int(count) if count else 0
        except Exception as e:
            logger.error(f"Quota get failed for {key}: {e}")
            return 0

    # =================
    # Monitoring Methods
    # =================

    async def get_cache_stats(self) -> dict:
        """
        Get cache statistics.

        Returns:
            dict: Cache statistics
        """
        if not self.is_connected:
            return {
                "connected": False,
                "fallback_cache_size": len(self._fallback_cache),
            }

        try:
            info = await self.redis.info("stats")
            memory = await self.redis.info("memory")

            return {
                "connected": True,
                "total_connections": info.get("total_connections_received", 0),
                "used_memory": memory.get("used_memory_human", "N/A"),
                "connected_clients": info.get("connected_clients", 0),
                "fallback_cache_size": len(self._fallback_cache),
            }
        except Exception as e:
            logger.error(f"Failed to get cache stats: {e}")
            return {"connected": False, "error": str(e)}


# Global instance placeholder
redis_service: Optional[RedisService] = None


def get_redis_service() -> RedisService:
    """
    Get Redis service instance.

    Returns:
        RedisService: Global Redis service instance

    Raises:
        RuntimeError: If Redis service not initialized
    """
    global redis_service
    if redis_service is None:
        raise RuntimeError("Redis service not initialized")
    return redis_service

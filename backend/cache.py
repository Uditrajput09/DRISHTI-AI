"""
backend/cache.py
Redis caching layer with automatic fallback for DRISHTI-AI.
Caches high-frequency risk queries, spatial polygons, and forecast aggregates.
If Redis is offline or not installed, all operations gracefully degrade to cache-miss.
"""

from typing import Any, Optional
import json
import logging
from backend.config import settings

logger = logging.getLogger("drishti.cache")

_redis_client = None
_redis_checked = False
_redis_available = False


def get_redis_client():
    """Obtain or initialize the singleton Redis client."""
    global _redis_client, _redis_checked, _redis_available

    if _redis_checked:
        return _redis_client if _redis_available else None

    _redis_checked = True
    try:
        import redis
        redis_url = getattr(settings, "REDIS_URL", "redis://localhost:6379/0")
        client = redis.from_url(
            redis_url,
            socket_timeout=1.0,
            socket_connect_timeout=1.0,
            decode_responses=True
        )
        # Test connection ping
        client.ping()
        _redis_client = client
        _redis_available = True
        logger.info(f"[Cache] Connected to Redis at {redis_url}")
        print(f"[Cache] Redis connected successfully ({redis_url})")
        return _redis_client
    except Exception as exc:
        _redis_client = None
        _redis_available = False
        logger.info(f"[Cache] Redis unavailable ({exc}). Using direct database fallback.")
        return None


def cache_get(key: str) -> Optional[Any]:
    """Retrieve a JSON-decoded cached item by key."""
    client = get_redis_client()
    if client is None:
        return None
    try:
        raw = client.get(key)
        if raw is not None:
            return json.loads(raw)
        return None
    except Exception as exc:
        logger.debug(f"[Cache] Read error for {key}: {exc}")
        return None


def cache_set(key: str, value: Any, ttl_seconds: int = 60) -> bool:
    """Store a JSON-serializable item in cache with TTL."""
    client = get_redis_client()
    if client is None:
        return False
    try:
        serialized = json.dumps(value, default=str)
        client.setex(key, ttl_seconds, serialized)
        return True
    except Exception as exc:
        logger.debug(f"[Cache] Write error for {key}: {exc}")
        return False


def cache_invalidate_prefix(prefix: str) -> int:
    """Invalidate all keys matching prefix*."""
    client = get_redis_client()
    if client is None:
        return 0
    try:
        keys = client.keys(f"{prefix}*")
        if keys:
            return client.delete(*keys)
        return 0
    except Exception as exc:
        logger.debug(f"[Cache] Invalidation error for {prefix}: {exc}")
        return 0


def get_cache_status() -> dict:
    """Return status dictionary for /api/health."""
    client = get_redis_client()
    return {
        "enabled": _redis_available,
        "type": "redis" if _redis_available else "in_memory_pass_through",
        "status": "connected" if _redis_available else "offline_fallback"
    }

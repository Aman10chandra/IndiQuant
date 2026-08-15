"""
In-memory TTL cache with different TTLs per data type.
Zero-dependency — uses cachetools. Upgrade to Redis for production.
"""
from cachetools import TTLCache
import functools
import hashlib
import json

# Different TTLs for different data volatility
_caches = {
    "quote":        TTLCache(maxsize=200, ttl=30),       # 30 seconds — live prices
    "history":      TTLCache(maxsize=100, ttl=300),      # 5 minutes
    "fundamentals": TTLCache(maxsize=100, ttl=86400),    # 24 hours
    "news":         TTLCache(maxsize=100, ttl=1800),     # 30 minutes
    "indicator":    TTLCache(maxsize=200, ttl=300),      # 5 minutes
}


def _make_key(*args, **kwargs) -> str:
    raw = json.dumps({"args": args, "kwargs": kwargs}, sort_keys=True, default=str)
    return hashlib.md5(raw.encode()).hexdigest()


def cached(cache_name: str):
    """Decorator: cache the return value of a function in the named TTL cache (supports sync and async)."""
    def decorator(func):
        import asyncio
        if asyncio.iscoroutinefunction(func):
            @functools.wraps(func)
            async def async_wrapper(*args, **kwargs):
                cache = _caches[cache_name]
                key = _make_key(func.__name__, *args, **kwargs)
                if key in cache:
                    return cache[key]
                result = await func(*args, **kwargs)
                cache[key] = result
                return result
            return async_wrapper
        else:
            @functools.wraps(func)
            def sync_wrapper(*args, **kwargs):
                cache = _caches[cache_name]
                key = _make_key(func.__name__, *args, **kwargs)
                if key in cache:
                    return cache[key]
                result = func(*args, **kwargs)
                cache[key] = result
                return result
            return sync_wrapper
    return decorator


def invalidate(cache_name: str, *args, **kwargs):
    """Manually invalidate a specific cache entry."""
    cache = _caches[cache_name]
    key = _make_key(*args, **kwargs)
    cache.pop(key, None)


def cache_stats() -> dict:
    return {name: {"size": len(c), "maxsize": c.maxsize, "ttl": c.ttl} for name, c in _caches.items()}

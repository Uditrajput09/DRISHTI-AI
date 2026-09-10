"""
backend/rate_limiter.py
Centralized rate limiter for DRISHTI-AI using SlowAPI.
Protects AI endpoints, alert dispatch, and sync triggers against DoS / excessive spend.
"""

try:
    from slowapi import Limiter
    from slowapi.util import get_remote_address

    limiter = Limiter(key_func=get_remote_address, default_limits=["120/minute"])
except ImportError:
    class DummyLimiter:
        def limit(self, *args, **kwargs):
            def decorator(f):
                return f
            return decorator
    limiter = DummyLimiter()

"""
backend/rate_limiter.py
Centralized rate limiter for DRISHTI-AI using SlowAPI.
Protects AI endpoints, alert dispatch, and sync triggers against DoS / excessive spend.
"""

from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address, default_limits=["120/minute"])

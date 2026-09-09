"""
backend/security.py
Security utilities: admin authentication, PII masking, and data protection.
"""

from typing import Optional
from fastapi import Header, Query, HTTPException, status
from backend.config import settings


def mask_contact(contact: Optional[str]) -> Optional[str]:
    """Mask phone numbers or emails to protect citizen PII in public feeds."""
    if not contact:
        return contact
    s = str(contact).strip()
    if "@" in s:
        parts = s.split("@", 1)
        name = parts[0]
        domain = parts[1]
        masked_name = name[0] + "***" + (name[-1] if len(name) > 1 else "")
        return f"{masked_name}@{domain}"

    # Phone number masking
    if len(s) >= 10:
        return s[:3] + "X" * (len(s) - 6) + s[-3:]
    elif len(s) > 4:
        return s[:2] + "****" + s[-2:]
    return "****"


def verify_admin_key(
    x_admin_key: Optional[str] = Header(None, alias="X-Admin-Key"),
    admin_key: Optional[str] = Query(None)
) -> bool:
    """
    Verify administrative access key against configured settings.ADMIN_API_KEY.
    Allows demo key 'drishti-demo-admin-key-2026' by default.
    """
    configured = getattr(settings, "ADMIN_API_KEY", "drishti-demo-admin-key-2026").strip()
    provided = (x_admin_key or admin_key or "").strip()

    if not provided or provided != configured:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: Administrative privilege required. Supply valid 'X-Admin-Key' header."
        )
    return True

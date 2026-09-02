"""
backend/alerts/sms.py
Fast2SMS integration client for broadcasting emergency SMS alerts in India.
Provides mock fallback outbox logger when API key is not present.
"""

from typing import Dict, Any, List, Optional
import requests
from backend.config import settings


class Fast2SMSService:
    """Service to dispatch SMS notifications via Fast2SMS."""

    def __init__(self):
        self.api_key = settings.get_optional_api_key("FAST2SMS_API_KEY")
        self.api_url = "https://www.fast2sms.com/dev/bulkV2"

    def send_sms(self, numbers: List[str], message: str) -> Dict[str, Any]:
        """
        Send SMS to one or more Indian phone numbers (+91 / 10-digit).
        If FAST2SMS_API_KEY is not configured, logs to mock outbox cleanly.
        """
        if not self.api_key:
            # MOCKED: Fast2SMS API key not supplied. Logging SMS alert to simulated outbox.
            print(f"[MOCKED SMS OUTBOX] Recipients: {numbers} | Content:\n{message}")
            return {
                "success": True,
                "provider": "Fast2SMS (Mock / Fallback Outbox)",
                "is_mocked": True,
                "recipients_count": len(numbers),
                "status": "Logged to Mock Outbox (No API Key Configured)",
                "message_snippet": message[:120] + "..."
            }

        valid_digits = ["".join(filter(str.isdigit, n))[-10:] for n in numbers if any(c.isdigit() for c in n)]
        clean_numbers = ",".join([num for num in valid_digits if len(num) == 10])

        headers = {
            "authorization": self.api_key,
            "Content-Type": "application/json"
        }
        payload = {
            "route": "q",
            "message": message,
            "language": "unicode",
            "flash": 0,
            "numbers": clean_numbers
        }

        try:
            resp = requests.post(self.api_url, json=payload, headers=headers, timeout=6.0)
            data = resp.json()
            if resp.status_code == 200 and data.get("return") is True:
                return {
                    "success": True,
                    "provider": "Fast2SMS Live",
                    "is_mocked": False,
                    "request_id": data.get("request_id"),
                    "status": "Dispatched"
                }
            else:
                # MOCKED: API returned error (e.g. insufficient credits), falling back to mock outbox
                return {
                    "success": False,
                    "provider": "Fast2SMS Error Fallback",
                    "is_mocked": True,
                    "error": data.get("message", "API rejection"),
                    "status": "Simulated"
                }
        except Exception as exc:
            return {
                "success": False,
                "provider": "Fast2SMS Timeout Fallback",
                "is_mocked": True,
                "error": str(exc),
                "status": "Simulated"
            }


sms_service = Fast2SMSService()

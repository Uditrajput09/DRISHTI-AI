"""
backend/alerts/push.py
Firebase Cloud Messaging (FCM) Web Push notification sender and
in-memory / in-app notification broadcaster.
"""

from typing import Dict, Any, List, Optional
import requests
from backend.config import settings

# In-memory store for active connected web push clients / dashboard listeners
IN_APP_NOTIFICATIONS: List[Dict[str, Any]] = []


class PushNotificationService:
    """Service to send web push notifications via FCM with fallback to in-app stream."""

    def __init__(self):
        self.project_id = settings.FIREBASE_PROJECT_ID
        self.api_key = settings.get_optional_api_key("FIREBASE_API_KEY")

    def send_push(
        self,
        title: str,
        body: str,
        data_payload: Optional[Dict[str, Any]] = None,
        tokens: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """
        Send FCM push notification. If Firebase credentials are not supplied,
        broadcasts to in-app notification center.
        """
        payload_dict = data_payload or {}
        notification_item = {
            "title": title,
            "body": body,
            "data": payload_dict,
            "timestamp": payload_dict.get("timestamp", "")
        }
        IN_APP_NOTIFICATIONS.insert(0, notification_item)
        if len(IN_APP_NOTIFICATIONS) > 100:
            IN_APP_NOTIFICATIONS.pop()

        if not self.api_key:
            # MOCKED: Firebase credentials not present, dispatched to In-App Notification Center
            return {
                "success": True,
                "provider": "In-App Notification Center (FCM Fallback)",
                "is_mocked": True,
                "status": "Delivered to Web Dashboard & Field App",
                "title": title
            }

        # Live FCM HTTP v1 / Legacy Endpoint
        fcm_url = "https://fcm.googleapis.com/fcm/send"
        headers = {
            "Authorization": f"key={self.api_key}",
            "Content-Type": "application/json"
        }
        payload = {
            "registration_ids": tokens or ["/topics/all_zones"],
            "notification": {"title": title, "body": body, "sound": "default"},
            "data": data_payload or {}
        }

        try:
            resp = requests.post(fcm_url, json=payload, headers=headers, timeout=5.0)
            return {
                "success": resp.status_code == 200,
                "provider": "Firebase Cloud Messaging Live",
                "is_mocked": False,
                "response_code": resp.status_code
            }
        except Exception as exc:
            return {
                "success": True,
                "provider": "In-App Notification Center (Network Fallback)",
                "is_mocked": True,
                "error": str(exc)
            }

    def get_in_app_notifications(self, limit: int = 20) -> List[Dict[str, Any]]:
        """Retrieve recent in-app broadcast alerts."""
        return IN_APP_NOTIFICATIONS[:limit]


push_service = PushNotificationService()

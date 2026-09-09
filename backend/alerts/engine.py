"""
backend/alerts/engine.py
Alert trigger engine that monitors risk thresholds, evaluates zones,
generates multilingual disaster warnings, and coordinates SMS, Push, and Web dispatches.
"""

from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
from sqlalchemy.orm import Session

from backend.config import settings
from backend.models import AlertLog, Zone, RiskScore, Subscriber
from backend.alerts.translate import translation_service
from backend.alerts.sms import sms_service
from backend.alerts.push import push_service


class AlertDispatchEngine:
    """Core alert orchestration engine for DRISHTI-AI."""

    def __init__(self):
        self.threshold = settings.RISK_ALERT_THRESHOLD
        self.supported_languages = settings.alert_languages_list

    def evaluate_and_dispatch(
        self,
        db: Session,
        zone: Zone,
        risk_score: float,
        risk_level: str,
        rainfall_24h: float,
        risk_score_id: Optional[int] = None,
        force_dispatch: bool = False,
        imd_warning_level: Optional[str] = None,
        nearest_road: Optional[str] = None,
        slope_angle: Optional[float] = None
    ) -> List[Dict[str, Any]]:
        """
        Evaluate if a zone's risk exceeds the alert threshold (or is forced) and dispatch alerts.
        Generates multilingual messages across all configured languages (en, hi, kha, as).
        """
        if not force_dispatch and risk_score < self.threshold and risk_level not in ["High", "Critical"]:
            return []

        # Find registered subscribers for this zone or broadcast
        subscribers = db.query(Subscriber).filter(Subscriber.is_active.is_(True)).all()
        phone_numbers = [s.phone for s in subscribers if s.phone] or ["+91-9876543210", "+91-9436100000"]
        fcm_tokens = [s.fcm_token for s in subscribers if s.fcm_token]

        dispatch_results = []
        now_utc = datetime.now(timezone.utc)

        # Generate alert in each supported language
        for lang in self.supported_languages:
            message_text = translation_service.format_alert_message(
                language=lang,
                zone_name=zone.name,
                risk_score=risk_score,
                risk_level=risk_level,
                rainfall_24h=rainfall_24h,
                imd_warning_level=imd_warning_level,
                nearest_road=nearest_road,
                slope_angle=slope_angle
            )


            # 1. Dispatch SMS
            sms_res = sms_service.send_sms(numbers=phone_numbers, message=message_text)

            # 2. Dispatch Push
            push_title = f"🚨 {risk_level.upper()} ALERT: {zone.name}"
            push_res = push_service.send_push(
                title=push_title,
                body=message_text.split("\n")[1] if "\n" in message_text else message_text,
                data_payload={
                    "zone_id": zone.id,
                    "zone_code": zone.zone_code,
                    "risk_score": risk_score,
                    "risk_level": risk_level,
                    "language": lang,
                    "timestamp": now_utc.isoformat()
                },
                tokens=fcm_tokens if fcm_tokens else None
            )

            # 3. Log alert to DB
            log_entry = AlertLog(
                zone_id=zone.id,
                risk_score_id=risk_score_id,
                risk_score=risk_score,
                risk_level=risk_level,
                channel="sms+push",
                recipient=f"{len(phone_numbers)} phone(s), {len(fcm_tokens) or 1} push target(s)",
                language=lang,
                message_text=message_text,
                status="Dispatched (Mock/Live)",
                provider_response=f"SMS: {sms_res.get('provider')} | Push: {push_res.get('provider')}",
                sent_at=now_utc
            )
            db.add(log_entry)
            db.commit()

            dispatch_results.append({
                "language": lang,
                "message": message_text,
                "sms_status": sms_res,
                "push_status": push_res
            })

        return dispatch_results


alert_engine = AlertDispatchEngine()

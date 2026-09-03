"""
backend/api/routes_escalation.py
Alert escalation ladder — auto-escalates unacknowledged critical alerts.
"""

from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc
from backend.database import get_db
from backend.models import AlertLog, Subscriber

router = APIRouter(prefix="/api/escalation", tags=["Alert Escalation"])


@router.put("/alert/{alert_id}/acknowledge")
def acknowledge_alert(alert_id: int, db: Session = Depends(get_db)):
    """Mark a dispatched alert as acknowledged, halting further escalation."""
    alert = db.query(AlertLog).filter(AlertLog.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    alert.status = "acknowledged"
    db.commit()
    return {"alert_id": alert_id, "status": "acknowledged", "escalation": "stopped"}


@router.get("/status")
def get_escalation_status(db: Session = Depends(get_db)):
    """
    Return unacknowledged Critical alerts and their escalation state.
    MOCKED: Escalation logic runs server-side on a timer (see main.py startup event).
    """
    cutoff = datetime.now(timezone.utc) - timedelta(hours=2)
    unacked = (
        db.query(AlertLog)
        .filter(
            AlertLog.risk_level.in_(["Critical", "High"]),
            AlertLog.status.notin_(["acknowledged"]),
            AlertLog.sent_at >= cutoff
        )
        .order_by(desc(AlertLog.sent_at))
        .limit(20)
        .all()
    )

    results = []
    now = datetime.now(timezone.utc)
    for alert in unacked:
        sent_at = alert.sent_at
        if sent_at.tzinfo is None:
            sent_at = sent_at.replace(tzinfo=timezone.utc)
        age_min = int((now - sent_at).total_seconds() / 60)
        results.append({
            "alert_id": alert.id,
            "zone_id": alert.zone_id,
            "risk_level": alert.risk_level,
            "risk_score": alert.risk_score,
            "sent_at": alert.sent_at.isoformat(),
            "age_minutes": age_min,
            "escalation_level": 2 if age_min >= 30 else (1 if age_min >= 15 else 0),
            "status": alert.status,
            "next_escalation_in_min": max(0, 15 - age_min) if age_min < 15 else (max(0, 30 - age_min) if age_min < 30 else 0)
        })

    return {
        "unacknowledged_critical_alerts": len(results),
        "alerts": results
    }

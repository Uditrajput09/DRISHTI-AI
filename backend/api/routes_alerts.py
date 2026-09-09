"""
backend/api/routes_alerts.py
Disaster alert log retrieval, subscriber registry, and manual alert triggers.
"""

from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc

from backend.database import get_db
from backend.models import AlertLog, Zone, Subscriber
from backend.schemas import ManualAlertRequest, SubscriberCreate
from backend.alerts.engine import alert_engine
from backend.alerts.push import push_service
from backend.security import mask_contact, verify_admin_key

router = APIRouter(prefix="/api/alerts", tags=["Alerts & Notifications"])



@router.get("/history")
def get_alert_history(limit: int = Query(50), db: Session = Depends(get_db)):
    """Retrieve chronologically ordered dispatched emergency alerts."""
    logs = db.query(AlertLog).order_by(desc(AlertLog.sent_at)).limit(limit).all()
    results = []

    for item in logs:
        results.append({
            "id": item.id,
            "zone_id": item.zone_id,
            "zone_name": item.zone.name if item.zone else "District Wide",
            "risk_score": item.risk_score,
            "risk_level": item.risk_level,
            "channel": item.channel,
            "recipient": mask_contact(item.recipient),
            "language": item.language,
            "message_text": item.message_text,
            "status": item.status,
            "provider_response": item.provider_response,
            "sent_at": item.sent_at.isoformat() if item.sent_at else None
        })

    return results


@router.post("/trigger-manual")
def trigger_manual_alert(
    req: ManualAlertRequest,
    db: Session = Depends(get_db),
    admin_auth: bool = Depends(verify_admin_key)
):
    """
    Manually trigger an emergency alert broadcast for live hackathon demonstration.
    Generates SMS and push notifications across Khasi, Assamese, Hindi, and English.
    Requires valid X-Admin-Key authorization.
    """
    zone = db.query(Zone).filter(Zone.id == req.zone_id).first()
    if not zone:
        raise HTTPException(status_code=404, detail="Zone not found")

    dispatched = alert_engine.evaluate_and_dispatch(
        db=db,
        zone=zone,
        risk_score=req.risk_score,
        risk_level=req.risk_level,
        rainfall_24h=145.0,
        force_dispatch=True
    )

    return {
        "status": "success",
        "zone_name": zone.name,
        "dispatched_languages_count": len(dispatched),
        "dispatches": dispatched,
        "message": "Manual emergency broadcast executed successfully across all channels."
    }


@router.get("/subscribers")
def list_subscribers(db: Session = Depends(get_db)):
    """List registered alert subscribers (citizens, emergency responders, DDMA officials)."""
    subs = db.query(Subscriber).all()
    return [{
        "id": s.id,
        "name": s.name,
        "phone": mask_contact(s.phone),
        "email": mask_contact(s.email),
        "role": s.role,
        "preferred_language": s.preferred_language,
        "is_active": s.is_active,
        "created_at": s.created_at.isoformat() if s.created_at else None
    } for s in subs]


@router.post("/subscribers")
def register_subscriber(req: SubscriberCreate, db: Session = Depends(get_db)):
    """Register citizen or emergency personnel for real-time localized SMS/Push alerts."""
    sub = Subscriber(
        name=req.name,
        phone=req.phone,
        email=req.email,
        fcm_token=req.fcm_token,
        role=req.role,
        preferred_language=req.preferred_language,
        zone_id=req.zone_id,
        is_active=True,
        created_at=datetime.now(timezone.utc)
    )
    db.add(sub)

    db.commit()
    db.refresh(sub)
    return {"status": "success", "subscriber_id": sub.id, "name": sub.name}


@router.get("/in-app")
def get_in_app_feed(limit: int = 20):
    """Get active live in-app push stream for dashboard notification drawer."""
    return push_service.get_in_app_notifications(limit=limit)

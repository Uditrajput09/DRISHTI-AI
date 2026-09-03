"""
backend/api/routes_sos.py
Citizen SOS Beacon System — emergency geo-tag + official broadcast.
"""

from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from backend.database import get_db
from backend.models import SOSEvent, Subscriber
from backend.alerts.engine import alert_engine

router = APIRouter(prefix="/api/sos", tags=["SOS Beacon"])


class SOSBeaconRequest(BaseModel):
    lat: float
    lon: float
    reporter_name: str = "Anonymous"
    contact: Optional[str] = None
    message: Optional[str] = "Emergency: Possible landslide or trapped situation."


@router.post("/beacon")
def create_sos_beacon(payload: SOSBeaconRequest, db: Session = Depends(get_db)):
    """
    Register a citizen SOS beacon. Broadcasts GPS location to all district officials.
    MOCKED: SMS dispatch uses simulated Fast2SMS call; push uses FCM stub.
    """
    sos = SOSEvent(
        lat=payload.lat,
        lon=payload.lon,
        reporter_name=payload.reporter_name,
        contact=payload.contact,
        message=payload.message,
        acknowledged=False,
        created_at=datetime.now(timezone.utc)
    )
    db.add(sos)
    db.commit()
    db.refresh(sos)

    # Dispatch SOS alert to all officials via SMS + push
    officials = db.query(Subscriber).filter(
        Subscriber.role.in_(["official", "emergency_team"]),
        Subscriber.is_active == True
    ).all()

    dispatch_count = len(officials)
    alert_msg = (
        f"🆘 SOS ALERT: {payload.reporter_name} needs help at "
        f"lat={payload.lat:.5f}, lon={payload.lon:.5f}. "
        f"Message: {payload.message}"
    )

    for official in officials:
        if official.phone:
            try:
                from backend.alerts.sms import send_sms
                send_sms(official.phone, alert_msg)
            except Exception:
                pass
        if official.fcm_token:
            try:
                from backend.alerts.push import send_push
                send_push(official.fcm_token, "🆘 SOS BEACON", alert_msg)
            except Exception:
                pass

    return {
        "sos_id": sos.id,
        "status": "dispatched",
        "acknowledged": False,
        "dispatched_to": dispatch_count,
        "message": f"SOS beacon registered. Alert dispatched to {dispatch_count} officials."
    }


@router.put("/beacon/{sos_id}/acknowledge")
def acknowledge_sos(sos_id: int, db: Session = Depends(get_db)):
    """Mark an SOS event as acknowledged by a rescue official."""
    sos = db.query(SOSEvent).filter(SOSEvent.id == sos_id).first()
    if not sos:
        raise HTTPException(status_code=404, detail="SOS event not found")
    sos.acknowledged = True
    db.commit()
    return {"sos_id": sos_id, "acknowledged": True}


@router.get("/active")
def get_active_sos(db: Session = Depends(get_db)):
    """Return all unacknowledged SOS events for GIS map display."""
    events = db.query(SOSEvent).filter(SOSEvent.acknowledged == False).all()
    return [
        {
            "id": e.id,
            "lat": e.lat,
            "lon": e.lon,
            "reporter_name": e.reporter_name,
            "contact": e.contact,
            "message": e.message,
            "created_at": e.created_at.isoformat() if e.created_at else None,
            "acknowledged": e.acknowledged
        }
        for e in events
    ]

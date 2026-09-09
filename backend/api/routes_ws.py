"""
backend/api/routes_ws.py
WebSocket endpoints for live GIS map updates and real-time early warning telemetry.
"""

from datetime import datetime, timezone
import json
import logging
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session

from backend.database import SessionLocal
from backend.api.ws_manager import ws_manager
from backend.api.routes_risk import get_all_zones_risk

logger = logging.getLogger("drishti.routes_ws")
router = APIRouter(tags=["WebSocket Realtime"])


@router.websocket("/ws/risk-live")
async def risk_live_endpoint(websocket: WebSocket):
    """
    WebSocket channel for live landslide risk streaming.
    Pushes initial zone risk snapshot upon connection, then maintains connection
    to receive live broadcasts whenever the ingestion cycle or simulations update.
    """
    await ws_manager.connect(websocket)
    db: Session = SessionLocal()
    try:
        # 1. Send immediate snapshot of current zone risk states
        initial_zones = get_all_zones_risk(db=db)
        await websocket.send_text(json.dumps({
            "type": "INITIAL_SNAPSHOT",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "zones": initial_zones
        }))
    except Exception as e:
        logger.error(f"[WebSocket] Error sending initial snapshot: {e}")
    finally:
        db.close()

    # 2. Keepalive loop & handle client heartbeats
    try:
        while True:
            msg = await websocket.receive_text()
            if msg == "ping":
                await websocket.send_text(json.dumps({
                    "type": "PONG",
                    "timestamp": datetime.now(timezone.utc).isoformat()
                }))
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)
    except Exception as err:
        logger.warning(f"[WebSocket] Disconnected with error: {err}")
        ws_manager.disconnect(websocket)

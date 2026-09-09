"""
backend/api/routes_ingestion.py
REST API endpoints for the DRISHTI-AI Unified Data Ingestion & Risk Synchronization Pipeline.
Provides health diagnostics, on-demand synchronization, telemetry previews, and subsystem feeds.
"""

from typing import Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models import Zone
from backend.ingestion.pipeline import ingestion_pipeline
from backend.ingestion.osm import osm_service
from backend.ingestion.imd import imd_service
from backend.ingestion.terrain import terrain_service

router = APIRouter(prefix="/api/ingestion", tags=["Unified Ingestion Pipeline"])


@router.get("/status")
def get_ingestion_status():
    """
    Get live operational diagnostics and latency benchmarks across all 5 integrated subsystems:
    1. Open-Meteo Weather (rainfall & soil moisture)
    2. IMD Meteorology (district severe weather warnings)
    3. Open Topo Data / DEM (elevation & slope gradients)
    4. OSM Overpass API (lifeline highway network & road cut proximity)
    5. Multilingual Alert Translation (English, Hindi, Khasi, Assamese localized advisories)
    """
    return ingestion_pipeline.get_pipeline_health_status()


@router.post("/sync")
def trigger_full_ingestion_sync(
    dispatch_alerts: bool = Query(True, description="Automatically dispatch SMS/Push alerts if risk threshold is crossed"),
    db: Session = Depends(get_db)
):
    """
    Trigger an on-demand, end-to-end multi-source data ingestion and risk synchronization cycle:
    Pulls Open-Meteo, IMD, DEM, and OSM Overpass, recalculates AI risk scores for all monitored zones,
    and dispatches localized multilingual alerts if critical thresholds are met.
    """
    try:
        result = ingestion_pipeline.run_full_ingestion_sync(db, auto_dispatch_alerts=dispatch_alerts)

        # Broadcast live zone risks to connected WebSocket dashboards
        try:
            import asyncio
            from backend.api.ws_manager import ws_manager
            from backend.api.routes_risk import get_all_zones_risk
            from datetime import datetime, timezone
            all_updated_zones = get_all_zones_risk(db=db)
            if ws_manager.active_connections:
                try:
                    loop = asyncio.get_event_loop()
                    if loop.is_running():
                        loop.create_task(ws_manager.broadcast({
                            "type": "ZONE_RISK_UPDATE",
                            "source": "manual_sync",
                            "timestamp": datetime.now(timezone.utc).isoformat(),
                            "zones": all_updated_zones
                        }))
                    else:
                        loop.run_until_complete(ws_manager.broadcast({
                            "type": "ZONE_RISK_UPDATE",
                            "source": "manual_sync",
                            "timestamp": datetime.now(timezone.utc).isoformat(),
                            "zones": all_updated_zones
                        }))
                except Exception:
                    asyncio.run(ws_manager.broadcast({
                        "type": "ZONE_RISK_UPDATE",
                        "source": "manual_sync",
                        "timestamp": datetime.now(timezone.utc).isoformat(),
                        "zones": all_updated_zones
                    }))
        except Exception as ws_err:
            print(f"[WebSocket Warning] Failed to broadcast sync update: {ws_err}")

        return result
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Ingestion pipeline sync failed: {str(exc)}")


@router.get("/preview/{zone_id}")
def preview_zone_telemetry(zone_id: int, db: Session = Depends(get_db)):
    """
    Preview the integrated multi-source telemetry snapshot for a specific zone:
    Returns Open-Meteo live weather, DEM slope gradient, OSM road proximity,
    IMD official warning, AI risk prediction, and localized advisories in 4 languages (en, hi, kha, as).
    """
    zone = db.query(Zone).filter(Zone.id == zone_id).first()
    if not zone:
        raise HTTPException(status_code=404, detail=f"Zone with ID {zone_id} not found.")

    try:
        telemetry = ingestion_pipeline.ingest_zone_telemetry(zone)
        return telemetry
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to generate telemetry preview: {str(exc)}")


@router.get("/highways")
def get_tracked_highways():
    """Get the current arterial highway network queried from OpenStreetMap Overpass."""
    highways = osm_service.query_district_highways()
    return {
        "count": len(highways),
        "highways": highways
    }


@router.get("/imd")
def get_imd_district_warning(district: str = "East Khasi Hills"):
    """Get the official IMD meteorological warning bulletin for the pilot district."""
    return imd_service.fetch_district_warning(district)

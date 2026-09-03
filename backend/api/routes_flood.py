"""
backend/api/routes_flood.py
Flash flood co-prediction using river discharge + rainfall data.
"""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from backend.database import get_db
from backend.models import Zone, WeatherReading

router = APIRouter(prefix="/api/flood", tags=["Flash Flood"])


def compute_flood_risk(discharge_m3s: float, rainfall_24h: float, zone_vuln: float) -> dict:
    """
    Simple threshold-based flood risk model.
    Real model would use TOPMODEL or HBV catchment routing.
    MOCKED: Flood thresholds derived from CWCA/CWC guidelines for Meghalaya rivers.
    """
    # Composite score
    discharge_factor = min(1.0, discharge_m3s / 1200.0)
    rain_factor = min(1.0, rainfall_24h / 200.0)
    score = round((0.5 * discharge_factor + 0.35 * rain_factor + 0.15 * zone_vuln) * 100, 1)

    if score >= 75:
        level = "Critical"
    elif score >= 55:
        level = "High"
    elif score >= 30:
        level = "Moderate"
    else:
        level = "Low"

    return {"flood_risk_score": score, "flood_risk_level": level}


@router.get("/risk")
def get_flood_risk(zone_id: int = Query(1), db: Session = Depends(get_db)):
    """
    Get current flash flood risk for a zone based on river discharge + 24h rainfall.
    """
    zone = db.query(Zone).filter(Zone.id == zone_id).first()
    if not zone:
        return {"zone_id": zone_id, "flood_risk_score": 0, "flood_risk_level": "Low"}

    latest_weather = (
        db.query(WeatherReading)
        .filter(WeatherReading.zone_id == zone_id)
        .order_by(desc(WeatherReading.timestamp))
        .first()
    )

    discharge = getattr(latest_weather, "river_discharge_m3s", None) or 320.0
    rainfall = latest_weather.rainfall_24h_mm if latest_weather else 55.0

    result = compute_flood_risk(discharge, rainfall, zone.vulnerability_index)

    return {
        "zone_id": zone_id,
        "zone_name": zone.name,
        "discharge_m3s": round(discharge, 1),
        "rainfall_24h_mm": round(rainfall, 1),
        **result
    }


@router.get("/all-zones")
def get_all_zones_flood_risk(db: Session = Depends(get_db)):
    """Return flood risk for all zones for GIS overlay."""
    zones = db.query(Zone).all()
    results = []
    for zone in zones:
        latest = (
            db.query(WeatherReading)
            .filter(WeatherReading.zone_id == zone.id)
            .order_by(desc(WeatherReading.timestamp))
            .first()
        )
        discharge = getattr(latest, "river_discharge_m3s", None) or 280.0
        rainfall = latest.rainfall_24h_mm if latest else 45.0
        risk = compute_flood_risk(discharge, rainfall, zone.vulnerability_index)
        results.append({
            "zone_id": zone.id,
            "zone_name": zone.name,
            "lat": zone.center_lat,
            "lon": zone.center_lon,
            **risk
        })
    return results

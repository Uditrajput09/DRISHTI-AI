"""
backend/api/routes_anomaly.py
REST API endpoints for real-time temporal anomaly detection and live push alerts.
"""

from typing import List, Dict, Any
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models import Zone, WeatherReading, RiskScore
from backend.ml.anomaly import anomaly_detector
from backend.api.ws_manager import ws_manager

router = APIRouter(prefix="/api/anomaly", tags=["anomaly"])


@router.get("/scan", response_model=Dict[str, Any])
def scan_all_zones_for_anomalies(db: Session = Depends(get_db)):
    """
    Perform a live Isolation Forest scan across all active micro-zones in the pilot district.
    Returns detected meteorological and landslide risk anomalies.
    """
    zones = db.query(Zone).all()
    results = []
    anomalies_found = 0
    critical_count = 0

    for z in zones:
        latest_weather = (
            db.query(WeatherReading)
            .filter(WeatherReading.zone_id == z.id)
            .order_by(WeatherReading.timestamp.desc())
            .first()
        )
        latest_risk = (
            db.query(RiskScore)
            .filter(RiskScore.zone_id == z.id)
            .order_by(RiskScore.computed_at.desc())
            .first()
        )

        rain_h = float(latest_weather.rainfall_hourly_mm) if latest_weather and latest_weather.rainfall_hourly_mm else 0.0
        rain_24 = float(latest_weather.rainfall_24h_mm) if latest_weather and latest_weather.rainfall_24h_mm else 0.0
        soil_m = round(float(latest_weather.soil_moisture_0_7cm) / 0.5 * 100, 1) if (latest_weather and latest_weather.soil_moisture_0_7cm is not None) else 50.0
        r_score = float(latest_risk.risk_score) if latest_risk and latest_risk.risk_score else 25.0

        eval_res = anomaly_detector.evaluate_reading(
            zone_id=str(z.id),
            zone_name=z.name,
            rain_hourly=rain_h,
            rain_24h=rain_24,
            soil_moisture=soil_m,
            risk_score=r_score
        )
        results.append(eval_res)
        if eval_res["is_anomaly"]:
            anomalies_found += 1
        if eval_res["severity"] == "CRITICAL":
            critical_count += 1

    # Sort descending by anomaly index so the most critical are first
    results.sort(key=lambda x: x["anomaly_index"], reverse=True)

    return {
        "status": "success",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "total_zones_scanned": len(zones),
        "anomalies_detected": anomalies_found,
        "critical_count": critical_count,
        "anomalies": results
    }


@router.get("/zone/{zone_id}", response_model=Dict[str, Any])
def scan_single_zone(zone_id: int, db: Session = Depends(get_db)):
    """Evaluate temporal anomaly status for a single micro-zone."""
    zone = db.query(Zone).filter(Zone.id == zone_id).first()
    if not zone:
        raise HTTPException(status_code=404, detail=f"Zone {zone_id} not found")

    latest_weather = (
        db.query(WeatherReading)
        .filter(WeatherReading.zone_id == zone.id)
        .order_by(WeatherReading.timestamp.desc())
        .first()
    )
    latest_risk = (
        db.query(RiskScore)
        .filter(RiskScore.zone_id == zone.id)
        .order_by(RiskScore.computed_at.desc())
        .first()
    )

    rain_h = float(latest_weather.rainfall_hourly_mm) if latest_weather and latest_weather.rainfall_hourly_mm else 0.0
    rain_24 = float(latest_weather.rainfall_24h_mm) if latest_weather and latest_weather.rainfall_24h_mm else 0.0
    soil_m = round(float(latest_weather.soil_moisture_0_7cm) / 0.5 * 100, 1) if (latest_weather and latest_weather.soil_moisture_0_7cm is not None) else 50.0
    r_score = float(latest_risk.risk_score) if latest_risk and latest_risk.risk_score else 25.0

    return anomaly_detector.evaluate_reading(
        zone_id=str(zone.id),
        zone_name=zone.name,
        rain_hourly=rain_h,
        rain_24h=rain_24,
        soil_moisture=soil_m,
        risk_score=r_score
    )

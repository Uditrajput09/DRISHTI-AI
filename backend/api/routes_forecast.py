"""
backend/api/routes_forecast.py
7-day landslide risk forecast per zone using Open-Meteo extended forecast data
and probabilistic risk trajectory modeling with 90% confidence bands.
"""

from typing import Dict, Any
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc
from backend.database import get_db
from backend.models import Zone, WeatherReading, RiskScore
from backend.ml.forecast_model import risk_forecaster

router = APIRouter(prefix="/api/forecast", tags=["7-Day Forecast"])


def risk_level_from_score(score: float) -> str:
    if score >= 80: return "Critical"
    if score >= 60: return "High"
    if score >= 35: return "Medium"
    return "Low"


@router.get("/weekly")
def get_weekly_forecast(zone_id: int = Query(1), db: Session = Depends(get_db)):
    """
    Generate a 7-day probabilistic risk forecast for a zone using Open-Meteo forecast readings
    and geotechnical decay dynamics with 90% confidence intervals.
    """
    zone = db.query(Zone).filter(Zone.id == zone_id).first()
    if not zone:
        return {"zone_id": zone_id, "days": []}

    latest_risk = (
        db.query(RiskScore)
        .filter(RiskScore.zone_id == zone_id)
        .order_by(desc(RiskScore.computed_at))
        .first()
    )
    base_score = float(latest_risk.risk_score) if latest_risk and latest_risk.risk_score else 45.0
    base_rain = float(latest_risk.rainfall_24h) if latest_risk and latest_risk.rainfall_24h else 40.0
    base_moisture = float(latest_risk.soil_moisture) if latest_risk and latest_risk.soil_moisture else 60.0

    # Extended forecast weather series from DB if available
    forecast_readings = (
        db.query(WeatherReading)
        .filter(WeatherReading.zone_id == zone_id, WeatherReading.is_forecast == True)
        .order_by(WeatherReading.timestamp)
        .limit(7)
        .all()
    )

    rain_series = [float(r.rainfall_24h_mm) for r in forecast_readings] if forecast_readings else None

    # Compute probabilistic forward trajectory
    trajectory = risk_forecaster.compute_7day_trajectory(
        base_slope=float(zone.base_slope_deg or 32.0),
        vulnerability_index=float(zone.vulnerability_index or 0.65),
        current_rain_24h=base_rain,
        current_soil_moisture=base_moisture,
        base_risk_score=base_score,
        forecast_rainfall_series=rain_series
    )

    days = []
    for step in trajectory:
        score = step["predicted_risk"]
        days.append({
            "date": step["date"],
            "weekday": step["weekday"],
            "risk_score": score,
            "risk_level": step["severity"],
            "confidence_lower": step["confidence_lower"],
            "confidence_upper": step["confidence_upper"],
            "trigger_probability": step["trigger_probability"],
            "predicted_rain_mm": step["predicted_rain_mm"],
            "soil_moisture_pct": step["predicted_soil_moisture_pct"],
            "is_forecast": True
        })

    return {
        "zone_id": zone_id,
        "zone_name": zone.name,
        "model": "Probabilistic-7Day-Decay-Trajectory-v2",
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "days": days
    }


@router.get("/probabilistic/{zone_id}")
def get_probabilistic_zone_forecast(zone_id: int, db: Session = Depends(get_db)):
    """Dedicated endpoint for high-resolution probabilistic 7-day risk trajectory."""
    zone = db.query(Zone).filter(Zone.id == zone_id).first()
    if not zone:
        raise HTTPException(status_code=404, detail=f"Zone {zone_id} not found")

    return get_weekly_forecast(zone_id=zone_id, db=db)

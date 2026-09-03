"""
backend/api/routes_forecast.py
7-day landslide risk forecast per zone using Open-Meteo extended forecast data.
"""

import random
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from backend.database import get_db
from backend.models import Zone, WeatherReading, RiskScore
from backend.ml.model import risk_model

router = APIRouter(prefix="/api/forecast", tags=["7-Day Forecast"])


def risk_level_from_score(score: float) -> str:
    if score >= 80: return "Critical"
    if score >= 60: return "High"
    if score >= 35: return "Medium"
    return "Low"


@router.get("/weekly")
def get_weekly_forecast(zone_id: int = Query(1), db: Session = Depends(get_db)):
    """
    Generate a 7-day risk forecast for a zone using Open-Meteo forecast readings.
    Falls back to heuristic projection if extended forecast not in DB.
    """
    zone = db.query(Zone).filter(Zone.id == zone_id).first()
    if not zone:
        return {"zone_id": zone_id, "days": []}

    # Pull latest risk score as baseline
    latest_risk = (
        db.query(RiskScore)
        .filter(RiskScore.zone_id == zone_id)
        .order_by(desc(RiskScore.computed_at))
        .first()
    )
    base_score = latest_risk.risk_score if latest_risk else 50.0
    base_rain = latest_risk.rainfall_24h if latest_risk else 60.0
    base_moisture = latest_risk.soil_moisture if latest_risk else 70.0

    # Pull forecast weather readings (7 days ahead)
    forecast_readings = (
        db.query(WeatherReading)
        .filter(WeatherReading.zone_id == zone_id, WeatherReading.is_forecast == True)
        .order_by(WeatherReading.timestamp)
        .limit(7)
        .all()
    )

    days = []
    today = datetime.now(timezone.utc)

    for i in range(7):
        date = today + timedelta(days=i)
        date_str = date.strftime("%Y-%m-%d")
        weekday = date.strftime("%a")

        if i < len(forecast_readings):
            r = forecast_readings[i]
            rain = r.rainfall_24h_mm
            moisture = r.soil_moisture_0_7cm * 100 if r.soil_moisture_0_7cm < 2 else r.soil_moisture_0_7cm
        else:
            # MOCKED: Heuristic projection — typical monsoon decay pattern
            decay = 0.88 ** i
            rain = max(0, base_rain * decay + random.uniform(-15, 20))
            moisture = max(30, min(98, base_moisture * (0.95 ** i) + random.uniform(-5, 5)))

        features = {
            "slope_angle": zone.base_slope_deg,
            "rainfall_24h_mm": rain,
            "rainfall_72h_mm": rain * 2.2,
            "antecedent_rainfall_index": rain * 0.8,
            "soil_moisture_pct": moisture,
            "distance_to_road_m": 25.0,
            "vulnerability_index": zone.vulnerability_index
        }
        result = risk_model.predict_risk(features)
        score = result["risk_score"]
        level = risk_level_from_score(score)

        days.append({
            "date": date_str,
            "weekday": weekday,
            "risk_score": round(score, 1),
            "risk_level": level,
            "predicted_rain_mm": round(rain, 1),
            "soil_moisture_pct": round(moisture, 1),
            "is_forecast": True
        })

    return {
        "zone_id": zone_id,
        "zone_name": zone.name,
        "days": days
    }

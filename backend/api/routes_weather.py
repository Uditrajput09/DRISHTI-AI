"""
backend/api/routes_weather.py
Weather readings, live ingestion refresh, and forecast endpoints.
"""

from typing import List, Dict, Any
from datetime import datetime, timezone
import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc

from backend.database import get_db
from backend.models import Zone, WeatherReading, RiskScore
from backend.ingestion.weather import weather_service
from backend.ingestion.imd import imd_service
from backend.ml.model import risk_model

router = APIRouter(prefix="/api/weather", tags=["Weather Ingestion"])


@router.get("/current")
def get_current_weather(db: Session = Depends(get_db)):
    """Get latest weather and soil moisture status across all monitored zones."""
    zones = db.query(Zone).all()
    results = []

    for z in zones:
        reading = (
            db.query(WeatherReading)
            .filter(WeatherReading.zone_id == z.id)
            .order_by(desc(WeatherReading.timestamp))
            .first()
        )
        if reading:
            results.append({
                "zone_id": z.id,
                "zone_name": z.name,
                "timestamp": reading.timestamp.isoformat(),
                "rainfall_hourly_mm": reading.rainfall_hourly_mm,
                "rainfall_24h_mm": reading.rainfall_24h_mm,
                "rainfall_72h_mm": reading.rainfall_72h_mm,
                "antecedent_rainfall_index": reading.antecedent_rainfall_index,
                "soil_moisture_0_7cm": reading.soil_moisture_0_7cm,
                "soil_moisture_pct": round(reading.soil_moisture_0_7cm / 0.50 * 100, 1),
                "temperature_c": reading.temperature_c,
                "humidity_pct": reading.humidity_pct,
                "wind_speed_kmh": reading.wind_speed_kmh,
                "source": reading.source
            })

    # Fetch official IMD district bulletin
    imd_bulletin = imd_service.fetch_district_warning("East Khasi Hills")

    return {
        "district": "East Khasi Hills, Meghalaya",
        "zones_count": len(results),
        "imd_bulletin": imd_bulletin,
        "readings": results
    }


@router.post("/refresh")
def trigger_live_weather_refresh(db: Session = Depends(get_db)):
    """
    Trigger live polling of Open-Meteo & IMD APIs for all zones,
    update weather readings, and recalculate AI risk scores.
    """
    zones = db.query(Zone).all()
    updated_count = 0
    now_utc = datetime.now(timezone.utc)

    for z in zones:
        # Ingest Open-Meteo data for this zone coordinates
        w_data = weather_service.fetch_live_zone_weather(z.center_lat, z.center_lon)

        # Store weather reading
        reading = WeatherReading(
            zone_id=z.id,
            timestamp=now_utc,
            rainfall_hourly_mm=w_data["rainfall_hourly_mm"],
            rainfall_24h_mm=w_data["rainfall_24h_mm"],
            rainfall_72h_mm=w_data["rainfall_72h_mm"],
            antecedent_rainfall_index=w_data["antecedent_rainfall_index"],
            soil_moisture_0_7cm=w_data["soil_moisture_0_7cm"],
            soil_moisture_7_28cm=w_data["soil_moisture_7_28cm"],
            temperature_c=w_data["temperature_c"],
            humidity_pct=w_data["humidity_pct"],
            wind_speed_kmh=w_data["wind_speed_kmh"],
            source=w_data["source"],
            is_forecast=False
        )
        db.add(reading)

        # Re-evaluate ML risk
        feat_dict = {
            "slope_angle": z.base_slope_deg,
            "rainfall_24h_mm": w_data["rainfall_24h_mm"],
            "rainfall_72h_mm": w_data["rainfall_72h_mm"],
            "antecedent_rainfall_index": w_data["antecedent_rainfall_index"],
            "soil_moisture_pct": w_data["soil_moisture_pct"],
            "distance_to_road_m": 12.0 if "Highway" in str(z.key_roads_json) else 30.0,
            "vulnerability_index": z.vulnerability_index
        }
        pred = risk_model.predict_risk(feat_dict)

        risk_score = RiskScore(
            zone_id=z.id,
            risk_score=pred["risk_score"],
            risk_level=pred["risk_level"],
            probability=pred["probability"],
            triggering_factors_json=json.dumps(pred["triggering_factors"]),
            rainfall_24h=w_data["rainfall_24h_mm"],
            rainfall_72h=w_data["rainfall_72h_mm"],
            soil_moisture=w_data["soil_moisture_pct"],
            model_version=pred["model_version"],
            computed_at=now_utc
        )
        db.add(risk_score)
        updated_count += 1

    db.commit()
    return {"status": "success", "zones_refreshed": updated_count, "timestamp": now_utc.isoformat()}



@router.get("/forecast/{zone_id}")
def get_zone_forecast(zone_id: int, db: Session = Depends(get_db)):
    """Get 48-hour rainfall, soil moisture, and landslide probability forecast series for a zone."""
    zone = db.query(Zone).filter(Zone.id == zone_id).first()
    if not zone:
        raise HTTPException(status_code=404, detail="Zone not found")

    w_data = weather_service.fetch_live_zone_weather(zone.center_lat, zone.center_lon)
    forecast_series = w_data.get("forecast_series", [])

    # Calculate landslide probability projection for each hourly forecast slot
    augmented_series = []
    for step in forecast_series:
        rain_step = step.get("rainfall_mm", 0.0)
        sm_step = step.get("soil_moisture_pct", 65.0)

        # Approximate projected 24h rain
        proj_r24 = rain_step * 8.0 + w_data["rainfall_24h_mm"] * 0.4
        feat = {
            "slope_angle": zone.base_slope_deg,
            "rainfall_24h_mm": proj_r24,
            "rainfall_72h_mm": proj_r24 * 1.8,
            "antecedent_rainfall_index": proj_r24 * 0.9,
            "soil_moisture_pct": sm_step,
            "distance_to_road_m": 20.0,
            "vulnerability_index": zone.vulnerability_index
        }
        pred = risk_model.predict_risk(feat)

        augmented_series.append({
            "time": step.get("time"),
            "rainfall_mm": step.get("rainfall_mm"),
            "soil_moisture_pct": step.get("soil_moisture_pct"),
            "temperature_c": step.get("temperature_c"),
            "projected_risk_score": pred["risk_score"],
            "projected_risk_level": pred["risk_level"]
        })

    return {
        "zone_id": zone.id,
        "zone_name": zone.name,
        "forecast_series": augmented_series
    }

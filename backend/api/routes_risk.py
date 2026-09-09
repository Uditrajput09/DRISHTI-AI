"""
backend/api/routes_risk.py
Landslide risk scoring, zone risk queries, and live simulation endpoints.
"""

from typing import List, Dict, Any
import json
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc

from backend.database import get_db
from backend.models import Zone, RiskScore, WeatherReading
from backend.schemas import RiskSimulationRequest
from backend.ml.model import risk_model
from backend.alerts.engine import alert_engine
from backend.cache import cache_get, cache_set, cache_invalidate_prefix

router = APIRouter(prefix="/api/risk", tags=["Landslide Risk"])


@router.get("/summary")
def get_district_risk_summary(db: Session = Depends(get_db)):
    """Get high-level summary of district landslide susceptibility status."""
    zones = db.query(Zone).all()
    if not zones:
        return {
            "district": "East Khasi Hills, Meghalaya",
            "total_zones_monitored": 0,
            "overall_status": "No Zones Initialized",
            "critical_count": 0,
            "high_count": 0,
            "medium_count": 0,
            "low_count": 0
        }

    critical_count = 0
    high_count = 0
    med_count = 0
    low_count = 0
    highest_score = 0.0
    highest_zone_name = ""

    for z in zones:
        latest_risk = (
            db.query(RiskScore)
            .filter(RiskScore.zone_id == z.id)
            .order_by(desc(RiskScore.computed_at))
            .first()
        )
        if latest_risk:
            score = latest_risk.risk_score
            level = latest_risk.risk_level
            if score > highest_score:
                highest_score = score
                highest_zone_name = z.name
            if level == "Critical":
                critical_count += 1
            elif level == "High":
                high_count += 1
            elif level == "Medium":
                med_count += 1
            else:
                low_count += 1

    overall_status = "Critical Alert" if critical_count > 0 else ("High Warning" if high_count > 0 else ("Advisory" if med_count > 0 else "Normal"))

    return {
        "district": "East Khasi Hills, Meghalaya",
        "total_zones_monitored": len(zones),
        "overall_status": overall_status,
        "critical_count": critical_count,
        "high_count": high_count,
        "medium_count": med_count,
        "low_count": low_count,
        "highest_risk_score": round(highest_score, 1),
        "highest_risk_zone": highest_zone_name,
        "last_updated": datetime.now(timezone.utc).isoformat()
    }


@router.get("/zones")
def get_all_zones_risk(db: Session = Depends(get_db)):
    """
    Get all micro-zones with their latest AI risk score, triggering factors,
    weather parameters, and GeoJSON polygon geometry.
    """
    # Check Redis cache first
    cached = cache_get("drishti:zones_risk:all")
    if cached is not None:
        return cached

    zones = db.query(Zone).all()
    results = []

    for z in zones:
        latest_risk = (
            db.query(RiskScore)
            .filter(RiskScore.zone_id == z.id)
            .order_by(desc(RiskScore.computed_at))
            .first()
        )
        latest_weather = (
            db.query(WeatherReading)
            .filter(WeatherReading.zone_id == z.id)
            .order_by(desc(WeatherReading.timestamp))
            .first()
        )

        geometry = json.loads(z.geometry_json) if z.geometry_json else None
        key_roads = json.loads(z.key_roads_json) if z.key_roads_json else []
        trigger_factors = (
            json.loads(latest_risk.triggering_factors_json)
            if latest_risk and latest_risk.triggering_factors_json
            else {}
        )

        results.append({
            "id": z.id,
            "zone_code": z.zone_code,
            "name": z.name,
            "district": z.district,
            "state": z.state,
            "center_lat": z.center_lat,
            "center_lon": z.center_lon,
            "base_slope_deg": z.base_slope_deg,
            "base_elevation_m": z.base_elevation_m,
            "vulnerability_index": z.vulnerability_index,
            "soil_type": z.soil_type,
            "geology": z.geology,
            "key_roads": key_roads,
            "geometry": geometry,
            "risk_score": latest_risk.risk_score if latest_risk else 35.0,
            "risk_level": latest_risk.risk_level if latest_risk else "Medium",
            "probability": latest_risk.probability if latest_risk else 0.35,
            "triggering_factors": trigger_factors,
            "rainfall_24h": latest_weather.rainfall_24h_mm if latest_weather else (latest_risk.rainfall_24h if latest_risk else 45.0),
            "rainfall_72h": latest_weather.rainfall_72h_mm if latest_weather else (latest_risk.rainfall_72h if latest_risk else 95.0),
            "soil_moisture_pct": round((latest_weather.soil_moisture_0_7cm / 0.5 * 100), 1) if (latest_weather and latest_weather.soil_moisture_0_7cm is not None) else (latest_risk.soil_moisture if latest_risk else 70.0),
            "computed_at": latest_risk.computed_at.isoformat() if latest_risk else datetime.now(timezone.utc).isoformat()
        })

    # Cache snapshot with 60 second TTL
    cache_set("drishti:zones_risk:all", results, ttl_seconds=60)
    return results


@router.post("/simulate")
def simulate_landslide_risk(req: RiskSimulationRequest, db: Session = Depends(get_db)):
    """
    Interactive Simulation Sandbox:
    Simulates custom cloudburst precipitation / soil moisture scenario on zones,
    re-runs the ML classifier, and optionally triggers multi-lingual alerts.
    """
    zones_to_simulate = []
    if req.zone_id:
        target_zone = db.query(Zone).filter(Zone.id == req.zone_id).first()
        if not target_zone:
            raise HTTPException(status_code=404, detail="Zone not found")
        zones_to_simulate.append(target_zone)
    else:
        zones_to_simulate = db.query(Zone).all()

    simulated_results = []

    for z in zones_to_simulate:
        # Calculate simulated 24h and 72h accumulation
        r24_sim = round(req.simulated_hourly_rainfall_mm * min(24, req.simulated_duration_hours), 2)
        r72_sim = round(r24_sim * 1.85, 2)
        ari_sim = round(r24_sim * 0.85 + r72_sim * 0.45, 2)
        
        # Soil moisture calculation if not directly provided
        if req.simulated_soil_moisture_pct is not None:
            sm_sim = req.simulated_soil_moisture_pct
        else:
            sm_sim = min(99.0, max(45.0, 50.0 + (r24_sim / 160.0) * 45.0))

        feat_dict = {
            "slope_angle": z.base_slope_deg,
            "rainfall_24h_mm": r24_sim,
            "rainfall_72h_mm": r72_sim,
            "antecedent_rainfall_index": ari_sim,
            "soil_moisture_pct": sm_sim,
            "distance_to_road_m": 10.0 if "Highway" in str(z.key_roads_json) else 25.0,
            "vulnerability_index": z.vulnerability_index
        }

        # Run AI prediction
        pred = risk_model.predict_risk(feat_dict)
        new_score = pred["risk_score"]
        new_level = pred["risk_level"]

        # Persist simulated risk score
        risk_record = RiskScore(
            zone_id=z.id,
            risk_score=new_score,
            risk_level=new_level,
            probability=pred["probability"],
            triggering_factors_json=json.dumps(pred["triggering_factors"]),
            rainfall_24h=r24_sim,
            rainfall_72h=r72_sim,
            soil_moisture=sm_sim,
            model_version=f"{pred['model_version']}-simulation",
            computed_at=datetime.now(timezone.utc)
        )
        db.add(risk_record)
        db.commit()
        db.refresh(risk_record)


        # Dispatch alerts if requested or critical threshold met
        alert_dispatches = []
        if req.trigger_alerts or (new_score >= 75.0 and req.trigger_alerts is not False):
            alert_dispatches = alert_engine.evaluate_and_dispatch(
                db=db,
                zone=z,
                risk_score=new_score,
                risk_level=new_level,
                rainfall_24h=r24_sim,
                risk_score_id=risk_record.id,
                force_dispatch=True
            )

        simulated_results.append({
            "zone_id": z.id,
            "zone_name": z.name,
            "simulated_rain_hourly_mm": req.simulated_hourly_rainfall_mm,
            "simulated_rain_24h_mm": r24_sim,
            "simulated_soil_moisture_pct": sm_sim,
            "risk_score": new_score,
            "risk_level": new_level,
            "probability": pred["probability"],
            "confidence_score": pred.get("confidence_score"),
            "uncertainty_band": pred.get("uncertainty_band"),
            "model_std": pred.get("model_std"),
            "triggering_factors": pred["triggering_factors"],
            "alerts_triggered": len(alert_dispatches) > 0,
            "alerts_count": len(alert_dispatches)
        })

    # Invalidate cached zones risk on simulation
    cache_invalidate_prefix("drishti:zones_risk")

    # Broadcast updated zones to all connected WebSocket clients
    try:
        import asyncio
        from backend.api.ws_manager import ws_manager
        all_updated_zones = get_all_zones_risk(db=db)
        if ws_manager.active_connections:
            try:
                loop = asyncio.get_event_loop()
                if loop.is_running():
                    loop.create_task(ws_manager.broadcast({
                        "type": "SIMULATION_UPDATE",
                        "timestamp": datetime.now(timezone.utc).isoformat(),
                        "zones": all_updated_zones
                    }))
                else:
                    loop.run_until_complete(ws_manager.broadcast({
                        "type": "SIMULATION_UPDATE",
                        "timestamp": datetime.now(timezone.utc).isoformat(),
                        "zones": all_updated_zones
                    }))
            except Exception:
                asyncio.run(ws_manager.broadcast({
                    "type": "SIMULATION_UPDATE",
                    "timestamp": datetime.now(timezone.utc).isoformat(),
                    "zones": all_updated_zones
                }))
    except Exception as ws_err:
        print(f"[WebSocket Warning] Failed to broadcast simulation update: {ws_err}")

    return {
        "status": "success",
        "simulation_parameters": {
            "hourly_rainfall_mm": req.simulated_hourly_rainfall_mm,
            "duration_hours": req.simulated_duration_hours,
            "soil_moisture_pct": req.simulated_soil_moisture_pct
        },
        "zones_evaluated": len(simulated_results),
        "results": simulated_results
    }

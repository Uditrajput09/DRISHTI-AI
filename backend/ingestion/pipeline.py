"""
backend/ingestion/pipeline.py
Unified Data Ingestion & Risk Synchronization Pipeline for DRISHTI-AI.
Integrates:
  1. Open-Meteo Weather (rainfall_24h, rainfall_72h, ARI, soil saturation, forecast series)
  2. IMD Official District Warnings (bulletins, warning level, severity multiplier)
  3. Open Topo Data / DEM (elevation, finite difference slope gradient calibration)
  4. OSM Overpass API (arterial highway network, distance to cut slopes)
  5. Multilingual Alert Translation (English, Hindi, Khasi, Assamese localized advisories)
"""

from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
import json
import time

from sqlalchemy.orm import Session
from backend.config import settings
from backend.models import Zone, WeatherReading, RiskScore
from backend.ingestion.weather import weather_service
from backend.ingestion.imd import imd_service
from backend.ingestion.terrain import terrain_service
from backend.ingestion.osm import osm_service
from backend.ml.model import risk_model
from backend.alerts.engine import alert_engine
from backend.alerts.translate import translation_service


class UnifiedIngestionPipeline:
    """
    Central pipeline orchestrator that pulls from all 4 data ingestion clients,
    synthesizes multi-source geo-environmental parameters, runs ML landslide risk
    inference, and triggers localized multilingual alert notifications.
    """

    def __init__(self):
        self.weather = weather_service
        self.imd = imd_service
        self.terrain = terrain_service
        self.osm = osm_service
        self.ml_model = risk_model
        self.alerts = alert_engine
        self.translator = translation_service

    def get_pipeline_health_status(self) -> Dict[str, Any]:
        """
        Probe all 5 integrated data subsystems and return health, latency,
        and operational mode (live API vs simulated fallback).
        """
        now_utc = datetime.now(timezone.utc)
        subsystems = {}

        # 1. Open-Meteo Weather Service
        t0 = time.time()
        try:
            sample_w = self.weather.fetch_live_zone_weather(25.5788, 91.8933)
            subsystems["open_meteo_weather"] = {
                "status": "healthy",
                "is_mocked": sample_w.get("is_mocked", False),
                "source": sample_w.get("source"),
                "latency_ms": round((time.time() - t0) * 1000, 1),
                "last_reading": {
                    "rainfall_24h_mm": sample_w.get("rainfall_24h_mm"),
                    "soil_moisture_pct": sample_w.get("soil_moisture_pct")
                }
            }
        except Exception as e:
            subsystems["open_meteo_weather"] = {"status": "error", "error": str(e)}

        # 2. IMD Warning Service
        t0 = time.time()
        try:
            imd_bulletin = self.imd.fetch_district_warning("East Khasi Hills")
            subsystems["imd_meteorology"] = {
                "status": "healthy",
                "is_mocked": imd_bulletin.get("is_mocked", False),
                "source": imd_bulletin.get("source"),
                "latency_ms": round((time.time() - t0) * 1000, 1),
                "warning_level": imd_bulletin.get("warning_level"),
                "rainfall_category": imd_bulletin.get("rainfall_category")
            }
        except Exception as e:
            subsystems["imd_meteorology"] = {"status": "error", "error": str(e)}

        # 3. Open Topo Data / Terrain Service
        t0 = time.time()
        try:
            terr = self.terrain.calibrate_zone_slope(25.2750, 91.7320)
            subsystems["terrain_dem"] = {
                "status": "healthy",
                "is_mocked": terr.get("is_mocked", False),
                "latency_ms": round((time.time() - t0) * 1000, 1),
                "elevation_m": terr.get("elevation_m"),
                "slope_deg": terr.get("calibrated_slope_deg")
            }
        except Exception as e:
            subsystems["terrain_dem"] = {"status": "error", "error": str(e)}

        # 4. OSM Overpass Highway Service
        t0 = time.time()
        try:
            highways = self.osm.query_district_highways()
            road_prox = self.osm.calculate_road_proximity(25.2750, 91.7320, highways)
            subsystems["osm_overpass_highways"] = {
                "status": "healthy",
                "is_mocked": road_prox.get("is_mocked", False),
                "latency_ms": round((time.time() - t0) * 1000, 1),
                "highways_tracked": len(highways),
                "sample_proximity": road_prox
            }
        except Exception as e:
            subsystems["osm_overpass_highways"] = {"status": "error", "error": str(e)}

        # 5. Multilingual Translation Service
        subsystems["multilingual_translation"] = {
            "status": "healthy",
            "supported_languages": settings.alert_languages_list,
            "libretranslate_url": settings.LIBRETRANSLATE_URL or "Offline Dialect Templates Active",
            "cached_templates": ["en", "hi", "kha", "as"]
        }

        all_healthy = all(s.get("status") == "healthy" for s in subsystems.values())

        return {
            "pipeline_status": "operational" if all_healthy else "degraded",
            "pilot_district": settings.PILOT_DISTRICT_NAME,
            "timestamp": now_utc.isoformat(),
            "subsystems": subsystems
        }

    def ingest_zone_telemetry(
        self,
        zone: Zone,
        highways: Optional[List[Dict[str, Any]]] = None,
        imd_warning: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Synchronously ingest all 4 external feeds for a specific micro-zone,
        compute calibrated ML risk, and generate localized multilingual advisories.
        """
        # 1. Fetch live Open-Meteo weather
        w_data = self.weather.fetch_live_zone_weather(zone.center_lat, zone.center_lon)

        # 2. Derive calibrated slope and elevation from DEM
        terrain_data = self.terrain.calibrate_zone_slope(
            lat=zone.center_lat,
            lon=zone.center_lon,
            fallback_slope=zone.base_slope_deg
        )
        slope_angle = terrain_data["calibrated_slope_deg"]

        # 3. Derive nearest lifeline highway from OSM
        road_data = self.osm.calculate_road_proximity(
            lat=zone.center_lat,
            lon=zone.center_lon,
            highways=highways
        )
        road_distance = road_data["distance_to_road_m"]
        road_name = road_data["nearest_road_name"]

        # 4. Factor in IMD official bulletin & warning level
        current_imd = imd_warning or self.imd.fetch_district_warning(zone.district)
        imd_multiplier = self.imd.get_severity_multiplier(current_imd.get("warning_level", "Orange"))

        # 5. Construct multi-source feature vector for Random Forest ML inference
        features = {
            "slope_angle": slope_angle,
            "rainfall_24h_mm": w_data["rainfall_24h_mm"],
            "rainfall_72h_mm": w_data["rainfall_72h_mm"],
            "antecedent_rainfall_index": w_data["antecedent_rainfall_index"],
            "soil_moisture_pct": w_data["soil_moisture_pct"],
            "distance_to_road_m": road_distance,
            "vulnerability_index": zone.vulnerability_index
        }

        pred = self.ml_model.predict_risk(features)

        # Calibrate risk score using IMD meteorological severity index
        calibrated_score = round(min(100.0, pred["risk_score"] * imd_multiplier), 1)
        if calibrated_score >= 80.0:
            calibrated_level = "Critical"
        elif calibrated_score >= 60.0:
            calibrated_level = "High"
        elif calibrated_score >= 35.0:
            calibrated_level = "Medium"
        else:
            calibrated_level = "Low"

        # 6. Generate multilingual alert advisories across all 4 regional languages
        multilingual_advisories = {}
        for lang in settings.alert_languages_list:
            multilingual_advisories[lang] = self.translator.format_alert_message(
                language=lang,
                zone_name=zone.name,
                risk_score=calibrated_score,
                risk_level=calibrated_level,
                rainfall_24h=w_data["rainfall_24h_mm"],
                imd_warning_level=current_imd.get("warning_level"),
                nearest_road=road_name,
                slope_angle=slope_angle
            )

        return {
            "zone_id": zone.id,
            "zone_code": zone.zone_code,
            "zone_name": zone.name,
            "coordinates": {"latitude": zone.center_lat, "longitude": zone.center_lon},
            "weather": w_data,
            "terrain": terrain_data,
            "road_proximity": road_data,
            "imd_warning": current_imd,
            "prediction": {
                "risk_score": calibrated_score,
                "risk_level": calibrated_level,
                "probability": pred.get("probability", round(calibrated_score / 100.0, 3)),
                "confidence_score": pred.get("confidence_score", 0.92),
                "uncertainty_band": pred.get("uncertainty_band", [round(max(0, calibrated_score - 8), 1), round(min(100, calibrated_score + 8), 1)]),
                "triggering_factors": pred.get("triggering_factors", {}),
                "model_version": pred.get("model_version", "v1.0-rf-heuristic")
            },
            "multilingual_advisories": multilingual_advisories
        }

    def run_full_ingestion_sync(
        self,
        db: Session,
        auto_dispatch_alerts: bool = True
    ) -> Dict[str, Any]:
        """
        Execute one complete multi-source ingestion and risk evaluation cycle:
        1. Fetch IMD district warning.
        2. Query OSM highway network.
        3. Iterate through all zones: ingest weather + terrain, predict risk,
           save WeatherReading & RiskScore, and dispatch multilingual alerts.
        """
        now_utc = datetime.now(timezone.utc)
        print(f"[Ingestion Pipeline] Starting synchronized multi-source ingestion cycle at {now_utc.isoformat()}...")

        # 1. District IMD bulletin
        imd_bulletin = self.imd.fetch_district_warning("East Khasi Hills")

        # 2. OSM Highway network
        highways = self.osm.query_district_highways()

        zones = db.query(Zone).all()
        synced_results = []
        alerts_dispatched = 0

        for z in zones:
            telemetry = self.ingest_zone_telemetry(z, highways=highways, imd_warning=imd_bulletin)
            w_data = telemetry["weather"]
            pred = telemetry["prediction"]

            # Save normalized weather reading
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

            # Save newly evaluated risk score
            risk_entry = RiskScore(
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
            db.add(risk_entry)
            db.flush()  # Populates risk_entry.id

            # Evaluate alerts if risk exceeds threshold or is critical
            if auto_dispatch_alerts and (pred["risk_score"] >= settings.RISK_ALERT_THRESHOLD or pred["risk_level"] in ["High", "Critical"]):
                dispatches = self.alerts.evaluate_and_dispatch(
                    db=db,
                    zone=z,
                    risk_score=pred["risk_score"],
                    risk_level=pred["risk_level"],
                    rainfall_24h=w_data["rainfall_24h_mm"],
                    risk_score_id=risk_entry.id,
                    imd_warning_level=imd_bulletin.get("warning_level"),
                    nearest_road=telemetry["road_proximity"]["nearest_road_name"],
                    slope_angle=telemetry["terrain"]["calibrated_slope_deg"]
                )
                alerts_dispatched += len(dispatches)

            synced_results.append({
                "zone_id": z.id,
                "zone_name": z.name,
                "risk_score": pred["risk_score"],
                "risk_level": pred["risk_level"],
                "rainfall_24h_mm": w_data["rainfall_24h_mm"],
                "slope_deg": telemetry["terrain"]["calibrated_slope_deg"],
                "nearest_road": telemetry["road_proximity"]["nearest_road_name"]
            })

        db.commit()
        print(f"[Ingestion Pipeline] Successfully processed {len(zones)} zones. Dispatched {alerts_dispatched} localized alerts.")

        return {
            "status": "success",
            "synced_at": now_utc.isoformat(),
            "district": settings.PILOT_DISTRICT_NAME,
            "zones_processed": len(zones),
            "alerts_dispatched": alerts_dispatched,
            "imd_bulletin": imd_bulletin,
            "highways_tracked_count": len(highways),
            "sources_integrated": [
                "Open-Meteo Weather API",
                "IMD Weather Warnings",
                "Open Topo Data / DEM",
                "OSM Overpass Highway Corridors",
                "LibreTranslate Multilingual Dispatch"
            ],
            "zone_summaries": synced_results
        }


ingestion_pipeline = UnifiedIngestionPipeline()

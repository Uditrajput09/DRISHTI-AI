"""
backend/seed_data.py
Database initialization and automated seed loader.
Seeds East Khasi Hills zones, infrastructure, subscribers, initial weather readings,
and baseline AI risk evaluations on first launch.
"""

from typing import Dict, Any
import os
import json
from datetime import datetime, timedelta, timezone
import random

from backend.database import engine, SessionLocal, Base
from backend.models import (
    Zone,
    RiskScore,
    WeatherReading,
    FieldReport,
    AlertLog,
    InfrastructureItem,
    Subscriber
)
from backend.ingestion.weather import weather_service
from backend.ml.model import risk_model
from backend.alerts.engine import alert_engine

SEED_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "seed")


def seed_database():
    """Create all tables and populate initial datasets if empty."""
    print("[Seed Loader] Initializing database tables...")
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        now_utc = datetime.now(timezone.utc)
        # Check if already seeded
        existing_zones_count = db.query(Zone).count()
        if existing_zones_count > 0:
            print(f"[Seed Loader] Database already populated with {existing_zones_count} zones.")
            return

        print("[Seed Loader] Seeding East Khasi Hills zones from GeoJSON...")
        geojson_path = os.path.join(SEED_DIR, "east_khasi_hills_zones.geojson")
        if os.path.exists(geojson_path):
            with open(geojson_path, "r", encoding="utf-8") as f:
                geojson_data = json.load(f)

            for feat in geojson_data.get("features", []):
                props = feat.get("properties", {})
                geom = feat.get("geometry", {})

                zone = Zone(
                    zone_code=props.get("zone_id", "EKH-Z00"),
                    name=props.get("name", "Unknown Zone"),
                    district=props.get("district", "East Khasi Hills"),
                    state=props.get("state", "Meghalaya"),
                    center_lat=float(props.get("center_lat", 25.5788)),
                    center_lon=float(props.get("center_lon", 91.8933)),
                    base_slope_deg=float(props.get("base_slope_deg", 30.0)),
                    base_elevation_m=float(props.get("base_elevation_m", 1200.0)),
                    vulnerability_index=float(props.get("vulnerability_index", 0.75)),
                    soil_type=props.get("soil_type", "Clayey Loam"),
                    geology=props.get("geology", "Sandstone/Shale"),
                    geometry_json=json.dumps(geom),
                    key_roads_json=json.dumps(props.get("key_roads", [])),
                    created_at=now_utc
                )
                db.add(zone)
            db.commit()
            print(f"[Seed Loader] Seeded {len(geojson_data.get('features', []))} micro-zones.")

        # Seed Infrastructure
        infra_path = os.path.join(SEED_DIR, "infrastructure_seed.json")
        if os.path.exists(infra_path):
            with open(infra_path, "r", encoding="utf-8") as f:
                infra_data = json.load(f)

            for fac in infra_data.get("facilities", []):
                item = InfrastructureItem(
                    item_id=fac["id"],
                    name=fac["name"],
                    type=fac["type"],
                    category=fac.get("category"),
                    latitude=fac.get("lat"),
                    longitude=fac.get("lon"),
                    capacity=fac.get("capacity_beds") or fac.get("capacity_persons"),
                    contact=fac.get("contact"),
                    zone_id=fac.get("zone_id"),
                    status="Operational",
                    details_json=json.dumps(fac)
                )
                db.add(item)

            for road in infra_data.get("roads", []):
                item = InfrastructureItem(
                    item_id=road["id"],
                    name=road["name"],
                    type="road",
                    category=road.get("type"),
                    status="Operational",
                    details_json=json.dumps(road)
                )
                db.add(item)

            for evac in infra_data.get("evacuation_routes", []):
                item = InfrastructureItem(
                    item_id=evac["id"],
                    name=evac["name"],
                    type="evacuation_route",
                    category="Safe Corridor",
                    status=evac.get("status", "Clear"),
                    details_json=json.dumps(evac)
                )
                db.add(item)
            db.commit()
            print("[Seed Loader] Seeded hospitals, shelters, lifeline highways, and evacuation routes.")

        # Seed default emergency subscribers
        default_subscribers = [
            Subscriber(
                name="Meghalaya SDMA 24x7 Control Room",
                phone="+91-9436100001",
                email="sdma-control@meghalaya.gov.in",
                role="official",
                preferred_language="en",
                is_active=True
            ),
            Subscriber(
                name="PWD Hills Division Quick Response Unit",
                phone="+91-9436100002",
                email="pwd-hills-response@meghalaya.gov.in",
                role="emergency_team",
                preferred_language="kha",
                is_active=True
            ),
            Subscriber(
                name="Sohra Community Alert Dispatcher",
                phone="+91-9876543210",
                email="sohra-relief@district.gov.in",
                role="citizen",
                preferred_language="kha",
                is_active=True
            ),
            Subscriber(
                name="National Disaster Response Force (NDRF 1st Bn)",
                phone="+91-9436100003",
                email="ndrf-ner-ops@gov.in",
                role="official",
                preferred_language="hi",
                is_active=True
            )
        ]
        db.add_all(default_subscribers)
        db.commit()

        # Generate initial weather readings & compute baseline ML risk for all zones
        zones = db.query(Zone).all()
        for z in zones:
            w_data = weather_service.fetch_live_zone_weather(z.center_lat, z.center_lon)

            # Weather reading
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

            # Compute AI Risk
            feat = {
                "slope_angle": z.base_slope_deg,
                "rainfall_24h_mm": w_data["rainfall_24h_mm"],
                "rainfall_72h_mm": w_data["rainfall_72h_mm"],
                "antecedent_rainfall_index": w_data["antecedent_rainfall_index"],
                "soil_moisture_pct": w_data["soil_moisture_pct"],
                "distance_to_road_m": 10.0 if "Highway" in str(z.key_roads_json) else 25.0,
                "vulnerability_index": z.vulnerability_index
            }
            pred = risk_model.predict_risk(feat)

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

        db.commit()

        # Seed sample verified field reports
        sample_reports = [
            FieldReport(
                report_uid="REP-DEMO-001",
                zone_id=1,
                reporter_type="official",
                reporter_name="Inspector B. Marbaniang (PWD Hills)",
                reporter_contact="+91-9436100010",
                latitude=25.2750,
                longitude=91.7320,
                hazard_type="Debris Flow / Mudslide",
                severity="Critical",
                description="Heavy debris flow across SH-5 km 42. Road blocked by boulder scree and water saturation. Excavator deployed.",
                photo_data_url="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=600&q=80",
                status="verified",
                synced=True,
                device_created_at=now_utc - timedelta(hours=2),
                server_received_at=now_utc - timedelta(hours=2)
            ),
            FieldReport(
                report_uid="REP-DEMO-002",
                zone_id=3,
                reporter_type="citizen",
                reporter_name="Dapbiang Lyngdoh",
                reporter_contact="+91-9862100020",
                latitude=25.6540,
                longitude=91.9560,
                hazard_type="Tension Cracks on Cut-Slope",
                severity="Moderate",
                description="Noticed 15cm wide ground fissures expanding along the upper slope near Shillong Bypass overpass.",
                photo_data_url="https://images.unsplash.com/photo-1590486803833-1c5dc8ddd4c8?auto=format&fit=crop&w=600&q=80",
                status="submitted",
                synced=True,
                device_created_at=now_utc - timedelta(minutes=45),
                server_received_at=now_utc - timedelta(minutes=45)
            )
        ]
        db.add_all(sample_reports)
        db.commit()


        # Trigger initial baseline alert log for highest risk zone
        high_zone = db.query(Zone).filter(Zone.zone_code == "EKH-Z01").first()
        if high_zone:
            alert_engine.evaluate_and_dispatch(
                db=db,
                zone=high_zone,
                risk_score=86.5,
                risk_level="Critical",
                rainfall_24h=145.2,
                force_dispatch=True
            )

        print("[Seed Loader] Database seeding completed successfully.")

    except Exception as e:
        db.rollback()
        print(f"[Seed Loader Error] Seeding failed: {e}")
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()

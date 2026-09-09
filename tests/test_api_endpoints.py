"""
tests/test_api_endpoints.py
Automated end-to-end API and ML validation tests for DRISHTI-AI.
"""

import pytest
from fastapi.testclient import TestClient
from backend.main import app
from backend.ml.model import risk_model

client = TestClient(app)


def test_root_endpoint():
    resp = client.get("/")
    assert resp.status_code == 200
    data = resp.json()
    assert data["project"] == "DRISHTI-AI Landslide Early Warning System"
    assert "East Khasi Hills" in data["pilot_district"]


def test_health_check():
    resp = client.get("/api/health")
    assert resp.status_code == 200
    assert resp.json()["status"] == "healthy"


def test_risk_summary():
    resp = client.get("/api/risk/summary")
    assert resp.status_code == 200
    data = resp.json()
    assert data["total_zones_monitored"] > 0
    assert "overall_status" in data


def test_get_zones():
    resp = client.get("/api/risk/zones")
    assert resp.status_code == 200
    zones = resp.json()
    assert len(zones) >= 5
    first_zone = zones[0]
    assert "risk_score" in first_zone
    assert "triggering_factors" in first_zone
    assert first_zone["geometry"] is not None


def test_risk_simulation():
    req = {
        "simulated_hourly_rainfall_mm": 110.0,
        "simulated_duration_hours": 6,
        "simulated_soil_moisture_pct": 95.0,
        "trigger_alerts": False
    }
    resp = client.post("/api/risk/simulate", json=req)
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "success"
    assert len(data["results"]) > 0
    assert data["results"][0]["risk_score"] > 60.0


def test_weather_endpoints():
    resp = client.get("/api/weather/current")
    assert resp.status_code == 200
    data = resp.json()
    assert "readings" in data
    assert "imd_bulletin" in data


def test_field_report_submission_and_sync():
    import uuid

    # 1. Submit single report
    rep = {
        "reporter_type": "official",
        "reporter_name": "Test Officer",
        "latitude": 25.2750,
        "longitude": 91.7320,
        "hazard_type": "Debris Flow",
        "severity": "Critical",
        "description": "Automated test incident"
    }
    resp = client.post("/api/reports/submit", json=rep)
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "success"
    assert "report_uid" in data

    # 2. Batch sync test with unique ID
    unique_uid = f"TEST-OFFLINE-{uuid.uuid4().hex[:8].upper()}"
    batch_req = {
        "reports": [
            {
                "report_uid": unique_uid,
                "reporter_type": "citizen",
                "latitude": 25.3000,
                "longitude": 91.5800,
                "hazard_type": "Soil Creep",
                "severity": "Moderate",
                "description": "Batch sync test item"
            }
        ]
    }
    sync_resp = client.post("/api/reports/sync-queue", json=batch_req)
    assert sync_resp.status_code == 200
    assert sync_resp.json()["synced_count"] >= 1



def test_alerts_history():
    resp = client.get("/api/alerts/history")
    assert resp.status_code == 200
    alerts = resp.json()
    assert isinstance(alerts, list)


def test_optional_api_keys_are_treated_as_unset():
    from backend.config import Settings

    settings = Settings(
        FAST2SMS_API_KEY="",
        FIREBASE_API_KEY="YOUR_FIREBASE_KEY_HERE",
        LIBRETRANSLATE_API_KEY="none",
        OPENTOPOGRAPHY_API_KEY="   ",
    )

    assert settings.get_optional_api_key("FAST2SMS_API_KEY") == ""
    assert settings.get_optional_api_key("FIREBASE_API_KEY") == ""
    assert settings.get_optional_api_key("LIBRETRANSLATE_API_KEY") == ""
    assert settings.get_optional_api_key("OPENTOPOGRAPHY_API_KEY") == ""


def test_infrastructure_endpoints():
    resp = client.get("/api/infrastructure/facilities")
    assert resp.status_code == 200
    assert len(resp.json()) > 0

    roads_resp = client.get("/api/infrastructure/roads")
    assert roads_resp.status_code == 200
    assert len(roads_resp.json()) > 0


def test_risk_confidence_score():
    """Verify ML inter-tree variance, confidence score, and uncertainty bounds."""
    # Direct model verification
    feat = {
        "slope_angle": 38.5,
        "rainfall_24h_mm": 110.0,
        "rainfall_72h_mm": 210.0,
        "antecedent_rainfall_index": 140.0,
        "soil_moisture_pct": 88.0,
        "distance_to_road_m": 12.0,
        "vulnerability_index": 0.75
    }
    pred = risk_model.predict_risk(feat)
    assert "confidence_score" in pred
    assert "uncertainty_band" in pred
    assert pred["confidence_score"] is not None
    assert 0.0 <= pred["confidence_score"] <= 1.0
    band = pred["uncertainty_band"]
    assert isinstance(band, list) and len(band) == 2
    assert band[0] <= band[1]

    # Endpoint simulation verification
    req = {
        "simulated_hourly_rainfall_mm": 95.0,
        "simulated_duration_hours": 4,
        "simulated_soil_moisture_pct": 82.0,
        "trigger_alerts": False
    }
    resp = client.post("/api/risk/simulate", json=req)
    assert resp.status_code == 200
    data = resp.json()
    assert len(data["results"]) > 0
    first = data["results"][0]
    assert "confidence_score" in first
    assert "uncertainty_band" in first
    assert first["confidence_score"] is not None


def test_cluster_hotspots():
    """Verify DBSCAN geo-clustering and hotspot detection endpoints."""
    # 1. Hotspots GeoJSON
    resp = client.get("/api/clusters/hotspots")
    assert resp.status_code == 200
    geojson = resp.json()
    assert geojson["type"] == "FeatureCollection"
    assert "features" in geojson
    assert "summary" in geojson
    assert "total_reports" in geojson["summary"]

    # 2. Report confidence list
    resp_conf = client.get("/api/clusters/report-confidence")
    assert resp_conf.status_code == 200
    assert isinstance(resp_conf.json(), list)


def test_cap_xml_export():
    """Verify OASIS CAP v1.2 XML emergency alert export and Atom feed."""
    # 1. Latest alert in CAP XML
    resp = client.get("/api/alerts/cap/latest")
    assert resp.status_code == 200
    assert "text/xml" in resp.headers.get("content-type", "")
    content = resp.text
    assert "<alert" in content
    assert "urn:oasis:names:tc:emergency:cap:1.2" in content
    assert "<identifier>" in content
    assert "<info>" in content
    assert "<severity>" in content

    # 2. Atom syndication feed
    feed_resp = client.get("/api/alerts/cap/feed")
    assert feed_resp.status_code == 200
    assert "<feed" in feed_resp.text


def test_download_apk():
    """Verify Android APK binary package download endpoint."""
    resp = client.get("/api/download/apk")
    assert resp.status_code == 200
    assert resp.headers.get("content-type") == "application/vnd.android.package-archive"
    assert "drishti-ai-v1.0.apk" in resp.headers.get("content-disposition", "")
    # Verify non-trivial binary APK payload
    content = resp.content
    assert len(content) > 1000000  # > 1MB
    assert content[:2] == b"PK"  # Valid ZIP/APK magic header


def test_get_apk_info():
    """Verify Android APK release metadata and SHA-256 fingerprint endpoint."""
    resp = client.get("/api/download/apk/info")
    assert resp.status_code == 200
    data = resp.json()
    assert data["app_name"] == "DRISHTI-AI Citizen Mobile & Field Reporter"
    assert data["package_name"] == "ai.drishti.landslide"
    assert "drishti-ai-v1.0.apk" in data["file_name"]
    assert "sha256" in data
    assert len(data["sha256"]) == 64
    assert "target_sdk" in data


def test_ingestion_status():
    """Verify unified data ingestion pipeline health diagnostics for all 5 subsystems."""
    resp = client.get("/api/ingestion/status")
    assert resp.status_code == 200
    data = resp.json()
    assert "pipeline_status" in data
    assert "subsystems" in data
    subs = data["subsystems"]
    assert "open_meteo_weather" in subs
    assert "imd_meteorology" in subs
    assert "terrain_dem" in subs
    assert "osm_overpass_highways" in subs
    assert "multilingual_translation" in subs
    assert subs["multilingual_translation"]["status"] == "healthy"


def test_ingestion_sync():
    """Verify on-demand execution of the full multi-source ingestion pipeline."""
    resp = client.post("/api/ingestion/sync?dispatch_alerts=false")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "success"
    assert data["zones_processed"] > 0
    assert len(data["sources_integrated"]) == 5
    assert len(data["zone_summaries"]) > 0
    first_summary = data["zone_summaries"][0]
    assert "risk_score" in first_summary
    assert "slope_deg" in first_summary
    assert "nearest_road" in first_summary


def test_ingestion_preview():
    """Verify multi-source telemetry snapshot with 4-language localized alerts."""
    resp = client.get("/api/ingestion/preview/1")
    assert resp.status_code == 200
    data = resp.json()
    assert data["zone_id"] == 1
    assert "weather" in data
    assert "terrain" in data
    assert "road_proximity" in data
    assert "imd_warning" in data
    assert "prediction" in data
    assert "multilingual_advisories" in data

    # Verify all 4 regional languages generated
    advisories = data["multilingual_advisories"]
    assert "en" in advisories
    assert "hi" in advisories
    assert "kha" in advisories
    assert "as" in advisories

    # Verify terrain slope and highway proximity incorporated
    assert data["terrain"]["calibrated_slope_deg"] > 0
    assert data["road_proximity"]["distance_to_road_m"] > 0


def test_ingestion_feeds():
    """Verify direct OSM highway network and IMD warning feeds."""
    hw_resp = client.get("/api/ingestion/highways")
    assert hw_resp.status_code == 200
    assert hw_resp.json()["count"] > 0

    imd_resp = client.get("/api/ingestion/imd")
    assert imd_resp.status_code == 200
    assert "warning_level" in imd_resp.json()


def test_tourist_hotspots_and_evacuation_planner():
    """Verify tourist hotspots catalog and real-time hazard-aware evacuation planner."""
    # 1. Hotspots list
    hotspots_resp = client.get("/api/infrastructure/tourist-hotspots")
    assert hotspots_resp.status_code == 200
    hotspots = hotspots_resp.json()
    assert len(hotspots) >= 5
    assert any("Nohkalikai" in h["name"] for h in hotspots)

    # 2. Plan evacuation from Nohkalikai Falls (Sohra)
    plan_payload = {
        "current_lat": 25.2755,
        "current_lon": 91.6853,
        "preferred_type": "all",
        "max_distance_km": 40.0
    }
    plan_resp = client.post("/api/infrastructure/plan-evacuation", json=plan_payload)
    assert plan_resp.status_code == 200
    plan = plan_resp.json()

    assert plan["success"] is True
    assert "target_facility" in plan
    assert "nearest_shelter" in plan
    assert "nearest_hospital" in plan
    assert len(plan["facilities"]) > 0

    # Verify evacuation route details
    route = plan["evacuation_route"]
    assert route["total_distance_km"] > 0
    assert route["estimated_drive_min"] > 0
    assert len(route["waypoints"]) >= 3
    assert len(route["steps"]) >= 2
    assert "avoided_hazards" in route

    # Verify emergency contacts
    contacts = plan["emergency_contacts"]
    assert "state_disaster_control" in contacts
    assert "sdrf_meghalaya" in contacts





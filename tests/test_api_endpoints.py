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

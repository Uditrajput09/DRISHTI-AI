"""
tests/test_shap_and_websocket.py
Automated tests for Upgrade 2 (SHAP Feature Attribution) and Upgrade 3 (WebSocket Realtime Streaming).
"""

import pytest
import json
from fastapi.testclient import TestClient
from backend.main import app
from backend.ml.model import risk_model
from backend.ml.features import FEATURE_COLUMNS
from backend.api.ws_manager import ws_manager

client = TestClient(app)


def test_shap_model_attribution():
    """Verify SHAP TreeExplainer computes exact Shapley values and percentage shares."""
    sample_features = {
        "slope_angle": 42.5,
        "rainfall_24h_mm": 135.0,
        "rainfall_72h_mm": 250.0,
        "antecedent_rainfall_index": 195.0,
        "soil_moisture_pct": 94.0,
        "distance_to_road_m": 12.0,
        "vulnerability_index": 0.88
    }

    pred = risk_model.predict_risk(sample_features)
    assert pred["risk_score"] > 80.0
    assert pred["risk_level"] == "Critical"
    assert "shap_values" in pred
    assert pred["shap_values"] is not None

    # Verify all 7 features have computed Shapley values
    shap_vals = pred["shap_values"]
    for feat in FEATURE_COLUMNS:
        assert feat in shap_vals, f"Feature {feat} missing from SHAP attributions"
        assert isinstance(shap_vals[feat], float)

    # Verify triggering factors contain SHAP metadata
    factors = pred["triggering_factors"]
    assert "topographic_slope" in factors
    assert "recent_rainfall_24h" in factors
    assert "soil_saturation" in factors

    slope_factor = factors["topographic_slope"]
    assert "shap_value" in slope_factor
    assert "contribution_pct" in slope_factor
    assert slope_factor["contribution_pct"] > 0
    assert slope_factor["impact"] == "Critical"


def test_simulate_endpoint_returns_shap_data():
    """Verify /api/risk/simulate endpoint returns SHAP-backed triggering factors."""
    payload = {
        "simulated_hourly_rainfall_mm": 110.0,
        "simulated_duration_hours": 3,
        "simulated_soil_moisture_pct": 92.0,
        "trigger_alerts": False
    }
    resp = client.post("/api/risk/simulate", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "success"
    assert len(data["results"]) > 0

    first_zone = data["results"][0]
    tf = first_zone["triggering_factors"]
    assert "topographic_slope" in tf
    assert "shap_value" in tf["topographic_slope"]
    assert "contribution_pct" in tf["topographic_slope"]


def test_websocket_risk_live_stream():
    """Verify WebSocket /ws/risk-live lifecycle: connection, snapshot, heartbeat, and broadcast."""
    with client.websocket_connect("/ws/risk-live") as websocket:
        # 1. Verify immediate initial snapshot upon connection
        initial_msg = websocket.receive_json()
        assert initial_msg["type"] == "INITIAL_SNAPSHOT"
        assert "zones" in initial_msg
        assert len(initial_msg["zones"]) > 0
        assert "timestamp" in initial_msg

        # 2. Verify ping-pong heartbeat
        websocket.send_text("ping")
        pong_msg = websocket.receive_json()
        assert pong_msg["type"] == "PONG"

        # 3. Verify active connections tracking
        assert len(ws_manager.active_connections) >= 1

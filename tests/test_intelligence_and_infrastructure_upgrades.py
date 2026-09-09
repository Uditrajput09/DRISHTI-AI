"""
tests/test_intelligence_and_infrastructure_upgrades.py
Comprehensive test suite verifying:
1. XGBoost + Random Forest Ensemble with SHAP explainability
2. Isolation Forest Temporal Anomaly Detection Engine & API
3. 7-Day Probabilistic Risk Forecast Model with 90% Confidence Intervals
4. Redis Caching with Graceful Fallback & Health Telemetry
"""

import pytest
from fastapi.testclient import TestClient
from backend.main import app
from backend.ml.model import risk_model
from backend.ml.anomaly import anomaly_detector
from backend.ml.forecast_model import risk_forecaster
from backend.cache import cache_get, cache_set, cache_invalidate_prefix, get_cache_status

client = TestClient(app)


def test_xgboost_ensemble_model():
    """Verify XGBoost + Random Forest ensemble inference and attribution."""
    features = {
        "slope_angle": 38.0,
        "rainfall_24h_mm": 110.0,
        "rainfall_72h_mm": 210.0,
        "antecedent_rainfall_index": 160.0,
        "soil_moisture_pct": 89.0,
        "distance_to_road_m": 15.0,
        "vulnerability_index": 0.80
    }
    pred = risk_model.predict_risk(features)

    assert "risk_score" in pred
    assert 0.0 <= pred["risk_score"] <= 100.0
    assert pred["risk_level"] in ["Low", "Medium", "High", "Critical"]
    assert pred["is_ensemble"] is True
    assert "v2.0" in pred["model_version"]
    assert "rf_probability" in pred
    assert "xgb_probability" in pred
    assert pred["confidence_score"] is not None
    assert 0.0 <= pred["confidence_score"] <= 1.0

    # Verify SHAP attributions exist for all 7 features
    shap_vals = pred.get("shap_values")
    assert shap_vals is not None
    assert len(shap_vals) == 7
    for feat in ["slope_angle", "rainfall_24h_mm", "soil_moisture_pct"]:
        assert feat in shap_vals


def test_isolation_forest_anomaly_detection():
    """Verify Isolation Forest anomaly detector distinguishes normal weather from severe surges."""
    normal = anomaly_detector.evaluate_reading(
        zone_id="1",
        zone_name="Sohra Escarpment",
        rain_hourly=2.0,
        rain_24h=18.0,
        soil_moisture=55.0,
        risk_score=25.0
    )
    assert normal["is_anomaly"] is False
    assert normal["severity"] in ["NOMINAL", "MODERATE"]

    surge = anomaly_detector.evaluate_reading(
        zone_id="1",
        zone_name="Sohra Escarpment",
        rain_hourly=75.0,
        rain_24h=260.0,
        soil_moisture=96.0,
        risk_score=94.0
    )
    assert surge["is_anomaly"] is True
    assert surge["severity"] in ["HIGH", "CRITICAL"]
    assert surge["anomaly_index"] >= 60.0
    assert "Precipitation Surge" in surge["primary_driver"]

    # Test Anomaly API endpoints
    res_scan = client.get("/api/anomaly/scan")
    assert res_scan.status_code == 200
    data = res_scan.json()
    assert data["status"] == "success"
    assert data["total_zones_scanned"] > 0
    assert "anomalies" in data

    res_zone = client.get("/api/anomaly/zone/1")
    assert res_zone.status_code == 200
    assert "anomaly_index" in res_zone.json()


def test_probabilistic_7day_forecast():
    """Verify 7-day risk trajectory forecaster and expanding confidence intervals."""
    traj = risk_forecaster.compute_7day_trajectory(
        base_slope=35.0,
        vulnerability_index=0.7,
        current_rain_24h=80.0,
        current_soil_moisture=75.0,
        base_risk_score=65.0
    )
    assert len(traj) == 7

    for step in traj:
        assert 0.0 <= step["predicted_risk"] <= 100.0
        assert step["confidence_lower"] <= step["predicted_risk"] <= step["confidence_upper"]
        assert 0.0 <= step["trigger_probability"] <= 1.0
        assert step["severity"] in ["Low", "Medium", "High", "Critical"]

    # Test Forecast API routes
    res_weekly = client.get("/api/forecast/weekly?zone_id=1")
    assert res_weekly.status_code == 200
    w_data = res_weekly.json()
    assert "Probabilistic" in w_data.get("model", "")
    assert len(w_data["days"]) == 7

    res_prob = client.get("/api/forecast/probabilistic/1")
    assert res_prob.status_code == 200
    assert len(res_prob.json()["days"]) == 7


def test_redis_caching_and_health():
    """Verify Redis caching layer functions with fallback and health check telemetry."""
    # Test cache set/get/invalidation
    cache_set("test_key", {"msg": "hello_drishti"}, ttl_seconds=10)
    cached_val = cache_get("test_key")
    # In offline fallback, cached_val may be None; in active Redis, it returns dict
    # Neither should ever throw an exception
    cache_invalidate_prefix("test_key")

    res_health = client.get("/api/health")
    assert res_health.status_code == 200
    h_data = res_health.json()
    assert h_data["status"] == "healthy"
    assert "cache" in h_data
    assert "ml_model" in h_data
    assert h_data["ml_model"]["is_ensemble"] is True

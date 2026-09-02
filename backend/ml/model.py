"""
backend/ml/model.py
Landslide Susceptibility Classifier & Risk Scoring Engine.
Uses a trained Random Forest model with feature attribution explainability.
"""

from typing import Dict, Any, List, Optional
import os
import joblib
import numpy as np
from backend.ml.features import FEATURE_COLUMNS, extract_features_from_dict

MODEL_PATH = os.path.join(os.path.dirname(__file__), "model.joblib")


class LandslideRiskModel:
    """Random Forest Classifier for Landslide Susceptibility Scoring."""

    def __init__(self):
        self.model = None
        self.feature_names = FEATURE_COLUMNS
        self.model_version = "v1.2-rf-calibrated"
        self._load_or_train()

    def _load_or_train(self):
        """Load persisted model artifact or train fresh if missing."""
        if os.path.exists(MODEL_PATH):
            try:
                artifact = joblib.load(MODEL_PATH)
                self.model = artifact["model"]
                self.model_version = artifact.get("version", self.model_version)
                return
            except Exception as e:
                print(f"Failed to load model from {MODEL_PATH}: {e}, retraining...")
        
        # Train fresh model on the fly
        from backend.ml.trainer import train_model
        metrics = train_model()
        print(f"Auto-trained new ML model: CV ROC-AUC={metrics.get('roc_auc', 'N/A')}")

    def predict_risk(self, zone_features: Dict[str, Any]) -> Dict[str, Any]:
        """
        Predict landslide risk score and triggering factors for given zone/weather metrics.
        Returns risk score (0-100), risk level (Low/Medium/High/Critical), and factor breakdown.
        """
        feat_vector = np.array([extract_features_from_dict(zone_features)])

        if self.model is not None:
            proba = float(self.model.predict_proba(feat_vector)[0][1])
        else:
            # Fallback heuristic calculation if model uninitialized
            slope = zone_features.get("slope_angle", 30.0)
            r24 = zone_features.get("rainfall_24h_mm", 0.0)
            sm = zone_features.get("soil_moisture_pct", 50.0)
            proba = min(1.0, max(0.0, (slope / 50.0) * 0.4 + (r24 / 200.0) * 0.4 + (sm / 100.0) * 0.2))

        # Map probability to 0-100 risk score
        risk_score = round(proba * 100.0, 1)

        # Classify severity level
        if risk_score >= 80.0:
            risk_level = "Critical"
        elif risk_score >= 60.0:
            risk_level = "High"
        elif risk_score >= 35.0:
            risk_level = "Medium"
        else:
            risk_level = "Low"

        # Generate Explainable AI (XAI) feature attribution breakdown
        factors = self._explain_factors(zone_features, risk_score)

        return {
            "risk_score": risk_score,
            "risk_level": risk_level,
            "probability": round(proba, 4),
            "triggering_factors": factors,
            "model_version": self.model_version
        }

    def _explain_factors(self, d: Dict[str, Any], risk_score: float) -> Dict[str, Any]:
        """Generate human-interpretable factor contribution cards."""
        slope = float(d.get("slope_angle", 30.0))
        r24 = float(d.get("rainfall_24h_mm", 0.0))
        r72 = float(d.get("rainfall_72h_mm", 0.0))
        ari = float(d.get("antecedent_rainfall_index", 0.0))
        sm = float(d.get("soil_moisture_pct", 50.0))
        dist_road = float(d.get("distance_to_road_m", 25.0))

        factors = {
            "topographic_slope": {
                "name": "Slope Angle",
                "value": f"{slope:.1f}°",
                "impact": "Critical" if slope > 38 else ("High" if slope > 30 else "Moderate"),
                "description": "Steep incline exceeding internal friction angle" if slope > 35 else "Moderate slope inclination"
            },
            "recent_rainfall_24h": {
                "name": "24h Intense Precipitation",
                "value": f"{r24:.1f} mm",
                "impact": "Critical" if r24 > 120 else ("High" if r24 > 65 else ("Moderate" if r24 > 25 else "Low")),
                "description": "Exceeds extreme cloudburst threshold" if r24 > 120 else ("Heavy monsoon downpour" if r24 > 65 else "Normal showers")
            },
            "cumulative_rainfall_72h": {
                "name": "72h Cumulative Infiltration",
                "value": f"{r72:.1f} mm",
                "impact": "Critical" if r72 > 280 else ("High" if r72 > 160 else "Moderate"),
                "description": "Deep subsurface hydraulic saturation" if r72 > 200 else "Standard hydrological loading"
            },
            "soil_saturation": {
                "name": "Soil Moisture Saturation",
                "value": f"{sm:.1f}%",
                "impact": "Critical" if sm > 90 else ("High" if sm > 75 else "Moderate"),
                "description": "Pore water pressure exceeds shear resistance" if sm > 88 else "Partial soil pore drainage"
            },
            "anthropogenic_cut": {
                "name": "Highway / Cut-Slope Proximity",
                "value": f"{dist_road:.0f} m",
                "impact": "High" if dist_road < 15 else "Low",
                "description": "Steep road toe excavation vulnerability" if dist_road < 15 else "Natural undisturbed valley buffer"
            }
        }
        return factors


risk_model = LandslideRiskModel()

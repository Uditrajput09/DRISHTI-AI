"""
backend/ml/model.py
Landslide Susceptibility Classifier & Risk Scoring Engine.
Uses a trained Random Forest + XGBoost Ensemble with mathematically rigorous SHAP (TreeExplainer)
feature attribution, model agreement scoring, and uncertainty quantification.
"""

from typing import Dict, Any, List, Optional
import os
import joblib
import numpy as np
import shap
from backend.ml.features import FEATURE_COLUMNS, extract_features_from_dict

MODEL_PATH = os.path.join(os.path.dirname(__file__), "model.joblib")


class LandslideRiskModel:
    """Ensemble Classifier (Random Forest + XGBoost) for Landslide Susceptibility with SHAP Explainability."""

    def __init__(self):
        self.model = None
        self.xgb_model = None
        self.is_ensemble = False
        self.explainer = None
        self.feature_names = FEATURE_COLUMNS
        self.model_version = "v2.0-rf-xgb-ensemble"
        self._load_or_train()

    def _load_or_train(self):
        """Load persisted model artifact or train fresh if missing, then initialize SHAP explainer."""
        if os.path.exists(MODEL_PATH):
            try:
                artifact = joblib.load(MODEL_PATH)
                self.model = artifact.get("model")
                self.xgb_model = artifact.get("xgb_model")
                self.is_ensemble = artifact.get("is_ensemble", self.xgb_model is not None)
                self.model_version = artifact.get("version", self.model_version)
                self._init_shap_explainer()
                return
            except Exception as e:
                print(f"Failed to load model from {MODEL_PATH}: {e}, retraining...")

        # Train fresh model on the fly
        from backend.ml.trainer import train_model
        metrics = train_model()
        artifact = joblib.load(MODEL_PATH)
        self.model = artifact.get("model")
        self.xgb_model = artifact.get("xgb_model")
        self.is_ensemble = artifact.get("is_ensemble", self.xgb_model is not None)
        self.model_version = artifact.get("version", self.model_version)
        self._init_shap_explainer()
        print(f"Auto-trained new ML model: CV ROC-AUC={metrics.get('roc_auc', 'N/A')}")

    def _init_shap_explainer(self):
        """Initialize SHAP TreeExplainer for instantaneous exact Shapley value computation."""
        if self.model is not None:
            try:
                self.explainer = shap.TreeExplainer(self.model)
                print("[SHAP] TreeExplainer successfully initialized for Random Forest model.")
            except Exception as e:
                print(f"[SHAP Warning] Failed to initialize TreeExplainer: {e}")
                self.explainer = None

    def compute_shap_values(self, feat_vector: np.ndarray) -> Optional[Dict[str, float]]:
        """Compute exact class-1 (landslide probability) Shapley values for input features."""
        if self.explainer is None:
            return None
        try:
            raw_shap = self.explainer.shap_values(feat_vector)
            # Handle variations across SHAP versions (list of 2 classes vs 3D ndarray)
            if isinstance(raw_shap, list):
                c1 = raw_shap[1][0] if len(raw_shap) > 1 else raw_shap[0][0]
            elif hasattr(raw_shap, "shape") and len(raw_shap.shape) == 3:
                c1 = raw_shap[0, :, 1]
            else:
                c1 = raw_shap[0]

            return {
                feat: round(float(c1[idx]), 4)
                for idx, feat in enumerate(self.feature_names)
            }
        except Exception as exc:
            print(f"[SHAP Warning] Computation failed: {exc}")
            return None

    def predict_risk(self, zone_features: Dict[str, Any]) -> Dict[str, Any]:
        """
        Predict landslide risk score and triggering factors for given zone/weather metrics.
        Combines Random Forest and XGBoost predictions with soft-voting ensemble.
        Returns risk score (0-100), risk level (Low/Medium/High/Critical), and factor breakdown.
        """
        raw_vector = extract_features_from_dict(zone_features)
        feat_vector = np.array([raw_vector])

        confidence_score = None
        uncertainty_band = None
        model_std = None
        rf_proba = None
        xgb_proba = None

        if self.model is not None:
            rf_proba = float(self.model.predict_proba(feat_vector)[0][1])

            # XGBoost prediction if present in ensemble
            if self.xgb_model is not None:
                try:
                    xgb_proba = float(self.xgb_model.predict_proba(feat_vector)[0][1])
                    proba = 0.5 * rf_proba + 0.5 * xgb_proba
                except Exception as exc:
                    print(f"[Model Warning] XGBoost inference fallback: {exc}")
                    proba = rf_proba
            else:
                proba = rf_proba

            # Inter-tree variance calculation across Random Forest estimators
            if hasattr(self.model, "estimators_") and len(self.model.estimators_) > 0:
                tree_probas = np.array([
                    float(tree.predict_proba(feat_vector)[0][1])
                    for tree in self.model.estimators_
                ])
                tree_std = float(np.std(tree_probas))

                # If XGBoost is available, also incorporate inter-model divergence
                if xgb_proba is not None:
                    inter_model_diff = abs(rf_proba - xgb_proba)
                    effective_std = (tree_std * 0.7) + (inter_model_diff * 0.3)
                else:
                    effective_std = tree_std

                # Inter-tree and inter-model variance mapped to confidence score (0.0 to 1.0)
                confidence_score = round(max(0.0, min(1.0, 1.0 - effective_std * 2.8)), 3)
                lower = round(max(0.0, proba - 1.5 * effective_std), 3)
                upper = round(min(1.0, proba + 1.5 * effective_std), 3)
                uncertainty_band = [lower, upper]
                model_std = round(effective_std, 4)
        else:
            # Fallback heuristic calculation if model uninitialized
            # MOCKED: heuristic fallback when ML model artifact is unavailable
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

        # Compute SHAP Shapley values
        shap_dict = self.compute_shap_values(feat_vector)

        # Generate Explainable AI (XAI) feature attribution breakdown
        factors = self._explain_factors(zone_features, risk_score, shap_dict)

        result = {
            "risk_score": risk_score,
            "risk_level": risk_level,
            "probability": round(proba, 4),
            "confidence_score": confidence_score,
            "uncertainty_band": uncertainty_band,
            "model_std": model_std,
            "triggering_factors": factors,
            "shap_values": shap_dict,
            "model_version": self.model_version,
            "is_ensemble": self.is_ensemble
        }

        if rf_proba is not None:
            result["rf_probability"] = round(rf_proba, 4)
        if xgb_proba is not None:
            result["xgb_probability"] = round(xgb_proba, 4)

        return result

    def _explain_factors(
        self,
        d: Dict[str, Any],
        risk_score: float,
        shap_dict: Optional[Dict[str, float]] = None
    ) -> Dict[str, Any]:
        """Generate human-interpretable factor contribution cards backed by SHAP."""
        slope = float(d.get("slope_angle", 30.0))
        r24 = float(d.get("rainfall_24h_mm", 0.0))
        r72 = float(d.get("rainfall_72h_mm", 0.0))
        ari = float(d.get("antecedent_rainfall_index", 0.0))
        sm = float(d.get("soil_moisture_pct", 50.0))
        dist_road = float(d.get("distance_to_road_m", 25.0))
        vuln = float(d.get("vulnerability_index", 0.70))

        # Calculate relative percentage contributions from SHAP if available
        if shap_dict:
            # Positive contribution to landslide failure risk
            abs_sum = sum(abs(v) for v in shap_dict.values())
            if abs_sum > 0:
                pcts = {k: round((abs(v) / abs_sum) * 100.0, 1) for k, v in shap_dict.items()}
            else:
                pcts = {k: 14.3 for k in shap_dict}
        else:
            pcts = {
                "slope_angle": 28.0,
                "rainfall_24h_mm": 32.0,
                "rainfall_72h_mm": 16.0,
                "antecedent_rainfall_index": 10.0,
                "soil_moisture_pct": 20.0,
                "distance_to_road_m": 8.0,
                "vulnerability_index": 6.0
            }

        # Topographic slope
        slope_shap = shap_dict.get("slope_angle", 0.0) if shap_dict else 0.0
        slope_pct = pcts.get("slope_angle", 28.0)
        slope_impact = "Critical" if slope > 38 else ("High" if slope > 30 else "Moderate")

        # 24h Rainfall
        r24_shap = shap_dict.get("rainfall_24h_mm", 0.0) if shap_dict else 0.0
        r24_pct = pcts.get("rainfall_24h_mm", 32.0)
        r24_impact = "Critical" if r24 > 120 else ("High" if r24 > 65 else ("Moderate" if r24 > 25 else "Low"))

        # 72h Rainfall
        r72_shap = shap_dict.get("rainfall_72h_mm", 0.0) if shap_dict else 0.0
        r72_pct = pcts.get("rainfall_72h_mm", 16.0)
        r72_impact = "Critical" if r72 > 280 else ("High" if r72 > 160 else "Moderate")

        # Soil moisture
        sm_shap = shap_dict.get("soil_moisture_pct", 0.0) if shap_dict else 0.0
        sm_pct = pcts.get("soil_moisture_pct", 20.0)
        sm_impact = "Critical" if sm > 90 else ("High" if sm > 75 else "Moderate")

        # Road proximity
        road_shap = shap_dict.get("distance_to_road_m", 0.0) if shap_dict else 0.0
        road_pct = pcts.get("distance_to_road_m", 8.0)
        road_impact = "High" if dist_road < 15 else "Low"

        # Antecedent Rainfall Index
        ari_shap = shap_dict.get("antecedent_rainfall_index", 0.0) if shap_dict else 0.0
        ari_pct = pcts.get("antecedent_rainfall_index", 10.0)
        ari_impact = "High" if ari > 140 else "Moderate"

        factors = {
            "topographic_slope": {
                "name": "Slope Angle",
                "feature_key": "slope_angle",
                "value": f"{slope:.1f}°",
                "impact": slope_impact,
                "shap_value": slope_shap,
                "contribution_pct": slope_pct,
                "description": "Steep incline exceeding internal friction angle" if slope > 35 else "Moderate slope inclination"
            },
            "recent_rainfall_24h": {
                "name": "24h Intense Precipitation",
                "feature_key": "rainfall_24h_mm",
                "value": f"{r24:.1f} mm",
                "impact": r24_impact,
                "shap_value": r24_shap,
                "contribution_pct": r24_pct,
                "description": "Exceeds extreme cloudburst threshold" if r24 > 120 else ("Heavy monsoon downpour" if r24 > 65 else "Normal showers")
            },
            "cumulative_rainfall_72h": {
                "name": "72h Cumulative Infiltration",
                "feature_key": "rainfall_72h_mm",
                "value": f"{r72:.1f} mm",
                "impact": r72_impact,
                "shap_value": r72_shap,
                "contribution_pct": r72_pct,
                "description": "Deep subsurface hydraulic saturation" if r72 > 200 else "Standard hydrological loading"
            },
            "soil_saturation": {
                "name": "Soil Moisture Saturation",
                "feature_key": "soil_moisture_pct",
                "value": f"{sm:.1f}%",
                "impact": sm_impact,
                "shap_value": sm_shap,
                "contribution_pct": sm_pct,
                "description": "Pore water pressure exceeds shear resistance" if sm > 88 else "Partial soil pore drainage"
            },
            "anthropogenic_cut": {
                "name": "Highway / Cut-Slope Proximity",
                "feature_key": "distance_to_road_m",
                "value": f"{dist_road:.0f} m",
                "impact": road_impact,
                "shap_value": road_shap,
                "contribution_pct": road_pct,
                "description": "Steep road toe excavation vulnerability" if dist_road < 15 else "Natural undisturbed valley buffer"
            },
            "antecedent_rainfall": {
                "name": "Antecedent Rainfall Index (ARI)",
                "feature_key": "antecedent_rainfall_index",
                "value": f"{ari:.1f} mm",
                "impact": ari_impact,
                "shap_value": ari_shap,
                "contribution_pct": ari_pct,
                "description": "Prolonged groundwater table recharge accumulation" if ari > 120 else "Normal moisture retention"
            }
        }
        return factors


risk_model = LandslideRiskModel()

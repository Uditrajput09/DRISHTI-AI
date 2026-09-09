"""
backend/ml/forecast_model.py
7-Day Probabilistic Landslide Risk Trajectory Engine with Uncertainty Quantification.
Combines meteorological forward simulations with geotechnical decay dynamics and
heteroscedastic confidence bands (90% CI) for multi-day early warning planning.
"""

from typing import Dict, Any, List, Optional
import math
import numpy as np
from datetime import datetime, timedelta, timezone


class ProbabilisticRiskForecaster:
    """Computes multi-step probabilistic risk trajectories and failure thresholds."""

    def __init__(self):
        # Hydro-mechanical calibration parameters for East Khasi Hills soils (sandstone/shale colluvium)
        self.soil_retention_half_life_days = 3.5
        self.monsoon_decay_rate = 0.88
    @staticmethod
    def calculate_trigger_probability(point_estimate: float, uncertainty_std: float, threshold: float = 70.0) -> float:
        """
        Calculate cumulative probability of exceeding risk threshold using standard Normal CDF.
        P(X >= threshold) = 1 - Phi((threshold - point_estimate) / sigma)
        """
        z_score = (threshold - point_estimate) / max(1.0, uncertainty_std)
        cdf = 0.5 * (1.0 + math.erf(z_score / math.sqrt(2.0)))
        prob = 1.0 - cdf
        return round(float(min(max(prob, 0.01), 0.99)), 3)

    def compute_7day_trajectory(
        self,
        base_slope: float,
        vulnerability_index: float,
        current_rain_24h: float,
        current_soil_moisture: float,
        base_risk_score: float,
        forecast_rainfall_series: Optional[List[float]] = None
    ) -> List[Dict[str, Any]]:
        """
        Compute 7-day forward risk trajectory with confidence intervals.
        """
        now = datetime.now(timezone.utc)
        trajectory = []

        # Autoregressive states
        sim_rain = current_rain_24h
        sim_moisture = current_soil_moisture
        sim_risk = base_risk_score

        for day_offset in range(7):
            date_target = now + timedelta(days=day_offset)
            weekday = date_target.strftime("%a")
            date_str = date_target.strftime("%Y-%m-%d")

            # Determine weather forcing
            if forecast_rainfall_series and day_offset < len(forecast_rainfall_series):
                daily_rain = float(forecast_rainfall_series[day_offset])
            else:
                # MOCKED: autoregressive meteorological decay projection with seasonal variance
                decay = self.monsoon_decay_rate ** day_offset
                daily_rain = max(0.0, current_rain_24h * decay + (np.sin(day_offset * 1.2) * 12.0))

            # Hydraulic saturation persistence:
            # New moisture = retained moisture from prior day + recharge from rainfall - evapotranspiration
            moisture_loss = (sim_moisture - 35.0) * (1.0 - np.exp(-1.0 / self.soil_retention_half_life_days))
            recharge = min(40.0, daily_rain * 0.28)
            sim_moisture = float(np.clip(sim_moisture - moisture_loss + recharge, 25.0, 98.0))

            # Geotechnical limit-equilibrium approximation for trajectory
            # Factor of Safety (FoS) inverse proxy
            slope_factor = (base_slope / 45.0) * 35.0
            rain_factor = min(45.0, (daily_rain / 150.0) * 40.0)
            saturation_factor = (sim_moisture / 100.0) * 20.0
            vuln_factor = vulnerability_index * 10.0

            raw_predicted_risk = float(np.clip(slope_factor + rain_factor + saturation_factor + vuln_factor, 5.0, 98.0))

            # Temporal uncertainty expands as forecast horizon advances into future (d0 -> d6)
            # Standard error grows from ±3% at day 0 to ±14% at day 6
            horizon_uncertainty_std = 3.2 + (day_offset * 1.8)
            lower_bound = round(max(0.0, raw_predicted_risk - (1.645 * horizon_uncertainty_std)), 1)
            upper_bound = round(min(100.0, raw_predicted_risk + (1.645 * horizon_uncertainty_std)), 1)
            point_estimate = round(raw_predicted_risk, 1)

            # Cumulative probability of trigger (risk >= 70 threshold)
            trigger_prob = self.calculate_trigger_probability(point_estimate, horizon_uncertainty_std)

            # Severity classification
            if point_estimate >= 80.0:
                severity = "Critical"
            elif point_estimate >= 60.0:
                severity = "High"
            elif point_estimate >= 35.0:
                severity = "Medium"
            else:
                severity = "Low"

            trajectory.append({
                "day_index": day_offset,
                "date": date_str,
                "weekday": weekday,
                "predicted_risk": point_estimate,
                "confidence_lower": lower_bound,
                "confidence_upper": upper_bound,
                "trigger_probability": trigger_prob,
                "severity": severity,
                "predicted_rain_mm": round(daily_rain, 1),
                "predicted_soil_moisture_pct": round(sim_moisture, 1)
            })

        return trajectory


risk_forecaster = ProbabilisticRiskForecaster()

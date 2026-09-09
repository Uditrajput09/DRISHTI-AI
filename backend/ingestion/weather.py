"""
backend/ingestion/weather.py
Open-Meteo rainfall and soil moisture ingestion client with live HTTP requests
and synthetic fallback generator for offline / simulated environments.
"""

from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta, timezone
import random

import requests
from backend.config import settings


class WeatherIngestionService:
    """Service to fetch hourly rainfall and soil moisture from Open-Meteo."""

    def __init__(self):
        self.forecast_url = settings.OPEN_METEO_FORECAST_URL
        self.archive_url = settings.OPEN_METEO_ARCHIVE_URL

    def fetch_live_zone_weather(self, lat: float, lon: float) -> Dict[str, Any]:
        """
        Fetch live forecast and recent hourly weather + soil moisture from Open-Meteo.
        Params: precipitation, soil_moisture_0_to_7cm, soil_moisture_7_to_28cm,
                temperature_2m, relative_humidity_2m, wind_speed_10m.
        """
        params = {
            "latitude": lat,
            "longitude": lon,
            "hourly": [
                "precipitation",
                "soil_moisture_0_to_7cm",
                "soil_moisture_7_to_28cm",
                "temperature_2m",
                "relative_humidity_2m",
                "wind_speed_10m"
            ],
            "timezone": "Asia/Kolkata",
            "forecast_days": 3,
            "past_days": 3
        }

        try:
            response = requests.get(self.forecast_url, params=params, timeout=6.0)
            if response.status_code == 200:
                data = response.json()
                return self._parse_open_meteo_response(data)
            else:
                # MOCKED: Open-Meteo returned non-200, falling back to simulated high-fidelity weather
                return self._generate_synthetic_weather(lat, lon, reason=f"HTTP {response.status_code}")
        except Exception as exc:
            # MOCKED: Network error or timeout contacting Open-Meteo, using synthetic fallback
            return self._generate_synthetic_weather(lat, lon, reason=str(exc))

    def _parse_open_meteo_response(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Parse raw Open-Meteo JSON into structured metrics."""
        hourly = data.get("hourly", {})
        times = hourly.get("time", [])
        precip = hourly.get("precipitation", [])
        sm_0_7 = hourly.get("soil_moisture_0_to_7cm", [])
        sm_7_28 = hourly.get("soil_moisture_7_28cm", [])
        temp = hourly.get("temperature_2m", [])
        humidity = hourly.get("relative_humidity_2m", [])
        wind = hourly.get("wind_speed_10m", [])

        if not times:
            return self._generate_synthetic_weather(25.5788, 91.8933, reason="Empty hourly payload")

        # Find current hour index (past_days=3 puts current hour around index 72)
        current_idx = min(len(times) - 1, 72)

        def _safe_get(arr, idx, default_val):
            if idx < len(arr) and arr[idx] is not None:
                try:
                    return float(arr[idx])
                except (ValueError, TypeError):
                    return default_val
            return default_val

        hourly_rain = _safe_get(precip, current_idx, 0.0)
        
        # 24h cumulative rainfall (past 24 entries)
        start_24h = max(0, current_idx - 24)
        rain_24h = sum(_safe_get(precip, i, 0.0) for i in range(start_24h, current_idx + 1))

        # 72h cumulative rainfall (past 72 entries)
        start_72h = max(0, current_idx - 72)
        rain_72h = sum(_safe_get(precip, i, 0.0) for i in range(start_72h, current_idx + 1))

        # Antecedent Rainfall Index (ARI): sum(Rain_t * 0.8^t)
        ari = 0.0
        for i, idx in enumerate(range(current_idx, max(0, current_idx - 14 * 24), -24)):
            day_rain = sum(_safe_get(precip, j, 0.0) for j in range(max(0, idx - 24), idx + 1))
            ari += day_rain * (0.84 ** (i + 1))

        current_sm_0_7 = _safe_get(sm_0_7, current_idx, 0.35)
        current_sm_7_28 = _safe_get(sm_7_28, current_idx, 0.40)
        # Convert m3/m3 to soil moisture % (typical porosity 0.5 -> 0.45 = 90% saturation)
        soil_moisture_pct = min(100.0, max(10.0, (current_sm_0_7 / 0.50) * 100.0))

        # Build 48h forecast series for charts
        forecast_series = []
        for f_idx in range(current_idx, min(len(times), current_idx + 48)):
            forecast_series.append({
                "time": times[f_idx],
                "rainfall_mm": _safe_get(precip, f_idx, 0.0),
                "soil_moisture_pct": min(100.0, _safe_get(sm_0_7, f_idx, 0.35) / 0.50 * 100.0),
                "temperature_c": _safe_get(temp, f_idx, 22.0),
                "wind_speed_kmh": _safe_get(wind, f_idx, 12.0)
            })

        return {
            "source": "Open-Meteo Live API",
            "is_mocked": False,
            "rainfall_hourly_mm": round(hourly_rain, 2),
            "rainfall_24h_mm": round(rain_24h, 2),
            "rainfall_72h_mm": round(rain_72h, 2),
            "antecedent_rainfall_index": round(ari, 2),
            "soil_moisture_0_7cm": round(current_sm_0_7, 4),
            "soil_moisture_7_28cm": round(current_sm_7_28, 4),
            "soil_moisture_pct": round(soil_moisture_pct, 1),
            "temperature_c": round(_safe_get(temp, current_idx, 21.5), 1),
            "humidity_pct": round(_safe_get(humidity, current_idx, 85.0), 1),
            "wind_speed_kmh": round(_safe_get(wind, current_idx, 8.5), 1),
            "forecast_series": forecast_series
        }

    def _generate_synthetic_weather(self, lat: float, lon: float, reason: str = "") -> Dict[str, Any]:
        """
        # MOCKED: Synthetic weather generator simulating East Khasi Hills orographic rainfall.
        Generates realistic monsoon precipitation profiles (Sohra/Mawsynram receive high rainfall).
        """
        # Sohra / Mawsynram (lat ~ 25.27 - 25.30) gets elevated orographic precipitation
        is_high_rainfall_zone = lat < 25.35

        if is_high_rainfall_zone:
            hourly_rain = round(random.uniform(8.0, 32.0), 2)
            rain_24h = round(hourly_rain * 6.5 + random.uniform(40.0, 110.0), 2)
            rain_72h = round(rain_24h * 2.2 + random.uniform(80.0, 160.0), 2)
            soil_moisture_pct = round(random.uniform(78.0, 96.0), 1)
        else:
            hourly_rain = round(random.uniform(1.5, 14.0), 2)
            rain_24h = round(hourly_rain * 5.0 + random.uniform(15.0, 45.0), 2)
            rain_72h = round(rain_24h * 1.8 + random.uniform(30.0, 75.0), 2)
            soil_moisture_pct = round(random.uniform(60.0, 82.0), 1)

        ari = round(rain_24h * 0.85 + rain_72h * 0.45, 2)

        # Build 48h synthetic forecast series
        now = datetime.now(timezone.utc)

        forecast_series = []
        for i in range(48):
            f_time = (now + timedelta(hours=i)).strftime("%Y-%m-%dT%H:00")
            sim_rain = max(0.0, round(hourly_rain * (0.6 + 0.8 * random.random()), 2))
            sim_sm = min(99.0, max(40.0, round(soil_moisture_pct + (sim_rain * 0.3) - (i * 0.1), 1)))
            forecast_series.append({
                "time": f_time,
                "rainfall_mm": sim_rain,
                "soil_moisture_pct": sim_sm,
                "temperature_c": round(21.0 - (i % 24) * 0.2 + random.uniform(-1, 1), 1),
                "wind_speed_kmh": round(random.uniform(8.0, 24.0) + (sim_rain * 0.15), 1)
            })

        return {
            "source": f"Open-Meteo Simulated Fallback ({reason})",
            "is_mocked": True,
            "rainfall_hourly_mm": hourly_rain,
            "rainfall_24h_mm": rain_24h,
            "rainfall_72h_mm": rain_72h,
            "antecedent_rainfall_index": ari,
            "soil_moisture_0_7cm": round((soil_moisture_pct / 100.0) * 0.50, 4),
            "soil_moisture_7_28cm": round((soil_moisture_pct / 100.0) * 0.48, 4),
            "soil_moisture_pct": soil_moisture_pct,
            "temperature_c": round(random.uniform(18.5, 23.5), 1),
            "humidity_pct": round(random.uniform(82.0, 97.0), 1),
            "wind_speed_kmh": round(random.uniform(6.0, 18.0), 1),
            "forecast_series": forecast_series
        }


weather_service = WeatherIngestionService()

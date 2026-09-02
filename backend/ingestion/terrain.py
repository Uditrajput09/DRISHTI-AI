"""
backend/ingestion/terrain.py
Open Topo Data / OpenTopography elevation and slope angle calculation service.
Computes topographic slope gradients, aspect, and curvature metrics.
"""

from typing import Dict, Any, List, Tuple
import math
import requests
from backend.config import settings


class TerrainIngestionService:
    """Service to fetch elevation and derive slope gradients from Open Topo Data."""

    def __init__(self):
        self.open_topo_url = settings.OPEN_TOPO_DATA_URL
        self.opentopo_key = settings.OPENTOPOGRAPHY_API_KEY

    def fetch_point_elevation(self, lat: float, lon: float, dataset: str = "eudem25m") -> Dict[str, Any]:
        """
        Query Open Topo Data API for a single lat/lon coordinate.
        Dataset options: eudem25m, mapzen, srtm30m.
        """
        url = f"{self.open_topo_url}/{dataset}"
        params = {"locations": f"{lat},{lon}"}

        try:
            resp = requests.get(url, params=params, timeout=5.0)
            if resp.status_code == 200:
                data = resp.json()
                results = data.get("results", [])
                if results and results[0].get("elevation") is not None:
                    elev = float(results[0]["elevation"])
                    return {
                        "source": f"Open Topo Data ({dataset})",
                        "is_mocked": False,
                        "elevation_m": elev,
                        "latitude": lat,
                        "longitude": lon
                    }
            # Fallback if API rate limited (1000/day limit)
            return self._generate_synthetic_terrain(lat, lon, reason=f"HTTP {resp.status_code}")
        except Exception as exc:
            # MOCKED: Open Topo Data unreachable, calculate terrain using Meghalaya hypsometry
            return self._generate_synthetic_terrain(lat, lon, reason=str(exc))

    def calculate_slope_gradient(
        self,
        center_lat: float,
        center_lon: float,
        delta_m: float = 50.0
    ) -> Dict[str, Any]:
        """
        Calculate slope angle in degrees by sampling surrounding 4 elevation points (N, S, E, W).
        Uses finite difference method on DEM.
        """
        # 1 deg lat approx 111,000m, 1 deg lon at 25N approx 100,500m
        delta_lat = delta_m / 111000.0
        delta_lon = delta_m / 100500.0

        # Query center and cardinal offsets
        center = self.fetch_point_elevation(center_lat, center_lon)
        north = self.fetch_point_elevation(center_lat + delta_lat, center_lon)
        south = self.fetch_point_elevation(center_lat - delta_lat, center_lon)
        east = self.fetch_point_elevation(center_lat, center_lon + delta_lon)
        west = self.fetch_point_elevation(center_lat, center_lon - delta_lon)

        z_center = center["elevation_m"]
        dz_dx = (east["elevation_m"] - west["elevation_m"]) / (2.0 * delta_m)
        dz_dy = (north["elevation_m"] - south["elevation_m"]) / (2.0 * delta_m)

        slope_rad = math.atan(math.sqrt(dz_dx ** 2 + dz_dy ** 2))
        slope_deg = math.degrees(slope_rad)
        aspect_deg = (math.degrees(math.atan2(-dz_dy, dz_dx)) + 360.0) % 360.0

        return {
            "center_elevation_m": round(z_center, 1),
            "slope_angle_deg": round(slope_deg, 2),
            "slope_aspect_deg": round(aspect_deg, 1),
            "is_mocked": center.get("is_mocked", False)
        }

    def _generate_synthetic_terrain(self, lat: float, lon: float, reason: str = "") -> Dict[str, Any]:
        """
        # MOCKED: Synthetic terrain elevation model derived from East Khasi Hills hypsometric curve.
        Plateau peaks in North (Shillong ~ 1500-1960m), plunges southward into Bangladesh plains (<150m at Dawki/Shella).
        """
        # Latitude gradient: 25.6 (North/Shillong) -> 25.18 (South/Dawki)
        lat_norm = (lat - 25.15) / (25.70 - 25.15)
        lat_norm = max(0.0, min(1.0, lat_norm))
        
        # Base elevation: 150m at south border to 1850m at plateau
        elev = 150.0 + (lat_norm ** 1.3) * 1700.0

        # Add localized micro-topography
        elev += math.sin(lon * 40.0) * 80.0 + math.cos(lat * 50.0) * 60.0

        return {
            "source": f"Topographic Hypsometric Model ({reason})",
            "is_mocked": True,
            "elevation_m": round(elev, 1),
            "latitude": lat,
            "longitude": lon
        }


terrain_service = TerrainIngestionService()

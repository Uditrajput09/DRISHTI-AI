"""
backend/ingestion/imd.py
India Meteorological Department (IMD) Public API ingestion client for
district rainfall reports and severe weather warnings (Orange / Red alerts).
"""

from typing import Dict, Any, List
import requests
from backend.config import settings


class IMDIngestionService:
    """Service to fetch official IMD warnings and district rainfall metrics."""

    def __init__(self):
        self.base_url = settings.IMD_API_BASE_URL

    def fetch_district_warning(self, district_name: str = "East Khasi Hills") -> Dict[str, Any]:
        """
        Fetch district warning status from IMD public endpoint.
        Returns alert color code: Green, Yellow, Orange, Red + warning text.
        """
        try:
            url = f"{self.base_url}/warnings/district"
            params = {"state": "Meghalaya", "district": district_name}
            resp = requests.get(url, params=params, timeout=5.0)
            if resp.status_code == 200:
                data = resp.json()
                return self._parse_imd_warning(data)
            else:
                # MOCKED: IMD endpoint unavailable, generating district warning based on seasonal climatology
                return self._generate_synthetic_imd_warning(district_name, reason=f"HTTP {resp.status_code}")
        except Exception as exc:
            # MOCKED: IMD network timeout, using synthetic fallback warning
            return self._generate_synthetic_imd_warning(district_name, reason=str(exc))

    def _parse_imd_warning(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Parse official IMD warning payload."""
        return {
            "source": "IMD Official API",
            "is_mocked": False,
            "district": "East Khasi Hills",
            "warning_level": data.get("color_code", "Orange"),
            "warning_message": data.get("warning_text", "Heavy to very heavy rainfall expected in isolated places."),
            "valid_until": data.get("valid_until", "Next 24 Hours"),
            "rainfall_category": data.get("rainfall_category", "Heavy Rainfall (64.5 - 115.5 mm)")
        }

    def _generate_synthetic_imd_warning(self, district_name: str, reason: str = "") -> Dict[str, Any]:
        """
        # MOCKED: Fallback generator simulating IMD National Weather Forecasting Centre (NWFC)
        district bulletin for East Khasi Hills, Meghalaya.
        """
        return {
            "source": f"IMD Simulated Bulletin ({reason})",
            "is_mocked": True,
            "district": district_name,
            "warning_level": "Orange",
            "warning_message": "Isolated heavy to very heavy rainfall accompanied by squally winds and localized slope saturation across East Khasi Hills.",
            "valid_until": "Next 24 to 48 Hours",
            "rainfall_category": "Very Heavy Rainfall (115.6 to 204.4 mm)",
            "impact_assessment": "Moderate to High risk of localized landslides and mudslides along NH-6, NH-206, and Sohra Ghat sections."
        }

    def get_severity_multiplier(self, warning_level: str) -> float:
        """
        Derive an AI risk calibration multiplier based on official IMD warning levels.
        Red Alert escalates baseline hazard probability (+15%), Orange (+8%).
        """
        lvl = (warning_level or "").strip().lower()
        if "red" in lvl:
            return 1.15
        elif "orange" in lvl:
            return 1.08
        elif "yellow" in lvl:
            return 1.02
        return 1.00


imd_service = IMDIngestionService()


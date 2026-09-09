"""
backend/config.py
Configuration and environment variable management for DRISHTI-AI.
Reads from system environment and .env file with intelligent defaults.
"""

import os
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
PLACEHOLDER_SECRET_VALUES = {"", "none", "null", "undefined"}


class Settings(BaseSettings):
    """Application configuration settings loaded from environment or .env."""

    # Project root directory
    @property
    def BASE_DIR(self) -> str:
        return BASE_DIR

    # Database (Enterprise PostgreSQL + PostGIS)
    DATABASE_URL: str = Field(default="postgresql://postgres:postgres@localhost:5432/drishti_landslide")
    POSTGRES_USER: str = Field(default="postgres")
    POSTGRES_PASSWORD: str = Field(default="postgres")
    POSTGRES_DB: str = Field(default="drishti_landslide")
    POSTGRES_HOST: str = Field(default="localhost")
    POSTGRES_PORT: int = Field(default=5432)
    REDIS_URL: str = Field(default="redis://localhost:6379/0")

    # Pilot District (Default: East Khasi Hills, Meghalaya)
    PILOT_DISTRICT_NAME: str = Field(default="East Khasi Hills, Meghalaya")
    PILOT_CENTER_LAT: float = Field(default=25.5788)
    PILOT_CENTER_LON: float = Field(default=91.8933)
    PILOT_BBOX: str = Field(default="25.10,91.25,25.75,92.15")

    # Ingestion APIs
    OPEN_METEO_FORECAST_URL: str = Field(default="https://api.open-meteo.com/v1/forecast")
    OPEN_METEO_ARCHIVE_URL: str = Field(default="https://archive-api.open-meteo.com/v1/archive")
    IMD_API_BASE_URL: str = Field(default="https://api.imd.gov.in/api/v1")
    OPEN_TOPO_DATA_URL: str = Field(default="https://api.opentopodata.org/v1")
    OPENTOPOGRAPHY_API_KEY: str = Field(default="")
    OVERPASS_API_URL: str = Field(default="https://overpass-api.de/api/interpreter")

    # Multilingual Translation
    LIBRETRANSLATE_URL: str = Field(default="https://libretranslate.com/translate")
    LIBRETRANSLATE_API_KEY: str = Field(default="")
    GEMINI_API_KEY: str = Field(default="")

    # Alerts
    FAST2SMS_API_KEY: str = Field(default="")
    FIREBASE_PROJECT_ID: str = Field(default="")
    FIREBASE_API_KEY: str = Field(default="")
    FIREBASE_MESSAGING_SENDER_ID: str = Field(default="")
    FIREBASE_APP_ID: str = Field(default="")
    FIREBASE_VAPID_KEY: str = Field(default="")

    # Risk Thresholds
    RISK_ALERT_THRESHOLD: float = Field(default=70.0)
    ALERT_LANGUAGES: str = Field(default="en,hi,kha,as")

    # Security & Admin Access
    ADMIN_API_KEY: str = Field(default="drishti-demo-admin-key-2026")
    ALLOWED_ORIGINS: str = Field(default="http://localhost:5173,http://localhost:3000")

    # App Environment
    ENVIRONMENT: str = Field(default="development")
    DEBUG: bool = Field(default=True)
    PORT: int = Field(default=8000)

    @property
    def allowed_origins_list(self) -> List[str]:
        """Return parsed list of allowed CORS origins."""
        return [orig.strip() for orig in self.ALLOWED_ORIGINS.split(",") if orig.strip()]

    @property
    def alert_languages_list(self) -> List[str]:
        """Return parsed list of alert language codes."""
        return [lang.strip() for lang in self.ALERT_LANGUAGES.split(",") if lang.strip()]

    @property
    def bbox_coords(self) -> dict:
        """Parse PILOT_BBOX string into south, west, north, east."""
        try:
            parts = [float(p.strip()) for p in self.PILOT_BBOX.split(",")]
            return {
                "south": parts[0],
                "west": parts[1],
                "north": parts[2],
                "east": parts[3],
            }
        except Exception:
            return {"south": 25.10, "west": 91.25, "north": 25.75, "east": 92.15}

    @staticmethod
    def _is_placeholder_secret(value: str | None) -> bool:
        """Return True when the secret is missing, blank, or still set to a template value."""
        if value is None:
            return True
        normalized = str(value).strip()
        if not normalized:
            return True
        lowered = normalized.lower()
        if lowered in PLACEHOLDER_SECRET_VALUES:
            return True
        if lowered.startswith("your_") and lowered.endswith("_here"):
            return True
        if lowered.startswith("<") and lowered.endswith(">"):
            return True
        return False

    def get_optional_api_key(self, field_name: str) -> str:
        """Read an optional external API key while treating blank/template values as unset."""
        value = getattr(self, field_name, "")
        if self._is_placeholder_secret(value):
            return ""
        return str(value).strip()

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )


settings = Settings()

"""
backend/schemas.py
Pydantic schemas for API request validation and serialization.
"""

from typing import List, Optional, Any, Dict, Union
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict, field_validator


# ─── Zone Schemas ────────────────────────────────────────────────
class ZoneBase(BaseModel):
    zone_code: str
    name: str
    district: str = "East Khasi Hills"
    state: str = "Meghalaya"
    center_lat: float
    center_lon: float
    base_slope_deg: float
    base_elevation_m: float
    vulnerability_index: float
    soil_type: str
    geology: str


class ZoneOut(ZoneBase):
    id: int
    geometry_json: Optional[str] = None
    key_roads_json: Optional[str] = None
    current_risk: Optional[Dict[str, Any]] = None
    latest_weather: Optional[Dict[str, Any]] = None

    model_config = ConfigDict(from_attributes=True)


# ─── Risk Schemas ────────────────────────────────────────────────
class RiskFactorDetail(BaseModel):
    name: str
    value: float
    unit: str
    impact: str  # Critical, High, Moderate, Low
    description: str


class RiskScoreOut(BaseModel):
    id: int
    zone_id: int
    zone_code: str
    zone_name: str
    center_lat: float
    center_lon: float
    risk_score: float  # 0-100
    risk_level: str  # Low, Medium, High, Critical
    probability: float
    triggering_factors: Dict[str, Any]
    rainfall_24h: float
    rainfall_72h: float
    soil_moisture: float
    model_version: str
    computed_at: datetime

    model_config = ConfigDict(from_attributes=True)


class RiskSimulationRequest(BaseModel):
    zone_id: Optional[int] = None
    simulated_hourly_rainfall_mm: float = Field(default=25.0, ge=0.0, le=250.0)
    simulated_soil_moisture_pct: Optional[float] = Field(default=None, ge=0.0, le=100.0)
    simulated_duration_hours: int = Field(default=6, ge=1, le=72)
    trigger_alerts: bool = Field(default=False)


# ─── Weather Schemas ────────────────────────────────────────────
class WeatherReadingOut(BaseModel):
    id: int
    zone_id: int
    timestamp: datetime
    rainfall_hourly_mm: float
    rainfall_24h_mm: float
    rainfall_72h_mm: float
    antecedent_rainfall_index: float
    soil_moisture_0_7cm: float
    soil_moisture_7_28cm: float
    temperature_c: float
    humidity_pct: float
    wind_speed_kmh: float
    source: str
    is_forecast: bool

    model_config = ConfigDict(from_attributes=True)


# ─── Field Report Schemas ───────────────────────────────────────
class FieldReportCreate(BaseModel):
    report_uid: Optional[str] = None
    zone_id: Optional[int] = None
    reporter_type: str = "citizen"
    reporter_name: str = "Anonymous Citizen"
    reporter_contact: Optional[str] = None
    latitude: float
    longitude: float
    hazard_type: str = "Soil Creep"
    severity: str = "Moderate"
    description: Optional[str] = None
    photo_data_url: Optional[str] = None
    device_created_at: Optional[datetime] = None

    @field_validator("photo_data_url")
    @classmethod
    def validate_photo_data_url(cls, v: Optional[str]) -> Optional[str]:
        if not v:
            return v
        if len(v) > 4_500_000:
            raise ValueError("Photo payload exceeds 3MB limit")
        if v.startswith("data:"):
            allowed = ("data:image/jpeg;base64,", "data:image/jpg;base64,", "data:image/png;base64,", "data:image/webp;base64,")
            if not any(v.startswith(p) for p in allowed):
                raise ValueError("Invalid image MIME type. Allowed formats: JPEG, PNG, WebP.")
        return v


class FieldReportOut(BaseModel):
    id: int
    report_uid: str
    zone_id: Optional[int]
    reporter_type: str
    reporter_name: str
    reporter_contact: Optional[str]
    latitude: float
    longitude: float
    hazard_type: str
    severity: str
    description: Optional[str]
    photo_data_url: Optional[str]
    status: str
    synced: bool
    device_created_at: datetime
    server_received_at: datetime

    model_config = ConfigDict(from_attributes=True)


class BatchReportSyncRequest(BaseModel):
    reports: List[FieldReportCreate]


# ─── Alert Schemas ──────────────────────────────────────────────
class AlertLogOut(BaseModel):
    id: int
    zone_id: int
    risk_score: float
    risk_level: str
    channel: str
    recipient: str
    language: str
    message_text: str
    status: str
    provider_response: Optional[str]
    sent_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ManualAlertRequest(BaseModel):
    zone_id: int
    risk_level: str = "Critical"
    risk_score: float = 88.5
    languages: Optional[List[str]] = None
    custom_message: Optional[str] = None
    channel: str = "all"


class SubscriberCreate(BaseModel):
    name: str
    phone: Optional[str] = None
    email: Optional[str] = None
    fcm_token: Optional[str] = None
    role: str = "citizen"
    preferred_language: str = "en"
    zone_id: Optional[Union[int, str]] = None


class SubscriberOut(SubscriberCreate):
    id: int
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ─── Infrastructure Schemas ─────────────────────────────────────
class InfrastructureOut(BaseModel):
    id: int
    item_id: str
    name: str
    type: str
    category: Optional[str]
    latitude: Optional[float]
    longitude: Optional[float]
    capacity: Optional[int]
    contact: Optional[str]
    zone_id: Optional[str]
    status: str
    details: Optional[Any] = None

    model_config = ConfigDict(from_attributes=True)


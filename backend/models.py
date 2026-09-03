"""
backend/models.py
SQLAlchemy ORM models for zones, risk scores, weather readings,
field reports, alert dispatches, infrastructure items, and subscribers.
"""

from datetime import datetime, timezone
from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    Boolean,
    Text,
    DateTime,
    ForeignKey,
    Index
)
from sqlalchemy.orm import relationship
from backend.database import Base


class Zone(Base):
    """Monitored landslide micro-zone in the pilot district."""
    __tablename__ = "zones"

    id = Column(Integer, primary_key=True, index=True)
    zone_code = Column(String(50), unique=True, index=True, nullable=False)
    name = Column(String(200), nullable=False)
    district = Column(String(100), default="East Khasi Hills")
    state = Column(String(100), default="Meghalaya")
    center_lat = Column(Float, nullable=False)
    center_lon = Column(Float, nullable=False)
    base_slope_deg = Column(Float, default=30.0)
    base_elevation_m = Column(Float, default=1000.0)
    vulnerability_index = Column(Float, default=0.7)
    soil_type = Column(String(255), default="Clayey Loam")
    geology = Column(String(255), default="Sedimentary")
    geometry_json = Column(Text, nullable=True)  # GeoJSON polygon coordinates string
    key_roads_json = Column(Text, nullable=True)  # JSON array of road strings
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    risk_scores = relationship("RiskScore", back_populates="zone", cascade="all, delete-orphan")
    weather_readings = relationship("WeatherReading", back_populates="zone", cascade="all, delete-orphan")
    field_reports = relationship("FieldReport", back_populates="zone")
    alerts = relationship("AlertLog", back_populates="zone")


class RiskScore(Base):
    """Computed AI landslide risk score and triggering factors for a zone."""
    __tablename__ = "risk_scores"

    id = Column(Integer, primary_key=True, index=True)
    zone_id = Column(Integer, ForeignKey("zones.id"), nullable=False, index=True)
    risk_score = Column(Float, nullable=False)  # 0 to 100
    risk_level = Column(String(50), nullable=False)  # Low, Medium, High, Critical
    probability = Column(Float, default=0.0)  # 0.0 to 1.0
    triggering_factors_json = Column(Text, nullable=True)  # JSON explanation dict
    rainfall_24h = Column(Float, default=0.0)
    rainfall_72h = Column(Float, default=0.0)
    soil_moisture = Column(Float, default=0.0)
    model_version = Column(String(50), default="v1.0-rf-heuristic")
    computed_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)

    zone = relationship("Zone", back_populates="risk_scores")
    alerts = relationship("AlertLog", back_populates="risk_score_ref")


class WeatherReading(Base):
    """Normalized weather and soil moisture reading for a zone."""
    __tablename__ = "weather_readings"

    id = Column(Integer, primary_key=True, index=True)
    zone_id = Column(Integer, ForeignKey("zones.id"), nullable=False, index=True)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    rainfall_hourly_mm = Column(Float, default=0.0)
    rainfall_24h_mm = Column(Float, default=0.0)
    rainfall_72h_mm = Column(Float, default=0.0)
    antecedent_rainfall_index = Column(Float, default=0.0)
    soil_moisture_0_7cm = Column(Float, default=0.0)  # volumetric m3/m3 or %
    soil_moisture_7_28cm = Column(Float, default=0.0)
    temperature_c = Column(Float, default=20.0)
    humidity_pct = Column(Float, default=80.0)
    wind_speed_kmh = Column(Float, default=5.0)
    river_discharge_m3s = Column(Float, default=0.0)  # m3/s from Open-Meteo Flood API
    source = Column(String(50), default="Open-Meteo")  # Open-Meteo, IMD, Simulation
    is_forecast = Column(Boolean, default=False)

    zone = relationship("Zone", back_populates="weather_readings")


class FieldReport(Base):
    """Citizen and field-official geo-tagged incident / early warning report."""
    __tablename__ = "field_reports"

    id = Column(Integer, primary_key=True, index=True)
    report_uid = Column(String(100), unique=True, index=True, nullable=False)
    zone_id = Column(Integer, ForeignKey("zones.id"), nullable=True, index=True)
    reporter_type = Column(String(50), default="citizen")  # citizen, official, volunteer
    reporter_name = Column(String(100), default="Anonymous Citizen")
    reporter_contact = Column(String(100), nullable=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    hazard_type = Column(String(100), default="Soil Creep")  # Soil Creep, Rockfall, Debris Flow, Road Cut, Crack
    severity = Column(String(50), default="Moderate")  # Minor, Moderate, Severe, Critical
    description = Column(Text, nullable=True)
    photo_data_url = Column(Text, nullable=True)  # Base64 data URL or photo path
    status = Column(String(50), default="submitted")  # submitted, verified, resolving, dismissed
    synced = Column(Boolean, default=True)
    device_created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    server_received_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    zone = relationship("Zone", back_populates="field_reports")


class AlertLog(Base):
    """Log of dispatched warnings and notifications across SMS, Push, and Web."""
    __tablename__ = "alert_logs"

    id = Column(Integer, primary_key=True, index=True)
    zone_id = Column(Integer, ForeignKey("zones.id"), nullable=False, index=True)
    risk_score_id = Column(Integer, ForeignKey("risk_scores.id"), nullable=True)
    risk_score = Column(Float, nullable=False)
    risk_level = Column(String(50), nullable=False)
    channel = Column(String(50), default="sms")  # sms, push, web, all
    recipient = Column(String(100), default="Broadcast")
    language = Column(String(20), default="en")  # en, hi, kha, as
    message_text = Column(Text, nullable=False)
    status = Column(String(50), default="sent")  # sent, failed, simulated, mocked
    provider_response = Column(Text, nullable=True)
    sent_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)

    zone = relationship("Zone", back_populates="alerts")
    risk_score_ref = relationship("RiskScore", back_populates="alerts")


class InfrastructureItem(Base):
    """Critical infrastructure, emergency shelters, hospitals, roads, and evacuation points."""
    __tablename__ = "infrastructure"

    id = Column(Integer, primary_key=True, index=True)
    item_id = Column(String(50), unique=True, index=True, nullable=False)
    name = Column(String(200), nullable=False)
    type = Column(String(50), nullable=False)  # hospital, shelter, emergency_center, road, evacuation_route
    category = Column(String(100), nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    capacity = Column(Integer, nullable=True)
    contact = Column(String(100), nullable=True)
    zone_id = Column(String(50), nullable=True)
    status = Column(String(50), default="Operational")  # Operational, At Risk, Blocked
    details_json = Column(Text, nullable=True)  # Detailed attributes or GeoJSON geometry


class Subscriber(Base):
    """Alert subscriber (citizens, district magistrates, rescue teams)."""
    __tablename__ = "subscribers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    phone = Column(String(30), nullable=True)
    email = Column(String(100), nullable=True)
    fcm_token = Column(String(255), nullable=True)
    role = Column(String(50), default="citizen")  # citizen, official, emergency_team
    preferred_language = Column(String(20), default="en")
    zone_id = Column(String(50), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))


class SOSEvent(Base):
    """Citizen SOS emergency beacon — GPS distress signal with broadcast status."""
    __tablename__ = "sos_events"

    id = Column(Integer, primary_key=True, index=True)
    lat = Column(Float, nullable=False)
    lon = Column(Float, nullable=False)
    reporter_name = Column(String(100), default="Anonymous")
    contact = Column(String(100), nullable=True)
    message = Column(Text, nullable=True)
    acknowledged = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))


class AnnualSurvey(Base):
    """Pre-monsoon annual slope vulnerability survey by field officers."""
    __tablename__ = "annual_surveys"

    id = Column(Integer, primary_key=True, index=True)
    zone_id = Column(Integer, ForeignKey("zones.id"), nullable=False, index=True)
    officer_name = Column(String(100), nullable=False)
    survey_year = Column(Integer, nullable=False)
    crack_count = Column(Integer, default=0)
    toe_erosion_severity = Column(String(50), default="None")
    slope_stability_rating = Column(Integer, default=3)
    vegetation_cover_pct = Column(Float, default=60.0)
    drainage_condition = Column(String(50), default="Good")
    notes = Column(Text, nullable=True)
    computed_vulnerability_delta = Column(Float, default=0.0)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))


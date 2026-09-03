"""
backend/main.py
FastAPI application entry point for DRISHTI-AI Landslide Early Warning System.
Coordinates CORS, database lifecycle, background ingestion scheduler, and REST routers.
"""

import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from apscheduler.schedulers.background import BackgroundScheduler

from backend.config import settings
from backend.seed_data import seed_database
from backend.database import SessionLocal
from backend.ingestion.weather import weather_service
from backend.models import Zone, WeatherReading, RiskScore
from backend.ml.model import risk_model
from backend.alerts.engine import alert_engine

# Import routers
from backend.api.routes_risk import router as risk_router
from backend.api.routes_weather import router as weather_router
from backend.api.routes_reports import router as reports_router
from backend.api.routes_alerts import router as alerts_router
from backend.api.routes_infra import router as infra_router
from backend.api.routes_infrastructure_risk import router as infra_risk_router
from backend.api.routes_sos import router as sos_router
from backend.api.routes_chatbot import router as chatbot_router
from backend.api.routes_forecast import router as forecast_router
from backend.api.routes_history import router as history_router
from backend.api.routes_vulnerability import router as vulnerability_router
from backend.api.routes_flood import router as flood_router
from backend.api.routes_escalation import router as escalation_router
from backend.api.routes_survey import router as survey_router

scheduler = BackgroundScheduler()


def scheduled_weather_poll_job():
    """Background task to periodically poll Open-Meteo & IMD and update zone risks."""
    print("[Scheduler] Running periodic weather polling cycle...")
    db = SessionLocal()
    try:
        zones = db.query(Zone).all()
        for z in zones:
            w_data = weather_service.fetch_live_zone_weather(z.center_lat, z.center_lon)
            feat = {
                "slope_angle": z.base_slope_deg,
                "rainfall_24h_mm": w_data["rainfall_24h_mm"],
                "rainfall_72h_mm": w_data["rainfall_72h_mm"],
                "antecedent_rainfall_index": w_data["antecedent_rainfall_index"],
                "soil_moisture_pct": w_data["soil_moisture_pct"],
                "distance_to_road_m": 12.0 if "Highway" in str(z.key_roads_json) else 30.0,
                "vulnerability_index": z.vulnerability_index
            }
            pred = risk_model.predict_risk(feat)

            # Check threshold and auto-dispatch alerts if risk crosses critical limit
            if pred["risk_score"] >= settings.RISK_ALERT_THRESHOLD:
                alert_engine.evaluate_and_dispatch(
                    db=db,
                    zone=z,
                    risk_score=pred["risk_score"],
                    risk_level=pred["risk_level"],
                    rainfall_24h=w_data["rainfall_24h_mm"]
                )
    except Exception as e:
        print(f"[Scheduler Error] Background poll failed: {e}")
    finally:
        db.close()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup and shutdown routine."""
    print(f"================================================================")
    print(f"  DRISHTI-AI Landslide Early Warning System — Backend Server")
    print(f"  Pilot District: {settings.PILOT_DISTRICT_NAME}")
    print(f"  Environment: {settings.ENVIRONMENT} | Port: {settings.PORT}")
    print(f"================================================================")
    
    # 1. Initialize DB and seed data
    seed_database()

    # 2. Start background scheduler (every 20 minutes)
    try:
        scheduler.add_job(scheduled_weather_poll_job, "interval", minutes=20, id="weather_ingestion")
        scheduler.start()
        print("[Lifespan] Background weather ingestion scheduler started.")
    except Exception as e:
        print(f"[Lifespan Warning] Scheduler startup: {e}")

    yield

    # Shutdown
    if scheduler.running:
        scheduler.shutdown(wait=False)
        print("[Lifespan] Scheduler stopped.")


app = FastAPI(
    title="DRISHTI_Ai Landslide Early Warning & Risk Monitoring API",
    description="Backend API for real-time landslide risk classification, GIS layers, multi-lingual alerts, and offline citizen reporting for the North Eastern Region of India (East Khasi Hills, Meghalaya pilot).",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for frontend dashboard and field-app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(risk_router)
app.include_router(weather_router)
app.include_router(reports_router)
app.include_router(alerts_router)
app.include_router(infra_router)
app.include_router(infra_risk_router)
app.include_router(sos_router)
app.include_router(chatbot_router)
app.include_router(forecast_router)
app.include_router(history_router)
app.include_router(vulnerability_router)
app.include_router(flood_router)
app.include_router(escalation_router)
app.include_router(survey_router)


@app.get("/")
def root():
    """Root status endpoint."""
    return {
        "project": "DRISHTI-AI Landslide Early Warning System",
        "pilot_district": settings.PILOT_DISTRICT_NAME,
        "status": "Operational",
        "docs_url": "/docs",
        "supported_languages": settings.alert_languages_list,
        "modules": ["ingestion", "ml", "api", "alerts", "field_reports"]
    }


@app.get("/api/health")
def health_check():
    """Health check endpoint for Docker & monitoring."""
    return {"status": "healthy", "service": "drishti-backend"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=settings.PORT, reload=True)


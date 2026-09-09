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
from backend.database import SessionLocal, get_db_info
from backend.ingestion.pipeline import ingestion_pipeline
from backend.models import Zone, WeatherReading, RiskScore
from backend.ml.model import risk_model
from backend.ml.anomaly import anomaly_detector
from backend.alerts.engine import alert_engine
from backend.cache import cache_invalidate_prefix, get_cache_status
from backend.logging_config import setup_logging

# Configure structured logging
setup_logging(json_format=False)

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
from backend.api.routes_clusters import router as clusters_router
from backend.api.routes_cap import router as cap_router
from backend.api.routes_ingestion import router as ingestion_router
from backend.api.routes_ws import router as ws_router
from backend.api.routes_anomaly import router as anomaly_router
from backend.api.ws_manager import ws_manager

from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

limiter = Limiter(key_func=get_remote_address, default_limits=["120/minute"])
scheduler = BackgroundScheduler()


def scheduled_weather_poll_job():
    """Background task to periodically run the unified multi-source data ingestion pipeline."""
    print("[Scheduler] Running periodic unified ingestion cycle (Open-Meteo, IMD, DEM, OSM, Multilingual Alerts)...")
    db = SessionLocal()
    try:
        res = ingestion_pipeline.run_full_ingestion_sync(db, auto_dispatch_alerts=True)
        print(f"[Scheduler] Ingestion cycle complete: {res.get('zones_processed', 0)} zones updated, {res.get('alerts_dispatched', 0)} alerts dispatched.")
        # 1. Invalidate Redis risk cache on fresh ingestion
        cache_invalidate_prefix("drishti:zones_risk")

        # 2. Broadcast updated zone risks to connected WebSocket clients
        try:
            import asyncio
            from backend.api.routes_risk import get_all_zones_risk
            from datetime import datetime, timezone
            updated_zones = get_all_zones_risk(db=db)
            if ws_manager.active_connections:
                asyncio.run(ws_manager.broadcast({
                    "type": "ZONE_RISK_UPDATE",
                    "source": "scheduler_ingestion",
                    "timestamp": datetime.now(timezone.utc).isoformat(),
                    "zones": updated_zones
                }))

                # 3. Check for temporal anomalies across zones
                critical_anomalies = []
                for z_info in updated_zones:
                    eval_res = anomaly_detector.evaluate_reading(
                        zone_id=str(z_info["id"]),
                        zone_name=z_info["name"],
                        rain_hourly=float(z_info.get("rainfall_24h", 0.0)) / 24.0,
                        rain_24h=float(z_info.get("rainfall_24h", 0.0)),
                        soil_moisture=float(z_info.get("soil_moisture_pct", 50.0)),
                        risk_score=float(z_info.get("risk_score", 35.0))
                    )
                    if eval_res["severity"] in ["CRITICAL", "HIGH"]:
                        critical_anomalies.append(eval_res)

                if critical_anomalies:
                    asyncio.run(ws_manager.broadcast({
                        "type": "ANOMALY_ALERT",
                        "timestamp": datetime.now(timezone.utc).isoformat(),
                        "count": len(critical_anomalies),
                        "anomalies": critical_anomalies
                    }))
                    print(f"[Scheduler Alert] Broadcast {len(critical_anomalies)} temporal anomalies via WebSocket.")
        except Exception as ws_err:
            print(f"[Scheduler Warning] Failed to broadcast WebSocket update: {ws_err}")
    except Exception as e:
        print(f"[Scheduler Error] Background ingestion pipeline failed: {e}")
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
    title="DRISHTI AI Landslide Early Warning & Risk Monitoring API",
    description="Backend API for real-time landslide risk classification, GIS layers, multi-lingual alerts, and offline citizen reporting for the North Eastern Region of India (East Khasi Hills, Meghalaya pilot).",
    version="2.0.0",
    lifespan=lifespan
)

# SlowAPI Rate Limiting
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

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
app.include_router(clusters_router)
app.include_router(cap_router)
app.include_router(ingestion_router)
app.include_router(ws_router)
app.include_router(anomaly_router)


@app.get("/")
def root():
    """Root status endpoint."""
    return {
        "project": "DRISHTI-AI Landslide Early Warning System",
        "pilot_district": settings.PILOT_DISTRICT_NAME,
        "status": "Operational",
        "docs_url": "/docs",
        "supported_languages": settings.alert_languages_list,
        "modules": ["ingestion", "ml", "api", "alerts", "field_reports", "unified_pipeline", "anomaly_detection", "probabilistic_forecast"]
    }



@app.get("/api/health")
def health_check():
    """Health check endpoint for Docker & monitoring."""
    return {
        "status": "healthy",
        "service": "drishti-backend",
        "database": get_db_info(),
        "cache": get_cache_status(),
        "ml_model": {
            "version": risk_model.model_version,
            "is_ensemble": risk_model.is_ensemble,
            "features": len(risk_model.feature_names)
        }
    }


@app.get("/api/download/apk")
def download_apk():
    """Download the official DRISHTI-AI Android APK bundle."""
    from fastapi.responses import FileResponse
    from fastapi import HTTPException
    
    apk_path = os.path.join(settings.BASE_DIR, "frontend", "public", "downloads", "drishti-ai-v1.0.apk")
    if not os.path.exists(apk_path):
        # Fallback to building APK on the fly if needed
        import subprocess
        subprocess.run(["python", os.path.join(settings.BASE_DIR, "package_apk.py")], check=False)
        
    if not os.path.exists(apk_path):
        raise HTTPException(status_code=404, detail="Android APK package is currently being built. Please try again shortly.")
        
    return FileResponse(
        path=apk_path,
        media_type="application/vnd.android.package-archive",
        filename="drishti-ai-v1.0.apk"
    )


@app.get("/api/download/apk/info")
def get_apk_info():
    """Get metadata, checksum, and capabilities for the official DRISHTI-AI Android APK."""
    info_path = os.path.join(settings.BASE_DIR, "frontend", "public", "downloads", "apk-info.json")
    if os.path.exists(info_path):
        import json
        with open(info_path, "r") as f:
            return json.load(f)
    return {
        "app_name": "DRISHTI-AI Citizen Mobile & Field Reporter",
        "version": "1.0.0-release",
        "file_name": "drishti-ai-v1.0.apk",
        "file_size_formatted": "20.97 MB",
        "target_sdk": "Android 14 (API 34)",
        "min_sdk": "Android 8.0 (API 26)",
        "architecture": "Universal (arm64-v8a, armeabi-v7a, x86_64)",
        "sha256": "fdcdd80c5f542b6e2555c5d2ec78343bae6036f8f6e434191424ac9aa210299a"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=settings.PORT, reload=True)


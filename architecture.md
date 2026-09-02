# Architecture — SIH26001 Landslide Early Warning System

*Purpose: the technical map of the system. Keep this in sync with what's actually built — if code diverges from this doc, update the doc, don't let it rot.*

## System Diagram

```
                 ┌─────────────────────────┐
                 │   External Free APIs      │
                 │  Open-Meteo | IMD | Open   │
                 │  Topo Data | Overpass |     │
                 │  LibreTranslate             │
                 └───────────┬───────────────┘
                             │
                 ┌───────────▼───────────────┐
                 │   Ingestion Layer           │
                 │   (ingestion/)                │
                 │   scheduled polling +          │
                 │   normalization                 │
                 └───────────┬───────────────┘
                             │
                 ┌───────────▼───────────────┐
                 │   ML Prediction Engine       │
                 │   (ml/)                        │
                 │   Random Forest/XGBoost         │
                 │   risk classifier                │
                 └───────────┬───────────────┘
                             │
         ┌───────────────────┼───────────────────┐
         │                   │                   │
┌────────▼────────┐ ┌────────▼────────┐ ┌────────▼─────────┐
│  API Layer         │ │ Alerts Module     │ │ Field App          │
│  (api/)              │ │ (alerts/)           │ │ (frontend/field)     │
│  FastAPI REST        │ │ Fast2SMS + FCM       │ │ React, offline queue  │
│  /api/risk etc.       │ │ + LibreTranslate       │ │ + sync                │
└─────────┬───────────┘ └─────────────────────┘ └───────────────────────┘
          │
┌─────────▼───────────┐
│  Dashboard (frontend/) │
│  React + Leaflet        │
│  risk heatmap, layers    │
└─────────────────────────┘
```

## Tech Stack

| Layer | Choice | Notes |
|---|---|---|
| Backend/API | Python + FastAPI | async support, good for polling jobs |
| Database | PostgreSQL + PostGIS | fallback: SQLite w/ lat-lon columns if PostGIS setup blocks progress |
| ML | scikit-learn / XGBoost | Random Forest baseline first |
| Dashboard | React + Leaflet.js | OSM tiles, no API key |
| Field app | React (mobile-responsive), offline-first via local queue | native app only if time remains |
| Alerts (SMS) | Fast2SMS | free test credits, India-focused |
| Alerts (push) | Firebase Cloud Messaging | free, web push |
| Translation | LibreTranslate | self-hosted or hosted free instance |
| Containerization | Docker Compose | one-command local run |
| Hosting (demo) | TBD — Render/Vercel/AWS free tier | decide in brain.md Open Questions |

## Free API Integration Map

| API | Used For | Module | Key Required? |
|---|---|---|---|
| Open-Meteo (`/v1/forecast`, `/v1/archive`) | Rainfall + soil moisture (live + historical) | `ingestion/weather.py` | No |
| IMD Public API | Official India rainfall + district warnings | `ingestion/imd.py` | No (public endpoints) |
| Open Topo Data | Point elevation/slope | `ingestion/terrain.py` | No (rate-limited) |
| OpenTopography | Bulk DEM raster for pilot district | `ingestion/terrain.py` | Yes (free tier) |
| Overpass API (OSM) | Roads, villages, infrastructure layers | `ingestion/osm.py` | No |
| LibreTranslate | Multilingual alert templates | `alerts/translate.py` | No (hosted) / self-host optional |
| Fast2SMS | SMS alerts | `alerts/sms.py` | Yes (free credits) |
| Firebase Cloud Messaging | Push notifications | `alerts/push.py` | Yes (free project) |

## Database Schema (initial draft — refine as built)

**zones**
- id, name, district, geometry (polygon/point), created_at

**risk_scores**
- id, zone_id (FK), score (0–100), category (Low/Medium/High/Critical), computed_at, model_version

**weather_readings**
- id, zone_id (FK), rainfall_mm, soil_moisture, source, recorded_at

**field_reports**
- id, zone_id (FK), reporter_type (citizen/official), photo_url, video_url, description, status (submitted/verified), synced (bool), created_at

**alerts**
- id, zone_id (FK), risk_score_id (FK), channel (sms/push), language, message, sent_at, delivery_status

## Folder Structure (target)

```
/backend
  /ingestion      # API polling + normalization (weather.py, imd.py, terrain.py, osm.py)
  /ml             # training script, model artifact, /api/risk logic
  /api            # FastAPI routes
  /alerts         # sms.py, push.py, translate.py, trigger logic
  main.py
  .env.example
/frontend
  /dashboard      # React + Leaflet GIS dashboard
  /field-app      # React field-reporting app, offline queue
/data
  seed/           # mock/seed datasets, historical landslide CSV
docker-compose.yml
brain.md
architecture.md
progress.md
README.md
DEMO_SCRIPT.md
```

## Data Flow (one cycle)
1. Scheduled job polls Open-Meteo + IMD + Overpass + terrain APIs for the pilot district
2. Ingestion layer normalizes into `weather_readings` / zone geometry updates
3. ML engine scores each zone → writes to `risk_scores`
4. If a zone's score crosses threshold → alert trigger fires → translated message sent via SMS + push
5. Dashboard polls `/api/risk` and renders the heatmap + panels
6. Field reports come in independently via the field app, queued offline if needed, synced when online, shown on the dashboard as an overlay

## Known Simplifications (mirror brain.md's Assumptions)
- No live sensors — soil/slope sensor data simulated where real feeds don't exist
- Historical landslide training data is a small seed CSV, not a full inventory
- "Real-time" = periodic polling (e.g. every 15–30 min), not continuous streaming

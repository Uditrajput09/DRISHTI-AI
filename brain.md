# Brain — Project Context & Decisions

*Purpose: the single source of truth for "why" behind this project. Read this first in every new session before touching code. Update it whenever a real decision is made — don't let it go stale.*

## What This Is
An AI-powered landslide early warning and risk monitoring platform sponsored by the Ministry of Development of North Eastern Region (MDoNER).

## Problem Summary
The North Eastern Region (NER) of India regularly faces landslides, flash floods, road blockages, and slope failures from heavy rainfall, fragile terrain, and unplanned hill cutting. Monitoring today is reactive and manual. We're building a real-time AI prediction + alert + field-reporting system to change that.

**Deadline:** 20 September 2026
**Category:** Software | **Theme:** Disaster Management

## Core Objectives
1. Predict landslide-prone zones using AI/ML
2. Deliver real-time alerts to authorities and communities
3. Provide GIS visualization of risk, roads, villages, infrastructure
4. Enable citizen/field-official geo-tagged reporting, including offline
5. Support multilingual notifications

## Key Decisions Log
*Append new entries at the bottom with a date. Don't delete old ones — history matters.*

| Decision | Reasoning | Date |
|---|---|---|
| Pilot district scope instead of full NER | Full-region coverage isn't buildable in hackathon time; a well-validated pilot is more credible than a shallow region-wide claim | 2026-09-01 |
| No dataset provided by organizers → source from free APIs | Confirmed via the official PS sheet — Dataset Link is empty | 2026-09-01 |
| Backend: FastAPI (Python) | Fast to scaffold, good ecosystem for ML + geospatial libs | 2026-09-01 |
| DB: PostgreSQL + PostGIS (fallback SQLite if setup is slow) | Geospatial queries are core to this app; fallback exists to not block progress | 2026-09-01 |
| Dashboard: React + Leaflet | Free, no API key, well-documented, fast to build a heatmap UI | 2026-09-01 |
| ML: Random Forest/XGBoost baseline, not deep learning | No real historical labels available; a simple, explainable model is more defensible in Q&A than an unvalidated deep model | 2026-09-01 |
| Alerts: Fast2SMS + Firebase Cloud Messaging | Both have usable free tiers; India-focused SMS provider fits the use case | 2026-09-01 |
| Translation: LibreTranslate | Free/open-source, avoids per-call cost of Google Translate API | 2026-09-01 |
| Pilot District: East Khasi Hills, Meghalaya | Highest rainfall belt (Sohra/Mawsynram), steep terrain, acute landslide vulnerability along NH-6/NH-106, documented historical events | 2026-09-02 |
| Alert Languages: Khasi (`kha`), Hindi (`hi`), Assamese (`as`), English (`en`) | Khasi is the indigenous language of East Khasi Hills; Assamese is widely used in regional transit; Hindi & English for administrative & national coordination | 2026-09-02 |
| Offline Field Sync: LocalStorage/IndexedDB Queue | Allows field officers and citizens without cell reception in mountain ravines to record geo-tagged photo reports and auto-sync upon returning to network range | 2026-09-02 |
| PostgreSQL + PostGIS Configured as Primary DB | Configured PostgreSQL with `psycopg2` connection pooling (`pool_size=10`, `max_overflow=20`, `pool_pre_ping=True`), dedicated Docker Compose `db` container (`postgis/postgis:15-3.3-alpine`), and automatic SQLite fallback for standalone local dev when PostgreSQL daemon is offline | 2026-09-08 |
| Full Migration to PostgreSQL + PostGIS (SQLite Completely Removed) | Migrated to live cloud PostgreSQL 17.6 + PostGIS on Supabase with psycopg2 pooling; removed SQLite fallback entirely from backend and developer workflows | 2026-09-09 |

## Assumptions (mark clearly as such in code/README too)
- No live IoT soil/slope sensors exist for this project — sensor data is mocked/simulated
- Historical landslide records are sparse — training labels are heuristic-augmented, not scientifically validated
- "Real-time" for the hackathon demo means near-real-time via periodic API polling, not continuous streaming

## Non-Goals for the Hackathon MVP
- Full NER-wide coverage (pilot district only)
- Production-grade auth/security hardening
- Native mobile app (React web app with offline support first; Flutter/RN only if time remains)
- Scientifically validated ML model — this is a defensible hackathon approximation, not a published model

## Glossary
- **NER** — North Eastern Region of India
- **MDoNER** — Ministry of Development of North Eastern Region (the sponsoring org)
- **DEM** — Digital Elevation Model (terrain/slope data)
- **PostGIS** — geospatial extension for PostgreSQL
- **GSI** — Geological Survey of India (source of landslide inventory records)
- **ARI** — Antecedent Rainfall Index

## Guardrails for Whoever/Whatever Is Coding This
- Comment clearly anywhere mocked/synthetic data stands in for something real — needed for demo Q&A honesty
- Prioritize one fully working end-to-end path (dashboard + one live alert + one field report) over broad, half-finished coverage
- Keep `.env.example` up to date whenever a new API key is introduced
- Don't silently change the pilot district or core tech stack — log it in the Decisions table above first

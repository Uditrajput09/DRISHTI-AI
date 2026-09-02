# AGENTS.md — Workspace Rules for SIH26001

*This file is auto-loaded by Antigravity (and other AGENTS.md-compatible tools) at the start of every session — you don't need to paste it in manually. Keep it short and concrete; put longer context in brain.md / architecture.md / progress.md instead of growing this file.*

## Before Doing Anything
Read, in this order: `brain.md` → `architecture.md` → `progress.md`.
At the end of the session, update `progress.md` (move finished items, note blockers, set the "next session starting point").

## Project
AI-based landslide early warning system for SIH26001 (hackathon MVP, deadline 20 Sept 2026). Full context lives in `brain.md`.

## Tech Stack
- Backend: Python + FastAPI
- DB: PostgreSQL + PostGIS (fallback: SQLite if PostGIS setup blocks progress — note the fallback in progress.md if used)
- ML: scikit-learn / XGBoost
- Dashboard: React + Leaflet.js
- Field app: React (mobile-responsive), offline-first
- Alerts: Fast2SMS (SMS) + Firebase Cloud Messaging (push) + LibreTranslate (multilingual)
- Containerization: Docker Compose

Don't swap any of these without logging the change (and why) in brain.md's Decisions Log first.

## Code Conventions
- Python: type hints on function signatures, PEP8, docstrings on public functions
- React: functional components + hooks, one component per file
- Folder structure: follow `architecture.md` exactly — if you need a new top-level folder, add it to architecture.md in the same change
- Keep modules small and single-purpose (ingestion/, ml/, api/, alerts/ stay separate — don't cross-import logic between them beyond clean interfaces)

## Environment & Secrets
- Never hardcode API keys, tokens, or credentials in source files
- Every key used must have a placeholder in `.env.example` with a comment explaining what it's for and where to get it
- Read all secrets via environment variables (`os.environ` / `.env` loader), never inline

## Mocked / Synthetic Data
- No real IoT sensors, and historical landslide records are a small seed dataset — this is expected for a hackathon MVP
- Any time you use mocked, synthetic, or heuristic-generated data in place of something real, comment it clearly at the point of use (e.g. `# MOCKED: no live sensor feed, using simulated soil moisture`)
- Never let mocked data pass silently as if it were live — this matters for demo Q&A honesty

## Testing
- After building each module, run it and confirm it actually returns/does what it claims before moving to the next module
- For the ML model: report precision/recall against the seed dataset before considering it done
- For offline sync: manually verify the queue-and-sync flow works, don't just assume the code compiles

## Priorities Under Time Pressure
If you have to cut scope, cut in this order (see brain.md for full reasoning):
1. Shrink pilot area further
2. Simplify offline sync
3. Reduce to 1 alert language + English
4. Simplify the ML model
Never cut: a working dashboard, at least one live alert, and one field report in the demo path.

## Git Conventions
- Commit messages: short imperative summary (e.g. `Add rainfall ingestion from Open-Meteo`), no need for conventional-commit prefixes unless the team adopts them later
- Don't commit `.env` (only `.env.example`)
- Don't commit generated model artifacts larger than a few MB — note in progress.md how to regenerate them instead

## Safety Guardrails
- Ask before deleting any file that isn't clearly a build artifact
- Ask before changing the pilot district or core tech stack (log the reason in brain.md first)
- Ask before any destructive DB operation (drop table, truncate) outside of local dev seeding

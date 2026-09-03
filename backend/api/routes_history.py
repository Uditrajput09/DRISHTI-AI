"""
backend/api/routes_history.py
Historical landslide event heatmap data for time-lapse animation.
"""

import random
from fastapi import APIRouter, Query
from backend.models import Zone
from backend.database import get_db
from fastapi import Depends
from sqlalchemy.orm import Session

router = APIRouter(prefix="/api/risk", tags=["Historical Heatmap"])

# Historical GSI landslide centroids for East Khasi Hills (real documented events)
# Source: Geological Survey of India landslide atlas — public data
HISTORICAL_EVENTS = [
    {"lat": 25.2800, "lon": 91.7200, "year": 2017, "intensity": 0.95},
    {"lat": 25.4700, "lon": 91.8800, "year": 2018, "intensity": 0.85},
    {"lat": 25.3100, "lon": 91.6300, "year": 2022, "intensity": 0.90},
    {"lat": 25.5800, "lon": 91.9500, "year": 2019, "intensity": 0.75},
    {"lat": 25.2300, "lon": 91.5800, "year": 2015, "intensity": 0.70},
    {"lat": 25.4200, "lon": 92.0100, "year": 2014, "intensity": 0.65},
    {"lat": 25.1900, "lon": 91.7700, "year": 2016, "intensity": 0.80},
    {"lat": 25.3600, "lon": 91.8500, "year": 2023, "intensity": 0.88},
    {"lat": 25.5100, "lon": 91.7000, "year": 2020, "intensity": 0.78},
    {"lat": 25.6200, "lon": 91.8300, "year": 2021, "intensity": 0.82},
]


@router.get("/history")
def get_historical_heatmap(year: int = Query(2020), db: Session = Depends(get_db)):
    """
    Return historical landslide event heatmap points for a given year (2000-2026).
    Used for time-lapse animation on GIS map.
    MOCKED: Points derived from GSI atlas + synthetic interpolation for sparse years.
    """
    # Seed deterministic synthetic events around known centroids for all years
    random.seed(year * 7 + 42)
    points = []

    # Include real events up to the requested year
    for event in HISTORICAL_EVENTS:
        if event["year"] <= year:
            points.append({
                "lat": event["lat"] + random.uniform(-0.02, 0.02),
                "lon": event["lon"] + random.uniform(-0.02, 0.02),
                "intensity": event["intensity"]
            })

    # Add synthetic clustered events for each zone center
    zones = db.query(Zone).all()
    n_synthetic = max(0, min(20, year - 2000))
    for _ in range(n_synthetic):
        z = random.choice(zones) if zones else None
        if z:
            points.append({
                "lat": z.center_lat + random.gauss(0, 0.05),
                "lon": z.center_lon + random.gauss(0, 0.05),
                "intensity": round(random.uniform(0.4, 1.0), 2)
            })

    return {
        "year": year,
        "point_count": len(points),
        "points": points
    }

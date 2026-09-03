"""
backend/api/routes_infrastructure_risk.py
Road blockage prediction based on zone risk levels.
"""

import json
import math
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from backend.database import get_db
from backend.models import Zone, RiskScore, InfrastructureItem

router = APIRouter(prefix="/api/infrastructure", tags=["Infrastructure Risk"])


def haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Great-circle distance between two lat/lon points in km."""
    R = 6371.0
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlam = math.radians(lon2 - lon1)
    a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlam / 2) ** 2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


@router.get("/route-impact")
def get_route_impact(zone_id: int = Query(..., description="Zone ID to check"), db: Session = Depends(get_db)):
    """
    Assess which road segments are likely blocked due to a high-risk zone landslide event.
    Returns blocked roads and alternate route hints.
    """
    zone = db.query(Zone).filter(Zone.id == zone_id).first()
    if not zone:
        raise HTTPException(status_code=404, detail="Zone not found")

    latest_risk = (
        db.query(RiskScore)
        .filter(RiskScore.zone_id == zone_id)
        .order_by(desc(RiskScore.computed_at))
        .first()
    )
    risk_score = latest_risk.risk_score if latest_risk else 0.0
    risk_level = latest_risk.risk_level if latest_risk else "Low"

    # Only flag roads if zone is High or Critical
    blocked_roads = []
    alternate_hints = []

    if risk_score >= 60.0:
        roads = db.query(InfrastructureItem).filter(InfrastructureItem.type == "road").all()
        for road in roads:
            details = json.loads(road.details_json) if road.details_json else {}
            coords = details.get("coordinates", [])
            if not coords:
                continue
            # Check if any road segment point is within 15 km of zone center
            for pt in coords:
                if len(pt) >= 2:
                    dist_km = haversine_km(zone.center_lat, zone.center_lon, pt[1], pt[0])
                    if dist_km <= 15.0:
                        blocked_roads.append({
                            "road_id": road.item_id,
                            "road_name": road.name,
                            "category": road.category or "Highway",
                            "distance_km": round(dist_km, 2),
                            "vulnerability": details.get("vulnerability", "High"),
                            "status": "Likely Blocked"
                        })
                        # Mark as at-risk in DB
                        road.status = "At Risk"
                        db.commit()
                        break

        # Generate alternate route hints (static for MVP pilot area)
        # MOCKED: Real routing requires graph traversal over OSM road network
        if blocked_roads:
            alternate_hints = [
                "Detour via NH-6 alternative at Nongstoin connecting to Shillong bypass",
                "Route via Jowai–Shillong road (NH-40) if NH-6 near Nongpoh is blocked",
                "Air evacuation from Umroi Airport (VEUK) for critical medical emergencies"
            ]

    return {
        "zone_id": zone_id,
        "zone_name": zone.name,
        "risk_level": risk_level,
        "risk_score": risk_score,
        "blocked_roads": blocked_roads,
        "alternate_route_hints": alternate_hints,
        "assessment": "Road blockage likely" if blocked_roads else "No significant road blockage predicted"
    }


@router.get("/vulnerability-map")
def get_infrastructure_risk_map(db: Session = Depends(get_db)):
    """All infrastructure items with current risk status for GIS overlay."""
    items = db.query(InfrastructureItem).all()
    return [
        {
            "id": item.id,
            "item_id": item.item_id,
            "name": item.name,
            "type": item.type,
            "latitude": item.latitude,
            "longitude": item.longitude,
            "status": item.status
        }
        for item in items
    ]

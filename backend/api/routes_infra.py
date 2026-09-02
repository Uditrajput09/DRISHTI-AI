"""
backend/api/routes_infra.py
Critical infrastructure, hospitals, safe shelters, road network, and evacuation paths.
"""

from typing import List, Optional
import json
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models import InfrastructureItem

router = APIRouter(prefix="/api/infrastructure", tags=["Critical Infrastructure"])


@router.get("/facilities")
def get_facilities(type_filter: Optional[str] = Query(None), db: Session = Depends(get_db)):
    """List hospitals, disaster shelters, and emergency operations centers in East Khasi Hills."""
    query = db.query(InfrastructureItem).filter(
        InfrastructureItem.type.in_(["hospital", "shelter", "emergency_center"])
    )
    if type_filter:
        query = query.filter(InfrastructureItem.type == type_filter)

    items = query.all()
    results = []
    for item in items:
        details = json.loads(item.details_json) if item.details_json else {}
        results.append({
            "id": item.id,
            "item_id": item.item_id,
            "name": item.name,
            "type": item.type,
            "category": item.category,
            "latitude": item.latitude,
            "longitude": item.longitude,
            "capacity": item.capacity,
            "contact": item.contact,
            "zone_id": item.zone_id,
            "status": item.status,
            "details": details
        })
    return results


@router.get("/roads")
def get_roads(db: Session = Depends(get_db)):
    """List key highway corridors (NH-6, NH-206, SH-5) and their vulnerability/blockage status."""
    items = db.query(InfrastructureItem).filter(InfrastructureItem.type == "road").all()
    results = []
    for item in items:
        details = json.loads(item.details_json) if item.details_json else {}
        results.append({
            "id": item.id,
            "item_id": item.item_id,
            "name": item.name,
            "type": item.type,
            "category": item.category,
            "status": item.status,
            "coordinates": details.get("coordinates", []),
            "vulnerability": details.get("vulnerability", "Moderate")
        })
    return results


@router.get("/evacuation-routes")
def get_evacuation_routes(db: Session = Depends(get_db)):
    """List safe evacuation corridors connecting high-risk zones to shelters."""
    items = db.query(InfrastructureItem).filter(InfrastructureItem.type == "evacuation_route").all()
    results = []
    for item in items:
        details = json.loads(item.details_json) if item.details_json else {}
        results.append({
            "id": item.id,
            "item_id": item.item_id,
            "name": item.name,
            "from_zone": details.get("from_zone", ""),
            "to_shelter": details.get("to_shelter", ""),
            "status": item.status,
            "safety_rating": details.get("safety_rating", 4.5)
        })
    return results

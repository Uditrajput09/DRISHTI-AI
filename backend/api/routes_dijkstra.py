"""
backend/api/routes_dijkstra.py
REST endpoints for Dijkstra-optimized evacuation route planning,
dynamic road blockage simulation, and road network graph GeoJSON export.
"""

from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models import Zone, RiskScore
from backend.ml.evacuation_graph import evacuation_graph

router = APIRouter(prefix="/api/evacuation", tags=["Dijkstra Evacuation Optimization"])


class DijkstraRouteRequest(BaseModel):
    origin_zone_id: Optional[str] = Field(None, description="Origin micro-zone ID (e.g. 'EKH-Z01') or tourist landmark ID")
    lat: Optional[float] = Field(None, description="Origin latitude for GPS coordinates")
    lon: Optional[float] = Field(None, description="Origin longitude for GPS coordinates")
    target_type: Optional[str] = Field("all", description="'shelter', 'hospital', or 'all'")
    max_risk_threshold: Optional[float] = Field(100.0, description="Upper risk limit to consider")
    k: Optional[int] = Field(3, description="Number of ranked alternative paths to compute")


class RoadBlockageRequest(BaseModel):
    road_identifier: str = Field(..., description="Road name or edge ID (e.g. 'SH-5', 'NH-6', 'E_SH5_02')")
    blocked: bool = Field(True, description="True to block, False to clear")
    reason: Optional[str] = Field("Landslide debris flow blocking 2 lanes", description="Reason for road closure")


def _sync_graph_risks(db: Session) -> None:
    """Synchronize latest zone risk scores into the evacuation graph."""
    try:
        zones = db.query(Zone).all()
        risk_map = {}
        for z in zones:
            latest_risk = (
                db.query(RiskScore)
                .filter(RiskScore.zone_id == z.id)
                .order_by(RiskScore.computed_at.desc())
                .first()
            )
            if latest_risk:
                risk_map[z.zone_code] = {
                    "risk_score": latest_risk.risk_score,
                    "risk_level": latest_risk.risk_level
                }
            else:
                risk_map[z.zone_code] = {
                    "risk_score": z.vulnerability_index * 60.0,
                    "risk_level": "Medium"
                }
        evacuation_graph.update_zone_risks(risk_map)
    except Exception as e:
        # Fallback to existing graph risks on transient db errors
        pass


@router.post("/dijkstra")
def plan_dijkstra_evacuation(
    req: DijkstraRouteRequest,
    db: Session = Depends(get_db)
):
    """
    Compute optimal evacuation corridors using Dijkstra's algorithm over a
    risk-weighted road graph with terrain slope and active landslide penalties.
    Returns up to k ranked alternative paths (Primary, Alternate Bypass, Backup facility).
    """
    _sync_graph_risks(db)

    origin = None
    if req.origin_zone_id:
        origin = req.origin_zone_id.strip()
    elif req.lat is not None and req.lon is not None:
        origin = (req.lat, req.lon)
    else:
        # Default to Sohra tourist hotspot if nothing passed
        origin = "spot_nohkalikai"

    try:
        result = evacuation_graph.plan_evacuation_routes(
            origin=origin,
            target_category=req.target_type or "all",
            max_risk_threshold=req.max_risk_threshold or 100.0,
            k=req.k or 3
        )
        return {
            "status": "success",
            **result
        }
    except ValueError as val_err:
        raise HTTPException(status_code=400, detail=str(val_err))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Dijkstra evacuation solver failed: {exc}")


@router.get("/graph")
def get_evacuation_graph(db: Session = Depends(get_db)):
    """
    Export the road network graph as a GeoJSON FeatureCollection.
    Includes road lines with traversal weights and nodes with facility metadata.
    """
    _sync_graph_risks(db)
    return evacuation_graph.to_geojson()


@router.get("/graph/weights")
def get_evacuation_weights(db: Session = Depends(get_db)):
    """
    Retrieve an XAI tabular breakdown of all edge weights,
    including distance cost, zone landslide risk penalty, and terrain slope penalty.
    """
    _sync_graph_risks(db)
    breakdown = evacuation_graph.get_weights_breakdown()
    return {
        "status": "success",
        "total_segments": len(breakdown),
        "active_blockages": len(evacuation_graph.blockages),
        "segments": breakdown
    }


@router.post("/blockage")
def set_road_blockage(req: RoadBlockageRequest):
    """
    Dynamically simulate or clear a road blockage on an arterial highway or link corridor.
    Dijkstra routes will immediately reroute around the blocked segment.
    """
    affected = evacuation_graph.set_road_blockage(
        road_identifier=req.road_identifier,
        blocked=req.blocked,
        reason=req.reason or "Active landslide debris blockage"
    )
    return {
        "status": "success",
        "road_identifier": req.road_identifier,
        "blocked": req.blocked,
        "reason": req.reason,
        "affected_segments": affected,
        "active_blockages": list(evacuation_graph.blockages.keys())
    }


@router.post("/clear-blockages")
def clear_all_blockages():
    """Clear all active simulated road blockages."""
    evacuation_graph.clear_all_blockages()
    return {
        "status": "success",
        "message": "All road blockages have been cleared. Corridors restored."
    }

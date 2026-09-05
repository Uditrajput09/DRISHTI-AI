"""
backend/api/routes_clusters.py
DBSCAN geo-clustering of citizen and field hazard reports.
Detects spatial landslide hotspot clusters and distinguishes isolated noise reports
for NDMA / District Disaster Management verification.
"""

from typing import Dict, Any, List, Optional
from collections import defaultdict
import numpy as np
from sklearn.cluster import DBSCAN
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models import FieldReport

router = APIRouter(prefix="/api/clusters", tags=["Geo Clustering & Hotspots"])


@router.get("/hotspots")
def get_report_clusters(
    eps_deg: float = Query(0.012, description="DBSCAN epsilon radius in degrees (~1.3km)"),
    min_samples: int = Query(2, description="Minimum reports required to declare a cluster"),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Compute DBSCAN spatial clusters from active citizen and official field reports.
    Returns GeoJSON FeatureCollection of hotspot clusters and isolated observations.
    """
    reports = (
        db.query(FieldReport)
        .filter(FieldReport.latitude.isnot(None), FieldReport.longitude.isnot(None))
        .all()
    )

    if not reports:
        return {
            "type": "FeatureCollection",
            "features": [],
            "summary": {
                "total_reports": 0,
                "cluster_count": 0,
                "isolated_count": 0
            }
        }

    coords = np.array([[r.latitude, r.longitude] for r in reports])

    if len(coords) < min_samples:
        features = []
        for r in reports:
            features.append({
                "type": "Feature",
                "geometry": {
                    "type": "Point",
                    "coordinates": [r.longitude, r.latitude]
                },
                "properties": {
                    "cluster_id": -1,
                    "report_id": r.id,
                    "report_uid": r.report_uid,
                    "status": "pending_isolated",
                    "confidence": "low",
                    "hazard_type": r.hazard_type,
                    "severity": r.severity,
                    "description": r.description
                }
            })
        return {
            "type": "FeatureCollection",
            "features": features,
            "summary": {
                "total_reports": len(reports),
                "cluster_count": 0,
                "isolated_count": len(reports)
            }
        }

    # Run DBSCAN geo-clustering
    clustering = DBSCAN(eps=eps_deg, min_samples=min_samples, metric="euclidean").fit(coords)
    labels = clustering.labels_

    clusters_dict = defaultdict(list)
    isolated_reports = []

    for idx, label in enumerate(labels):
        rep = reports[idx]
        if label == -1:
            isolated_reports.append(rep)
        else:
            clusters_dict[label].append(rep)

    features = []

    # Format confirmed clusters
    severity_order = {"Critical": 4, "Severe": 3, "Moderate": 2, "Minor": 1}
    for cluster_id, cluster_reps in clusters_dict.items():
        c_lats = [r.latitude for r in cluster_reps]
        c_lons = [r.longitude for r in cluster_reps]
        centroid_lat = float(np.mean(c_lats))
        centroid_lon = float(np.mean(c_lons))
        count = len(cluster_reps)

        highest_sev = max(
            (r.severity for r in cluster_reps),
            key=lambda s: severity_order.get(s, 0),
            default="Moderate"
        )
        hazards = list({r.hazard_type for r in cluster_reps if r.hazard_type})
        confidence = "critical" if count >= 4 else ("high" if count >= 2 else "medium")

        features.append({
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [round(centroid_lon, 5), round(centroid_lat, 5)]
            },
            "properties": {
                "cluster_id": int(cluster_id),
                "status": "confirmed_hotspot",
                "confidence": confidence,
                "report_count": count,
                "highest_severity": highest_sev,
                "hazard_types": hazards,
                "center_lat": round(centroid_lat, 5),
                "center_lon": round(centroid_lon, 5),
                "member_report_ids": [r.id for r in cluster_reps],
                "member_report_uids": [r.report_uid for r in cluster_reps]
            }
        })

    # Format isolated observations
    for r in isolated_reports:
        features.append({
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [r.longitude, r.latitude]
            },
            "properties": {
                "cluster_id": -1,
                "report_id": r.id,
                "report_uid": r.report_uid,
                "status": "pending_isolated",
                "confidence": "low",
                "hazard_type": r.hazard_type,
                "severity": r.severity,
                "description": r.description
            }
        })

    return {
        "type": "FeatureCollection",
        "features": features,
        "summary": {
            "total_reports": len(reports),
            "cluster_count": len(clusters_dict),
            "isolated_count": len(isolated_reports)
        }
    }


@router.get("/report-confidence")
def get_report_confidence_list(
    eps_deg: float = Query(0.012),
    min_samples: int = Query(2),
    db: Session = Depends(get_db)
) -> List[Dict[str, Any]]:
    """
    List all field reports annotated with their DBSCAN geo-confidence classification.
    """
    reports = (
        db.query(FieldReport)
        .filter(FieldReport.latitude.isnot(None), FieldReport.longitude.isnot(None))
        .all()
    )

    if not reports:
        return []

    coords = np.array([[r.latitude, r.longitude] for r in reports])

    if len(coords) < min_samples:
        return [
            {
                "report_id": r.id,
                "report_uid": r.report_uid,
                "cluster_id": -1,
                "geo_confidence": "pending_isolated",
                "neighbor_count": 0,
                "latitude": r.latitude,
                "longitude": r.longitude
            }
            for r in reports
        ]

    clustering = DBSCAN(eps=eps_deg, min_samples=min_samples, metric="euclidean").fit(coords)
    labels = clustering.labels_

    results = []
    for idx, label in enumerate(labels):
        r = reports[idx]
        is_clustered = label >= 0
        neighbor_count = int(np.sum(labels == label)) if is_clustered else 0
        results.append({
            "report_id": r.id,
            "report_uid": r.report_uid,
            "cluster_id": int(label),
            "geo_confidence": "confirmed_hotspot" if is_clustered else "pending_isolated",
            "neighbor_count": neighbor_count,
            "latitude": r.latitude,
            "longitude": r.longitude
        })

    return results

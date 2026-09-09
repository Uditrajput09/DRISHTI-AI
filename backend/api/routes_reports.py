"""
backend/api/routes_reports.py
Citizen and field official reporting API endpoints.
Supports geo-tagged photo submissions, status updates, and batch offline queue synchronization.
"""

from typing import List, Optional
import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc

from backend.database import get_db
from backend.models import FieldReport, Zone
from backend.schemas import FieldReportCreate, BatchReportSyncRequest
from backend.security import mask_contact, verify_admin_key

router = APIRouter(prefix="/api/reports", tags=["Field Reports"])


@router.post("/submit")
def submit_field_report(req: FieldReportCreate, db: Session = Depends(get_db)):
    """
    Submit a single geo-tagged field/citizen report with photo.
    Assigns nearest zone automatically if zone_id not supplied.
    """
    report_uid = req.report_uid or f"REP-{uuid.uuid4().hex[:8].upper()}"

    # Check if duplicate submission from offline queue
    existing = db.query(FieldReport).filter(FieldReport.report_uid == report_uid).first()
    if existing:
        return {"status": "already_synced", "report_id": existing.id, "report_uid": report_uid}

    # Auto-match nearest zone if zone_id is not specified
    matched_zone_id = req.zone_id
    if not matched_zone_id:
        zones = db.query(Zone).all()
        if zones:
            # Simple euclidean distance matching
            best_z = min(
                zones,
                key=lambda z: (z.center_lat - req.latitude) ** 2 + (z.center_lon - req.longitude) ** 2
            )
            matched_zone_id = best_z.id

    now_utc = datetime.now(timezone.utc)

    # Check for existing nearby reports (~1.3km / 0.012 deg) to flag clustered hotspot
    nearby = (
        db.query(FieldReport)
        .filter(
            FieldReport.latitude.isnot(None),
            FieldReport.longitude.isnot(None),
            FieldReport.latitude.between(req.latitude - 0.012, req.latitude + 0.012),
            FieldReport.longitude.between(req.longitude - 0.012, req.longitude + 0.012)
        )
        .first()
    )
    initial_status = "confirmed_hotspot" if nearby else "submitted"
    geo_confidence = "confirmed_hotspot" if nearby else "pending_isolated"

    report = FieldReport(
        report_uid=report_uid,
        zone_id=matched_zone_id,
        reporter_type=req.reporter_type,
        reporter_name=req.reporter_name,
        reporter_contact=req.reporter_contact,
        latitude=req.latitude,
        longitude=req.longitude,
        hazard_type=req.hazard_type,
        severity=req.severity,
        description=req.description,
        photo_data_url=req.photo_data_url,
        status=initial_status,
        synced=True,
        device_created_at=req.device_created_at or now_utc,
        server_received_at=now_utc
    )
    db.add(report)
    db.commit()
    db.refresh(report)

    return {
        "status": "success",
        "report_id": report.id,
        "report_uid": report.report_uid,
        "matched_zone_id": matched_zone_id,
        "geo_confidence": geo_confidence,
        "message": "Report successfully recorded and mapped to risk grid."
    }


@router.post("/sync-queue")
def sync_offline_report_queue(req: BatchReportSyncRequest, db: Session = Depends(get_db)):
    """
    Batch sync endpoint for offline queued field reports.
    Iterates through queued reports, checks deduplication by report_uid, and persists new entries.
    """
    synced_count = 0
    duplicate_count = 0
    errors = []
    zones = db.query(Zone).all()

    for item in req.reports:
        try:
            report_uid = item.report_uid or f"OFFLINE-{uuid.uuid4().hex[:8].upper()}"
            existing = db.query(FieldReport).filter(FieldReport.report_uid == report_uid).first()
            if existing:
                duplicate_count += 1
                continue

            # Auto-match nearest zone
            matched_zone_id = item.zone_id
            if not matched_zone_id and zones:
                best_z = min(
                    zones,
                    key=lambda z: (z.center_lat - item.latitude) ** 2 + (z.center_lon - item.longitude) ** 2
                )
                matched_zone_id = best_z.id

            now_utc = datetime.now(timezone.utc)
            new_rep = FieldReport(
                report_uid=report_uid,
                zone_id=matched_zone_id,
                reporter_type=item.reporter_type,
                reporter_name=item.reporter_name,
                reporter_contact=item.reporter_contact,
                latitude=item.latitude,
                longitude=item.longitude,
                hazard_type=item.hazard_type,
                severity=item.severity,
                description=item.description,
                photo_data_url=item.photo_data_url,
                status="submitted",
                synced=True,
                device_created_at=item.device_created_at or now_utc,
                server_received_at=now_utc
            )
            db.add(new_rep)
            synced_count += 1
        except Exception as e:
            errors.append(str(e))

    db.commit()


    return {
        "status": "success",
        "synced_count": synced_count,
        "duplicate_count": duplicate_count,
        "errors": errors,
        "message": f"Successfully synced {synced_count} offline reports."
    }


@router.get("/list")
def list_field_reports(
    zone_id: Optional[int] = Query(None),
    status: Optional[str] = Query(None),
    limit: int = Query(50),
    db: Session = Depends(get_db)
):
    """List submitted field reports with photo previews, geolocation, and status."""
    query = db.query(FieldReport)
    if zone_id:
        query = query.filter(FieldReport.zone_id == zone_id)
    if status:
        query = query.filter(FieldReport.status == status)

    reports = query.order_by(desc(FieldReport.server_received_at)).limit(limit).all()

    results = []
    for r in reports:
        results.append({
            "id": r.id,
            "report_uid": r.report_uid,
            "zone_id": r.zone_id,
            "zone_name": r.zone.name if r.zone else "District Wide",
            "reporter_type": r.reporter_type,
            "reporter_name": r.reporter_name,
            "reporter_contact": mask_contact(r.reporter_contact),
            "latitude": r.latitude,
            "longitude": r.longitude,
            "hazard_type": r.hazard_type,
            "severity": r.severity,
            "description": r.description,
            "photo_data_url": r.photo_data_url,
            "status": r.status,
            "synced": r.synced,
            "device_created_at": r.device_created_at.isoformat() if r.device_created_at else None,
            "server_received_at": r.server_received_at.isoformat() if r.server_received_at else None
        })

    return results


@router.post("/{report_id}/verify")
def verify_field_report(
    report_id: int,
    status: str = Query("verified"),
    db: Session = Depends(get_db),
    admin_auth: bool = Depends(verify_admin_key)
):
    """Update verification status of a report by district disaster management authorities."""
    report = db.query(FieldReport).filter(FieldReport.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    report.status = status
    db.commit()
    return {"status": "success", "report_id": report.id, "new_status": report.status}

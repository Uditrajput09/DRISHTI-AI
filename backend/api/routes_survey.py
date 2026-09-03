"""
backend/api/routes_survey.py
Pre-Monsoon Vulnerability Survey Module — field officer annual assessment form.
"""

from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from backend.database import get_db
from backend.models import Zone, AnnualSurvey

router = APIRouter(prefix="/api/survey", tags=["Pre-Monsoon Survey"])


class SurveySubmission(BaseModel):
    zone_id: int
    officer_name: str
    survey_year: int
    crack_count: int = 0
    toe_erosion_severity: str = "None"  # None, Minor, Moderate, Severe
    slope_stability_rating: int = 3    # 1 (very unstable) to 5 (stable)
    vegetation_cover_pct: float = 60.0
    drainage_condition: str = "Good"   # Good, Moderate, Poor, Blocked
    notes: Optional[str] = None


def compute_vulnerability_delta(payload: SurveySubmission) -> float:
    """
    Compute change in vulnerability index from survey observations.
    Positive delta = zone is more vulnerable than previously assessed.
    """
    delta = 0.0
    if payload.crack_count > 5: delta += 0.08
    elif payload.crack_count > 2: delta += 0.04

    erosion_map = {"None": 0.0, "Minor": 0.03, "Moderate": 0.06, "Severe": 0.12}
    delta += erosion_map.get(payload.toe_erosion_severity, 0.0)

    stability_delta = (3 - payload.slope_stability_rating) * 0.04
    delta += stability_delta

    if payload.vegetation_cover_pct < 30: delta += 0.06
    elif payload.vegetation_cover_pct < 50: delta += 0.03

    drainage_map = {"Good": -0.02, "Moderate": 0.0, "Poor": 0.04, "Blocked": 0.10}
    delta += drainage_map.get(payload.drainage_condition, 0.0)

    return round(max(-0.15, min(0.25, delta)), 3)


@router.post("/submit")
def submit_survey(payload: SurveySubmission, db: Session = Depends(get_db)):
    """Submit a pre-monsoon survey assessment and update zone vulnerability index."""
    zone = db.query(Zone).filter(Zone.id == payload.zone_id).first()
    if not zone:
        raise HTTPException(status_code=404, detail="Zone not found")

    delta = compute_vulnerability_delta(payload)
    old_vuln = zone.vulnerability_index
    zone.vulnerability_index = round(max(0.1, min(0.99, old_vuln + delta)), 3)

    survey = AnnualSurvey(
        zone_id=payload.zone_id,
        officer_name=payload.officer_name,
        survey_year=payload.survey_year,
        crack_count=payload.crack_count,
        toe_erosion_severity=payload.toe_erosion_severity,
        slope_stability_rating=payload.slope_stability_rating,
        vegetation_cover_pct=payload.vegetation_cover_pct,
        drainage_condition=payload.drainage_condition,
        notes=payload.notes,
        computed_vulnerability_delta=delta,
        created_at=datetime.now(timezone.utc)
    )
    db.add(survey)
    db.commit()
    db.refresh(survey)

    return {
        "survey_id": survey.id,
        "zone_id": payload.zone_id,
        "zone_name": zone.name,
        "old_vulnerability_index": round(old_vuln, 3),
        "new_vulnerability_index": zone.vulnerability_index,
        "vulnerability_delta": delta,
        "message": f"Survey recorded. Vulnerability index updated from {old_vuln:.3f} to {zone.vulnerability_index:.3f}."
    }


@router.get("/history")
def get_survey_history(zone_id: int = Query(...), db: Session = Depends(get_db)):
    """Return past survey records for a zone."""
    surveys = (
        db.query(AnnualSurvey)
        .filter(AnnualSurvey.zone_id == zone_id)
        .order_by(AnnualSurvey.created_at.desc())
        .all()
    )
    return [
        {
            "survey_id": s.id,
            "zone_id": s.zone_id,
            "officer_name": s.officer_name,
            "survey_year": s.survey_year,
            "crack_count": s.crack_count,
            "toe_erosion_severity": s.toe_erosion_severity,
            "slope_stability_rating": s.slope_stability_rating,
            "vegetation_cover_pct": s.vegetation_cover_pct,
            "drainage_condition": s.drainage_condition,
            "computed_vulnerability_delta": s.computed_vulnerability_delta,
            "notes": s.notes,
            "created_at": s.created_at.isoformat() if s.created_at else None
        }
        for s in surveys
    ]

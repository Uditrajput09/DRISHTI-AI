"""
backend/api/routes_cap.py
Common Alerting Protocol (CAP v1.2) XML export endpoints.
Provides OASIS standard emergency alert XML documents for NDMA/SDMA integration.
"""

from typing import Optional
from datetime import datetime, timezone, timedelta
import json
import xml.etree.ElementTree as ET
from xml.dom import minidom
from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session
from sqlalchemy import desc

from backend.database import get_db
from backend.models import AlertLog, Zone, RiskScore

router = APIRouter(prefix="/api/alerts/cap", tags=["CAP v1.2 Alerts Export"])

CAP_NS = "urn:oasis:names:tc:emergency:cap:1.2"


def _build_cap_document(alert: AlertLog, zone: Optional[Zone] = None) -> str:
    """Generate OASIS CAP v1.2 compliant XML string from an AlertLog record."""
    severity_map = {
        "Critical": "Extreme",
        "High": "Severe",
        "Medium": "Moderate",
        "Low": "Minor"
    }
    urgency_map = {
        "Critical": "Immediate",
        "High": "Expected",
        "Medium": "Expected",
        "Low": "Future"
    }
    certainty_map = {
        "Critical": "Observed",
        "High": "Likely",
        "Medium": "Possible",
        "Low": "Possible"
    }

    # Root CAP Alert element
    root = ET.Element("alert", xmlns=CAP_NS)

    sent_time = alert.sent_at if alert.sent_at else datetime.now(timezone.utc)
    sent_iso = sent_time.isoformat()
    expires_iso = (sent_time + timedelta(hours=24)).isoformat()
    identifier = f"DRISHTI-EKH-{alert.id:04d}-{int(sent_time.timestamp())}"

    ET.SubElement(root, "identifier").text = identifier
    ET.SubElement(root, "sender").text = "drishti-disaster-response@meghalaya.gov.in"
    ET.SubElement(root, "sent").text = sent_iso
    ET.SubElement(root, "status").text = "Actual" if alert.status != "simulated" else "Exercise"
    ET.SubElement(root, "msgType").text = "Alert"
    ET.SubElement(root, "source").text = "DRISHTI-AI Early Warning Platform"
    ET.SubElement(root, "scope").text = "Public"

    # Info block
    info = ET.SubElement(root, "info")
    ET.SubElement(info, "language").text = alert.language or "en"
    ET.SubElement(info, "category").text = "Geo"
    ET.SubElement(info, "event").text = "Landslide Threat / Slope Instability Warning"
    ET.SubElement(info, "urgency").text = urgency_map.get(alert.risk_level, "Expected")
    ET.SubElement(info, "severity").text = severity_map.get(alert.risk_level, "Moderate")
    ET.SubElement(info, "certainty").text = certainty_map.get(alert.risk_level, "Likely")

    event_code = ET.SubElement(info, "eventCode")
    ET.SubElement(event_code, "valueName").text = "SAME"
    ET.SubElement(event_code, "value").text = "LSW"

    ET.SubElement(info, "expires").text = expires_iso
    ET.SubElement(info, "senderName").text = "Meghalaya State Disaster Management Authority (SDMA) / DRISHTI-AI"

    zone_obj = zone or alert.zone
    zone_name = zone_obj.name if zone_obj else "East Khasi Hills"
    district = zone_obj.district if zone_obj else "East Khasi Hills"
    state = zone_obj.state if zone_obj else "Meghalaya"

    ET.SubElement(info, "headline").text = f"Landslide {alert.risk_level} Warning for {zone_name} (Risk Score: {alert.risk_score:.1f})"
    ET.SubElement(info, "description").text = alert.message_text
    ET.SubElement(info, "instruction").text = (
        "Precautionary Directives: Exercise caution on steep cut slopes and mountain roadways. "
        "Evacuate vulnerable toe-slope habitations if severe tension cracks develop."
    )

    # Risk parameters
    p_score = ET.SubElement(info, "parameter")
    ET.SubElement(p_score, "valueName").text = "RiskScore"
    ET.SubElement(p_score, "value").text = str(alert.risk_score)

    p_level = ET.SubElement(info, "parameter")
    ET.SubElement(p_level, "valueName").text = "RiskLevel"
    ET.SubElement(p_level, "value").text = alert.risk_level

    # Area definitions
    area = ET.SubElement(info, "area")
    ET.SubElement(area, "areaDesc").text = f"{zone_name}, {district}, {state}, India"

    lat = zone_obj.center_lat if zone_obj else 25.275
    lon = zone_obj.center_lon if zone_obj else 91.732

    # Include polygon coordinates if zone geometry is available
    if zone_obj and zone_obj.geometry_json:
        try:
            geom = json.loads(zone_obj.geometry_json)
            if geom.get("type") == "Polygon" and geom.get("coordinates"):
                coords = geom["coordinates"][0]
                poly_text = " ".join(f"{pt[1]},{pt[0]}" for pt in coords)
                ET.SubElement(area, "polygon").text = poly_text
        except Exception:
            pass

    # Circle fallback: lat,lon radius_km
    ET.SubElement(area, "circle").text = f"{lat:.5f},{lon:.5f} 2.0"

    raw_xml = ET.tostring(root, encoding="utf-8")
    dom = minidom.parseString(raw_xml)
    return dom.toprettyxml(indent="  ", encoding="utf-8").decode("utf-8")


@router.get("/latest")
def get_latest_cap_alert(db: Session = Depends(get_db)):
    """
    Retrieve the most recent emergency alert formatted as OASIS CAP v1.2 XML.
    Complies with NDMA / SDMA National Emergency Notification protocols.
    """
    alert = db.query(AlertLog).order_by(desc(AlertLog.sent_at)).first()
    if not alert:
        # Fallback to top vulnerable zone if no prior manual dispatches
        # MOCKED: Simulated alert fallback when log is empty
        zone = db.query(Zone).first()
        alert = AlertLog(
            id=1,
            zone_id=zone.id if zone else 1,
            risk_score=78.5,
            risk_level="High",
            channel="all",
            recipient="District Broadcast",
            language="en",
            message_text=f"High Landslide Warning for {zone.name if zone else 'East Khasi Hills'}: Continuous monsoon precipitation elevated slope failure probability.",
            status="simulated",
            sent_at=datetime.now(timezone.utc)
        )
        zone_obj = zone
    else:
        zone_obj = alert.zone

    xml_content = _build_cap_document(alert, zone_obj)
    return Response(content=xml_content, media_type="text/xml")


@router.get("/feed")
def get_cap_alerts_feed(limit: int = 10, db: Session = Depends(get_db)):
    """
    Atom XML syndication feed of recent CAP v1.2 alerts for government ingestion nodes.
    """
    alerts = db.query(AlertLog).order_by(desc(AlertLog.sent_at)).limit(limit).all()

    feed = ET.Element("feed", xmlns="http://www.w3.org/2005/Atom")
    ET.SubElement(feed, "title").text = "DRISHTI-AI Landslide CAP Emergency Alert Feed"
    ET.SubElement(feed, "updated").text = datetime.now(timezone.utc).isoformat()
    ET.SubElement(feed, "id").text = "urn:drishti:meghalaya:alerts:feed"

    author = ET.SubElement(feed, "author")
    ET.SubElement(author, "name").text = "DRISHTI-AI SDMA Dispatch"

    for a in alerts:
        entry = ET.SubElement(feed, "entry")
        ET.SubElement(entry, "id").text = f"urn:drishti:alert:{a.id}"
        ET.SubElement(entry, "title").text = f"CAP Alert #{a.id} - {a.risk_level} Risk for {a.zone.name if a.zone else 'East Khasi Hills'}"
        ET.SubElement(entry, "updated").text = (a.sent_at or datetime.now(timezone.utc)).isoformat()
        content = ET.SubElement(entry, "content", type="text")
        content.text = a.message_text

    raw_xml = ET.tostring(feed, encoding="utf-8")
    dom = minidom.parseString(raw_xml)
    return Response(content=dom.toprettyxml(indent="  ", encoding="utf-8").decode("utf-8"), media_type="text/xml")


@router.get("/{alert_id}")
def get_cap_alert_by_id(alert_id: int, db: Session = Depends(get_db)):
    """Retrieve specific AlertLog formatted as OASIS CAP v1.2 XML."""
    alert = db.query(AlertLog).filter(AlertLog.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert log not found")

    xml_content = _build_cap_document(alert, alert.zone)
    return Response(content=xml_content, media_type="text/xml")

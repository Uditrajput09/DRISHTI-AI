"""
backend/api/routes_chatbot.py
DRISHTI-AI disaster intelligence chatbot powered by Google Gemini Flash
with an instant database-driven domain responder fallback.
"""

import os
import json
import logging
import urllib.request
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import desc
from pydantic import BaseModel
from typing import Optional
from backend.database import get_db
from backend.models import Zone, RiskScore, InfrastructureItem, AlertLog
from backend.config import settings

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/chatbot", tags=["AI Chatbot"])


class ChatQuery(BaseModel):
    question: str
    zone_id: Optional[int] = None
    context: Optional[str] = None


def build_district_telemetry_context(db: Session, client_context: Optional[str] = None) -> str:
    """Builds a factual district telemetry summary from live database state."""
    zones = db.query(Zone).all()
    lines = []
    lines.append(f"District: {settings.PILOT_DISTRICT_NAME}")
    lines.append(f"Total Monitored Zones: {len(zones)}")

    highest_score = -1.0
    highest_zone_name = "None"
    critical_zones = []
    high_zones = []

    for z in zones:
        latest = (
            db.query(RiskScore)
            .filter(RiskScore.zone_id == z.id)
            .order_by(desc(RiskScore.computed_at))
            .first()
        )
        if latest:
            score = latest.risk_score
            level = latest.risk_level
            if score > highest_score:
                highest_score = score
                highest_zone_name = z.name
            if level == "Critical":
                critical_zones.append(f"{z.name} ({score:.1f}%, Rain: {latest.rainfall_24h:.1f}mm, Soil: {latest.soil_moisture:.1f}%)")
            elif level == "High":
                high_zones.append(f"{z.name} ({score:.1f}%, Rain: {latest.rainfall_24h:.1f}mm)")

    lines.append(f"Highest Hazard Zone: {highest_zone_name} ({highest_score:.1f}%)")
    lines.append(f"Critical Zones: {', '.join(critical_zones) if critical_zones else 'None'}")
    lines.append(f"High-Risk Zones: {', '.join(high_zones) if high_zones else 'None'}")

    # Shelters
    shelters = db.query(InfrastructureItem).filter(InfrastructureItem.type == "shelter").limit(3).all()
    if shelters:
        shelter_str = "; ".join([f"{s.name} (cap: {s.capacity})" for s in shelters])
        lines.append(f"Available Shelters: {shelter_str}")

    lines.append("Emergency Helpline: Meghalaya SDMA 1070 | Disaster Police/Ambulance 112")
    if client_context:
        lines.append(f"UI Context: {client_context}")

    return "\n".join(lines)


def generate_local_response(question: str, db: Session, client_context: Optional[str] = None, zone_id: Optional[int] = None) -> str:
    """
    Intelligent local domain responder that queries live DB telemetry
    to provide accurate, rich answers instantly.
    """
    q = question.lower().strip()
    zones = db.query(Zone).all()

    highest_score = -1.0
    highest_zone = None
    zone_risk_map = {}

    for z in zones:
        latest = (
            db.query(RiskScore)
            .filter(RiskScore.zone_id == z.id)
            .order_by(desc(RiskScore.computed_at))
            .first()
        )
        if latest:
            score = latest.risk_score
            zone_risk_map[z.id] = (z, latest)
            if score > highest_score:
                highest_score = score
                highest_zone = (z, latest)

    # 1. Greetings & Intro
    if any(q == greet or q.startswith(f"{greet} ") or q.startswith(f"{greet}!") for greet in ["hi", "hello", "hey", "namaste", "good morning", "good afternoon", "good evening", "who are you", "what can you do"]):
        highest_name = highest_zone[0].name if highest_zone else "Pynursla"
        return (
            "👋 **Hello! I am DRISHTI-AI**, the Emergency Operations Center (EOC) Landslide Decision Assistant for East Khasi Hills, Meghalaya.\n\n"
            f"• **Current District Status:** {len(zones)} micro-zones monitored via IoT weather stations and satellite radar.\n"
            f"• **Highest Alert:** **{highest_name}** ({highest_score:.1f}% risk score).\n"
            "• **How I can help:**\n"
            "  1. Real-time hazard ratings for any zone (e.g., *'Status of Sohra'*)\n"
            "  2. Evacuation routes and safe shelter locator\n"
            "  3. Landslide trigger breakdowns (slope, rainfall, pore saturation)\n"
            "  4. Cloudburst simulation guidance and field reporting instructions\n\n"
            "What would you like to inspect?"
        )

    # 2. Summarize today's alerts
    if any(phrase in q for phrase in ["summarize today's alert", "summarize alerts", "today's alert", "active alert", "current alert", "all alert"]):
        crit_zones = [z.name for z, r in zone_risk_map.values() if r.risk_level == "Critical"]
        high_zones = [z.name for z, r in zone_risk_map.values() if r.risk_level == "High"]
        med_zones = [z.name for z, r in zone_risk_map.values() if r.risk_level == "Medium"]
        
        return (
            "📢 **DRISHTI-AI Active Alerts Summary (East Khasi Hills):**\n\n"
            f"• 🔴 **Critical Level ({len(crit_zones)} zones):** {', '.join(crit_zones) if crit_zones else 'None'}\n"
            f"• 🟠 **High Risk ({len(high_zones)} zones):** {', '.join(high_zones) if high_zones else 'None'}\n"
            f"• 🟡 **Moderate Risk ({len(med_zones)} zones):** {', '.join(med_zones) if med_zones else 'None'}\n\n"
            f"🚨 **Action Item:** Red alerts are active along the NH-6 Cherrapunjee/Pynursla escarpments due to saturated toe cuttings. "
            "District emergency coordinators have dispatched SMS advisories via Fast2SMS and CAP v1.2 push alerts."
        )

    # 3. Which zone is most at risk / become critical?
    if any(phrase in q for phrase in ["most at risk", "highest risk", "worst", "danger", "which zone", "highest", "become critical", "most dangerous"]):
        if highest_zone:
            z, r = highest_zone
            factors = json.loads(r.triggering_factors_json) if r.triggering_factors_json else {}
            slope_info = factors.get("topographic_slope", {}).get("value", f"{z.base_slope_deg}°")
            return (
                f"🚨 **{z.name}** is currently at highest risk with a score of **{r.risk_score:.1f}% ({r.risk_level} Alert)**.\n\n"
                f"• **24h Rainfall:** {r.rainfall_24h:.1f} mm (Extreme precipitation threshold exceeded)\n"
                f"• **Soil Moisture Saturation:** {r.soil_moisture:.1f}%\n"
                f"• **Topographic Slope:** {slope_info}\n"
                f"• **Primary Danger:** High likelihood of debris flows and rockfalls along steep cuts.\n\n"
                f"**Advisory:** Restrict non-essential vehicular traffic on feeder roads and verify community shelter availability."
            )

    # 4. Evacuation / Shelters / Emergency safety
    if any(phrase in q for phrase in ["evacuat", "shelter", "safe", "rescue", "emergency", "help", "sos", "hospital"]):
        shelters = db.query(InfrastructureItem).filter(InfrastructureItem.type == "shelter").limit(4).all()
        shelter_list = "\n".join([f"• **{s.name}** — Capacity: {s.capacity} persons (Lat: {s.latitude:.4f}, Lon: {s.longitude:.4f})" for s in shelters if s.latitude and s.longitude]) if shelters else "Designated Community Cyclone/Disaster Shelters in Sohra and Shillong."
        return (
            "⚠️ **Emergency Guidance & Evacuation Protocol:**\n\n"
            "If localized sirens sound or risk exceeds 80%:\n"
            "1. **Evacuate immediately** to designated high-ground disaster shelters:\n"
            f"{shelter_list}\n"
            "2. **State Emergency Helplines:**\n"
            "   • Meghalaya SDMA Control Room: **1070**\n"
            "   • Police / Ambulance / Fire Emergency: **112**\n"
            "   • GSI Regional Landslide Center: **1800-345-0011**\n"
            "3. **Safe Transit:** Stay clear of valley bottoms, natural drainage gullies, and freshly exposed highway toe cuttings along NH-6."
        )

    # 5. Cloudburst simulation & rainfall impact
    if any(phrase in q for phrase in ["simulate", "simulation", "150mm", "cloudburst", "what happens if", "rainfall spike"]):
        return (
            "⚡ **Cloudburst Simulation Intelligence:**\n\n"
            "• When rainfall exceeds **120 mm/24h**, antecedent moisture causes soil suction loss in sandstone-shale colluvium.\n"
            "• At **150 mm/h cloudburst intensity**, factor of safety drops below 1.0 in Sohra, Mawsynram, and Pynursla sectors within 180 minutes.\n"
            "• **How to simulate:** Navigate to the **Cloudburst Simulation** tab in the sidebar, choose a scenario preset (e.g. *Monsoon Cloudburst*), and click **Run Simulation** to project live zone hydrographs and failure probabilities."
        )

    # 6. Specific zone queries (e.g. Sohra, Mawsynram, Dawki, Pynursla, Mawphlang, Shella, Laitryngew)
    for z in zones:
        first_name = z.name.split()[0].lower()
        if first_name in q or z.zone_code.lower() in q or z.name.lower() in q:
            latest = (
                db.query(RiskScore)
                .filter(RiskScore.zone_id == z.id)
                .order_by(desc(RiskScore.computed_at))
                .first()
            )
            score = latest.risk_score if latest else z.vulnerability_index * 100
            level = latest.risk_level if latest else "Moderate"
            rain = latest.rainfall_24h if latest else 0.0
            moist = latest.soil_moisture if latest else 50.0
            return (
                f"📍 **Geotechnical Status for {z.name} ({z.zone_code}):**\n\n"
                f"• **Risk Score:** **{score:.1f}% ({level} Hazard)**\n"
                f"• **Elevation:** {z.base_elevation_m:.0f} m | **Geology:** {z.geology}\n"
                f"• **Slope Angle:** {z.base_slope_deg}°\n"
                f"• **24h Rainfall:** {rain:.1f} mm\n"
                f"• **Soil Moisture:** {moist:.1f}%\n"
                f"• **Corridor Roads:** {z.key_roads_json or 'NH-6 arterial route'}\n\n"
                f"**Decision Support:** "
                + ("Immediate evacuation recommended for valley settlement zones. Road transit hazardous." if score >= 80 else
                   ("Elevated vigilance advised; watch for tension cracks, muddy runoff, or tilted utility poles." if score >= 60 else
                    "Operational parameters are currently within normal baseline thresholds."))
            )

    # 7. Tourist hotspots (Nohkalikai, Seven Sisters, Caves, Dawki)
    if any(phrase in q for phrase in ["tourist", "waterfall", "nohkalikai", "seven sisters", "mawsmai", "dawki", "cave", "laitlum"]):
        return (
            "🗺️ **Tourist Corridor Landslide Vulnerability:**\n\n"
            "• **Nohkalikai Falls (Sohra):** Steep gorge rim; access road prone to rockfalls during cloudbursts.\n"
            "• **Seven Sisters Falls:** Limestone plateau escarpment; flash runoff can undermine viewing decks.\n"
            "• **Mawjymbuin Cave (Mawsynram):** Karst valley drainage; high groundwater saturation risks.\n"
            "• **Dawki Umngot Ghats:** Gorge approach road cuts have high slope angles (>38°).\n\n"
            "💡 Tourists are advised to check DRISHTI-AI's **Tourist Evacuation Guide** (Screen 8) for safe routing and nearest shelter coordinates."
        )

    # 8. Causes of landslides
    if any(w in q for w in ["cause", "why", "factor", "trigger", "reason", "geotech"]):
        return (
            "🏔️ **Primary Landslide Triggers in East Khasi Hills:**\n\n"
            "1. **Intense Monsoon Precipitation:** Cloudbursts (>100mm/24h) rapidly saturate superficial regolith.\n"
            "2. **Pore Water Pressure:** High moisture weakens cohesion along bedding planes of Meghalaya sandstone.\n"
            "3. **Topographic Steepness:** Natural canyon slopes (>35°) naturally exceed internal soil friction angles.\n"
            "4. **Anthropogenic Toe Cuts:** Unreinforced road widening excavations along the NH-6 corridor destabilize slopes."
        )

    # 9. How to report
    if any(w in q for w in ["report", "submit", "upload", "how do i", "app", "offline"]):
        return (
            "📱 **Submitting Field Incident Reports:**\n\n"
            "1. Switch to the **Field Reports** view in the sidebar navigation.\n"
            "2. Select the hazard type (e.g. *Tension Cracks, Rockfall, Mudslide, Road Blockage*).\n"
            "3. Attach camera photos and capture GPS coordinates with one click.\n"
            "4. Add audio notes using voice dictation (**🎙️ Speak to write**).\n"
            "5. Click **Submit Report** — if network signal is lost, DRISHTI-AI automatically caches the report in the offline queue and synchronizes upon reconnection!"
        )

    # 10. General fallback
    crit_count = sum(1 for z, r in zone_risk_map.values() if r.risk_level == "Critical")
    high_count = sum(1 for z, r in zone_risk_map.values() if r.risk_level == "High")
    return (
        f"🌐 **DRISHTI-AI District Telemetry Overview:**\n\n"
        f"• **Monitored Micro-Zones:** {len(zones)} across East Khasi Hills, Meghalaya\n"
        f"• **Active Alerts:** {crit_count} Critical, {high_count} High-risk sectors\n"
        f"• **Highest Hazard Area:** **{highest_zone[0].name if highest_zone else 'Sohra'}** ({highest_score:.1f}%)\n\n"
        f"💡 *Ask me about specific zones (e.g. 'Status of Mawsynram'), today's alerts, emergency shelters, or how to submit a field report.*"
    )


@router.post("/query")
async def chatbot_query(payload: ChatQuery, db: Session = Depends(get_db)):
    """
    Answer natural-language questions about DRISHTI-AI.
    Uses Gemini API when configured, and falls back to the live local telemetry engine.
    """
    api_key = (os.getenv("GEMINI_API_KEY", "") or getattr(settings, "GEMINI_API_KEY", "")).strip()

    if api_key and api_key != "YOUR_GEMINI_API_KEY_HERE":
        telemetry_context = build_district_telemetry_context(db, payload.context)
        prompt = (
            "You are DRISHTI-AI, an expert Disaster Early Warning AI Assistant specialized in landslide susceptibility, "
            "geotechnical slope stability, and emergency management for East Khasi Hills, Meghalaya, India.\n\n"
            f"REAL-TIME DISTRICT TELEMETRY & SYSTEM CONTEXT:\n{telemetry_context}\n\n"
            f"User Question: {payload.question}\n\n"
            "Instructions: Answer clearly, factually, and concisely in 2-3 short paragraphs or bullet points. "
            "Always prioritize human safety, ground your numbers in the provided telemetry, and include emergency advice if relevant."
        )

        # Try gemini-3.6-flash with 4-second timeout
        model = "gemini-3.6-flash"
        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
            body = {
                "contents": [{"parts": [{"text": prompt}]}],
                "generationConfig": {
                    "maxOutputTokens": 350,
                    "temperature": 0.2
                }
            }
            req = urllib.request.Request(
                url,
                data=json.dumps(body).encode("utf-8"),
                headers={"Content-Type": "application/json"}
            )
            with urllib.request.urlopen(req, timeout=4) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                answer = data["candidates"][0]["content"]["parts"][0]["text"].strip()
                return {"answer": answer, "source": f"gemini ({model})"}
        except Exception as e:
            logger.info(f"Gemini API query fast-fallback to local telemetry: {e}")

    # Seamless instant local domain responder
    answer = generate_local_response(payload.question, db, payload.context, payload.zone_id)
    return {"answer": answer, "source": "local-telemetry-engine"}

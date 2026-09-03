"""
backend/api/routes_chatbot.py
DRISHTI-AI chatbot powered by Google Gemini Flash API with an
intelligent local database-driven domain responder fallback.
"""

import os
import json
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import desc
from pydantic import BaseModel
from typing import Optional
from backend.database import get_db
from backend.models import Zone, RiskScore, InfrastructureItem

router = APIRouter(prefix="/api/chatbot", tags=["AI Chatbot"])


class ChatQuery(BaseModel):
    question: str
    zone_id: Optional[int] = None


def generate_local_response(question: str, db: Session) -> str:
    """
    Intelligent local domain responder that queries live DB telemetry
    to provide accurate answers even when GEMINI_API_KEY is not configured.
    """
    q = question.lower()
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

    # 1. Which zone is most at risk?
    if any(phrase in q for phrase in ["most at risk", "highest risk", "worst", "danger", "which zone"]):
        if highest_zone:
            z, r = highest_zone
            factors = json.loads(r.triggering_factors_json) if r.triggering_factors_json else {}
            slope_info = factors.get("topographic_slope", {}).get("value", f"{z.base_slope_deg}°")
            return (
                f"🚨 **{z.name}** is currently at highest risk with a score of **{r.risk_score}% ({r.risk_level} Alert)**.\n\n"
                f"• **24h Rainfall:** {r.rainfall_24h:.1f} mm\n"
                f"• **Soil Moisture:** {r.soil_moisture:.1f}%\n"
                f"• **Slope Angle:** {slope_info}\n"
                f"• **Status:** High probability of slope failure or rockfall along steep escarpments. "
                f"Residents are advised to avoid hillside roads."
            )

    # 2. Evacuation / Shelters / Emergency safety
    if any(phrase in q for phrase in ["evacuat", "shelter", "safe", "rescue", "emergency", "help"]):
        shelters = db.query(InfrastructureItem).filter(InfrastructureItem.type == "shelter").limit(3).all()
        shelter_list = "\n".join([f"• **{s.name}** (Capacity: {s.capacity} persons)" for s in shelters]) if shelters else "Designated Community Cyclone/Disaster Shelters."
        return (
            f"⚠️ **Emergency Guidance & Evacuation Protocol:**\n\n"
            f"If you are in a Critical or High-risk micro-zone:\n"
            f"1. **Evacuate immediately** to designated safe shelters if advised by district authorities.\n"
            f"2. **Available Shelters:**\n{shelter_list}\n"
            f"3. **Helpline:** Call Meghalaya State Disaster Management Authority (SDMA) at **1070** or Emergency Police/Ambulance at **112**.\n"
            f"4. Do not attempt to cross submerged roads or recently blocked toe cuttings."
        )

    # 3. Specific zone queries (e.g. Sohra, Mawsynram, Dawki, Pynursla)
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
                f"📍 **Status for {z.name} ({z.zone_code}):**\n\n"
                f"• **Risk Score:** {score:.1f}% ({level})\n"
                f"• **Elevation:** {z.base_elevation_m:.0f} m | **Geology:** {z.geology}\n"
                f"• **24h Rainfall:** {rain:.1f} mm\n"
                f"• **Soil Saturation:** {moist:.1f}%\n"
                f"• **Exposed Roads:** {z.key_roads_json or 'NH-6 corridor'}\n\n"
                f"**Recommendation:** "
                + ("Immediate evacuation advisory in effect. Avoid non-essential travel." if score >= 80 else
                   ("Stay vigilant for developing tension cracks and listen for localized sirens." if score >= 60 else
                    "Conditions are currently within safe operational thresholds."))
            )

    # 4. Causes of landslides
    if any(w in q for w in ["cause", "why", "factor", "trigger", "reason"]):
        return (
            "🏔️ **Primary Landslide Triggers in East Khasi Hills:**\n\n"
            "1. **Intense Cloudbursts:** Extreme 24h precipitation (>120 mm) saturates steep hillside soils.\n"
            "2. **Pore Water Pressure:** High antecedent rainfall weakens soil shear resistance.\n"
            "3. **Topography:** Steep slope angles (>35°) naturally exceed internal soil friction angles.\n"
            "4. **Road Toe Cuts:** Highway excavations along NH-6 destabilize the slope base."
        )

    # 5. How to report
    if any(w in q for w in ["report", "submit", "upload", "how do i"]):
        return (
            "📱 **How to Submit a Field Incident Report:**\n\n"
            "1. Switch to the **Citizen Mobile App** tab in the top navigation bar.\n"
            "2. Tap **Post Incident** to open the report composer.\n"
            "3. Take a photo or upload an image of the ground crack, rockfall, or debris flow.\n"
            "4. Tap **Capture GPS** or use voice dictation (**🎙️ Speak to write**) to record observations.\n"
            "5. Tap **Submit Post** — if you are offline, it will automatically save to your outbox and sync upon reconnection!"
        )

    # 6. General fallback
    crit_count = sum(1 for z, r in zone_risk_map.values() if r.risk_level == "Critical")
    high_count = sum(1 for z, r in zone_risk_map.values() if r.risk_level == "High")
    return (
        f"🌐 **DRISHTI-AI District Telemetry Summary:**\n\n"
        f"• **Monitored Micro-Zones:** {len(zones)} across East Khasi Hills, Meghalaya\n"
        f"• **Active Alerts:** {crit_count} Critical, {high_count} High-risk areas\n"
        f"• **Highest Hazard:** {highest_zone[0].name if highest_zone else 'Sohra'} ({highest_score:.1f}%)\n\n"
        f"💡 *Tip: You can ask about specific zones (e.g. 'How is Sohra today?'), evacuation protocols, or how to submit reports.*\n\n"
        f"*(To enable unconstrained open-ended conversation, set GEMINI_API_KEY in your `.env` file.)*"
    )


@router.post("/query")
async def chatbot_query(payload: ChatQuery, db: Session = Depends(get_db)):
    """
    Answer natural-language questions about DRISHTI-AI.
    Uses Gemini Flash when GEMINI_API_KEY is configured,
    and falls back to intelligent local domain knowledge otherwise.
    """
    api_key = os.getenv("GEMINI_API_KEY", "").strip()

    if api_key and api_key != "YOUR_GEMINI_API_KEY_HERE":
        try:
            import google.generativeai as genai
            genai.configure(api_key=api_key)
            model = genai.GenerativeModel("gemini-1.5-flash")

            zones = db.query(Zone).all()
            lines = ["DRISHTI-AI Landslide Early Warning System Context (East Khasi Hills, Meghalaya):"]
            for z in zones:
                latest = db.query(RiskScore).filter(RiskScore.zone_id == z.id).order_by(desc(RiskScore.computed_at)).first()
                if latest:
                    lines.append(f"- {z.name} ({z.zone_code}): Risk={latest.risk_score}% [{latest.risk_level}], 24h Rain={latest.rainfall_24h}mm, Moisture={latest.soil_moisture}%")
            lines.append("Answer the user concisely and factually as the DRISHTI-AI emergency assistant.")

            prompt = "\n".join(lines) + f"\n\nUser: {payload.question}\n\nAssistant:"
            response = model.generate_content(prompt)
            return {"answer": response.text.strip(), "source": "gemini-flash"}
        except Exception as e:
            print(f"[Chatbot] Gemini call note: {e}, using local response engine")

    answer = generate_local_response(payload.question, db)
    return {"answer": answer, "source": "local-rag"}

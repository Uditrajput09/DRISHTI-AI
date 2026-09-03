"""
backend/api/routes_chatbot.py
DRISHTI-AI chatbot powered by Google Gemini Flash API.
Uses live zone risk data as RAG context.
"""

import os
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc
from pydantic import BaseModel
from typing import Optional
from backend.database import get_db
from backend.models import Zone, RiskScore

router = APIRouter(prefix="/api/chatbot", tags=["AI Chatbot"])


class ChatQuery(BaseModel):
    question: str
    zone_id: Optional[int] = None


def build_context(db: Session) -> str:
    """Build a concise RAG context string from live zone risk data."""
    zones = db.query(Zone).all()
    lines = [
        "DRISHTI-AI covers East Khasi Hills, Meghalaya pilot region.",
        "Current zone risk status:"
    ]
    for z in zones:
        latest = (
            db.query(RiskScore)
            .filter(RiskScore.zone_id == z.id)
            .order_by(desc(RiskScore.computed_at))
            .first()
        )
        if latest:
            lines.append(
                f"- {z.name} ({z.zone_code}): Risk={latest.risk_score}% [{latest.risk_level}], "
                f"24h rain={latest.rainfall_24h}mm, soil moisture={latest.soil_moisture}%"
            )
    lines.append("Respond concisely and helpfully. If asked about evacuation or emergencies, always recommend official DDMA guidance.")
    return "\n".join(lines)


@router.post("/query")
async def chatbot_query(payload: ChatQuery, db: Session = Depends(get_db)):
    """
    Answer natural-language questions about DRISHTI-AI using Gemini Flash.
    Requires GEMINI_API_KEY in environment.
    """
    api_key = os.getenv("GEMINI_API_KEY", "")
    if not api_key:
        # Graceful fallback: return canned response if no key configured
        return {
            "answer": (
                "DRISHTI-AI chatbot is not configured yet. "
                "Set GEMINI_API_KEY in your .env file to enable AI Q&A. "
                "Visit https://aistudio.google.com to get a free API key."
            ),
            "source": "fallback"
        }

    context = build_context(db)
    prompt = f"{context}\n\nUser question: {payload.question}\n\nAnswer:"

    try:
        import google.generativeai as genai
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel("gemini-1.5-flash")
        response = model.generate_content(prompt)
        answer = response.text.strip()
    except ImportError:
        answer = "google-generativeai package not installed. Run: pip install google-generativeai"
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gemini API error: {str(e)}")

    return {"answer": answer, "source": "gemini-flash"}

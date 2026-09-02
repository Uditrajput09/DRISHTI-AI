"""
backend/alerts/translate.py
Multilingual translation service supporting English, Hindi, Khasi, and Assamese.
Features pre-cached, dialect-accurate emergency templates with LibreTranslate live fallback.
"""

from typing import Dict, Any, Optional
import requests
from backend.config import settings

# Pre-cached regional disaster alert templates
# East Khasi Hills native languages: Khasi, English, Hindi, Assamese
CACHED_TEMPLATES = {
    "en": {
        "critical_header": "🚨 CRITICAL LANDSLIDE RED ALERT",
        "high_header": "⚠️ HIGH LANDSLIDE WARNING",
        "moderate_header": "⚡ MODERATE RISK ADVISORY",
        "body": "SIH26001 Early Warning: {zone_name} has exceeded critical threshold (Risk: {risk_score}% | Rain: {rainfall_24h}mm). High probability of slope failure/rockfall. Avoid hillside roads and move to designated shelters.",
        "action": "Immediate evacuation advisory active. Dial 1070/112 for DDMA Meghalaya Rescue."
    },
    "hi": {
        "critical_header": "🚨 अत्यंत गंभीर भूस्खलन चेतावनी (RED ALERT)",
        "high_header": "⚠️ उच्च भूस्खलन चेतावनी (HIGH RISK)",
        "moderate_header": "⚡ मध्यम जोखिम परामर्श",
        "body": "SIH26001 पूर्व चेतावनी: {zone_name} में भूस्खलन का अत्यधिक खतरा (जोखिम: {risk_score}% | 24 घंटे वर्षा: {rainfall_24h}mm)। पहाड़ी मार्गों पर यात्रा से बचें और सुरक्षित राहत शिविरों में जाएं।",
        "action": "तुरंत सुरक्षित स्थान पर जाएं। आपातकालीन सहायता के लिए 1070 / 112 डायल करें।"
    },
    "kha": {
        "critical_header": "🚨 KA JINGMA BA JUR NA KA JINGTWAD KHYNDEW (RED ALERT)",
        "high_header": "⚠️ KA JINGMA BA HEH NA KA JINGTWAD KHYNDEW",
        "moderate_header": "⚡ KA JINGMA BA MAR-PDENG",
        "body": "SIH26001 Jingma Mynshuwa: Ha {zone_name} ka don ka jingma ba jur na ka jingtwad khyndew (Jingma: {risk_score}% | Jinghap slap: {rainfall_24h}mm). Kiat na ki surok lum bad leit sha ki jaka ba shngain.",
        "action": "Sngewbha leit mardor sha ki Shelter. Phone sha 1070/112 na ka bynta ka jingiarap."
    },
    "as": {
        "critical_header": "🚨 জৰুৰী ভূস্খলন সতৰ্কবাৰ্তা (RED ALERT)",
        "high_header": "⚠️ উচ্চ ভূস্খলন সতৰ্কতা (HIGH RISK)",
        "moderate_header": "⚡ মধ্যম বিপদৰ জাননী",
        "body": "SIH26001 পূৰ্ব সতৰ্কবাৰ্তা: {zone_name} অঞ্চলত প্ৰচণ্ড ভূমিস্খলনৰ সম্ভাৱনা (বিপদৰ মাত্ৰা: {risk_score}% | ২৪ ঘণ্টাত বৰষুণ: {rainfall_24h}mm)। পাহাৰীয়া পথ এৰাই চলক আৰু নিৰাপদ আশ্ৰয়স্থললৈ যাওক।",
        "action": "অবিলম্বে সুৰক্ষিত স্থানলৈ যাওক। জৰুৰীকালীন সহায়ৰ বাবে 1070 / 112 নম্বৰত যোগাযোগ কৰক।"
    }
}


class TranslationService:
    """Service to generate localized multilingual disaster alert messages."""

    def __init__(self):
        self.libre_url = settings.LIBRETRANSLATE_URL
        self.api_key = settings.get_optional_api_key("LIBRETRANSLATE_API_KEY")
        self.templates = CACHED_TEMPLATES

    def format_alert_message(
        self,
        language: str,
        zone_name: str,
        risk_score: float,
        risk_level: str,
        rainfall_24h: float
    ) -> str:
        """
        Format disaster warning in the requested language using cached regional templates.
        Languages: en (English), hi (Hindi), kha (Khasi), as (Assamese).
        """
        lang = language.lower().strip()
        template = self.templates.get(lang, self.templates["en"])

        if risk_level == "Critical":
            header = template.get("critical_header", "🚨 RED ALERT")
        elif risk_level == "High":
            header = template.get("high_header", "⚠️ HIGH WARNING")
        else:
            header = template.get("moderate_header", "⚡ RISK ADVISORY")

        body = template["body"].format(
            zone_name=zone_name,
            risk_score=f"{risk_score:.1f}",
            rainfall_24h=f"{rainfall_24h:.1f}"
        )
        action = template.get("action", "")

        return f"{header}\n{body}\n{action}"

    def live_translate(self, text: str, target_lang: str, source_lang: str = "en") -> Optional[str]:
        """
        Optionally query live LibreTranslate instance for dynamic text translation.
        Falls back seamlessly to template if unavailable.
        """
        if not self.libre_url:
            return None

        # LibreTranslate language mapping
        lang_map = {"kha": "en", "as": "as", "hi": "hi", "en": "en"}
        target = lang_map.get(target_lang, target_lang)

        try:
            payload = {
                "q": text,
                "source": source_lang,
                "target": target,
                "format": "text"
            }
            if self.api_key:
                payload["api_key"] = self.api_key

            resp = requests.post(self.libre_url, json=payload, timeout=4.0)
            if resp.status_code == 200:
                return resp.json().get("translatedText")
        except Exception:
            pass
        return None


translation_service = TranslationService()

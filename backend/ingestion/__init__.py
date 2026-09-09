"""
backend/ingestion package
External data ingestion modules (Open-Meteo, IMD, Open Topo Data, Overpass OSM)
and the Unified Ingestion Pipeline orchestrator.
"""

from backend.ingestion.weather import weather_service, WeatherIngestionService
from backend.ingestion.imd import imd_service, IMDIngestionService
from backend.ingestion.terrain import terrain_service, TerrainIngestionService
from backend.ingestion.osm import osm_service, OSMIngestionService
from backend.ingestion.pipeline import ingestion_pipeline, UnifiedIngestionPipeline

__all__ = [
    "weather_service",
    "WeatherIngestionService",
    "imd_service",
    "IMDIngestionService",
    "terrain_service",
    "TerrainIngestionService",
    "osm_service",
    "OSMIngestionService",
    "ingestion_pipeline",
    "UnifiedIngestionPipeline"
]

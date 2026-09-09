"""
backend/api/ws_manager.py
Central WebSocket Connection Manager for real-time risk, alert, and telemetry streaming.
Allows pushing live zone risk updates to connected GIS dashboard clients.
"""

from typing import Set, Dict, Any
import json
import logging
from fastapi import WebSocket

logger = logging.getLogger("drishti.ws")


class ConnectionManager:
    """Manages active WebSocket connections and broadcasting."""

    def __init__(self):
        self.active_connections: Set[WebSocket] = set()

    async def connect(self, websocket: WebSocket):
        """Accept incoming connection and store in active set."""
        await websocket.accept()
        self.active_connections.add(websocket)
        logger.info(f"[WebSocket] Client connected. Total active: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        """Remove disconnected client from active set."""
        self.active_connections.discard(websocket)
        logger.info(f"[WebSocket] Client disconnected. Total active: {len(self.active_connections)}")

    async def broadcast(self, message: Dict[str, Any]):
        """Broadcast a JSON message to all currently connected clients."""
        if not self.active_connections:
            return

        dead_connections = []
        payload_str = json.dumps(message)

        for connection in list(self.active_connections):
            try:
                await connection.send_text(payload_str)
            except Exception as e:
                logger.warning(f"[WebSocket] Error sending to client: {e}")
                dead_connections.append(connection)

        # Prune dead sockets
        for dead in dead_connections:
            self.disconnect(dead)


# Global singleton instance
ws_manager = ConnectionManager()

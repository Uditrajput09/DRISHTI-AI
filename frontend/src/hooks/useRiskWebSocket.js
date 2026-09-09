/**
 * frontend/src/hooks/useRiskWebSocket.js
 * Real-time WebSocket hook for streaming live landslide risk scores,
 * sensor telemetry updates, and emergency alert broadcasts directly to the GIS map.
 */

import { useEffect, useRef, useState, useCallback } from 'react';

export function useRiskWebSocket(onZoneUpdate) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [error, setError] = useState(null);

  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const backoffRef = useRef(1000); // Starting backoff: 1s
  const pingIntervalRef = useRef(null);
  const callbackRef = useRef(onZoneUpdate);

  // Keep callback reference updated without triggering reconnection
  useEffect(() => {
    callbackRef.current = onZoneUpdate;
  }, [onZoneUpdate]);

  const getWsUrl = useCallback(() => {
    if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_WS_URL) {
      return import.meta.env.VITE_WS_URL;
    }
    const isSecure = window.location.protocol === 'https:';
    const protocol = isSecure ? 'wss:' : 'ws:';
    
    // In dev environment or production reverse-proxy, /ws/risk-live routes to FastAPI
    if (window.location.port === '5173') {
      // Connect either via Vite proxy or directly to 8000
      return `${protocol}//${window.location.hostname}:8000/ws/risk-live`;
    }
    return `${protocol}//${window.location.host}/ws/risk-live`;
  }, []);


  const connect = useCallback(() => {
    // Clear any existing reconnect timer
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    try {
      const url = getWsUrl();
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        setError(null);
        backoffRef.current = 1000; // Reset backoff on successful connect

        // Start heartbeat ping every 25 seconds
        if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
        pingIntervalRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send('ping');
          }
        }, 25000);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'PONG') {
            return;
          }

          if (data.type === 'ANOMALY_ALERT') {
            window.dispatchEvent(new CustomEvent('drishti:anomaly_alert', { detail: data }));
          }

          if (data.zones && Array.isArray(data.zones)) {
            setLastUpdate(new Date());
            if (callbackRef.current) {
              callbackRef.current(data.zones, data);
            }
          }
        } catch (err) {
          console.warn('[useRiskWebSocket] Message parse error:', err);
        }
      };

      ws.onerror = (err) => {
        setError('WebSocket error');
      };

      ws.onclose = () => {
        setIsConnected(false);
        if (pingIntervalRef.current) {
          clearInterval(pingIntervalRef.current);
          pingIntervalRef.current = null;
        }

        // Auto-reconnect with exponential backoff (max 30s)
        const delay = Math.min(backoffRef.current, 30000);
        reconnectTimeoutRef.current = setTimeout(() => {
          backoffRef.current = backoffRef.current * 1.5;
          connect();
        }, delay);
      };
    } catch (err) {
      setError(err.message);
      setIsConnected(false);
    }
  }, [getWsUrl]);

  useEffect(() => {
    connect();

    return () => {
      if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [connect]);

  return {
    isConnected,
    lastUpdate,
    error
  };
}

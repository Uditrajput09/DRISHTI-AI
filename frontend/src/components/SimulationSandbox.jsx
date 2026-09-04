import React, { useState, useEffect } from 'react';
import { 
  Sliders, 
  Play, 
  CloudRain, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { api } from '../api';

export default function SimulationSandbox({ zones = [], onSimulationComplete }) {
  const [hourlyRain, setHourlyRain] = useState(65);
  const [duration, setDuration] = useState(6);
  const [soilMoisture, setSoilMoisture] = useState(90);
  const [triggerAlerts, setTriggerAlerts] = useState(true);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simResult, setSimResult] = useState(null);
  const [simError, setSimError] = useState(null);
  const [notifPermission, setNotifPermission] = useState('default');

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window) {
      setNotifPermission(Notification.permission);
      if (Notification.permission === 'default') {
        Notification.requestPermission().then(p => setNotifPermission(p));
      }
    }
  }, []);

  const fireRiskNotification = (zone_name, risk_level, risk_score, zone_id) => {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'SHOW_RISK_NOTIFICATION',
        zone_name, risk_level, risk_score, zone_id
      });
    } else if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(`⚠️ DRISHTI-AI: ${risk_level} Risk — ${zone_name}`, {
        body: `Risk Index: ${risk_score}% | Immediate attention required.`,
        icon: '/icon-192.png'
      });
    }
  };

  const setPreset = (rain, hrs, sm, name) => {
    setHourlyRain(rain);
    setDuration(hrs);
    setSoilMoisture(sm);
  };

  const handleRunSimulation = async () => {
    setIsSimulating(true);
    setSimError(null);
    try {
      const res = await api.simulateRisk({
        simulated_hourly_rainfall_mm: parseFloat(hourlyRain),
        simulated_duration_hours: parseInt(duration),
        simulated_soil_moisture_pct: parseFloat(soilMoisture),
        trigger_alerts: triggerAlerts
      });
      setSimResult(res);
      if (onSimulationComplete) onSimulationComplete(res);
      // Fire OS push notification for high/critical zones
      const alertZones = (res.results || []).filter(r => r.risk_level === 'Critical' || r.risk_level === 'High');
      if (alertZones.length > 0) {
        const top = alertZones[0];
        fireRiskNotification(top.zone_name || 'Zone', top.risk_level, top.risk_score, top.zone_id);
      }
    } catch (err) {
      setSimError(err?.message || 'Simulation failed. Please try again.');
    } finally {
      setIsSimulating(false);
    }
  };

  const calculated24h = Math.round(hourlyRain * Math.min(24, duration));

  return (
    <div className="glass-panel" style={{ padding: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ background: 'rgba(6, 182, 212, 0.2)', padding: 6, borderRadius: 8 }}>
            <Sliders size={18} color="#06b6d4" />
          </div>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#f8fafc' }}>
              Live Cloudburst & Landslide Risk Sandbox
            </h3>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
              Interactive AI model stress-testing engine for live hackathon jury demo
            </div>
          </div>
        </div>
        <span className="holo-badge-critical">
          Simulated 24h: {calculated24h} mm
        </span>
      </div>

      {/* Preset Buttons */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        <button
          onClick={() => setPreset(12, 6, 60, 'Normal')}
          className="holo-btn-secondary"
          style={{
            color: '#6EE7B7',
            borderColor: 'rgba(52, 211, 153, 0.3)',
            padding: '6px 12px',
            fontSize: '0.75rem',
            borderRadius: 10
          }}
        >
          🌦️ Normal Rain (12 mm/h)
        </button>
        <button
          onClick={() => setPreset(60, 6, 85, 'Heavy')}
          className="holo-btn-secondary"
          style={{
            color: '#A5A6F6',
            borderColor: 'rgba(120, 115, 245, 0.3)',
            padding: '6px 12px',
            fontSize: '0.75rem',
            borderRadius: 10
          }}
        >
          ⛈️ Heavy Downpour (60 mm/h)
        </button>
        <button
          onClick={() => setPreset(125, 8, 96, 'Cloudburst')}
          className="holo-btn-secondary"
          style={{
            color: '#FF9AD7',
            borderColor: 'rgba(255, 110, 199, 0.4)',
            padding: '6px 12px',
            fontSize: '0.75rem',
            fontWeight: 700,
            borderRadius: 10
          }}
        >
          🚨 Extreme Cloudburst (125 mm/h)
        </button>
      </div>

      {/* Sliders Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 16 }}>
        {/* Rainfall Intensity Slider */}
        <div style={{ background: 'rgba(20, 20, 30, 0.75)', padding: '10px 14px', borderRadius: 12, border: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#94a3b8', marginBottom: 6, fontFamily: 'Space Grotesk, sans-serif' }}>
            <span>Precipitation Rate</span>
            <strong style={{ color: '#4FD8EA' }}>{hourlyRain} mm/h</strong>
          </div>
          <input
            type="range"
            min="0"
            max="180"
            value={hourlyRain}
            onChange={e => setHourlyRain(e.target.value)}
            style={{ width: '100%' }}
          />
        </div>

        {/* Duration Slider */}
        <div style={{ background: 'rgba(20, 20, 30, 0.75)', padding: '10px 14px', borderRadius: 12, border: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#94a3b8', marginBottom: 6, fontFamily: 'Space Grotesk, sans-serif' }}>
            <span>Storm Duration</span>
            <strong style={{ color: '#7873F5' }}>{duration} Hours</strong>
          </div>
          <input
            type="range"
            min="1"
            max="24"
            value={duration}
            onChange={e => setDuration(e.target.value)}
            style={{ width: '100%' }}
          />
        </div>

        {/* Soil Moisture Saturation */}
        <div style={{ background: 'rgba(20, 20, 30, 0.75)', padding: '10px 14px', borderRadius: 12, border: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#94a3b8', marginBottom: 6, fontFamily: 'Space Grotesk, sans-serif' }}>
            <span>Initial Soil Moisture</span>
            <strong style={{ color: '#FF6EC7' }}>{soilMoisture}%</strong>
          </div>
          <input
            type="range"
            min="20"
            max="100"
            value={soilMoisture}
            onChange={e => setSoilMoisture(e.target.value)}
            style={{ width: '100%' }}
          />
        </div>
      </div>

      {/* Action Controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8rem', color: '#94a3b8', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={triggerAlerts}
            onChange={e => setTriggerAlerts(e.target.checked)}
          />
          <span>Auto-trigger Multi-Lingual SMS & Push Alerts on Threshold Breach</span>
        </label>

        <button
          onClick={handleRunSimulation}
          disabled={isSimulating}
          className="holo-btn-primary"
          style={{
            padding: '10px 22px',
            fontSize: '0.88rem',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            cursor: isSimulating ? 'wait' : 'pointer'
          }}
        >
          <Play size={16} />
          <span>{isSimulating ? 'Computing Neural Inference...' : 'Execute AI Simulation'}</span>
        </button>
      </div>

      {simError && (
        <div
          role="alert"
          aria-live="assertive"
          style={{
            marginTop: 14,
            padding: '10px 14px',
            borderRadius: 10,
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.35)',
            color: '#fca5a5',
            fontSize: '0.8rem',
            fontWeight: 600
          }}
        >
          Simulation failed: {simError}
        </div>
      )}

      {/* Simulation Results Banner */}
      {simResult && !simError && (
        <div style={{
          marginTop: 14,
          padding: '10px 14px',
          borderRadius: 10,
          background: 'rgba(16, 185, 129, 0.12)',
          border: '1px solid rgba(16, 185, 129, 0.35)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.82rem',
          color: '#6ee7b7'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <CheckCircle2 size={16} />
            <span>Successfully simulated across <strong>{simResult.zones_evaluated} micro-zones</strong>.</span>
          </div>
          <div>
            Dispatched <strong>{simResult.results.filter(r => r.alerts_triggered).length} automated alerts</strong>.
          </div>
        </div>
      )}
    </div>
  );
}

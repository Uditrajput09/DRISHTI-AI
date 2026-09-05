import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Clock, 
  MapPin, 
  ArrowRight, 
  Check, 
  Volume2, 
  TrendingUp, 
  AlertTriangle,
  Radio,
  Send
} from 'lucide-react';

export default function AlertCard({ alert, onViewZone, onAcknowledge }) {
  const [acknowledged, setAcknowledged] = useState(false);

  const getSeverityStyle = (level) => {
    switch (level?.toLowerCase()) {
      case 'critical':
        return {
          color: '#FF3B6B',
          bg: 'rgba(255, 59, 107, 0.15)',
          border: 'rgba(255, 59, 107, 0.45)'
        };
      case 'high':
        return {
          color: '#FF9D3D',
          bg: 'rgba(255, 157, 61, 0.15)',
          border: 'rgba(255, 157, 61, 0.45)'
        };
      case 'medium':
        return {
          color: '#FFD84D',
          bg: 'rgba(255, 216, 77, 0.15)',
          border: 'rgba(255, 216, 77, 0.45)'
        };
      default:
        return {
          color: '#35D8FF',
          bg: 'rgba(53, 216, 255, 0.15)',
          border: 'rgba(53, 216, 255, 0.45)'
        };
    }
  };

  const severity = alert.level || alert.risk_level || 'Critical';
  const style = getSeverityStyle(severity);
  const riskScore = alert.risk_score || (severity === 'Critical' ? 100 : (severity === 'High' ? 87 : 55));

  const handleAck = () => {
    setAcknowledged(true);
    if (onAcknowledge) onAcknowledge(alert);
  };

  return (
    <div
      className="command-panel"
      style={{
        border: `1px solid ${acknowledged ? 'rgba(120, 140, 180, 0.18)' : style.border}`,
        borderRadius: 12,
        padding: '16px 18px',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        position: 'relative',
        opacity: acknowledged ? 0.65 : 1,
        transition: 'all 0.2s ease',
        boxShadow: acknowledged ? 'none' : '0 6px 24px rgba(0,0,0,0.4)'
      }}
    >
      {/* Top Header: Badge, Zone, Risk Score, Time */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span
            style={{
              background: style.bg,
              border: `1px solid ${style.border}`,
              color: style.color,
              fontSize: '0.68rem',
              fontWeight: 800,
              padding: '2px 8px',
              borderRadius: 4,
              fontFamily: 'Space Grotesk, sans-serif',
              letterSpacing: '0.06em',
              textTransform: 'uppercase'
            }}
          >
            {severity} ALERT
          </span>

          <span style={{ fontSize: '0.92rem', fontWeight: 800, color: '#FFFFFF', fontFamily: 'Space Grotesk, sans-serif' }}>
            {alert.zone_name || alert.location || 'Sohra (Cherrapunji) Escarpment'}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span
            style={{
              background: `${style.color}20`,
              color: style.color,
              fontWeight: 900,
              fontSize: '0.74rem',
              padding: '2px 8px',
              borderRadius: 6,
              fontFamily: 'Space Grotesk, sans-serif'
            }}
          >
            {riskScore}% Risk
          </span>

          <span style={{ fontSize: '0.7rem', color: '#5C677D', display: 'flex', alignItems: 'center', gap: 4 }}>
            <Clock size={11} />
            {alert.timeAgo || alert.sent_at || 'Just now'}
          </span>
        </div>
      </div>

      {/* Message / Advisory */}
      <p style={{ fontSize: '0.8rem', color: '#CBD5E1', lineHeight: 1.5, margin: 0 }}>
        {alert.message || alert.cause || 'Extreme rainfall triggered. High landslide probability. Avoid travel. Stay indoors.'}
      </p>

      {/* Meta tags: Channels, Language, Status */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, borderTop: '1px solid rgba(120, 140, 180, 0.15)', paddingTop: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.7rem', color: '#9AA5B8' }}>
          <span style={{ background: 'var(--bg-surface-elevated)', padding: '2px 6px', borderRadius: 4, border: '1px solid rgba(120, 140, 180, 0.2)' }}>
            Channel: {alert.channel || 'SMS + Push'}
          </span>
          <span style={{ background: 'var(--bg-surface-elevated)', padding: '2px 6px', borderRadius: 4, border: '1px solid rgba(120, 140, 180, 0.2)' }}>
            Lang: {alert.language || 'English (Khasi attached)'}
          </span>
          <span style={{ color: '#39D98A', fontWeight: 700 }}>
            ● Verified
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={() => onViewZone && onViewZone(alert)}
            className="btn-surface"
            style={{ padding: '5px 10px', fontSize: '0.72rem' }}
          >
            <span>Inspect on GIS</span>
            <ArrowRight size={11} color="#35D8FF" />
          </button>

          <button
            onClick={handleAck}
            disabled={acknowledged}
            style={{
              background: acknowledged ? 'rgba(57, 217, 138, 0.15)' : 'rgba(120, 140, 180, 0.12)',
              border: `1px solid ${acknowledged ? 'rgba(57, 217, 138, 0.4)' : 'rgba(120, 140, 180, 0.25)'}`,
              color: acknowledged ? '#39D98A' : '#F4F6FB',
              borderRadius: 6,
              padding: '5px 10px',
              fontSize: '0.72rem',
              fontWeight: 700,
              cursor: acknowledged ? 'default' : 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4
            }}
          >
            <Check size={12} />
            <span>{acknowledged ? 'Ack' : 'Acknowledge'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

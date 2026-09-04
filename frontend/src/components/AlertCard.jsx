import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Clock, 
  MapPin, 
  ArrowRight, 
  Check, 
  Volume2, 
  TrendingUp, 
  AlertTriangle 
} from 'lucide-react';

export default function AlertCard({ alert, onViewZone, onAcknowledge }) {
  const [acknowledged, setAcknowledged] = useState(false);

  const getSeverityStyle = (level) => {
    switch (level) {
      case 'Critical':
        return {
          color: '#FF3B6B',
          bg: 'rgba(255, 59, 107, 0.12)',
          border: 'rgba(255, 59, 107, 0.4)'
        };
      case 'High':
        return {
          color: '#FF9D3D',
          bg: 'rgba(255, 157, 61, 0.12)',
          border: 'rgba(255, 157, 61, 0.4)'
        };
      case 'Medium':
        return {
          color: '#FFD84D',
          bg: 'rgba(255, 216, 77, 0.12)',
          border: 'rgba(255, 216, 77, 0.4)'
        };
      default:
        return {
          color: '#35D8FF',
          bg: 'rgba(53, 216, 255, 0.12)',
          border: 'rgba(53, 216, 255, 0.4)'
        };
    }
  };

  const severity = alert.level || alert.risk_level || 'Critical';
  const style = getSeverityStyle(severity);

  const handleAck = () => {
    setAcknowledged(true);
    if (onAcknowledge) onAcknowledge(alert);
  };

  return (
    <div
      style={{
        background: '#101521',
        border: `1px solid ${acknowledged ? 'rgba(120, 140, 180, 0.18)' : style.border}`,
        borderRadius: 12,
        padding: '14px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        position: 'relative',
        opacity: acknowledged ? 0.6 : 1,
        transition: 'all 0.2s ease',
        boxShadow: acknowledged ? 'none' : '0 4px 20px rgba(0,0,0,0.45)'
      }}
    >
      {/* Top Row: Severity + Location + Time */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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
            {severity}
          </span>
          <span style={{ fontSize: '0.84rem', fontWeight: 800, color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: 4 }}>
            <MapPin size={13} color="#35D8FF" />
            {alert.zone_name || alert.location || 'Sohra, East Khasi Hills'}
          </span>
        </div>

        <span style={{ fontSize: '0.7rem', color: '#5C677D', display: 'flex', alignItems: 'center', gap: 4 }}>
          <Clock size={11} />
          {alert.timeAgo || alert.sent_at || '2 min ago'}
        </span>
      </div>

      {/* Delta Statement */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.86rem', fontWeight: 700, color: '#F4F6FB' }}>
        <TrendingUp size={15} color={style.color} />
        <span>
          {alert.delta || `Risk increased from ${alert.previous_score || 76}% → ${alert.risk_score || 92}%`}
        </span>
      </div>

      {/* Cause */}
      <div style={{ fontSize: '0.76rem', color: '#9AA5B8', background: '#151B29', padding: '7px 10px', borderRadius: 6 }}>
        <span style={{ color: '#5C677D', fontWeight: 700 }}>Cause: </span>
        <span>{alert.cause || alert.message || 'Extreme rainfall + soil saturation'}</span>
      </div>

      {/* Action Buttons: [ View Zone ], [ Acknowledge ] */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8, paddingTop: 4 }}>
        <button
          onClick={() => onViewZone && onViewZone(alert)}
          className="btn-surface"
          style={{ padding: '6px 12px', fontSize: '0.74rem' }}
        >
          View Zone
          <ArrowRight size={12} color="#35D8FF" />
        </button>

        <button
          onClick={handleAck}
          disabled={acknowledged}
          style={{
            background: acknowledged ? 'rgba(57, 217, 138, 0.15)' : 'rgba(120, 140, 180, 0.12)',
            border: `1px solid ${acknowledged ? 'rgba(57, 217, 138, 0.4)' : 'rgba(120, 140, 180, 0.25)'}`,
            color: acknowledged ? '#39D98A' : '#F4F6FB',
            borderRadius: 8,
            padding: '6px 12px',
            fontSize: '0.74rem',
            fontWeight: 700,
            cursor: acknowledged ? 'default' : 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6
          }}
        >
          <Check size={12} />
          {acknowledged ? 'Acknowledged' : 'Acknowledge'}
        </button>
      </div>
    </div>
  );
}

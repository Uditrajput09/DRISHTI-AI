import React from 'react';
import { 
  MapPin, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  ArrowRight, 
  Image as ImageIcon 
} from 'lucide-react';

export default function IncidentCard({ incident, onViewOnMap }) {
  const getSeverityBadge = (level) => {
    switch (level?.toLowerCase()) {
      case 'critical':
        return { color: '#FF3B6B', bg: 'rgba(255, 59, 107, 0.15)', border: 'rgba(255, 59, 107, 0.4)' };
      case 'high':
        return { color: '#FF9D3D', bg: 'rgba(255, 157, 61, 0.15)', border: 'rgba(255, 157, 61, 0.4)' };
      case 'medium':
        return { color: '#FFD84D', bg: 'rgba(255, 216, 77, 0.15)', border: 'rgba(255, 216, 77, 0.4)' };
      default:
        return { color: '#39D98A', bg: 'rgba(57, 217, 138, 0.15)', border: 'rgba(57, 217, 138, 0.4)' };
    }
  };

  const badge = getSeverityBadge(incident.severity);
  const isVerified = incident.status === 'verified' || incident.verified;

  return (
    <div
      style={{
        background: '#101521',
        border: '1px solid rgba(120, 140, 180, 0.22)',
        borderRadius: 12,
        padding: 16,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        boxShadow: '0 8px 24px rgba(0,0,0,0.45)',
        transition: 'all 0.2s ease'
      }}
      className="command-panel-interactive"
    >
      {/* Top Row: Incident Type & Time */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span
            style={{
              fontSize: '0.92rem',
              fontWeight: 800,
              color: '#FFFFFF',
              letterSpacing: '0.04em',
              fontFamily: 'Space Grotesk, sans-serif'
            }}
          >
            {incident.incident_type?.toUpperCase() || incident.hazard_type?.toUpperCase() || 'INCIDENT REPORTED'}
          </span>
          <span
            style={{
              background: badge.bg,
              border: `1px solid ${badge.border}`,
              color: badge.color,
              fontSize: '0.66rem',
              fontWeight: 800,
              padding: '2px 8px',
              borderRadius: 4,
              fontFamily: 'Space Grotesk, sans-serif',
              textTransform: 'uppercase'
            }}
          >
            {incident.severity || 'High'}
          </span>
        </div>

        <span style={{ fontSize: '0.72rem', color: '#5C677D', display: 'flex', alignItems: 'center', gap: 4 }}>
          <Clock size={11} />
          {incident.timeAgo || incident.created_at || '12 min ago'}
        </span>
      </div>

      {/* Location & Verification Status */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#35D8FF', fontSize: '0.82rem', fontWeight: 600 }}>
          <MapPin size={14} />
          <span>{incident.location || incident.zone_name || 'East Khasi Hills Corridor'}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.7rem' }}>
          {isVerified ? (
            <span style={{ color: '#39D98A', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
              <CheckCircle2 size={13} />
              VERIFIED BY SDMA
            </span>
          ) : (
            <span style={{ color: '#FFD84D', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
              <AlertTriangle size={13} />
              CITIZEN REPORT • IN REVIEW
            </span>
          )}
        </div>
      </div>

      {/* Description */}
      {incident.description && (
        <p style={{ fontSize: '0.78rem', color: '#9AA5B8', lineHeight: 1.45 }}>
          {incident.description}
        </p>
      )}

      {/* Media or Mini Preview */}
      {incident.photo_data_url && (
        <div style={{ width: '100%', height: 120, borderRadius: 8, overflow: 'hidden', border: '1px solid rgba(120, 140, 180, 0.2)' }}>
          <img
            src={incident.photo_data_url}
            alt="Incident evidence"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
      )}

      {/* Bottom Actions */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', borderTop: '1px solid rgba(120, 140, 180, 0.15)', paddingTop: 8 }}>
        <button
          onClick={() => onViewOnMap && onViewOnMap(incident)}
          className="btn-surface"
          style={{ padding: '6px 12px', fontSize: '0.74rem' }}
        >
          <span>Locate on GIS Map</span>
          <ArrowRight size={12} color="#35D8FF" />
        </button>
      </div>
    </div>
  );
}

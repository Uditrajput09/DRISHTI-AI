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
        return { color: '#FF3B6B', bg: 'rgba(255, 59, 107, 0.15)', border: 'rgba(255, 59, 107, 0.45)' };
      case 'high':
        return { color: '#FF9D3D', bg: 'rgba(255, 157, 61, 0.15)', border: 'rgba(255, 157, 61, 0.45)' };
      case 'medium':
        return { color: '#FFD84D', bg: 'rgba(255, 216, 77, 0.15)', border: 'rgba(255, 216, 77, 0.45)' };
      default:
        return { color: '#39D98A', bg: 'rgba(57, 217, 138, 0.15)', border: 'rgba(57, 217, 138, 0.45)' };
    }
  };

  const badge = getSeverityBadge(incident.severity);
  const isVerified = incident.status === 'verified' || incident.verified;

  // Pick documentary photograph based on hazard type if no custom photo uploaded
  const getImageSource = () => {
    if (incident.photo_data_url) return incident.photo_data_url;
    const type = (incident.hazard_type || incident.incident_type || '').toLowerCase();
    if (type.includes('rockfall')) return '/images/incidents/incident-rockfall.jpg';
    if (type.includes('blockage')) return '/images/incidents/incident-road-blockage.jpg';
    if (type.includes('debris') || type.includes('water') || type.includes('flood')) return '/images/incidents/incident-debris-flow.jpg';
    return '/images/incidents/incident-landslide.jpg';
  };

  const imgSrc = getImageSource();

  return (
    <div
      className="command-panel-interactive"
      style={{
        padding: '14px 16px',
        display: 'flex',
        gap: 14,
        alignItems: 'stretch',
        boxShadow: '0 8px 24px rgba(0,0,0,0.45)'
      }}
    >
      {/* Left Thumbnail Photo */}
      <div
        style={{
          width: 96,
          height: 84,
          borderRadius: 8,
          overflow: 'hidden',
          flexShrink: 0,
          border: '1px solid rgba(120, 140, 180, 0.25)',
          position: 'relative'
        }}
      >
        <img
          src={imgSrc}
          alt={incident.hazard_type || 'Incident photograph'}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = '/images/incidents/incident-landslide.jpg';
          }}
        />
      </div>

      {/* Right Content */}
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', flex: 1, gap: 4 }}>
        <div>
          {/* Badge & Severity */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span
                style={{
                  background: 'rgba(53, 216, 255, 0.12)',
                  color: '#35D8FF',
                  border: '1px solid rgba(53, 216, 255, 0.3)',
                  fontSize: '0.64rem',
                  fontWeight: 800,
                  padding: '1px 6px',
                  borderRadius: 4,
                  fontFamily: 'Space Grotesk, sans-serif',
                  textTransform: 'uppercase'
                }}
              >
                {incident.hazard_type || incident.incident_type || 'Landslide'}
              </span>

              <span
                style={{
                  background: badge.bg,
                  color: badge.color,
                  border: `1px solid ${badge.border}`,
                  fontSize: '0.64rem',
                  fontWeight: 800,
                  padding: '1px 6px',
                  borderRadius: 4,
                  fontFamily: 'Space Grotesk, sans-serif',
                  textTransform: 'uppercase'
                }}
              >
                {incident.severity || 'Critical'}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: '0.68rem', color: '#5C677D', display: 'flex', alignItems: 'center', gap: 3 }}>
                <Clock size={11} />
                {incident.timeAgo || 'Just now'}
              </span>
              {isVerified ? (
                <span style={{ fontSize: '0.66rem', color: '#39D98A', fontWeight: 700 }}>
                  ● verified
                </span>
              ) : (
                <span style={{ fontSize: '0.66rem', color: '#FFD84D', fontWeight: 700 }}>
                  ● unverified
                </span>
              )}
            </div>
          </div>

          {/* Title & Road */}
          <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#FFFFFF', fontFamily: 'Space Grotesk, sans-serif' }}>
            {incident.zone_name || incident.location || 'Sohra (Cherrapunji) Escarpment, NH-6'}
          </div>

          {/* Description */}
          <p style={{ fontSize: '0.74rem', color: '#9AA5B8', lineHeight: 1.4, margin: '2px 0 0 0' }}>
            {incident.description || 'Road partially blocked due to slope failure and rubble. Traffic moving slowly.'}
          </p>
        </div>

        {/* Action Locate on Map */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingTop: 2 }}>
          <button
            onClick={() => onViewOnMap && onViewOnMap(incident)}
            className="btn-surface"
            style={{ padding: '4px 8px', fontSize: '0.68rem', gap: 4 }}
          >
            <span>Locate on Map</span>
            <ArrowRight size={11} color="#35D8FF" />
          </button>
        </div>
      </div>
    </div>
  );
}

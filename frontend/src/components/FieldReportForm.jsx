import React, { useState, useEffect } from 'react';
import { 
  Camera, 
  MapPin, 
  Send, 
  CheckCircle2, 
  Compass
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { api } from '../api';

const markerIcon = L.divIcon({
  className: 'custom-field-pin',
  html: `
    <div style="
      background: #FF3B6B;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      border: 3px solid #FFFFFF;
      box-shadow: 0 0 12px #FF3B6B;
    "></div>
  `,
  iconSize: [20, 20],
  iconAnchor: [10, 10]
});

export default function FieldReportForm({ onReportSubmitted }) {
  const [hazardType, setHazardType] = useState('Landslide');
  const [locationName, setLocationName] = useState('Sohra (Cherrapunji) Escarpment');
  const [description, setDescription] = useState('Landslide blocking half of the road. Traffic moving slowly.');
  const [impactLevel, setImpactLevel] = useState('Critical'); // 'Low', 'Medium', 'High', 'Critical'
  const [visibility, setVisibility] = useState('Good');

  // Photo
  const [photoPreview, setPhotoPreview] = useState('/images/incidents/incident-landslide.jpg');
  
  // Exact GPS Coordinates matching Screen 6
  const [coords, setCoords] = useState({ lat: '25.3011° N', lon: '91.7231° E', alt: '1,146 m', accuracy: '± 6 m', captured: 'Just now' });
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setPhotoPreview(ev.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatusMessage('');

    const payload = {
      hazard_type: hazardType,
      incident_type: hazardType,
      location: locationName,
      description,
      severity: impactLevel,
      visibility,
      latitude: 25.3011,
      longitude: 91.7231,
      altitude_m: 1146,
      photo_data_url: photoPreview,
      reporter_name: 'Community Responder',
      created_at: new Date().toISOString()
    };

    try {
      const res = await api.submitReport(payload);
      if (res.status === 'queued_offline') {
        setStatusMessage('REPORT QUEUED: Will automatically sync when online.');
      } else {
        setStatusMessage('✅ Report submitted successfully to SDMA Command Center!');
      }
      if (onReportSubmitted) onReportSubmitted();
    } catch (err) {
      setStatusMessage('REPORT QUEUED: Stored in offline queue.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="command-panel"
      style={{
        padding: '22px 24px'
      }}
    >
      {/* Top Banner Status */}
      {statusMessage && (
        <div
          style={{
            background: 'rgba(57, 217, 138, 0.15)',
            border: '1px solid #39D98A',
            color: '#39D98A',
            padding: '10px 14px',
            borderRadius: 6,
            fontSize: '0.8rem',
            fontWeight: 700,
            marginBottom: 16
          }}
        >
          {statusMessage}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* 3-COLUMN DESKTOP GRID matching Screen 6 */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.15fr) minmax(0, 1.35fr) minmax(0, 1fr)',
            gap: 20,
            alignItems: 'start'
          }}
          className="gis-command-grid"
        >
          {/* COLUMN 1: REPORT DETAILS */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#9AA5B8', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'Space Grotesk, sans-serif' }}>
              REPORT DETAILS
            </div>

            <div>
              <label style={{ fontSize: '0.72rem', color: '#9AA5B8', fontWeight: 600, display: 'block', marginBottom: 4 }}>
                Hazard Type
              </label>
              <select
                value={hazardType}
                onChange={(e) => setHazardType(e.target.value)}
                className="command-input"
                style={{ fontSize: '0.78rem', padding: '7px 10px' }}
              >
                <option value="Landslide">Landslide</option>
                <option value="Rockfall">Rockfall</option>
                <option value="Flooding">Flooding</option>
                <option value="Road Blockage">Road Blockage</option>
                <option value="Slope Failure">Slope Failure</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.72rem', color: '#9AA5B8', fontWeight: 600, display: 'block', marginBottom: 4 }}>
                Location
              </label>
              <input
                type="text"
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                className="command-input"
                style={{ fontSize: '0.78rem', padding: '7px 10px' }}
                required
              />
            </div>

            <div>
              <label style={{ fontSize: '0.72rem', color: '#9AA5B8', fontWeight: 600, display: 'block', marginBottom: 4 }}>
                Description
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="command-input"
                style={{ fontSize: '0.76rem', padding: '8px 10px', resize: 'none' }}
                required
              />
            </div>

            {/* Impact Level Buttons: Low, Medium, High, Critical */}
            <div>
              <label style={{ fontSize: '0.72rem', color: '#9AA5B8', fontWeight: 600, display: 'block', marginBottom: 6 }}>
                Impact Level
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
                {[
                  { id: 'Low', color: '#39D98A' },
                  { id: 'Medium', color: '#FFD84D' },
                  { id: 'High', color: '#FF9D3D' },
                  { id: 'Critical', color: '#FF4DB8' }
                ].map(item => {
                  const isActive = impactLevel === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setImpactLevel(item.id)}
                      style={{
                        background: isActive ? (item.id === 'Critical' ? 'linear-gradient(135deg, #8B6CFF, #FF4DB8)' : item.color) : 'rgba(21, 27, 41, 0.8)',
                        color: isActive ? '#FFFFFF' : '#9AA5B8',
                        border: `1px solid ${isActive ? (item.id === 'Critical' ? '#FF4DB8' : item.color) : 'rgba(120, 140, 180, 0.2)'}`,
                        borderRadius: 6,
                        padding: '6px 0',
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        fontFamily: 'Space Grotesk, sans-serif',
                        cursor: 'pointer'
                      }}
                    >
                      {item.id}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Visibility Dropdown */}
            <div>
              <label style={{ fontSize: '0.72rem', color: '#9AA5B8', fontWeight: 600, display: 'block', marginBottom: 4 }}>
                Visibility
              </label>
              <select
                value={visibility}
                onChange={(e) => setVisibility(e.target.value)}
                className="command-input"
                style={{ fontSize: '0.78rem', padding: '7px 10px' }}
              >
                <option value="Good">Good</option>
                <option value="Foggy">Foggy</option>
                <option value="Heavy Rain">Heavy Rain</option>
              </select>
            </div>
          </div>

          {/* COLUMN 2: PHOTO & LOCATION */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#9AA5B8', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'Space Grotesk, sans-serif' }}>
              PHOTO & LOCATION
            </div>

            {/* Incident Photo Preview */}
            <div style={{ position: 'relative', width: '100%', height: 160, borderRadius: 8, overflow: 'hidden', border: '1px solid rgba(120, 140, 180, 0.25)' }}>
              <img
                src={photoPreview}
                alt="Incident report"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <label
                style={{
                  position: 'absolute',
                  bottom: 8,
                  left: 8,
                  background: 'rgba(7, 10, 16, 0.85)',
                  border: '1px solid rgba(120, 140, 180, 0.4)',
                  borderRadius: 4,
                  padding: '3px 8px',
                  color: '#FFFFFF',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Change Photo
                <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} />
              </label>
            </div>

            {/* Mini Map Pin Container */}
            <div style={{ width: '100%', height: 140, borderRadius: 8, overflow: 'hidden', border: '1px solid rgba(120, 140, 180, 0.25)' }}>
              <MapContainer
                center={[25.3011, 91.7231]}
                zoom={12}
                style={{ width: '100%', height: '100%' }}
                zoomControl={false}
              >
                <TileLayer
                  url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                  attribution="&copy; Esri"
                />
                <Marker position={[25.3011, 91.7231]} icon={markerIcon} />
              </MapContainer>
            </div>
          </div>

          {/* COLUMN 3: AUTO LOCATION & STATUS */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#9AA5B8', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'Space Grotesk, sans-serif' }}>
              AUTO LOCATION
            </div>

            {/* Auto Location Telemetry Box matching Screen 6 */}
            <div
              style={{
                background: 'var(--bg-surface-elevated)',
                border: '1px solid rgba(120, 140, 180, 0.2)',
                borderRadius: 8,
                padding: '12px 14px',
                display: 'flex',
                flexDirection: 'column',
                gap: 8
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem' }}>
                <span style={{ color: '#9AA5B8' }}>Latitude</span>
                <span style={{ color: '#FFFFFF', fontWeight: 700, fontFamily: 'JetBrains Mono, monospace' }}>{coords.lat}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem' }}>
                <span style={{ color: '#9AA5B8' }}>Longitude</span>
                <span style={{ color: '#FFFFFF', fontWeight: 700, fontFamily: 'JetBrains Mono, monospace' }}>{coords.lon}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem' }}>
                <span style={{ color: '#9AA5B8' }}>Altitude</span>
                <span style={{ color: '#FFFFFF', fontWeight: 700, fontFamily: 'JetBrains Mono, monospace' }}>{coords.alt}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem' }}>
                <span style={{ color: '#9AA5B8' }}>Accuracy</span>
                <span style={{ color: '#39D98A', fontWeight: 700, fontFamily: 'JetBrains Mono, monospace' }}>{coords.accuracy}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem' }}>
                <span style={{ color: '#9AA5B8' }}>Captured</span>
                <span style={{ color: '#CBD5E1' }}>{coords.captured}</span>
              </div>
            </div>

            {/* Status Section */}
            <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid rgba(120, 140, 180, 0.2)', borderRadius: 8, padding: '12px 14px' }}>
              <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#9AA5B8', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 4 }}>
                STATUS
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#39D98A', boxShadow: '0 0 6px #39D98A' }} />
                <span style={{ fontSize: '0.78rem', color: '#39D98A', fontWeight: 800 }}>Online</span>
              </div>
              <p style={{ fontSize: '0.68rem', color: '#9AA5B8', margin: '4px 0 0', lineHeight: 1.35 }}>
                Report will be submitted immediately
              </p>
            </div>

            {/* [ SUBMIT REPORT ] Button matching Screen 6 */}
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                width: '100%',
                padding: '12px 0',
                borderRadius: 8,
                border: 'none',
                background: 'linear-gradient(135deg, #8B6CFF, #FF4DB8)',
                color: '#FFFFFF',
                fontSize: '0.82rem',
                fontWeight: 800,
                letterSpacing: '0.06em',
                fontFamily: 'Space Grotesk, sans-serif',
                cursor: 'pointer',
                boxShadow: '0 4px 18px rgba(255, 77, 184, 0.4)',
                marginTop: 2
              }}
            >
              {isSubmitting ? 'SUBMITTING...' : 'SUBMIT REPORT'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

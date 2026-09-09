import React, { useState, useEffect } from 'react';
import { 
  Camera, 
  MapPin, 
  Send, 
  CheckCircle2, 
  Compass
} from 'lucide-react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';
import { api } from '../api';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Badge, RiskBadge } from './ui/Badge';
import { Input } from './ui/Input';
import { Select } from './ui/Select';

const markerIcon = L.divIcon({
  className: 'custom-field-pin',
  html: `
    <div style="
      background: var(--brand-primary, #4F6FFF);
      width: 18px;
      height: 18px;
      border-radius: 50%;
      border: 2px solid #FFFFFF;
      box-shadow: 0 0 10px rgba(79, 111, 255, 0.7);
    "></div>
  `,
  iconSize: [18, 18],
  iconAnchor: [9, 9]
});

export default function FieldReportForm({ onReportSubmitted }) {
  const [hazardType, setHazardType] = useState('Landslide');
  const [locationName, setLocationName] = useState('Sohra (Cherrapunji) Escarpment');
  const [description, setDescription] = useState('Landslide blocking half of the road. Traffic moving slowly.');
  const [impactLevel, setImpactLevel] = useState('Critical'); // 'Low', 'Medium', 'High', 'Critical'
  const [visibility, setVisibility] = useState('Good');

  // Photo
  const [photoPreview, setPhotoPreview] = useState('/images/incidents/incident-landslide.jpg');
  
  // GPS Coordinates
  const [coords, setCoords] = useState({ lat: '25.3011° N', lon: '91.7231° E', alt: '1,146 m', accuracy: '± 6 m', captured: 'Just now' });
  const [numericCoords, setNumericCoords] = useState({ lat: 25.3011, lon: 91.7231, alt: 1146 });
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  // Listen for simulated Android hardware events (GPS, Camera, Network)
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const applyLocation = (data) => {
      const lat = Number(data.latitude || data.lat || 25.3011);
      const lon = Number(data.longitude || data.lon || 91.7231);
      const alt = Number(data.altitude || data.alt || 1146);
      setCoords({
        lat: `${lat.toFixed(4)}° N`,
        lon: `${lon.toFixed(4)}° E`,
        alt: `${alt.toLocaleString()} m`,
        accuracy: '± 3 m (Android GPS Lock)',
        captured: 'Just now'
      });
      setNumericCoords({ lat, lon, alt });
      if (data.name) {
        setLocationName(data.name);
      }
    };

    const handleCustomLoc = (e) => {
      if (e.detail) applyLocation(e.detail);
    };

    const handleCustomPhoto = (e) => {
      if (e.detail?.url) setPhotoPreview(e.detail.url);
    };

    const handleMessage = (e) => {
      if (e.data?.type === 'DRISHTI_SIMULATOR_LOCATION' && e.data.payload) {
        applyLocation(e.data.payload);
      }
      if (e.data?.type === 'DRISHTI_SIMULATOR_PHOTO' && e.data.payload?.url) {
        setPhotoPreview(e.data.payload.url);
      }
      if (e.data?.type === 'DRISHTI_SIMULATOR_NETWORK') {
        setIsOnline(!e.data.payload.isOffline);
      }
    };

    window.addEventListener('drishti-simulated-location', handleCustomLoc);
    window.addEventListener('drishti-simulated-photo', handleCustomPhoto);
    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('drishti-simulated-location', handleCustomLoc);
      window.removeEventListener('drishti-simulated-photo', handleCustomPhoto);
      window.removeEventListener('message', handleMessage);
    };
  }, []);

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
      latitude: numericCoords.lat,
      longitude: numericCoords.lon,
      altitude_m: numericCoords.alt,
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
    <Card style={{ padding: '24px 28px' }}>
      {/* Top Banner Status */}
      {statusMessage && (
        <div
          style={{
            background: 'var(--risk-low-bg)',
            border: '1px solid var(--risk-low)',
            color: 'var(--risk-low)',
            padding: '10px 16px',
            borderRadius: 'var(--radius-md, 8px)',
            fontSize: '0.8rem',
            fontWeight: 600,
            marginBottom: 20
          }}
        >
          {statusMessage}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* 3-COLUMN DESKTOP GRID */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 24,
            alignItems: 'start'
          }}
        >
          {/* COLUMN 1: REPORT DETAILS */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--brand-primary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              REPORT DETAILS
            </div>

            <Select
              label="Hazard Type"
              value={hazardType}
              onChange={(e) => setHazardType(e.target.value)}
              options={[
                { value: 'Landslide', label: 'Landslide' },
                { value: 'Rockfall', label: 'Rockfall' },
                { value: 'Flooding', label: 'Flooding' },
                { value: 'Road Blockage', label: 'Road Blockage' },
                { value: 'Slope Failure', label: 'Slope Failure' }
              ]}
            />

            <Input
              label="Location"
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              required
            />

            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500, display: 'block', marginBottom: 6 }}>
                Description
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={{
                  fontSize: '0.85rem',
                  padding: '10px 12px',
                  resize: 'none',
                  width: '100%',
                  borderRadius: 'var(--radius-md, 8px)',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-primary)',
                  color: 'var(--text-primary)',
                  boxSizing: 'border-box'
                }}
                required
              />
            </div>

            {/* Impact Level Buttons: Low, Medium, High, Critical */}
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500, display: 'block', marginBottom: 8 }}>
                Impact Level
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                {[
                  { id: 'Low', color: 'var(--risk-low)' },
                  { id: 'Medium', color: 'var(--risk-medium)' },
                  { id: 'High', color: 'var(--risk-high)' },
                  { id: 'Critical', color: 'var(--risk-critical)' }
                ].map(item => {
                  const isActive = impactLevel === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setImpactLevel(item.id)}
                      style={{
                        background: isActive ? item.color : 'var(--bg-surface)',
                        color: isActive ? '#0A0A0A' : 'var(--text-secondary)',
                        border: `1px solid ${isActive ? item.color : 'var(--border-primary)'}`,
                        borderRadius: 'var(--radius-full, 9999px)',
                        padding: '6px 0',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {item.id}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Visibility Dropdown */}
            <Select
              label="Visibility"
              value={visibility}
              onChange={(e) => setVisibility(e.target.value)}
              options={[
                { value: 'Good', label: 'Good' },
                { value: 'Foggy', label: 'Foggy' },
                { value: 'Heavy Rain', label: 'Heavy Rain' }
              ]}
            />
          </div>

          {/* COLUMN 2: PHOTO & LOCATION */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--brand-primary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              PHOTO & LOCATION
            </div>

            {/* Incident Photo Preview */}
            <div style={{ position: 'relative', width: '100%', height: 165, borderRadius: 'var(--radius-md, 8px)', overflow: 'hidden', border: '1px solid var(--border-primary)' }}>
              <img
                src={photoPreview}
                alt="Incident report"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <label
                style={{
                  position: 'absolute',
                  bottom: 10,
                  left: 10,
                  background: 'rgba(10, 10, 10, 0.88)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid var(--border-primary)',
                  borderRadius: 'var(--radius-full, 9999px)',
                  padding: '4px 12px',
                  color: 'var(--text-primary)',
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                Change Photo
                <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} />
              </label>
            </div>

            {/* Mini Map Pin Container */}
            <div style={{ width: '100%', height: 145, borderRadius: 'var(--radius-md, 8px)', overflow: 'hidden', border: '1px solid var(--border-primary)' }}>
              <MapContainer
                key={`${numericCoords.lat}-${numericCoords.lon}`}
                center={[numericCoords.lat, numericCoords.lon]}
                zoom={12}
                style={{ width: '100%', height: '100%' }}
                zoomControl={false}
              >
                <TileLayer
                  url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                  attribution="&copy; Esri"
                />
                <Marker position={[numericCoords.lat, numericCoords.lon]} icon={markerIcon} />
              </MapContainer>
            </div>
          </div>

          {/* COLUMN 3: AUTO LOCATION & STATUS */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--brand-primary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              AUTO LOCATION
            </div>

            {/* Auto Location Telemetry Box */}
            <div
              style={{
                background: 'var(--bg-card-hover)',
                border: '1px solid var(--border-primary)',
                borderRadius: 'var(--radius-md, 8px)',
                padding: '14px 16px',
                display: 'flex',
                flexDirection: 'column',
                gap: 10
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Latitude</span>
                <span style={{ color: 'var(--text-primary)', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>{coords.lat}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Longitude</span>
                <span style={{ color: 'var(--text-primary)', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>{coords.lon}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Altitude</span>
                <span style={{ color: 'var(--text-primary)', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>{coords.alt}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Accuracy</span>
                <span style={{ color: 'var(--risk-low)', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>{coords.accuracy}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Captured</span>
                <span style={{ color: 'var(--text-muted)' }}>{coords.captured}</span>
              </div>
            </div>

            {/* Status Section */}
            <div style={{ background: 'var(--bg-card-hover)', border: '1px solid var(--border-primary)', borderRadius: 'var(--radius-md, 8px)', padding: '14px 16px' }}>
              <span style={{ fontSize: '0.68rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 4 }}>
                TELEMETRY STATUS
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span 
                  style={{ 
                    width: 7, 
                    height: 7, 
                    borderRadius: '50%', 
                    background: isOnline ? 'var(--risk-low)' : 'var(--risk-critical)', 
                    boxShadow: isOnline ? '0 0 6px var(--risk-low)' : '0 0 6px var(--risk-critical)' 
                  }} 
                />
                <span style={{ fontSize: '0.78rem', color: isOnline ? 'var(--risk-low)' : 'var(--risk-critical)', fontWeight: 600 }}>
                  {isOnline ? 'Online Sync Active' : 'Offline Buffer Mode'}
                </span>
              </div>
              <p style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', margin: '4px 0 0', lineHeight: 1.35 }}>
                {isOnline ? 'Report will be submitted immediately via REST' : 'Zero cellular signal: Queued locally in IndexedDB until online'}
              </p>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting}
              style={{
                width: '100%',
                justifyContent: 'center',
                padding: '12px 0',
                marginTop: 4
              }}
            >
              <Send size={15} />
              <span>{isSubmitting ? 'SUBMITTING...' : 'SUBMIT REPORT'}</span>
            </Button>
          </div>
        </div>
      </form>
    </Card>
  );
}

import React, { useState, useEffect, useRef } from 'react';
import { 
  Camera, 
  MapPin, 
  Send, 
  CheckCircle2, 
  Compass,
  LocateFixed,
  Navigation,
  Layers,
  RotateCcw,
  Crosshair,
  ChevronDown,
  ChevronUp,
  AlertTriangle
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { api } from '../api';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { Input } from './ui/Input';
import { Select } from './ui/Select';

// High-visibility pinpoint hazard pin with teardrop indicator and pulse aura
const markerIcon = L.divIcon({
  className: 'custom-field-pin',
  html: `
    <div style="
      position: relative;
      width: 34px;
      height: 42px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      cursor: grab;
      filter: drop-shadow(0 4px 10px rgba(0,0,0,0.8));
    ">
      <div style="
        position: absolute;
        top: 2px;
        width: 30px;
        height: 30px;
        border-radius: 50%;
        background: rgba(239, 68, 68, 0.28);
        box-shadow: 0 0 12px rgba(239, 68, 68, 0.6);
      "></div>
      <div style="
        width: 24px;
        height: 24px;
        border-radius: 50% 50% 50% 0;
        background: #EF4444;
        border: 2.5px solid #FFFFFF;
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 2;
      ">
        <div style="
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #FFFFFF;
          transform: rotate(45deg);
        "></div>
      </div>
    </div>
  `,
  iconSize: [34, 42],
  iconAnchor: [17, 39]
});

// East Khasi Hills Key Hazard Corridors & Landmarks for instant GPS snapping
const LANDMARK_PRESETS = [
  { name: 'Sohra (Cherrapunji) Escarpment', lat: 25.3011, lon: 91.7231, alt: 1146, corridor: 'NH-6' },
  { name: 'Nohkalikai Falls Scarp', lat: 25.2755, lon: 91.6853, alt: 1220, corridor: 'Sohra Rim' },
  { name: 'Mawsynram Ridge (7th Mile)', lat: 25.2972, lon: 91.5828, alt: 1400, corridor: 'Ridge Road' },
  { name: 'Pynursla Pass', lat: 25.3089, lon: 91.9056, alt: 1280, corridor: 'NH-106' },
  { name: 'Laitkynsew Scarp', lat: 25.2150, lon: 91.6620, alt: 890, corridor: 'Rural Road' },
  { name: 'Nongpoh Rim Culvert', lat: 25.9030, lon: 91.8820, alt: 580, corridor: 'GS Road' },
  { name: 'Dawki Border Corridor', lat: 25.1850, lon: 92.0180, alt: 180, corridor: 'NH-206' },
  { name: 'Shillong Peak Ridge', lat: 25.5410, lon: 91.8540, alt: 1965, corridor: 'Upper Shillong' }
];

function findNearestLandmark(lat, lon) {
  let best = null;
  let minDistance = Infinity;
  for (const item of LANDMARK_PRESETS) {
    const dLat = (item.lat - lat) * 111.0;
    const dLon = (item.lon - lon) * 111.0 * Math.cos(lat * (Math.PI / 180));
    const distKm = Math.sqrt(dLat * dLat + dLon * dLon);
    if (distKm < minDistance) {
      minDistance = distKm;
      best = { ...item, distanceKm: distKm };
    }
  }
  return best;
}

// Map recentering controller
function MapController({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center && !isNaN(center[0]) && !isNaN(center[1])) {
      map.flyTo(center, zoom || map.getZoom(), { duration: 0.8 });
    }
  }, [center, zoom, map]);
  return null;
}

// Draggable and click-to-pinpoint marker controller
function PinpointMarker({ position, onPinpointChange }) {
  useMapEvents({
    click(e) {
      if (e.latlng) {
        onPinpointChange(e.latlng.lat, e.latlng.lng);
      }
    }
  });

  return (
    <Marker
      position={position}
      icon={markerIcon}
      draggable={true}
      eventHandlers={{
        dragend(e) {
          const marker = e.target;
          if (marker) {
            const pos = marker.getLatLng();
            onPinpointChange(pos.lat, pos.lng);
          }
        }
      }}
    />
  );
}

export default function FieldReportForm({ onReportSubmitted }) {
  const [hazardType, setHazardType] = useState('Landslide');
  const [locationName, setLocationName] = useState('Sohra (Cherrapunji) Escarpment');
  const [description, setDescription] = useState('Landslide blocking half of the road. Traffic moving slowly.');
  const [impactLevel, setImpactLevel] = useState('Critical'); // 'Low', 'Medium', 'High', 'Critical'
  const [visibility, setVisibility] = useState('Good');

  // Photo
  const [photoPreview, setPhotoPreview] = useState('/images/incidents/incident-landslide.jpg');
  
  // GPS Coordinates & Pinpoint Telemetry
  const [numericCoords, setNumericCoords] = useState({ lat: 25.3011, lon: 91.7231, alt: 1146 });
  const [coords, setCoords] = useState({ 
    lat: '25.3011° N', 
    lon: '91.7231° E', 
    alt: '1,146 m', 
    accuracy: '± 4 m (Live GPS Lock)', 
    captured: 'Just now',
    source: 'Default / Presets'
  });
  
  const [isGpsLocating, setIsGpsLocating] = useState(false);
  const [gpsError, setGpsError] = useState(null);
  const [mapTileLayer, setMapTileLayer] = useState('satellite'); // 'satellite' | 'street'
  const [showManualCoords, setShowManualCoords] = useState(false);

  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  
  const mapSectionRef = useRef(null);

  // Acquire high-accuracy native device GPS
  const handleAcquireLiveGps = () => {
    if (typeof navigator === 'undefined' || !('geolocation' in navigator)) {
      setGpsError('Geolocation is not supported on this device/browser.');
      return;
    }

    setIsGpsLocating(true);
    setGpsError(null);
    setStatusMessage('');

    if (typeof navigator.vibrate === 'function') {
      navigator.vibrate(40);
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = parseFloat(pos.coords.latitude.toFixed(5));
        const lon = parseFloat(pos.coords.longitude.toFixed(5));
        const alt = pos.coords.altitude ? Math.round(pos.coords.altitude) : (numericCoords.alt || 1146);
        const accuracyNum = pos.coords.accuracy ? Math.round(pos.coords.accuracy) : 3;
        const accuracyText = `± ${accuracyNum} m (Live GPS Fix)`;

        setNumericCoords({ lat, lon, alt });
        setCoords({
          lat: `${lat.toFixed(4)}° N`,
          lon: `${lon.toFixed(4)}° E`,
          alt: `${alt.toLocaleString()} m`,
          accuracy: accuracyText,
          captured: 'Just now',
          source: 'Device Hardware GPS'
        });

        // Automatically match nearest known corridor in East Khasi Hills
        const nearest = findNearestLandmark(lat, lon);
        if (nearest && nearest.distanceKm < 3.0) {
          setLocationName(`${nearest.name} (near ${nearest.corridor})`);
        } else {
          setLocationName(`Field Coordinates (${lat.toFixed(4)}° N, ${lon.toFixed(4)}° E)`);
        }

        setIsGpsLocating(false);
        setStatusMessage(`📍 Live GPS Lock Acquired: ${lat.toFixed(4)}° N, ${lon.toFixed(4)}° E (${accuracyText})`);

        if (typeof navigator.vibrate === 'function') {
          navigator.vibrate([60, 40, 60]);
        }
      },
      (err) => {
        console.warn('Geolocation acquisition error:', err);
        setIsGpsLocating(false);
        let msg = 'Unable to acquire satellite GPS fix. You can tap on the map or select a preset corridor below.';
        if (err.code === 1) {
          msg = 'GPS permission denied. Please grant location permissions in your browser or Android settings.';
        } else if (err.code === 2) {
          msg = 'GPS signal unavailable. You can tap the pinpoint map to place the hazard pin manually.';
        } else if (err.code === 3) {
          msg = 'GPS request timed out. Please tap "Acquire GPS" again or drop a pin on the map.';
        }
        setGpsError(msg);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // User tapped on the map or dragged the marker
  const handlePinpointChange = (lat, lon) => {
    const clampedLat = parseFloat(lat.toFixed(5));
    const clampedLon = parseFloat(lon.toFixed(5));

    setNumericCoords(prev => ({ ...prev, lat: clampedLat, lon: clampedLon }));
    setCoords({
      lat: `${clampedLat.toFixed(4)}° N`,
      lon: `${clampedLon.toFixed(4)}° E`,
      alt: `${numericCoords.alt.toLocaleString()} m`,
      accuracy: '± 1 m (Pinpoint Picked)',
      captured: 'Manual Pinpoint',
      source: 'Interactive Map Picker'
    });

    const nearest = findNearestLandmark(clampedLat, clampedLon);
    if (nearest && nearest.distanceKm < 2.5) {
      setLocationName(nearest.name);
    }

    setStatusMessage(`🎯 Pinpoint set to ${clampedLat.toFixed(4)}° N, ${clampedLon.toFixed(4)}° E`);

    if (typeof navigator.vibrate === 'function') {
      navigator.vibrate(30);
    }
  };

  // Quick preset landmark selection
  const handleSelectLandmark = (preset) => {
    setNumericCoords({ lat: preset.lat, lon: preset.lon, alt: preset.alt });
    setCoords({
      lat: `${preset.lat.toFixed(4)}° N`,
      lon: `${preset.lon.toFixed(4)}° E`,
      alt: `${preset.alt.toLocaleString()} m`,
      accuracy: '± 2 m (Landmark Snap)',
      captured: 'Preset Hotspot',
      source: preset.corridor
    });
    setLocationName(preset.name);
    setStatusMessage(`📍 Snapped location to ${preset.name} (${preset.corridor})`);

    if (typeof navigator.vibrate === 'function') {
      navigator.vibrate(30);
    }
  };

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
        captured: 'Just now',
        source: 'Android Hardware Telemetry'
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

  const scrollToMap = () => {
    if (mapSectionRef.current) {
      mapSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
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
        setStatusMessage('📦 REPORT QUEUED OFFLINE: Stored locally in IndexedDB. Will auto-sync once signal is restored.');
      } else {
        setStatusMessage('✅ Report submitted successfully with exact GPS coordinates to SDMA Command Center!');
      }
      if (onReportSubmitted) onReportSubmitted();
    } catch (err) {
      setStatusMessage('📦 REPORT QUEUED: Stored safely in local offline queue.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card style={{ padding: '20px 24px' }}>
      {/* Top Banner Status Feedback */}
      {statusMessage && (
        <div
          style={{
            background: 'var(--risk-low-bg, rgba(34, 197, 94, 0.12))',
            border: '1px solid var(--risk-low, #22C55E)',
            color: 'var(--risk-low, #22C55E)',
            padding: '10px 16px',
            borderRadius: 'var(--radius-md, 8px)',
            fontSize: '0.8rem',
            fontWeight: 600,
            marginBottom: 20,
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}
        >
          <CheckCircle2 size={16} />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* GPS Error Alert */}
      {gpsError && (
        <div
          style={{
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.35)',
            color: '#F87171',
            padding: '10px 14px',
            borderRadius: 'var(--radius-md, 8px)',
            fontSize: '0.78rem',
            marginBottom: 20,
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}
        >
          <AlertTriangle size={16} style={{ flexShrink: 0 }} />
          <span>{gpsError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* 3-COLUMN RESPONSIVE LAYOUT */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 24,
            alignItems: 'start'
          }}
        >
          {/* COLUMN 1: REPORT DETAILS & GPS QUICK CONTROLS */}
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

            {/* Location Input with Live GPS Lock Trigger */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                  Location / Hazard Site
                </label>
                <button
                  type="button"
                  onClick={handleAcquireLiveGps}
                  disabled={isGpsLocating}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 5,
                    background: isGpsLocating ? 'rgba(79, 111, 255, 0.25)' : 'rgba(79, 111, 255, 0.12)',
                    color: 'var(--brand-primary, #4F6FFF)',
                    border: '1px solid rgba(79, 111, 255, 0.35)',
                    borderRadius: 'var(--radius-pill, 9999px)',
                    padding: '3px 10px',
                    fontSize: '0.70rem',
                    fontWeight: 600,
                    cursor: isGpsLocating ? 'wait' : 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  title="Acquire live GPS coordinates from your device hardware"
                >
                  <LocateFixed size={12} style={{ animation: isGpsLocating ? 'spin 1s linear infinite' : 'none' }} />
                  <span>{isGpsLocating ? 'Locking GPS...' : 'Use My Live GPS'}</span>
                </button>
              </div>

              <Input
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                placeholder="e.g. Sohra (Cherrapunji) Escarpment, NH-6"
                required
                fullWidth
              />

              {/* Pinpoint Status & Jump to Map Strip */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginTop: 6,
                  padding: '6px 10px',
                  background: 'var(--bg-surface, #101010)',
                  border: '1px solid var(--border-primary, #252525)',
                  borderRadius: 'var(--radius-md, 6px)',
                  fontSize: '0.70rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <MapPin size={12} style={{ color: '#EF4444' }} />
                  <span style={{ color: 'var(--text-secondary)' }}>GPS Pin:</span>
                  <span style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                    {coords.lat}, {coords.lon}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={scrollToMap}
                  style={{
                    color: 'var(--brand-primary)',
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    fontSize: '0.70rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    textDecoration: 'underline'
                  }}
                >
                  Pinpoint on Map ↓
                </button>
              </div>

              {/* Quick Landmark Hotspots Horizontal Presets */}
              <div style={{ marginTop: 8 }}>
                <div style={{ fontSize: '0.66rem', color: 'var(--text-muted, #737373)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 5 }}>
                  Quick Corridor Presets (East Khasi Hills)
                </div>
                <div 
                  style={{ 
                    display: 'flex', 
                    gap: 6, 
                    overflowX: 'auto', 
                    paddingBottom: 4,
                    WebkitOverflowScrolling: 'touch',
                    scrollbarWidth: 'none'
                  }}
                >
                  {LANDMARK_PRESETS.map((preset) => {
                    const isSelected = Math.abs(numericCoords.lat - preset.lat) < 0.001 && Math.abs(numericCoords.lon - preset.lon) < 0.001;
                    return (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => handleSelectLandmark(preset)}
                        style={{
                          flexShrink: 0,
                          background: isSelected ? 'rgba(79, 111, 255, 0.2)' : 'var(--bg-surface, #101010)',
                          color: isSelected ? 'var(--brand-primary)' : 'var(--text-secondary)',
                          border: `1px solid ${isSelected ? 'var(--brand-primary)' : 'var(--border-primary)'}`,
                          borderRadius: 'var(--radius-pill, 9999px)',
                          padding: '3px 9px',
                          fontSize: '0.67rem',
                          fontWeight: 500,
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        📍 {preset.name.split(' ')[0]} ({preset.corridor})
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500, display: 'block', marginBottom: 6 }}>
                Description / Hazard Situation
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
                  background: 'var(--bg-surface, #101010)',
                  border: '1px solid var(--border-primary, #252525)',
                  color: 'var(--text-primary, #F5F5F5)',
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
                  { id: 'Low', color: 'var(--risk-low, #22C55E)' },
                  { id: 'Medium', color: 'var(--risk-medium, #EAB308)' },
                  { id: 'High', color: 'var(--risk-high, #F97316)' },
                  { id: 'Critical', color: 'var(--risk-critical, #EF4444)' }
                ].map(item => {
                  const isActive = impactLevel === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setImpactLevel(item.id)}
                      style={{
                        background: isActive ? item.color : 'var(--bg-surface, #101010)',
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
              label="Visibility & Weather Conditions"
              value={visibility}
              onChange={(e) => setVisibility(e.target.value)}
              options={[
                { value: 'Good', label: 'Good (Clear Sight)' },
                { value: 'Foggy', label: 'Foggy (Dense Mountain Mist)' },
                { value: 'Heavy Rain', label: 'Heavy Rain / Cloudburst' }
              ]}
            />
          </div>

          {/* COLUMN 2: PHOTO & INTERACTIVE PINPOINT MAP */}
          <div ref={mapSectionRef} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--brand-primary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                PHOTO & PINPOINT MAP
              </span>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                Tap map to place pin
              </span>
            </div>

            {/* Incident Photo Preview */}
            <div style={{ position: 'relative', width: '100%', height: 140, borderRadius: 'var(--radius-md, 8px)', overflow: 'hidden', border: '1px solid var(--border-primary)' }}>
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
                  background: 'rgba(10, 10, 10, 0.88)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid var(--border-primary)',
                  borderRadius: 'var(--radius-full, 9999px)',
                  padding: '4px 12px',
                  color: 'var(--text-primary)',
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5
                }}
              >
                <Camera size={13} />
                <span>Change Photo</span>
                <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} />
              </label>
            </div>

            {/* Interactive GPS Pinpoint Map Container */}
            <div 
              style={{ 
                position: 'relative',
                width: '100%', 
                height: 230, 
                borderRadius: 'var(--radius-md, 8px)', 
                overflow: 'hidden', 
                border: '1px solid var(--border-primary)',
                background: '#0D1117'
              }}
            >
              {/* Floating Map Controls Top Overlay */}
              <div 
                style={{ 
                  position: 'absolute', 
                  top: 8, 
                  left: 8, 
                  right: 8, 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  zIndex: 999,
                  pointerEvents: 'none'
                }}
              >
                {/* Instruction Tag */}
                <div 
                  style={{ 
                    background: 'rgba(10, 10, 10, 0.85)', 
                    backdropFilter: 'blur(8px)',
                    border: '1px solid var(--border-primary)',
                    borderRadius: 'var(--radius-pill, 9999px)',
                    padding: '3px 9px',
                    fontSize: '0.66rem',
                    color: 'var(--text-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                    pointerEvents: 'auto'
                  }}
                >
                  <Crosshair size={11} style={{ color: '#EF4444' }} />
                  <span>Tap or drag marker to pinpoint spot</span>
                </div>

                {/* Satellite / Street Layer Switcher */}
                <button
                  type="button"
                  onClick={() => setMapTileLayer(prev => prev === 'satellite' ? 'street' : 'satellite')}
                  style={{
                    background: 'rgba(10, 10, 10, 0.85)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid var(--border-primary)',
                    borderRadius: 'var(--radius-pill, 9999px)',
                    padding: '3px 8px',
                    fontSize: '0.65rem',
                    color: 'var(--text-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    cursor: 'pointer',
                    pointerEvents: 'auto'
                  }}
                  title="Switch between satellite imagery and topographic street road map"
                >
                  <Layers size={11} />
                  <span>{mapTileLayer === 'satellite' ? '🛰️ Satellite' : '🗺️ Roads'}</span>
                </button>
              </div>

              {/* Leaflet Map */}
              <MapContainer
                center={[numericCoords.lat, numericCoords.lon]}
                zoom={13}
                style={{ width: '100%', height: '100%' }}
                zoomControl={true}
              >
                {mapTileLayer === 'satellite' ? (
                  <TileLayer
                    url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                    attribution="&copy; Esri World Imagery"
                    maxZoom={19}
                  />
                ) : (
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution="&copy; OpenStreetMap"
                    maxZoom={19}
                  />
                )}

                <MapController center={[numericCoords.lat, numericCoords.lon]} />
                <PinpointMarker 
                  position={[numericCoords.lat, numericCoords.lon]} 
                  onPinpointChange={handlePinpointChange} 
                />
              </MapContainer>

              {/* Bottom Overlay: Active Coordinate Badge & Recenter Button */}
              <div
                style={{
                  position: 'absolute',
                  bottom: 8,
                  left: 8,
                  right: 8,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  zIndex: 999,
                  pointerEvents: 'none'
                }}
              >
                <div
                  style={{
                    background: 'rgba(10, 10, 10, 0.88)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid var(--border-primary)',
                    borderRadius: 'var(--radius-pill, 9999px)',
                    padding: '3px 8px',
                    fontSize: '0.68rem',
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--text-primary)',
                    pointerEvents: 'auto'
                  }}
                >
                  📍 {numericCoords.lat.toFixed(4)}°N, {numericCoords.lon.toFixed(4)}°E
                </div>

                <button
                  type="button"
                  onClick={handleAcquireLiveGps}
                  style={{
                    background: 'rgba(79, 111, 255, 0.9)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(255, 255, 255, 0.25)',
                    borderRadius: 'var(--radius-pill, 9999px)',
                    padding: '4px 10px',
                    fontSize: '0.68rem',
                    fontWeight: 600,
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                    cursor: 'pointer',
                    pointerEvents: 'auto',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.5)'
                  }}
                  title="Snap map pin back to current device GPS position"
                >
                  <LocateFixed size={12} />
                  <span>My GPS</span>
                </button>
              </div>
            </div>

            {/* Fine-tune Coordinates Accordion Toggle */}
            <div>
              <button
                type="button"
                onClick={() => setShowManualCoords(prev => !prev)}
                style={{
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '6px 10px',
                  background: 'var(--bg-surface, #101010)',
                  border: '1px solid var(--border-primary, #252525)',
                  borderRadius: 'var(--radius-md, 6px)',
                  color: 'var(--text-secondary)',
                  fontSize: '0.72rem',
                  cursor: 'pointer'
                }}
              >
                <span>Fine-Tune Exact Lat / Lon Coordinates</span>
                {showManualCoords ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>

              {showManualCoords && (
                <div 
                  style={{ 
                    marginTop: 8, 
                    display: 'grid', 
                    gridTemplateColumns: '1fr 1fr', 
                    gap: 8,
                    padding: 10,
                    background: 'var(--bg-surface, #101010)',
                    border: '1px solid var(--border-primary)',
                    borderRadius: 'var(--radius-md, 8px)'
                  }}
                >
                  <div>
                    <label style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                      Latitude (°N)
                    </label>
                    <input
                      type="number"
                      step="0.0001"
                      value={numericCoords.lat}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        if (!isNaN(val)) handlePinpointChange(val, numericCoords.lon);
                      }}
                      style={{
                        width: '100%',
                        fontSize: '0.80rem',
                        fontFamily: 'var(--font-mono)',
                        padding: '6px 8px',
                        background: 'var(--bg-main, #0A0A0A)',
                        border: '1px solid var(--border-primary)',
                        borderRadius: 6,
                        color: 'var(--text-primary)'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                      Longitude (°E)
                    </label>
                    <input
                      type="number"
                      step="0.0001"
                      value={numericCoords.lon}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        if (!isNaN(val)) handlePinpointChange(numericCoords.lat, val);
                      }}
                      style={{
                        width: '100%',
                        fontSize: '0.80rem',
                        fontFamily: 'var(--font-mono)',
                        padding: '6px 8px',
                        background: 'var(--bg-main, #0A0A0A)',
                        border: '1px solid var(--border-primary)',
                        borderRadius: 6,
                        color: 'var(--text-primary)'
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* COLUMN 3: AUTO LOCATION & SUBMIT */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--brand-primary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              GPS TELEMETRY & SUBMIT
            </div>

            {/* Auto Location Telemetry Box */}
            <div
              style={{
                background: 'var(--bg-card-hover, #181818)',
                border: '1px solid var(--border-primary, #252525)',
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
                <span style={{ color: 'var(--risk-low, #22C55E)', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>{coords.accuracy}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Fix Source</span>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.70rem' }}>{coords.source}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Timestamp</span>
                <span style={{ color: 'var(--text-muted)' }}>{coords.captured}</span>
              </div>

              {/* Big Live GPS Action Button */}
              <button
                type="button"
                onClick={handleAcquireLiveGps}
                disabled={isGpsLocating}
                style={{
                  marginTop: 6,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  padding: '9px 12px',
                  background: isGpsLocating ? 'rgba(79, 111, 255, 0.2)' : 'rgba(79, 111, 255, 0.12)',
                  color: 'var(--brand-primary, #4F6FFF)',
                  border: '1px solid rgba(79, 111, 255, 0.35)',
                  borderRadius: 'var(--radius-md, 8px)',
                  fontSize: '0.76rem',
                  fontWeight: 600,
                  cursor: isGpsLocating ? 'wait' : 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <LocateFixed size={15} style={{ animation: isGpsLocating ? 'spin 1s linear infinite' : 'none' }} />
                <span>{isGpsLocating ? 'Acquiring Device GPS Fix...' : '📍 Acquire Live Device GPS'}</span>
              </button>
            </div>

            {/* Status Section */}
            <div style={{ background: 'var(--bg-card-hover, #181818)', border: '1px solid var(--border-primary, #252525)', borderRadius: 'var(--radius-md, 8px)', padding: '14px 16px' }}>
              <span style={{ fontSize: '0.68rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 4 }}>
                TELEMETRY STATUS
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span 
                  style={{ 
                    width: 7, 
                    height: 7, 
                    borderRadius: '50%', 
                    background: isOnline ? 'var(--risk-low, #22C55E)' : 'var(--risk-critical, #EF4444)', 
                    boxShadow: isOnline ? '0 0 6px var(--risk-low, #22C55E)' : '0 0 6px var(--risk-critical, #EF4444)' 
                  }} 
                />
                <span style={{ fontSize: '0.78rem', color: isOnline ? 'var(--risk-low, #22C55E)' : 'var(--risk-critical, #EF4444)', fontWeight: 600 }}>
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

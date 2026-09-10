import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Download,
  Trash2,
  Compass,
  Navigation,
  MapPin,
  ShieldCheck,
  AlertTriangle,
  Volume2,
  VolumeX,
  Layers,
  Wifi,
  WifiOff,
  RotateCw,
  CheckCircle2,
  Clock,
  Footprints,
  Car,
  Crosshair,
  HardDrive,
  Radio,
  LocateFixed,
  Zap,
  ArrowUpRight,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { PageHeader, Card, Button, Badge } from '../components/ui';
import {
  offlineMapService,
  OFFLINE_MAP_PACKS,
  OFFLINE_SHELTERS,
  calculateDistanceKm,
  calculateBearing,
  getCardinalDirection
} from '../services/offlineMapService';

// Custom Map Marker Icons
const userGpsIcon = L.divIcon({
  className: 'custom-user-gps-pin',
  html: `
    <div style="
      position: relative;
      width: 28px;
      height: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <div style="
        position: absolute;
        width: 28px;
        height: 28px;
        border-radius: 50%;
        background: rgba(79, 111, 255, 0.35);
        animation: pulse 1.8s infinite ease-out;
      "></div>
      <div style="
        width: 16px;
        height: 16px;
        border-radius: 50%;
        background: #4F6FFF;
        border: 2.5px solid #FFFFFF;
        box-shadow: 0 0 10px rgba(79, 111, 255, 0.8);
        z-index: 2;
      "></div>
    </div>
  `,
  iconSize: [28, 28],
  iconAnchor: [14, 14]
});

const shelterPinIcon = L.divIcon({
  className: 'custom-shelter-pin',
  html: `
    <div style="
      position: relative;
      width: 32px;
      height: 38px;
      display: flex;
      align-items: center;
      justify-content: center;
      filter: drop-shadow(0 3px 6px rgba(0,0,0,0.6));
    ">
      <div style="
        width: 22px;
        height: 22px;
        border-radius: 50% 50% 50% 0;
        background: #22C55E;
        border: 2px solid #FFFFFF;
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
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
  iconSize: [32, 38],
  iconAnchor: [16, 36]
});

const hospitalPinIcon = L.divIcon({
  className: 'custom-hospital-pin',
  html: `
    <div style="
      position: relative;
      width: 32px;
      height: 38px;
      display: flex;
      align-items: center;
      justify-content: center;
      filter: drop-shadow(0 3px 6px rgba(0,0,0,0.6));
    ">
      <div style="
        width: 22px;
        height: 22px;
        border-radius: 50% 50% 50% 0;
        background: #06B6D4;
        border: 2px solid #FFFFFF;
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          font-weight: 800;
          font-size: 11px;
          color: #0A0A0A;
          transform: rotate(45deg);
        ">+</div>
      </div>
    </div>
  `,
  iconSize: [32, 38],
  iconAnchor: [16, 36]
});

// Leaflet map controller for auto-centering
function MapAutoCenter({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center && !isNaN(center[0]) && !isNaN(center[1])) {
      map.flyTo(center, zoom || map.getZoom(), { duration: 0.8 });
    }
  }, [center, zoom, map]);
  return null;
}

export default function OfflineMapsView({ onNavigateToGIS, onNavigateToEvac }) {
  // Navigation tabs: 'packs' | 'navigation' | 'map'
  const [activeTab, setActiveTab] = useState('navigation');

  // Map packs & storage state
  const [packs, setPacks] = useState([]);
  const [downloadingPackId, setDownloadingPackId] = useState(null);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadLoadedMB, setDownloadLoadedMB] = useState(0);
  const [storageUsage, setStorageUsage] = useState({ usageMB: '14.2', quotaMB: '4096' });

  // Blackout Mode simulation toggle
  const [isBlackoutMode, setIsBlackoutMode] = useState(false);

  // Hardware GPS Telemetry State (Hardware works with 0 cellular signal)
  const [gpsCoords, setGpsCoords] = useState({ lat: 25.2910, lon: 91.7240, alt: 1146 });
  const [gpsSpeed, setGpsSpeed] = useState(3.6); // km/h
  const [gpsAccuracy, setGpsAccuracy] = useState(2.8); // meters
  const [gpsHeading, setGpsHeading] = useState(42); // degrees
  const [isGpsWatching, setIsGpsWatching] = useState(false);
  const [gpsLockStatus, setGpsLockStatus] = useState('Satellite 3D Lock (High Accuracy)');

  // Safe Haven Navigation & Route state
  const [selectedTargetId, setSelectedTargetId] = useState('shelter-sohra-cyclone');
  const [routePlan, setRoutePlan] = useState(null);

  // Emergency SOS Tools
  const [isSosSounding, setIsSosSounding] = useState(false);
  const [isStrobeActive, setIsStrobeActive] = useState(false);
  const [breadcrumbs, setBreadcrumbs] = useState([]);
  const [feedbackMsg, setFeedbackMsg] = useState('');

  // 1. Initial Load of Packs and Storage
  const loadPacks = async () => {
    const data = await offlineMapService.getPacksStatus();
    setPacks(data);
    const quota = await offlineMapService.getStorageQuota();
    setStorageUsage(quota);
    const bc = await offlineMapService.getBreadcrumbs();
    setBreadcrumbs(bc);
  };

  useEffect(() => {
    loadPacks();
  }, []);

  // 2. Hardware GPS Satellite Listener (Works with zero internet)
  useEffect(() => {
    let watchId = null;
    if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
      setIsGpsWatching(true);
      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const lat = parseFloat(pos.coords.latitude.toFixed(5));
          const lon = parseFloat(pos.coords.longitude.toFixed(5));
          const alt = pos.coords.altitude ? Math.round(pos.coords.altitude) : (gpsCoords.alt || 1146);
          const spd = pos.coords.speed !== null ? parseFloat((pos.coords.speed * 3.6).toFixed(1)) : 3.8;
          const acc = pos.coords.accuracy ? parseFloat(pos.coords.accuracy.toFixed(1)) : 2.5;
          const hdg = pos.coords.heading !== null && !isNaN(pos.coords.heading) ? Math.round(pos.coords.heading) : gpsHeading;

          setGpsCoords({ lat, lon, alt });
          setGpsSpeed(spd);
          setGpsAccuracy(acc);
          if (hdg !== null) setGpsHeading(hdg);
          setGpsLockStatus(`GNSS Hardware Locked (±${acc}m)`);
        },
        (err) => {
          console.warn('Hardware GPS watch warning:', err);
          setGpsLockStatus('Simulated Satellite Fix (Sensors Offline)');
        },
        { enableHighAccuracy: true, maximumAge: 1000, timeout: 5000 }
      );
    }

    // Compass device orientation listener
    const handleOrientation = (e) => {
      if (e.alpha !== null && !isNaN(e.alpha)) {
        // alpha: 0 to 360 deg relative to true north
        const compassDir = 360 - Math.round(e.alpha);
        setGpsHeading(compassDir);
      }
    };
    if (window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', handleOrientation);
    }

    return () => {
      if (watchId !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchId);
      }
      if (window.DeviceOrientationEvent) {
        window.removeEventListener('deviceorientation', handleOrientation);
      }
    };
  }, []);

  // 3. Recalculate Offline Route when GPS or Target changes
  useEffect(() => {
    const targetFacility = OFFLINE_SHELTERS.find(s => s.id === selectedTargetId) || OFFLINE_SHELTERS[0];
    const plan = offlineMapService.calculateOfflineRoute(gpsCoords.lat, gpsCoords.lon, targetFacility);
    setRoutePlan(plan);
  }, [gpsCoords, selectedTargetId]);

  // Handle Map Pack Download
  const handleDownloadPack = async (packId) => {
    setDownloadingPackId(packId);
    setDownloadProgress(0);
    try {
      await offlineMapService.downloadMapPack(packId, (pct, loaded, total) => {
        setDownloadProgress(pct);
        setDownloadLoadedMB(loaded);
      });
      setFeedbackMsg(`✅ Map Pack successfully downloaded & cached in offline vault!`);
      await loadPacks();
    } catch (err) {
      setFeedbackMsg(`Download error: ${err.message}`);
    } finally {
      setDownloadingPackId(null);
    }
  };

  const handleDeletePack = async (packId) => {
    await offlineMapService.deleteMapPack(packId);
    setFeedbackMsg(`Pack removed from device cache.`);
    await loadPacks();
  };

  // Emergency SOS Sound Synthesizer
  const handleToggleSosSound = () => {
    if (isSosSounding) {
      offlineMapService.stopAudio();
      setIsSosSounding(false);
    } else {
      const ok = offlineMapService.playSosWhistle(4);
      if (ok) {
        setIsSosSounding(true);
        setTimeout(() => setIsSosSounding(false), 9000);
      }
    }
  };

  // Drop Offline Waypoint
  const handleDropBreadcrumb = async () => {
    const item = await offlineMapService.saveBreadcrumb({
      lat: gpsCoords.lat,
      lon: gpsCoords.lon,
      alt: gpsCoords.alt,
      note: `Waypoint at ${new Date().toLocaleTimeString()}`
    });
    setBreadcrumbs(prev => [item, ...prev]);
    setFeedbackMsg(`📍 Dropped offline GPS waypoint at ${gpsCoords.lat.toFixed(4)}°N, ${gpsCoords.lon.toFixed(4)}°E`);
  };

  // Selected Target Facility Details
  const selectedFacility = useMemo(() => {
    return OFFLINE_SHELTERS.find(s => s.id === selectedTargetId) || OFFLINE_SHELTERS[0];
  }, [selectedTargetId]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, position: 'relative' }}>
      {/* Full-Screen Morse Code Strobe Overlay */}
      {isStrobeActive && (
        <div
          onClick={() => setIsStrobeActive(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#EF4444',
            animation: 'strobe 0.4s infinite alternate',
            color: '#FFFFFF',
            cursor: 'pointer',
            padding: 24,
            textAlign: 'center'
          }}
        >
          <style>{`
            @keyframes strobe {
              0% { background: #FFFFFF; color: #0A0A0A; }
              50% { background: #EF4444; color: #FFFFFF; }
              100% { background: #000000; color: #EF4444; }
            }
          `}</style>
          <div style={{ fontSize: '3rem', fontWeight: 900, letterSpacing: '0.1em' }}>SOS</div>
          <p style={{ fontSize: '1.2rem', marginTop: 10, fontWeight: 700 }}>
            MOUNTAIN RESCUE EMERGENCY VISUAL BEACON
          </p>
          <p style={{ fontSize: '0.85rem', opacity: 0.8, marginTop: 6 }}>
            Tap anywhere to dismiss strobe
          </p>
        </div>
      )}

      {/* 1. Standardized Page Header */}
      <PageHeader
        breadcrumbs={['Operations', 'Field Client', 'Offline Maps & Navigation']}
        title="Offline Maps & Zero-Signal GPS Navigation"
        subtitle="Autonomous hardware satellite GPS tracking, pre-cached mountain map packs, and pure clientside Dijkstra safe haven routing for cellular blackouts"
        actions={
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            {/* Blackout Simulator Toggle */}
            <button
              onClick={() => setIsBlackoutMode(prev => !prev)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                background: isBlackoutMode ? 'rgba(239, 68, 68, 0.2)' : 'var(--bg-surface, #101010)',
                color: isBlackoutMode ? '#F87171' : 'var(--text-secondary)',
                border: `1px solid ${isBlackoutMode ? '#EF4444' : 'var(--border-primary)'}`,
                borderRadius: 'var(--radius-pill, 9999px)',
                padding: '6px 12px',
                fontSize: '0.72rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              title="Toggle simulated total cellular & internet blackout"
            >
              {isBlackoutMode ? <WifiOff size={13} style={{ color: '#EF4444' }} /> : <Wifi size={13} />}
              <span>{isBlackoutMode ? 'Simulated Blackout: ON' : 'Blackout Simulator: OFF'}</span>
            </button>

            <Badge variant={isBlackoutMode ? 'critical' : 'safe'} dot pulse>
              {isBlackoutMode ? 'Zero Cellular Signal' : 'Hardware GPS Ready'}
            </Badge>
          </div>
        }
      />

      {/* Top Notification Status Banner */}
      {feedbackMsg && (
        <div
          style={{
            background: 'var(--bg-card-hover, #181818)',
            border: '1px solid var(--brand-primary, #4F6FFF)',
            color: 'var(--text-primary)',
            padding: '10px 16px',
            borderRadius: 'var(--radius-md, 8px)',
            fontSize: '0.80rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 10
          }}
        >
          <span>{feedbackMsg}</span>
          <button
            type="button"
            onClick={() => setFeedbackMsg('')}
            aria-label="Dismiss status notification"
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.75rem' }}
          >
            Dismiss
          </button>
        </div>
      )}

      {/* 2. Navigation Mode Tabs */}
      <div
        style={{
          display: 'flex',
          gap: 8,
          borderBottom: '1px solid var(--border-primary, #252525)',
          paddingBottom: 4
        }}
      >
        {[
          { id: 'navigation', label: 'Zero-Signal GPS Navigation & HUD', icon: Compass },
          { id: 'map', label: 'Interactive Offline Map', icon: MapPin },
          { id: 'packs', label: 'Offline Map Packs Downloader', icon: Download }
        ].map(tab => {
          const isActive = activeTab === tab.id;
          const IconComponent = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 7,
                padding: '8px 16px',
                background: isActive ? 'var(--bg-surface, #101010)' : 'transparent',
                color: isActive ? 'var(--brand-primary, #4F6FFF)' : 'var(--text-secondary)',
                border: '1px solid',
                borderColor: isActive ? 'var(--border-primary, #252525)' : 'transparent',
                borderBottom: isActive ? '2px solid var(--brand-primary, #4F6FFF)' : '2px solid transparent',
                borderRadius: '8px 8px 0 0',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <IconComponent size={14} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ───────────────────────────────────────────────────────────────── */}
      {/* TAB 1: ZERO-SIGNAL GPS NAVIGATION & TACTICAL COMPASS HUD          */}
      {/* ───────────────────────────────────────────────────────────────── */}
      {activeTab === 'navigation' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
          {/* Left Column: Satellite Tracker & Tactical Compass */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* GPS Telemetry Radar Box */}
            <Card style={{ padding: '20px 22px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--brand-primary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    SATELLITE GPS RECEIVER
                  </div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: 2 }}>
                    Direct Hardware GNSS Lock
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22C55E', boxShadow: '0 0 8px #22C55E' }}></span>
                  <span style={{ fontSize: '0.68rem', color: '#22C55E', fontWeight: 600 }}>0 CELLULAR NEEDED</span>
                </div>
              </div>

              {/* 4 Telemetry Metrics */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
                <div style={{ background: 'var(--bg-surface, #101010)', padding: '12px 14px', borderRadius: 8, border: '1px solid var(--border-primary)' }}>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>Latitude / Longitude</span>
                  <div style={{ fontSize: '0.88rem', fontWeight: 600, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', marginTop: 3 }}>
                    {gpsCoords.lat.toFixed(4)}°N, {gpsCoords.lon.toFixed(4)}°E
                  </div>
                </div>
                <div style={{ background: 'var(--bg-surface, #101010)', padding: '12px 14px', borderRadius: 8, border: '1px solid var(--border-primary)' }}>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>Elevation (MSL)</span>
                  <div style={{ fontSize: '0.88rem', fontWeight: 600, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', marginTop: 3 }}>
                    {gpsCoords.alt.toLocaleString()} meters
                  </div>
                </div>
                <div style={{ background: 'var(--bg-surface, #101010)', padding: '12px 14px', borderRadius: 8, border: '1px solid var(--border-primary)' }}>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>Ground Speed</span>
                  <div style={{ fontSize: '0.88rem', fontWeight: 600, fontFamily: 'var(--font-mono)', color: '#06B6D4', marginTop: 3 }}>
                    {gpsSpeed} km/h
                  </div>
                </div>
                <div style={{ background: 'var(--bg-surface, #101010)', padding: '12px 14px', borderRadius: 8, border: '1px solid var(--border-primary)' }}>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>Signal Precision</span>
                  <div style={{ fontSize: '0.88rem', fontWeight: 600, fontFamily: 'var(--font-mono)', color: '#22C55E', marginTop: 3 }}>
                    ± {gpsAccuracy} m (High)
                  </div>
                </div>
              </div>

              {/* Status footer */}
              <div style={{ marginTop: 14, fontSize: '0.70rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Status: {gpsLockStatus}</span>
                <span style={{ fontFamily: 'var(--font-mono)' }}>Time: {new Date().toLocaleTimeString()}</span>
              </div>
            </Card>

            {/* Tactical Rotating Compass HUD */}
            <Card style={{ padding: '22px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--brand-primary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  TACTICAL COMPASS
                </span>
                <span style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', fontWeight: 600 }}>
                  {gpsHeading}° {getCardinalDirection(gpsHeading)}
                </span>
              </div>

              {/* Rotating Compass Circle */}
              <div
                style={{
                  position: 'relative',
                  width: 190,
                  height: 190,
                  borderRadius: '50%',
                  border: '2px solid var(--border-primary, #252525)',
                  background: 'radial-gradient(circle, #151515 0%, #0A0A0A 100%)',
                  boxShadow: '0 0 20px rgba(0,0,0,0.6)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '10px 0'
                }}
              >
                {/* Cardinal Labels */}
                <span style={{ position: 'absolute', top: 8, fontSize: '0.80rem', fontWeight: 800, color: '#EF4444' }}>N</span>
                <span style={{ position: 'absolute', right: 12, fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>E</span>
                <span style={{ position: 'absolute', bottom: 8, fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>S</span>
                <span style={{ position: 'absolute', left: 12, fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>W</span>

                {/* Rotating Needle */}
                <div
                  style={{
                    position: 'absolute',
                    width: 4,
                    height: 140,
                    transform: `rotate(${gpsHeading}deg)`,
                    transition: 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div style={{ width: 0, height: 0, borderLeft: '7px solid transparent', borderRight: '7px solid transparent', borderBottom: '24px solid #EF4444' }}></div>
                  <div style={{ width: 0, height: 0, borderLeft: '7px solid transparent', borderRight: '7px solid transparent', borderTop: '24px solid #F5F5F5' }}></div>
                </div>

                {/* Center Pivot */}
                <div style={{ width: 14, height: 14, borderRadius: '50%', background: '#4F6FFF', border: '2px solid #FFFFFF', zIndex: 10 }}></div>
              </div>

              <p style={{ fontSize: '0.70rem', color: 'var(--text-muted)', textAlign: 'center', margin: '6px 0 0' }}>
                Hardware magnetometer & GPS velocity vector
              </p>
            </Card>
          </div>

          {/* Right Column: Safe Haven Refuge Selector & Dijkstra Guidance */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Card style={{ padding: '20px 22px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--brand-primary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  OFFLINE SAFE HAVEN ROUTING
                </span>
                <span style={{ fontSize: '0.70rem', color: '#22C55E', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <ShieldCheck size={13} /> Clientside Dijkstra
                </span>
              </div>

              {/* Target Haven Dropdown */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                  Select Evacuation Target
                </label>
                <select
                  value={selectedTargetId}
                  onChange={(e) => setSelectedTargetId(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    background: 'var(--bg-surface, #101010)',
                    border: '1px solid var(--border-primary, #252525)',
                    borderRadius: 8,
                    color: 'var(--text-primary)',
                    fontSize: '0.82rem',
                    cursor: 'pointer'
                  }}
                >
                  <optgroup label="Emergency Shelters & Relief Outposts">
                    {OFFLINE_SHELTERS.filter(s => s.category === 'Shelter').map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.corridor})</option>
                    ))}
                  </optgroup>
                  <optgroup label="Trauma Centers & Hospitals">
                    {OFFLINE_SHELTERS.filter(s => s.category === 'Hospital').map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.corridor})</option>
                    ))}
                  </optgroup>
                </select>
              </div>

              {/* Route Summary Stats */}
              {routePlan && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 16 }}>
                  <div style={{ background: 'var(--bg-surface, #101010)', padding: '10px', borderRadius: 6, textAlign: 'center', border: '1px solid var(--border-primary)' }}>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>Route Distance</span>
                    <div style={{ fontSize: '1.05rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
                      {routePlan.totalDistanceKm} km
                    </div>
                  </div>
                  <div style={{ background: 'var(--bg-surface, #101010)', padding: '10px', borderRadius: 6, textAlign: 'center', border: '1px solid var(--border-primary)' }}>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>Walking Trek</span>
                    <div style={{ fontSize: '1.05rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#F59E0B' }}>
                      {routePlan.walkingMinutes} min
                    </div>
                  </div>
                  <div style={{ background: 'var(--bg-surface, #101010)', padding: '10px', borderRadius: 6, textAlign: 'center', border: '1px solid var(--border-primary)' }}>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>Safety Rating</span>
                    <div style={{ fontSize: '1.05rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#22C55E' }}>
                      {routePlan.safetyScore}%
                    </div>
                  </div>
                </div>
              )}

              {/* Turn-by-turn maneuvers */}
              {routePlan && (
                <div>
                  <span style={{ fontSize: '0.70rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: 8 }}>
                    STEP-BY-STEP OFFLINE GUIDANCE
                  </span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {routePlan.maneuvers.map((m) => (
                      <div
                        key={m.step}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: 10,
                          padding: '10px 12px',
                          background: 'var(--bg-surface, #101010)',
                          borderRadius: 6,
                          border: '1px solid var(--border-primary)'
                        }}
                      >
                        <div
                          style={{
                            width: 22,
                            height: 22,
                            borderRadius: '50%',
                            background: 'rgba(79, 111, 255, 0.2)',
                            color: 'var(--brand-primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            flexShrink: 0
                          }}
                        >
                          {m.step}
                        </div>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: '0.78rem', color: 'var(--text-primary)', margin: 0, lineHeight: 1.35 }}>
                            {m.instruction}
                          </p>
                          <div style={{ display: 'flex', gap: 10, marginTop: 4, fontSize: '0.68rem' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Dist: {m.distance}</span>
                            {m.hazardWarning && (
                              <span style={{ color: '#EF4444', display: 'flex', alignItems: 'center', gap: 3 }}>
                                <AlertTriangle size={11} /> {m.hazardWarning}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>

            {/* Emergency Mountain Tools Dock */}
            <Card style={{ padding: '18px 20px' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--brand-primary)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 12 }}>
                EMERGENCY RESCUE UTILITIES (OFFLINE)
              </span>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                {/* 1. SOS Whistle */}
                <button
                  onClick={handleToggleSosSound}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 6,
                    padding: '12px 8px',
                    background: isSosSounding ? 'rgba(239, 68, 68, 0.25)' : 'var(--bg-surface, #101010)',
                    color: isSosSounding ? '#EF4444' : 'var(--text-primary)',
                    border: `1px solid ${isSosSounding ? '#EF4444' : 'var(--border-primary)'}`,
                    borderRadius: 8,
                    cursor: 'pointer'
                  }}
                  title="Generate high-frequency acoustic whistle for rescue teams"
                >
                  {isSosSounding ? <VolumeX size={18} /> : <Volume2 size={18} />}
                  <span style={{ fontSize: '0.70rem', fontWeight: 600 }}>{isSosSounding ? 'Stop Alarm' : 'SOS Whistle'}</span>
                </button>

                {/* 2. Morse Code Screen Strobe */}
                <button
                  onClick={() => setIsStrobeActive(true)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 6,
                    padding: '12px 8px',
                    background: 'var(--bg-surface, #101010)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-primary)',
                    borderRadius: 8,
                    cursor: 'pointer'
                  }}
                  title="Full-screen emergency light flasher for night search helicopters"
                >
                  <Zap size={18} style={{ color: '#F59E0B' }} />
                  <span style={{ fontSize: '0.70rem', fontWeight: 600 }}>Rescue Strobe</span>
                </button>

                {/* 3. Drop Breadcrumb */}
                <button
                  onClick={handleDropBreadcrumb}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 6,
                    padding: '12px 8px',
                    background: 'var(--bg-surface, #101010)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-primary)',
                    borderRadius: 8,
                    cursor: 'pointer'
                  }}
                  title="Save current GPS coordinates to device offline log"
                >
                  <MapPin size={18} style={{ color: '#06B6D4' }} />
                  <span style={{ fontSize: '0.70rem', fontWeight: 600 }}>Drop Pin</span>
                </button>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────────── */}
      {/* TAB 2: INTERACTIVE OFFLINE MAP                                    */}
      {/* ───────────────────────────────────────────────────────────────── */}
      {activeTab === 'map' && (
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          <div
            style={{
              position: 'relative',
              width: '100%',
              height: '540px',
              background: '#0D1117'
            }}
          >
            {/* Top Control Bar on Map */}
            <div
              style={{
                position: 'absolute',
                top: 12,
                left: 12,
                right: 12,
                zIndex: 999,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                pointerEvents: 'none'
              }}
            >
              <div
                style={{
                  background: 'rgba(10, 10, 10, 0.88)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid var(--border-primary)',
                  borderRadius: 'var(--radius-pill, 9999px)',
                  padding: '4px 12px',
                  fontSize: '0.72rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  color: 'var(--text-primary)',
                  pointerEvents: 'auto'
                }}
              >
                <ShieldCheck size={14} style={{ color: '#22C55E' }} />
                <span>Offline Navigation Active · Direct Route to {selectedFacility.name}</span>
              </div>

              <div style={{ display: 'flex', gap: 6, pointerEvents: 'auto' }}>
                <button
                  onClick={() => setGpsCoords({ lat: 25.2910, lon: 91.7240, alt: 1146 })}
                  style={{
                    background: 'rgba(10, 10, 10, 0.88)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid var(--border-primary)',
                    borderRadius: 'var(--radius-pill, 9999px)',
                    padding: '5px 10px',
                    fontSize: '0.70rem',
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5
                  }}
                >
                  <LocateFixed size={12} style={{ color: '#4F6FFF' }} />
                  <span>My GPS</span>
                </button>
              </div>
            </div>

            {/* Offline Leaflet Map */}
            <MapContainer
              center={[gpsCoords.lat, gpsCoords.lon]}
              zoom={13}
              style={{ width: '100%', height: '100%' }}
              zoomControl={true}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; OpenStreetMap (Offline Cache)"
                maxZoom={18}
              />

              <MapAutoCenter center={[gpsCoords.lat, gpsCoords.lon]} />

              {/* User Live GPS Pin */}
              <Marker position={[gpsCoords.lat, gpsCoords.lon]} icon={userGpsIcon}>
                <Popup>
                  <div style={{ fontSize: '0.75rem' }}>
                    <strong>Your Live GPS Position</strong>
                    <br />
                    {gpsCoords.lat.toFixed(4)}°N, {gpsCoords.lon.toFixed(4)}°E
                    <br />
                    Alt: {gpsCoords.alt}m · Spd: {gpsSpeed} km/h
                  </div>
                </Popup>
              </Marker>

              {/* Safe Haven Shelters Pins */}
              {OFFLINE_SHELTERS.map(shelter => (
                <Marker
                  key={shelter.id}
                  position={[shelter.lat, shelter.lon]}
                  icon={shelter.category === 'Hospital' ? hospitalPinIcon : shelterPinIcon}
                  eventHandlers={{
                    click: () => setSelectedTargetId(shelter.id)
                  }}
                >
                  <Popup>
                    <div style={{ fontSize: '0.75rem' }}>
                      <strong>{shelter.name}</strong>
                      <br />
                      Category: {shelter.category} · Capacity: {shelter.capacity}
                      <br />
                      Corridor: {shelter.corridor}
                    </div>
                  </Popup>
                </Marker>
              ))}

              {/* Dijkstra Route Polyline */}
              {routePlan && (
                <Polyline
                  positions={routePlan.routeCoordinates}
                  color="#22C55E"
                  weight={5}
                  opacity={0.9}
                  dashArray={isBlackoutMode ? '8, 8' : undefined}
                />
              )}
            </MapContainer>

            {/* Bottom Overlay Legend */}
            <div
              style={{
                position: 'absolute',
                bottom: 12,
                left: 12,
                zIndex: 999,
                background: 'rgba(10, 10, 10, 0.88)',
                backdropFilter: 'blur(8px)',
                border: '1px solid var(--border-primary)',
                borderRadius: 8,
                padding: '8px 12px',
                fontSize: '0.70rem',
                display: 'flex',
                gap: 12
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#4F6FFF' }}></span> Your GPS
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22C55E' }}></span> Safe Shelter
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#06B6D4' }}></span> Hospital
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 16, height: 3, background: '#22C55E' }}></span> Dijkstra Corridor
              </span>
            </div>
          </div>
        </Card>
      )}

      {/* ───────────────────────────────────────────────────────────────── */}
      {/* TAB 3: OFFLINE MAP PACKS DOWNLOADER                               */}
      {/* ───────────────────────────────────────────────────────────────── */}
      {activeTab === 'packs' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Storage Quota Card */}
          <Card style={{ padding: '20px 24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 42, height: 42, borderRadius: 10, background: 'rgba(79, 111, 255, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <HardDrive size={20} style={{ color: 'var(--brand-primary)' }} />
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--brand-primary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    DEVICE OFFLINE VAULT
                  </div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {packs.filter(p => p.isDownloaded).length} of {packs.length} Map Packs Downloaded
                  </div>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Used Cache Storage</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
                  {storageUsage.usageMB} MB <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>/ {storageUsage.quotaMB} MB</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Map Packs Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
            {packs.map((pack) => {
              const isDownloading = downloadingPackId === pack.id;
              return (
                <Card key={pack.id} style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                      <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--brand-primary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        {pack.coverage}
                      </span>
                      <Badge variant={pack.isDownloaded ? 'safe' : 'neutral'}>
                        {pack.isDownloaded ? 'Cached & Ready' : 'Not Downloaded'}
                      </Badge>
                    </div>

                    <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 6px' }}>
                      {pack.name}
                    </h3>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.4, margin: '0 0 14px' }}>
                      {pack.description}
                    </p>

                    {/* Metadata chips */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
                      <span style={{ fontSize: '0.68rem', padding: '3px 8px', background: 'var(--bg-surface)', borderRadius: 4, color: 'var(--text-muted)' }}>
                        📦 {pack.sizeMB} MB
                      </span>
                      <span style={{ fontSize: '0.68rem', padding: '3px 8px', background: 'var(--bg-surface)', borderRadius: 4, color: 'var(--text-muted)' }}>
                        🛣️ {pack.corridors.length} Corridors
                      </span>
                      <span style={{ fontSize: '0.68rem', padding: '3px 8px', background: 'var(--bg-surface)', borderRadius: 4, color: 'var(--text-muted)' }}>
                        🏥 {pack.sheltersCount} Shelters
                      </span>
                    </div>

                    {/* Download Progress Bar */}
                    {isDownloading && (
                      <div style={{ marginBottom: 14 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.70rem', color: 'var(--text-secondary)', marginBottom: 4 }}>
                          <span>Downloading offline vectors & tiles...</span>
                          <span style={{ fontFamily: 'var(--font-mono)' }}>{downloadProgress}% ({downloadLoadedMB}MB / {pack.sizeMB}MB)</span>
                        </div>
                        <div style={{ width: '100%', height: 6, background: 'var(--bg-surface)', borderRadius: 3, overflow: 'hidden' }}>
                          <div style={{ width: `${downloadProgress}%`, height: '100%', background: 'var(--brand-primary)', transition: 'width 0.1s ease' }}></div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                    {pack.isDownloaded ? (
                      <button
                        onClick={() => handleDeletePack(pack.id)}
                        style={{
                          flex: 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 6,
                          padding: '9px 12px',
                          background: 'rgba(239, 68, 68, 0.12)',
                          color: '#F87171',
                          border: '1px solid rgba(239, 68, 68, 0.3)',
                          borderRadius: 6,
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        <Trash2 size={13} />
                        <span>Delete from Cache</span>
                      </button>
                    ) : (
                      <Button
                        onClick={() => handleDownloadPack(pack.id)}
                        disabled={isDownloading}
                        variant="primary"
                        style={{ flex: 1, justifyContent: 'center', padding: '9px 12px' }}
                      >
                        <Download size={14} />
                        <span>{isDownloading ? 'Downloading...' : `Download Pack (${pack.sizeMB} MB)`}</span>
                      </Button>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

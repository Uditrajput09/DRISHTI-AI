import React, { useState, useEffect, useRef } from 'react';
import { 
  Smartphone, 
  Wifi, 
  WifiOff, 
  Battery, 
  BatteryCharging, 
  BatteryWarning, 
  MapPin, 
  Bell, 
  Camera, 
  Vibrate, 
  RotateCw, 
  Download, 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  Radio, 
  Maximize2, 
  Minimize2, 
  Sliders, 
  RefreshCw,
  Share2,
  Volume2,
  Navigation
} from 'lucide-react';
import { useToast } from '../context/ToastContext';

// East Khasi Hills high-risk coordinate presets
const GPS_PRESETS = [
  { id: 'sohra', name: 'Sohra (Cherrapunji)', lat: 25.2744, lon: 91.7323, alt: 1430, risk: 'Critical', zone: 'Zone 4' },
  { id: 'nohkalikai', name: 'Nohkalikai Falls (Tourist Hotspot)', lat: 25.2755, lon: 91.6853, alt: 1240, risk: 'Critical', zone: 'Zone 4' },
  { id: 'mawsynram', name: 'Mawsynram Valley', lat: 25.2974, lon: 91.5828, alt: 1400, risk: 'High', zone: 'Zone 2' },
  { id: 'shillong', name: 'Shillong Peak Ridge', lat: 25.5356, lon: 91.8542, alt: 1965, risk: 'Medium', zone: 'Zone 1' },
  { id: 'pynursla', name: 'Pynursla NH-206', lat: 25.3087, lon: 91.9023, alt: 1220, risk: 'Critical', zone: 'Zone 5' },
  { id: 'nongpoh', name: 'Nongpoh Valley NH-40', lat: 25.9036, lon: 91.8812, alt: 580, risk: 'Low', zone: 'Zone 7' }
];

// Simulated field hazard photographs
const CAMERA_PRESETS = [
  { id: 'debris', label: 'Mud & Rock Debris NH-40', url: '/images/landslide-demo-1.jpg' },
  { id: 'crack', label: 'Slope Tension Crack (50cm)', url: '/images/landslide-demo-2.jpg' },
  { id: 'culvert', label: 'Blocked Culvert & Highway Overflow', url: '/images/landslide-demo-3.jpg' }
];

export default function AndroidDeviceSimulator({ isOpen, onClose }) {
  const { showToast } = useToast();
  
  // Device Simulation States
  const [deviceModel, setDeviceModel] = useState('pixel8'); // 'pixel8' | 's24' | 'oneplus'
  const [orientation, setOrientation] = useState('portrait'); // 'portrait' | 'landscape'
  const [zoomScale, setZoomScale] = useState(0.86);
  const [networkMode, setNetworkMode] = useState('5g'); // '5g' | '3g' | 'offline'
  const [batteryLevel, setBatteryLevel] = useState(84);
  const [isCharging, setIsCharging] = useState(false);
  const [selectedGps, setSelectedGps] = useState(GPS_PRESETS[0]);
  const [activeNotification, setActiveNotification] = useState(null);
  const [isVibrating, setIsVibrating] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  const [activeTab, setActiveTab] = useState('gps'); // 'gps' | 'network' | 'push' | 'camera' | 'device'
  
  const iframeRef = useRef(null);

  // Update clock every 5 seconds
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }));
    };
    updateTime();
    const interval = setInterval(updateTime, 5000);
    return () => clearInterval(interval);
  }, []);

  // Handle Network state simulation
  const handleNetworkChange = (mode) => {
    setNetworkMode(mode);
    const isOffline = mode === 'offline';
    window.dispatchEvent(new Event(isOffline ? 'offline' : 'online'));
    if (iframeRef.current?.contentWindow) {
      try {
        iframeRef.current.contentWindow.dispatchEvent(new Event(isOffline ? 'offline' : 'online'));
        iframeRef.current.contentWindow.postMessage({
          type: 'DRISHTI_SIMULATOR_NETWORK',
          payload: { mode, isOffline }
        }, '*');
      } catch (e) {}
    }
    if (isOffline) {
      showToast('Simulating Android Offline Mode: Zero-Signal Offline Queue activated!', 'warning');
    } else {
      showToast(`Simulating Android ${mode.toUpperCase()} High-Speed Connection`, 'success');
    }
  };

  // Handle GPS location injection
  const handleSelectGps = (preset) => {
    setSelectedGps(preset);
    const detail = { latitude: preset.lat, longitude: preset.lon, name: preset.name, altitude: preset.alt, zone: preset.zone, risk: preset.risk };
    window.dispatchEvent(new CustomEvent('drishti-simulated-location', { detail }));
    if (iframeRef.current?.contentWindow) {
      try {
        iframeRef.current.contentWindow.postMessage({
          type: 'DRISHTI_SIMULATOR_LOCATION',
          payload: detail
        }, '*');
      } catch (e) {}
    }
    showToast(`Android GPS Locked: ${preset.name} (${preset.lat.toFixed(4)}°N, ${preset.lon.toFixed(4)}°E)`, 'info');
  };

  // Navigate simulated mobile application
  const navigateSimulatedApp = (section) => {
    if (iframeRef.current?.contentWindow) {
      try {
        iframeRef.current.contentWindow.postMessage({
          type: 'DRISHTI_SIMULATOR_NAVIGATE',
          payload: section
        }, '*');
      } catch (e) {}
    }
    showToast(`Simulated Android: Switched to ${section.toUpperCase()} View`, 'info');
  };

  // Trigger Simulated Push Notification
  const triggerPushNotification = (type) => {
    let notif = {
      id: Date.now(),
      title: '🚨 CRITICAL LANDSLIDE ALERT',
      body: 'Cloudburst detected in Sohra sector. Evacuate Zone 4 immediately.',
      severity: 'critical',
      time: 'Just now'
    };

    if (type === 'warning') {
      notif = {
        id: Date.now(),
        title: '⚠️ HIGH RISK ADVISORY',
        body: 'NH-6 kilometer 42 partially blocked by rockfall debris. SDRF deployed.',
        severity: 'high',
        time: 'Just now'
      };
    } else if (type === 'clear') {
      notif = {
        id: Date.now(),
        title: '✅ ADVISORY CLEARED',
        body: 'Rainfall intensity subsided in Shillong Peak corridor. All routes open.',
        severity: 'clear',
        time: 'Just now'
      };
    }

    setActiveNotification(notif);
    setIsVibrating(true);
    setTimeout(() => setActiveNotification(null), 6000);
    setTimeout(() => setIsVibrating(false), 500);
    
    if (iframeRef.current?.contentWindow) {
      try {
        iframeRef.current.contentWindow.postMessage({
          type: 'DRISHTI_SIMULATOR_NOTIFICATION',
          payload: notif
        }, '*');
      } catch (e) {}
    }
  };

  // Trigger Haptic feedback
  const triggerVibration = () => {
    setIsVibrating(true);
    if (navigator.vibrate) {
      navigator.vibrate([200, 100, 200]);
    }
    setTimeout(() => setIsVibrating(false), 500);
  };

  // Handle direct APK download
  const handleDownloadApk = () => {
    const downloadUrl = window.location.port === '8000' ? '/api/download/apk' : '/downloads/drishti-ai-v1.0.apk';
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = 'drishti-ai-v1.0.apk';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Downloading DRISHTI-AI Android APK (28 MB)...', 'success');
  };

  if (!isOpen) return null;

  // Frame dimension calculations based on model & orientation
  const isPortrait = orientation === 'portrait';
  const phoneWidth = isPortrait ? 380 : 760;
  const phoneHeight = isPortrait ? 760 : 380;
  
  // Outer chassis padding is 12px each side = 24px total
  const unscaledChassisWidth = phoneWidth + 24;
  const unscaledChassisHeight = phoneHeight + 24;

  // Viewport-aware layout calculation: Exactly bounds the transformed element to eliminate phantom padding
  const scaledWidth = unscaledChassisWidth * zoomScale;
  const scaledHeight = unscaledChassisHeight * zoomScale;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundColor: 'rgba(5, 5, 7, 0.92)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}
    >
      {/* Top Fixed Simulator Header */}
      <div
        style={{
          height: 60,
          padding: '0 24px',
          borderBottom: '1px solid var(--border-primary)',
          backgroundColor: 'var(--bg-surface)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
          zIndex: 10001
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 'var(--radius-input)',
              backgroundColor: 'var(--brand-tint)',
              border: '1px solid var(--brand-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--brand-primary)'
            }}
          >
            <Smartphone size={18} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h2
                style={{
                  fontSize: '1rem',
                  color: 'var(--text-primary)',
                  margin: 0,
                  fontWeight: 600,
                  letterSpacing: '-0.01em'
                }}
              >
                DRISHTI-AI Android Device Simulator
              </h2>
              <span
                style={{
                  backgroundColor: 'rgba(79, 111, 255, 0.12)',
                  color: 'var(--brand-primary)',
                  border: '1px solid var(--brand-border)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '2px 8px',
                  fontSize: '0.65rem',
                  fontWeight: 600,
                  textTransform: 'uppercase'
                }}
              >
                Native Parity v1.0
              </span>
            </div>
            <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
              Interactive Android hardware & telemetry simulation for field evaluation and jury demonstration.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Direct APK Download Button */}
          <button
            onClick={handleDownloadApk}
            style={{
              backgroundColor: 'var(--brand-primary)',
              color: '#ffffff',
              border: 'none',
              borderRadius: 'var(--radius-btn)',
              padding: '8px 16px',
              fontWeight: 600,
              fontSize: '0.78rem',
              display: 'flex',
              alignItems: 'center',
              gap: 7,
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(79, 111, 255, 0.3)',
              transition: 'background var(--transition-fast)'
            }}
            onMouseOver={(e) => { e.currentTarget.style.backgroundColor = 'var(--brand-hover)'; }}
            onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'var(--brand-primary)'; }}
          >
            <Download size={14} />
            <span>Download APK (28 MB)</span>
          </button>

          {/* Close Simulator */}
          <button
            onClick={onClose}
            title="Close Simulator"
            style={{
              backgroundColor: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-primary)',
              borderRadius: 'var(--radius-sm)',
              width: 34,
              height: 34,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)'
            }}
            onMouseOver={(e) => { 
              e.currentTarget.style.borderColor = 'var(--border-hover)'; 
              e.currentTarget.style.color = 'var(--text-primary)'; 
            }}
            onMouseOut={(e) => { 
              e.currentTarget.style.borderColor = 'var(--border-primary)'; 
              e.currentTarget.style.color = 'var(--text-secondary)'; 
            }}
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Main Simulator Workspace (Phone Frame on Left, Options Dock on Right) */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 32,
          padding: '20px 24px',
          overflowY: 'auto',
          width: '100%',
          boxSizing: 'border-box'
        }}
      >
        {/* 1. Android Smartphone Chassis Frame (Container dimensioned to match scaled bounds exactly) */}
        <div
          style={{
            width: scaledWidth,
            height: scaledHeight,
            position: 'relative',
            flexShrink: 0
          }}
        >
          {/* Scaled Phone Outer Shell */}
          <div
            style={{
              width: unscaledChassisWidth,
              height: unscaledChassisHeight,
              position: 'absolute',
              top: 0,
              left: 0,
              transform: `scale(${zoomScale})`,
              transformOrigin: 'top left',
              transition: 'transform 0.2s cubic-bezier(0.2, 0.8, 0.2, 1)',
              animation: isVibrating ? 'slashHapticShake 0.1s linear infinite' : 'none'
            }}
          >
            <div
              style={{
                width: '100%',
                height: '100%',
                backgroundColor: '#121316',
                borderRadius: isPortrait ? 48 : 34,
                padding: 12,
                boxShadow: '0 24px 72px rgba(0, 0, 0, 0.8), 0 0 0 1.5px #272a33, inset 0 0 0 2px #0a0b0d',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                boxSizing: 'border-box'
              }}
            >
              {/* Volume Rockers on Left Bezel */}
              {isPortrait && (
                <>
                  <div
                    style={{
                      position: 'absolute',
                      left: -4,
                      top: 130,
                      width: 4,
                      height: 48,
                      backgroundColor: '#272a33',
                      borderRadius: '3px 0 0 3px'
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      left: -4,
                      top: 190,
                      width: 4,
                      height: 48,
                      backgroundColor: '#272a33',
                      borderRadius: '3px 0 0 3px'
                    }}
                  />
                  {/* Power Button on Right Bezel */}
                  <div
                    style={{
                      position: 'absolute',
                      right: -4,
                      top: 150,
                      width: 4,
                      height: 38,
                      backgroundColor: 'var(--brand-primary)',
                      borderRadius: '0 3px 3px 0'
                    }}
                  />
                </>
              )}

              {/* Inner Screen Display */}
              <div
                style={{
                  width: phoneWidth,
                  height: phoneHeight,
                  backgroundColor: 'var(--bg-main)',
                  borderRadius: isPortrait ? 38 : 26,
                  overflow: 'hidden',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                {/* Android Status Bar */}
                <div
                  style={{
                    height: 30,
                    backgroundColor: 'rgba(10, 10, 12, 0.96)',
                    padding: '0 18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '0.70rem',
                    fontWeight: 600,
                    color: 'var(--text-secondary)',
                    zIndex: 500,
                    userSelect: 'none',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
                  }}
                >
                  {/* Left: Clock */}
                  <span style={{ fontFamily: 'var(--font-mono)' }}>{currentTime || '15:14'}</span>

                  {/* Center: Camera Punch-Hole */}
                  <div
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      backgroundColor: '#040406',
                      border: '1.5px solid #1a1b20',
                      boxShadow: 'inset 0 0 3px #000'
                    }}
                  />

                  {/* Right: Network, GPS, WiFi, Battery */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {networkMode === 'offline' ? (
                      <span style={{ color: 'var(--risk-critical)', display: 'flex', alignItems: 'center', gap: 2 }}>
                        <WifiOff size={11} />
                        <span style={{ fontSize: '0.60rem' }}>OFFLINE</span>
                      </span>
                    ) : (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 2, color: 'var(--brand-primary)' }}>
                        <Wifi size={11} />
                        <span style={{ fontSize: '0.60rem', fontWeight: 700 }}>{networkMode.toUpperCase()}</span>
                      </span>
                    )}

                    {/* Battery Level */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <span style={{ fontSize: '0.60rem', fontFamily: 'var(--font-mono)' }}>{batteryLevel}%</span>
                      {batteryLevel < 20 ? (
                        <BatteryWarning size={12} color="var(--risk-critical)" />
                      ) : isCharging ? (
                        <BatteryCharging size={12} color="var(--status-live)" />
                      ) : (
                        <Battery size={12} color="var(--brand-primary)" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Simulated Heads-Up Push Notification Banner (Android 14) */}
                {activeNotification && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 34,
                      left: 10,
                      right: 10,
                      zIndex: 600,
                      backgroundColor: 'rgba(18, 19, 23, 0.96)',
                      backdropFilter: 'blur(16px)',
                      border: `1px solid ${
                        activeNotification.severity === 'critical' ? 'var(--risk-critical)' : 'var(--brand-primary)'
                      }`,
                      borderRadius: 'var(--radius-card)',
                      padding: '10px 14px',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
                      animation: 'slashSlideInDown 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 4
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <AlertTriangle
                          size={13}
                          color={activeNotification.severity === 'critical' ? 'var(--risk-critical)' : 'var(--brand-primary)'}
                        />
                        <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase' }}>
                          DRISHTI-AI ALERT
                        </span>
                      </div>
                      <span style={{ fontSize: '0.60rem', color: 'var(--text-muted)' }}>{activeNotification.time}</span>
                    </div>
                    <div style={{ fontSize: '0.74rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {activeNotification.title}
                    </div>
                    <p style={{ margin: 0, fontSize: '0.68rem', color: 'var(--text-secondary)', lineHeight: 1.3 }}>
                      {activeNotification.body}
                    </p>
                  </div>
                )}

                {/* Live Web Application Viewport (Embedded Full-Feature Client) */}
                <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
                  <iframe
                    ref={iframeRef}
                    src="/?mode=mobile"
                    title="DRISHTI-AI Android Live Screen"
                    style={{
                      width: '100%',
                      height: '100%',
                      border: 'none',
                      backgroundColor: 'var(--bg-main)'
                    }}
                  />
                </div>

                {/* Android 14 Gesture Navigation Bar */}
                <div
                  style={{
                    height: 16,
                    backgroundColor: 'rgba(10, 10, 12, 0.96)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 500
                  }}
                >
                  <div
                    style={{
                      width: 72,
                      height: 4,
                      backgroundColor: 'rgba(255, 255, 255, 0.25)',
                      borderRadius: 2
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 2. "Simulate Android Options" Side Control Dock (Height harmonized with the phone display) */}
        <div
          style={{
            width: 440,
            height: isPortrait ? scaledHeight : 560,
            maxHeight: 'calc(100vh - 100px)',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-primary)',
            borderRadius: 'var(--radius-card)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxShadow: 'var(--shadow-elevated)',
            boxSizing: 'border-box'
          }}
        >
          {/* Dock Header with Tabs */}
          <div
            style={{
              padding: '14px 18px 12px',
              borderBottom: '1px solid var(--border-primary)',
              backgroundColor: 'var(--bg-surface-elevated)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Sliders size={16} style={{ color: 'var(--brand-primary)' }} />
                <span style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Simulator Control Dock
                </span>
              </div>
              <span style={{ fontSize: '0.66rem', color: 'var(--brand-primary)', fontWeight: 600 }}>
                Sensor & Radio Injection
              </span>
            </div>

            {/* Symmetrical 3x3 Quick Screen Jump Grid (All 9 Core Views) */}
            <div style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: '0.64rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Quick Screen Jump (9 Views)
                </span>
                <span style={{ fontSize: '0.62rem', color: 'var(--brand-primary)', fontWeight: 600 }}>
                  Sync Mobile Route
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 5 }}>
                {[
                  { id: 'gis', label: 'GIS Command' },
                  { id: 'risk', label: 'Risk Radar' },
                  { id: 'forecast', label: '48H Forecast' },
                  { id: 'incidents', label: 'Incidents' },
                  { id: 'alerts', label: 'Alerts Center' },
                  { id: 'reports', label: 'Field Report' },
                  { id: 'simulation', label: 'Simulation' },
                  { id: 'evacuation', label: '🚨 Evac Guide', isSpecial: true },
                  { id: 'profile', label: 'Profile Hub' }
                ].map(s => (
                  <button
                    key={s.id}
                    onClick={() => navigateSimulatedApp(s.id)}
                    style={{
                      padding: '5px 4px',
                      backgroundColor: s.isSpecial ? 'rgba(239, 68, 68, 0.12)' : 'var(--bg-surface-secondary)',
                      border: s.isSpecial ? '1px solid rgba(239, 68, 68, 0.35)' : '1px solid var(--border-primary)',
                      borderRadius: 'var(--radius-sm)',
                      color: s.isSpecial ? '#f87171' : 'var(--text-secondary)',
                      fontSize: '0.66rem',
                      fontWeight: s.isSpecial ? 600 : 500,
                      cursor: 'pointer',
                      textAlign: 'center',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      transition: 'all var(--transition-fast)'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.color = 'var(--brand-primary)';
                      e.currentTarget.style.borderColor = 'var(--brand-border)';
                      e.currentTarget.style.backgroundColor = 'var(--brand-tint)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.color = 'var(--text-secondary)';
                      e.currentTarget.style.borderColor = 'var(--border-primary)';
                      e.currentTarget.style.backgroundColor = 'var(--bg-surface-secondary)';
                    }}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Option Sub-Tabs */}
            <div style={{ display: 'flex', gap: 4 }}>
              {[
                { id: 'gps', label: 'GPS Telemetry', icon: MapPin },
                { id: 'network', label: 'Network', icon: Radio },
                { id: 'push', label: 'Broadcasts', icon: Bell },
                { id: 'camera', label: 'Camera', icon: Camera },
                { id: 'device', label: 'Hardware', icon: Smartphone }
              ].map(tab => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    style={{
                      flex: 1,
                      padding: '6px 4px',
                      backgroundColor: isActive ? 'var(--brand-tint)' : 'transparent',
                      color: isActive ? 'var(--brand-primary)' : 'var(--text-secondary)',
                      border: isActive ? '1px solid var(--brand-border)' : '1px solid transparent',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.68rem',
                      fontWeight: isActive ? 600 : 500,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 4,
                      transition: 'all var(--transition-fast)'
                    }}
                  >
                    <Icon size={12} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Option Settings Body */}
          <div style={{ padding: 18, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 14, flex: 1 }}>
            
            {/* TAB 1: GPS TELEMETRY SIMULATION */}
            {activeTab === 'gps' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>
                    Simulate GPS Location in East Khasi Hills
                  </div>
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', margin: 0 }}>
                    Select a high-risk hazard zone to inject real-time coordinates into the field reporting engine:
                  </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {GPS_PRESETS.map(p => {
                    const isSelected = selectedGps.id === p.id;
                    const isCritical = p.risk === 'Critical';
                    return (
                      <div
                        key={p.id}
                        onClick={() => handleSelectGps(p)}
                        style={{
                          padding: '10px 14px',
                          backgroundColor: isSelected ? 'var(--brand-tint)' : 'var(--bg-surface-elevated)',
                          border: `1px solid ${isSelected ? 'var(--brand-primary)' : 'var(--border-primary)'}`,
                          borderRadius: 'var(--radius-input)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          transition: 'all var(--transition-fast)'
                        }}
                      >
                        <div>
                          <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                            {p.name}
                          </div>
                          <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                            {p.lat.toFixed(4)}° N, {p.lon.toFixed(4)}° E • Alt: {p.alt}m
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span
                            style={{
                              fontSize: '0.64rem',
                              padding: '2px 8px',
                              borderRadius: 'var(--radius-sm)',
                              backgroundColor: isCritical ? 'var(--risk-critical-bg)' : 'var(--risk-high-bg)',
                              color: isCritical ? 'var(--risk-critical)' : 'var(--risk-high)',
                              border: `1px solid ${isCritical ? 'var(--risk-critical-border)' : 'var(--risk-high-border)'}`,
                              fontWeight: 600
                            }}
                          >
                            {p.risk}
                          </span>
                          {isSelected && <CheckCircle2 size={15} style={{ color: 'var(--brand-primary)' }} />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 2: NETWORK & SIGNAL SIMULATION */}
            {activeTab === 'network' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>
                    Simulate Wireless Telemetry & Offline Mesh
                  </div>
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', margin: 0 }}>
                    Switch connection profiles to test zero-signal offline queueing and background sync:
                  </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 8 }}>
                  <button
                    onClick={() => handleNetworkChange('5g')}
                    style={{
                      padding: '12px 14px',
                      backgroundColor: networkMode === '5g' ? 'var(--brand-tint)' : 'var(--bg-surface-elevated)',
                      border: `1px solid ${networkMode === '5g' ? 'var(--brand-primary)' : 'var(--border-primary)'}`,
                      borderRadius: 'var(--radius-input)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all var(--transition-fast)'
                    }}
                  >
                    <Wifi size={18} style={{ color: 'var(--brand-primary)' }} />
                    <div>
                      <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        5G Ultra-Wideband (Full Live Connectivity)
                      </div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>
                        Live map telemetry streaming, IMD radar feeds & instant uploads.
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleNetworkChange('3g')}
                    style={{
                      padding: '12px 14px',
                      backgroundColor: networkMode === '3g' ? 'var(--brand-tint)' : 'var(--bg-surface-elevated)',
                      border: `1px solid ${networkMode === '3g' ? 'var(--brand-primary)' : 'var(--border-primary)'}`,
                      borderRadius: 'var(--radius-input)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all var(--transition-fast)'
                    }}
                  >
                    <Radio size={18} style={{ color: 'var(--brand-primary)' }} />
                    <div>
                      <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        3G Mountain Intermittent Mesh
                      </div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>
                        High packet latency, low bandwidth mountain pass fallback.
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleNetworkChange('offline')}
                    style={{
                      padding: '12px 14px',
                      backgroundColor: networkMode === 'offline' ? 'var(--risk-critical-bg)' : 'var(--bg-surface-elevated)',
                      border: `1px solid ${networkMode === 'offline' ? 'var(--risk-critical)' : 'var(--border-primary)'}`,
                      borderRadius: 'var(--radius-input)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all var(--transition-fast)'
                    }}
                  >
                    <WifiOff size={18} style={{ color: 'var(--risk-critical)' }} />
                    <div>
                      <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--risk-critical)' }}>
                        Airplane Mode / Zero Signal (Offline Queue)
                      </div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>
                        Dispatches offline state. Reports save locally to IndexedDB until signal is restored.
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* TAB 3: PUSH BROADCASTS SIMULATION */}
            {activeTab === 'push' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>
                    Simulate Android Push Broadcasts & Haptics
                  </div>
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', margin: 0 }}>
                    Trigger real-time OASIS CAP v1.2 heads-up notifications with vibration alarms:
                  </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <button
                    onClick={() => triggerPushNotification('critical')}
                    style={{
                      padding: '10px 14px',
                      backgroundColor: 'var(--risk-critical-bg)',
                      border: '1px solid var(--risk-critical-border)',
                      borderRadius: 'var(--radius-input)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <AlertTriangle size={15} style={{ color: 'var(--risk-critical)' }} />
                      <span style={{ fontSize: '0.76rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        Simulate RED Alert (Cloudburst Evacuation)
                      </span>
                    </div>
                    <Bell size={13} style={{ color: 'var(--risk-critical)' }} />
                  </button>

                  <button
                    onClick={() => triggerPushNotification('warning')}
                    style={{
                      padding: '10px 14px',
                      backgroundColor: 'var(--risk-high-bg)',
                      border: '1px solid var(--risk-high-border)',
                      borderRadius: 'var(--radius-input)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <AlertTriangle size={15} style={{ color: 'var(--risk-high)' }} />
                      <span style={{ fontSize: '0.76rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        Simulate AMBER Warning (Highway Debris)
                      </span>
                    </div>
                    <Bell size={13} style={{ color: 'var(--risk-high)' }} />
                  </button>

                  <button
                    onClick={() => triggerPushNotification('clear')}
                    style={{
                      padding: '10px 14px',
                      backgroundColor: 'var(--risk-safe-bg)',
                      border: '1px solid var(--risk-safe-border)',
                      borderRadius: 'var(--radius-input)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <CheckCircle2 size={15} style={{ color: 'var(--risk-safe)' }} />
                      <span style={{ fontSize: '0.76rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        Simulate Safe All-Clear Notice
                      </span>
                    </div>
                    <Bell size={13} style={{ color: 'var(--risk-safe)' }} />
                  </button>

                  <button
                    onClick={triggerVibration}
                    style={{
                      padding: '9px 14px',
                      backgroundColor: 'var(--bg-surface-elevated)',
                      border: '1px solid var(--border-primary)',
                      borderRadius: 'var(--radius-input)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      cursor: 'pointer',
                      color: 'var(--text-primary)',
                      fontSize: '0.74rem',
                      fontWeight: 500,
                      marginTop: 2
                    }}
                  >
                    <Vibrate size={14} style={{ color: 'var(--brand-primary)' }} />
                    <span>Test Physical Android Vibration Feedback</span>
                  </button>
                </div>
              </div>
            )}

            {/* TAB 4: CAMERA HARDWARE SIMULATION */}
            {activeTab === 'camera' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>
                    Simulate Android Hardware Camera Capture
                  </div>
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', margin: 0 }}>
                    Inject simulated geological landslide photos directly into the citizen report photo uploader:
                  </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {CAMERA_PRESETS.map(c => (
                    <div
                      key={c.id}
                      onClick={() => {
                        window.dispatchEvent(new CustomEvent('drishti-simulated-photo', { detail: c }));
                        if (iframeRef.current?.contentWindow) {
                          try {
                            iframeRef.current.contentWindow.postMessage({
                              type: 'DRISHTI_SIMULATOR_PHOTO',
                              payload: c
                            }, '*');
                          } catch (e) {}
                        }
                        showToast(`Simulated Photo Injected: ${c.label}`, 'success');
                      }}
                      style={{
                        padding: '10px 14px',
                        backgroundColor: 'var(--bg-surface-elevated)',
                        border: '1px solid var(--border-primary)',
                        borderRadius: 'var(--radius-input)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        transition: 'all var(--transition-fast)'
                      }}
                      onMouseOver={(e) => { e.currentTarget.style.borderColor = 'var(--brand-border)'; }}
                      onMouseOut={(e) => { e.currentTarget.style.borderColor = 'var(--border-primary)'; }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Camera size={15} style={{ color: 'var(--brand-primary)' }} />
                        <span style={{ fontSize: '0.76rem', color: 'var(--text-primary)', fontWeight: 500 }}>
                          {c.label}
                        </span>
                      </div>
                      <span style={{ fontSize: '0.68rem', color: 'var(--brand-primary)', fontWeight: 600 }}>
                        Inject Photo &rarr;
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 5: HARDWARE & DISPLAY SETTINGS */}
            {activeTab === 'device' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>
                    Device Frame, Power & Orientation
                  </div>
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', margin: 0 }}>
                    Control physical Android screen dimensions and battery telemetry:
                  </p>
                </div>

                {/* Orientation Toggle */}
                <button
                  onClick={() => setOrientation(isPortrait ? 'landscape' : 'portrait')}
                  style={{
                    padding: '10px 14px',
                    backgroundColor: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-primary)',
                    borderRadius: 'var(--radius-input)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    color: 'var(--text-primary)',
                    fontSize: '0.74rem',
                    fontWeight: 500,
                    cursor: 'pointer'
                  }}
                >
                  <RotateCw size={14} style={{ color: 'var(--brand-primary)' }} />
                  <span>Orientation: {isPortrait ? 'Portrait (380×760)' : 'Landscape (760×380)'}</span>
                </button>

                {/* Battery Slider */}
                <div style={{ backgroundColor: 'var(--bg-surface-elevated)', padding: '12px 14px', borderRadius: 'var(--radius-input)', border: '1px solid var(--border-primary)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: '0.74rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Simulate Battery Level</span>
                    <span style={{ color: 'var(--brand-primary)', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>{batteryLevel}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={batteryLevel}
                    onChange={(e) => setBatteryLevel(Number(e.target.value))}
                    style={{ width: '100%', accentColor: 'var(--brand-primary)' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.64rem', color: 'var(--text-muted)', marginTop: 4 }}>
                    <span>10% (Saver)</span>
                    <span>50%</span>
                    <span>100% Full</span>
                  </div>
                </div>

                {/* Zoom Scale */}
                <div style={{ backgroundColor: 'var(--bg-surface-elevated)', padding: '12px 14px', borderRadius: 'var(--radius-input)', border: '1px solid var(--border-primary)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: '0.74rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Display Frame Scale</span>
                    <span style={{ color: 'var(--brand-primary)', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>{Math.round(zoomScale * 100)}%</span>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {[0.78, 0.86, 0.94].map(s => (
                      <button
                        key={s}
                        onClick={() => setZoomScale(s)}
                        style={{
                          flex: 1,
                          padding: '6px 0',
                          backgroundColor: zoomScale === s ? 'var(--brand-primary)' : 'var(--bg-surface-secondary)',
                          color: zoomScale === s ? '#ffffff' : 'var(--text-secondary)',
                          border: `1px solid ${zoomScale === s ? 'var(--brand-primary)' : 'var(--border-secondary)'}`,
                          borderRadius: 'var(--radius-btn)',
                          fontSize: '0.72rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          transition: 'all var(--transition-fast)'
                        }}
                      >
                        {Math.round(s * 100)}%
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Dock Footer: Direct Download Link */}
          <div
            style={{
              padding: '12px 18px',
              borderTop: '1px solid var(--border-primary)',
              backgroundColor: 'var(--bg-surface-elevated)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div>
              <div style={{ fontSize: '0.74rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                Official Android Package
              </div>
              <div style={{ fontSize: '0.64rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                ai.drishti.landslide • 27.97 MB (28 MB) • API 26-34
              </div>
            </div>
            <button
              onClick={handleDownloadApk}
              style={{
                backgroundColor: 'var(--brand-primary)',
                color: '#ffffff',
                border: 'none',
                borderRadius: 'var(--radius-btn)',
                padding: '6px 14px',
                fontSize: '0.72rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(79, 111, 255, 0.25)',
                transition: 'background var(--transition-fast)'
              }}
              onMouseOver={(e) => { e.currentTarget.style.backgroundColor = 'var(--brand-hover)'; }}
              onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'var(--brand-primary)'; }}
            >
              <Download size={12} />
              <span>Download APK</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

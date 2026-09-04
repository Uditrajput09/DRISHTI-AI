import React, { useState, useEffect } from 'react';
import { 
  Camera, 
  Video, 
  MapPin, 
  Send, 
  CheckCircle2, 
  Wifi, 
  WifiOff, 
  UploadCloud, 
  RefreshCw, 
  ShieldAlert 
} from 'lucide-react';
import { api } from '../api';

export default function FieldReportForm({ onReportSubmitted }) {
  const [incidentType, setIncidentType] = useState('Landslide');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState('High');
  const [photoPreview, setPhotoPreview] = useState(null);
  const [videoName, setVideoName] = useState('');
  const [coords, setCoords] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const [reporterName, setReporterName] = useState('Field Officer (Meghalaya)');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [queueCount, setQueueCount] = useState(api.getOfflineQueue().length);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Auto-sync when reconnecting
      handleSyncQueue();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleSyncQueue = async () => {
    const q = api.getOfflineQueue();
    if (q.length > 0) {
      try {
        await api.syncOfflineQueue();
        setQueueCount(0);
        setStatusMessage('Offline queue automatically synchronized with central command!');
        if (onReportSubmitted) onReportSubmitted();
        setTimeout(() => setStatusMessage(''), 4000);
      } catch (e) {
        console.warn('Sync failed:', e);
      }
    }
  };

  const incidentTypes = [
    'Landslide',
    'Rockfall',
    'Flooding',
    'Road Blockage',
    'Slope Failure',
    'Other'
  ];

  // Auto-detect GPS location
  const handleDetectLocation = () => {
    if (!navigator.geolocation) return alert('Geolocation not supported by device.');
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({
          lat: Number(pos.coords.latitude.toFixed(5)),
          lon: Number(pos.coords.longitude.toFixed(5))
        });
        setIsLocating(false);
      },
      () => {
        // Fallback default East Khasi Hills coordinates
        setCoords({ lat: 25.4200, lon: 91.8000 });
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Photo capture / upload
  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setPhotoPreview(ev.target.result);
      reader.readAsDataURL(file);
    }
  };

  // Video capture / upload
  const handleVideoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setVideoName(file.name);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatusMessage('');

    const payload = {
      hazard_type: incidentType,
      incident_type: incidentType,
      severity,
      description,
      reporter_name: reporterName,
      latitude: coords ? coords.lat : 25.4200,
      longitude: coords ? coords.lon : 91.8000,
      photo_data_url: photoPreview,
      video_url: videoName,
      created_at: new Date().toISOString()
    };

    try {
      const res = await api.submitReport(payload);
      setQueueCount(api.getOfflineQueue().length);
      if (res.status === 'queued_offline') {
        setStatusMessage('⚠️ Saved to offline storage queue. Auto-sync will trigger on network reconnect.');
      } else {
        setStatusMessage('✅ Report transmitted directly to SDMA Emergency Center!');
      }

      // Reset form
      setDescription('');
      setPhotoPreview(null);
      setVideoName('');

      if (onReportSubmitted) onReportSubmitted();
    } catch (err) {
      setStatusMessage('⚠️ Transmission error. Report stored safely in local offline cache.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        background: '#101521',
        border: '1px solid rgba(120, 140, 180, 0.25)',
        borderRadius: 14,
        padding: 24,
        maxWidth: 640,
        margin: '0 auto',
        boxShadow: '0 12px 36px rgba(0, 0, 0, 0.55)',
        display: 'flex',
        flexDirection: 'column',
        gap: 18
      }}
    >
      {/* Title & Connectivity Status */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(120, 140, 180, 0.18)', paddingBottom: 14 }}>
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#FFFFFF', fontFamily: 'Space Grotesk, sans-serif' }}>
            FIELD INCIDENT DISPATCH
          </h2>
          <div style={{ fontSize: '0.74rem', color: '#9AA5B8', marginTop: 2 }}>
            Instant geo-tagged incident logging for first responders & field teams
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.72rem', fontWeight: 700 }}>
          {isOnline ? (
            <span style={{ color: '#39D98A', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Wifi size={13} /> ONLINE
            </span>
          ) : (
            <span style={{ color: '#FF9D3D', display: 'flex', alignItems: 'center', gap: 4 }}>
              <WifiOff size={13} /> OFFLINE MODE
            </span>
          )}
          {queueCount > 0 && (
            <span style={{ background: '#FF9D3D', color: '#070A10', borderRadius: 10, padding: '1px 6px', fontSize: '0.68rem', fontWeight: 800 }}>
              {queueCount} Queued
            </span>
          )}
        </div>
      </div>

      {statusMessage && (
        <div
          style={{
            background: statusMessage.includes('✅') ? 'rgba(57, 217, 138, 0.12)' : 'rgba(255, 157, 61, 0.12)',
            border: `1px solid ${statusMessage.includes('✅') ? 'rgba(57, 217, 138, 0.4)' : 'rgba(255, 157, 61, 0.4)'}`,
            color: statusMessage.includes('✅') ? '#39D98A' : '#FF9D3D',
            padding: '10px 14px',
            borderRadius: 8,
            fontSize: '0.78rem',
            fontWeight: 600
          }}
        >
          {statusMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* 1. Incident Category Selector */}
        <div>
          <label style={{ display: 'block', fontSize: '0.74rem', color: '#9AA5B8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
            Select Incident Category
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            {incidentTypes.map(t => {
              const isSelected = incidentType === t;
              return (
                <button
                  type="button"
                  key={t}
                  onClick={() => setIncidentType(t)}
                  style={{
                    background: isSelected ? 'rgba(53, 216, 255, 0.18)' : '#151B29',
                    border: `1px solid ${isSelected ? '#35D8FF' : 'rgba(120, 140, 180, 0.2)'}`,
                    color: isSelected ? '#35D8FF' : '#F4F6FB',
                    borderRadius: 8,
                    padding: '10px 8px',
                    fontSize: '0.76rem',
                    fontWeight: 700,
                    fontFamily: 'Space Grotesk, sans-serif',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {t}
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Severity Level Selector */}
        <div>
          <label style={{ display: 'block', fontSize: '0.74rem', color: '#9AA5B8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
            Hazard Severity
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            {[
              { id: 'Critical', label: 'Critical', color: '#FF3B6B' },
              { id: 'High', label: 'High', color: '#FF9D3D' },
              { id: 'Medium', label: 'Medium', color: '#FFD84D' }
            ].map(s => (
              <button
                type="button"
                key={s.id}
                onClick={() => setSeverity(s.id)}
                style={{
                  background: severity === s.id ? `${s.color}25` : '#151B29',
                  border: `1px solid ${severity === s.id ? s.color : 'rgba(120, 140, 180, 0.2)'}`,
                  color: severity === s.id ? s.color : '#9AA5B8',
                  borderRadius: 8,
                  padding: '8px 0',
                  fontSize: '0.74rem',
                  fontWeight: 800,
                  fontFamily: 'Space Grotesk, sans-serif',
                  cursor: 'pointer'
                }}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* 3. GPS Detection */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <label style={{ fontSize: '0.74rem', color: '#9AA5B8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              GPS Location
            </label>
            <button
              type="button"
              onClick={handleDetectLocation}
              disabled={isLocating}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#35D8FF',
                fontSize: '0.74rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4
              }}
            >
              <MapPin size={13} />
              <span>{isLocating ? 'Detecting GPS...' : coords ? 'Update GPS' : 'Auto-Detect Location'}</span>
            </button>
          </div>

          <div
            style={{
              background: '#151B29',
              border: '1px solid rgba(120, 140, 180, 0.2)',
              borderRadius: 8,
              padding: '10px 14px',
              fontSize: '0.8rem',
              color: coords ? '#39D98A' : '#5C677D',
              fontFamily: 'JetBrains Mono, monospace'
            }}
          >
            {coords ? `📍 ${coords.lat}, ${coords.lon} (East Khasi Hills)` : 'No GPS coordinates locked yet. Click Auto-Detect.'}
          </div>
        </div>

        {/* 4. Photo & Video Upload */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {/* Photo */}
          <div>
            <label
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                background: '#151B29',
                border: '1px dashed rgba(120, 140, 180, 0.35)',
                borderRadius: 8,
                padding: '14px 10px',
                cursor: 'pointer'
              }}
            >
              <Camera size={20} color="#35D8FF" />
              <span style={{ fontSize: '0.74rem', color: '#F4F6FB', fontWeight: 600 }}>Capture Photo</span>
              <input type="file" accept="image/*" capture="environment" onChange={handlePhotoUpload} style={{ display: 'none' }} />
            </label>
            {photoPreview && (
              <img src={photoPreview} alt="Preview" style={{ width: '100%', height: 75, objectFit: 'cover', borderRadius: 6, marginTop: 6 }} />
            )}
          </div>

          {/* Video */}
          <div>
            <label
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                background: '#151B29',
                border: '1px dashed rgba(120, 140, 180, 0.35)',
                borderRadius: 8,
                padding: '14px 10px',
                cursor: 'pointer'
              }}
            >
              <Video size={20} color="#FF4DB8" />
              <span style={{ fontSize: '0.74rem', color: '#F4F6FB', fontWeight: 600 }}>Capture Video</span>
              <input type="file" accept="video/*" capture="environment" onChange={handleVideoUpload} style={{ display: 'none' }} />
            </label>
            {videoName && (
              <div style={{ fontSize: '0.68rem', color: '#9AA5B8', marginTop: 6, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                🎥 {videoName}
              </div>
            )}
          </div>
        </div>

        {/* 5. Description */}
        <div>
          <label style={{ display: 'block', fontSize: '0.74rem', color: '#9AA5B8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
            Incident Description & Road Observations
          </label>
          <textarea
            required
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Specify affected road, debris volume, blockage extent, or immediate hazard..."
            className="command-input"
            style={{ resize: 'vertical' }}
          />
        </div>

        {/* Primary CTA: + REPORT INCIDENT */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary-cyan"
          style={{ width: '100%', padding: '13px 0', fontSize: '0.9rem', letterSpacing: '0.04em' }}
        >
          <Send size={16} />
          <span>{isSubmitting ? 'TRANSMITTING REPORT...' : '+ REPORT INCIDENT'}</span>
        </button>
      </form>
    </div>
  );
}

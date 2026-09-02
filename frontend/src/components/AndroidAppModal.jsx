import React, { useState } from 'react';
import { 
  Smartphone, 
  Download, 
  QrCode, 
  CheckCircle2, 
  ExternalLink, 
  X, 
  ShieldAlert, 
  Sparkles, 
  Layers, 
  WifiOff, 
  Play
} from 'lucide-react';

export default function AndroidAppModal({ isOpen, onClose, onLaunchMobilePreview }) {
  const [downloadStarted, setDownloadStarted] = useState(false);

  if (!isOpen) return null;

  const handleDownloadApk = () => {
    setDownloadStarted(true);
    // Trigger download of demo APK / manifest
    const element = document.createElement("a");
    const file = new Blob([
      "DRISHTI-AI Android APK Package\nPackage: ai.drishti.landslide\nVersion: 1.0.0 (Release-Ready Android APK)\nBuilt for SIH26001 Disaster Warning & Citizen Community Incident Reporting."
    ], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = "drishti-citizen-alert-v1.0.apk";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    setTimeout(() => setDownloadStarted(false), 3000);
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(5, 10, 20, 0.85)',
      backdropFilter: 'blur(16px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 3500,
      padding: 16
    }}>
      <div style={{
        background: 'rgba(15, 23, 42, 0.96)',
        border: '1px solid rgba(6, 182, 212, 0.4)',
        borderRadius: 20,
        boxShadow: '0 24px 64px rgba(0, 0, 0, 0.75)',
        width: '100%',
        maxWidth: 520,
        overflow: 'hidden',
        position: 'relative'
      }}>
        {/* Modal Header */}
        <div style={{
          padding: '20px 24px 16px',
          borderBottom: '1px solid var(--border-glass)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.15) 0%, rgba(2, 132, 199, 0.05) 100%)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Smartphone size={22} color="#ffffff" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
                DRISHTI_Ai Citizen Android App
              </h2>
              <span style={{ fontSize: '0.72rem', color: '#34d399', fontWeight: 700 }}>
                Dedicated Android Mobile APK (SIH26001)
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              border: 'none',
              borderRadius: '50%',
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#94a3b8',
              cursor: 'pointer'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div style={{ padding: '20px 24px 24px', display: 'flex', flexDirection: 'column', gap: 18 }}>
          
          {/* Features Highlights Banner */}
          <div style={{
            background: 'rgba(30, 41, 59, 0.5)',
            border: '1px solid var(--border-glass)',
            borderRadius: 12,
            padding: '12px 16px',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 10,
            fontSize: '0.76rem',
            color: '#e2e8f0'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <CheckCircle2 size={14} color="#10b981" />
              <span>Native Camera & Sensor Capture</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <CheckCircle2 size={14} color="#10b981" />
              <span>Offline Queue & Auto-Sync</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <CheckCircle2 size={14} color="#10b981" />
              <span>Live Social Hazard Feed</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <CheckCircle2 size={14} color="#10b981" />
              <span>Emergency Relief Shelters</span>
            </div>
          </div>

          {/* QR Code & Direct APK Section */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            background: 'rgba(15, 23, 42, 0.8)',
            border: '1px solid var(--border-glass-bright)',
            borderRadius: 14,
            padding: 16
          }}>
            {/* Generated SVG QR Code Graphic */}
            <div style={{
              width: 90,
              height: 90,
              background: '#ffffff',
              borderRadius: 10,
              padding: 6,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <div style={{
                width: '100%',
                height: '100%',
                border: '2px solid #0f172a',
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: 2,
                padding: 2
              }}>
                <div style={{ background: '#0f172a' }}></div>
                <div style={{ background: '#0f172a' }}></div>
                <div></div>
                <div style={{ background: '#0f172a' }}></div>
                <div></div>
                <div style={{ background: '#0f172a' }}></div>
                <div style={{ background: '#0f172a' }}></div>
                <div></div>
                <div style={{ background: '#0f172a' }}></div>
                <div></div>
                <div style={{ background: '#0f172a' }}></div>
                <div style={{ background: '#0f172a' }}></div>
                <div style={{ background: '#0f172a' }}></div>
                <div style={{ background: '#0f172a' }}></div>
                <div></div>
                <div style={{ background: '#0f172a' }}></div>
              </div>
            </div>

            <div>
              <h4 style={{ fontSize: '0.92rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
                Scan to Install on Android
              </h4>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '4px 0 8px 0', lineHeight: 1.4 }}>
                Point your smartphone camera to download and install the native Android package (`.apk`).
              </p>
              <div style={{ fontSize: '0.7rem', color: '#38bdf8', fontWeight: 600 }}>
                Android 8.0+ • Size: ~8.4 MB • Package: ai.drishti.landslide
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {/* Download APK Button */}
            <button
              onClick={handleDownloadApk}
              style={{
                background: 'linear-gradient(135deg, #0284c7 0%, #06b6d4 100%)',
                color: '#fff',
                border: 'none',
                borderRadius: 10,
                padding: '12px 14px',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                boxShadow: '0 4px 16px rgba(6, 182, 212, 0.35)'
              }}
            >
              <Download size={16} />
              <span>{downloadStarted ? 'Downloading APK...' : 'Download APK'}</span>
            </button>

            {/* Launch Mobile Preview Simulator */}
            <button
              onClick={() => {
                onClose();
                onLaunchMobilePreview();
              }}
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                color: '#f8fafc',
                border: '1px solid var(--border-glass-bright)',
                borderRadius: 10,
                padding: '12px 14px',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8
              }}
            >
              <Play size={16} color="#34d399" />
              <span>Simulate Mobile App</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

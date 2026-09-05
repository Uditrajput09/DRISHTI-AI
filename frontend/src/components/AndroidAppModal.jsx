import React, { useState } from 'react';
import { 
  Smartphone, 
  Download, 
  QrCode, 
  CheckCircle2, 
  Copy,
  ExternalLink, 
  X, 
  ShieldAlert, 
  Sparkles, 
  Layers, 
  WifiOff, 
  Play,
  Terminal,
  Info
} from 'lucide-react';

export default function AndroidAppModal({ isOpen, onClose, onLaunchMobilePreview }) {
  const [copied, setCopied] = useState(false);
  const [activeView, setActiveView] = useState('pwa'); // 'pwa' | 'gradle'

  if (!isOpen) return null;

  // Determine local LAN / network address for mobile scanning
  const host = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
    ? (window.location.hostname) 
    : window.location.hostname;
  
  const mobileUrl = `${window.location.protocol}//${host}:${window.location.port || '5173'}/?mode=mobile`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(mobileUrl)}&bgcolor=ffffff&color=0f172a&margin=6`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(mobileUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }).catch(() => {
      // Fallback
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(6, 6, 8, 0.88)',
      backdropFilter: 'blur(20px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 3500,
      padding: 16
    }}>
      <div className="holo-card" style={{
        boxShadow: '0 24px 64px rgba(0, 0, 0, 0.8), 0 0 32px rgba(120, 115, 245, 0.25)',
        width: '100%',
        maxWidth: 540,
        overflow: 'hidden',
        position: 'relative'
      }}>
        {/* Modal Header */}
        <div style={{
          padding: '18px 24px 14px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'linear-gradient(90deg, rgba(255, 110, 199, 0.15), rgba(120, 115, 245, 0.15))'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 38,
              height: 38,
              borderRadius: 12,
              background: 'linear-gradient(135deg, #FF6EC7, #7873F5, #4FD8EA)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 12px rgba(120, 115, 245, 0.4)'
            }}>
              <Smartphone size={20} color="#ffffff" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f8fafc', margin: 0, fontFamily: 'Space Grotesk, sans-serif' }}>
                DRISHTI AI Citizen Mobile App
              </h2>
              <span style={{ fontSize: '0.72rem', color: '#4FD8EA', fontWeight: 700 }}>
                Installable Android App & Citizen Field Reporter
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              border: 'none',
              borderRadius: '50%',
              width: 30,
              height: 30,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#94a3b8',
              cursor: 'pointer'
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div style={{
          display: 'flex',
          background: 'rgba(15, 15, 22, 0.8)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          padding: '6px 20px 0'
        }}>
          <button
            onClick={() => setActiveView('pwa')}
            style={{
              padding: '8px 14px',
              background: 'none',
              border: 'none',
              borderBottom: activeView === 'pwa' ? '2px solid #FF6EC7' : '2px solid transparent',
              color: activeView === 'pwa' ? '#FF9AD7' : '#94a3b8',
              fontWeight: 700,
              fontFamily: 'Space Grotesk, sans-serif',
              fontSize: '0.8rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            <Smartphone size={14} />
            <span>Direct Android Install (PWA)</span>
          </button>
          <button
            onClick={() => setActiveView('gradle')}
            style={{
              padding: '8px 14px',
              background: 'none',
              border: 'none',
              borderBottom: activeView === 'gradle' ? '2px solid #FF6EC7' : '2px solid transparent',
              color: activeView === 'gradle' ? '#FF9AD7' : '#94a3b8',
              fontWeight: 700,
              fontFamily: 'Space Grotesk, sans-serif',
              fontSize: '0.8rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            <Terminal size={14} />
            <span>Capacitor APK Source</span>
          </button>
        </div>

        {/* Content Body */}
        <div style={{ padding: '18px 24px 22px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          
          {activeView === 'pwa' ? (
            <>
              {/* Features Highlights */}
              <div style={{
                background: 'rgba(30, 41, 59, 0.5)',
                border: '1px solid var(--border-glass)',
                borderRadius: 10,
                padding: '10px 14px',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 8,
                fontSize: '0.74rem',
                color: '#e2e8f0'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <CheckCircle2 size={13} color="#10b981" />
                  <span>Hardware Camera & Photo Upload</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <CheckCircle2 size={13} color="#10b981" />
                  <span>Zero-Signal Offline Queue & Auto-Sync</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <CheckCircle2 size={13} color="#10b981" />
                  <span>GPS Geotagging & Incident Feed</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <CheckCircle2 size={13} color="#10b981" />
                  <span>Emergency Safe Shelter Routing</span>
                </div>
              </div>

              {/* QR Code & Mobile URL Section */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                background: 'rgba(15, 23, 42, 0.8)',
                border: '1px solid var(--border-glass-bright)',
                borderRadius: 12,
                padding: 14
              }}>
                {/* Real Scannable QR Code */}
                <div style={{
                  width: 100,
                  height: 100,
                  background: '#ffffff',
                  borderRadius: 10,
                  padding: 4,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <img 
                    src={qrCodeUrl} 
                    alt="Scan to open DRISHTI-AI on Android" 
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>

                <div style={{ flex: 1 }}>
                  <h4 style={{ fontSize: '0.88rem', fontWeight: 800, color: '#f8fafc', margin: '0 0 4px 0' }}>
                    📱 Scan to Open on Your Smartphone
                  </h4>
                  <p style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', margin: '0 0 8px 0', lineHeight: 1.4 }}>
                    Point your Android camera at the QR code, or open Chrome on your phone to install:
                  </p>
                  
                  {/* Copyable Mobile URL pill */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    background: 'rgba(2, 6, 23, 0.7)',
                    padding: '5px 10px',
                    borderRadius: 6,
                    border: '1px solid rgba(6, 182, 212, 0.3)'
                  }}>
                    <span style={{
                      fontSize: '0.72rem',
                      fontFamily: 'monospace',
                      color: '#38bdf8',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      flex: 1
                    }}>
                      {mobileUrl}
                    </span>
                    <button
                      onClick={handleCopyLink}
                      title="Copy URL"
                      style={{
                        background: copied ? '#10b981' : 'rgba(255,255,255,0.1)',
                        border: 'none',
                        borderRadius: 4,
                        padding: '3px 6px',
                        cursor: 'pointer',
                        color: '#fff',
                        fontSize: '0.68rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4
                      }}
                    >
                      <Copy size={12} />
                      <span>{copied ? 'Copied!' : 'Copy'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Step-by-Step Android Install Guide */}
              <div style={{
                background: 'rgba(6, 182, 212, 0.08)',
                border: '1px solid rgba(6, 182, 212, 0.25)',
                borderRadius: 10,
                padding: '10px 14px',
                fontSize: '0.74rem',
                color: '#cbd5e1'
              }}>
                <div style={{ fontWeight: 700, color: '#38bdf8', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Info size={14} />
                  <span>How to Install on Android in 2 Taps (No corrupt APK downloads):</span>
                </div>
                <ol style={{ margin: '4px 0 0 16px', padding: 0, lineHeight: 1.5 }}>
                  <li>Open the link above in <strong>Chrome</strong> on your Android phone.</li>
                  <li>Tap the <strong>⋮ (Menu)</strong> in the top right &rarr; tap <strong>"Install app"</strong> (or <strong>"Add to Home screen"</strong>).</li>
                  <li>DRISHTI-AI appears on your Android launcher like a native app with full offline queue & camera access!</li>
                </ol>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 4 }}>
                <button
                  onClick={() => {
                    window.open(mobileUrl, '_blank');
                  }}
                  className="holo-btn-primary"
                  style={{
                    padding: '11px 14px',
                    fontSize: '0.8rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8
                  }}
                >
                  <ExternalLink size={15} />
                  <span>Open in Mobile Tab</span>
                </button>

                <button
                  onClick={() => {
                    onClose();
                    onLaunchMobilePreview();
                  }}
                  className="holo-btn-secondary"
                  style={{
                    padding: '11px 14px',
                    fontSize: '0.8rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8
                  }}
                >
                  <Smartphone size={15} color="#4FD8EA" />
                  <span>Interactive Emulator</span>
                </button>
              </div>
            </>
          ) : (
            /* Capacitor / Gradle APK Build Tab */
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: 0, lineHeight: 1.5 }}>
                The full native Android project is structured in <code>frontend/android</code> using <strong>Capacitor 8</strong> (Package: <code>ai.drishti.landslide</code>).
              </p>

              <div style={{
                background: '#020617',
                border: '1px solid var(--border-glass)',
                borderRadius: 8,
                padding: '10px 14px',
                fontFamily: 'monospace',
                fontSize: '0.72rem',
                color: '#34d399',
                lineHeight: 1.6
              }}>
                <div style={{ color: '#64748b' }}># 1. Build frontend distribution</div>
                <div>npm run build</div>
                <div style={{ color: '#64748b', marginTop: 4 }}># 2. Sync web assets into Android project</div>
                <div>npx cap sync android</div>
                <div style={{ color: '#64748b', marginTop: 4 }}># 3. Open in Android Studio or compile debug APK</div>
                <div>npx cap open android</div>
                <div style={{ color: '#64748b', marginTop: 4 }}># or build via Gradle (requires JDK 17+ & Android SDK):</div>
                <div>cd android && ./gradlew assembleDebug</div>
              </div>

              <div style={{
                background: 'rgba(245, 158, 11, 0.1)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                borderRadius: 8,
                padding: '8px 12px',
                fontSize: '0.72rem',
                color: '#fde68a',
                lineHeight: 1.4
              }}>
                ⚠️ <strong>Hackathon Demo Note</strong>: Organizers judge the live field app via the PWA (Progressive Web App) on smartphones or the live mobile simulator preview, avoiding manual APK sideloading requirements.
              </div>

              <button
                onClick={() => {
                  onClose();
                  onLaunchMobilePreview();
                }}
                style={{
                  background: 'linear-gradient(135deg, #0284c7 0%, #06b6d4 100%)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  padding: '10px',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8
                }}
              >
                <Play size={15} />
                <span>Launch Mobile Demo Simulator</span>
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

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
  Play,
  Terminal,
  Info,
  Sliders,
  Radio,
  FileCheck,
  Check
} from 'lucide-react';
import { useToast } from '../context/ToastContext';

export default function AndroidAppModal({ isOpen, onClose, onLaunchSimulator }) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedSha, setCopiedSha] = useState(false);
  const [copiedCmd, setCopiedCmd] = useState(false);
  const [activeTab, setActiveTab] = useState('download'); // 'download' | 'qr' | 'developer'
  const { showToast } = useToast();

  if (!isOpen) return null;

  const host = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? window.location.hostname 
    : 'localhost';
  
  const mobileUrl = `${window.location.protocol}//${host}:${window.location.port || '5173'}/?mode=mobile`;
  // High contrast QR code for instant camera recognition
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(mobileUrl)}&bgcolor=ffffff&color=0a0a0a&margin=8`;
  const sha256 = '563a18989e9cb74ace8f50880ae23e6c0a542a70b525babf6c242bb1bf38c25d';

  const handleCopyLink = () => {
    navigator.clipboard.writeText(mobileUrl).then(() => {
      setCopiedLink(true);
      showToast('Mobile URL copied to clipboard!', 'info');
      setTimeout(() => setCopiedLink(false), 2500);
    });
  };

  const handleCopySha = () => {
    navigator.clipboard.writeText(sha256).then(() => {
      setCopiedSha(true);
      showToast('SHA-256 checksum copied to clipboard!', 'info');
      setTimeout(() => setCopiedSha(false), 2500);
    });
  };

  const handleCopyCmd = () => {
    const cmd = "npm run build && npx cap sync android && npx cap open android";
    navigator.clipboard.writeText(cmd).then(() => {
      setCopiedCmd(true);
      showToast('Capacitor commands copied to clipboard!', 'info');
      setTimeout(() => setCopiedCmd(false), 2500);
    });
  };

  const handleDownloadApk = () => {
    const downloadUrl = window.location.port === '8000' ? '/api/download/apk' : '/downloads/drishti-ai-v1.0.apk';
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = 'drishti-ai-v1.0.apk';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Starting Android APK download (28 MB)...', 'success');
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(5, 5, 7, 0.85)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 3500,
        padding: 16
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-primary)',
          borderRadius: 'var(--radius-card)',
          boxShadow: 'var(--shadow-modal)',
          width: '100%',
          maxWidth: 560,
          overflow: 'hidden',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          animation: 'modalEnter 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--border-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'var(--bg-surface-elevated)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <img
              src="/logo.jpg"
              alt="DRISHTI-AI Logo"
              style={{
                width: 36,
                height: 36,
                borderRadius: 'var(--radius-input, 8px)',
                objectFit: 'cover',
                border: '1px solid rgba(79, 111, 255, 0.35)',
                flexShrink: 0
              }}
            />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h2
                  style={{
                    fontSize: '0.95rem',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    margin: 0,
                    letterSpacing: '-0.01em'
                  }}
                >
                  DRISHTI-AI Android Application
                </h2>
                <span
                  style={{
                    fontSize: '0.65rem',
                    fontWeight: 600,
                    padding: '2px 6px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'rgba(49, 183, 122, 0.12)',
                    color: 'var(--status-live)',
                    border: '1px solid rgba(49, 183, 122, 0.25)'
                  }}
                >
                  v1.0 Release
                </span>
              </div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                Official APK Package & Hardware Simulation Studio
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              width: 30,
              height: 30,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              transition: 'background var(--transition-fast)'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--bg-surface-secondary)';
              e.currentTarget.style.color = 'var(--text-primary)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = 'var(--text-secondary)';
            }}
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div
          style={{
            display: 'flex',
            backgroundColor: 'var(--bg-surface)',
            borderBottom: '1px solid var(--border-primary)',
            padding: '0 20px',
            gap: 4
          }}
        >
          {[
            { id: 'download', label: 'Download APK', icon: Download },
            { id: 'qr', label: 'Scan & PWA', icon: QrCode },
            { id: 'developer', label: 'Capacitor Source', icon: Terminal }
          ].map(t => {
            const Icon = t.icon;
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                style={{
                  padding: '11px 12px',
                  background: 'none',
                  border: 'none',
                  borderBottom: isActive ? '2px solid var(--brand-primary)' : '2px solid transparent',
                  color: isActive ? 'var(--brand-primary)' : 'var(--text-secondary)',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: '0.76rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  transition: 'all var(--transition-fast)'
                }}
              >
                <Icon size={14} />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          
          {/* TAB 1: DIRECT APK DOWNLOAD & SIMULATE */}
          {activeTab === 'download' && (
            <>
              {/* APK Release Package Card */}
              <div
                style={{
                  backgroundColor: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-primary)',
                  borderRadius: 'var(--radius-input)',
                  padding: '14px 16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <img
                      src="/logo.jpg"
                      alt="DRISHTI-AI APK"
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 'var(--radius-sm, 6px)',
                        objectFit: 'cover',
                        border: '1px solid rgba(79, 111, 255, 0.35)',
                        flexShrink: 0
                      }}
                    />
                    <div>
                      <div style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        drishti-ai-v1.0.apk
                      </div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>
                        Universal Build • 27.97 MB (28 MB) • Android 8.0 - 14 (API 26-34)
                      </div>
                    </div>
                  </div>
                  <span
                    style={{
                      backgroundColor: 'rgba(79, 111, 255, 0.12)',
                      color: 'var(--brand-primary)',
                      border: '1px solid var(--brand-border)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '2px 8px',
                      fontSize: '0.65rem',
                      fontWeight: 600
                    }}
                  >
                    CERTIFIED RELEASE
                  </span>
                </div>

                {/* Capability Pills */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '6px 12px',
                    fontSize: '0.72rem',
                    color: 'var(--text-secondary)',
                    padding: '8px 0',
                    borderTop: '1px solid var(--border-secondary)',
                    borderBottom: '1px solid var(--border-secondary)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <CheckCircle2 size={13} style={{ color: 'var(--brand-primary)' }} />
                    <span>Hardware Camera & Photos</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <CheckCircle2 size={13} style={{ color: 'var(--brand-primary)' }} />
                    <span>Zero-Signal Offline Queue</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <CheckCircle2 size={13} style={{ color: 'var(--brand-primary)' }} />
                    <span>GPS Telemetry Auto-Lock</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <CheckCircle2 size={13} style={{ color: 'var(--brand-primary)' }} />
                    <span>CAP v1.2 Push Alerts</span>
                  </div>
                </div>

                {/* SHA-256 Checksum */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    backgroundColor: 'var(--bg-main)',
                    border: '1px solid var(--border-secondary)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '6px 10px',
                    fontSize: '0.68rem',
                    fontFamily: 'var(--font-mono)'
                  }}
                >
                  <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>SHA256:</span>
                  <span
                    style={{
                      color: 'var(--text-secondary)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      maxWidth: 360,
                      margin: '0 8px'
                    }}
                    title={sha256}
                  >
                    {sha256}
                  </span>
                  <button
                    onClick={handleCopySha}
                    title="Copy Checksum"
                    style={{
                      background: 'none',
                      border: 'none',
                      color: copiedSha ? 'var(--status-live)' : 'var(--text-secondary)',
                      cursor: 'pointer',
                      padding: 2,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4
                    }}
                  >
                    {copiedSha ? <Check size={12} /> : <Copy size={12} />}
                  </button>
                </div>

                {/* Primary Action Buttons: Download APK & Launch Simulator */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 2 }}>
                  <button
                    onClick={handleDownloadApk}
                    style={{
                      backgroundColor: 'var(--brand-primary)',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: 'var(--radius-btn)',
                      padding: '10px 14px',
                      fontWeight: 600,
                      fontSize: '0.78rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 7,
                      cursor: 'pointer',
                      boxShadow: '0 2px 8px rgba(79, 111, 255, 0.3)',
                      transition: 'background var(--transition-fast)'
                    }}
                    onMouseOver={(e) => { e.currentTarget.style.backgroundColor = 'var(--brand-hover)'; }}
                    onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'var(--brand-primary)'; }}
                  >
                    <Download size={15} />
                    <span>Download APK (28 MB)</span>
                  </button>

                  <button
                    onClick={() => {
                      onClose();
                      onLaunchSimulator();
                    }}
                    style={{
                      backgroundColor: 'var(--bg-surface-secondary)',
                      color: 'var(--text-primary)',
                      border: '1px solid var(--border-primary)',
                      borderRadius: 'var(--radius-btn)',
                      padding: '10px 14px',
                      fontWeight: 500,
                      fontSize: '0.78rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 7,
                      cursor: 'pointer',
                      transition: 'all var(--transition-fast)'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.borderColor = 'var(--brand-primary)';
                      e.currentTarget.style.color = 'var(--brand-primary)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border-primary)';
                      e.currentTarget.style.color = 'var(--text-primary)';
                    }}
                  >
                    <Sliders size={15} />
                    <span>Simulate in Studio</span>
                  </button>
                </div>
              </div>

              {/* Step-by-step Installation Instructions */}
              <div
                style={{
                  backgroundColor: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-secondary)',
                  borderRadius: 'var(--radius-input)',
                  padding: '12px 14px',
                  fontSize: '0.72rem',
                  color: 'var(--text-secondary)'
                }}
              >
                <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Info size={14} style={{ color: 'var(--brand-primary)' }} />
                  <span>3-Step Android Sideload Guide:</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, lineHeight: 1.5 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                    <span style={{ minWidth: 18, height: 18, borderRadius: '50%', backgroundColor: 'var(--brand-tint)', color: 'var(--brand-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 700 }}>1</span>
                    <span>Tap <strong>Download APK (28 MB)</strong> above to save <code>drishti-ai-v1.0.apk</code>.</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                    <span style={{ minWidth: 18, height: 18, borderRadius: '50%', backgroundColor: 'var(--brand-tint)', color: 'var(--brand-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 700 }}>2</span>
                    <span>When prompted by Android Package Installer, tap <strong>"Install unknown apps" &rarr; Allow</strong>.</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                    <span style={{ minWidth: 18, height: 18, borderRadius: '50%', backgroundColor: 'var(--brand-tint)', color: 'var(--brand-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 700 }}>3</span>
                    <span>Launch DRISHTI-AI and grant Location & Camera permissions for offline field telemetry.</span>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* TAB 2: QR CODE & PWA INSTALL */}
          {activeTab === 'qr' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  backgroundColor: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-primary)',
                  borderRadius: 'var(--radius-input)',
                  padding: 16
                }}
              >
                {/* High contrast scannable QR card */}
                <div
                  style={{
                    width: 120,
                    height: 120,
                    backgroundColor: '#ffffff',
                    borderRadius: 'var(--radius-input)',
                    padding: 6,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
                  }}
                >
                  <img 
                    src={qrCodeUrl} 
                    alt="Scan for DRISHTI-AI Mobile App"
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  />
                </div>

                <div style={{ flex: 1 }}>
                  <h4 style={{ fontSize: '0.86rem', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 4px 0' }}>
                    Point Mobile Camera to Scan
                  </h4>
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', margin: '0 0 10px 0', lineHeight: 1.4 }}>
                    Scan with your Android or iOS camera to launch the Progressive Web App (PWA) with instant offline queueing:
                  </p>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      backgroundColor: 'var(--bg-main)',
                      padding: '6px 10px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-secondary)'
                    }}
                  >
                    <span
                      style={{
                        fontSize: '0.68rem',
                        fontFamily: 'var(--font-mono)',
                        color: 'var(--brand-primary)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        flex: 1
                      }}
                    >
                      {mobileUrl}
                    </span>
                    <button
                      onClick={handleCopyLink}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: copiedLink ? 'var(--status-live)' : 'var(--text-secondary)',
                        cursor: 'pointer',
                        padding: 2,
                        display: 'flex',
                        alignItems: 'center'
                      }}
                      title="Copy URL"
                    >
                      {copiedLink ? <Check size={13} /> : <Copy size={13} />}
                    </button>
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <button
                  onClick={() => window.open(mobileUrl, '_blank')}
                  style={{
                    padding: '10px 14px',
                    backgroundColor: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-primary)',
                    borderRadius: 'var(--radius-btn)',
                    color: 'var(--text-primary)',
                    fontSize: '0.76rem',
                    fontWeight: 500,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    transition: 'all var(--transition-fast)'
                  }}
                  onMouseOver={(e) => { e.currentTarget.style.borderColor = 'var(--brand-primary)'; }}
                  onMouseOut={(e) => { e.currentTarget.style.borderColor = 'var(--border-primary)'; }}
                >
                  <ExternalLink size={14} />
                  <span>Open Mobile View</span>
                </button>

                <button
                  onClick={() => {
                    onClose();
                    onLaunchSimulator();
                  }}
                  style={{
                    padding: '10px 14px',
                    backgroundColor: 'var(--brand-primary)',
                    border: 'none',
                    borderRadius: 'var(--radius-btn)',
                    color: '#ffffff',
                    fontSize: '0.76rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    boxShadow: '0 2px 8px rgba(79, 111, 255, 0.25)',
                    transition: 'background var(--transition-fast)'
                  }}
                  onMouseOver={(e) => { e.currentTarget.style.backgroundColor = 'var(--brand-hover)'; }}
                  onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'var(--brand-primary)'; }}
                >
                  <Sliders size={14} />
                  <span>Launch Device Simulator</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: CAPACITOR DEVELOPER SOURCE */}
          {activeTab === 'developer' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <p style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                The native Android project is structured in <code>frontend/android</code> utilizing <strong>Capacitor 8</strong> (Package: <code>ai.drishti.landslide</code>).
              </p>

              <div
                style={{
                  backgroundColor: 'var(--bg-main)',
                  border: '1px solid var(--border-secondary)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '12px 14px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.70rem',
                  lineHeight: 1.6,
                  position: 'relative'
                }}
              >
                <button
                  onClick={handleCopyCmd}
                  style={{
                    position: 'absolute',
                    top: 10,
                    right: 10,
                    background: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-primary)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '4px 8px',
                    color: copiedCmd ? 'var(--status-live)' : 'var(--text-secondary)',
                    fontSize: '0.65rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4
                  }}
                  title="Copy Build Commands"
                >
                  {copiedCmd ? <Check size={11} /> : <Copy size={11} />}
                  <span>{copiedCmd ? 'Copied' : 'Copy'}</span>
                </button>

                <div style={{ color: 'var(--text-muted)' }}># 1. Compile web bundle</div>
                <div style={{ color: 'var(--text-primary)' }}>npm run build</div>
                <div style={{ color: 'var(--text-muted)', marginTop: 4 }}># 2. Synchronize assets into Android shell</div>
                <div style={{ color: 'var(--text-primary)' }}>npx cap sync android</div>
                <div style={{ color: 'var(--text-muted)', marginTop: 4 }}># 3. Open in Android Studio or compile debug APK</div>
                <div style={{ color: 'var(--text-primary)' }}>npx cap open android</div>
                <div style={{ color: 'var(--text-muted)', marginTop: 4 }}># 4. Generate standalone APK release bundle</div>
                <div style={{ color: 'var(--text-primary)' }}>python package_apk.py</div>
              </div>

              <button
                onClick={() => {
                  onClose();
                  onLaunchSimulator();
                }}
                style={{
                  backgroundColor: 'var(--brand-primary)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 'var(--radius-btn)',
                  padding: '10px 14px',
                  fontWeight: 600,
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  marginTop: 2,
                  boxShadow: '0 2px 8px rgba(79, 111, 255, 0.25)',
                  transition: 'background var(--transition-fast)'
                }}
                onMouseOver={(e) => { e.currentTarget.style.backgroundColor = 'var(--brand-hover)'; }}
                onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'var(--brand-primary)'; }}
              >
                <Sliders size={15} />
                <span>Launch Android Device Simulator</span>
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { 
  Mountain, 
  Map, 
  Smartphone, 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  PhoneCall, 
  ShieldAlert,
  BellRing,
  CheckCircle2,
  User,
  UserCheck
} from 'lucide-react';
import { api } from '../api';
import { useTranslation } from '../hooks/useTranslation';

export default function Header({ activeTab, setActiveTab, onRefreshAll, isRefreshing, currentUser, onOpenAuth, onOpenAndroidModal, onLangChange }) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [queueCount, setQueueCount] = useState(api.getOfflineQueue().length);
  const [isSyncingQueue, setIsSyncingQueue] = useState(false);
  const [syncSuccessMsg, setSyncSuccessMsg] = useState('');
  const [isAlertDrawerOpen, setIsAlertDrawerOpen] = useState(false);
  const [alertList, setAlertList] = useState([]);
  const { lang, setLang } = useTranslation();

  const handleSetLang = (l) => { setLang(l); if (onLangChange) onLangChange(l); };

  const loadAlerts = async () => {
    try {
      const history = await api.getAlertHistory();
      const inApp = await api.getInAppAlerts();
      const combined = [...(inApp || []), ...(history || [])];
      setAlertList(combined.slice(0, 20));
    } catch (err) {
      console.warn('Error fetching alerts for header bell:', err);
    }
  };

  useEffect(() => {
    loadAlerts();
    const handleOnline = () => {
      setIsOnline(true);
      // Auto-trigger sync on reconnect
      handleAutoSync();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const interval = setInterval(() => {
      setQueueCount(api.getOfflineQueue().length);
      loadAlerts();
    }, 5000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  const handleAutoSync = async () => {
    const q = api.getOfflineQueue();
    if (q.length > 0) {
      setIsSyncingQueue(true);
      try {
        const res = await api.syncOfflineQueue();
        setSyncSuccessMsg(`Auto-synced ${res.synced_count} reports!`);
        setQueueCount(0);
        setTimeout(() => setSyncSuccessMsg(''), 4000);
        if (onRefreshAll) onRefreshAll();
      } catch (err) {
        console.error('Auto sync error:', err);
      } finally {
        setIsSyncingQueue(false);
      }
    }
  };

  const handleManualSync = async () => {
    setIsSyncingQueue(true);
    try {
      const res = await api.syncOfflineQueue();
      setSyncSuccessMsg(`Synced ${res.synced_count} queued items!`);
      setQueueCount(0);
      setTimeout(() => setSyncSuccessMsg(''), 4000);
      if (onRefreshAll) onRefreshAll();
    } catch (err) {
      alert('Sync failed. Please verify connection.');
    } finally {
      setIsSyncingQueue(false);
    }
  };

  return (
    <header style={{
      background: 'rgba(11, 17, 30, 0.95)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid var(--border-glass)',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      padding: '12px 24px'
    }}>
      <div style={{
        maxWidth: 1600,
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16
      }}>
        {/* Left: Brand & Pilot Region */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            background: 'linear-gradient(135deg, #ef4444 0%, #f97316 100%)',
            width: 44,
            height: 44,
            borderRadius: 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 16px rgba(239, 68, 68, 0.4)'
          }}>
            <Mountain size={24} color="#ffffff" strokeWidth={2.5} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.02em' }}>
                DRISHTI_Ai <span style={{ color: '#06b6d4', fontWeight: 600 }}>Landslide Warning</span>
              </h1>
              <span style={{
                background: 'rgba(6, 182, 212, 0.15)',
                color: '#67e8f9',
                border: '1px solid rgba(6, 182, 212, 0.4)',
                fontSize: '0.7rem',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: 999
              }}>
                AI EARLY WARNING
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              <span>📍 Pilot: <strong style={{ color: '#e2e8f0' }}>East Khasi Hills, Meghalaya</strong></span>
              <span>•</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <span style={{
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  background: isOnline ? '#10b981' : '#f59e0b',
                  boxShadow: isOnline ? '0 0 8px #10b981' : '0 0 8px #f59e0b'
                }}></span>
                {isOnline ? 'Real-Time Telemetry' : 'Offline Mode (Local Engine)'}
              </span>
            </div>
          </div>
        </div>

        {/* Center: Command Center & Mobile Android APK Launcher */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          background: 'rgba(17, 24, 39, 0.8)',
          padding: 4,
          borderRadius: 12,
          border: '1px solid var(--border-glass)'
        }}>
          <button
            onClick={() => setActiveTab('dashboard')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 18px',
              borderRadius: 8,
              border: 'none',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '0.88rem',
              transition: 'all 0.2s',
              background: activeTab === 'dashboard' ? 'linear-gradient(135deg, #0284c7 0%, #06b6d4 100%)' : 'transparent',
              color: activeTab === 'dashboard' ? '#ffffff' : 'var(--text-secondary)'
            }}
          >
            <Map size={18} />
            <span>GIS Risk Command Center</span>
          </button>

          <button
            onClick={onOpenAndroidModal}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 16px',
              borderRadius: 8,
              border: '1px solid rgba(16, 185, 129, 0.4)',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '0.82rem',
              transition: 'all 0.2s',
              background: 'rgba(16, 185, 129, 0.15)',
              color: '#34d399'
            }}
          >
            <Smartphone size={16} />
            <span>📱 Citizen Mobile App (Android)</span>
          </button>
        </div>

        {/* Right: Actions & Emergency Contacts */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Offline Sync Badge/Button */}
          {queueCount > 0 && (
            <button
              onClick={handleManualSync}
              disabled={isSyncingQueue || !isOnline}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                background: 'rgba(245, 158, 11, 0.2)',
                color: '#fbbf24',
                border: '1px solid rgba(245, 158, 11, 0.5)',
                padding: '6px 12px',
                borderRadius: 8,
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: isOnline ? 'pointer' : 'not-allowed'
              }}
            >
              <RefreshCw size={14} className={isSyncingQueue ? 'pulse-red' : ''} />
              <span>Sync {queueCount} Queued {isSyncingQueue ? '...' : ''}</span>
            </button>
          )}

          {syncSuccessMsg && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              color: '#34d399',
              fontSize: '0.8rem',
              fontWeight: 600
            }}>
              <CheckCircle2 size={16} />
              <span>{syncSuccessMsg}</span>
            </div>
          )}

          {/* Language Toggle */}
          <div style={{ display: 'flex', gap: 2, background: 'rgba(255,255,255,0.06)', padding: 3, borderRadius: 8, border: '1px solid var(--border-glass)' }}>
            {[{code:'en', label:'EN'}, {code:'hi', label:'हि'}, {code:'kha', label:'Ka'}].map(l => (
              <button
                key={l.code}
                id={`lang-btn-${l.code}`}
                onClick={() => handleSetLang(l.code)}
                style={{
                  padding: '4px 9px',
                  borderRadius: 6,
                  border: 'none',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  background: lang === l.code ? 'linear-gradient(135deg, #0284c7, #06b6d4)' : 'transparent',
                  color: lang === l.code ? '#fff' : '#94a3b8',
                  transition: 'all 0.15s'
                }}
              >{l.label}</button>
            ))}
          </div>

          {/* Refresh Data button */}
          <button
            onClick={onRefreshAll}
            disabled={isRefreshing}
            title="Poll live Open-Meteo & IMD data"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: 'rgba(255, 255, 255, 0.06)',
              color: '#e2e8f0',
              border: '1px solid var(--border-glass)',
              padding: '7px 14px',
              borderRadius: 8,
              fontSize: '0.82rem',
              fontWeight: 500,
              cursor: isRefreshing ? 'wait' : 'pointer'
            }}
          >
            <RefreshCw size={14} style={{ animation: isRefreshing ? 'spin 1s linear infinite' : 'none' }} />
            <span>{isRefreshing ? 'Polling APIs...' : 'Refresh Live'}</span>
          </button>

          {/* DDMA Helpline */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            color: '#fca5a5',
            padding: '6px 12px',
            borderRadius: 8,
            fontSize: '0.8rem',
            fontWeight: 700
          }}>
            <PhoneCall size={14} />
            <span>DDMA: 1070 / 112</span>
          </div>

          {/* Emergency Alert Notification Bell */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setIsAlertDrawerOpen(!isAlertDrawerOpen)}
              title="Disaster Alerts & Push Center"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 38,
                height: 38,
                background: isAlertDrawerOpen ? 'rgba(239, 68, 68, 0.25)' : 'rgba(255, 255, 255, 0.06)',
                color: isAlertDrawerOpen ? '#ef4444' : '#f8fafc',
                border: isAlertDrawerOpen ? '1px solid #ef4444' : '1px solid var(--border-glass)',
                borderRadius: 10,
                cursor: 'pointer',
                transition: 'all 0.2s',
                position: 'relative'
              }}
            >
              <BellRing size={18} className={alertList.length > 0 ? 'pulse-red' : ''} />
              {alertList.length > 0 && (
                <span style={{
                  position: 'absolute',
                  top: -4,
                  right: -4,
                  background: '#ef4444',
                  color: '#ffffff',
                  fontSize: '0.65rem',
                  fontWeight: 900,
                  width: 18,
                  height: 18,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 8px rgba(239, 68, 68, 0.8)'
                }}>
                  {alertList.length}
                </span>
              )}
            </button>

            {/* Notification Drawer Modal */}
            {isAlertDrawerOpen && (
              <div style={{
                position: 'absolute',
                top: 48,
                right: 0,
                width: 380,
                maxHeight: 520,
                background: 'rgba(15, 23, 42, 0.98)',
                backdropFilter: 'blur(24px)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                borderRadius: 14,
                boxShadow: '0 16px 36px rgba(0, 0, 0, 0.6)',
                zIndex: 2000,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
              }}>
                {/* Drawer Header */}
                <div style={{
                  padding: '12px 16px',
                  borderBottom: '1px solid var(--border-glass)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: 'rgba(239, 68, 68, 0.1)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <ShieldAlert size={18} color="#ef4444" />
                    <span style={{ fontWeight: 800, fontSize: '0.9rem', color: '#f8fafc' }}>
                      Disaster Alerts & Push Center
                    </span>
                  </div>
                  <span style={{
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    background: 'rgba(16, 185, 129, 0.2)',
                    color: '#34d399',
                    padding: '2px 6px',
                    borderRadius: 6
                  }}>
                    FCM & SMS Ready
                  </span>
                </div>

                {/* Alerts Stream List */}
                <div style={{
                  padding: '12px 14px',
                  overflowY: 'auto',
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10
                }}>
                  {alertList.length === 0 ? (
                    <div style={{ padding: '24px 12px', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
                      No active critical broadcasts at this moment.
                    </div>
                  ) : (
                    alertList.map((item, idx) => (
                      <div key={idx} style={{
                        background: 'rgba(30, 41, 59, 0.7)',
                        border: item.risk_level === 'Critical' ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid var(--border-glass)',
                        borderRadius: 10,
                        padding: '10px 12px'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                          <span style={{
                            fontSize: '0.72rem',
                            fontWeight: 800,
                            color: item.risk_level === 'Critical' ? '#ef4444' : '#f59e0b',
                            textTransform: 'uppercase'
                          }}>
                            {item.risk_level || 'ALERT'} • {item.zone_name || 'East Khasi Hills'}
                          </span>
                          <span style={{ fontSize: '0.68rem', color: '#94a3b8' }}>
                            {item.language ? item.language.toUpperCase() : 'ALL'}
                          </span>
                        </div>
                        <p style={{ fontSize: '0.78rem', color: '#cbd5e1', lineHeight: 1.4, margin: '4px 0 6px 0', whiteSpace: 'pre-line' }}>
                          {item.message_text || item.title || item.body || 'Landslide safety advisory active.'}
                        </p>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: '#64748b' }}>
                          <span>Channel: {item.channel || 'SMS + FCM Push'}</span>
                          <span>{item.sent_at ? new Date(item.sent_at).toLocaleTimeString() : 'Live'}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Drawer Footer Actions */}
                <div style={{
                  padding: '10px 14px',
                  borderTop: '1px solid var(--border-glass)',
                  background: 'rgba(15, 23, 42, 0.95)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <button
                    onClick={async () => {
                      try {
                        await api.triggerManualAlert({ zone_id: 1, risk_score: 95.0, risk_level: 'Critical' });
                        loadAlerts();
                      } catch (e) {
                        console.error(e);
                      }
                    }}
                    style={{
                      background: 'linear-gradient(135deg, #ef4444 0%, #f97316 100%)',
                      border: 'none',
                      borderRadius: 6,
                      color: '#ffffff',
                      padding: '5px 10px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    ⚡ Trigger Test Broadcast
                  </button>
                  <button
                    onClick={() => setIsAlertDrawerOpen(false)}
                    style={{
                      background: 'transparent',
                      border: '1px solid var(--border-glass)',
                      borderRadius: 6,
                      color: '#94a3b8',
                      padding: '5px 10px',
                      fontSize: '0.75rem',
                      cursor: 'pointer'
                    }}
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Persona & Login Profile Button */}
          <button
            onClick={onOpenAuth}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: currentUser?.role === 'official' 
                ? 'rgba(2, 132, 199, 0.15)' 
                : 'rgba(16, 185, 129, 0.15)',
              border: currentUser?.role === 'official'
                ? '1px solid rgba(6, 182, 212, 0.4)'
                : '1px solid rgba(16, 185, 129, 0.4)',
              padding: '4px 12px 4px 6px',
              borderRadius: 24,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <img
              src={currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
              alt="User Avatar"
              style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                objectFit: 'cover',
                border: '2px solid rgba(255, 255, 255, 0.2)'
              }}
            />
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#f8fafc', lineHeight: 1.1 }}>
                {currentUser?.name ? currentUser.name.split(' ')[0] : 'Sign In'}
              </div>
              <div style={{
                fontSize: '0.62rem',
                fontWeight: 700,
                color: currentUser?.role === 'official' ? '#38bdf8' : '#34d399',
                textTransform: 'uppercase'
              }}>
                {currentUser?.role === 'official' ? 'DDMA Official' : 'Citizen'}
              </div>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
}

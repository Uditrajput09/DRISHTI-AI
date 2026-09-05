import React, { useState } from 'react';
import {
  User,
  Bell,
  Globe,
  Sliders,
  Database,
  Shield,
  Info,
  Edit3,
  LogOut,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { authService } from '../services/authService';

export default function ProfileView({ currentUser, setCurrentUser, onNavigate }) {
  const [activeNav, setActiveNav] = useState('notifications');

  // Settings Toggles matching Screen 7
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [pushAlerts, setPushAlerts] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(false);
  const [soundAlerts, setSoundAlerts] = useState(true);
  const [vibration, setVibration] = useState(true);

  // Preferences
  const [language, setLanguage] = useState('English');
  const [theme, setTheme] = useState('Dark');
  const [units, setUnits] = useState('Metric (°C, mm)');

  // Data Sync
  const [autoSyncWifi, setAutoSyncWifi] = useState(true);
  const [autoSyncMobile, setAutoSyncMobile] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const menuItems = [
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'language', label: 'Language', icon: Globe },
    { id: 'alerts', label: 'Alert Preferences', icon: Sliders },
    { id: 'units', label: 'Units & Display', icon: Sliders },
    { id: 'sync', label: 'Data Sync', icon: Database },
    { id: 'privacy', label: 'Privacy & Security', icon: Shield },
    { id: 'about', label: 'About DRISHTI AI', icon: Info }
  ];

  const handleSyncNow = () => {
    setIsSyncing(true);
    setTimeout(() => setIsSyncing(false), 1200);
  };

  return (
    <div
      style={{
        maxWidth: 1680,
        margin: '0 auto',
        padding: '16px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: 16
      }}
    >
      {/* 1. TOP COMMUNITY RESPONDER CARD matching Screen 7 */}
      <div
        className="command-panel"
        style={{
          padding: '18px 22px',
          display: 'flex',
          flexDirection: 'column',
          gap: 16
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {/* Avatar */}
            <div
              style={{
                width: 68,
                height: 68,
                borderRadius: '50%',
                overflow: 'hidden',
                border: '2px solid #35D8FF',
                boxShadow: '0 0 14px rgba(53, 216, 255, 0.4)',
                flexShrink: 0
              }}
            >
              <img
                src={currentUser?.avatar || '/images/avatars/responder-avatar.jpg'}
                alt={currentUser?.name || 'User Profile'}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>

            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#FFFFFF', fontFamily: 'Space Grotesk, sans-serif', margin: 0 }}>
                {currentUser?.name || 'Community Responder'}
              </h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.74rem', color: '#35D8FF', fontWeight: 700, margin: '3px 0' }}>
                <span>{currentUser?.role || 'Citizen Scientist'}</span>
                <span style={{ color: '#5C677D' }}>•</span>
                <span style={{ color: '#9AA5B8' }}>{currentUser?.district || 'East Khasi Hills'}</span>
              </div>
              <p style={{ fontSize: '0.76rem', color: '#CBD5E1', margin: 0 }}>
                {currentUser?.bio || 'Active early-warning volunteer in Sohra & Pynursla sector.'}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <button
              className="btn-surface"
              style={{ padding: '7px 14px', fontSize: '0.76rem', display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <Edit3 size={13} color="#35D8FF" />
              <span>Edit Profile</span>
            </button>

            <button
              onClick={() => onNavigate && onNavigate('login')}
              className="btn-surface"
              style={{
                padding: '7px 14px',
                fontSize: '0.76rem',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                color: '#35D8FF',
                borderColor: 'rgba(53, 216, 255, 0.35)'
              }}
            >
              <User size={13} color="#35D8FF" />
              <span>Switch User</span>
            </button>

            <button
              onClick={() => {
                authService.logout();
                if (setCurrentUser) setCurrentUser(null);
                if (onNavigate) onNavigate('login');
              }}
              className="btn-surface"
              style={{
                padding: '7px 14px',
                fontSize: '0.76rem',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                color: '#FF3B6B',
                borderColor: 'rgba(255, 59, 107, 0.35)'
              }}
            >
              <LogOut size={13} color="#FF3B6B" />
              <span>Log Out</span>
            </button>
          </div>
        </div>

        {/* Stat Counters: 14 Reports Submitted | 8 Alerts Monitored | 6 Settings */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 12,
            borderTop: '1px solid rgba(120, 140, 180, 0.15)',
            paddingTop: 14
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.55rem', fontWeight: 900, color: '#FFFFFF', fontFamily: 'Space Grotesk, sans-serif', lineHeight: 1 }}>
              {currentUser?.stats?.reportsSubmitted ?? 14}
            </div>
            <span style={{ fontSize: '0.7rem', color: '#9AA5B8', fontWeight: 600 }}>
              Reports Submitted
            </span>
          </div>

          <div style={{ textAlign: 'center', borderLeft: '1px solid rgba(120, 140, 180, 0.15)', borderRight: '1px solid rgba(120, 140, 180, 0.15)' }}>
            <div style={{ fontSize: '1.55rem', fontWeight: 900, color: '#FFFFFF', fontFamily: 'Space Grotesk, sans-serif', lineHeight: 1 }}>
              {currentUser?.stats?.alertsFollowed ?? 8}
            </div>
            <span style={{ fontSize: '0.7rem', color: '#9AA5B8', fontWeight: 600 }}>
              Alerts Monitored
            </span>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.55rem', fontWeight: 900, color: '#8B6CFF', fontFamily: 'Space Grotesk, sans-serif', lineHeight: 1 }}>
              {currentUser?.stats?.postsCount ?? 6}
            </div>
            <span style={{ fontSize: '0.7rem', color: '#8B6CFF', fontWeight: 700 }}>
              Field Posts
            </span>
          </div>
        </div>
      </div>

      {/* 2. BOTTOM SETTINGS GRID: Left Menu | Right 3-Column Settings */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '220px minmax(0, 1fr)',
          gap: 16,
          alignItems: 'start'
        }}
        className="simulation-xai-grid"
      >
        {/* Left Menu Sidebar matching Screen 7 */}
        <div className="command-panel" style={{ padding: 10, display: 'flex', flexDirection: 'column', gap: 4 }}>
          {menuItems.map(item => {
            const isActive = activeNav === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveNav(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '9px 12px',
                  borderRadius: 6,
                  border: `1px solid ${isActive ? '#8B6CFF' : 'transparent'}`,
                  background: isActive ? 'rgba(139, 108, 255, 0.15)' : 'transparent',
                  color: isActive ? '#FFFFFF' : '#9AA5B8',
                  fontSize: '0.78rem',
                  fontWeight: isActive ? 800 : 500,
                  fontFamily: 'Space Grotesk, sans-serif',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <Icon size={15} color={isActive ? '#8B6CFF' : '#5C677D'} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right Area: 3-Column Settings Grid matching Screen 7 */}
        <div
          className="command-panel"
          style={{
            padding: '18px 22px',
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 20
          }}
        >
          {/* Column 1: NOTIFICATIONS */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#9AA5B8', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'Space Grotesk, sans-serif' }}>
              NOTIFICATIONS
            </span>

            <div>
              <span style={{ fontSize: '0.68rem', color: '#5C677D', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
                Alert Channels
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {/* SMS Toggle */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.76rem', color: '#CBD5E1' }}>
                  <span>SMS</span>
                  <div
                    onClick={() => setSmsAlerts(!smsAlerts)}
                    style={{
                      width: 32,
                      height: 18,
                      borderRadius: 12,
                      background: smsAlerts ? '#35D8FF' : 'rgba(120, 140, 180, 0.25)',
                      position: 'relative',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ width: 14, height: 14, borderRadius: '50%', background: '#FFFFFF', position: 'absolute', top: 2, left: smsAlerts ? 16 : 2, transition: 'left 0.2s ease' }} />
                  </div>
                </div>

                {/* Push Notifications Toggle */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.76rem', color: '#CBD5E1' }}>
                  <span>Push Notifications</span>
                  <div
                    onClick={() => setPushAlerts(!pushAlerts)}
                    style={{
                      width: 32,
                      height: 18,
                      borderRadius: 12,
                      background: pushAlerts ? '#35D8FF' : 'rgba(120, 140, 180, 0.25)',
                      position: 'relative',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ width: 14, height: 14, borderRadius: '50%', background: '#FFFFFF', position: 'absolute', top: 2, left: pushAlerts ? 16 : 2, transition: 'left 0.2s ease' }} />
                  </div>
                </div>

                {/* Email Toggle */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.76rem', color: '#CBD5E1' }}>
                  <span>Email</span>
                  <div
                    onClick={() => setEmailAlerts(!emailAlerts)}
                    style={{
                      width: 32,
                      height: 18,
                      borderRadius: 12,
                      background: emailAlerts ? '#35D8FF' : 'rgba(120, 140, 180, 0.25)',
                      position: 'relative',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ width: 14, height: 14, borderRadius: '50%', background: '#FFFFFF', position: 'absolute', top: 2, left: emailAlerts ? 16 : 2, transition: 'left 0.2s ease' }} />
                  </div>
                </div>
              </div>
            </div>

            {/* GENERAL Section */}
            <div style={{ borderTop: '1px solid rgba(120, 140, 180, 0.15)', paddingTop: 10 }}>
              <span style={{ fontSize: '0.68rem', color: '#5C677D', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
                GENERAL
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.76rem', color: '#CBD5E1' }}>
                  <span>Sound Alerts</span>
                  <div
                    onClick={() => setSoundAlerts(!soundAlerts)}
                    style={{
                      width: 32,
                      height: 18,
                      borderRadius: 12,
                      background: soundAlerts ? '#35D8FF' : 'rgba(120, 140, 180, 0.25)',
                      position: 'relative',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ width: 14, height: 14, borderRadius: '50%', background: '#FFFFFF', position: 'absolute', top: 2, left: soundAlerts ? 16 : 2, transition: 'left 0.2s ease' }} />
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.76rem', color: '#CBD5E1' }}>
                  <span>Vibration</span>
                  <div
                    onClick={() => setVibration(!vibration)}
                    style={{
                      width: 32,
                      height: 18,
                      borderRadius: 12,
                      background: vibration ? '#35D8FF' : 'rgba(120, 140, 180, 0.25)',
                      position: 'relative',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ width: 14, height: 14, borderRadius: '50%', background: '#FFFFFF', position: 'absolute', top: 2, left: vibration ? 16 : 2, transition: 'left 0.2s ease' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Column 2: PREFERENCES */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, borderLeft: '1px solid rgba(120, 140, 180, 0.15)', paddingLeft: 18 }}>
            <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#9AA5B8', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'Space Grotesk, sans-serif' }}>
              PREFERENCES
            </span>

            <div>
              <label style={{ fontSize: '0.7rem', color: '#5C677D', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>
                Language
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="command-input"
                style={{ fontSize: '0.76rem', padding: '6px 10px' }}
              >
                <option>English</option>
                <option>Khasi</option>
                <option>Hindi</option>
                <option>Assamese</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.7rem', color: '#5C677D', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>
                Theme
              </label>
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                className="command-input"
                style={{ fontSize: '0.76rem', padding: '6px 10px' }}
              >
                <option>Dark</option>
                <option>Light</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.7rem', color: '#5C677D', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>
                Units
              </label>
              <select
                value={units}
                onChange={(e) => setUnits(e.target.value)}
                className="command-input"
                style={{ fontSize: '0.76rem', padding: '6px 10px' }}
              >
                <option>Metric (°C, mm)</option>
                <option>Imperial (°F, in)</option>
              </select>
            </div>
          </div>

          {/* Column 3: DATA SYNC */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, borderLeft: '1px solid rgba(120, 140, 180, 0.15)', paddingLeft: 18 }}>
            <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#9AA5B8', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'Space Grotesk, sans-serif' }}>
              DATA SYNC
            </span>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.76rem', color: '#CBD5E1' }}>
                <span>Auto Sync (Wi-Fi)</span>
                <div
                  onClick={() => setAutoSyncWifi(!autoSyncWifi)}
                  style={{
                    width: 32,
                    height: 18,
                    borderRadius: 12,
                    background: autoSyncWifi ? '#39D98A' : 'rgba(120, 140, 180, 0.25)',
                    position: 'relative',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ width: 14, height: 14, borderRadius: '50%', background: '#FFFFFF', position: 'absolute', top: 2, left: autoSyncWifi ? 16 : 2, transition: 'left 0.2s ease' }} />
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.76rem', color: '#CBD5E1' }}>
                <span>Auto Sync (Mobile Data)</span>
                <div
                  onClick={() => setAutoSyncMobile(!autoSyncMobile)}
                  style={{
                    width: 32,
                    height: 18,
                    borderRadius: 12,
                    background: autoSyncMobile ? '#39D98A' : 'rgba(120, 140, 180, 0.25)',
                    position: 'relative',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ width: 14, height: 14, borderRadius: '50%', background: '#FFFFFF', position: 'absolute', top: 2, left: autoSyncMobile ? 16 : 2, transition: 'left 0.2s ease' }} />
                </div>
              </div>
            </div>

            {/* [ Sync Now ] Button */}
            <button
              onClick={handleSyncNow}
              disabled={isSyncing}
              className="btn-surface"
              style={{
                width: '100%',
                padding: '8px 0',
                justifyContent: 'center',
                fontSize: '0.76rem',
                marginTop: 8
              }}
            >
              <RefreshCw size={13} style={{ animation: isSyncing ? 'spin 1s linear infinite' : 'none' }} />
              <span>{isSyncing ? 'Syncing Data...' : 'Sync Now'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

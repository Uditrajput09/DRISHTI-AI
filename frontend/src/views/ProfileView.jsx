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
  RefreshCw,
  Smartphone,
  Download,
  Terminal,
  ExternalLink
} from 'lucide-react';
import { 
  Card, 
  PageHeader, 
  Button, 
  SecondaryButton, 
  DangerButton, 
  Avatar, 
  Badge, 
  Select, 
  Divider 
} from '../components/ui';
import { authService } from '../services/authService';
import FaqAccordion from '../components/FaqAccordion';
import { useTranslation } from '../hooks/useTranslation';

export default function ProfileView({ 
  currentUser, 
  setCurrentUser, 
  onNavigate,
  onOpenAndroidModal,
  onOpenSimulator
}) {
  const [activeNav, setActiveNav] = useState('notifications');

  // Settings Toggles
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [pushAlerts, setPushAlerts] = useState(true);
  const [soundAlerts, setSoundAlerts] = useState(true);

  // Preferences & i18n
  const { lang, setLang } = useTranslation();
  const [units, setUnits] = useState('metric');
  const [isSyncing, setIsSyncing] = useState(false);

  const menuItems = [
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'language', label: 'Language & Region', icon: Globe },
    { id: 'display', label: 'Units & Display', icon: Sliders },
    { id: 'sync', label: 'Data Synchronization', icon: Database },
    { id: 'android', label: 'Android Mobile App', icon: Smartphone },
    { id: 'faq', label: 'Frequently Asked Questions', icon: Info }
  ];

  const handleSyncNow = () => {
    setIsSyncing(true);
    setTimeout(() => setIsSyncing(false), 1200);
  };

  const userName = currentUser?.name || 'SDMA Commander';
  const userRole = currentUser?.role || 'Citizen Scientist & Disaster Responder';
  const userDistrict = currentUser?.district || 'East Khasi Hills, Meghalaya';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* 1. Page Header */}
      <PageHeader
        breadcrumbs={['System', 'User Profile', 'Settings & Hub']}
        title="Emergency Responder Profile"
        subtitle="Operator identity, multi-channel dispatch preferences, and client synchronization"
        actions={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <SecondaryButton
              size="sm"
              icon={User}
              onClick={() => onNavigate && onNavigate('login')}
            >
              Switch User
            </SecondaryButton>
            <DangerButton
              size="sm"
              icon={LogOut}
              onClick={() => {
                authService.logout();
                if (setCurrentUser) setCurrentUser(null);
                if (onNavigate) onNavigate('login');
              }}
            >
              Log Out
            </DangerButton>
          </div>
        }
      />

      {/* 2. Top Profile Hero Card */}
      <Card padding={16}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
            <Avatar name={userName} size={54} status="online" />

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <h2 style={{ fontSize: 17, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                  {userName}
                </h2>
                <Badge variant="live" size="sm">Verified Responder</Badge>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', fontSize: 12, color: 'var(--brand-light)', marginTop: 3 }}>
                <span>{userRole}</span>
                <span style={{ color: 'var(--text-muted)' }}>•</span>
                <span style={{ color: 'var(--text-secondary)' }}>{userDistrict}</span>
              </div>

              <p style={{ fontSize: 11.5, color: 'var(--text-muted)', margin: '4px 0 0 0', lineHeight: 1.35 }}>
                Active responder telemetry linked to East Khasi Hills emergency command network.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {onOpenAndroidModal && (
              <SecondaryButton
                size="sm"
                icon={Smartphone}
                onClick={onOpenAndroidModal}
                style={{ flex: '1 1 130px' }}
              >
                Android APK
              </SecondaryButton>
            )}
            {onOpenSimulator && (
              <SecondaryButton
                size="sm"
                icon={Terminal}
                onClick={onOpenSimulator}
                style={{ flex: '1 1 130px' }}
              >
                Device Simulator
              </SecondaryButton>
            )}
            {onNavigate && (
              <SecondaryButton
                size="sm"
                icon={Download}
                onClick={() => onNavigate('offline-maps')}
                style={{ flex: '1 1 130px' }}
              >
                Offline Maps & GPS
              </SecondaryButton>
            )}
          </div>
        </div>

        {/* User Stats Row */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 6,
            borderTop: '1px solid var(--border-primary)',
            paddingTop: 14,
            marginTop: 14
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <div className="font-mono" style={{ fontSize: 20, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.1 }}>
              {currentUser?.stats?.reportsSubmitted ?? 14}
            </div>
            <span style={{ fontSize: 10, color: 'var(--text-secondary)', fontWeight: 500, display: 'block', marginTop: 2 }}>
              Reports Submitted
            </span>
          </div>

          <div style={{ textAlign: 'center', borderLeft: '1px solid var(--border-primary)', borderRight: '1px solid var(--border-primary)' }}>
            <div className="font-mono" style={{ fontSize: 20, fontWeight: 600, color: 'var(--brand-primary)', lineHeight: 1.1 }}>
              {currentUser?.stats?.alertsFollowed ?? 8}
            </div>
            <span style={{ fontSize: 10, color: 'var(--text-secondary)', fontWeight: 500, display: 'block', marginTop: 2 }}>
              Alerts Monitored
            </span>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div className="font-mono" style={{ fontSize: 20, fontWeight: 600, color: 'var(--risk-safe)', lineHeight: 1.1 }}>
              {currentUser?.stats?.postsCount ?? 6}
            </div>
            <span style={{ fontSize: 10, color: 'var(--text-secondary)', fontWeight: 500, display: 'block', marginTop: 2 }}>
              Ground Verifications
            </span>
          </div>
        </div>
      </Card>

      {/* 3. Settings Navigation Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '220px minmax(0, 1fr)',
          gap: 16,
          alignItems: 'start'
        }}
        className="simulation-xai-grid"
      >
        {/* Left Settings Rail */}
        <Card padding={8} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {menuItems.map((item) => {
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
                  borderRadius: 'var(--radius-input)',
                  border: isActive ? '1px solid var(--brand-border)' : '1px solid transparent',
                  backgroundColor: isActive ? 'var(--brand-tint)' : 'transparent',
                  color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                  fontSize: 13,
                  fontWeight: isActive ? 500 : 400,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all var(--transition-fast)'
                }}
              >
                <Icon
                  size={15}
                  style={{ color: isActive ? 'var(--brand-primary)' : 'var(--text-muted)' }}
                />
                <span>{item.label}</span>
              </button>
            );
          })}
        </Card>

        {/* Right Settings Detail Panel */}
        <Card padding={20}>
          {activeNav === 'notifications' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                Notification Preferences
              </h3>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0 }}>
                Configure multi-channel alerts and audible siren triggers for immediate landslide danger.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 4 }}>
                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-input)', border: '1px solid var(--border-primary)', cursor: 'pointer' }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>SMS Emergency Alerts</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Direct SMS push via Fast2SMS gateway for Critical thresholds</div>
                  </div>
                  <input type="checkbox" checked={smsAlerts} onChange={(e) => setSmsAlerts(e.target.checked)} style={{ accentColor: 'var(--brand-primary)', width: 16, height: 16 }} />
                </label>

                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-input)', border: '1px solid var(--border-primary)', cursor: 'pointer' }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>Web Push Notifications (FCM)</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Real-time browser notifications on slope movement</div>
                  </div>
                  <input type="checkbox" checked={pushAlerts} onChange={(e) => setPushAlerts(e.target.checked)} style={{ accentColor: 'var(--brand-primary)', width: 16, height: 16 }} />
                </label>

                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-input)', border: '1px solid var(--border-primary)', cursor: 'pointer' }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>Audible Warning Siren</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Plays loud acoustic tone when a Critical advisory is received</div>
                  </div>
                  <input type="checkbox" checked={soundAlerts} onChange={(e) => setSoundAlerts(e.target.checked)} style={{ accentColor: 'var(--brand-primary)', width: 16, height: 16 }} />
                </label>
              </div>
            </div>
          )}

          {activeNav === 'language' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                Language & Regional Settings
              </h3>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0 }}>
                Select preferred interface and emergency advisory translation language.
              </p>

              <div style={{ maxWidth: 320, marginTop: 4 }}>
                <Select
                  label="Display Language"
                  value={lang}
                  onChange={(val) => {
                    const newLang = typeof val === 'object' && val?.target ? val.target.value : val;
                    setLang(newLang);
                    if (currentUser) {
                      const updated = { ...currentUser, language: newLang };
                      setCurrentUser && setCurrentUser(updated);
                      localStorage.setItem('drishti_current_user', JSON.stringify(updated));
                    }
                  }}
                  options={[
                    { value: 'en', label: 'English' },
                    { value: 'kha', label: 'Khasi (Meghalaya)' },
                    { value: 'hi', label: 'Hindi' },
                    { value: 'as', label: 'Assamese' }
                  ]}
                />
              </div>
            </div>
          )}

          {activeNav === 'display' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                Units & Measurements
              </h3>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0 }}>
                Technical telemetry units for rainfall, slope angle, and coordinate displays.
              </p>

              <div style={{ maxWidth: 320, marginTop: 4 }}>
                <Select
                  label="Measurement Standard"
                  value={units}
                  onChange={setUnits}
                  options={[
                    { value: 'metric', label: 'Metric (mm rainfall, m elevation, ° slope)' },
                    { value: 'imperial', label: 'Imperial (inches rainfall, ft elevation)' }
                  ]}
                />
              </div>
            </div>
          )}

          {activeNav === 'sync' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                Offline Data Synchronization
              </h3>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0 }}>
                Manage local IndexedDB caching and background sync queue for remote areas without cell connectivity.
              </p>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4 }}>
                <Button
                  variant="primary"
                  icon={RefreshCw}
                  loading={isSyncing}
                  onClick={handleSyncNow}
                >
                  {isSyncing ? 'Synchronizing Telemetry...' : 'Force Sync Now'}
                </Button>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  Last synced: 2 minutes ago • 0 pending changes
                </span>
              </div>
            </div>
          )}

          {activeNav === 'android' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <img
                  src="/logo.jpg"
                  alt="DRISHTI-AI"
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    objectFit: 'cover',
                    border: '1px solid rgba(79, 111, 255, 0.35)',
                    flexShrink: 0
                  }}
                />
                <div>
                  <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                    DRISHTI-AI Android Companion Application
                  </h3>
                  <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
                    Native Android APK with hardware accelerometer tilt sensing, offline GIS caching, and background push alarms.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <Button
                  variant="primary"
                  icon={Download}
                  onClick={onOpenAndroidModal}
                >
                  Download APK
                </Button>
                <SecondaryButton
                  icon={Terminal}
                  onClick={onOpenSimulator}
                >
                  Launch Simulator
                </SecondaryButton>
              </div>
            </div>
          )}

          {activeNav === 'faq' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                Frequently Asked Questions
              </h3>
              <FaqAccordion />
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

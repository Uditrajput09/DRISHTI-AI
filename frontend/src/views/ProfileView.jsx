import React, { useState } from 'react';
import HoloNavbar from '../components/HoloNavbar';
import {
  User, Edit3, LogOut, Bell, Globe, Shield, MapPin, CheckCircle2,
  FileText, Bookmark, Settings, X, Camera, Sparkles, ChevronRight
} from 'lucide-react';
import { authService } from '../services/authService';

export default function ProfileView({ currentUser, setCurrentUser, onNavigate }) {
  const [activeTab, setActiveTab] = useState('reports'); // 'reports' | 'saved' | 'settings'
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Profile Edit State
  const [editName, setEditName] = useState(currentUser?.name || 'Community Responder');
  const [editBio, setEditBio] = useState(currentUser?.bio || 'Disaster responder in East Khasi Hills');
  const [editRole, setEditRole] = useState(currentUser?.role || 'Citizen Scientist');
  const [editAvatar, setEditAvatar] = useState(currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80');

  // Settings Toggles State
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [pushAlerts, setPushAlerts] = useState(true);
  const [language, setLanguage] = useState(currentUser?.language || 'en');

  const handleLogout = () => {
    authService.logout();
    if (setCurrentUser) setCurrentUser(null);
    if (onNavigate) onNavigate('/login');
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    const updated = authService.updateProfile({
      name: editName,
      bio: editBio,
      role: editRole,
      avatar: editAvatar
    });
    if (setCurrentUser) setCurrentUser(updated);
    setIsEditModalOpen(false);
  };

  // MOCKED: User's submitted reports
  const myReports = [
    {
      id: 'rep_1',
      title: 'Rockfall & Mudslide on Pynursla NH-40',
      location: 'Pynursla Pass',
      status: 'VERIFIED',
      timestamp: '2 days ago',
      severity: 'HIGH'
    },
    {
      id: 'rep_2',
      title: 'Saturated Slope Drainage Overflow',
      location: 'Sohra Road',
      status: 'PENDING',
      timestamp: '5 days ago',
      severity: 'MODERATE'
    }
  ];

  // MOCKED: User's saved alerts & zones
  const savedAlerts = [
    {
      id: 'sav_1',
      zone: 'Sohra / Cherrapunji Sector',
      riskCategory: 'CRITICAL',
      lastUpdated: '15m ago',
      details: 'Cloudburst catchment monitoring active.'
    },
    {
      id: 'sav_2',
      zone: 'Nongpriang Ravine',
      riskCategory: 'CRITICAL',
      lastUpdated: '40m ago',
      details: 'Slope sensor #04 displacement alert.'
    }
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#060608', paddingBottom: 90 }}>
      {/* Top Header */}
      <HoloNavbar
        currentPath="/profile"
        onNavigate={onNavigate}
        currentUser={currentUser}
      />

      {/* Profile Cover Banner */}
      <div style={{
        height: 180,
        background: 'linear-gradient(120deg, rgba(255,110,199,0.25), rgba(120,115,245,0.25), rgba(79,216,234,0.25))',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        position: 'relative'
      }} />

      <main style={{ maxWidth: 680, margin: '-60px auto 0', padding: '0 16px', position: 'relative', zIndex: 10 }}>
        {/* Header Profile Info Card */}
        <div className="holo-card" style={{ padding: '24px 28px', marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
            {/* Overlapping Avatar */}
            <div className="avatar-ring-gradient" style={{ marginTop: '-48px' }}>
              <img
                src={currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80'}
                alt={currentUser?.name || 'User Profile'}
                style={{
                  width: 90,
                  height: 90,
                  borderRadius: '50%',
                  objectFit: 'cover',
                  display: 'block',
                  border: '3px solid #060608'
                }}
              />
            </div>

            {/* Edit Profile Button */}
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="holo-btn-secondary"
              style={{
                padding: '8px 16px',
                fontSize: '0.84rem',
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              <Edit3 size={15} color="#4FD8EA" />
              <span>Edit Profile</span>
            </button>
          </div>

          <div style={{ marginTop: 14 }}>
            <h2 className="holo-gradient-text" style={{ fontSize: '1.45rem', margin: '0 0 4px' }}>
              {currentUser?.name || 'Community Responder'}
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.84rem', color: '#7873F5', marginBottom: 8, fontWeight: 600 }}>
              <span>{currentUser?.role || 'Citizen Scientist'}</span>
              <span>•</span>
              <span style={{ color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 4 }}>
                <MapPin size={14} color="#FF6EC7" /> {currentUser?.district || 'East Khasi Hills'}
              </span>
            </div>
            <p className="holo-body" style={{ fontSize: '0.88rem', color: '#cbd5e1', lineHeight: 1.5, margin: 0 }}>
              {currentUser?.bio || 'Active early-warning volunteer in Sohra & Pynursla sector.'}
            </p>
          </div>

          {/* User Stats Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginTop: 22 }}>
            <div style={{
              background: 'rgba(15, 15, 20, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: 14,
              padding: '14px',
              textAlign: 'center'
            }}>
              <div className="holo-heading" style={{ fontSize: '1.4rem', color: '#FF6EC7', fontWeight: 700 }}>
                {currentUser?.stats?.postsCount || 14}
              </div>
              <div style={{ fontSize: '0.74rem', color: '#94a3b8', textTransform: 'uppercase', marginTop: 2 }}>
                Posts
              </div>
            </div>

            <div style={{
              background: 'rgba(15, 15, 20, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: 14,
              padding: '14px',
              textAlign: 'center'
            }}>
              <div className="holo-heading" style={{ fontSize: '1.4rem', color: '#7873F5', fontWeight: 700 }}>
                {currentUser?.stats?.reportsSubmitted || 8}
              </div>
              <div style={{ fontSize: '0.74rem', color: '#94a3b8', textTransform: 'uppercase', marginTop: 2 }}>
                Reports
              </div>
            </div>

            <div style={{
              background: 'rgba(15, 15, 20, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: 14,
              padding: '14px',
              textAlign: 'center'
            }}>
              <div className="holo-heading" style={{ fontSize: '1.4rem', color: '#4FD8EA', fontWeight: 700 }}>
                {currentUser?.stats?.alertsFollowed || 12}
              </div>
              <div style={{ fontSize: '0.74rem', color: '#94a3b8', textTransform: 'uppercase', marginTop: 2 }}>
                Alerts Monitored
              </div>
            </div>
          </div>
        </div>

        {/* Profile Tabs Navigation */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          marginBottom: 20
        }}>
          <button
            onClick={() => setActiveTab('reports')}
            style={{
              flex: 1,
              padding: '12px 0',
              background: 'none',
              border: 'none',
              color: activeTab === 'reports' ? '#FF6EC7' : '#94a3b8',
              fontFamily: 'Space Grotesk, sans-serif',
              fontWeight: 600,
              fontSize: '0.9rem',
              cursor: 'pointer',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6
            }}
          >
            <FileText size={16} />
            <span>My Reports</span>
            {activeTab === 'reports' && (
              <div style={{
                position: 'absolute',
                bottom: -1,
                left: 0,
                right: 0,
                height: 3,
                background: 'linear-gradient(90deg, #FF6EC7, #7873F5)',
                borderRadius: '3px 3px 0 0'
              }} />
            )}
          </button>

          <button
            onClick={() => setActiveTab('saved')}
            style={{
              flex: 1,
              padding: '12px 0',
              background: 'none',
              border: 'none',
              color: activeTab === 'saved' ? '#7873F5' : '#94a3b8',
              fontFamily: 'Space Grotesk, sans-serif',
              fontWeight: 600,
              fontSize: '0.9rem',
              cursor: 'pointer',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6
            }}
          >
            <Bookmark size={16} />
            <span>Saved Alerts</span>
            {activeTab === 'saved' && (
              <div style={{
                position: 'absolute',
                bottom: -1,
                left: 0,
                right: 0,
                height: 3,
                background: 'linear-gradient(90deg, #7873F5, #4FD8EA)',
                borderRadius: '3px 3px 0 0'
              }} />
            )}
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            style={{
              flex: 1,
              padding: '12px 0',
              background: 'none',
              border: 'none',
              color: activeTab === 'settings' ? '#4FD8EA' : '#94a3b8',
              fontFamily: 'Space Grotesk, sans-serif',
              fontWeight: 600,
              fontSize: '0.9rem',
              cursor: 'pointer',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6
            }}
          >
            <Settings size={16} />
            <span>Settings</span>
            {activeTab === 'settings' && (
              <div style={{
                position: 'absolute',
                bottom: -1,
                left: 0,
                right: 0,
                height: 3,
                background: 'linear-gradient(90deg, #4FD8EA, #FF6EC7)',
                borderRadius: '3px 3px 0 0'
              }} />
            )}
          </button>
        </div>

        {/* TAB 1: MY REPORTS */}
        {activeTab === 'reports' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {myReports.map(rep => (
              <div key={rep.id} className="holo-card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <h4 className="holo-heading" style={{ fontSize: '0.96rem', color: '#ffffff', margin: 0 }}>
                      {rep.title}
                    </h4>
                    <span className={rep.status === 'VERIFIED' ? 'holo-badge-low' : 'holo-badge-high'}>
                      {rep.status}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'flex', gap: 10 }}>
                    <span>📍 {rep.location}</span>
                    <span>•</span>
                    <span>🕒 {rep.timestamp}</span>
                  </div>
                </div>
                <ChevronRight size={18} color="#94a3b8" />
              </div>
            ))}
          </div>
        )}

        {/* TAB 2: SAVED ALERTS */}
        {activeTab === 'saved' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {savedAlerts.map(sav => (
              <div key={sav.id} className="holo-card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <h4 className="holo-heading" style={{ fontSize: '0.96rem', color: '#ffffff', margin: 0 }}>
                      {sav.zone}
                    </h4>
                    <span className="holo-badge-critical">
                      {sav.riskCategory}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.82rem', color: '#cbd5e1', margin: '2px 0 4px' }}>
                    {sav.details}
                  </p>
                  <span style={{ fontSize: '0.74rem', color: '#64748b' }}>Updated {sav.lastUpdated}</span>
                </div>
                <button
                  onClick={() => onNavigate && onNavigate('/app')}
                  className="holo-btn-secondary"
                  style={{ padding: '6px 12px', fontSize: '0.78rem' }}
                >
                  View Map
                </button>
              </div>
            ))}
          </div>
        )}

        {/* TAB 3: SETTINGS */}
        {activeTab === 'settings' && (
          <div className="holo-card" style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <h3 className="holo-gradient-text" style={{ fontSize: '1.15rem', marginBottom: 14 }}>
                Notification Preferences
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <span style={{ color: '#ffffff', fontSize: '0.9rem', fontWeight: 500 }}>SMS Early Warnings (Fast2SMS)</span>
                    <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: 0 }}>High severity alerts sent to registered phone</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={smsAlerts}
                    onChange={(e) => setSmsAlerts(e.target.checked)}
                    style={{ width: 18, height: 18, accentColor: '#FF6EC7', cursor: 'pointer' }}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 10, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <div>
                    <span style={{ color: '#ffffff', fontSize: '0.9rem', fontWeight: 500 }}>Push Notifications (FCM)</span>
                    <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: 0 }}>Real-time radar updates on mobile app</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={pushAlerts}
                    onChange={(e) => setPushAlerts(e.target.checked)}
                    style={{ width: 18, height: 18, accentColor: '#4FD8EA', cursor: 'pointer' }}
                  />
                </div>
              </div>
            </div>

            <div style={{ paddingTop: 16, borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <h3 className="holo-gradient-text" style={{ fontSize: '1.15rem', marginBottom: 14 }}>
                Language Preference (LibreTranslate)
              </h3>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="holo-input"
                style={{ width: '100%', backgroundColor: '#0f0f14' }}
              >
                <option value="en">English (EN)</option>
                <option value="hi">Hindi (हिन्दी - HI)</option>
                <option value="as">Assamese (অসমীয়া - AS)</option>
                <option value="kha">Khasi (Ka Ktien Khasi - KHA)</option>
              </select>
            </div>

            <div style={{ paddingTop: 16, borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <button
                onClick={handleLogout}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: 'rgba(255, 110, 199, 0.15)',
                  border: '1px solid rgba(255, 110, 199, 0.4)',
                  borderRadius: 14,
                  color: '#FF9AD7',
                  fontFamily: 'Space Grotesk, sans-serif',
                  fontWeight: 600,
                  fontSize: '0.92rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  cursor: 'pointer'
                }}
              >
                <LogOut size={18} />
                <span>Log Out of Session</span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 2000,
          backgroundColor: 'rgba(6, 6, 8, 0.88)',
          backdropFilter: 'blur(16px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 16
        }}>
          <div className="holo-card" style={{ width: '100%', maxWidth: 440, padding: 28, position: 'relative' }}>
            <button
              onClick={() => setIsEditModalOpen(false)}
              style={{ position: 'absolute', top: 18, right: 18, background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>

            <h3 className="holo-gradient-text" style={{ fontSize: '1.3rem', marginBottom: 16 }}>
              Edit Responder Profile
            </h3>

            <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: 6 }}>
                  Full Name
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="holo-input"
                  style={{ width: '100%' }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: 6 }}>
                  Role / Affiliation
                </label>
                <input
                  type="text"
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value)}
                  className="holo-input"
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: 6 }}>
                  Bio / Monitoring Sector
                </label>
                <textarea
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  className="holo-input"
                  rows={3}
                  style={{ width: '100%', resize: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: 6 }}>
                  Avatar Image URL (or Preset)
                </label>
                <input
                  type="text"
                  value={editAvatar}
                  onChange={(e) => setEditAvatar(e.target.value)}
                  className="holo-input"
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="holo-btn-secondary"
                  style={{ flex: 1, padding: '12px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="holo-btn-primary"
                  style={{ flex: 1, padding: '12px' }}
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

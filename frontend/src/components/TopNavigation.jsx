import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Map, 
  TrendingUp, 
  Radio, 
  BellRing, 
  Smartphone, 
  User, 
  Eye, 
  RefreshCw,
  Search,
  Sliders,
  PanelLeft,
  Lock,
  Sun,
  Moon,
  Command,
  Menu,
  X,
  Download
} from 'lucide-react';

export default function TopNavigation({
  activeSection = 'gis',
  onSelectSection,
  unreadAlertCount = 6,
  onOpenAlerts,
  onOpenProfile,
  currentUser,
  onRefreshData,
  isRefreshing,
  showSidebar = false,
  onToggleSidebar,
  currentTheme = 'dark',
  onToggleTheme,
  onOpenShortcuts,
  onOpenAndroidModal,
  onOpenSimulator
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'gis', label: 'GIS Command', icon: Map },
    { id: 'risk', label: 'Risk Intelligence', icon: ShieldAlert },
    { id: 'forecast', label: 'Forecast', icon: TrendingUp },
    { id: 'incidents', label: 'Incidents', icon: Radio },
    { id: 'alerts', label: 'Alerts', icon: BellRing, badge: unreadAlertCount },
    { id: 'reports', label: 'Reports', icon: Smartphone },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'simulation', label: 'Simulation', icon: Sliders }
  ];

  return (
    <>
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 1100,
          height: 60,
          background: 'var(--bg-surface-glass)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid var(--border-command)',
          padding: '0 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          boxShadow: 'var(--shadow-command)',
          transition: 'all 0.2s ease'
        }}
      >
        {/* Left: Mobile hamburger + Logo + Pilot info */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            userSelect: 'none',
            flexShrink: 0
          }}
        >
          {/* Mobile Menu Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="mobile-hamburger-btn"
            title="Toggle Menu"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              display: 'none',
              padding: 4
            }}
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              title="Toggle Sidebar"
              className="desktop-nav"
              style={{
                background: showSidebar ? 'rgba(200, 150, 62, 0.15)' : 'var(--bg-surface-elevated)',
                border: `1px solid ${showSidebar ? 'var(--color-copper)' : 'var(--border-command)'}`,
                borderRadius: 'var(--radius-md)',
                width: 32,
                height: 32,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: showSidebar ? 'var(--color-copper)' : 'var(--text-secondary)',
                cursor: 'pointer',
                marginRight: 4
              }}
            >
              <PanelLeft size={16} />
            </button>
          )}

          {/* Brand Shield Logo with warm copper glow */}
          <div
            onClick={() => onSelectSection('gis')}
            style={{
              width: 36,
              height: 36,
              borderRadius: 'var(--radius-md)',
              background: 'rgba(200, 150, 62, 0.12)',
              border: '1px solid rgba(200, 150, 62, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 14px rgba(200, 150, 62, 0.25)',
              flexShrink: 0,
              cursor: 'pointer'
            }}
          >
            <Eye size={18} color="var(--color-copper)" />
          </div>

          <div onClick={() => onSelectSection('gis')} style={{ display: 'flex', flexDirection: 'column', cursor: 'pointer' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span
                style={{
                  fontSize: '1.12rem',
                  fontWeight: 700,
                  letterSpacing: '-0.02em',
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-serif)'
                }}
              >
                DRISHTI <span style={{ color: 'var(--color-copper)' }}>AI</span>
              </span>
              <span
                style={{
                  fontSize: '0.62rem',
                  color: 'var(--color-copper)',
                  background: 'rgba(200, 150, 62, 0.1)',
                  border: '1px solid rgba(200, 150, 62, 0.3)',
                  padding: '1px 7px',
                  borderRadius: 'var(--radius-full)',
                  fontWeight: 700,
                  letterSpacing: '0.04em'
                }}
              >
                PILOT
              </span>
            </div>
            <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', letterSpacing: '0.04em', textTransform: 'uppercase', fontWeight: 500 }}>
              East Khasi Hills • Live Monitoring
            </span>
          </div>
        </div>

        {/* Center: Desktop Navigation Links (Pill Style) */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: 4 }} className="desktop-nav">
          {navItems.map(item => {
            const isActive = activeSection === item.id;
            const IconComponent = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onSelectSection(item.id)}
                style={{
                  background: isActive ? 'var(--bg-surface-elevated)' : 'transparent',
                  color: isActive ? 'var(--color-copper)' : 'var(--text-secondary)',
                  border: `1px solid ${isActive ? 'var(--color-copper)' : 'transparent'}`,
                  borderRadius: 'var(--radius-full)',
                  padding: '6px 12px',
                  fontSize: '0.78rem',
                  fontWeight: isActive ? 600 : 500,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  position: 'relative'
                }}
              >
                <IconComponent size={13} color={isActive ? 'var(--color-copper)' : 'var(--text-secondary)'} />
                <span>{item.label}</span>
                {item.badge > 0 && (
                  <span
                    style={{
                      background: 'var(--risk-critical)',
                      color: '#FFFFFF',
                      fontSize: '0.6rem',
                      fontWeight: 700,
                      borderRadius: 'var(--radius-full)',
                      padding: '1px 5px',
                      marginLeft: 2
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Right: Shortcuts, Theme, Status, Refresh, Alerts, Profile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          {/* Cmd+K Shortcuts Trigger */}
          {onOpenShortcuts && (
            <button
              onClick={onOpenShortcuts}
              title="Keyboard Shortcuts (Cmd+K / ?)"
              className="desktop-nav"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-command)',
                borderRadius: 'var(--radius-full)',
                padding: '5px 10px',
                fontSize: '0.72rem',
                color: 'var(--text-muted)',
                cursor: 'pointer'
              }}
            >
              <Command size={12} />
              <span>Cmd+K</span>
            </button>
          )}

          {/* Dark / Light Mode Toggle */}
          {onToggleTheme && (
            <button
              onClick={onToggleTheme}
              title={`Switch to ${currentTheme === 'light' ? 'Dark' : 'Light'} Mode`}
              style={{
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-command)',
                borderRadius: 'var(--radius-full)',
                width: 32,
                height: 32,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              onMouseOver={(e) => { e.currentTarget.style.borderColor = 'var(--color-copper)'; }}
              onMouseOut={(e) => { e.currentTarget.style.borderColor = 'var(--border-command)'; }}
            >
              {currentTheme === 'light' ? <Moon size={14} /> : <Sun size={14} />}
            </button>
          )}

          {/* Live System Status Pill */}
          <div
            className="desktop-nav"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              background: 'rgba(42, 157, 143, 0.08)',
              border: '1px solid rgba(42, 157, 143, 0.3)',
              padding: '4px 8px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.68rem',
              fontWeight: 600,
              color: 'var(--risk-safe)'
            }}
          >
            <span className="live-indicator-dot" />
            <span>LIVE</span>
          </div>

          {/* Android APK Download Option */}
          <button
            onClick={onOpenAndroidModal}
            title="Download DRISHTI-AI Android APK"
            style={{
              background: 'rgba(200, 150, 62, 0.12)',
              border: '1px solid var(--color-copper)',
              borderRadius: 'var(--radius-full)',
              padding: '4px 10px',
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              color: 'var(--color-copper)',
              cursor: 'pointer',
              fontSize: '0.72rem',
              fontWeight: 600,
              transition: 'all 0.15s ease'
            }}
          >
            <Download size={12} />
            <span className="desktop-nav">APK (28 MB)</span>
          </button>

          {/* Simulate Android Options */}
          <button
            onClick={onOpenSimulator}
            title="Simulate Android Device & Telemetry Options"
            style={{
              background: 'var(--gradient-gilded)',
              border: 'none',
              borderRadius: 'var(--radius-full)',
              padding: '4px 11px',
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              color: '#08080a',
              cursor: 'pointer',
              fontSize: '0.72rem',
              fontWeight: 700,
              transition: 'all 0.15s ease',
              boxShadow: '0 2px 8px rgba(200, 150, 62, 0.25)'
            }}
          >
            <Sliders size={12} />
            <span className="desktop-nav">Simulate Android</span>
          </button>

          {/* Refresh Button */}
          <button
            onClick={onRefreshData}
            disabled={isRefreshing}
            title="Refresh Telemetry"
            style={{
              background: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-command)',
              borderRadius: 'var(--radius-full)',
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-copper)',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <RefreshCw
              size={13}
              style={{ animation: isRefreshing ? 'spin 1s linear infinite' : 'none' }}
            />
          </button>

          {/* Alerts Bell */}
          <button
            onClick={onOpenAlerts}
            title="Open Alerts Center"
            style={{
              background: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-command)',
              borderRadius: 'var(--radius-full)',
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              position: 'relative'
            }}
          >
            <BellRing size={14} color="var(--color-copper)" />
            {unreadAlertCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: 5,
                  right: 5,
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: 'var(--risk-critical)'
                }}
              />
            )}
          </button>

          {/* Profile Button */}
          <button
            onClick={onOpenProfile}
            title="User Profile"
            style={{
              background: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-command)',
              borderRadius: 'var(--radius-full)',
              padding: '3px 8px',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              color: 'var(--text-primary)',
              cursor: 'pointer'
            }}
          >
            <div
              style={{
                width: 20,
                height: 20,
                borderRadius: '50%',
                background: 'rgba(200, 150, 62, 0.2)',
                border: '1px solid var(--color-copper)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.68rem',
                fontWeight: 700,
                color: 'var(--color-copper)'
              }}
            >
              {currentUser?.name?.[0] || 'L'}
            </div>
            <span className="desktop-nav" style={{ fontSize: '0.72rem', fontWeight: 500, maxWidth: 90, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {currentUser?.name || 'Officer'}
            </span>
          </button>

          {/* Login / Switch Account */}
          <button
            onClick={() => onSelectSection('login')}
            title="Switch User / Login Portal"
            style={{
              background: activeSection === 'login' ? 'var(--color-copper)' : 'var(--bg-surface-elevated)',
              color: activeSection === 'login' ? '#08080a' : 'var(--text-secondary)',
              border: `1px solid ${activeSection === 'login' ? 'var(--color-copper)' : 'var(--border-command)'}`,
              borderRadius: 'var(--radius-full)',
              padding: '4px 10px',
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              cursor: 'pointer',
              fontSize: '0.72rem',
              fontWeight: 600,
              transition: 'all 0.15s ease'
            }}
          >
            <Lock size={12} />
            <span>Login</span>
          </button>
        </div>
      </header>

      {/* Mobile Slide-Out Menu Drawer */}
      {mobileMenuOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            top: 60,
            backgroundColor: 'rgba(8, 8, 10, 0.95)',
            backdropFilter: 'blur(16px)',
            zIndex: 1099,
            display: 'flex',
            flexDirection: 'column',
            padding: 20,
            gap: 8,
            overflowY: 'auto'
          }}
        >
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
            Navigation Sections
          </div>
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectSection(item.id);
                  setMobileMenuOpen(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  background: isActive ? 'var(--bg-surface-elevated)' : 'transparent',
                  border: `1px solid ${isActive ? 'var(--color-copper)' : 'var(--border-command)'}`,
                  borderRadius: 'var(--radius-md)',
                  color: isActive ? 'var(--color-copper)' : 'var(--text-primary)',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <Icon size={18} />
                  <span>{item.label}</span>
                </div>
                {item.badge > 0 && (
                  <span style={{ background: 'var(--risk-critical)', color: '#fff', fontSize: '0.7rem', padding: '2px 8px', borderRadius: 'var(--radius-full)' }}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          <div style={{ marginTop: 20, borderTop: '1px solid var(--border-command)', paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {/* Mobile Android APK Option */}
            <button
              onClick={() => {
                if (onOpenAndroidModal) onOpenAndroidModal();
                setMobileMenuOpen(false);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '10px 14px',
                background: 'rgba(200, 150, 62, 0.12)',
                border: '1px solid var(--color-copper)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--color-copper)',
                fontSize: '0.84rem',
                fontWeight: 600
              }}
            >
              <Download size={16} />
              Download Android APK (6.99 MB)
            </button>

            {/* Mobile Android Simulator Option */}
            <button
              onClick={() => {
                if (onOpenSimulator) onOpenSimulator();
                setMobileMenuOpen(false);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '10px 14px',
                background: 'var(--gradient-gilded)',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                color: '#08080a',
                fontSize: '0.84rem',
                fontWeight: 700
              }}
            >
              <Sliders size={16} />
              Simulate Android Device Options
            </button>
            {onToggleTheme && (
              <button
                onClick={() => {
                  onToggleTheme();
                  setMobileMenuOpen(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '10px 14px',
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-command)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-primary)',
                  fontSize: '0.84rem'
                }}
              >
                {currentTheme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
                Switch to {currentTheme === 'light' ? 'Dark' : 'Light'} Mode
              </button>
            )}
            <button
              onClick={() => {
                if (onOpenAndroidModal) onOpenAndroidModal();
                setMobileMenuOpen(false);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '10px 14px',
                background: 'rgba(200, 150, 62, 0.12)',
                border: '1px solid var(--color-copper)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--color-copper)',
                fontSize: '0.84rem',
                fontWeight: 600
              }}
            >
              <Download size={16} />
              Download Android APK (28 MB)
            </button>
            <button
              onClick={() => {
                if (onOpenSimulator) onOpenSimulator();
                setMobileMenuOpen(false);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '10px 14px',
                background: 'var(--gradient-gilded)',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                color: '#08080a',
                fontSize: '0.84rem',
                fontWeight: 700
              }}
            >
              <Sliders size={16} />
              Simulate Android Options
            </button>
            <button
              onClick={() => {
                onSelectSection('login');
                setMobileMenuOpen(false);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '10px 14px',
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-command)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--color-copper)',
                fontSize: '0.84rem'
              }}
            >
              <Lock size={16} />
              Access Login / Switch Role
            </button>
          </div>
        </div>
      )}

      {/* Style hook for mobile hamburger */}
      <style>{`
        @media (max-width: 768px) {
          .mobile-hamburger-btn {
            display: flex !important;
          }
        }
      `}</style>
    </>
  );
}

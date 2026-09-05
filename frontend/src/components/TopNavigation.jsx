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
  Lock
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
  onToggleSidebar
}) {
  const [searchQuery, setSearchQuery] = useState('');

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
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 1100,
        height: 64,
        background: 'rgba(7, 10, 16, 0.96)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(120, 140, 180, 0.22)',
        padding: '0 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
        boxShadow: '0 4px 24px rgba(0, 0, 0, 0.75)'
      }}
    >
      {/* Left: DRISHTI AI logo + East Khasi Hills • Live Monitoring */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          cursor: 'pointer',
          userSelect: 'none',
          flexShrink: 0
        }}
      >
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            title="Toggle EOC Sidebar"
            className="desktop-nav"
            style={{
              background: showSidebar ? 'rgba(53, 216, 255, 0.15)' : 'rgba(21, 27, 41, 0.8)',
              border: `1px solid ${showSidebar ? 'rgba(53, 216, 255, 0.4)' : 'rgba(120, 140, 180, 0.25)'}`,
              borderRadius: 6,
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: showSidebar ? '#35D8FF' : '#9AA5B8',
              cursor: 'pointer',
              marginRight: 4
            }}
          >
            <PanelLeft size={16} />
          </button>
        )}

        {/* Brand Shield Logo with glowing ring */}
        <div
          onClick={() => onSelectSection('gis')}
          style={{
            width: 38,
            height: 38,
            borderRadius: 10,
            background: 'linear-gradient(135deg, rgba(53, 216, 255, 0.22), rgba(139, 108, 255, 0.25))',
            border: '1px solid rgba(53, 216, 255, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 16px rgba(53, 216, 255, 0.35)',
            flexShrink: 0
          }}
        >
          <Eye size={20} color="#35D8FF" />
        </div>

        <div onClick={() => onSelectSection('gis')} style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span
              style={{
                fontSize: '1.18rem',
                fontWeight: 900,
                letterSpacing: '0.04em',
                color: '#FFFFFF',
                fontFamily: 'Space Grotesk, sans-serif'
              }}
            >
              DRISHTI <span style={{ color: '#35D8FF' }}>AI</span>
            </span>
            <span
              style={{
                fontSize: '0.62rem',
                color: '#35D8FF',
                background: 'rgba(53, 216, 255, 0.12)',
                border: '1px solid rgba(53, 216, 255, 0.35)',
                padding: '1px 6px',
                borderRadius: 4,
                fontWeight: 800,
                letterSpacing: '0.06em',
                fontFamily: 'Space Grotesk, sans-serif'
              }}
            >
              PILOT
            </span>
          </div>
          <span style={{ fontSize: '0.64rem', color: '#9AA5B8', letterSpacing: '0.05em', textTransform: 'uppercase', fontWeight: 600 }}>
            East Khasi Hills • Live Monitoring
          </span>
        </div>
      </div>

      {/* Center: Desktop Navigation Links */}
      <nav style={{ display: 'flex', alignItems: 'center', gap: 4 }} className="desktop-nav">
        {navItems.map(item => {
          const isActive = activeSection === item.id;
          const IconComponent = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onSelectSection(item.id)}
              style={{
                background: isActive ? 'linear-gradient(135deg, rgba(53, 216, 255, 0.12) 0%, rgba(139, 108, 255, 0.12) 100%)' : 'transparent',
                color: isActive ? '#35D8FF' : '#9AA5B8',
                border: `1px solid ${isActive ? 'rgba(53, 216, 255, 0.55)' : 'transparent'}`,
                borderRadius: 8,
                padding: '7px 11px',
                fontSize: '0.78rem',
                fontWeight: isActive ? 800 : 600,
                fontFamily: 'Space Grotesk, sans-serif',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                position: 'relative',
                boxShadow: isActive ? '0 0 14px rgba(53, 216, 255, 0.22)' : 'none'
              }}
            >
              <IconComponent size={14} color={isActive ? '#35D8FF' : '#9AA5B8'} />
              <span>{item.label}</span>
              {item.badge > 0 && (
                <span
                  style={{
                    background: '#FF3B6B',
                    color: '#FFFFFF',
                    fontSize: '0.62rem',
                    fontWeight: 900,
                    borderRadius: 10,
                    padding: '1px 6px',
                    marginLeft: 2,
                    boxShadow: '0 0 6px #FF3B6B'
                  }}
                >
                  {item.badge}
                </span>
              )}

              {/* Active Indicator Line */}
              {isActive && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: -5,
                    left: '25%',
                    right: '25%',
                    height: 2,
                    background: '#35D8FF',
                    borderRadius: '2px 2px 0 0',
                    boxShadow: '0 0 8px #35D8FF'
                  }}
                />
              )}
            </button>
          );
        })}
      </nav>

      {/* Right: Live Status, Search, Refresh, Alerts Bell, Profile Avatar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
        {/* Quick Search */}
        <div style={{ position: 'relative', width: 140 }} className="desktop-nav">
          <Search size={13} color="#5C677D" style={{ position: 'absolute', left: 9, top: 10 }} />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="command-input"
            style={{
              padding: '6px 8px 6px 28px',
              fontSize: '0.74rem',
              borderRadius: 6,
              height: 32
            }}
          />
        </div>

        {/* Live System Status Pill */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: 'rgba(57, 217, 138, 0.12)',
            border: '1px solid rgba(57, 217, 138, 0.35)',
            padding: '4px 9px',
            borderRadius: 6,
            fontSize: '0.7rem',
            fontWeight: 800,
            color: '#39D98A',
            fontFamily: 'Space Grotesk, sans-serif'
          }}
        >
          <span className="live-indicator-dot" />
          <span>LIVE</span>
        </div>

        {/* Refresh Button with Spin Animation */}
        <button
          onClick={onRefreshData}
          disabled={isRefreshing}
          title="Refresh All Telemetry"
          style={{
            background: 'rgba(16, 21, 33, 0.8)',
            border: '1px solid rgba(120, 140, 180, 0.25)',
            borderRadius: 8,
            width: 34,
            height: 34,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#9AA5B8',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          <RefreshCw
            size={14}
            color="#35D8FF"
            style={{ animation: isRefreshing ? 'spin 1s linear infinite' : 'none' }}
          />
        </button>

        {/* Notification Bell with Badge */}
        <button
          onClick={onOpenAlerts}
          title="Open Emergency Alerts"
          style={{
            background: 'rgba(16, 21, 33, 0.8)',
            border: '1px solid rgba(120, 140, 180, 0.25)',
            borderRadius: 8,
            width: 34,
            height: 34,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#9AA5B8',
            cursor: 'pointer',
            position: 'relative',
            transition: 'all 0.15s ease'
          }}
        >
          <BellRing size={15} color="#FF9D3D" />
          {unreadAlertCount > 0 && (
            <span
              style={{
                position: 'absolute',
                top: 4,
                right: 4,
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: '#FF3B6B',
                boxShadow: '0 0 8px #FF3B6B'
              }}
            />
          )}
        </button>

        {/* User Profile Avatar */}
        <button
          onClick={onOpenProfile}
          title="User Profile & Settings"
          style={{
            background: 'rgba(16, 21, 33, 0.8)',
            border: '1px solid rgba(120, 140, 180, 0.25)',
            borderRadius: 8,
            padding: '4px 8px',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            color: '#F4F6FB',
            cursor: 'pointer'
          }}
        >
          <img
            src="/images/avatars/responder-avatar.jpg"
            alt="User Avatar"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
            style={{
              width: 24,
              height: 24,
              borderRadius: '50%',
              objectFit: 'cover',
              border: '1px solid rgba(53, 216, 255, 0.5)'
            }}
          />
          <span style={{ fontSize: '0.74rem', fontWeight: 600, maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {currentUser?.name || 'Lee Montaria'}
          </span>
        </button>

        {/* Dedicated Login / Switch Portal Button */}
        <button
          onClick={() => onSelectSection('login')}
          title="Access Login Portal / Switch Account"
          style={{
            background: activeSection === 'login' ? 'linear-gradient(135deg, rgba(139, 108, 255, 0.25), rgba(255, 77, 184, 0.25))' : 'rgba(16, 21, 33, 0.8)',
            border: `1px solid ${activeSection === 'login' ? '#FF4DB8' : 'rgba(120, 140, 180, 0.25)'}`,
            borderRadius: 8,
            padding: '5px 10px',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            color: activeSection === 'login' ? '#FF4DB8' : '#CBD5E1',
            cursor: 'pointer',
            fontSize: '0.74rem',
            fontWeight: 700,
            fontFamily: 'Space Grotesk, sans-serif',
            transition: 'all 0.15s ease'
          }}
          onMouseOver={(e) => { e.currentTarget.style.borderColor = '#35D8FF'; e.currentTarget.style.color = '#35D8FF'; }}
          onMouseOut={(e) => { 
            e.currentTarget.style.borderColor = activeSection === 'login' ? '#FF4DB8' : 'rgba(120, 140, 180, 0.25)';
            e.currentTarget.style.color = activeSection === 'login' ? '#FF4DB8' : '#CBD5E1';
          }}
        >
          <Lock size={13} color="#35D8FF" />
          <span>Login</span>
        </button>
      </div>
    </header>
  );
}

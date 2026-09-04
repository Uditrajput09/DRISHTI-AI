import React from 'react';
import { 
  ShieldAlert, 
  Map, 
  ShieldCheck, 
  TrendingUp, 
  Radio, 
  BellRing, 
  Smartphone, 
  User, 
  Eye, 
  RefreshCw 
} from 'lucide-react';
import StatusIndicator from './StatusIndicator';

export default function TopNavigation({
  activeSection = 'gis',
  onSelectSection,
  unreadAlertCount = 3,
  onOpenAlerts,
  onOpenProfile,
  currentUser,
  onRefreshData,
  isRefreshing
}) {
  const navItems = [
    { id: 'gis', label: 'GIS Command', icon: Map },
    { id: 'risk', label: 'Risk Intelligence', icon: ShieldAlert },
    { id: 'forecast', label: 'Forecast', icon: TrendingUp },
    { id: 'incidents', label: 'Incidents', icon: Radio },
    { id: 'alerts', label: 'Alerts', icon: BellRing, badge: unreadAlertCount },
    { id: 'reports', label: 'Field Reports', icon: Smartphone }
  ];

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        height: 64,
        background: 'rgba(7, 10, 16, 0.95)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(120, 140, 180, 0.22)',
        padding: '0 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 4px 24px rgba(0, 0, 0, 0.6)'
      }}
    >
      {/* Brand & Regional Identification */}
      <div
        onClick={() => onSelectSection('gis')}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          cursor: 'pointer',
          userSelect: 'none'
        }}
      >
        {/* Shield / Eye minimal logo */}
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: 10,
            background: 'linear-gradient(135deg, rgba(53, 216, 255, 0.2), rgba(139, 108, 255, 0.2))',
            border: '1px solid rgba(53, 216, 255, 0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 16px rgba(53, 216, 255, 0.3)'
          }}
        >
          <Eye size={20} color="#35D8FF" />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span
              style={{
                fontSize: '1.15rem',
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
                background: 'rgba(53, 216, 255, 0.1)',
                border: '1px solid rgba(53, 216, 255, 0.3)',
                padding: '1px 6px',
                borderRadius: 4,
                fontWeight: 800,
                letterSpacing: '0.06em'
              }}
            >
              NER • INDIA
            </span>
          </div>
          <span style={{ fontSize: '0.66rem', color: '#9AA5B8', letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 600 }}>
            AI Early Warning & Risk Intelligence
          </span>
        </div>
      </div>

      {/* Desktop Navigation Links */}
      <nav style={{ display: 'flex', alignItems: 'center', gap: 6 }} className="desktop-nav">
        {navItems.map(item => {
          const isActive = activeSection === item.id;
          const IconComponent = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onSelectSection(item.id)}
              style={{
                background: isActive ? 'rgba(53, 216, 255, 0.12)' : 'transparent',
                color: isActive ? '#35D8FF' : '#9AA5B8',
                border: `1px solid ${isActive ? 'rgba(53, 216, 255, 0.45)' : 'transparent'}`,
                borderRadius: 8,
                padding: '7px 12px',
                fontSize: '0.78rem',
                fontWeight: 700,
                fontFamily: 'Space Grotesk, sans-serif',
                display: 'flex',
                alignItems: 'center',
                gap: 7,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                position: 'relative'
              }}
            >
              <IconComponent size={15} color={isActive ? '#35D8FF' : '#9AA5B8'} />
              <span>{item.label}</span>
              {item.badge > 0 && (
                <span
                  style={{
                    background: '#FF3B6B',
                    color: '#FFFFFF',
                    fontSize: '0.64rem',
                    fontWeight: 900,
                    borderRadius: 10,
                    padding: '1px 6px',
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

      {/* Top-Right: Live System Status, Refresh, Alerts Bell, Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* Live System Status Indicator */}
        <StatusIndicator isOnline={navigator.onLine} />

        {/* Notification Bell */}
        <button
          onClick={onOpenAlerts}
          title="Open Emergency Alerts"
          style={{
            background: 'rgba(16, 21, 33, 0.8)',
            border: '1px solid rgba(120, 140, 180, 0.25)',
            borderRadius: 8,
            width: 36,
            height: 36,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#9AA5B8',
            cursor: 'pointer',
            position: 'relative',
            transition: 'all 0.15s ease'
          }}
        >
          <BellRing size={16} color="#FF9D3D" />
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

        {/* User Profile Avatar / Trigger */}
        <button
          onClick={onOpenProfile}
          title="User Profile & Settings"
          style={{
            background: 'rgba(16, 21, 33, 0.8)',
            border: '1px solid rgba(120, 140, 180, 0.25)',
            borderRadius: 8,
            padding: '5px 10px',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            color: '#F4F6FB',
            cursor: 'pointer'
          }}
        >
          <div
            style={{
              width: 24,
              height: 24,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #35D8FF, #8B6CFF)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.72rem',
              fontWeight: 800,
              color: '#070A10'
            }}
          >
            {currentUser?.name ? currentUser.name[0].toUpperCase() : 'O'}
          </div>
          <span style={{ fontSize: '0.76rem', fontWeight: 600, maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {currentUser?.name || 'Official'}
          </span>
        </button>
      </div>
    </header>
  );
}

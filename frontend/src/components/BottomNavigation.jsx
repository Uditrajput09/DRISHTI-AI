import React from 'react';
import { 
  Map, 
  ShieldAlert, 
  TrendingUp, 
  Radio, 
  BellRing, 
  Smartphone, 
  User 
} from 'lucide-react';

export default function BottomNavigation({
  activeSection = 'gis',
  onSelectSection,
  unreadAlertCount = 0
}) {
  const tabs = [
    { id: 'gis', label: 'GIS', icon: Map },
    { id: 'risk', label: 'Risk', icon: ShieldAlert },
    { id: 'forecast', label: 'Forecast', icon: TrendingUp },
    { id: 'alerts', label: 'Alerts', icon: BellRing, badge: unreadAlertCount },
    { id: 'reports', label: 'Reports', icon: Smartphone },
    { id: 'profile', label: 'Profile', icon: User }
  ];

  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: 62,
        background: 'rgba(7, 10, 16, 0.96)',
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(120, 140, 180, 0.22)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        zIndex: 1000,
        boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.6)'
      }}
      className="mobile-bottom-nav"
    >
      {tabs.map(tab => {
        const isActive = activeSection === tab.id;
        const IconComponent = tab.icon;
        return (
          <button
            key={tab.id}
            onClick={() => onSelectSection(tab.id)}
            style={{
              background: 'transparent',
              border: 'none',
              color: isActive ? '#35D8FF' : '#5C677D',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 3,
              cursor: 'pointer',
              position: 'relative',
              padding: '6px 10px'
            }}
          >
            <IconComponent size={18} color={isActive ? '#35D8FF' : '#5C677D'} />
            <span
              style={{
                fontSize: '0.64rem',
                fontWeight: isActive ? 800 : 500,
                fontFamily: 'Space Grotesk, sans-serif'
              }}
            >
              {tab.label}
            </span>
            {tab.badge > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: 2,
                  right: 8,
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: '#FF3B6B'
                }}
              />
            )}
          </button>
        );
      })}
    </nav>
  );
}

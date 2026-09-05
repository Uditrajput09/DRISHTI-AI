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
  unreadAlertCount = 6
}) {
  // Exact 7 tabs matching Screen 9: GIS, Risk, Forecast, Incidents, Alerts, Reports, Profile
  const tabs = [
    { id: 'gis', label: 'GIS', icon: Map },
    { id: 'risk', label: 'Risk', icon: ShieldAlert },
    { id: 'forecast', label: 'Forecast', icon: TrendingUp },
    { id: 'incidents', label: 'Incidents', icon: Radio },
    { id: 'alerts', label: 'Alerts', icon: BellRing, badge: unreadAlertCount },
    { id: 'reports', label: 'Reports', icon: Smartphone },
    { id: 'profile', label: 'Profile', icon: User }
  ];

  return (
    <nav
      className="mobile-bottom-nav"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: 60,
        background: 'rgba(7, 10, 16, 0.96)',
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(120, 140, 180, 0.22)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        zIndex: 1000,
        boxShadow: '0 -4px 24px rgba(0, 0, 0, 0.75)'
      }}
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
              padding: '6px 0',
              flex: 1
            }}
          >
            <IconComponent
              size={18}
              color={isActive ? '#35D8FF' : '#5C677D'}
            />
            <span
              style={{
                fontSize: '0.64rem',
                fontWeight: isActive ? 800 : 500,
                fontFamily: 'Space Grotesk, sans-serif'
              }}
            >
              {tab.label}
            </span>

            {/* Red Notification Badge */}
            {tab.badge > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: 2,
                  right: '25%',
                  minWidth: 14,
                  height: 14,
                  borderRadius: 10,
                  background: '#FF3B6B',
                  color: '#FFFFFF',
                  fontSize: '0.55rem',
                  fontWeight: 900,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0 3px',
                  boxShadow: '0 0 6px #FF3B6B'
                }}
              >
                {tab.badge}
              </span>
            )}

            {/* Cyan glowing indicator line matching Screen 9 */}
            {isActive && (
              <div
                style={{
                  position: 'absolute',
                  bottom: 0,
                  width: 20,
                  height: 2,
                  borderRadius: '2px 2px 0 0',
                  background: '#35D8FF',
                  boxShadow: '0 0 8px #35D8FF'
                }}
              />
            )}
          </button>
        );
      })}
    </nav>
  );
}

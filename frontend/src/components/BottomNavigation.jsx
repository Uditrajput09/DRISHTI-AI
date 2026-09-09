import React from 'react';
import { 
  Map, 
  ShieldAlert, 
  TrendingUp, 
  Radio, 
  BellRing, 
  Smartphone, 
  User,
  Compass
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
    { id: 'incidents', label: 'Incidents', icon: Radio },
    { id: 'alerts', label: 'Alerts', icon: BellRing, badge: unreadAlertCount },
    { id: 'reports', label: 'Reports', icon: Smartphone },
    { id: 'evacuation', label: 'Evac', icon: Compass },
    { id: 'profile', label: 'Profile', icon: User }
  ];

  return (
    <nav
      className="mobile-bottom-nav"
      role="tablist"
      aria-label="Mobile Navigation"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: 58,
        backgroundColor: 'rgba(16, 16, 16, 0.96)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid var(--border-primary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        zIndex: 900,
        boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.5)',
        padding: '0 4px',
        boxSizing: 'border-box'
      }}
    >
      {tabs.map(tab => {
        const isActive = activeSection === tab.id;
        const IconComponent = tab.icon;

        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            aria-label={tab.label}
            onClick={() => onSelectSection && onSelectSection(tab.id)}
            style={{
              background: 'transparent',
              border: 'none',
              color: isActive ? (tab.id === 'evacuation' ? 'var(--risk-critical)' : 'var(--brand-primary)') : 'var(--text-muted)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 3,
              cursor: 'pointer',
              position: 'relative',
              padding: '6px 0',
              flex: 1,
              height: '100%',
              transition: 'color var(--transition-fast)'
            }}
          >
            <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
              <IconComponent
                size={16}
                color={isActive ? (tab.id === 'evacuation' ? 'var(--risk-critical)' : 'var(--brand-primary)') : 'var(--text-muted)'}
                style={{ transition: 'transform var(--transition-fast)' }}
              />

              {/* Notification Badge pinned to Icon */}
              {tab.badge > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: -4,
                    right: -7,
                    minWidth: 13,
                    height: 13,
                    borderRadius: 'var(--radius-pill)',
                    backgroundColor: 'var(--risk-critical)',
                    color: '#FFFFFF',
                    fontSize: '0.55rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0 3px',
                    fontFamily: 'var(--font-mono)',
                    boxShadow: '0 0 6px rgba(239, 68, 68, 0.8)',
                    lineHeight: 1
                  }}
                >
                  {tab.badge}
                </span>
              )}
            </div>

            <span
              style={{
                fontSize: '0.60rem',
                fontWeight: isActive ? 600 : 500,
                letterSpacing: '-0.01em',
                fontFamily: 'var(--font-sans)',
                lineHeight: 1
              }}
            >
              {tab.label}
            </span>

            {/* Active Indicator Line */}
            {isActive && (
              <div
                style={{
                  position: 'absolute',
                  bottom: 0,
                  width: 20,
                  height: 2.5,
                  borderRadius: '2px 2px 0 0',
                  backgroundColor: tab.id === 'evacuation' ? 'var(--risk-critical)' : 'var(--brand-primary)',
                  boxShadow: `0 0 8px ${tab.id === 'evacuation' ? 'rgba(239, 68, 68, 0.6)' : 'var(--brand-glow)'}`
                }}
              />
            )}
          </button>
        );
      })}
    </nav>
  );
}

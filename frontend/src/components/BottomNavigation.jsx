import React from 'react';
import { 
  Map, 
  ShieldAlert, 
  PlusCircle, 
  Compass
} from 'lucide-react';

export default function BottomNavigation({
  activeSection = 'gis',
  onSelectSection,
  unreadAlertCount = 0
}) {
  const tabs = [
    { 
      id: 'gis', 
      label: 'Map', 
      icon: Map,
      isActive: activeSection === 'gis' 
    },
    { 
      id: 'risk', 
      label: 'Hazards', 
      icon: ShieldAlert,
      isActive: activeSection === 'risk' || activeSection === 'incidents'
    },
    { 
      id: 'reports', 
      label: 'Report', 
      icon: PlusCircle,
      isActive: activeSection === 'reports'
    },
    { 
      id: 'evacuation', 
      label: 'Evac', 
      icon: Compass,
      isActive: activeSection === 'evacuation'
    }
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
        height: 64,
        backgroundColor: 'rgba(16, 16, 16, 0.98)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid var(--border-primary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        zIndex: 900,
        boxShadow: '0 -2px 12px rgba(0, 0, 0, 0.4)',
        padding: '0 8px',
        boxSizing: 'border-box'
      }}
    >
      {tabs.map(tab => {
        const isActive = tab.isActive;
        const IconComponent = tab.icon;
        const isEvac = tab.id === 'evacuation';
        const activeColor = isEvac ? 'var(--risk-critical)' : 'var(--brand-primary)';

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
              color: isActive ? activeColor : 'var(--text-secondary)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
              cursor: 'pointer',
              position: 'relative',
              padding: '6px 0',
              flex: 1,
              height: 52,
              minWidth: 48,
              minHeight: 48,
              transition: 'color var(--transition-fast)'
            }}
          >
            <div 
              style={{ 
                position: 'relative', 
                display: 'inline-flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                padding: '4px 14px',
                borderRadius: 'var(--radius-pill)',
                backgroundColor: isActive ? (isEvac ? 'var(--risk-critical-bg)' : 'var(--brand-tint)') : 'transparent',
                transition: 'background-color var(--transition-fast)'
              }}
            >
              <IconComponent
                size={20}
                color={isActive ? activeColor : 'var(--text-secondary)'}
                strokeWidth={isActive ? 2.3 : 1.8}
              />
            </div>

            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: isActive ? 600 : 500,
                letterSpacing: '-0.01em',
                lineHeight: 1.1,
                color: isActive ? activeColor : 'var(--text-secondary)'
              }}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}


import React from 'react';
import { 
  Map, 
  ShieldAlert, 
  TrendingUp, 
  Radio, 
  BellRing, 
  Smartphone, 
  User, 
  Eye, 
  Bot,
  Lock
} from 'lucide-react';

export default function SidebarNavigation({
  activeSection = 'gis',
  onSelectSection,
  unreadAlertCount = 6,
  onOpenChatbot
}) {
  const navItems = [
    { id: 'gis', label: 'GIS Command', icon: Map },
    { id: 'risk', label: 'Risk Intelligence', icon: ShieldAlert },
    { id: 'forecast', label: 'Forecast', icon: TrendingUp },
    { id: 'incidents', label: 'Incidents', icon: Radio },
    { id: 'alerts', label: 'Alerts', icon: BellRing, badge: unreadAlertCount },
    { id: 'reports', label: 'Reports', icon: Smartphone },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'login', label: 'Login Portal', icon: Lock }
  ];

  return (
    <aside
      className="desktop-sidebar"
      style={{
        width: 240,
        backgroundColor: 'var(--bg-surface-elevated)',
        borderRight: '1px solid var(--border-command)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '20px 14px',
        flexShrink: 0,
        height: '100vh',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        boxShadow: '4px 0 24px rgba(0, 0, 0, 0.5)'
      }}
    >
      {/* Top: Branding & Nav Links */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* DRISHTI AI Logo Header */}
        <div
          onClick={() => onSelectSection('gis')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            cursor: 'pointer',
            padding: '4px 8px'
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 999,
              background: 'rgba(200, 150, 62, 0.15)',
              border: '1px solid var(--color-copper)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 14px rgba(200, 150, 62, 0.3)',
              flexShrink: 0
            }}
          >
            <Eye size={18} color="var(--color-copper)" />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span
              style={{
                fontSize: '1.25rem',
                fontWeight: 400,
                fontStyle: 'italic',
                letterSpacing: '-0.02em',
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-serif)',
                lineHeight: 1.1
              }}
            >
              DRISHTI <span style={{ color: 'var(--color-copper)', fontStyle: 'normal' }}>AI</span>
            </span>
            <span
              style={{
                fontSize: '0.62rem',
                color: 'var(--text-muted)',
                letterSpacing: '0.04em',
                marginTop: 2
              }}
            >
              East Khasi Hills • SDMA
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {navItems.map((item) => {
            const isActive = activeSection === item.id;
            const IconComponent = item.icon;

            return (
              <button
                key={item.id}
                onClick={() => onSelectSection(item.id)}
                style={{
                  background: isActive
                    ? 'rgba(200, 150, 62, 0.12)'
                    : 'transparent',
                  border: `1px solid ${isActive ? 'rgba(200, 150, 62, 0.35)' : 'transparent'}`,
                  borderRadius: 8,
                  padding: '9px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  textAlign: 'left'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <IconComponent
                    size={16}
                    color={isActive ? 'var(--color-copper)' : 'var(--text-secondary)'}
                  />
                  <span
                    style={{
                      fontSize: '0.82rem',
                      fontWeight: isActive ? 600 : 500,
                      color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                      fontFamily: 'var(--font-sans)',
                      letterSpacing: '0.01em'
                    }}
                  >
                    {item.label}
                  </span>
                </div>

                {item.badge > 0 && (
                  <span
                    style={{
                      background: 'rgba(200, 150, 62, 0.2)',
                      border: '1px solid rgba(200, 150, 62, 0.4)',
                      color: 'var(--color-copper)',
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      borderRadius: 999,
                      padding: '1px 6px',
                      fontFamily: 'monospace'
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom: AI Assistant Launcher Capsule */}
      <div style={{ paddingTop: 16, borderTop: '1px solid var(--border-command)' }}>
        <button
          onClick={onOpenChatbot}
          style={{
            width: '100%',
            padding: '10px 14px',
            borderRadius: 10,
            border: '1px solid rgba(200, 150, 62, 0.35)',
            background: 'rgba(200, 150, 62, 0.08)',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            cursor: 'pointer',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)'
          }}
        >
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              background: 'var(--gradient-gilded)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Bot size={15} color="#08080A" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
            <span
              style={{
                fontSize: '0.78rem',
                fontWeight: 600,
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-sans)'
              }}
            >
              AI Assistant
            </span>
            <span style={{ fontSize: '0.64rem', color: 'var(--text-muted)' }}>
              Ask DRISHTI AI
            </span>
          </div>
        </button>
      </div>
    </aside>
  );
}

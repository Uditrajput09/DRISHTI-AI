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
        backgroundColor: '#070A10',
        borderRight: '1px solid rgba(120, 140, 180, 0.18)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '20px 14px',
        flexShrink: 0,
        height: '100vh',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        boxShadow: '4px 0 24px rgba(0, 0, 0, 0.4)'
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
              width: 38,
              height: 38,
              borderRadius: 10,
              background: 'linear-gradient(135deg, rgba(53, 216, 255, 0.25), rgba(139, 108, 255, 0.25))',
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

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span
              style={{
                fontSize: '1.15rem',
                fontWeight: 900,
                letterSpacing: '0.04em',
                color: '#FFFFFF',
                fontFamily: 'Space Grotesk, sans-serif',
                lineHeight: 1.1
              }}
            >
              DRISHTI <span style={{ color: '#35D8FF' }}>AI</span>
            </span>
            <span
              style={{
                fontSize: '0.62rem',
                color: '#9AA5B8',
                letterSpacing: '0.04em',
                marginTop: 2
              }}
            >
              East Khasi Hills, Meghalaya
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
                    ? 'linear-gradient(90deg, rgba(139, 108, 255, 0.18), rgba(53, 216, 255, 0.08))'
                    : 'transparent',
                  border: `1px solid ${isActive ? 'rgba(139, 108, 255, 0.5)' : 'transparent'}`,
                  borderRadius: 8,
                  padding: '10px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  textAlign: 'left'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <IconComponent
                    size={16}
                    color={isActive ? '#35D8FF' : '#9AA5B8'}
                  />
                  <span
                    style={{
                      fontSize: '0.82rem',
                      fontWeight: isActive ? 800 : 500,
                      color: isActive ? '#FFFFFF' : '#9AA5B8',
                      fontFamily: 'Space Grotesk, sans-serif',
                      letterSpacing: '0.02em'
                    }}
                  >
                    {item.label}
                  </span>
                </div>

                {item.badge > 0 && (
                  <span
                    style={{
                      background: '#FF3B6B',
                      color: '#FFFFFF',
                      fontSize: '0.65rem',
                      fontWeight: 900,
                      borderRadius: 10,
                      padding: '1px 6px',
                      fontFamily: 'Space Grotesk, sans-serif'
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
      <div style={{ paddingTop: 16, borderTop: '1px solid rgba(120, 140, 180, 0.15)' }}>
        <button
          onClick={onOpenChatbot}
          className="command-panel-glass"
          style={{
            width: '100%',
            padding: '10px 14px',
            borderRadius: 10,
            border: '1px solid rgba(139, 108, 255, 0.4)',
            background: 'linear-gradient(135deg, rgba(139, 108, 255, 0.15), rgba(53, 216, 255, 0.1))',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            cursor: 'pointer',
            boxShadow: '0 4px 16px rgba(139, 108, 255, 0.2)'
          }}
        >
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #8B6CFF, #35D8FF)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Bot size={16} color="#FFFFFF" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
            <span
              style={{
                fontSize: '0.78rem',
                fontWeight: 800,
                color: '#FFFFFF',
                fontFamily: 'Space Grotesk, sans-serif'
              }}
            >
              AI Assistant
            </span>
            <span style={{ fontSize: '0.64rem', color: '#9AA5B8' }}>
              Ask DRISHTI AI
            </span>
          </div>
        </button>
      </div>
    </aside>
  );
}

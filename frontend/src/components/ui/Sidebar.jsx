import React, { useState } from 'react';
import {
  Map,
  Activity,
  CloudRain,
  AlertTriangle,
  Bell,
  FileText,
  Zap,
  Home,
  User,
  Settings,
  HelpCircle,
  Shield,
  ChevronDown,
  Menu,
  X,
  Radio,
  Compass,
  Download
} from 'lucide-react';
import { Avatar } from './Avatar';

/**
 * Enterprise Navigation Sidebar
 * Strictly adheres to 240px desktop rail, #0D0D0D background, #252525 border,
 * grouped sections (COMMAND CENTER, OPERATIONS, SYSTEM), and active blue pill state.
 */
export function Sidebar({
  activeSection = 'gis',
  onSelectSection,
  unreadAlertCount = 0,
  currentUser,
  isCollapsed = false,
  onToggleCollapse,
  isMobileOpen = false,
  onCloseMobile,
  onOpenHelp,
  style = {},
  className = ''
}) {
  const groups = [
    {
      title: 'COMMAND CENTER',
      items: [
        { id: 'gis', label: 'GIS Command Center', icon: Map, badge: null },
        { id: 'risk', label: 'Risk Intelligence', icon: Activity, badge: null },
        { id: 'forecast', label: '48H Forecast', icon: CloudRain, badge: null },
        { id: 'incidents', label: 'Live Incidents', icon: AlertTriangle, badge: null },
        {
          id: 'alerts',
          label: 'Alerts Center',
          icon: Bell,
          badge: unreadAlertCount > 0 ? unreadAlertCount : null,
          badgeVariant: 'critical'
        }
      ]
    },
    {
      title: 'OPERATIONS',
      items: [
        { id: 'reports', label: 'Field Reports', icon: FileText, badge: null },
        { id: 'simulation', label: 'Cloudburst Simulation', icon: Zap, badge: 'SIM' },
        { id: 'evacuation', label: 'Tourist & Evacuation Guide', icon: Compass, badge: 'SOS', badgeVariant: 'critical' },
        { id: 'offline-maps', label: 'Offline Maps & GPS Nav', icon: Download, badge: 'OFFLINE', badgeVariant: 'safe' }
      ]
    },
    {
      title: 'SYSTEM',
      items: [
        { id: 'profile', label: 'Profile & Emergency', icon: User, badge: null },
        { id: 'login', label: 'Operator Portal / Exit', icon: Shield, badge: null },
        { id: 'help', label: 'Help & Shortcuts', icon: HelpCircle, badge: null }
      ]
    }
  ];

  const handleItemClick = (id) => {
    if (id === 'help') {
      onOpenHelp && onOpenHelp();
    } else if (id === 'shelters' || id === 'evacuation') {
      onSelectSection && onSelectSection('evacuation');
    } else if (id === 'settings') {
      onSelectSection && onSelectSection('profile');
    } else {
      onSelectSection && onSelectSection(id);
    }
    if (isMobileOpen && onCloseMobile) {
      onCloseMobile();
    }
  };

  const userName = currentUser?.name || 'SDMA Commander';
  const userRole = currentUser?.role || 'Disaster Response Officer';

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
            zIndex: 1000
          }}
          className="mobile-sidebar-backdrop animate-fade-in"
        />
      )}

      <aside
        style={{
          width: isMobileOpen ? 'min(280px, 80vw)' : (isCollapsed ? 'var(--sidebar-collapsed-width)' : 'var(--sidebar-width)'),
          height: '100vh',
          backgroundColor: '#0D0D0D',
          borderRight: '1px solid var(--border-primary)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          flexShrink: 0,
          position: isMobileOpen ? 'fixed' : 'sticky',
          top: 0,
          left: 0,
          zIndex: isMobileOpen ? 1010 : 'var(--z-sidebar)',
          boxShadow: isMobileOpen ? '4px 0 32px rgba(0, 0, 0, 0.9)' : 'none',
          transition: 'width var(--transition-normal), transform var(--transition-normal)',
          overflowY: 'auto',
          overflowX: 'hidden',
          ...style
        }}
        className={`ui-sidebar ${isCollapsed ? 'ui-sidebar-collapsed' : ''} ${isMobileOpen ? 'animate-slide-in-left' : ''} ${className}`}
      >
        {/* Top Header: Brand & User Pill */}
        <div style={{ padding: '16px 14px 12px 14px', borderBottom: '1px solid var(--border-primary)' }}>
          {/* Brand Logo Row */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: isCollapsed ? 'center' : 'space-between',
              marginBottom: isCollapsed ? 8 : 14
            }}
          >
            <div
              onClick={() => handleItemClick('gis')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                cursor: 'pointer',
                userSelect: 'none'
              }}
            >
              <img
                src="/logo.jpg"
                alt="DRISHTI-AI Logo"
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 'var(--radius-sm, 6px)',
                  objectFit: 'cover',
                  border: '1px solid rgba(79, 111, 255, 0.35)',
                  flexShrink: 0,
                  boxShadow: '0 0 10px rgba(79, 111, 255, 0.25)'
                }}
              />
              {!isCollapsed && (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span
                    style={{
                      fontSize: 14,
                      fontWeight: 700,
                      letterSpacing: '-0.02em',
                      color: 'var(--text-primary)',
                      lineHeight: 1.1
                    }}
                  >
                    DRISHTI-AI
                  </span>
                  <span
                    style={{
                      fontSize: 10,
                      color: 'var(--text-muted)',
                      letterSpacing: '0.04em',
                      textTransform: 'uppercase'
                    }}
                  >
                    EOC Command
                  </span>
                </div>
              )}
            </div>

            {/* Mobile close button */}
            {isMobileOpen && (
              <button
                type="button"
                onClick={onCloseMobile}
                style={{
                  color: 'var(--text-muted)',
                  padding: '4px 6px',
                  backgroundColor: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-secondary)',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                aria-label="Close navigation"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* User Profile Pill matching Reference Image */}
          {!isCollapsed && (
            <div
              onClick={() => handleItemClick('profile')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '7px 10px',
                borderRadius: 'var(--radius-input)',
                backgroundColor: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-secondary)',
                cursor: 'pointer',
                transition: 'border-color var(--transition-fast)'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--border-hover)')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-secondary)')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                <Avatar name={userName} size={24} status="online" />
                <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 500,
                      color: 'var(--text-primary)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}
                  >
                    {userName}
                  </span>
                  <span
                    style={{
                      fontSize: 10,
                      color: 'var(--text-muted)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}
                  >
                    {userRole}
                  </span>
                </div>
              </div>
              <ChevronDown size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
            </div>
          )}
        </div>

        {/* Navigation Sections */}
        <div style={{ flex: 1, padding: '12px 8px', overflowY: 'auto' }}>
          {groups.map((group, gIdx) => (
            <div key={group.title} style={{ marginBottom: 18 }}>
              {!isCollapsed && (
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 600,
                    color: 'var(--text-muted)',
                    letterSpacing: '0.08em',
                    padding: '4px 10px 6px 10px',
                    textTransform: 'uppercase'
                  }}
                >
                  {group.title}
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {group.items.map((item) => {
                  const isActive = activeSection === item.id;
                  const Icon = item.icon;

                  return (
                    <button
                      key={item.id}
                      onClick={() => handleItemClick(item.id)}
                      title={isCollapsed ? item.label : undefined}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: isCollapsed ? 'center' : 'space-between',
                        width: '100%',
                        padding: isCollapsed ? '9px 0' : '8px 12px',
                        borderRadius: 'var(--radius-input)',
                        backgroundColor: isActive ? 'rgba(79, 111, 255, 0.10)' : 'transparent',
                        border: isActive ? '1px solid rgba(79, 111, 255, 0.35)' : '1px solid transparent',
                        color: isActive ? '#FFFFFF' : 'var(--text-secondary)',
                        fontFamily: 'var(--font-primary)',
                        fontSize: 13,
                        fontWeight: isActive ? 500 : 400,
                        cursor: 'pointer',
                        transition: 'all var(--transition-fast)',
                        textAlign: 'left'
                      }}
                      className={`ui-sidebar-item ${isActive ? 'ui-sidebar-item-active' : ''}`}
                      onMouseEnter={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.04)';
                          e.currentTarget.style.color = 'var(--text-primary)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.color = 'var(--text-secondary)';
                        }
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Icon
                          size={17}
                          style={{
                            color: isActive ? 'var(--brand-primary)' : 'inherit',
                            flexShrink: 0
                          }}
                        />
                        {!isCollapsed && <span>{item.label}</span>}
                      </div>

                      {!isCollapsed && item.badge && (
                        <span
                          className="font-mono"
                          style={{
                            fontSize: 10,
                            fontWeight: 600,
                            padding: '1px 6px',
                            borderRadius: 'var(--radius-pill)',
                            backgroundColor:
                              item.badgeVariant === 'critical'
                                ? 'var(--risk-critical-bg)'
                                : 'var(--bg-surface-elevated)',
                            color:
                              item.badgeVariant === 'critical'
                                ? 'var(--risk-critical)'
                                : 'var(--text-secondary)',
                            border: `1px solid ${
                              item.badgeVariant === 'critical'
                                ? 'var(--risk-critical-border)'
                                : 'var(--border-secondary)'
                            }`
                          }}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Status Indicator Pill */}
        <div
          style={{
            padding: '12px 14px',
            borderTop: '1px solid var(--border-primary)',
            backgroundColor: '#0A0A0A'
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: isCollapsed ? 'center' : 'space-between',
              gap: 8,
              padding: '6px 10px',
              borderRadius: 'var(--radius-pill)',
              backgroundColor: 'rgba(49, 183, 122, 0.08)',
              border: '1px solid rgba(49, 183, 122, 0.25)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  backgroundColor: 'var(--status-live)'
                }}
                className="animate-pulse-dot"
              />
              {!isCollapsed && (
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: 'var(--status-live)',
                    letterSpacing: '0.02em'
                  }}
                >
                  System Operational
                </span>
              )}
            </div>
            {!isCollapsed && (
              <span
                className="font-mono"
                style={{ fontSize: 10, color: 'var(--text-muted)' }}
              >
                v2.4
              </span>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;

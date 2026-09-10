import React, { useState } from 'react';
import {
  Menu,
  X,
  Search,
  RefreshCw,
  Sun,
  Moon,
  Bell,
  Sparkles,
  Command,
  Smartphone,
  ChevronRight,
  Compass,
  Network
} from 'lucide-react';
import { IconButton } from './Button';
import { Avatar } from './Avatar';
import { SearchInput } from './Input';

/**
 * Enterprise Top Navigation Bar
 * - Height: 60px
 * - Background: rgba(10, 10, 10, 0.94)
 * - Backdrop filter: blur(20px)
 * - Bottom border: 1px solid #252525
 * - Left: Dynamic breadcrumb / Section title
 * - Right: Global search, refresh, theme toggle, notifications, user avatar
 */
export function TopNavigation({
  activeSection = 'gis',
  breadcrumbs = [],
  currentUser,
  unreadAlertCount = 0,
  onRefreshData,
  isRefreshing = false,
  currentTheme = 'dark',
  onToggleTheme,
  onOpenAlerts,
  onOpenProfile,
  onOpenShortcuts,
  onOpenAndroidModal,
  onOpenEvacuation,
  onOpenDevGraph,
  onToggleSidebarMobile,
  isSidebarOpen = false,
  onSearch,
  onOpenAI,
  style = {},
  className = ''
}) {
  const [searchValue, setSearchValue] = useState('');

  const getSectionTitle = (section) => {
    switch (section) {
      case 'gis': return 'GIS Command Center';
      case 'risk': return 'Risk Intelligence';
      case 'forecast': return '48H Forecast';
      case 'incidents': return 'Live Incidents';
      case 'alerts': return 'Alerts Center';
      case 'reports': return 'Field Reports';
      case 'simulation': return 'Cloudburst Simulation';
      case 'evacuation': return 'Tourist & Evacuation Guide';
      case 'profile': return 'Profile & Settings';
      case 'devgraph': return 'Architecture Knowledge Graph';
      default: return 'Command Center';
    }
  };

  const defaultCrumbs = [
    'DRISHTI-AI',
    'East Khasi Hills',
    getSectionTitle(activeSection)
  ];

  const crumbs = breadcrumbs.length > 0 ? breadcrumbs : defaultCrumbs;

  const isSimulatorEmbed = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('mode') === 'mobile';

  return (
    <header
      style={{
        height: 'var(--header-height)',
        backgroundColor: 'rgba(10, 10, 10, 0.94)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border-primary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 14px',
        position: 'sticky',
        top: 0,
        zIndex: 'var(--z-header)',
        flexShrink: 0,
        ...style
      }}
      className={`ui-top-nav ${className}`}
    >
      {/* Left: Mobile hamburger + Breadcrumb path */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, flexShrink: 1 }}>
        {onToggleSidebarMobile && (
          <button
            type="button"
            onClick={onToggleSidebarMobile}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 32,
              height: 32,
              borderRadius: 'var(--radius-btn)',
              backgroundColor: isSidebarOpen ? 'var(--brand-tint)' : 'var(--bg-surface-elevated)',
              border: `1px solid ${isSidebarOpen ? 'var(--brand-primary)' : 'var(--border-secondary)'}`,
              color: isSidebarOpen ? 'var(--brand-primary)' : 'var(--text-primary)',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)',
              flexShrink: 0
            }}
            className="mobile-hamburger-btn"
            aria-label={isSidebarOpen ? "Close Navigation Menu" : "Toggle Navigation Menu"}
            title={isSidebarOpen ? "Close Menu" : "Open Menu"}
          >
            {isSidebarOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
        )}

        <nav aria-label="Breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0, overflow: 'hidden' }}>
          {crumbs.map((crumb, idx) => {
            const isLast = idx === crumbs.length - 1;
            return (
              <React.Fragment key={idx}>
                {idx > 0 && (
                  <span className={!isLast ? 'hidden-mobile' : ''} style={{ display: 'inline-flex', alignItems: 'center', flexShrink: 0 }}>
                    <ChevronRight size={12} style={{ color: 'var(--text-disabled)' }} />
                  </span>
                )}
                <span
                  className={!isLast ? 'hidden-mobile' : ''}
                  style={{
                    fontSize: 12,
                    fontWeight: isLast ? 600 : 400,
                    color: isLast ? 'var(--text-primary)' : 'var(--text-muted)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6
                  }}
                >
                  {idx === 0 && (
                    <img
                      src="/logo.jpg"
                      alt="DRISHTI-AI"
                      style={{
                        width: 16,
                        height: 16,
                        borderRadius: 3,
                        objectFit: 'cover',
                        flexShrink: 0
                      }}
                    />
                  )}
                  {crumb}
                </span>
              </React.Fragment>
            );
          })}
        </nav>
      </div>

      {/* Right: Search, Refresh, Shortcuts, Theme, Notifications, Avatar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
        {/* Compact Search Bar */}
        <div className="top-nav-search hidden-mobile" style={{ width: 180 }}>
          <SearchInput
            size="sm"
            placeholder="Search zones, IDs..."
            value={searchValue}
            onChange={(e) => {
              setSearchValue(e.target.value);
              onSearch && onSearch(e.target.value);
            }}
            onClear={() => {
              setSearchValue('');
              onSearch && onSearch('');
            }}
          />
        </div>

        {/* Live Refresh Button */}
        {onRefreshData && (
          <IconButton
            icon={RefreshCw}
            size="sm"
            onClick={onRefreshData}
            title="Refresh Telemetry Data"
            ariaLabel="Refresh"
            style={{
              animation: isRefreshing ? 'spin 1s linear infinite' : 'none'
            }}
          />
        )}

        {/* Tourist Emergency & Evacuation Guide Quick Action (Hidden on mobile where Evac is in Bottom Nav) */}
        {onOpenEvacuation && (
          <button
            type="button"
            onClick={onOpenEvacuation}
            className="hidden-mobile"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              height: 32,
              padding: '0 10px',
              borderRadius: 'var(--radius-btn)',
              backgroundColor: activeSection === 'evacuation' ? 'var(--risk-critical)' : 'rgba(239, 68, 68, 0.12)',
              border: `1px solid ${activeSection === 'evacuation' ? 'var(--risk-critical)' : 'rgba(239, 68, 68, 0.35)'}`,
              color: activeSection === 'evacuation' ? '#ffffff' : '#f87171',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all var(--transition-fast)'
            }}
            title="Tourist Emergency Guide & Evacuation Routes"
            aria-label="Tourist Evacuation Guide"
          >
            <Compass size={14} style={{ animation: activeSection === 'evacuation' ? 'spin 6s linear infinite' : 'none' }} />
            <span>Evac Guide</span>
          </button>
        )}

        {/* Developer Knowledge Graph Quick Action */}
        {onOpenDevGraph && (
          <button
            type="button"
            onClick={onOpenDevGraph}
            className="hidden-mobile"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              height: 32,
              padding: '0 10px',
              borderRadius: 'var(--radius-btn)',
              backgroundColor: activeSection === 'devgraph' ? 'rgba(56, 189, 248, 0.25)' : 'rgba(56, 189, 248, 0.12)',
              border: `1px solid ${activeSection === 'devgraph' ? '#38BDF8' : 'rgba(56, 189, 248, 0.35)'}`,
              color: '#38BDF8',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all var(--transition-fast)'
            }}
            title="Explore Architecture Knowledge Graph"
            aria-label="Dev Knowledge Graph"
          >
            <Network size={14} />
            <span>Dev Graph</span>
          </button>
        )}

        {/* AI Assistant Quick Trigger */}
        {onOpenAI && (
          <button
            onClick={onOpenAI}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              height: 32,
              padding: '0 10px',
              borderRadius: 'var(--radius-btn)',
              backgroundColor: 'rgba(79, 111, 255, 0.12)',
              border: '1px solid rgba(79, 111, 255, 0.35)',
              color: 'var(--brand-primary)',
              fontSize: 12,
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'background-color var(--transition-fast)'
            }}
            title="Open DRISHTI AI Assistant"
          >
            <Sparkles size={13} />
            <span className="hidden-mobile">Ask AI</span>
          </button>
        )}

        {/* Android APK Modal Trigger */}
        {onOpenAndroidModal && !isSimulatorEmbed && (
          <IconButton
            icon={Smartphone}
            size="sm"
            onClick={onOpenAndroidModal}
            title="Download DRISHTI Android App"
            ariaLabel="Android App"
          />
        )}

        {/* Keyboard Shortcuts Trigger (Cmd+K) */}
        {onOpenShortcuts && !isSimulatorEmbed && (
          <span className="hidden-mobile">
            <IconButton
              icon={Command}
              size="sm"
              onClick={onOpenShortcuts}
              title="Keyboard Shortcuts (Ctrl+K or ?)"
              ariaLabel="Shortcuts"
            />
          </span>
        )}

        {/* Light / Dark Mode Toggle */}
        {onToggleTheme && (
          <IconButton
            icon={currentTheme === 'dark' ? Sun : Moon}
            size="sm"
            onClick={onToggleTheme}
            title={`Switch to ${currentTheme === 'dark' ? 'Light' : 'Dark'} Mode`}
            ariaLabel="Toggle theme"
          />
        )}

        {/* Notification Bell with Badge */}
        <div style={{ position: 'relative' }}>
          <IconButton
            icon={Bell}
            size="sm"
            onClick={onOpenAlerts}
            title={`Alerts (${unreadAlertCount} active)`}
            ariaLabel="Alerts"
          />
          {unreadAlertCount > 0 && (
            <span
              style={{
                position: 'absolute',
                top: 4,
                right: 4,
                width: 7,
                height: 7,
                borderRadius: '50%',
                backgroundColor: 'var(--risk-critical)',
                border: '1.5px solid var(--bg-surface)'
              }}
            />
          )}
        </div>

        {/* User Profile Avatar */}
        <div
          onClick={onOpenProfile}
          style={{ cursor: 'pointer', marginLeft: 4 }}
          title={currentUser?.name || 'SDMA Commander'}
        >
          <Avatar name={currentUser?.name || 'SDMA'} size={30} status="online" />
        </div>
      </div>
    </header>
  );
}

export default TopNavigation;

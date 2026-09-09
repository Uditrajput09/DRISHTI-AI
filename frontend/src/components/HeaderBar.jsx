import React from 'react';
import { BellRing, RefreshCw } from 'lucide-react';

export default function HeaderBar({
  title = 'GIS COMMAND CENTER',
  routeTag = '(/app)',
  currentUser,
  unreadAlertCount = 6,
  onOpenAlerts,
  onOpenProfile,
  onRefreshData,
  isRefreshing
}) {
  return (
    <header
      style={{
        height: 56,
        background: 'rgba(8, 8, 10, 0.94)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border-command)',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 900
      }}
    >
      {/* Title & Route Indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <h2
          style={{
            fontSize: '1.05rem',
            fontWeight: 400,
            fontStyle: 'italic',
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-serif)',
            letterSpacing: '-0.02em',
            margin: 0
          }}
        >
          {title}
        </h2>
        <span
          style={{
            fontSize: '0.72rem',
            color: 'var(--text-muted)',
            fontFamily: 'monospace'
          }}
        >
          {routeTag}
        </span>
      </div>

      {/* Right Controls: Live Dot, User Info, Alerts Bell, Avatar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {/* Live Status */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: 'rgba(57, 217, 138, 0.1)',
            border: '1px solid rgba(57, 217, 138, 0.3)',
            padding: '3px 10px',
            borderRadius: 999,
            fontSize: '0.68rem',
            fontWeight: 700,
            color: '#39D98A',
            fontFamily: 'var(--font-sans)'
          }}
        >
          <span className="live-indicator-dot" />
          <span>Live</span>
        </div>

        {/* User Info & Sector */}
        <div
          onClick={onOpenProfile}
          style={{
            fontSize: '0.74rem',
            color: 'var(--text-primary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6
          }}
        >
          <span style={{ fontWeight: 600 }}>
            {currentUser?.name || 'Lee Montaria'}
          </span>
          <span style={{ color: 'var(--text-muted)' }}>•</span>
          <span style={{ color: 'var(--text-secondary)' }}>East Khasi Hills</span>
        </div>

        {/* Refresh button */}
        {onRefreshData && (
          <button
            onClick={onRefreshData}
            disabled={isRefreshing}
            title="Refresh Telemetry"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--color-copper)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              padding: 4
            }}
          >
            <RefreshCw
              size={14}
              style={{ animation: isRefreshing ? 'spin 1s linear infinite' : 'none' }}
            />
          </button>
        )}

        {/* Alert Bell */}
        <button
          onClick={onOpenAlerts}
          title="Emergency Alerts"
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--color-copper)',
            cursor: 'pointer',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            padding: 4
          }}
        >
          <BellRing size={16} />
          {unreadAlertCount > 0 && (
            <span
              style={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: 'var(--color-danger)',
                boxShadow: '0 0 6px var(--color-danger)'
              }}
            />
          )}
        </button>

        {/* Avatar */}
        <div
          onClick={onOpenProfile}
          style={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            overflow: 'hidden',
            border: '1.5px solid var(--color-copper)',
            cursor: 'pointer',
            boxShadow: '0 0 8px rgba(200, 150, 62, 0.3)'
          }}
        >
          <img
            src="/images/avatars/responder-avatar.jpg"
            alt="User Avatar"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        </div>
      </div>
    </header>
  );
}

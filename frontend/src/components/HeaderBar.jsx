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
        height: 54,
        background: 'rgba(7, 10, 16, 0.92)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(120, 140, 180, 0.18)',
        padding: '0 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 900
      }}
    >
      {/* Title & Route Indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <h2
          style={{
            fontSize: '0.94rem',
            fontWeight: 900,
            color: '#FFFFFF',
            fontFamily: 'Space Grotesk, sans-serif',
            letterSpacing: '0.04em',
            margin: 0
          }}
        >
          {title}
        </h2>
        <span
          style={{
            fontSize: '0.74rem',
            color: '#9AA5B8',
            fontFamily: 'JetBrains Mono, monospace'
          }}
        >
          {routeTag}
        </span>
      </div>

      {/* Right Controls: Live Dot, User Info, Alerts Bell, Avatar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        {/* Live Status */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: 'rgba(57, 217, 138, 0.1)',
            border: '1px solid rgba(57, 217, 138, 0.3)',
            padding: '3px 8px',
            borderRadius: 6,
            fontSize: '0.68rem',
            fontWeight: 800,
            color: '#39D98A',
            fontFamily: 'Space Grotesk, sans-serif'
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
            color: '#CBD5E1',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6
          }}
        >
          <span style={{ fontWeight: 700 }}>
            {currentUser?.name || 'Lee Montaria'}
          </span>
          <span style={{ color: '#5C677D' }}>•</span>
          <span style={{ color: '#9AA5B8' }}>East Khasi Hills</span>
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
              color: '#35D8FF',
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
            color: '#FF9D3D',
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
                background: '#FF3B6B',
                boxShadow: '0 0 6px #FF3B6B'
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
            border: '1.5px solid #35D8FF',
            cursor: 'pointer',
            boxShadow: '0 0 8px rgba(53, 216, 255, 0.4)'
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

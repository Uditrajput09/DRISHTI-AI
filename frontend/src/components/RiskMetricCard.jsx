import React from 'react';

export default function RiskMetricCard({ label, value, indicatorColor, icon: Icon, subtext, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: '#101521',
        border: '1px solid rgba(120, 140, 180, 0.22)',
        borderRadius: 10,
        padding: '10px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s ease',
        minWidth: 160,
        flex: 1,
        position: 'relative',
        overflow: 'hidden'
      }}
      className="command-panel-interactive"
    >
      {/* Subtle indicator bar on the left edge */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: 3,
          backgroundColor: indicatorColor,
          boxShadow: `0 0 8px ${indicatorColor}`
        }}
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 2, paddingLeft: 4 }}>
        <span
          style={{
            fontSize: '0.68rem',
            color: '#9AA5B8',
            fontWeight: 700,
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            fontFamily: 'Space Grotesk, sans-serif'
          }}
        >
          {label}
        </span>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
          <span
            style={{
              fontSize: '1.45rem',
              fontWeight: 800,
              color: '#F4F6FB',
              fontFamily: 'Space Grotesk, sans-serif',
              lineHeight: 1.1
            }}
          >
            {value}
          </span>
          {subtext && (
            <span style={{ fontSize: '0.65rem', color: '#5C677D', fontWeight: 600 }}>
              {subtext}
            </span>
          )}
        </div>
      </div>

      {Icon && (
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: 'rgba(255, 255, 255, 0.04)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid rgba(120, 140, 180, 0.15)'
          }}
        >
          <Icon size={16} color={indicatorColor} />
        </div>
      )}
    </div>
  );
}

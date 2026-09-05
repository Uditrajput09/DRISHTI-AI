import React from 'react';

export default function RiskMetricCard({ 
  label, 
  value, 
  indicatorColor, 
  icon: Icon, 
  trend,
  subtext, 
  onClick 
}) {
  return (
    <div
      onClick={onClick}
      style={{
        background: '#101521',
        border: '1px solid rgba(120, 140, 180, 0.22)',
        borderRadius: 12,
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s ease',
        minWidth: 170,
        flex: 1,
        position: 'relative',
        overflow: 'hidden'
      }}
      className="command-panel-interactive"
    >
      {/* Indicator accent line on the left edge */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: 3.5,
          backgroundColor: indicatorColor,
          boxShadow: `0 0 10px ${indicatorColor}`
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
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <span
            style={{
              fontSize: '1.65rem',
              fontWeight: 900,
              color: '#FFFFFF',
              fontFamily: 'Space Grotesk, sans-serif',
              lineHeight: 1.1
            }}
          >
            {value}
          </span>
          {trend && (
            <span
              style={{
                fontSize: '0.65rem',
                color: indicatorColor,
                fontWeight: 700,
                background: `${indicatorColor}18`,
                padding: '1px 6px',
                borderRadius: 4
              }}
            >
              {trend}
            </span>
          )}
          {subtext && !trend && (
            <span style={{ fontSize: '0.68rem', color: '#5C677D', fontWeight: 600 }}>
              {subtext}
            </span>
          )}
        </div>
      </div>

      {Icon && (
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: `${indicatorColor}15`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: `1px solid ${indicatorColor}35`,
            boxShadow: `0 0 12px ${indicatorColor}20`
          }}
        >
          <Icon size={18} color={indicatorColor} />
        </div>
      )}
    </div>
  );
}

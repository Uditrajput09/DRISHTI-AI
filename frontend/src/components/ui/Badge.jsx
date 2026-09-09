import React from 'react';

/**
 * Standardized Enterprise Status & Risk Badge System
 * - Status pills: 9999px radius
 * - Small semantic dot indicator
 * - Clear, readable text (never color-only)
 * - JetBrains Mono for codes/levels if applicable
 */
export function Badge({
  children,
  variant = 'neutral', // 'critical' | 'high' | 'medium' | 'safe' | 'info' | 'live' | 'offline' | 'syncing' | 'neutral'
  size = 'md', // 'sm' | 'md'
  dot = true,
  pulse = false,
  style = {},
  className = ''
}) {
  const getColors = () => {
    switch (variant.toLowerCase()) {
      case 'critical':
        return {
          color: 'var(--risk-critical)',
          bg: 'var(--risk-critical-bg)',
          border: 'var(--risk-critical-border)'
        };
      case 'high':
        return {
          color: 'var(--risk-high)',
          bg: 'var(--risk-high-bg)',
          border: 'var(--risk-high-border)'
        };
      case 'medium':
      case 'warning':
        return {
          color: 'var(--risk-medium)',
          bg: 'var(--risk-medium-bg)',
          border: 'var(--risk-medium-border)'
        };
      case 'safe':
      case 'live':
      case 'operational':
        return {
          color: 'var(--risk-safe)',
          bg: 'var(--risk-safe-bg)',
          border: 'var(--risk-safe-border)'
        };
      case 'info':
      case 'syncing':
      case 'blue':
        return {
          color: 'var(--brand-primary)',
          bg: 'var(--brand-tint)',
          border: 'var(--brand-border)'
        };
      case 'offline':
      case 'neutral':
      default:
        return {
          color: 'var(--text-secondary)',
          bg: 'rgba(255, 255, 255, 0.04)',
          border: 'var(--border-secondary)'
        };
    }
  };

  const { color, bg, border } = getColors();
  const isSm = size === 'sm';

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: isSm ? 5 : 6,
        padding: isSm ? '2px 8px' : '3px 10px',
        fontSize: isSm ? 10 : 11,
        fontWeight: 600,
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
        borderRadius: 'var(--radius-pill)',
        backgroundColor: bg,
        border: `1px solid ${border}`,
        color,
        whiteSpace: 'nowrap',
        userSelect: 'none',
        lineHeight: 1.2,
        ...style
      }}
      className={`ui-badge ui-badge-${variant} ${className}`}
    >
      {dot && (
        <span
          style={{
            width: isSm ? 5 : 6,
            height: isSm ? 5 : 6,
            borderRadius: '50%',
            backgroundColor: color,
            flexShrink: 0
          }}
          className={pulse ? 'animate-pulse-dot' : ''}
        />
      )}
      {children}
    </span>
  );
}

/**
 * RiskBadge helper specifically for Landslide Severity levels
 */
export function RiskBadge({ level = 'SAFE', score, pulse = false, size = 'md', style = {} }) {
  const norm = String(level || 'SAFE').toUpperCase();
  let variant = 'safe';
  if (norm.includes('CRIT') || norm === 'RED') variant = 'critical';
  else if (norm.includes('HIGH') || norm === 'ORANGE') variant = 'high';
  else if (norm.includes('MED') || norm === 'MOD' || norm === 'YELLOW') variant = 'medium';

  return (
    <Badge
      variant={variant}
      size={size}
      pulse={pulse || variant === 'critical'}
      style={style}
    >
      {norm}
      {score !== undefined && (
        <span className="font-mono" style={{ opacity: 0.85, marginLeft: 2 }}>
          ({Math.round(score * (score <= 1 ? 100 : 1))}%)
        </span>
      )}
    </Badge>
  );
}

/**
 * StatusBadge helper for system/incident status
 */
export function StatusBadge({ status = 'ACTIVE', size = 'md', style = {} }) {
  const s = String(status || '').toUpperCase();
  let variant = 'neutral';
  if (['LIVE', 'OPERATIONAL', 'SAFE', 'RESOLVED', 'VERIFIED'].includes(s)) variant = 'safe';
  else if (['CRITICAL', 'EMERGENCY'].includes(s)) variant = 'critical';
  else if (['HIGH', 'PENDING', 'INVESTIGATING'].includes(s)) variant = 'high';
  else if (['MEDIUM', 'WARNING'].includes(s)) variant = 'medium';
  else if (['SYNCING', 'DISPATCHING', 'INFO'].includes(s)) variant = 'info';
  else if (['OFFLINE', 'CLOSED', 'ARCHIVED'].includes(s)) variant = 'offline';

  return (
    <Badge variant={variant} size={size} pulse={variant === 'critical'} style={style}>
      {s}
    </Badge>
  );
}

export default Badge;

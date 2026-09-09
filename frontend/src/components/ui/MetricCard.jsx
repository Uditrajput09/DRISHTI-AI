import React from 'react';
import Card from './Card';

/**
 * Enterprise Metric Card
 * Strictly matches reference image KPI card:
 * - Label with optional icon chip
 * - Large JetBrains Mono number
 * - Trend badge (e.g., ▲ 12.5% or ↑ 1 since last hour)
 * - Subtle context text at bottom
 */
export function MetricCard({
  icon: Icon,
  label,
  value,
  trend,
  trendDirection = 'neutral', // 'up' | 'down' | 'neutral' | 'critical'
  trendLabel = '',
  description,
  variant = 'default', // 'default' | 'critical' | 'high' | 'safe'
  onClick,
  style = {},
  className = ''
}) {
  // Determine semantic color for trend
  const getTrendColor = () => {
    if (trendDirection === 'up') {
      return variant === 'critical' ? 'var(--risk-critical)' : 'var(--risk-safe)';
    }
    if (trendDirection === 'down') {
      return variant === 'critical' ? 'var(--risk-safe)' : 'var(--risk-critical)';
    }
    if (trendDirection === 'critical') return 'var(--risk-critical)';
    return 'var(--text-secondary)';
  };

  const getTrendArrow = () => {
    if (trendDirection === 'up') return '▲';
    if (trendDirection === 'down') return '▼';
    return '';
  };

  return (
    <Card
      onClick={onClick}
      hoverable={Boolean(onClick)}
      style={{
        padding: '16px 20px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        minHeight: 120,
        ...style
      }}
      className={`ui-metric-card ${className}`}
    >
      {/* Top: Icon chip + Label */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        {Icon && (
          <div
            style={{
              width: 26,
              height: 26,
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-secondary)'
            }}
          >
            <Icon size={14} />
          </div>
        )}
        <span
          style={{
            fontSize: 13,
            fontWeight: 500,
            color: 'var(--text-secondary)',
            letterSpacing: '-0.01em'
          }}
        >
          {label}
        </span>
      </div>

      {/* Middle: Big Metric Number in JetBrains Mono + Trend */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
        <span
          className="font-mono"
          style={{
            fontSize: 26,
            fontWeight: 600,
            letterSpacing: '-0.02em',
            color: 'var(--text-primary)',
            lineHeight: 1.1
          }}
        >
          {value}
        </span>

        {trend && (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              fontSize: 11,
              fontWeight: 500,
              color: getTrendColor(),
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              padding: '2px 6px',
              borderRadius: 'var(--radius-pill)',
              border: '1px solid var(--border-secondary)'
            }}
          >
            <span>{getTrendArrow()} {trend}</span>
            {trendLabel && (
              <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>{trendLabel}</span>
            )}
          </div>
        )}
      </div>

      {/* Bottom: Context description */}
      {description && (
        <div
          style={{
            fontSize: 11,
            color: 'var(--text-muted)',
            marginTop: 8,
            lineHeight: 1.4
          }}
        >
          {description}
        </div>
      )}
    </Card>
  );
}

export const StatCard = MetricCard;
export default MetricCard;

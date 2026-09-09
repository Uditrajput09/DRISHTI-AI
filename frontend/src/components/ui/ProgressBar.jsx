import React from 'react';

/**
 * Enterprise Progress Bar
 */
export function ProgressBar({
  value = 0, // 0 to 100
  max = 100,
  variant = 'brand', // 'brand' | 'critical' | 'high' | 'medium' | 'safe'
  showLabel = false,
  height = 6,
  style = {},
  className = ''
}) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const getColor = () => {
    switch (variant) {
      case 'critical': return 'var(--risk-critical)';
      case 'high': return 'var(--risk-high)';
      case 'medium': return 'var(--risk-medium)';
      case 'safe': return 'var(--risk-safe)';
      case 'brand':
      default: return 'var(--brand-primary)';
    }
  };

  return (
    <div style={{ width: '100%', ...style }} className={`ui-progress ${className}`}>
      {showLabel && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 4,
            fontSize: 11,
            color: 'var(--text-secondary)'
          }}
        >
          <span>Progress</span>
          <span className="font-mono">{Math.round(percentage)}%</span>
        </div>
      )}
      <div
        style={{
          width: '100%',
          height,
          backgroundColor: 'var(--bg-surface-secondary)',
          borderRadius: 'var(--radius-pill)',
          overflow: 'hidden',
          border: '1px solid var(--border-secondary)'
        }}
      >
        <div
          style={{
            width: `${percentage}%`,
            height: '100%',
            backgroundColor: getColor(),
            borderRadius: 'var(--radius-pill)',
            transition: 'width var(--transition-normal)'
          }}
        />
      </div>
    </div>
  );
}

/**
 * RiskGauge component for visual landslide risk score representation
 */
export function RiskGauge({ score = 0, level = 'SAFE', size = 'md' }) {
  const normalizedScore = score <= 1 ? score * 100 : score;
  let variant = 'safe';
  if (normalizedScore >= 75) variant = 'critical';
  else if (normalizedScore >= 50) variant = 'high';
  else if (normalizedScore >= 25) variant = 'medium';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)' }}>
          Risk Assessment
        </span>
        <span
          className="font-mono"
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: `var(--risk-${variant})`
          }}
        >
          {level} ({Math.round(normalizedScore)}%)
        </span>
      </div>
      <ProgressBar value={normalizedScore} variant={variant} height={6} />
    </div>
  );
}

export default ProgressBar;

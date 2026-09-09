import React from 'react';

/**
 * Reusable Enterprise Card component
 * Strictly adheres to #101010 background, 1px solid #252525 border, 12px radius, and subtle hover.
 */
export function Card({
  children,
  className = '',
  style = {},
  onClick,
  hoverable = false,
  elevated = false,
  padding = 16,
  ...props
}) {
  const isClickable = Boolean(onClick);

  return (
    <div
      onClick={onClick}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={isClickable ? (e) => (e.key === 'Enter' || e.key === ' ') && onClick(e) : undefined}
      style={{
        backgroundColor: elevated ? 'var(--bg-surface-elevated)' : 'var(--bg-surface)',
        border: '1px solid var(--border-primary)',
        borderRadius: 'var(--radius-card)',
        padding: typeof padding === 'number' ? `${padding}px` : padding,
        transition: 'border-color var(--transition-fast), transform var(--transition-fast), box-shadow var(--transition-fast)',
        cursor: isClickable ? 'pointer' : 'default',
        position: 'relative',
        outline: 'none',
        ...style
      }}
      className={`ui-card ${hoverable || isClickable ? 'ui-card-hoverable' : ''} ${className}`}
      onMouseEnter={(e) => {
        if (hoverable || isClickable) {
          e.currentTarget.style.borderColor = 'var(--border-hover)';
        }
      }}
      onMouseLeave={(e) => {
        if (hoverable || isClickable) {
          e.currentTarget.style.borderColor = 'var(--border-primary)';
        }
      }}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ title, subtitle, action, style = {}, className = '' }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
        paddingBottom: subtitle ? 0 : 4,
        ...style
      }}
      className={`ui-card-header ${className}`}
    >
      <div>
        {title && (
          <h3
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: 'var(--text-primary)',
              letterSpacing: '-0.01em',
              margin: 0
            }}
          >
            {title}
          </h3>
        )}
        {subtitle && (
          <p
            style={{
              fontSize: 12,
              color: 'var(--text-secondary)',
              marginTop: 2,
              margin: 0
            }}
          >
            {subtitle}
          </p>
        )}
      </div>
      {action && <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>{action}</div>}
    </div>
  );
}

export default Card;

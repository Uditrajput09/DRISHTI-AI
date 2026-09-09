import React from 'react';

/**
 * Enterprise Avatar Component
 */
export function Avatar({
  name = 'DRISHTI',
  src,
  size = 32,
  status, // 'online' | 'busy' | 'offline'
  style = {},
  className = ''
}) {
  const getInitials = (n) => {
    if (!n) return 'D';
    const parts = n.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return n.slice(0, 2).toUpperCase();
  };

  return (
    <div
      style={{
        width: size,
        height: size,
        minWidth: size,
        borderRadius: 'var(--radius-pill)',
        backgroundColor: 'var(--bg-surface-elevated)',
        border: '1px solid var(--border-secondary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        userSelect: 'none',
        overflow: 'hidden',
        ...style
      }}
      className={`ui-avatar ${className}`}
    >
      {src ? (
        <img
          src={src}
          alt={name}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      ) : (
        <span
          style={{
            fontSize: Math.max(size * 0.38, 10),
            fontWeight: 600,
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-primary)'
          }}
        >
          {getInitials(name)}
        </span>
      )}

      {status && (
        <span
          style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            width: Math.max(size * 0.28, 6),
            height: Math.max(size * 0.28, 6),
            borderRadius: '50%',
            backgroundColor: status === 'online' ? 'var(--status-live)' : 'var(--text-muted)',
            border: '2px solid var(--bg-surface)'
          }}
        />
      )}
    </div>
  );
}

/**
 * Enterprise Divider
 */
export function Divider({
  orientation = 'horizontal', // 'horizontal' | 'vertical'
  style = {},
  className = ''
}) {
  const isHoriz = orientation === 'horizontal';

  return (
    <div
      role="separator"
      style={{
        width: isHoriz ? '100%' : '1px',
        height: isHoriz ? '1px' : '100%',
        backgroundColor: 'var(--border-primary)',
        margin: isHoriz ? '12px 0' : '0 12px',
        flexShrink: 0,
        ...style
      }}
      className={`ui-divider ${className}`}
    />
  );
}

export default Avatar;

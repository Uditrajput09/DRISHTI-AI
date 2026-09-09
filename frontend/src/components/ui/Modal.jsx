import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { IconButton } from './Button';

/**
 * Enterprise Modal Dialog
 */
export function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  maxWidth = 520,
  style = {},
  className = ''
}) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose && onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 'var(--z-modal)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(6px)',
        padding: 16
      }}
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: `${maxWidth}px`,
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-primary)',
          borderRadius: 'var(--radius-card)',
          boxShadow: 'var(--shadow-modal)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'fadeIn var(--transition-fast) ease-out',
          ...style
        }}
        className={`ui-modal ${className}`}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--border-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'var(--bg-surface-elevated)'
          }}
        >
          <div>
            {title && (
              <h3
                style={{
                  fontSize: 15,
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
          <IconButton
            icon={X}
            size="sm"
            onClick={onClose}
            title="Close Dialog"
            ariaLabel="Close"
          />
        </div>

        {/* Body */}
        <div style={{ padding: '20px', flex: 1, overflowY: 'auto' }}>
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div
            style={{
              padding: '12px 20px',
              borderTop: '1px solid var(--border-primary)',
              backgroundColor: 'var(--bg-surface-elevated)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: 10
            }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export default Modal;

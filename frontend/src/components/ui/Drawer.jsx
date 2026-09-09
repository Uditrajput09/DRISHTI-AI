import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { IconButton } from './Button';

/**
 * Enterprise Right-Side Drawer & Mobile BottomSheet
 * Used for: GIS Zone Intelligence, AI Assistant, Dispatch, Filter panels
 * - Desktop: 380px-440px right panel, background #101010, border-left 1px solid #252525
 * - Mobile: bottom sheet/full-screen panel
 */
export function Drawer({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  width = 400,
  position = 'right', // 'right' | 'left' | 'bottom'
  style = {},
  className = ''
}) {
  // ESC key listener to close drawer
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
        zIndex: 'var(--z-drawer)',
        display: 'flex',
        justifyContent: position === 'right' ? 'flex-end' : position === 'left' ? 'flex-start' : 'center',
        alignItems: position === 'bottom' ? 'flex-end' : 'stretch',
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(4px)',
        transition: 'opacity var(--transition-fast)'
      }}
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: position === 'bottom' ? '100%' : '100%',
          maxWidth: position === 'bottom' ? '100%' : `${width}px`,
          height: position === 'bottom' ? '80vh' : '100%',
          backgroundColor: 'var(--bg-surface)',
          borderLeft: position === 'right' ? '1px solid var(--border-primary)' : 'none',
          borderRight: position === 'left' ? '1px solid var(--border-primary)' : 'none',
          borderTop: position === 'bottom' ? '1px solid var(--border-primary)' : 'none',
          borderRadius: position === 'bottom' ? '16px 16px 0 0' : 0,
          display: 'flex',
          flexDirection: 'column',
          boxShadow: 'var(--shadow-modal)',
          position: 'relative',
          overflow: 'hidden',
          ...style
        }}
        className={`ui-drawer animate-slide-in-right ${className}`}
      >
        {/* Drawer Header */}
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
            title="Close Drawer"
            ariaLabel="Close"
          />
        </div>

        {/* Drawer Content */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: 16
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

export const BottomSheet = (props) => <Drawer position="bottom" {...props} />;
export default Drawer;

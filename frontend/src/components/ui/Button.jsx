import React from 'react';

/**
 * Enterprise Button Component
 * Strictly adheres to the design specification:
 * - Primary: #4F6FFF, hover #5C78FF
 * - Secondary: #181818, border 1px solid #292929, text #D5D5D5
 * - Ghost: transparent, text #A1A1A1
 * - Danger/Critical: #FF4D5A, text #FFFFFF
 * - Radius: 8px, 8px spacing alignment
 */
export function Button({
  children,
  variant = 'primary', // 'primary' | 'secondary' | 'ghost' | 'danger'
  size = 'md', // 'sm' | 'md' | 'lg'
  icon: Icon,
  iconRight: IconRight,
  disabled = false,
  loading = false,
  onClick,
  type = 'button',
  fullWidth = false,
  style = {},
  className = '',
  title,
  ariaLabel,
  ...props
}) {
  const getPaddingAndHeight = () => {
    switch (size) {
      case 'sm':
        return { height: 32, padding: '0 12px', fontSize: 12, iconSize: 14 };
      case 'lg':
        return { height: 44, padding: '0 20px', fontSize: 15, iconSize: 18 };
      case 'md':
      default:
        return { height: 36, padding: '0 16px', fontSize: 13, iconSize: 16 };
    }
  };

  const { height, padding, fontSize, iconSize } = getPaddingAndHeight();

  const getVariantStyles = () => {
    switch (variant) {
      case 'secondary':
        return {
          backgroundColor: 'var(--bg-surface-secondary)',
          border: '1px solid var(--border-secondary)',
          color: '#D5D5D5',
          hoverBg: '#222222',
          hoverBorder: '#383838'
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
          border: '1px solid transparent',
          color: 'var(--text-secondary)',
          hoverBg: 'rgba(255, 255, 255, 0.05)',
          hoverBorder: 'transparent'
        };
      case 'danger':
        return {
          backgroundColor: 'var(--risk-critical)',
          border: '1px solid transparent',
          color: '#FFFFFF',
          hoverBg: '#FF636F',
          hoverBorder: 'transparent'
        };
      case 'primary':
      default:
        return {
          backgroundColor: 'var(--brand-primary)',
          border: '1px solid transparent',
          color: '#FFFFFF',
          hoverBg: 'var(--brand-hover)',
          hoverBorder: 'transparent'
        };
    }
  };

  const vStyles = getVariantStyles();

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      title={title}
      aria-label={ariaLabel || title}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        height,
        padding,
        fontSize,
        fontWeight: 500,
        fontFamily: 'var(--font-primary)',
        borderRadius: 'var(--radius-btn)',
        backgroundColor: vStyles.backgroundColor,
        border: vStyles.border,
        color: vStyles.color,
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        width: fullWidth ? '100%' : 'auto',
        whiteSpace: 'nowrap',
        userSelect: 'none',
        position: 'relative',
        transition: 'background-color var(--transition-fast), border-color var(--transition-fast), transform var(--transition-fast)',
        ...style
      }}
      className={`ui-btn ui-btn-${variant} ${className}`}
      onMouseEnter={(e) => {
        if (!disabled && !loading) {
          e.currentTarget.style.backgroundColor = vStyles.hoverBg;
          if (vStyles.hoverBorder !== 'transparent') {
            e.currentTarget.style.borderColor = vStyles.hoverBorder;
          }
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled && !loading) {
          e.currentTarget.style.backgroundColor = vStyles.backgroundColor;
          e.currentTarget.style.borderColor = vStyles.border.split(' ')[2] || 'transparent';
        }
      }}
      {...props}
    >
      {loading ? (
        <span
          style={{
            width: iconSize,
            height: iconSize,
            borderRadius: '50%',
            border: '2px solid rgba(255, 255, 255, 0.3)',
            borderTopColor: '#FFFFFF',
            animation: 'spin 0.8s linear infinite',
            display: 'inline-block'
          }}
        />
      ) : (
        <>
          {Icon && <Icon size={iconSize} />}
          {children}
          {IconRight && <IconRight size={iconSize} />}
        </>
      )}
    </button>
  );
}

/**
 * Enterprise Icon Button
 */
export function IconButton({
  icon: Icon,
  variant = 'ghost', // 'ghost' | 'secondary' | 'primary'
  size = 'md', // 'sm' | 'md' | 'lg'
  disabled = false,
  onClick,
  title,
  ariaLabel,
  style = {},
  className = '',
  ...props
}) {
  const getDim = () => {
    switch (size) {
      case 'sm': return { dim: 30, iconSize: 14 };
      case 'lg': return { dim: 42, iconSize: 20 };
      case 'md':
      default: return { dim: 36, iconSize: 16 };
    }
  };

  const { dim, iconSize } = getDim();

  return (
    <Button
      variant={variant}
      size={size}
      disabled={disabled}
      onClick={onClick}
      title={title}
      ariaLabel={ariaLabel || title}
      style={{
        width: dim,
        height: dim,
        minWidth: dim,
        padding: 0,
        ...style
      }}
      className={`ui-icon-btn ${className}`}
      {...props}
    >
      {Icon && <Icon size={iconSize} />}
    </Button>
  );
}

export const SecondaryButton = (props) => <Button variant="secondary" {...props} />;
export const DangerButton = (props) => <Button variant="danger" {...props} />;
export const GhostButton = (props) => <Button variant="ghost" {...props} />;

export default Button;

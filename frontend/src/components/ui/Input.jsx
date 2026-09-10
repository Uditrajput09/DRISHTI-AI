import React, { forwardRef } from 'react';
import { Search, X } from 'lucide-react';

/**
 * Enterprise Form Input
 * Background: #171717, border: #252525, text: #F5F5F5, placeholder: #6F6F6F
 * Focus: border #4F6FFF, box-shadow: 0 0 0 2px rgba(79,111,255,0.12)
 */
export const Input = forwardRef(function Input({
  label,
  error,
  helperText,
  icon: Icon,
  iconRight: IconRight,
  size = 'md', // 'sm' | 'md' | 'lg'
  fullWidth = false,
  style = {},
  containerStyle = {},
  className = '',
  disabled = false,
  ...props
}, ref) {
  const getHeight = () => {
    switch (size) {
      case 'sm': return 32;
      case 'lg': return 42;
      case 'md':
      default: return 36;
    }
  };

  const height = getHeight();

  return (
    <div
      style={{
        display: fullWidth ? 'flex' : 'inline-flex',
        flexDirection: 'column',
        gap: 6,
        width: fullWidth ? '100%' : 'auto',
        ...containerStyle
      }}
      className={`ui-input-wrapper ${className}`}
    >
      {label && (
        <label
          style={{
            fontSize: 12,
            fontWeight: 500,
            color: 'var(--text-secondary)',
            letterSpacing: '-0.01em'
          }}
        >
          {label}
        </label>
      )}

      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', width: '100%' }}>
        {Icon && (
          <div
            style={{
              position: 'absolute',
              left: 12,
              display: 'flex',
              alignItems: 'center',
              pointerEvents: 'none',
              color: 'var(--text-muted)'
            }}
          >
            <Icon size={15} />
          </div>
        )}

        <input
          ref={ref}
          disabled={disabled}
          style={{
            width: '100%',
            height,
            backgroundColor: 'var(--bg-input)',
            border: `1px solid ${error ? 'var(--risk-critical)' : 'var(--border-primary)'}`,
            borderRadius: 'var(--radius-input)',
            paddingLeft: Icon ? 36 : 12,
            paddingRight: IconRight ? 36 : 12,
            fontSize: 13,
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-primary)',
            outline: 'none',
            boxSizing: 'border-box',
            opacity: disabled ? 0.5 : 1,
            cursor: disabled ? 'not-allowed' : 'text',
            transition: 'border-color var(--transition-fast), box-shadow var(--transition-fast)',
            ...style
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = 'var(--brand-primary)';
            e.currentTarget.style.boxShadow = '0 0 0 2px var(--brand-tint)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = error ? 'var(--risk-critical)' : 'var(--border-primary)';
            e.currentTarget.style.boxShadow = 'none';
          }}
          {...props}
        />

        {IconRight && (
          <div
            style={{
              position: 'absolute',
              right: 12,
              display: 'flex',
              alignItems: 'center',
              color: 'var(--text-muted)'
            }}
          >
            <IconRight size={15} />
          </div>
        )}
      </div>

      {(error || helperText) && (
        <span
          style={{
            fontSize: 11,
            color: error ? 'var(--risk-critical)' : 'var(--text-muted)',
            marginTop: 2
          }}
        >
          {error || helperText}
        </span>
      )}
    </div>
  );
});

/**
 * Enterprise SearchInput with clear button
 */
export const SearchInput = forwardRef(function SearchInput({
  value,
  onChange,
  onClear,
  placeholder = 'Search...',
  style = {},
  ...props
}, ref) {
  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
      <Input
        ref={ref}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        icon={Search}
        style={{
          paddingRight: value ? 32 : 12,
          ...style
        }}
        {...props}
      />
      {value && (
        <button
          type="button"
          onClick={onClear || (() => onChange && onChange({ target: { value: '' } }))}
          title="Clear search"
          aria-label="Clear search input"
          style={{
            position: 'absolute',
            right: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-muted)',
            padding: 2,
            borderRadius: '50%',
            backgroundColor: 'transparent'
          }}
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
});

/**
 * Enterprise Textarea
 */
export const Textarea = forwardRef(function Textarea({
  label,
  error,
  helperText,
  rows = 3,
  fullWidth = false,
  style = {},
  containerStyle = {},
  disabled = false,
  ...props
}, ref) {
  return (
    <div
      style={{
        display: fullWidth ? 'flex' : 'inline-flex',
        flexDirection: 'column',
        gap: 6,
        width: fullWidth ? '100%' : 'auto',
        ...containerStyle
      }}
    >
      {label && (
        <label
          style={{
            fontSize: 12,
            fontWeight: 500,
            color: 'var(--text-secondary)',
            letterSpacing: '-0.01em'
          }}
        >
          {label}
        </label>
      )}

      <textarea
        ref={ref}
        rows={rows}
        disabled={disabled}
        style={{
          width: '100%',
          backgroundColor: 'var(--bg-input)',
          border: `1px solid ${error ? 'var(--risk-critical)' : 'var(--border-primary)'}`,
          borderRadius: 'var(--radius-input)',
          padding: '10px 12px',
          fontSize: 13,
          color: 'var(--text-primary)',
          fontFamily: 'var(--font-primary)',
          outline: 'none',
          boxSizing: 'border-box',
          resize: 'vertical',
          opacity: disabled ? 0.5 : 1,
          cursor: disabled ? 'not-allowed' : 'text',
          transition: 'border-color var(--transition-fast), box-shadow var(--transition-fast)',
          ...style
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = 'var(--brand-primary)';
          e.currentTarget.style.boxShadow = '0 0 0 2px var(--brand-tint)';
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = error ? 'var(--risk-critical)' : 'var(--border-primary)';
          e.currentTarget.style.boxShadow = 'none';
        }}
        {...props}
      />

      {(error || helperText) && (
        <span
          style={{
            fontSize: 11,
            color: error ? 'var(--risk-critical)' : 'var(--text-muted)'
          }}
        >
          {error || helperText}
        </span>
      )}
    </div>
  );
});

export default Input;

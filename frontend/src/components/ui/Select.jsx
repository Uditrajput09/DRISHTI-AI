import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

/**
 * Enterprise Select Dropdown
 * Follows form system rules:
 * - background: #171717
 * - border: #252525, focus: #4F6FFF
 * - text: #F5F5F5
 */
export function Select({
  label,
  value,
  onChange,
  options = [], // [{ value: '', label: '', icon?: Component }] or string[]
  icon: Icon,
  size = 'md', // 'sm' | 'md'
  fullWidth = false,
  placeholder = 'Select option...',
  style = {},
  disabled = false,
  className = '',
  ...props
}) {
  const isSm = size === 'sm';
  const height = isSm ? 32 : 36;

  // Normalize options
  const normalizedOptions = options.map((opt) =>
    typeof opt === 'object' ? opt : { value: opt, label: opt }
  );

  return (
    <div
      style={{
        display: fullWidth ? 'flex' : 'inline-flex',
        flexDirection: 'column',
        gap: 6,
        width: fullWidth ? '100%' : 'auto'
      }}
      className={`ui-select-wrapper ${className}`}
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
              left: 10,
              display: 'flex',
              alignItems: 'center',
              pointerEvents: 'none',
              color: 'var(--text-muted)'
            }}
          >
            <Icon size={isSm ? 13 : 15} />
          </div>
        )}

        <select
          value={value}
          onChange={(e) => onChange && onChange(e.target.value)}
          disabled={disabled}
          style={{
            appearance: 'none',
            WebkitAppearance: 'none',
            MozAppearance: 'none',
            width: '100%',
            height,
            backgroundColor: 'var(--bg-input)',
            border: '1px solid var(--border-primary)',
            borderRadius: 'var(--radius-input)',
            paddingLeft: Icon ? 32 : 12,
            paddingRight: 32,
            fontSize: isSm ? 12 : 13,
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-primary)',
            outline: 'none',
            cursor: disabled ? 'not-allowed' : 'pointer',
            opacity: disabled ? 0.5 : 1,
            transition: 'border-color var(--transition-fast), box-shadow var(--transition-fast)',
            ...style
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = 'var(--brand-primary)';
            e.currentTarget.style.boxShadow = '0 0 0 2px var(--brand-tint)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = 'var(--border-primary)';
            e.currentTarget.style.boxShadow = 'none';
          }}
          {...props}
        >
          {placeholder && <option value="" disabled>{placeholder}</option>}
          {normalizedOptions.map((opt) => (
            <option
              key={opt.value}
              value={opt.value}
              style={{
                backgroundColor: '#171717',
                color: '#F5F5F5'
              }}
            >
              {opt.label}
            </option>
          ))}
        </select>

        <div
          style={{
            position: 'absolute',
            right: 10,
            display: 'flex',
            alignItems: 'center',
            pointerEvents: 'none',
            color: 'var(--text-muted)'
          }}
        >
          <ChevronDown size={14} />
        </div>
      </div>
    </div>
  );
}

export default Select;

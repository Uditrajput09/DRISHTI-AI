import React from 'react';

/**
 * Enterprise Tabs & FilterChip system matching reference UI
 */
export function Tabs({
  tabs = [], // [{ id: 'overview', label: 'Overview', count?: 12, icon?: Icon }]
  activeTab,
  onChange,
  variant = 'pill', // 'pill' | 'line'
  style = {},
  className = ''
}) {
  return (
    <div
      role="tablist"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        overflowX: 'auto',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
        ...style
      }}
      className={`ui-tabs ${className}`}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;

        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 14px',
              fontSize: 13,
              fontWeight: isActive ? 500 : 400,
              fontFamily: 'var(--font-primary)',
              borderRadius: 'var(--radius-btn)',
              backgroundColor: isActive ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
              color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
              border: isActive ? '1px solid var(--border-secondary)' : '1px solid transparent',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all var(--transition-fast)'
            }}
            className={`ui-tab ${isActive ? 'ui-tab-active' : ''}`}
            onMouseEnter={(e) => {
              if (!isActive) {
                e.currentTarget.style.color = 'var(--text-primary)';
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.04)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive) {
                e.currentTarget.style.color = 'var(--text-secondary)';
                e.currentTarget.style.backgroundColor = 'transparent';
              }
            }}
          >
            {Icon && <Icon size={14} style={{ color: isActive ? 'var(--brand-primary)' : 'inherit' }} />}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className="font-mono"
                style={{
                  fontSize: 11,
                  padding: '1px 6px',
                  borderRadius: 'var(--radius-pill)',
                  backgroundColor: isActive ? 'var(--brand-tint)' : 'var(--bg-surface-elevated)',
                  color: isActive ? 'var(--brand-light)' : 'var(--text-muted)'
                }}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

/**
 * FilterChip for secondary filters (e.g., date ranges, quick toggles)
 */
export function FilterChip({
  label,
  icon: Icon,
  active = false,
  onClick,
  onClear,
  style = {}
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '5px 12px',
        fontSize: 12,
        fontWeight: 500,
        fontFamily: 'var(--font-primary)',
        borderRadius: 'var(--radius-input)',
        backgroundColor: active ? 'var(--bg-surface-elevated)' : 'var(--bg-input)',
        border: `1px solid ${active ? 'var(--brand-primary)' : 'var(--border-primary)'}`,
        color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
        cursor: 'pointer',
        transition: 'border-color var(--transition-fast), color var(--transition-fast)',
        ...style
      }}
      onMouseEnter={(e) => {
        if (!active) e.currentTarget.style.borderColor = 'var(--border-hover)';
      }}
      onMouseLeave={(e) => {
        if (!active) e.currentTarget.style.borderColor = 'var(--border-primary)';
      }}
    >
      {Icon && <Icon size={13} style={{ color: active ? 'var(--brand-primary)' : 'var(--text-muted)' }} />}
      <span>{label}</span>
    </button>
  );
}

export const Tab = ({ children, active, onClick }) => (
  <button
    role="tab"
    aria-selected={active}
    onClick={onClick}
    style={{
      padding: '6px 14px',
      fontSize: 13,
      fontWeight: active ? 500 : 400,
      borderRadius: 'var(--radius-btn)',
      backgroundColor: active ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
      color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
      border: active ? '1px solid var(--border-secondary)' : '1px solid transparent'
    }}
  >
    {children}
  </button>
);

export default Tabs;

import React from 'react';
import { ChevronRight } from 'lucide-react';

/**
 * Enterprise Page Header
 * Standardized for all 9 application views:
 * - Top Breadcrumbs (e.g. Command Center > GIS Intelligence)
 * - Page Title & Subtitle
 * - Right-hand action slot (e.g. Refresh, Filters, Export, AI Trigger)
 */
export function PageHeader({
  breadcrumbs = [], // string[] or [{ label, href?, onClick? }]
  title,
  subtitle,
  actions,
  tabs,
  style = {},
  className = ''
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        marginBottom: 20,
        ...style
      }}
      className={`ui-page-header ${className}`}
    >
      {/* 1. Breadcrumbs */}
      {breadcrumbs.length > 0 && (
        <nav
          aria-label="Breadcrumb"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 12,
            color: 'var(--text-muted)'
          }}
        >
          {breadcrumbs.map((crumb, idx) => {
            const isLast = idx === breadcrumbs.length - 1;
            const label = typeof crumb === 'string' ? crumb : crumb.label;
            const onClick = typeof crumb === 'object' ? crumb.onClick : undefined;

            return (
              <React.Fragment key={idx}>
                {idx > 0 && (
                  <ChevronRight size={12} style={{ color: 'var(--text-disabled)' }} />
                )}
                <span
                  onClick={onClick}
                  style={{
                    color: isLast ? 'var(--text-primary)' : 'var(--text-secondary)',
                    fontWeight: isLast ? 500 : 400,
                    cursor: onClick ? 'pointer' : 'default'
                  }}
                >
                  {label}
                </span>
              </React.Fragment>
            );
          })}
        </nav>
      )}

      {/* 2. Main Title Row + Right Actions */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12
        }}
      >
        <div>
          {title && (
            <h1
              style={{
                fontSize: 20,
                fontWeight: 600,
                color: 'var(--text-primary)',
                letterSpacing: '-0.02em',
                margin: 0
              }}
            >
              {title}
            </h1>
          )}
          {subtitle && (
            <p
              style={{
                fontSize: 13,
                color: 'var(--text-secondary)',
                marginTop: 2,
                margin: 0
              }}
            >
              {subtitle}
            </p>
          )}
        </div>

        {actions && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              flexWrap: 'wrap'
            }}
          >
            {actions}
          </div>
        )}
      </div>

      {/* 3. Optional Tabs Bar */}
      {tabs && (
        <div style={{ marginTop: 4 }}>
          {tabs}
        </div>
      )}
    </div>
  );
}

export const Breadcrumbs = ({ items = [] }) => (
  <nav aria-label="Breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-muted)' }}>
    {items.map((item, idx) => (
      <React.Fragment key={idx}>
        {idx > 0 && <ChevronRight size={12} />}
        <span style={{ color: idx === items.length - 1 ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
          {item}
        </span>
      </React.Fragment>
    ))}
  </nav>
);

export default PageHeader;

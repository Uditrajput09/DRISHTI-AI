import React from 'react';
import { AlertTriangle, Inbox, RefreshCw } from 'lucide-react';
import { Button } from './Button';

/**
 * Enterprise Empty State
 */
export function EmptyState({
  icon: Icon = Inbox,
  title = 'No records found',
  description = 'There are currently no items to display in this view.',
  actionLabel,
  onAction,
  style = {}
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 24px',
        textAlign: 'center',
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-primary)',
        borderRadius: 'var(--radius-card)',
        ...style
      }}
      className="ui-empty-state"
    >
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: '50%',
          backgroundColor: 'var(--bg-surface-elevated)',
          border: '1px solid var(--border-secondary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-muted)',
          marginBottom: 14
        }}
      >
        <Icon size={20} />
      </div>
      <h4
        style={{
          fontSize: 14,
          fontWeight: 600,
          color: 'var(--text-primary)',
          margin: '0 0 4px 0'
        }}
      >
        {title}
      </h4>
      <p
        style={{
          fontSize: 12,
          color: 'var(--text-secondary)',
          maxWidth: 360,
          margin: '0 0 16px 0',
          lineHeight: 1.5
        }}
      >
        {description}
      </p>
      {actionLabel && onAction && (
        <Button variant="secondary" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

/**
 * Enterprise Loading State / Skeleton
 */
export function LoadingState({ message = 'Loading intelligence telemetry...', height = 200 }) {
  return (
    <div
      style={{
        height,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-primary)',
        borderRadius: 'var(--radius-card)'
      }}
      className="ui-loading-state"
    >
      <div
        style={{
          width: 24,
          height: 24,
          borderRadius: '50%',
          border: '2px solid var(--border-secondary)',
          borderTopColor: 'var(--brand-primary)',
          animation: 'spin 0.8s linear infinite'
        }}
      />
      <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
        {message}
      </span>
    </div>
  );
}

/**
 * Enterprise Error State
 */
export function ErrorState({
  title = 'Failed to load telemetry',
  message = 'An unexpected error occurred while communicating with the command server.',
  onRetry
}) {
  return (
    <div
      style={{
        padding: '36px 20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--risk-critical-border)',
        borderRadius: 'var(--radius-card)'
      }}
      className="ui-error-state"
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: '50%',
          backgroundColor: 'var(--risk-critical-bg)',
          border: '1px solid var(--risk-critical-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--risk-critical)',
          marginBottom: 12
        }}
      >
        <AlertTriangle size={20} />
      </div>
      <h4 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 4px 0' }}>
        {title}
      </h4>
      <p style={{ fontSize: 12, color: 'var(--text-secondary)', maxWidth: 360, margin: '0 0 16px 0' }}>
        {message}
      </p>
      {onRetry && (
        <Button variant="secondary" size="sm" icon={RefreshCw} onClick={onRetry}>
          Retry Connection
        </Button>
      )}
    </div>
  );
}

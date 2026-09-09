import React from 'react';
import { Inbox, CheckCircle2 } from 'lucide-react';

export default function EmptyState({
  icon: Icon = Inbox,
  title = 'No Records Found',
  description = 'There are currently no active alerts or reports in this sector.',
  actionLabel,
  onAction
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '48px 24px',
        background: 'var(--bg-surface)',
        border: '1px dashed var(--border-command)',
        borderRadius: 'var(--radius-lg)',
        width: '100%',
        boxSizing: 'border-box'
      }}
    >
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: 'var(--radius-full)',
          background: 'rgba(200, 150, 62, 0.08)',
          border: '1px solid rgba(200, 150, 62, 0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--color-copper)',
          marginBottom: 16
        }}
      >
        <Icon size={22} />
      </div>
      <h3
        style={{
          fontFamily: 'var(--font-serif)',
          fontSize: '1.05rem',
          color: 'var(--text-primary)',
          marginBottom: 6
        }}
      >
        {title}
      </h3>
      <p
        style={{
          fontSize: '0.82rem',
          color: 'var(--text-secondary)',
          maxWidth: 380,
          lineHeight: '1.5',
          marginBottom: actionLabel ? 20 : 0
        }}
      >
        {description}
      </p>
      {actionLabel && (
        <button
          onClick={onAction}
          className="btn-copper"
          style={{ fontSize: '0.78rem', padding: '6px 16px' }}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

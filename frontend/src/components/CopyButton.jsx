import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export default function CopyButton({ text, label = '', style, showText = false }) {
  const [copied, setCopied] = useState(false);
  const { showToast } = useToast();

  const handleCopy = async (e) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      showToast(label ? `Copied ${label} to clipboard` : 'Copied to clipboard', 'success', 2000);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      title={label ? `Copy ${label}` : 'Copy to clipboard'}
      aria-label="Copy"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        background: copied ? 'rgba(42, 157, 143, 0.15)' : 'var(--bg-surface-elevated)',
        border: `1px solid ${copied ? 'var(--risk-safe)' : 'var(--border-command)'}`,
        borderRadius: 'var(--radius-full)',
        color: copied ? 'var(--risk-safe)' : 'var(--text-secondary)',
        padding: showText ? '3px 10px' : '4px 7px',
        fontSize: '0.72rem',
        cursor: 'pointer',
        transition: 'all 0.15s ease',
        ...style
      }}
      onMouseOver={(e) => {
        if (!copied) {
          e.currentTarget.style.borderColor = 'var(--color-copper)';
          e.currentTarget.style.color = 'var(--color-copper)';
        }
      }}
      onMouseOut={(e) => {
        if (!copied) {
          e.currentTarget.style.borderColor = 'var(--border-command)';
          e.currentTarget.style.color = 'var(--text-secondary)';
        }
      }}
    >
      {copied ? <Check size={12} /> : <Copy size={12} />}
      {showText && <span>{copied ? 'Copied' : 'Copy'}</span>}
    </button>
  );
}

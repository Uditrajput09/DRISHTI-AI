import React, { useState, useEffect } from 'react';
import { Command, Search, X, Map, ShieldAlert, CloudRain, Bell, FileText, User, Play, Sun, Moon, Download, Sliders } from 'lucide-react';

export default function KeyboardShortcutsModal({ 
  isOpen, 
  onClose, 
  onNavigate, 
  onToggleTheme, 
  currentTheme,
  onOpenAndroidModal,
  onOpenSimulator
}) {
  const [query, setQuery] = useState('');

  const actions = [
    { key: '1', label: 'GIS Command Center', route: 'gis', icon: Map },
    { key: '2', label: 'Risk Intelligence', route: 'risk', icon: ShieldAlert },
    { key: '3', label: 'Alerts Center', route: 'alerts', icon: Bell },
    { key: '4', label: '48-Hour Forecast', route: 'forecast', icon: CloudRain },
    { key: '5', label: 'Live Incidents', route: 'incidents', icon: ShieldAlert },
    { key: '6', label: 'Field Report Form', route: 'reports', icon: FileText },
    { key: '7', label: 'User Profile & FAQs', route: 'profile', icon: User },
    { key: 'S', label: 'Cloudburst Simulation', route: 'simulation', icon: Play },
    { key: 'A', label: 'Android APK Download', onTrigger: onOpenAndroidModal, icon: Download },
    { key: 'M', label: 'Simulate Android Hardware', onTrigger: onOpenSimulator, icon: Sliders },
  ];

  const filtered = actions.filter(a => a.label.toLowerCase().includes(query.toLowerCase()));

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
      const match = actions.find(a => a.key.toLowerCase() === e.key.toLowerCase());
      if (match && e.target.tagName !== 'INPUT') {
        e.preventDefault();
        if (match.onTrigger) {
          match.onTrigger();
        } else if (match.route) {
          onNavigate(match.route);
        }
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onNavigate, onClose, onOpenAndroidModal, onOpenSimulator]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(8, 8, 10, 0.85)',
        backdropFilter: 'blur(8px)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 520,
          background: 'var(--bg-surface-elevated)',
          border: '1px solid var(--border-command)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.8)',
          overflow: 'hidden'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Search */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-command)', display: 'flex', alignItems: 'center', gap: 12 }}>
          <Search size={18} style={{ color: 'var(--color-copper)' }} />
          <input
            type="text"
            placeholder="Type a command or jump to section..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--text-primary)',
              fontSize: '0.92rem',
              fontFamily: 'var(--font-body)'
            }}
          />
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', border: '1px solid var(--border-command)', padding: '2px 6px', borderRadius: 4 }}>
            ESC
          </span>
        </div>

        {/* Action list */}
        <div style={{ maxHeight: 320, overflowY: 'auto', padding: '8px 12px' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '6px 8px' }}>
            Navigation Shortcuts
          </div>
          {filtered.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.key}
                onClick={() => {
                  if (item.onTrigger) {
                    item.onTrigger();
                  } else if (item.route) {
                    onNavigate(item.route);
                  }
                  onClose();
                }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '9px 12px',
                  background: 'transparent',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(200, 150, 62, 0.1)';
                  e.currentTarget.style.color = 'var(--color-copper)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = 'var(--text-primary)';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Icon size={16} />
                  <span style={{ fontSize: '0.84rem' }}>{item.label}</span>
                </div>
                <span
                  style={{
                    fontSize: '0.72rem',
                    color: 'var(--text-muted)',
                    background: 'var(--bg-main)',
                    border: '1px solid var(--border-command)',
                    borderRadius: 4,
                    padding: '2px 8px',
                    fontFamily: 'var(--font-mono)'
                  }}
                >
                  {item.key}
                </span>
              </button>
            );
          })}
        </div>

        {/* Footer info */}
        <div
          style={{
            padding: '10px 16px',
            background: 'var(--bg-main)',
            borderTop: '1px solid var(--border-command)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.74rem',
            color: 'var(--text-muted)'
          }}
        >
          <div style={{ display: 'flex', gap: 12 }}>
            <span><kbd>?</kbd> Help</span>
            <span><kbd>Cmd+K</kbd> / <kbd>Ctrl+K</kbd> Shortcuts</span>
          </div>
          {onToggleTheme && (
            <button
              onClick={onToggleTheme}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: '0.74rem'
              }}
            >
              {currentTheme === 'light' ? <Moon size={13} /> : <Sun size={13} />}
              Toggle {currentTheme === 'light' ? 'Dark' : 'Light'} Mode
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

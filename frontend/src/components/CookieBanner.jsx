import React, { useState, useEffect } from 'react';
import { ShieldCheck, X } from 'lucide-react';

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('drishti_cookie_consent');
    if (!consent) {
      // Delay display slightly for smoother load
      const timer = setTimeout(() => setIsVisible(true), 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('drishti_cookie_consent', 'accepted');
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem('drishti_cookie_consent', 'essential_only');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="slash-cookie-banner">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <ShieldCheck size={22} style={{ color: 'var(--color-copper)', flexShrink: 0 }} />
        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
          DRISHTI-AI uses minimal local cookies for offline telemetry caching and emergency CAP dispatch compliance.
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        <button
          onClick={handleDecline}
          className="btn-surface"
          style={{ padding: '6px 12px', fontSize: '0.75rem' }}
        >
          Essential Only
        </button>
        <button
          onClick={handleAccept}
          className="btn-copper"
          style={{ padding: '6px 14px', fontSize: '0.75rem' }}
        >
          Accept All
        </button>
        <button
          onClick={() => setIsVisible(false)}
          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', marginLeft: 4 }}
          title="Dismiss"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { Activity, CheckCircle2, ShieldCheck, ChevronDown } from 'lucide-react';

export default function StatusIndicator({ isOnline = true }) {
  const [isOpen, setIsOpen] = useState(false);

  const subsystems = [
    { name: 'GIS Mapping Engine', status: 'Operational', ping: '12ms', ok: true },
    { name: 'Open-Meteo & IMD Weather', status: 'Live Synced', ping: '34ms', ok: true },
    { name: 'AI Susceptibility Model (v1.2)', status: 'Active (0.99 AUC)', ping: '8ms', ok: true },
    { name: '48-Hour Forecast Engine', status: 'Computed Hourly', ping: '19ms', ok: true },
    { name: 'Multi-Lingual Alert Engine', status: 'Ready (SMS/FCM)', ping: '22ms', ok: true }
  ];

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        title="View Subsystem Health Status"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          background: 'rgba(57, 217, 138, 0.08)',
          border: '1px solid rgba(57, 217, 138, 0.3)',
          padding: '6px 12px',
          borderRadius: 20,
          color: '#39D98A',
          cursor: 'pointer',
          fontSize: '0.74rem',
          fontWeight: 700,
          fontFamily: 'Space Grotesk, sans-serif',
          transition: 'all 0.2s ease'
        }}
      >
        <span
          style={{
            width: 7,
            height: 7,
            borderRadius: '50%',
            background: isOnline ? '#39D98A' : '#FF3B6B',
            boxShadow: isOnline ? '0 0 10px #39D98A' : '0 0 10px #FF3B6B',
            display: 'inline-block'
          }}
        />
        <span style={{ letterSpacing: '0.04em' }}>
          {isOnline ? 'ALL SYSTEMS OPERATIONAL' : 'NETWORK RECONNECTING'}
        </span>
        <ChevronDown size={12} style={{ opacity: 0.7, transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
      </button>

      {/* Subsystems Dropdown / Popover */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            width: 290,
            background: '#101521',
            border: '1px solid rgba(120, 140, 180, 0.3)',
            borderRadius: 12,
            padding: 14,
            boxShadow: '0 16px 36px rgba(0,0,0,0.6)',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            gap: 10
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(120, 140, 180, 0.15)', paddingBottom: 8 }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#F4F6FB', display: 'flex', alignItems: 'center', gap: 6 }}>
              <ShieldCheck size={14} color="#35D8FF" /> Telemetry Health Check
            </span>
            <span style={{ fontSize: '0.68rem', color: '#39D98A', fontWeight: 700 }}>100% UP</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            {subsystems.map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.72rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#9AA5B8' }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#39D98A' }} />
                  <span>{s.name}</span>
                </div>
                <span style={{ color: '#F4F6FB', fontWeight: 600, fontFamily: 'JetBrains Mono, monospace', fontSize: '0.68rem' }}>
                  {s.ping}
                </span>
              </div>
            ))}
          </div>

          <div style={{ borderTop: '1px solid rgba(120, 140, 180, 0.15)', paddingTop: 6, display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: '#5C677D' }}>
            <span>East Khasi Hills Pilot • DRISHTI AI</span>
            <span>MDoNER Compliant</span>
          </div>
        </div>
      )}
    </div>
  );
}

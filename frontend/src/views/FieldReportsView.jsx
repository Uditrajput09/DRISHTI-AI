import React from 'react';
import FieldReportForm from '../components/FieldReportForm';
import { Smartphone, ShieldCheck } from 'lucide-react';

export default function FieldReportsView({ onReportSubmitted }) {
  return (
    <div
      style={{
        maxWidth: 1400,
        margin: '0 auto',
        padding: '20px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: 20
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#35D8FF', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'Space Grotesk, sans-serif' }}>
              OFFLINE-FIRST FIELD CLIENT
            </span>
            <span style={{ color: '#5C677D' }}>•</span>
            <span style={{ fontSize: '0.72rem', color: '#9AA5B8' }}>East Khasi Hills</span>
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#FFFFFF', letterSpacing: '-0.02em', fontFamily: 'Space Grotesk, sans-serif', marginTop: 2 }}>
            FIELD REPORT SUBMISSION
          </h1>
          <p style={{ fontSize: '0.78rem', color: '#9AA5B8' }}>
            Instant geo-tagged hazard logging with automatic camera photo capture, GPS detection, and background auto-sync.
          </p>
        </div>
      </div>

      <FieldReportForm onReportSubmitted={onReportSubmitted} />
    </div>
  );
}

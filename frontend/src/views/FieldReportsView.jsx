import React from 'react';
import FieldReportForm from '../components/FieldReportForm';
import { Smartphone, ShieldAlert, CheckCircle2 } from 'lucide-react';

export default function FieldReportsView({ onReportSubmitted }) {
  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontFamily: 'Space Grotesk, sans-serif' }}>
          <Smartphone size={22} color="#35D8FF" />
          <span>FIELD WORKER INCIDENT REPORTING</span>
        </h1>
        <p style={{ fontSize: '0.8rem', color: '#9AA5B8', marginTop: 4 }}>
          Offline-first mobile dispatch client with automatic photo capture, GPS detection, and background sync.
        </p>
      </div>

      <FieldReportForm onReportSubmitted={onReportSubmitted} />
    </div>
  );
}

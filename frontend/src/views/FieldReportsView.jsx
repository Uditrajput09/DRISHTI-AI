import React from 'react';
import { Smartphone, ShieldCheck, Wifi, MapPin } from 'lucide-react';
import { PageHeader, Card, Badge } from '../components/ui';
import FieldReportForm from '../components/FieldReportForm';

export default function FieldReportsView({ onReportSubmitted }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* 1. Standardized Page Header */}
      <PageHeader
        breadcrumbs={['Operations', 'Field Client', 'Hazard Submission']}
        title="Field Report Submission"
        subtitle="Instant geo-tagged hazard logging with GPS altitude lock, photo telemetry, and offline-first background queue"
        actions={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Badge variant="safe" dot pulse>
              GPS Telemetry Active
            </Badge>
            <Badge variant="neutral">
              Offline-First Sync
            </Badge>
          </div>
        }
      />

      {/* 2. Field Report Form Container */}
      <FieldReportForm onReportSubmitted={onReportSubmitted} />
    </div>
  );
}

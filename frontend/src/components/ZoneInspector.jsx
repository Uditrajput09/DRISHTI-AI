import React, { useState } from 'react';
import { 
  AlertOctagon, 
  Send, 
  HelpCircle, 
  TrendingUp, 
  Layers, 
  Navigation, 
  CheckCircle2, 
  Zap,
  FileDown 
} from 'lucide-react';
import { api } from '../api';
import { exportZoneRiskPDF } from '../utils/pdfExport';
import VulnerabilityCard from './VulnerabilityCard';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Badge, RiskBadge } from './ui/Badge';

export default function ZoneInspector({ zone, onAlertDispatched, alertLogs = [] }) {
  const [isDispatching, setIsDispatching] = useState(false);
  const [dispatchSuccess, setDispatchSuccess] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  if (!zone) {
    return (
      <Card style={{ padding: 24, textAlign: 'center', color: 'var(--text-secondary)' }}>
        <p style={{ margin: 0 }}>Select a micro-zone polygon on the GIS map to inspect AI risk metrics and triggering factors.</p>
      </Card>
    );
  }

  const factors = zone.triggering_factors || {};

  const handleManualAlert = async () => {
    setIsDispatching(true);
    try {
      const res = await api.triggerManualAlert({
        zone_id: zone.id,
        risk_level: zone.risk_level,
        risk_score: zone.risk_score
      });
      setDispatchSuccess(`Dispatched alerts to ${res.dispatched_languages_count} languages (SMS & Push)!`);
      if (onAlertDispatched) onAlertDispatched();
      setTimeout(() => setDispatchSuccess(''), 5000);
    } catch (err) {
      alert('Alert dispatch failed: ' + err.message);
    } finally {
      setIsDispatching(false);
    }
  };

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      await exportZoneRiskPDF(zone, alertLogs);
    } catch (err) {
      alert('PDF export failed: ' + err.message);
    } finally {
      setIsExporting(false);
    }
  };

  const getRiskColor = (lvl) => {
    switch (lvl) {
      case 'Critical': return 'var(--risk-critical)';
      case 'High': return 'var(--risk-high)';
      case 'Medium': return 'var(--risk-medium)';
      default: return 'var(--risk-low)';
    }
  };

  return (
    <Card style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--brand-primary)', fontFamily: 'var(--font-mono)' }}>
              {zone.zone_code}
            </span>
            <span style={{ color: 'var(--text-muted)' }}>•</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{zone.district}</span>
          </div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)', margin: '4px 0' }}>
            {zone.name}
          </h2>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Elev: {zone.base_elevation_m}m | Geo: {zone.geology}
          </div>
        </div>

        {/* Risk Score Box */}
        <div style={{
          textAlign: 'right',
          background: 'var(--bg-card-hover)',
          padding: '8px 14px',
          borderRadius: 'var(--radius-md, 8px)',
          border: '1px solid var(--border-primary)'
        }}>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
            Risk Index
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: getRiskColor(zone.risk_level), fontFamily: 'var(--font-mono)' }}>
            {zone.risk_score}%
          </div>
          <div style={{ marginTop: 2 }}>
            <RiskBadge level={zone.risk_level} />
          </div>
        </div>
      </div>

      {/* Explainable AI Trigger Factors */}
      <div>
        <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
          <Zap size={16} color="var(--brand-primary)" />
          <span>Explainable AI (XAI) Trigger Factors</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
          {Object.entries(factors).map(([key, factor]) => {
            const factorImpact = factor?.impact || 'Moderate';
            const impactRisk = factorImpact === 'Severe' ? 'Critical' : (factorImpact === 'High' ? 'High' : (factorImpact === 'Moderate' ? 'Medium' : 'Low'));
            return (
              <div key={key} style={{
                background: 'var(--bg-card-hover)',
                padding: '10px 12px',
                borderRadius: 'var(--radius-md, 8px)',
                border: '1px solid var(--border-primary)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                    {factor?.name || key}
                  </span>
                  <RiskBadge level={impactRisk} style={{ fontSize: '0.62rem', padding: '1px 5px' }} />
                </div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                  {factor?.value !== undefined ? factor.value : String(factor)}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 2, lineHeight: 1.2 }}>
                  {factor?.description || ''}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Lifeline Highway Exposure */}
      {zone.key_roads && zone.key_roads.length > 0 && (
        <div style={{ background: 'var(--bg-card-hover)', padding: '10px 14px', borderRadius: 'var(--radius-md, 8px)', border: '1px solid var(--border-primary)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>
            Exposed Lifeline Road Corridors
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {zone.key_roads.map((road, idx) => (
              <Badge key={idx} variant="brand">
                {road}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Village Vulnerability Index Section */}
      <VulnerabilityCard zoneId={zone.id} />

      {/* Action Buttons Row */}
      <div style={{ marginTop: 4, display: 'flex', gap: 10 }}>
        <Button
          variant="primary"
          onClick={handleManualAlert}
          disabled={isDispatching}
          style={{ flex: 1, justifyContent: 'center' }}
        >
          <Send size={16} />
          <span>{isDispatching ? 'Broadcasting...' : 'Broadcast Emergency Alert'}</span>
        </Button>

        <Button
          variant="secondary"
          id="export-pdf-btn"
          onClick={handleExportPDF}
          disabled={isExporting}
          title="Export zone risk report as PDF"
        >
          <FileDown size={16} />
          <span>{isExporting ? '...' : 'PDF'}</span>
        </Button>
      </div>

      {dispatchSuccess && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--risk-low)', fontSize: '0.78rem', fontWeight: 600, marginTop: 4, justifyContent: 'center' }}>
          <CheckCircle2 size={16} />
          <span>{dispatchSuccess}</span>
        </div>
      )}
    </Card>
  );
}

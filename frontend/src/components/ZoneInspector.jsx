import React, { useState } from 'react';
import { 
  AlertOctagon, 
  Send, 
  HelpCircle, 
  TrendingUp, 
  Layers, 
  Navigation, 
  CheckCircle2, 
  Zap 
} from 'lucide-react';
import { api } from '../api';
import { exportZoneRiskPDF } from '../utils/pdfExport';
import VulnerabilityCard from './VulnerabilityCard';
import { FileDown } from 'lucide-react';

export default function ZoneInspector({ zone, onAlertDispatched, alertLogs = [] }) {
  const [isDispatching, setIsDispatching] = useState(false);
  const [dispatchSuccess, setDispatchSuccess] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  if (!zone) {
    return (
      <div className="glass-panel" style={{ padding: 24, textAlign: 'center', color: 'var(--text-secondary)' }}>
        <p>Select a micro-zone polygon on the GIS map to inspect AI risk metrics and triggering factors.</p>
      </div>
    );
  }

  const factors = zone.triggering_factors || {};
  const getBadgeClass = (level) => {
    switch (level) {
      case 'Critical': return 'badge-critical';
      case 'High': return 'badge-high';
      case 'Medium': return 'badge-medium';
      default: return 'badge-low';
    }
  };

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

  return (
    <div className="glass-panel" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#06b6d4' }}>{zone.zone_code}</span>
            <span style={{ color: 'var(--text-muted)' }}>•</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{zone.district}</span>
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc' }}>{zone.name}</h2>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Elev: {zone.base_elevation_m}m | Geo: {zone.geology}
          </div>
        </div>

        {/* Risk Score Pill */}
        <div style={{
          textAlign: 'right',
          background: 'rgba(15, 23, 42, 0.8)',
          padding: '8px 14px',
          borderRadius: 12,
          border: '1px solid var(--border-glass)'
        }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700 }}>
            Risk Index
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: zone.risk_level === 'Critical' ? '#ef4444' : (zone.risk_level === 'High' ? '#f97316' : '#10b981') }}>
            {zone.risk_score}%
          </div>
          <span className={`badge ${getBadgeClass(zone.risk_level)}`} style={{ fontSize: '0.7rem', fontWeight: 700, padding: '2px 6px', borderRadius: 4 }}>
            {zone.risk_level}
          </span>
        </div>
      </div>

      {/* Explainable AI Trigger Factors */}
      <div>
        <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#e2e8f0', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
          <Zap size={16} color="#06b6d4" />
          <span>Explainable AI (XAI) Trigger Factors</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
          {Object.entries(factors).map(([key, factor]) => (
            <div key={key} style={{
              background: 'rgba(15, 23, 42, 0.6)',
              padding: '10px 12px',
              borderRadius: 10,
              border: '1px solid var(--border-glass)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{factor?.name || key}</span>
                <span className={`badge ${getBadgeClass(factor?.impact || 'Moderate')}`} style={{ fontSize: '0.65rem', fontWeight: 700, padding: '1px 5px', borderRadius: 4 }}>
                  {factor?.impact || 'Moderate'}
                </span>
              </div>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#f8fafc' }}>
                {factor?.value !== undefined ? factor.value : String(factor)}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 2, lineHeight: 1.2 }}>
                {factor?.description || ''}
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Lifeline Highway Exposure */}
      {zone.key_roads && zone.key_roads.length > 0 && (
        <div style={{ background: 'rgba(2, 132, 199, 0.08)', padding: '10px 14px', borderRadius: 10, border: '1px solid rgba(2, 132, 199, 0.25)' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#38bdf8', marginBottom: 4 }}>
            🛣️ Exposed Lifeline Road Corridors:
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {zone.key_roads.map((road, idx) => (
              <span key={idx} style={{ background: 'rgba(15, 23, 42, 0.8)', color: '#e0f2fe', fontSize: '0.74rem', padding: '2px 8px', borderRadius: 6, border: '1px solid var(--border-glass)' }}>
                {road}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Village Vulnerability Index Section */}
      <VulnerabilityCard zoneId={zone.id} />

      {/* Action Buttons Row */}
      <div style={{ marginTop: 4, display: 'flex', gap: 8 }}>
        <button
          onClick={handleManualAlert}
          disabled={isDispatching}
          style={{
            flex: 1,
            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            color: '#ffffff',
            border: 'none',
            borderRadius: 10,
            padding: '10px 16px',
            fontSize: '0.86rem',
            fontWeight: 700,
            cursor: isDispatching ? 'wait' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            boxShadow: '0 4px 14px rgba(239, 68, 68, 0.35)'
          }}
        >
          <Send size={16} />
          <span>{isDispatching ? 'Broadcasting...' : 'Broadcast Emergency Alert'}</span>
        </button>

        <button
          id="export-pdf-btn"
          onClick={handleExportPDF}
          disabled={isExporting}
          title="Export zone risk report as PDF"
          style={{
            background: 'rgba(6, 182, 212, 0.15)',
            color: '#06b6d4',
            border: '1px solid rgba(6, 182, 212, 0.4)',
            borderRadius: 10,
            padding: '10px 14px',
            fontSize: '0.86rem',
            fontWeight: 700,
            cursor: isExporting ? 'wait' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6
          }}
        >
          <FileDown size={16} />
          <span>{isExporting ? '...' : 'PDF'}</span>
        </button>
      </div>

        {dispatchSuccess && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#34d399', fontSize: '0.78rem', fontWeight: 600, marginTop: 8, justifyContent: 'center' }}>
            <CheckCircle2 size={16} />
            <span>{dispatchSuccess}</span>
          </div>
        )}
    </div>
  );
}


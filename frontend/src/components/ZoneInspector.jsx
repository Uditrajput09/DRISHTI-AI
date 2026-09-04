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
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#4FD8EA', fontFamily: 'Space Grotesk, sans-serif' }}>{zone.zone_code}</span>
            <span style={{ color: 'var(--text-muted)' }}>•</span>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{zone.district}</span>
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc', fontFamily: 'Space Grotesk, sans-serif' }}>{zone.name}</h2>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Elev: {zone.base_elevation_m}m | Geo: {zone.geology}
          </div>
        </div>

        {/* Risk Score Pill */}
        <div style={{
          textAlign: 'right',
          background: 'rgba(15, 15, 22, 0.85)',
          padding: '8px 14px',
          borderRadius: 14,
          border: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700, fontFamily: 'Space Grotesk, sans-serif' }}>
            Risk Index
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: zone.risk_level === 'Critical' ? '#FF6EC7' : (zone.risk_level === 'High' ? '#7873F5' : '#52D199'), fontFamily: 'Space Grotesk, sans-serif' }}>
            {zone.risk_score}%
          </div>
          <span className={`badge ${getBadgeClass(zone.risk_level)}`} style={{ fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px' }}>
            {zone.risk_level}
          </span>
        </div>
      </div>

      {/* Explainable AI Trigger Factors */}
      <div>
        <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#f8fafc', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'Space Grotesk, sans-serif' }}>
          <Zap size={16} color="#4FD8EA" />
          <span>Explainable AI (XAI) Trigger Factors</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
          {Object.entries(factors).map(([key, factor]) => (
            <div key={key} style={{
              background: 'rgba(20, 20, 30, 0.75)',
              padding: '10px 12px',
              borderRadius: 12,
              border: '1px solid rgba(255, 255, 255, 0.08)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>{factor?.name || key}</span>
                <span className={`badge ${getBadgeClass(factor?.impact || 'Moderate')}`} style={{ fontSize: '0.65rem', fontWeight: 700, padding: '1px 6px' }}>
                  {factor?.impact || 'Moderate'}
                </span>
              </div>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#f8fafc', fontFamily: 'Space Grotesk, sans-serif' }}>
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
        <div style={{ background: 'rgba(120, 115, 245, 0.1)', padding: '10px 14px', borderRadius: 12, border: '1px solid rgba(120, 115, 245, 0.3)' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#A5A6F6', marginBottom: 4, fontFamily: 'Space Grotesk, sans-serif' }}>
            🛣️ Exposed Lifeline Road Corridors:
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {zone.key_roads.map((road, idx) => (
              <span key={idx} style={{ background: 'rgba(15, 15, 20, 0.85)', color: '#f8fafc', fontSize: '0.74rem', padding: '3px 10px', borderRadius: 8, border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                {road}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Village Vulnerability Index Section */}
      <VulnerabilityCard zoneId={zone.id} />

      {/* Action Buttons Row */}
      <div style={{ marginTop: 4, display: 'flex', gap: 10 }}>
        <button
          onClick={handleManualAlert}
          disabled={isDispatching}
          className="holo-btn-primary"
          style={{
            flex: 1,
            padding: '11px 16px',
            fontSize: '0.86rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            cursor: isDispatching ? 'wait' : 'pointer'
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
          className="holo-btn-secondary"
          style={{
            padding: '10px 16px',
            fontSize: '0.86rem',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            cursor: isExporting ? 'wait' : 'pointer'
          }}
        >
          <FileDown size={16} color="#4FD8EA" />
          <span>{isExporting ? '...' : 'PDF'}</span>
        </button>
      </div>

      {dispatchSuccess && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#6EE7B7', fontSize: '0.78rem', fontWeight: 600, marginTop: 8, justifyContent: 'center' }}>
          <CheckCircle2 size={16} />
          <span>{dispatchSuccess}</span>
        </div>
      )}
    </div>
  );
}


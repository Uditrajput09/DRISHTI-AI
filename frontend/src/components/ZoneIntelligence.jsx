import React, { useState } from 'react';
import { 
  ShieldAlert, 
  BrainCircuit, 
  TrendingUp, 
  Sliders, 
  Calendar, 
  Clock, 
  Layers, 
  Navigation, 
  Share2, 
  ChevronRight 
} from 'lucide-react';
import { exportZoneRiskPDF } from '../utils/pdfExport';

export default function ZoneIntelligence({
  zone,
  onOpenXAI,
  onOpenForecast,
  onOpenSimulation,
  onClose
}) {
  const [isExporting, setIsExporting] = useState(false);

  if (!zone) {
    return (
      <div
        style={{
          background: '#101521',
          border: '1px solid rgba(120, 140, 180, 0.22)',
          borderRadius: 14,
          padding: 24,
          textAlign: 'center',
          color: '#9AA5B8',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          minHeight: 380
        }}
      >
        <ShieldAlert size={36} color="rgba(120, 140, 180, 0.3)" style={{ marginBottom: 12 }} />
        <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#F4F6FB', marginBottom: 6 }}>
          No Zone Selected
        </div>
        <p style={{ fontSize: '0.78rem', maxWidth: 220, lineHeight: 1.5 }}>
          Select any micro-zone polygon on the GIS map to load real-time telemetry and AI geotechnical intelligence.
        </p>
      </div>
    );
  }

  const getRiskBadge = (level) => {
    switch (level) {
      case 'Critical': return { color: '#FF3B6B', bg: 'rgba(255, 59, 107, 0.15)', border: 'rgba(255, 59, 107, 0.45)' };
      case 'High': return { color: '#FF9D3D', bg: 'rgba(255, 157, 61, 0.15)', border: 'rgba(255, 157, 61, 0.45)' };
      case 'Medium': return { color: '#FFD84D', bg: 'rgba(255, 216, 77, 0.15)', border: 'rgba(255, 216, 77, 0.45)' };
      default: return { color: '#39D98A', bg: 'rgba(57, 217, 138, 0.15)', border: 'rgba(57, 217, 138, 0.45)' };
    }
  };

  const badge = getRiskBadge(zone.risk_level);

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      await exportZoneRiskPDF(zone);
    } catch (e) {
      console.error(e);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div
      style={{
        background: '#101521',
        border: '1px solid rgba(120, 140, 180, 0.22)',
        borderRadius: 14,
        padding: 18,
        boxShadow: '0 12px 36px rgba(0, 0, 0, 0.55)',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        position: 'relative'
      }}
    >
      {/* Header: Zone Name & District */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
            <span
              style={{
                fontSize: '0.72rem',
                color: '#35D8FF',
                fontWeight: 700,
                fontFamily: 'Space Grotesk, sans-serif'
              }}
            >
              {zone.zone_code || 'EKH-Z01'}
            </span>
            <span style={{ color: '#5C677D' }}>•</span>
            <span style={{ fontSize: '0.72rem', color: '#9AA5B8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {zone.district || 'East Khasi Hills'}
            </span>
          </div>
          <h2
            style={{
              fontSize: '1.35rem',
              fontWeight: 800,
              color: '#FFFFFF',
              fontFamily: 'Space Grotesk, sans-serif',
              lineHeight: 1.2
            }}
          >
            {zone.name?.toUpperCase()}
          </h2>
          <div style={{ fontSize: '0.74rem', color: '#5C677D', marginTop: 3 }}>
            Elev: {zone.base_elevation_m || 1430}m • Geo: {zone.geology || 'Precambrian Gneiss'}
          </div>
        </div>

        {/* Severity Badge */}
        <div
          style={{
            background: badge.bg,
            border: `1px solid ${badge.border}`,
            color: badge.color,
            fontSize: '0.72rem',
            fontWeight: 800,
            padding: '4px 10px',
            borderRadius: 6,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            fontFamily: 'Space Grotesk, sans-serif'
          }}
        >
          {zone.risk_level}
        </div>
      </div>

      {/* Main Risk Index Display */}
      <div
        style={{
          background: '#151B29',
          border: '1px solid rgba(120, 140, 180, 0.2)',
          borderRadius: 10,
          padding: '14px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <div>
          <div
            style={{
              fontSize: '0.7rem',
              color: '#9AA5B8',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              fontWeight: 700,
              fontFamily: 'Space Grotesk, sans-serif'
            }}
          >
            Risk Index
          </div>
          <div
            style={{
              fontSize: '2.1rem',
              fontWeight: 900,
              color: badge.color,
              fontFamily: 'Space Grotesk, sans-serif',
              lineHeight: 1.1,
              marginTop: 2
            }}
          >
            {zone.risk_score || 92}%
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.68rem', color: '#5C677D' }}>Probability</div>
          <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#F4F6FB', fontFamily: 'Space Grotesk, sans-serif' }}>
            {((zone.probability || (zone.risk_score ? zone.risk_score / 100 : 0.92)) * 100).toFixed(1)}%
          </div>
          <div style={{ fontSize: '0.68rem', color: badge.color, fontWeight: 700, marginTop: 2 }}>
            Level: {zone.risk_level?.toUpperCase()}
          </div>
        </div>
      </div>

      {/* Key Parameters Grid */}
      <div>
        <div
          style={{
            fontSize: '0.68rem',
            color: '#9AA5B8',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            fontWeight: 800,
            fontFamily: 'Space Grotesk, sans-serif',
            marginBottom: 8
          }}
        >
          Key Parameters
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 8
          }}
        >
          <div
            style={{
              background: '#151B29',
              border: '1px solid rgba(120, 140, 180, 0.16)',
              borderRadius: 8,
              padding: '8px 12px'
            }}
          >
            <span style={{ fontSize: '0.68rem', color: '#5C677D' }}>24H Rainfall</span>
            <div style={{ fontSize: '1rem', fontWeight: 800, color: '#35D8FF', fontFamily: 'Space Grotesk, sans-serif' }}>
              {zone.rainfall_24h || 124} mm
            </div>
          </div>

          <div
            style={{
              background: '#151B29',
              border: '1px solid rgba(120, 140, 180, 0.16)',
              borderRadius: 8,
              padding: '8px 12px'
            }}
          >
            <span style={{ fontSize: '0.68rem', color: '#5C677D' }}>Slope Angle</span>
            <div style={{ fontSize: '1rem', fontWeight: 800, color: '#FF3B6B', fontFamily: 'Space Grotesk, sans-serif' }}>
              {zone.base_slope_deg || 41.5}°
            </div>
          </div>

          <div
            style={{
              background: '#151B29',
              border: '1px solid rgba(120, 140, 180, 0.16)',
              borderRadius: 8,
              padding: '8px 12px'
            }}
          >
            <span style={{ fontSize: '0.68rem', color: '#5C677D' }}>Soil Saturation</span>
            <div style={{ fontSize: '1rem', fontWeight: 800, color: '#FF9D3D', fontFamily: 'Space Grotesk, sans-serif' }}>
              {zone.soil_moisture_pct || 88}%
            </div>
          </div>

          <div
            style={{
              background: '#151B29',
              border: '1px solid rgba(120, 140, 180, 0.16)',
              borderRadius: 8,
              padding: '8px 12px'
            }}
          >
            <span style={{ fontSize: '0.68rem', color: '#5C677D' }}>Antecedent Rain</span>
            <div style={{ fontSize: '1rem', fontWeight: 800, color: '#F4F6FB', fontFamily: 'Space Grotesk, sans-serif' }}>
              {zone.rainfall_72h ? Math.round(zone.rainfall_72h * 0.8) : 78} mm
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.68rem', color: '#5C677D', marginTop: 8 }}>
          <span>Source: Open-Meteo & IMD</span>
          <span>Last Updated: 1 min ago</span>
        </div>
      </div>

      {/* Action Buttons: [ View XAI ], [ View Forecast ], [ Run Simulation ] */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingTop: 4 }}>
        <button
          onClick={onOpenXAI}
          className="btn-primary-cyan"
          style={{ width: '100%', justifyContent: 'space-between', padding: '10px 14px' }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <BrainCircuit size={15} />
            <span>View XAI (Factor Attribution)</span>
          </span>
          <ChevronRight size={14} />
        </button>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <button
            onClick={onOpenForecast}
            className="btn-surface"
            style={{ justifyContent: 'center', padding: '9px 10px', fontSize: '0.76rem' }}
          >
            <TrendingUp size={13} color="#35D8FF" />
            <span>View Forecast</span>
          </button>

          <button
            onClick={onOpenSimulation}
            className="btn-surface"
            style={{ justifyContent: 'center', padding: '9px 10px', fontSize: '0.76rem' }}
          >
            <Sliders size={13} color="#FF4DB8" />
            <span>Run Simulation</span>
          </button>
        </div>

        {/* Export Dossier PDF */}
        <button
          onClick={handleExportPDF}
          disabled={isExporting}
          style={{
            background: 'transparent',
            border: '1px dashed rgba(120, 140, 180, 0.25)',
            color: '#9AA5B8',
            borderRadius: 8,
            padding: '7px 0',
            fontSize: '0.72rem',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          {isExporting ? 'Generating Dossier...' : '📄 Export Geotechnical PDF Dossier'}
        </button>
      </div>
    </div>
  );
}

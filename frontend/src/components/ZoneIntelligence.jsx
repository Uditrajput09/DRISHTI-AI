import React, { useState } from 'react';
import { 
  ShieldAlert, 
  BrainCircuit, 
  TrendingUp, 
  Sliders, 
  Navigation, 
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  ChevronRight,
  FileText
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
        className="command-panel"
        style={{
          padding: 24,
          textAlign: 'center',
          color: '#9AA5B8',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          minHeight: 440
        }}
      >
        <ShieldAlert size={40} color="rgba(53, 216, 255, 0.3)" style={{ marginBottom: 14 }} />
        <div style={{ fontSize: '1rem', fontWeight: 800, color: '#FFFFFF', marginBottom: 6, fontFamily: 'Space Grotesk, sans-serif' }}>
          NO ZONE SELECTED
        </div>
        <p style={{ fontSize: '0.78rem', maxWidth: 240, lineHeight: 1.5, color: '#9AA5B8' }}>
          Select any micro-zone polygon on the GIS map to load real-time telemetry and geotechnical AI intelligence.
        </p>
      </div>
    );
  }

  const score = zone.risk_score || 92;
  const level = zone.risk_level || 'Critical';

  const getRiskColor = (lvl) => {
    switch (lvl) {
      case 'Critical': return '#FF3B6B';
      case 'High': return '#FF9D3D';
      case 'Medium': return '#FFD84D';
      default: return '#39D98A';
    }
  };

  const riskColor = getRiskColor(level);

  // SVG Circular Gauge parameters
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

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

  // Key factors data matching specification
  const rainfall24h = zone.rainfall_24h || 660;
  const slopeAngle = zone.base_slope_deg || 38.5;
  const soilMoisture = zone.soil_moisture_pct || 92;
  const drainageDist = zone.distance_to_drainage_m || 71;
  const landCoverPct = zone.land_cover_vulnerability || 62;

  const factors = [
    { label: 'Rainfall (24h)', value: `${rainfall24h} mm`, pct: Math.min(100, Math.round((rainfall24h / 700) * 100)), trend: 'up', color: '#FF3B6B' },
    { label: 'Slope Angle', value: `${slopeAngle}°`, pct: Math.min(100, Math.round((slopeAngle / 50) * 100)), trend: 'up', color: '#FF9D3D' },
    { label: 'Soil Saturation', value: `${soilMoisture}%`, pct: soilMoisture, trend: 'up', color: '#FF3B6B' },
    { label: 'Distance to Drainage', value: `${drainageDist}m`, pct: Math.min(100, drainageDist), trend: 'down', color: '#8B6CFF' },
    { label: 'Land Cover', value: `${landCoverPct}%`, pct: landCoverPct, trend: 'neutral', color: '#35D8FF' }
  ];

  return (
    <div
      className="command-panel"
      style={{
        padding: '18px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
        position: 'relative',
        boxShadow: '0 12px 36px rgba(0, 0, 0, 0.6)'
      }}
    >
      {/* Header: Zone Title & District */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#35D8FF', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'Space Grotesk, sans-serif' }}>
            ZONE INTELLIGENCE
          </span>
          <span style={{ fontSize: '0.68rem', color: '#5C677D', fontFamily: 'JetBrains Mono, monospace' }}>
            {zone.zone_code || 'EKH-Z01'}
          </span>
        </div>

        <h2
          style={{
            fontSize: '1.25rem',
            fontWeight: 900,
            color: '#FFFFFF',
            fontFamily: 'Space Grotesk, sans-serif',
            lineHeight: 1.25,
            letterSpacing: '-0.01em'
          }}
        >
          {zone.name || 'Sohra (Cherrapunji) Escarpment'}
        </h2>
        <div style={{ fontSize: '0.72rem', color: '#9AA5B8', marginTop: 3 }}>
          East Khasi Hills • Elev: {zone.base_elevation_m || 1430}m
        </div>
      </div>

      {/* Circular Radial Gauge */}
      <div
        style={{
          background: 'var(--bg-surface-elevated)',
          border: '1px solid rgba(120, 140, 180, 0.2)',
          borderRadius: 12,
          padding: '14px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-around',
          gap: 14
        }}
      >
        {/* SVG Radial Gauge */}
        <div style={{ position: 'relative', width: 110, height: 110 }}>
          <svg width="110" height="110" viewBox="0 0 130 130" style={{ transform: 'rotate(-90deg)' }}>
            <circle
              cx="65"
              cy="65"
              r={radius}
              stroke="rgba(120, 140, 180, 0.15)"
              strokeWidth="10"
              fill="transparent"
            />
            <circle
              cx="65"
              cy="65"
              r={radius}
              stroke={riskColor}
              strokeWidth="10"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 0.8s ease' }}
            />
          </svg>

          {/* Center Score */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center'
            }}
          >
            <span style={{ fontSize: '0.62rem', color: '#9AA5B8', fontWeight: 700, textTransform: 'uppercase' }}>
              Risk Score
            </span>
            <span style={{ fontSize: '1.55rem', fontWeight: 900, color: riskColor, fontFamily: 'Space Grotesk, sans-serif', lineHeight: 1 }}>
              {score}%
            </span>
            <span
              style={{
                fontSize: '0.6rem',
                fontWeight: 800,
                color: riskColor,
                textTransform: 'uppercase',
                background: `${riskColor}18`,
                padding: '1px 6px',
                borderRadius: 4,
                marginTop: 2
              }}
            >
              {level}
            </span>
          </div>
        </div>

        {/* Gauge Right Info: Probability, Rainfall, Slope, Soil Moisture, ARI, Geology */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5, minWidth: 140 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem' }}>
            <span style={{ color: '#9AA5B8' }}>Probability</span>
            <span style={{ color: '#FFFFFF', fontWeight: 800, fontFamily: 'Space Grotesk, sans-serif' }}>
              {zone.probability ? `${(zone.probability * 100).toFixed(0)}%` : '100%'}
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem' }}>
            <span style={{ color: '#9AA5B8' }}>Rainfall (24h)</span>
            <span style={{ color: '#35D8FF', fontWeight: 800, fontFamily: 'Space Grotesk, sans-serif' }}>
              {zone.rainfall_24h || 186} mm
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem' }}>
            <span style={{ color: '#9AA5B8' }}>Slope Angle</span>
            <span style={{ color: '#FF9D3D', fontWeight: 800, fontFamily: 'Space Grotesk, sans-serif' }}>
              {zone.base_slope_deg || 38.5}°
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem' }}>
            <span style={{ color: '#9AA5B8' }}>Soil Moisture</span>
            <span style={{ color: '#35D8FF', fontWeight: 800, fontFamily: 'Space Grotesk, sans-serif' }}>
              {zone.soil_moisture_pct || 72}%
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem' }}>
            <span style={{ color: '#9AA5B8' }}>ARI (Antecedent)</span>
            <span style={{ color: '#FFD84D', fontWeight: 800, fontFamily: 'Space Grotesk, sans-serif' }}>
              High
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem' }}>
            <span style={{ color: '#9AA5B8' }}>Geology</span>
            <span style={{ color: '#CBD5E1', fontWeight: 600 }}>
              {zone.geology || 'Highly Fractured'}
            </span>
          </div>
        </div>
      </div>

      {/* Key Factors Progress Bars */}
      <div>
        <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#9AA5B8', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'Space Grotesk, sans-serif', marginBottom: 8 }}>
          Key Factors
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {factors.map((f, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.74rem' }}>
                <span style={{ color: '#CBD5E1', fontWeight: 500 }}>{f.label}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ color: '#F4F6FB', fontWeight: 700, fontFamily: 'JetBrains Mono, monospace' }}>
                    {f.value}
                  </span>
                  <span style={{ color: f.color, fontWeight: 800, fontSize: '0.72rem', display: 'flex', alignItems: 'center' }}>
                    {f.pct}%
                    {f.trend === 'up' && <ArrowUpRight size={12} />}
                    {f.trend === 'down' && <ArrowDownRight size={12} />}
                    {f.trend === 'neutral' && <Minus size={12} />}
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div style={{ width: '100%', height: 5, background: 'rgba(120, 140, 180, 0.15)', borderRadius: 3, overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${f.pct}%`,
                    height: '100%',
                    background: f.color,
                    borderRadius: 3,
                    boxShadow: `0 0 6px ${f.color}80`
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Key Roads at Risk */}
      <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid rgba(120, 140, 180, 0.18)', borderRadius: 10, padding: '10px 12px' }}>
        <div style={{ fontSize: '0.66rem', fontWeight: 800, color: '#FF3B6B', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'Space Grotesk, sans-serif', marginBottom: 4 }}>
          Key Roads at Risk
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <span style={{ background: 'rgba(255, 59, 107, 0.15)', border: '1px solid rgba(255, 59, 107, 0.4)', color: '#FF3B6B', fontSize: '0.7rem', fontWeight: 800, padding: '2px 8px', borderRadius: 4, fontFamily: 'Space Grotesk, sans-serif' }}>
            NH-6
          </span>
          <span style={{ background: 'rgba(255, 157, 61, 0.15)', border: '1px solid rgba(255, 157, 61, 0.4)', color: '#FF9D3D', fontSize: '0.7rem', fontWeight: 800, padding: '2px 8px', borderRadius: 4, fontFamily: 'Space Grotesk, sans-serif' }}>
            NH-106
          </span>
          <span style={{ background: 'rgba(53, 216, 255, 0.12)', border: '1px solid rgba(53, 216, 255, 0.3)', color: '#35D8FF', fontSize: '0.7rem', fontWeight: 800, padding: '2px 8px', borderRadius: 4, fontFamily: 'Space Grotesk, sans-serif' }}>
            SH-5 (Sohra Link)
          </span>
        </div>
      </div>

      {/* Operational Advisory */}
      <div style={{ background: 'rgba(21, 27, 41, 0.7)', border: '1px solid rgba(120, 140, 180, 0.18)', borderRadius: 10, padding: '10px 12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
          <AlertTriangle size={13} color="#FF9D3D" />
          <span style={{ fontSize: '0.66rem', fontWeight: 800, color: '#FF9D3D', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'Space Grotesk, sans-serif' }}>
            Operational Advisory
          </span>
        </div>
        <p style={{ fontSize: '0.74rem', color: '#CBD5E1', lineHeight: 1.45 }}>
          Extreme rainfall combined with steep slope conditions indicates elevated landslide probability. Monitor NH-6 and nearby settlements. Avoid non-essential mountain travel.
        </p>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingTop: 2 }}>
        <button
          onClick={onOpenXAI}
          className="btn-primary-cyan"
          style={{ width: '100%', justifyContent: 'space-between', padding: '9px 14px' }}
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
            style={{ justifyContent: 'center', padding: '8px 10px', fontSize: '0.75rem' }}
          >
            <TrendingUp size={13} color="#35D8FF" />
            <span>Forecast</span>
          </button>

          <button
            onClick={onOpenSimulation}
            className="btn-surface"
            style={{ justifyContent: 'center', padding: '8px 10px', fontSize: '0.75rem' }}
          >
            <Sliders size={13} color="#FF4DB8" />
            <span>Simulation</span>
          </button>
        </div>

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
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6
          }}
        >
          <FileText size={13} />
          <span>{isExporting ? 'Generating Dossier...' : 'Export Geotechnical PDF Dossier'}</span>
        </button>
      </div>
    </div>
  );
}

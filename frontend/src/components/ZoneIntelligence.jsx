import React, { useState } from 'react';
import { 
  ShieldAlert, 
  BrainCircuit, 
  TrendingUp, 
  Sliders, 
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  ChevronRight,
  FileText
} from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Badge, RiskBadge } from './ui/Badge';
import { ProgressBar } from './ui/ProgressBar';
import { exportZoneRiskPDF } from '../utils/pdfExport';
import VulnerabilityCard from './VulnerabilityCard';

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
      <Card
        style={{
          padding: 24,
          textAlign: 'center',
          color: 'var(--text-muted)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          minHeight: 440
        }}
      >
        <ShieldAlert size={36} color="var(--brand-primary)" style={{ marginBottom: 14, opacity: 0.7 }} />
        <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>
          No Zone Selected
        </div>
        <p style={{ fontSize: '0.78rem', maxWidth: 240, lineHeight: 1.5, color: 'var(--text-secondary)' }}>
          Select any micro-zone polygon on the GIS map to load real-time telemetry and geotechnical AI intelligence.
        </p>
      </Card>
    );
  }

  const score = zone.risk_score || 92;
  const level = zone.risk_level || 'Critical';

  const getRiskColor = (lvl) => {
    switch (lvl) {
      case 'Critical': return 'var(--risk-critical)';
      case 'High': return 'var(--risk-high)';
      case 'Medium': return 'var(--risk-medium)';
      default: return 'var(--risk-low)';
    }
  };

  const riskColor = getRiskColor(level);

  // SVG Circular Gauge parameters
  const radius = 52;
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

  // Key factors data
  const rainfall24h = zone.rainfall_24h || 660;
  const slopeAngle = zone.base_slope_deg || 38.5;
  const soilMoisture = zone.soil_moisture_pct || 92;
  const drainageDist = zone.distance_to_drainage_m || 71;
  const landCoverPct = zone.land_cover_vulnerability || 62;

  const factors = [
    { label: 'Rainfall (24h)', value: `${rainfall24h} mm`, pct: Math.min(100, Math.round((rainfall24h / 700) * 100)), trend: 'up', color: 'var(--risk-critical)' },
    { label: 'Slope Angle', value: `${slopeAngle}°`, pct: Math.min(100, Math.round((slopeAngle / 50) * 100)), trend: 'up', color: 'var(--risk-high)' },
    { label: 'Soil Saturation', value: `${soilMoisture}%`, pct: soilMoisture, trend: 'up', color: 'var(--risk-critical)' },
    { label: 'Drainage Proximity', value: `${drainageDist}m`, pct: Math.min(100, drainageDist), trend: 'down', color: 'var(--brand-primary)' },
    { label: 'Vegetation Cover', value: `${landCoverPct}%`, pct: landCoverPct, trend: 'neutral', color: 'var(--text-secondary)' }
  ];

  return (
    <Card
      style={{
        padding: '18px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
        position: 'relative'
      }}
    >
      {/* Header: Zone Title & District */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={{ fontSize: '0.66rem', fontWeight: 600, color: 'var(--brand-primary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            ZONE INTELLIGENCE
          </span>
          <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            {zone.zone_code || 'EKH-Z01'}
          </span>
        </div>

        <h2
          style={{
            fontSize: '1.2rem',
            fontWeight: 700,
            color: 'var(--text-primary)',
            lineHeight: 1.2,
            letterSpacing: '-0.01em',
            margin: 0
          }}
        >
          {zone.name || 'Sohra (Cherrapunji) Escarpment'}
        </h2>
        <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: 3 }}>
          East Khasi Hills • Elev: {zone.base_elevation_m || 1430}m
        </div>
      </div>

      {/* Circular Radial Gauge */}
      <div
        style={{
          background: 'var(--bg-card-hover)',
          border: '1px solid var(--border-primary)',
          borderRadius: 'var(--radius-lg, 12px)',
          padding: '14px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-around',
          gap: 14
        }}
      >
        {/* SVG Radial Gauge */}
        <div style={{ position: 'relative', width: 104, height: 104 }}>
          <svg width="104" height="104" viewBox="0 0 120 120" style={{ transform: 'rotate(-90deg)' }}>
            <circle
              cx="60"
              cy="60"
              r={radius}
              stroke="var(--border-primary)"
              strokeWidth="8"
              fill="transparent"
            />
            <circle
              cx="60"
              cy="60"
              r={radius}
              stroke={riskColor}
              strokeWidth="8"
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
            <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
              Risk
            </span>
            <span style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', lineHeight: 1 }}>
              {score}%
            </span>
            <div style={{ marginTop: 2 }}>
              <RiskBadge level={level} style={{ fontSize: '0.6rem', padding: '1px 6px' }} />
            </div>
          </div>
        </div>

        {/* Gauge Right Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5, minWidth: 140 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Probability</span>
            <span style={{ color: 'var(--text-primary)', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
              {zone.probability ? `${(zone.probability * 100).toFixed(0)}%` : '100%'}
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Rainfall (24h)</span>
            <span style={{ color: 'var(--risk-critical)', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
              {zone.rainfall_24h || 186} mm
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Slope Angle</span>
            <span style={{ color: 'var(--risk-high)', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
              {zone.base_slope_deg || 38.5}°
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Soil Moisture</span>
            <span style={{ color: 'var(--brand-primary)', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
              {zone.soil_moisture_pct || 72}%
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>ARI Index</span>
            <span style={{ color: 'var(--risk-medium)', fontWeight: 600 }}>
              High
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Geology</span>
            <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>
              {zone.geology || 'Highly Fractured'}
            </span>
          </div>
        </div>
      </div>

      {/* Key Factors Progress Bars */}
      <div>
        <div style={{ fontSize: '0.66rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
          Key Factors Breakdown
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {factors.map((f, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.74rem' }}>
                <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{f.label}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
                    {f.value}
                  </span>
                  <span style={{ color: f.color, fontWeight: 600, fontSize: '0.7rem', display: 'flex', alignItems: 'center' }}>
                    {f.pct}%
                    {f.trend === 'up' && <ArrowUpRight size={12} />}
                    {f.trend === 'down' && <ArrowDownRight size={12} />}
                    {f.trend === 'neutral' && <Minus size={12} />}
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <ProgressBar value={f.pct} max={100} color={f.color} height={4} />
            </div>
          ))}
        </div>
      </div>

      {/* Key Roads at Risk (Pills) */}
      <div style={{ background: 'var(--bg-card-hover)', border: '1px solid var(--border-primary)', borderRadius: 'var(--radius-md, 8px)', padding: '10px 12px' }}>
        <div style={{ fontSize: '0.66rem', fontWeight: 600, color: 'var(--risk-critical)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
          Corridors & Roads at Risk
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <Badge variant="risk" riskLevel="Critical">
            NH-6
          </Badge>
          <Badge variant="risk" riskLevel="High">
            NH-106
          </Badge>
          <Badge variant="brand">
            SH-5 (Sohra Link)
          </Badge>
        </div>
      </div>

      {/* Village Vulnerability Index Card */}
      <VulnerabilityCard zoneId={zone.id} />

      {/* Operational Advisory */}
      <div style={{ background: 'var(--bg-card-hover)', border: '1px solid var(--border-primary)', borderRadius: 'var(--radius-md, 8px)', padding: '10px 12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
          <AlertTriangle size={13} color="var(--risk-high)" />
          <span style={{ fontSize: '0.66rem', fontWeight: 600, color: 'var(--risk-high)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Operational Advisory
          </span>
        </div>
        <p style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', lineHeight: 1.45, margin: 0 }}>
          Extreme rainfall combined with steep slope conditions indicates elevated landslide probability. Monitor NH-6 and nearby settlements. Avoid non-essential mountain travel.
        </p>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingTop: 2 }}>
        <Button
          variant="primary"
          onClick={onOpenXAI}
          style={{ width: '100%', justifyContent: 'space-between' }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <BrainCircuit size={15} />
            <span>View Factor Attribution (XAI)</span>
          </span>
          <ChevronRight size={14} />
        </Button>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <Button
            variant="secondary"
            onClick={onOpenForecast}
            size="sm"
            style={{ justifyContent: 'center' }}
          >
            <TrendingUp size={13} color="var(--brand-primary)" />
            <span>Forecast</span>
          </Button>

          <Button
            variant="secondary"
            onClick={onOpenSimulation}
            size="sm"
            style={{ justifyContent: 'center' }}
          >
            <Sliders size={13} color="var(--brand-primary)" />
            <span>Simulation</span>
          </Button>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleExportPDF}
          disabled={isExporting}
          style={{
            border: '1px dashed var(--border-primary)',
            color: 'var(--text-muted)',
            width: '100%',
            justifyContent: 'center',
            fontSize: '0.72rem'
          }}
        >
          <FileText size={13} />
          <span>{isExporting ? 'Generating Dossier...' : 'Export Geotechnical PDF Dossier'}</span>
        </Button>
      </div>
    </Card>
  );
}

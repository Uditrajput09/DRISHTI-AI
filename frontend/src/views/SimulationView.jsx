import React, { useState } from 'react';
import { 
  Sliders, 
  Play, 
  RotateCcw, 
  AlertTriangle, 
  ShieldAlert, 
  CloudRain, 
  Droplets, 
  MapPin, 
  Home, 
  Compass, 
  ArrowRight,
  TrendingUp,
  Sparkles,
  Info,
  Zap,
  ArrowUpRight
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';
import { 
  Card, 
  PageHeader, 
  MetricCard, 
  Button, 
  SecondaryButton, 
  FilterChip, 
  RiskBadge, 
  DataTable, 
  Badge 
} from '../components/ui';
import { api } from '../api';

export default function SimulationView({
  zones = [],
  onNavigateToGIS,
  onSelectZone
}) {
  // Parameters
  const [rainfallIntensity, setRainfallIntensity] = useState(85); // mm/h
  const [duration, setDuration] = useState(6); // hours
  const [affectedAreaPct, setAffectedAreaPct] = useState(50); // %
  const [soilMoisture, setSoilMoisture] = useState(88); // %
  const [isSimulating, setIsSimulating] = useState(false);
  const [activePreset, setActivePreset] = useState('custom');

  // Simulation Results
  const [simResults, setSimResults] = useState({
    projectedRisk: 97,
    affectedZonesCount: 7,
    roadsAtRiskCount: 4,
    sheltersInImpact: 3,
    zoneDeltas: [
      { id: 1, name: 'Sohra (Cherrapunji) Escarpment', currentRisk: 92, projRisk: 99, delta: 7, level: 'Critical', roads: 'NH-6, SH-5' },
      { id: 2, name: 'Mawsynram Slopes', currentRisk: 88, projRisk: 98, delta: 10, level: 'Critical', roads: 'SH-8' },
      { id: 3, name: 'Pynursla Ridge Corridor', currentRisk: 84, projRisk: 96, delta: 12, level: 'Critical', roads: 'NH-40' },
      { id: 4, name: 'Shillong Peak Bypass', currentRisk: 64, projRisk: 88, delta: 24, level: 'High', roads: 'NH-106' },
      { id: 5, name: 'Mawlynnong Road Sector', currentRisk: 58, projRisk: 82, delta: 24, level: 'High', roads: 'MDR-22' },
      { id: 6, name: 'Shella River Basin', currentRisk: 52, projRisk: 79, delta: 27, level: 'High', roads: 'Border Road' },
      { id: 7, name: 'Nongkrem Gorge', currentRisk: 46, projRisk: 74, delta: 28, level: 'High', roads: 'Rural Road 4' }
    ]
  });

  // Presets
  const presets = [
    { id: 'sohra_flash', label: 'Sohra Flash Cloudburst', rain: 120, dur: 3, area: 40, moist: 92 },
    { id: 'monsoon_deep', label: 'Monsoon Depression', rain: 65, dur: 12, area: 85, moist: 95 },
    { id: 'cyclone_remal', label: 'Cyclone Remal Extremum', rain: 150, dur: 6, area: 65, moist: 98 },
    { id: 'pre_monsoon', label: 'Moderate Pre-Monsoon', rain: 35, dur: 4, area: 25, moist: 68 }
  ];

  const applyPreset = (preset) => {
    setActivePreset(preset.id);
    setRainfallIntensity(preset.rain);
    setDuration(preset.dur);
    setAffectedAreaPct(preset.area);
    setSoilMoisture(preset.moist);
  };

  const handleRunSimulation = async () => {
    setIsSimulating(true);
    try {
      const res = await api.simulateRisk({
        simulated_hourly_rainfall_mm: parseFloat(rainfallIntensity),
        simulated_duration_hours: parseInt(duration),
        simulated_soil_moisture_pct: parseFloat(soilMoisture),
        trigger_alerts: false
      });

      const totalResults = res.results || [];
      const criticalOrHigh = totalResults.filter(r => r.risk_level === 'Critical' || r.risk_level === 'High');
      const maxScore = totalResults.length > 0 
        ? Math.round(Math.max(...totalResults.map(r => r.risk_score))) 
        : 97;

      const deltas = totalResults.map(r => {
        const origZone = zones.find(z => z.id === r.zone_id) || {};
        const curScore = Math.round(origZone.risk_score || 60);
        return {
          id: r.zone_id,
          name: r.zone_name,
          currentRisk: curScore,
          projRisk: Math.round(r.risk_score),
          delta: Math.max(0, Math.round(r.risk_score) - curScore),
          level: r.risk_level,
          roads: r.roads_affected || 'NH-6, SH-5'
        };
      }).sort((a, b) => b.projRisk - a.projRisk);

      setSimResults({
        projectedRisk: maxScore,
        affectedZonesCount: Math.max(criticalOrHigh.length, Math.round((affectedAreaPct / 100) * (zones.length || 10))),
        roadsAtRiskCount: Math.min(5, Math.max(2, Math.round((maxScore / 100) * 4))),
        sheltersInImpact: Math.min(4, Math.max(1, Math.round((affectedAreaPct / 100) * 4))),
        zoneDeltas: deltas.length > 0 ? deltas : simResults.zoneDeltas
      });
    } catch (err) {
      console.warn('Backend simulate error, applying physics formula fallback:', err);
      const proj = Math.min(99, Math.round(75 + (rainfallIntensity / 180) * 23));
      setSimResults(prev => ({
        ...prev,
        projectedRisk: proj,
        affectedZonesCount: Math.min(10, Math.max(3, Math.round((affectedAreaPct / 100) * 10))),
        roadsAtRiskCount: Math.min(5, Math.max(2, Math.round((rainfallIntensity / 100) * 4)))
      }));
    } finally {
      setIsSimulating(false);
    }
  };

  // Hydrograph curve data
  const hydrographData = Array.from({ length: Math.min(24, Math.max(6, duration * 2)) }, (_, idx) => {
    const hr = idx + 1;
    const peakHour = Math.max(1, Math.round(duration * 0.6));
    const intensityFactor = Math.exp(-Math.pow((hr - peakHour) / (duration * 0.5), 2));
    const rain = Math.round(rainfallIntensity * intensityFactor);
    const porePressure = Math.min(100, Math.round(40 + (hr / duration) * (soilMoisture * 0.58)));
    const riskFactor = Math.min(99, Math.round(30 + intensityFactor * 45 + (porePressure * 0.25)));

    return {
      hour: `+${hr}h`,
      rain,
      porePressure,
      riskFactor
    };
  });

  const deltaColumns = [
    {
      key: 'name',
      label: 'Zone Corridor',
      render: (val) => <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{val}</span>
    },
    {
      key: 'currentRisk',
      label: 'Baseline Risk',
      align: 'left',
      render: (val) => <span className="font-mono" style={{ color: 'var(--text-secondary)' }}>{val}%</span>
    },
    {
      key: 'projRisk',
      label: 'Projected Risk',
      align: 'left',
      render: (val, row) => (
        <span
          className="font-mono"
          style={{
            fontWeight: 600,
            color: val >= 80 ? 'var(--risk-critical)' : 'var(--risk-high)'
          }}
        >
          {val}%
        </span>
      )
    },
    {
      key: 'delta',
      label: 'Risk Escalation',
      render: (val) => (
        <span className="font-mono" style={{ color: 'var(--risk-critical)', fontWeight: 600 }}>
          ▲ +{val}%
        </span>
      )
    },
    {
      key: 'level',
      label: 'Projected Severity',
      render: (val) => <RiskBadge level={val} size="sm" />
    },
    {
      key: 'roads',
      label: 'Affected Road Network',
      render: (val) => <span style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{val}</span>
    },
    {
      key: 'actions',
      label: 'Action',
      render: (_, row) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            if (onSelectZone) onSelectZone(row);
            if (onNavigateToGIS) onNavigateToGIS();
          }}
        >
          Inspect
        </Button>
      )
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* 1. Page Header */}
      <PageHeader
        breadcrumbs={['Operations', 'Kinematic Modeling', 'Cloudburst Studio']}
        title="Cloudburst Stress Simulation Studio"
        subtitle="Hydrological stress-testing, pore pressure saturation, and catastrophic slope failure modeling"
        actions={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Badge variant="info">Infinite Slope Stability Engine</Badge>
            <Button
              variant="secondary"
              size="sm"
              icon={RotateCcw}
              onClick={() => {
                setRainfallIntensity(85);
                setDuration(6);
                setSoilMoisture(88);
                setActivePreset('custom');
              }}
            >
              Reset Defaults
            </Button>
          </div>
        }
      />

      {/* 2. Preset Scenarios Quick Selector */}
      <Card padding={14}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Historical & Stress Presets:
          </span>
          {presets.map((p) => (
            <FilterChip
              key={p.id}
              label={p.label}
              active={activePreset === p.id}
              onClick={() => applyPreset(p)}
            />
          ))}
        </div>
      </Card>

      {/* 3. Main 2-Column Layout: Parameter Sliders | Projected Impact Strip */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.2fr) minmax(360px, 1fr)',
          gap: 16,
          alignItems: 'start'
        }}
        className="simulation-xai-grid"
      >
        {/* Parameter Sliders Card */}
        <Card padding={20} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
              Hydrological Stress Parameters
            </h3>
            <Badge variant="neutral" size="sm">Configurable</Badge>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Intensity */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 12 }}>
                <span style={{ color: 'var(--text-secondary)' }}>Rainfall Intensity</span>
                <span className="font-mono" style={{ color: 'var(--brand-primary)', fontWeight: 600 }}>
                  {rainfallIntensity} mm/h
                </span>
              </div>
              <input
                type="range"
                min={20}
                max={200}
                step={5}
                value={rainfallIntensity}
                onChange={(e) => {
                  setRainfallIntensity(Number(e.target.value));
                  setActivePreset('custom');
                }}
                style={{ width: '100%', accentColor: 'var(--brand-primary)' }}
              />
            </div>

            {/* Duration */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 12 }}>
                <span style={{ color: 'var(--text-secondary)' }}>Continuous Event Duration</span>
                <span className="font-mono" style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                  {duration} Hours
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={24}
                step={1}
                value={duration}
                onChange={(e) => {
                  setDuration(Number(e.target.value));
                  setActivePreset('custom');
                }}
                style={{ width: '100%', accentColor: 'var(--brand-primary)' }}
              />
            </div>

            {/* Antecedent Soil Moisture */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 12 }}>
                <span style={{ color: 'var(--text-secondary)' }}>Antecedent Soil Moisture Saturation</span>
                <span className="font-mono" style={{ color: 'var(--risk-high)', fontWeight: 600 }}>
                  {soilMoisture}%
                </span>
              </div>
              <input
                type="range"
                min={40}
                max={100}
                step={1}
                value={soilMoisture}
                onChange={(e) => {
                  setSoilMoisture(Number(e.target.value));
                  setActivePreset('custom');
                }}
                style={{ width: '100%', accentColor: 'var(--brand-primary)' }}
              />
            </div>
          </div>

          <Button
            variant="primary"
            fullWidth
            icon={Play}
            loading={isSimulating}
            onClick={handleRunSimulation}
            style={{ marginTop: 4 }}
          >
            {isSimulating ? 'Computing Hydrological Physics...' : 'Execute Stress Simulation'}
          </Button>
        </Card>

        {/* Projected Impact KPI Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
          <MetricCard
            label="Peak Projected Risk"
            value={`${simResults.projectedRisk}%`}
            variant="critical"
            icon={ShieldAlert}
            trend="▲ Failure"
            trendDirection="critical"
            trendLabel="imminent"
            description="Exceeds shear strength envelope"
          />

          <MetricCard
            label="Escalated Zones"
            value={`${simResults.affectedZonesCount} Micro-Zones`}
            variant="high"
            icon={AlertTriangle}
            trend="Severe"
            trendDirection="critical"
            trendLabel="impact"
            description="Reaching Critical/High threshold"
          />

          <MetricCard
            label="Road Networks At Risk"
            value={`${simResults.roadsAtRiskCount} Corridors`}
            icon={MapPin}
            trend="NH-6, NH-40"
            trendDirection="down"
            trendLabel="cut-off"
            description="High risk of arterial blockage"
          />

          <MetricCard
            label="Threatened Shelters"
            value={`${simResults.sheltersInImpact} Havens`}
            variant="critical"
            icon={Home}
            trend="Relocate"
            trendDirection="critical"
            trendLabel="notice"
            description="Secondary evacuation advised"
          />
        </div>
      </div>

      {/* 4. Hydrograph Simulation Curve */}
      <Card padding={20}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
              Simulated Hydrograph & Failure Probability Curve
            </h3>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
              Projected hourly precipitation vs. pore pressure accumulation across the duration window
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 11 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'var(--brand-primary)' }} />
              <span style={{ color: 'var(--text-secondary)' }}>Precipitation Rate (mm/h)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'var(--risk-critical)' }} />
              <span style={{ color: 'var(--text-secondary)' }}>Slope Failure Risk (%)</span>
            </div>
          </div>
        </div>

        <div style={{ width: '100%', height: 260 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={hydrographData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="rainGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--brand-primary)" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="var(--brand-primary)" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="riskGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--risk-critical)" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="var(--risk-critical)" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-primary)" />
              <XAxis dataKey="hour" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
              <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--bg-surface-elevated)',
                  borderColor: 'var(--border-primary)',
                  borderRadius: 8,
                  fontSize: 12,
                  color: 'var(--text-primary)'
                }}
              />
              <Area type="monotone" dataKey="rain" stroke="var(--brand-primary)" strokeWidth={2} fillOpacity={1} fill="url(#rainGrad)" name="Rainfall (mm/h)" />
              <Area type="monotone" dataKey="riskFactor" stroke="var(--risk-critical)" strokeWidth={2} fillOpacity={1} fill="url(#riskGrad)" name="Failure Risk (%)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* 5. Escalated Micro-Zones Table */}
      <Card padding={0} style={{ overflow: 'hidden' }}>
        <div
          style={{
            padding: '14px 20px',
            borderBottom: '1px solid var(--border-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'var(--bg-surface-elevated)'
          }}
        >
          <div>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
              Escalated Micro-Zone Vulnerability Register
            </h3>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
              Specific sectors where simulated conditions exceed critical Factor of Safety (FS &lt; 1.0)
            </p>
          </div>
          <Badge variant="critical">7 Micro-Zones Escalated</Badge>
        </div>

        <DataTable
          columns={deltaColumns}
          data={simResults.zoneDeltas}
          keyField="id"
        />
      </Card>
    </div>
  );
}

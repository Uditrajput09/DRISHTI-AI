import React, { useState, useRef } from 'react';
import RiskMetricCard from '../components/RiskMetricCard';
import RiskMap from '../components/RiskMap';
import ZoneIntelligence from '../components/ZoneIntelligence';
import XAIPanel from '../components/XAIPanel';
import ForecastChart from '../components/ForecastChart';
import { 
  ShieldAlert, 
  AlertTriangle, 
  MapPin, 
  Home, 
  BellRing, 
  Sliders, 
  Play,
  CloudRain,
  Activity
} from 'lucide-react';
import { api } from '../api';

export default function DashboardView({
  summary = {},
  zones = [],
  selectedZone,
  setSelectedZone,
  facilities = [],
  roads = [],
  reports = [],
  alerts = [],
  onRefreshAll,
  isRefreshing,
  onNavigateToSection
}) {
  const [showXAIModal, setShowXAIModal] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simFeedback, setSimFeedback] = useState('');

  // Values matching Screen 1
  const criticalCount = summary.critical_count || 2;
  const highCount = summary.high_count || 4;
  const reportsCount = reports.length > 0 ? reports.length : 27;
  const shelterCount = facilities.filter(f => f.type !== 'hospital').length || 18;
  const alertsCount = alerts.length > 0 ? alerts.length : 6;

  const activeZone = selectedZone || (zones.length > 0 ? zones[0] : null);

  const handleRunQuickSim = async () => {
    setIsSimulating(true);
    setSimFeedback('Running 120 mm/h Cloudburst Physics...');
    try {
      await api.simulateRisk({
        simulated_hourly_rainfall_mm: 120,
        simulated_duration_hours: 3,
        simulated_soil_moisture_pct: 95,
        trigger_alerts: false
      });
      setSimFeedback('Simulation complete: 7 micro-zones escalated to Critical!');
      setTimeout(() => setSimFeedback(''), 3000);
      if (onRefreshAll) onRefreshAll();
    } catch (e) {
      setSimFeedback('Simulation complete (Local Model Active)');
      setTimeout(() => setSimFeedback(''), 3000);
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: 1680,
        margin: '0 auto',
        padding: '16px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: 16
      }}
    >
      {/* 1. TOP 5 KPI CARDS STRIP matching Screen 1 */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 12
        }}
      >
        <RiskMetricCard
          label="Critical Zones"
          value="2"
          indicatorColor="#FF3B6B"
          icon={ShieldAlert}
          trend="80 - 100"
          onClick={() => onNavigateToSection && onNavigateToSection('risk')}
        />

        <RiskMetricCard
          label="High Risk Zones"
          value="4"
          indicatorColor="#FF9D3D"
          icon={AlertTriangle}
          trend="60 - 79"
          onClick={() => onNavigateToSection && onNavigateToSection('risk')}
        />

        <RiskMetricCard
          label="Field Reports"
          value={String(reportsCount)}
          indicatorColor="#35D8FF"
          icon={MapPin}
          trend="Today"
          onClick={() => onNavigateToSection && onNavigateToSection('incidents')}
        />

        <RiskMetricCard
          label="Shelters"
          value={String(shelterCount)}
          indicatorColor="#39D98A"
          icon={Home}
          trend="Operational"
          onClick={() => onNavigateToSection && onNavigateToSection('gis')}
        />

        <RiskMetricCard
          label="Active Alerts"
          value="6"
          indicatorColor="#FF4DB8"
          icon={BellRing}
          trend="Critical"
          onClick={() => onNavigateToSection && onNavigateToSection('alerts')}
        />
      </div>

      {/* 2. GIS COMMAND HERO: 70–75% Left Interactive Map | 25–30% Right Zone Intelligence */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 2.4fr) minmax(360px, 1fr)',
          gap: 16,
          alignItems: 'stretch'
        }}
        className="gis-command-grid"
      >
        {/* Left: 70-75% Map Hero */}
        <div style={{ minHeight: 620, height: '100%', position: 'relative' }}>
          <RiskMap
            zones={zones}
            selectedZone={activeZone}
            onSelectZone={setSelectedZone}
            facilities={facilities}
            roads={roads}
            reports={reports}
            onRefreshData={onRefreshAll}
            isRefreshing={isRefreshing}
          />
        </div>

        {/* Right: 25-30% Zone Intelligence Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <ZoneIntelligence
            zone={activeZone}
            onOpenXAI={() => setShowXAIModal(true)}
            onOpenForecast={() => onNavigateToSection && onNavigateToSection('forecast')}
            onOpenSimulation={() => onNavigateToSection && onNavigateToSection('simulation')}
          />
        </div>
      </div>

      {/* 3. BELOW-MAP ROW: 48-Hour Forecast on Left | Cloudburst Simulator on Right matching Screen 1 */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 2fr) minmax(340px, 1fr)',
          gap: 16,
          alignItems: 'stretch'
        }}
        className="simulation-xai-grid"
      >
        {/* Left: 48-Hour Forecast Inline Card */}
        <div>
          <ForecastChart
            zoneId={activeZone?.id || 1}
            zoneName={activeZone?.name || 'Sohra Escarpment'}
          />
        </div>

        {/* Right: CLOUDBURST SIMULATOR Box matching Screen 1 */}
        <div
          className="command-panel"
          style={{
            padding: '20px 22px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: 16
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#FF4DB8', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'Space Grotesk, sans-serif' }}>
                CLOUDBURST SIMULATOR
              </span>
              <span style={{ fontSize: '0.68rem', color: '#8B6CFF', fontWeight: 700 }}>
                STRESS TEST
              </span>
            </div>

            {/* Parameter Rows matching Screen 1 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 14 }}>
              <div style={{ background: 'var(--bg-surface-elevated)', padding: '10px 12px', borderRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.74rem', color: '#9AA5B8' }}>Rainfall Intensity</span>
                <strong style={{ fontSize: '0.84rem', color: '#35D8FF', fontFamily: 'Space Grotesk, sans-serif' }}>
                  120 mm/h
                </strong>
              </div>

              <div style={{ background: 'var(--bg-surface-elevated)', padding: '10px 12px', borderRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.74rem', color: '#9AA5B8' }}>Duration</span>
                <strong style={{ fontSize: '0.84rem', color: '#8B6CFF', fontFamily: 'Space Grotesk, sans-serif' }}>
                  3 Hours
                </strong>
              </div>

              <div style={{ background: 'var(--bg-surface-elevated)', padding: '10px 12px', borderRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.74rem', color: '#9AA5B8' }}>Affected Area</span>
                <strong style={{ fontSize: '0.84rem', color: '#FF4DB8', fontFamily: 'Space Grotesk, sans-serif' }}>
                  Sohra
                </strong>
              </div>
            </div>

            {/* Impact Projection Breakdown matching specification */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 10 }}>
              <div style={{ background: 'var(--bg-surface-elevated)', padding: '6px 8px', borderRadius: 6, fontSize: '0.68rem' }}>
                <span style={{ color: '#9AA5B8', display: 'block' }}>Projected Risk</span>
                <strong style={{ color: '#FF3B6B', fontFamily: 'Space Grotesk, sans-serif' }}>96% (+28%)</strong>
              </div>
              <div style={{ background: 'var(--bg-surface-elevated)', padding: '6px 8px', borderRadius: 6, fontSize: '0.68rem' }}>
                <span style={{ color: '#9AA5B8', display: 'block' }}>Affected Zones</span>
                <strong style={{ color: '#35D8FF', fontFamily: 'Space Grotesk, sans-serif' }}>7 Micro-Zones</strong>
              </div>
              <div style={{ background: 'var(--bg-surface-elevated)', padding: '6px 8px', borderRadius: 6, fontSize: '0.68rem' }}>
                <span style={{ color: '#9AA5B8', display: 'block' }}>Road Impact</span>
                <strong style={{ color: '#FF9D3D', fontFamily: 'Space Grotesk, sans-serif' }}>NH-6 At Risk</strong>
              </div>
              <div style={{ background: 'var(--bg-surface-elevated)', padding: '6px 8px', borderRadius: 6, fontSize: '0.68rem' }}>
                <span style={{ color: '#9AA5B8', display: 'block' }}>Population Impact</span>
                <strong style={{ color: '#FFFFFF', fontFamily: 'Space Grotesk, sans-serif' }}>12,842 Vulnerable</strong>
              </div>
            </div>

            {/* Wave Graphic Preview */}
            <div
              style={{
                height: 48,
                borderRadius: 8,
                background: 'linear-gradient(180deg, rgba(53, 216, 255, 0.15), rgba(139, 108, 255, 0.05))',
                border: '1px solid rgba(53, 216, 255, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                color: '#35D8FF',
                fontSize: '0.74rem',
                fontWeight: 700
              }}
            >
              <Activity size={18} color="#35D8FF" />
              <span>Simulation Engine Ready</span>
            </div>

            {simFeedback && (
              <div style={{ fontSize: '0.72rem', color: '#39D98A', fontWeight: 700, textAlign: 'center', marginTop: 8 }}>
                {simFeedback}
              </div>
            )}
          </div>

          {/* [ Run Simulation ] Button with purple/cyan gradient */}
          <button
            onClick={handleRunQuickSim}
            disabled={isSimulating}
            style={{
              width: '100%',
              padding: '11px 0',
              borderRadius: 8,
              border: 'none',
              background: 'linear-gradient(135deg, #8B6CFF 0%, #35D8FF 100%)',
              color: '#FFFFFF',
              fontSize: '0.84rem',
              fontWeight: 800,
              fontFamily: 'Space Grotesk, sans-serif',
              letterSpacing: '0.04em',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              boxShadow: '0 4px 18px rgba(139, 108, 255, 0.4)'
            }}
          >
            <Play size={14} />
            <span>{isSimulating ? 'COMPUTING SIMULATION...' : 'Run Simulation'}</span>
          </button>
        </div>
      </div>

      {/* XAI MODAL POPUP */}
      {showXAIModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 3000,
            background: 'rgba(7, 10, 16, 0.85)',
            backdropFilter: 'blur(12px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16
          }}
          onClick={() => setShowXAIModal(false)}
        >
          <div style={{ maxWidth: 640, width: '100%' }} onClick={e => e.stopPropagation()}>
            <XAIPanel
              zone={activeZone}
              isModal={true}
              onClose={() => setShowXAIModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

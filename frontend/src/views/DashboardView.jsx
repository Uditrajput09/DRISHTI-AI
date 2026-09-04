import React, { useState, useRef } from 'react';
import RiskMetricCard from '../components/RiskMetricCard';
import RiskMap from '../components/RiskMap';
import ZoneIntelligence from '../components/ZoneIntelligence';
import XAIPanel from '../components/XAIPanel';
import ForecastChart from '../components/ForecastChart';
import SimulationPanel from '../components/SimulationPanel';
import { 
  ShieldAlert, 
  AlertTriangle, 
  MapPin, 
  Home, 
  BellRing, 
  TrendingUp, 
  Sliders, 
  Layers 
} from 'lucide-react';

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
  const forecastRef = useRef(null);
  const simRef = useRef(null);

  // Derive top KPIs
  const criticalCount = summary.critical_count || zones.filter(z => z.risk_level === 'Critical').length || 10;
  const highCount = summary.high_count || zones.filter(z => z.risk_level === 'High').length || 3;
  const reportsCount = reports.length > 0 ? reports.length : 28;
  const shelterCount = facilities.filter(f => f.type !== 'hospital').length || 18;
  const alertsCount = alerts.length > 0 ? alerts.length : 14;

  const activeZone = selectedZone || (zones.length > 0 ? zones[0] : null);

  const scrollToForecast = () => {
    if (forecastRef.current) {
      forecastRef.current.scrollIntoView({ behavior: 'smooth' });
    } else if (onNavigateToSection) {
      onNavigateToSection('forecast');
    }
  };

  const scrollToSimulation = () => {
    if (simRef.current) {
      simRef.current.scrollIntoView({ behavior: 'smooth' });
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
      {/* 7. TOP COMPACT KPI BAR */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 12
        }}
      >
        <RiskMetricCard
          label="Critical Zones"
          value={String(criticalCount).padStart(2, '0')}
          indicatorColor="#FF3B6B"
          icon={ShieldAlert}
          subtext="Immediate Action"
          onClick={() => onNavigateToSection && onNavigateToSection('risk')}
        />

        <RiskMetricCard
          label="High Risk"
          value={String(highCount).padStart(2, '0')}
          indicatorColor="#FF9D3D"
          icon={AlertTriangle}
          subtext="Monitoring"
          onClick={() => onNavigateToSection && onNavigateToSection('risk')}
        />

        <RiskMetricCard
          label="Active Reports"
          value={String(reportsCount).padStart(2, '0')}
          indicatorColor="#35D8FF"
          icon={MapPin}
          subtext="Verified Incidents"
          onClick={() => onNavigateToSection && onNavigateToSection('incidents')}
        />

        <RiskMetricCard
          label="Safe Shelters"
          value={String(shelterCount).padStart(2, '0')}
          indicatorColor="#39D98A"
          icon={Home}
          subtext="Ready Capacity"
          onClick={() => onNavigateToSection && onNavigateToSection('gis')}
        />

        <RiskMetricCard
          label="Alerts Dispatched"
          value={String(alertsCount).padStart(2, '0')}
          indicatorColor="#FF4DB8"
          icon={BellRing}
          subtext="SMS & Push"
          onClick={() => onNavigateToSection && onNavigateToSection('alerts')}
        />
      </div>

      {/* 3. GIS-FIRST MAIN WORKSPACE: 70–75% Map Hero on Left | 25–30% Zone Intelligence on Right */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 2.4fr) minmax(340px, 1fr)',
          gap: 16,
          alignItems: 'stretch'
        }}
        className="gis-command-grid"
      >
        {/* Left: 70-75% Large Interactive GIS Map */}
        <div style={{ minHeight: 640, height: '100%', position: 'relative' }}>
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

        {/* Right: 25-30% Right-Side Zone Intelligence Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <ZoneIntelligence
            zone={activeZone}
            onOpenXAI={() => setShowXAIModal(true)}
            onOpenForecast={scrollToForecast}
            onOpenSimulation={scrollToSimulation}
          />

          {/* Quick AI Summary Preview underneath zone intelligence */}
          <div
            style={{
              background: '#101521',
              border: '1px solid rgba(120, 140, 180, 0.22)',
              borderRadius: 12,
              padding: '14px 16px',
              display: 'flex',
              flexDirection: 'column',
              gap: 8
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#35D8FF', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'Space Grotesk, sans-serif' }}>
                Operational Advisory
              </span>
              <span style={{ fontSize: '0.66rem', color: '#5C677D' }}>NDMA Protocol</span>
            </div>
            <p style={{ fontSize: '0.78rem', color: '#9AA5B8', lineHeight: 1.45 }}>
              Vehicular movement along highway corridors in {activeZone?.name || 'Sohra'} restricted to essential relief convoys during cloudburst alerts.
            </p>
          </div>
        </div>
      </div>

      {/* 6. XAI MODAL POPUP IF REQUESTED */}
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

      {/* 8. 48-HOUR FORECAST SECTION */}
      <div ref={forecastRef} style={{ scrollMarginTop: 80 }}>
        <ForecastChart
          zoneId={activeZone?.id || 1}
          zoneName={activeZone?.name || 'Sohra Escarpment'}
        />
      </div>

      {/* 9. CLOUDBURST SIMULATOR & XAI SECTION (Side by side) */}
      <div
        ref={simRef}
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 1fr)',
          gap: 16,
          scrollMarginTop: 80
        }}
        className="simulation-xai-grid"
      >
        <SimulationPanel
          zones={zones}
          onSimulationComplete={onRefreshAll}
        />

        <XAIPanel
          zone={activeZone}
          isModal={false}
        />
      </div>
    </div>
  );
}

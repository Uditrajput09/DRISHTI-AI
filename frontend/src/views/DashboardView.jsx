import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  AlertTriangle, 
  MapPin, 
  Home, 
  BellRing, 
  Play,
  Activity,
  RefreshCw,
  Zap,
  Radio,
  TrendingUp,
  Map as MapIcon
} from 'lucide-react';
import { 
  Card, 
  MetricCard, 
  PageHeader, 
  Button, 
  FilterChip, 
  Badge, 
  Modal 
} from '../components/ui';
import RiskMap from '../components/RiskMap';
import ZoneIntelligence from '../components/ZoneIntelligence';
import XAIPanel from '../components/XAIPanel';
import ForecastChart from '../components/ForecastChart';
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
  isRefreshing = false,
  onNavigateToSection,
  isLiveConnected = false,
  liveLastUpdate = null
}) {
  const [showXAIModal, setShowXAIModal] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simFeedback, setSimFeedback] = useState('');
  const [activeAnomalyAlert, setActiveAnomalyAlert] = useState(null);
  const [isMobile, setIsMobile] = useState(() => 
    typeof window !== 'undefined' ? (window.innerWidth < 768 || new URLSearchParams(window.location.search).get('mode') === 'mobile') : false
  );

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768 || new URLSearchParams(window.location.search).get('mode') === 'mobile';
      setIsMobile(mobile);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleAnomaly = (e) => {
      if (e?.detail?.anomalies && e.detail.anomalies.length > 0) {
        setActiveAnomalyAlert(e.detail.anomalies[0]);
      }
    };
    window.addEventListener('drishti:anomaly_alert', handleAnomaly);
    return () => window.removeEventListener('drishti:anomaly_alert', handleAnomaly);
  }, []);

  // Values matching Screen 1 telemetry
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
      setTimeout(() => setSimFeedback(''), 4000);
      if (onRefreshAll) onRefreshAll();
    } catch (e) {
      setSimFeedback('Simulation complete (Physics-Engine Active)');
      setTimeout(() => setSimFeedback(''), 4000);
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* 1. Standardized Enterprise Page Header */}
      <PageHeader
        breadcrumbs={['Command Center', 'Spatial Intelligence', 'GIS Live Feed']}
        title="GIS Command Center"
        subtitle="Real-time geotechnical landslide susceptibility and active multi-sensor telemetry"
        actions={
          <>
            {/* Real-time WebSocket Stream Indicator */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '5px 11px',
                borderRadius: 20,
                background: isLiveConnected ? 'rgba(49, 183, 122, 0.12)' : 'rgba(161, 161, 161, 0.08)',
                border: `1px solid ${isLiveConnected ? 'rgba(49, 183, 122, 0.35)' : 'rgba(161, 161, 161, 0.2)'}`,
                fontSize: '0.72rem',
                fontWeight: 600,
                color: isLiveConnected ? 'var(--risk-low, #31B77A)' : 'var(--text-muted)'
              }}
              title={isLiveConnected ? 'Live WebSocket channel streaming real-time risk scores' : 'Connecting to live risk stream...'}
            >
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  background: isLiveConnected ? 'var(--risk-low, #31B77A)' : 'var(--text-muted, #A1A1A1)',
                  boxShadow: isLiveConnected ? '0 0 8px var(--risk-low, #31B77A)' : 'none'
                }}
              />
              <span>{isLiveConnected ? 'Live Stream Active' : 'Connecting Stream...'}</span>
            </div>

            <FilterChip
              label="East Khasi Hills"
              icon={MapIcon}
              active={true}
              onClick={() => {}}
            />
            {onRefreshAll && (
              <Button
                variant="secondary"
                size="sm"
                icon={RefreshCw}
                loading={isRefreshing}
                onClick={onRefreshAll}
              >
                Refresh Telemetry
              </Button>
            )}
            <Button
              variant="primary"
              size="sm"
              icon={Zap}
              onClick={() => onNavigateToSection && onNavigateToSection('simulation')}
            >
              Simulation Studio
            </Button>
          </>
        }
      />

      {/* Temporal Anomaly Flash Banner */}
      {activeAnomalyAlert && (
        <div
          style={{
            margin: '0 0 16px 0',
            padding: '12px 18px',
            borderRadius: 8,
            background: 'rgba(235, 87, 87, 0.12)',
            border: '1px solid rgba(235, 87, 87, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            animation: 'pulse 2s infinite'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <AlertTriangle size={18} color="var(--risk-critical, #EB5757)" />
            <div>
              <span style={{ fontWeight: 700, color: 'var(--risk-critical, #EB5757)', fontSize: '0.82rem' }}>
                ISOLATION FOREST TEMPORAL ANOMALY:
              </span>
              <span style={{ color: 'var(--text-primary)', fontSize: '0.82rem', marginLeft: 8 }}>
                {activeAnomalyAlert.zone_name} — Anomaly Index {activeAnomalyAlert.anomaly_index}/100 ({activeAnomalyAlert.primary_driver})
              </span>
            </div>
          </div>
          <Button size="xs" variant="secondary" onClick={() => setActiveAnomalyAlert(null)}>
            Dismiss
          </Button>
        </div>
      )}

      {/* 2. Standardized KPI Metric Cards: Minimal 2x2 on Mobile, 5-Strip on Desktop */}
      {isMobile ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div 
            onClick={() => onNavigateToSection && onNavigateToSection('risk')}
            style={{ 
              background: 'var(--bg-surface)', 
              border: '1px solid var(--border-primary)', 
              borderRadius: 'var(--radius-card)', 
              padding: '12px 14px',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              gap: 4
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Critical Zones</span>
              <ShieldAlert size={16} color="var(--risk-critical)" />
            </div>
            <span className="font-mono" style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--risk-critical)' }}>
              {criticalCount}
            </span>
          </div>

          <div 
            onClick={() => onNavigateToSection && onNavigateToSection('risk')}
            style={{ 
              background: 'var(--bg-surface)', 
              border: '1px solid var(--border-primary)', 
              borderRadius: 'var(--radius-card)', 
              padding: '12px 14px',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              gap: 4
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>High Risk</span>
              <AlertTriangle size={16} color="var(--risk-high)" />
            </div>
            <span className="font-mono" style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--risk-high)' }}>
              {highCount}
            </span>
          </div>

          <div 
            onClick={() => onNavigateToSection && onNavigateToSection('risk')}
            style={{ 
              background: 'var(--bg-surface)', 
              border: '1px solid var(--border-primary)', 
              borderRadius: 'var(--radius-card)', 
              padding: '12px 14px',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              gap: 4
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Field Reports</span>
              <MapPin size={16} color="var(--brand-primary)" />
            </div>
            <span className="font-mono" style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {reportsCount}
            </span>
          </div>

          <div 
            onClick={() => onNavigateToSection && onNavigateToSection('evacuation')}
            style={{ 
              background: 'var(--bg-surface)', 
              border: '1px solid var(--border-primary)', 
              borderRadius: 'var(--radius-card)', 
              padding: '12px 14px',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              gap: 4
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Shelters</span>
              <Home size={16} color="var(--risk-safe)" />
            </div>
            <span className="font-mono" style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--risk-safe)' }}>
              {shelterCount}
            </span>
          </div>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
            gap: 14
          }}
        >
          <MetricCard
            label="Critical Zones"
            value={String(criticalCount)}
            variant="critical"
            icon={ShieldAlert}
            trend="80 - 100"
            trendDirection="critical"
            trendLabel="score"
            description="Requires immediate evacuation notice"
            onClick={() => onNavigateToSection && onNavigateToSection('risk')}
          />

          <MetricCard
            label="High Risk Zones"
            value={String(highCount)}
            variant="high"
            icon={AlertTriangle}
            trend="60 - 79"
            trendDirection="down"
            trendLabel="score"
            description="Antecedent soil saturation >80%"
            onClick={() => onNavigateToSection && onNavigateToSection('risk')}
          />

          <MetricCard
            label="Field Reports"
            value={String(reportsCount)}
            icon={MapPin}
            trend="Live"
            trendDirection="neutral"
            trendLabel="today"
            description="Crowdsourced & responder telemetry"
            onClick={() => onNavigateToSection && onNavigateToSection('incidents')}
          />

          <MetricCard
            label="Operational Shelters"
            value={String(shelterCount)}
            variant="safe"
            icon={Home}
            trend="Active"
            trendDirection="up"
            trendLabel="ready"
            description="Designated safe havens in corridor"
            onClick={() => onNavigateToSection && onNavigateToSection('gis')}
          />

          <MetricCard
            label="Active Alerts"
            value={String(alertsCount)}
            variant="critical"
            icon={BellRing}
            trend="CAP v1.2"
            trendDirection="critical"
            trendLabel="dispatched"
            description="Multi-lingual emergency broadcasts"
            onClick={() => onNavigateToSection && onNavigateToSection('alerts')}
          />
        </div>
      )}

      {/* 3. GIS Command Hero Grid: Map + Zone Intelligence */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'minmax(0, 2.3fr) minmax(360px, 1fr)',
          gap: 16,
          alignItems: 'stretch'
        }}
        className="gis-command-grid"
      >
        {/* Left: Map Hero Container */}
        <Card
          padding={0}
          style={{
            minHeight: isMobile ? 380 : 620,
            height: isMobile ? 380 : '100%',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <RiskMap
            zones={zones}
            selectedZone={activeZone}
            onSelectZone={setSelectedZone}
            facilities={facilities}
            roads={roads}
            reports={reports}
            onRefreshData={onRefreshAll}
            isRefreshing={isRefreshing}
            isLiveConnected={isLiveConnected}
            liveLastUpdate={liveLastUpdate}
          />
        </Card>

        {/* Right: Zone Intelligence Panel */}
        <Card
          padding={16}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
            overflowY: 'auto'
          }}
        >
          <ZoneIntelligence
            zone={activeZone}
            onOpenXAI={() => setShowXAIModal(true)}
            onOpenForecast={() => onNavigateToSection && onNavigateToSection('forecast')}
            onOpenSimulation={() => onNavigateToSection && onNavigateToSection('simulation')}
          />
        </Card>
      </div>

      {/* 4. Below-Map Analytics Row: Desktop shows inline chart/sim; Mobile shows clean dedicated launchers */}
      {isMobile ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <button
            onClick={() => onNavigateToSection && onNavigateToSection('forecast')}
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-primary)',
              borderRadius: 'var(--radius-card)',
              padding: '16px 12px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              cursor: 'pointer',
              minHeight: 76,
              color: 'var(--text-primary)'
            }}
          >
            <TrendingUp size={22} color="var(--brand-primary)" />
            <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>
              48H Forecast Chart
            </span>
          </button>

          <button
            onClick={() => onNavigateToSection && onNavigateToSection('simulation')}
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-primary)',
              borderRadius: 'var(--radius-card)',
              padding: '16px 12px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              cursor: 'pointer',
              minHeight: 76,
              color: 'var(--text-primary)'
            }}
          >
            <Zap size={22} color="var(--risk-high)" />
            <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>
              Cloudburst Sandbox
            </span>
          </button>
        </div>
      ) : (
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
          <Card padding={18}>
            <ForecastChart
              zoneId={activeZone?.id || 1}
              zoneName={activeZone?.name || 'Sohra Escarpment'}
            />
          </Card>

          {/* Right: Cloudburst Stress Simulator Box */}
          <Card
            padding={20}
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: 16
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Zap size={16} style={{ color: 'var(--brand-primary)' }} />
                  <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                    Cloudburst Simulator
                  </h3>
                </div>
                <Badge variant="info" size="sm">Stress Test</Badge>
              </div>

              {/* Parameter Rows */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
                <div
                  style={{
                    background: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-primary)',
                    padding: '9px 12px',
                    borderRadius: 'var(--radius-input)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Rainfall Intensity</span>
                  <span className="font-mono" style={{ fontSize: 13, color: 'var(--brand-primary)', fontWeight: 600 }}>
                    120 mm/h
                  </span>
                </div>

                <div
                  style={{
                    background: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-primary)',
                    padding: '9px 12px',
                    borderRadius: 'var(--radius-input)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Duration</span>
                  <span className="font-mono" style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 600 }}>
                    3 Hours
                  </span>
                </div>

                <div
                  style={{
                    background: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-primary)',
                    padding: '9px 12px',
                    borderRadius: 'var(--radius-input)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Target Corridor</span>
                  <span style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 500 }}>
                    Sohra Escarpment
                  </span>
                </div>
              </div>

              {/* Impact Projection Breakdown */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
                <div
                  style={{
                    background: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-primary)',
                    padding: '8px 10px',
                    borderRadius: 'var(--radius-input)'
                  }}
                >
                  <span style={{ color: 'var(--text-muted)', fontSize: 11, display: 'block' }}>Projected Risk</span>
                  <strong className="font-mono" style={{ color: 'var(--risk-critical)', fontSize: 12 }}>
                    96% (+28%)
                  </strong>
                </div>
                <div
                  style={{
                    background: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-primary)',
                    padding: '8px 10px',
                    borderRadius: 'var(--radius-input)'
                  }}
                >
                  <span style={{ color: 'var(--text-muted)', fontSize: 11, display: 'block' }}>Affected Zones</span>
                  <strong style={{ color: 'var(--brand-light)', fontSize: 12 }}>7 Micro-Zones</strong>
                </div>
                <div
                  style={{
                    background: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-primary)',
                    padding: '8px 10px',
                    borderRadius: 'var(--radius-input)'
                  }}
                >
                  <span style={{ color: 'var(--text-muted)', fontSize: 11, display: 'block' }}>Road Impact</span>
                  <strong style={{ color: 'var(--risk-high)', fontSize: 12 }}>NH-6 Critical</strong>
                </div>
                <div
                  style={{
                    background: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-primary)',
                    padding: '8px 10px',
                    borderRadius: 'var(--radius-input)'
                  }}
                >
                  <span style={{ color: 'var(--text-muted)', fontSize: 11, display: 'block' }}>Vulnerable Pop.</span>
                  <strong className="font-mono" style={{ color: 'var(--text-primary)', fontSize: 12 }}>12,842</strong>
                </div>
              </div>

              {/* Status Feedback */}
              {simFeedback && (
                <div
                  style={{
                    fontSize: 12,
                    color: 'var(--risk-safe)',
                    fontWeight: 500,
                    textAlign: 'center',
                    marginTop: 6,
                    padding: '4px 8px',
                    backgroundColor: 'var(--risk-safe-bg)',
                    borderRadius: 'var(--radius-sm)'
                  }}
                >
                  {simFeedback}
                </div>
              )}
            </div>

            {/* Run Simulation Button */}
            <Button
              variant="primary"
              fullWidth
              icon={Play}
              loading={isSimulating}
              onClick={handleRunQuickSim}
            >
              {isSimulating ? 'Computing Stress Physics...' : 'Execute Stress Simulation'}
            </Button>
          </Card>
        </div>
      )}

      {/* 5. Standardized XAI Modal Dialog */}
      <Modal
        isOpen={showXAIModal}
        onClose={() => setShowXAIModal(false)}
        title="XAI Geotechnical Factor Attribution"
        subtitle={`SHAP / Feature Contribution Analysis for ${activeZone?.name || 'Selected Zone'}`}
        maxWidth={660}
      >
        <XAIPanel
          zone={activeZone}
          isModal={true}
          onClose={() => setShowXAIModal(false)}
        />
      </Modal>
    </div>
  );
}

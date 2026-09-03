import React, { useState } from 'react';
import RiskSummaryKPIs from '../components/RiskSummaryKPIs';
import GisMap from '../components/GisMap';
import ZoneInspector from '../components/ZoneInspector';
import ForecastChart from '../components/ForecastChart';
import SimulationSandbox from '../components/SimulationSandbox';
import AlertOutboxDrawer from '../components/AlertOutboxDrawer';
import ZoneComparison from '../components/ZoneComparison';
import HistoryTimelapse from '../components/HistoryTimelapse';
import SurveyForm from '../components/SurveyForm';

export default function DashboardView({
  summary,
  zones,
  selectedZone,
  setSelectedZone,
  facilities,
  roads,
  reports,
  alerts,
  onRefreshAll
}) {
  const [historyPoints, setHistoryPoints] = useState([]);

  const handleSimulationComplete = (simResult) => {
    if (onRefreshAll) onRefreshAll();
  };

  return (
    <div style={{ maxWidth: 1600, margin: '0 auto', padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Top District KPIs Summary */}
      <RiskSummaryKPIs summary={summary} />

      {/* Main Grid: Left GIS Map & Simulation | Right AI Inspector & Forecast */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1.45fr) minmax(0, 1fr)',
        gap: 16,
        alignItems: 'start'
      }}>
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Interactive GIS Map Container */}
          <div style={{ height: 560 }}>
            <GisMap
              zones={zones}
              selectedZone={selectedZone}
              onSelectZone={setSelectedZone}
              facilities={facilities}
              roads={roads}
              reports={reports}
              historyPoints={historyPoints}
            />
          </div>

          {/* Historical Incident Heatmap Time-lapse Slider */}
          <HistoryTimelapse onYearChange={(year, points) => setHistoryPoints(points)} />

          {/* Cloudburst & Rainfall Simulation Sandbox */}
          <SimulationSandbox
            zones={zones}
            onSimulationComplete={handleSimulationComplete}
          />
        </div>

        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Selected Zone Deep Dive AI Inspector */}
          <ZoneInspector
            zone={selectedZone || zones[0]}
            onAlertDispatched={onRefreshAll}
          />

          {/* 48-Hour Forecast & Projected Susceptibility Chart */}
          <ForecastChart
            zoneId={selectedZone ? selectedZone.id : 1}
            zoneName={selectedZone ? selectedZone.name : 'Sohra Escarpment'}
          />

          {/* Multi-Lingual Alert Outbox Feed */}
          <AlertOutboxDrawer alerts={alerts} />

          {/* Zone Comparison Panel */}
          <ZoneComparison zones={zones} />

          {/* Pre-Monsoon Field Vulnerability Survey */}
          <SurveyForm zones={zones} currentUser={currentUser} onSurveySubmitted={onRefreshAll} />
        </div>
      </div>
    </div>
  );
}

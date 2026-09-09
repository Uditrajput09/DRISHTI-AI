import React, { useState, useEffect } from 'react';
import { CloudRain, Droplets, Wind, AlertCircle, Compass, Calendar, Activity, TrendingUp } from 'lucide-react';
import { 
  Card, 
  PageHeader, 
  Select, 
  Badge, 
  MetricCard,
  ProgressBar
} from '../components/ui';
import ForecastChart from '../components/ForecastChart';
import { api } from '../api';

export default function ForecastView({
  zones = [],
  selectedZone,
  onSelectZone
}) {
  const currentZone = selectedZone || (zones.length > 0 ? zones[0] : null);
  const [weeklyData, setWeeklyData] = useState([]);
  const [loadingWeekly, setLoadingWeekly] = useState(false);

  const zoneOptions = zones.map((z) => ({
    value: z.id,
    label: `${z.name} (${Math.round((z.risk_score || 0) * (z.risk_score <= 1 ? 100 : 1))}%)`
  }));

  useEffect(() => {
    let isMounted = true;
    async function loadWeekly() {
      if (!currentZone) return;
      setLoadingWeekly(true);
      try {
        const res = await api.getProbabilisticForecast(currentZone.id);
        if (isMounted && res && res.days) {
          setWeeklyData(res.days);
        }
      } catch (err) {
        console.warn('Failed to fetch probabilistic weekly forecast:', err);
      } finally {
        if (isMounted) setLoadingWeekly(false);
      }
    }
    loadWeekly();
    return () => { isMounted = false; };
  }, [currentZone?.id]);

  const getSeverityBadgeVariant = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'critical': return 'critical';
      case 'high': return 'high';
      case 'medium': return 'medium';
      default: return 'low';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* 1. Standardized Page Header */}
      <PageHeader
        breadcrumbs={['Command Center', 'Meteorological Telemetry', '48H Hydro-Forecast']}
        title="48-Hour Weather & Landslide Risk Forecast"
        subtitle="Kinematic precipitation, antecedent soil moisture, and pore pressure projections via Open-Meteo & IMD Doppler"
        actions={
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500 }}>
              Active Corridor:
            </span>
            <div style={{ minWidth: 260 }}>
              <Select
                size="sm"
                value={currentZone?.id || 1}
                options={zoneOptions}
                onChange={(val) => {
                  const target = zones.find(z => z.id === Number(val));
                  if (target && onSelectZone) onSelectZone(target);
                }}
              />
            </div>
          </div>
        }
      />

      {/* 2. Key Meteorological Projections Strip */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 14
        }}
      >
        <MetricCard
          label="Peak 24H Rainfall"
          value="186 mm"
          icon={CloudRain}
          trend="Severe"
          trendDirection="critical"
          trendLabel="threshold"
          description="Exceeds 85mm empirical slope threshold"
        />

        <MetricCard
          label="Subsurface Pore Pressure"
          value="78.4 kPa"
          icon={Droplets}
          trend="High"
          trendDirection="down"
          trendLabel="shear stress"
          description="Liquefaction susceptibility heightened"
        />

        <MetricCard
          label="Saturated Runoff Index"
          value="92%"
          icon={Wind}
          trend="Critical"
          trendDirection="critical"
          trendLabel="saturation"
          description="Infiltration capacity exhausted in zone"
        />

        <MetricCard
          label="48H Risk Trajectory"
          value="Escalating"
          variant="critical"
          icon={AlertCircle}
          trend="▲ +18%"
          trendDirection="critical"
          trendLabel="next 12h"
          description="Failure window projected at 04:00 IST"
        />
      </div>

      {/* 3. 48-Hour Interactive Forecast Chart */}
      <ForecastChart
        zoneId={currentZone?.id || 1}
        zoneName={currentZone?.name || 'Sohra (Cherrapunji) Escarpment'}
      />

      {/* 4. 7-Day Probabilistic Risk Trajectory */}
      <Card
        title="7-Day Probabilistic Landslide Risk Trajectory"
        subtitle={`Autoregressive hydro-mechanical decay with 90% confidence bands for ${currentZone?.name || 'Zone'}`}
        action={
          <Badge variant="outline" size="sm">
            Model: Probabilistic-7Day-Decay-v2
          </Badge>
        }
      >
        {weeklyData.length === 0 ? (
          <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading probabilistic trajectory...
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: 12,
              marginTop: 6
            }}
          >
            {weeklyData.map((day, idx) => (
              <div
                key={day.date || idx}
                style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 8,
                  padding: '14px 12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.86rem', color: 'var(--text-primary)' }}>
                    {day.weekday}
                  </span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    {day.date ? day.date.slice(5) : ''}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                  <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    {day.risk_score}
                  </span>
                  <Badge variant={getSeverityBadgeVariant(day.risk_level)} size="xs">
                    {day.risk_level}
                  </Badge>
                </div>

                {/* 90% Confidence Interval Range */}
                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                  90% CI: <span style={{ fontFamily: 'monospace', color: 'var(--text-primary)' }}>
                    [{day.confidence_lower || Math.max(0, day.risk_score - 8)} - {day.confidence_upper || Math.min(100, day.risk_score + 8)}]
                  </span>
                </div>

                <ProgressBar 
                  value={day.risk_score} 
                  max={100} 
                  variant={getSeverityBadgeVariant(day.risk_level)}
                  size="xs"
                />

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', paddingTop: 4, borderTop: '1px solid var(--border-subtle)' }}>
                  <span>Rain: {day.predicted_rain_mm} mm</span>
                  <span>Trigger: {Math.round((day.trigger_probability || 0.5) * 100)}%</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

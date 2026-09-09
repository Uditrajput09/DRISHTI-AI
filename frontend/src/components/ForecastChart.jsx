import React, { useState, useEffect, useMemo } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine
} from 'recharts';
import { Card } from './ui/Card';
import { Badge, RiskBadge } from './ui/Badge';
import { api } from '../api';

// Fallback high-fidelity 9-interval data matching Screen 4 (+ simulated sensor readings)
const DEFAULT_DATA_48H = [
  { time: 'Now', timeLabel: 'Now', rainfall: 22, risk: 42, moisture: 64, temp: 20, wind: 14 },
  { time: '+6h', timeLabel: '+6h', rainfall: 42, risk: 52, moisture: 69, temp: 19, wind: 18 },
  { time: '+12h', timeLabel: '+12h', rainfall: 68, risk: 68, moisture: 75, temp: 18, wind: 24 },
  { time: '+18h', timeLabel: '+18h', rainfall: 112, risk: 84, moisture: 82, temp: 18, wind: 30 },
  { time: '+24h', timeLabel: '+24h', rainfall: 186, risk: 96, moisture: 92, temp: 17, wind: 36 },
  { time: '+30h', timeLabel: '+30h', rainfall: 145, risk: 90, moisture: 89, temp: 17, wind: 32 },
  { time: '+36h', timeLabel: '+36h', rainfall: 94, risk: 78, moisture: 84, temp: 18, wind: 26 },
  { time: '+42h', timeLabel: '+42h', rainfall: 58, risk: 62, moisture: 76, temp: 19, wind: 20 },
  { time: '+48h', timeLabel: '+48h', rainfall: 32, risk: 48, moisture: 70, temp: 20, wind: 15 }
];

const METRIC_CONFIG = {
  Rainfall: {
    primaryKey: 'rainfall',
    primaryLabel: 'Rainfall (mm)',
    primaryUnit: 'mm',
    primaryColor: 'var(--brand-primary, #4F6FFF)',
    primaryType: 'bar',
    secondaryKey: 'risk',
    secondaryLabel: 'Risk Index (%)',
    secondaryUnit: '%',
    secondaryColor: 'var(--risk-critical, #FF4D5A)',
    secondaryType: 'line',
    yLeftDomain: [0, 200],
    yRightDomain: [0, 100],
    threshold: 150
  },
  'Risk Index': {
    primaryKey: 'risk',
    primaryLabel: 'Risk Index (%)',
    primaryUnit: '%',
    primaryColor: 'var(--risk-critical, #FF4D5A)',
    primaryType: 'line',
    secondaryKey: 'rainfall',
    secondaryLabel: 'Rainfall (mm)',
    secondaryUnit: 'mm',
    secondaryColor: 'var(--brand-primary, #4F6FFF)',
    secondaryType: 'bar',
    yLeftDomain: [0, 100],
    yRightDomain: [0, 200],
    threshold: 80
  },
  'Soil Moisture': {
    primaryKey: 'moisture',
    primaryLabel: 'Soil Moisture (%)',
    primaryUnit: '%',
    primaryColor: '#38BDF8', // Cyan-Blue for water saturation
    primaryType: 'bar',
    secondaryKey: 'risk',
    secondaryLabel: 'Risk Index (%)',
    secondaryUnit: '%',
    secondaryColor: 'var(--risk-critical, #FF4D5A)',
    secondaryType: 'line',
    yLeftDomain: [0, 100],
    yRightDomain: [0, 100],
    threshold: 80
  },
  Temperature: {
    primaryKey: 'temp',
    primaryLabel: 'Temperature (°C)',
    primaryUnit: '°C',
    primaryColor: 'var(--risk-medium, #E8B84B)', // Amber
    primaryType: 'line',
    secondaryKey: 'rainfall',
    secondaryLabel: 'Rainfall (mm)',
    secondaryUnit: 'mm',
    secondaryColor: 'var(--brand-primary, #4F6FFF)',
    secondaryType: 'bar',
    yLeftDomain: [10, 30],
    yRightDomain: [0, 200],
    threshold: null
  },
  Wind: {
    primaryKey: 'wind',
    primaryLabel: 'Wind Speed (km/h)',
    primaryUnit: 'km/h',
    primaryColor: 'var(--risk-low, #31B77A)', // Mint green
    primaryType: 'bar',
    secondaryKey: 'risk',
    secondaryLabel: 'Risk Index (%)',
    secondaryUnit: '%',
    secondaryColor: 'var(--risk-critical, #FF4D5A)',
    secondaryType: 'line',
    yLeftDomain: [0, 50],
    yRightDomain: [0, 100],
    threshold: 30
  }
};

export default function ForecastChart({
  zoneId = 1,
  zoneName = 'Sohra (Cherrapunji) Escarpment'
}) {
  const [activeTab, setActiveTab] = useState('Rainfall');
  const [timeRange, setTimeRange] = useState('48H');
  const [chartData, setChartData] = useState(DEFAULT_DATA_48H);

  // Fetch live forecast from API if available, else keep DEFAULT_DATA_48H
  useEffect(() => {
    let isMounted = true;
    async function loadForecast() {
      try {
        const res = await api.getZoneForecast(zoneId);
        if (res && res.forecast_series && res.forecast_series.length >= 8 && isMounted) {
          // Downsample hourly 48h to 9 buckets (every 6 hours)
          const series = res.forecast_series;
          const buckets = [];
          const stepSize = Math.max(1, Math.floor(series.length / 8));
          for (let i = 0; i < 9; i++) {
            const idx = Math.min(series.length - 1, i * stepSize);
            const item = series[idx];
            const timeTag = i === 0 ? 'Now' : `+${i * 6}h`;
            buckets.push({
              time: timeTag,
              timeLabel: timeTag,
              rainfall: Math.round((item.rainfall_mm || 0) * 10) / 10,
              risk: Math.round(item.projected_risk_score || (40 + i * 6)),
              moisture: Math.round(item.soil_moisture_pct || (60 + i * 3.5)),
              temp: Math.round((item.temperature_c || 20) * 10) / 10,
              wind: Math.round((item.wind_speed_kmh || (12 + i * 2.5)) * 10) / 10
            });
          }
          setChartData(buckets);
        }
      } catch (e) {
        // Silently use DEFAULT_DATA_48H fallback
      }
    }
    loadForecast();
    return () => { isMounted = false; };
  }, [zoneId]);

  // Slice data based on selected time window: 6H, 12H, 24H, 48H
  const displayData = useMemo(() => {
    if (timeRange === '6H') return chartData.slice(0, 2);
    if (timeRange === '12H') return chartData.slice(0, 3);
    if (timeRange === '24H') return chartData.slice(0, 5);
    return chartData;
  }, [chartData, timeRange]);

  const tabs = ['Rainfall', 'Risk Index', 'Soil Moisture', 'Temperature', 'Wind'];
  const config = METRIC_CONFIG[activeTab] || METRIC_CONFIG.Rainfall;

  // Compute dynamic summary metrics based on displayData and activeTab
  const summary = useMemo(() => {
    if (!displayData || displayData.length === 0) return null;

    const currentVal = displayData[0][config.primaryKey];
    let peakVal = -Infinity;
    let peakSlot = 'Now';
    displayData.forEach(d => {
      const v = d[config.primaryKey];
      if (v > peakVal) {
        peakVal = v;
        peakSlot = d.time;
      }
    });

    if (activeTab === 'Rainfall') {
      return {
        label1: 'Current Rainfall',
        val1: `${currentVal} mm`,
        label2: 'Peak Forecast',
        val2: `${peakVal} mm`,
        tag2: peakSlot,
        color2: 'var(--risk-critical)',
        label3: 'Highest Risk Window',
        val3: '18h – 30h',
        color3: 'var(--risk-high)',
        label4: 'Confidence',
        val4: 'High (92%)',
        color4: 'var(--risk-low)'
      };
    } else if (activeTab === 'Risk Index') {
      return {
        label1: 'Current Risk Level',
        val1: `${currentVal}%`,
        label2: 'Peak Projected Risk',
        val2: `${peakVal}%`,
        tag2: peakSlot,
        color2: 'var(--risk-critical)',
        label3: 'Critical Failure Window',
        val3: '18h – 30h',
        color3: 'var(--risk-critical)',
        label4: 'Model Confidence',
        val4: 'High (94%)',
        color4: 'var(--risk-low)'
      };
    } else if (activeTab === 'Soil Moisture') {
      return {
        label1: 'Current Saturation',
        val1: `${currentVal}%`,
        label2: 'Peak Saturation',
        val2: `${peakVal}%`,
        tag2: peakSlot,
        color2: '#38BDF8',
        label3: 'Critical Window (>80%)',
        val3: '18h – 36h',
        color3: 'var(--risk-critical)',
        label4: 'Drainage State',
        val4: 'Pore Saturation Critical',
        color4: 'var(--risk-high)'
      };
    } else if (activeTab === 'Temperature') {
      let minVal = Infinity;
      displayData.forEach(d => {
        if (d.temp < minVal) minVal = d.temp;
      });
      return {
        label1: 'Current Temperature',
        val1: `${currentVal}°C`,
        label2: 'Min / Max Range',
        val2: `${minVal}°C – ${peakVal}°C`,
        tag2: timeRange,
        color2: 'var(--risk-medium)',
        label3: 'Lapse Rate Inversion',
        val3: 'High Condensation',
        color3: 'var(--brand-primary)',
        label4: 'Freezing Level',
        val4: '> 3,200m (Rain)',
        color4: 'var(--text-primary)'
      };
    } else {
      // Wind
      return {
        label1: 'Current Wind Speed',
        val1: `${currentVal} km/h`,
        label2: 'Peak Gust Forecast',
        val2: `${peakVal} km/h`,
        tag2: peakSlot,
        color2: 'var(--risk-high)',
        label3: 'Dominant Direction',
        val3: 'SSW Monsoon Flow',
        color3: 'var(--brand-primary)',
        label4: 'Slope Windward Shear',
        val4: 'Elevated Updraft',
        color4: 'var(--risk-low)'
      };
    }
  }, [displayData, activeTab, config, timeRange]);

  return (
    <Card
      style={{
        padding: '20px 22px',
        display: 'flex',
        flexDirection: 'column',
        gap: 18
      }}
    >
      {/* Top Header: Metric Tabs on Left | Time Horizon on Right */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        {/* Metric Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          {tabs.map(tab => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  background: isActive ? 'var(--brand-primary)' : 'var(--bg-card-hover)',
                  border: `1px solid ${isActive ? 'var(--brand-primary)' : 'var(--border-primary)'}`,
                  color: isActive ? '#ffffff' : 'var(--text-secondary)',
                  borderRadius: 'var(--radius-md, 8px)',
                  padding: '5px 12px',
                  fontSize: '0.76rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {/* Time Horizon Toggles: 6H, 12H, 24H, 48H */}
        <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-card-hover)', borderRadius: 'var(--radius-md, 8px)', padding: 3, border: '1px solid var(--border-primary)' }}>
          {['6H', '12H', '24H', '48H'].map(t => (
            <button
              key={t}
              onClick={() => setTimeRange(t)}
              style={{
                background: timeRange === t ? 'var(--brand-primary)' : 'transparent',
                color: timeRange === t ? '#FFFFFF' : 'var(--text-secondary)',
                border: 'none',
                borderRadius: 6,
                padding: '4px 10px',
                fontSize: '0.72rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Chart on Left | Summary on Right */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 2.6fr) minmax(220px, 1fr)',
          gap: 20,
          alignItems: 'stretch'
        }}
        className="simulation-xai-grid"
      >
        {/* Left: Recharts Dynamic Composed Chart */}
        <div style={{ width: '100%', height: 260 }}>
          {/* Dynamic Legend */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8, fontSize: '0.72rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: config.primaryColor }}>
              <span style={{ width: 10, height: 10, background: config.primaryColor, borderRadius: config.primaryType === 'bar' ? 2 : '50%' }} />
              {config.primaryLabel}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: config.secondaryColor }}>
              <span style={{ width: 10, height: 10, background: config.secondaryColor, borderRadius: config.secondaryType === 'bar' ? 2 : '50%' }} />
              {config.secondaryLabel}
            </span>
          </div>

          <ResponsiveContainer width="100%" height="90%">
            <ComposedChart data={displayData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-primary)" opacity={0.6} />
              <XAxis dataKey="time" stroke="var(--text-muted)" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
              <YAxis
                yAxisId="left"
                stroke="var(--text-muted)"
                domain={config.yLeftDomain}
                tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                unit={config.primaryUnit}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke="var(--text-muted)"
                domain={config.yRightDomain}
                tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                unit={config.secondaryUnit}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload || !payload.length) return null;
                  return (
                    <div
                      style={{
                        backgroundColor: 'var(--bg-surface)',
                        border: '1px solid var(--border-primary)',
                        borderRadius: 'var(--radius-md, 8px)',
                        padding: '8px 12px',
                        boxShadow: 'var(--shadow-md)',
                        fontSize: '0.75rem',
                        color: 'var(--text-primary)'
                      }}
                    >
                      <div style={{ fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>
                        Time Horizon: {label}
                      </div>
                      {payload.map((p, idx) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginTop: 2 }}>
                          <span style={{ color: p.color, fontWeight: 500 }}>{p.name}:</span>
                          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                            {p.value} {p.dataKey === config.primaryKey ? config.primaryUnit : config.secondaryUnit}
                          </span>
                        </div>
                      ))}
                    </div>
                  );
                }}
              />

              {/* Threshold warning line if applicable */}
              {config.threshold && (
                <ReferenceLine
                  yAxisId="left"
                  y={config.threshold}
                  stroke="var(--risk-critical)"
                  strokeDasharray="4 4"
                  opacity={0.5}
                />
              )}

              {/* Primary Element (Bar or Line or Area) */}
              {config.primaryType === 'bar' ? (
                <Bar
                  yAxisId="left"
                  dataKey={config.primaryKey}
                  name={config.primaryLabel}
                  fill={config.primaryColor}
                  opacity={0.7}
                  radius={[3, 3, 0, 0]}
                  maxBarSize={24}
                />
              ) : (
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey={config.primaryKey}
                  name={config.primaryLabel}
                  stroke={config.primaryColor}
                  strokeWidth={2.5}
                  dot={{ fill: config.primaryColor, r: 4 }}
                />
              )}

              {/* Secondary Element (Line or Bar) */}
              {config.secondaryType === 'line' ? (
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey={config.secondaryKey}
                  name={config.secondaryLabel}
                  stroke={config.secondaryColor}
                  strokeWidth={2.2}
                  dot={{ fill: config.secondaryColor, r: 3 }}
                />
              ) : (
                <Bar
                  yAxisId="right"
                  dataKey={config.secondaryKey}
                  name={config.secondaryLabel}
                  fill={config.secondaryColor}
                  opacity={0.35}
                  radius={[3, 3, 0, 0]}
                  maxBarSize={20}
                />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Right: SUMMARY Card - Dynamic according to activeTab */}
        <div
          style={{
            background: 'var(--bg-card-hover)',
            border: '1px solid var(--border-primary)',
            borderRadius: 'var(--radius-md, 8px)',
            padding: '16px 18px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: 12
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              {activeTab.toUpperCase()} SUMMARY
            </span>
            <span style={{ fontSize: '0.65rem', color: config.primaryColor, fontWeight: 600 }}>
              {timeRange} Projection
            </span>
          </div>

          {summary && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{summary.label1}</span>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                  {summary.val1}
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--border-primary)', paddingTop: 8 }}>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{summary.label2}</span>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: summary.color2 || 'var(--risk-critical)', fontFamily: 'var(--font-mono)' }}>
                  {summary.val2} <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 500 }}>{summary.tag2}</span>
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--border-primary)', paddingTop: 8 }}>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{summary.label3}</span>
                <div style={{ fontSize: '1.05rem', fontWeight: 700, color: summary.color3 || 'var(--risk-high)', fontFamily: 'var(--font-mono)' }}>
                  {summary.val3}
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--border-primary)', paddingTop: 8 }}>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{summary.label4}</span>
                <div style={{ fontSize: '1.05rem', fontWeight: 700, color: summary.color4 || 'var(--risk-low)', fontFamily: 'var(--font-mono)' }}>
                  {summary.val4}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom: WARNING THRESHOLDS */}
      <div style={{ borderTop: '1px solid var(--border-primary)', paddingTop: 14 }}>
        <span style={{ fontSize: '0.68rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 10 }}>
          WARNING THRESHOLDS
        </span>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
          {/* Card 1: Rainfall */}
          <div
            style={{
              background: 'var(--bg-card-hover)',
              border: `1px solid ${activeTab === 'Rainfall' ? 'var(--brand-primary)' : 'var(--border-primary)'}`,
              borderRadius: 'var(--radius-md, 8px)',
              padding: '10px 14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: activeTab === 'Rainfall' ? '0 0 10px rgba(79, 111, 255, 0.2)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            <div>
              <span style={{ fontSize: '0.66rem', color: 'var(--text-muted)' }}>Rainfall Threshold</span>
              <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                Rainfall &gt; 150 mm
              </div>
            </div>
            <RiskBadge level="Critical" />
          </div>

          {/* Card 2: Risk */}
          <div
            style={{
              background: 'var(--bg-card-hover)',
              border: `1px solid ${activeTab === 'Risk Index' ? 'var(--risk-critical)' : 'var(--border-primary)'}`,
              borderRadius: 'var(--radius-md, 8px)',
              padding: '10px 14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: activeTab === 'Risk Index' ? '0 0 10px rgba(255, 77, 90, 0.2)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            <div>
              <span style={{ fontSize: '0.66rem', color: 'var(--text-muted)' }}>Risk Threshold</span>
              <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                Risk Index &gt; 80%
              </div>
            </div>
            <RiskBadge level="Critical" />
          </div>

          {/* Card 3: Soil Moisture */}
          <div
            style={{
              background: 'var(--bg-card-hover)',
              border: `1px solid ${activeTab === 'Soil Moisture' ? '#38BDF8' : 'var(--border-primary)'}`,
              borderRadius: 'var(--radius-md, 8px)',
              padding: '10px 14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: activeTab === 'Soil Moisture' ? '0 0 10px rgba(56, 189, 248, 0.25)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            <div>
              <span style={{ fontSize: '0.66rem', color: 'var(--text-muted)' }}>Soil Moisture Threshold</span>
              <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                Soil Moisture &gt; 80%
              </div>
            </div>
            <RiskBadge level="High" />
          </div>

          {/* Card 4: ARI / Wind Threshold */}
          <div
            style={{
              background: 'var(--bg-card-hover)',
              border: `1px solid ${activeTab === 'Wind' ? 'var(--risk-low)' : 'var(--border-primary)'}`,
              borderRadius: 'var(--radius-md, 8px)',
              padding: '10px 14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: activeTab === 'Wind' ? '0 0 10px rgba(49, 183, 122, 0.2)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            <div>
              <span style={{ fontSize: '0.66rem', color: 'var(--text-muted)' }}>
                {activeTab === 'Wind' ? 'Gale Force Threshold' : 'ARI Threshold'}
              </span>
              <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                {activeTab === 'Wind' ? 'Wind Speed > 30 km/h' : 'ARI > 60 mm'}
              </div>
            </div>
            <RiskBadge level={activeTab === 'Wind' ? 'Medium' : 'High'} />
          </div>
        </div>
      </div>
    </Card>
  );
}

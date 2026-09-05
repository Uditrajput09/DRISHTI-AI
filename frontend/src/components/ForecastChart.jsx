import React, { useState } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';

export default function ForecastChart({
  zoneId = 1,
  zoneName = 'Sohra (Cherrapunji) Escarpment'
}) {
  const [activeTab, setActiveTab] = useState('Rainfall');
  const [timeRange, setTimeRange] = useState('48H');

  // Exact 9 time buckets matching Screen 4: Now, +6h, +12h, +18h, +24h, +30h, +36h, +42h, +48h
  const data48h = [
    { time: 'Now', rainfall: 22, risk: 42, moisture: 64, temp: 20, wind: 14 },
    { time: '+6h', timeLabel: '+6h', rainfall: 42, risk: 52, moisture: 69, temp: 19, wind: 18 },
    { time: '+12h', timeLabel: '+12h', rainfall: 68, risk: 68, moisture: 75, temp: 18, wind: 24 },
    { time: '+18h', timeLabel: '+18h', rainfall: 112, risk: 84, moisture: 82, temp: 18, wind: 30 },
    { time: '+24h', timeLabel: '+24h', rainfall: 186, risk: 96, moisture: 92, temp: 17, wind: 36 },
    { time: '+30h', timeLabel: '+30h', rainfall: 145, risk: 90, moisture: 89, temp: 17, wind: 32 },
    { time: '+36h', timeLabel: '+36h', rainfall: 94, risk: 78, moisture: 84, temp: 18, wind: 26 },
    { time: '+42h', timeLabel: '+42h', rainfall: 58, risk: 62, moisture: 76, temp: 19, wind: 20 },
    { time: '+48h', timeLabel: '+48h', rainfall: 32, risk: 48, moisture: 70, temp: 20, wind: 15 }
  ];

  // Slice for 6H, 12H, 24H, 48H
  const getDisplayData = () => {
    if (timeRange === '6H') return data48h.slice(0, 2);
    if (timeRange === '12H') return data48h.slice(0, 3);
    if (timeRange === '24H') return data48h.slice(0, 5);
    return data48h;
  };

  const tabs = ['Rainfall', 'Risk Index', 'Soil Moisture', 'Temperature', 'Wind'];

  return (
    <div
      className="command-panel"
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
                  background: isActive ? 'rgba(53, 216, 255, 0.15)' : 'rgba(21, 27, 41, 0.8)',
                  border: `1px solid ${isActive ? '#35D8FF' : 'rgba(120, 140, 180, 0.2)'}`,
                  color: isActive ? '#35D8FF' : '#9AA5B8',
                  borderRadius: 6,
                  padding: '5px 12px',
                  fontSize: '0.76rem',
                  fontWeight: 700,
                  fontFamily: 'Space Grotesk, sans-serif',
                  cursor: 'pointer'
                }}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {/* Time Horizon Toggles: 6H, 12H, 24H, 48H */}
        <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(21, 27, 41, 0.9)', borderRadius: 6, padding: 3, border: '1px solid rgba(120, 140, 180, 0.2)' }}>
          {['6H', '12H', '24H', '48H'].map(t => (
            <button
              key={t}
              onClick={() => setTimeRange(t)}
              style={{
                background: timeRange === t ? 'linear-gradient(135deg, #8B6CFF, #35D8FF)' : 'transparent',
                color: timeRange === t ? '#FFFFFF' : '#9AA5B8',
                border: 'none',
                borderRadius: 4,
                padding: '4px 10px',
                fontSize: '0.72rem',
                fontWeight: 800,
                fontFamily: 'Space Grotesk, sans-serif',
                cursor: 'pointer'
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
        {/* Left: Recharts Composed Chart (Bars + Line) */}
        <div style={{ width: '100%', height: 260 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8, fontSize: '0.72rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#35D8FF' }}>
              <span style={{ width: 10, height: 10, background: '#35D8FF', borderRadius: 2 }} />
              Rainfall (mm)
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#FF3B6B' }}>
              <span style={{ width: 10, height: 10, background: '#FF3B6B', borderRadius: '50%' }} />
              Risk Index (%)
            </span>
          </div>

          <ResponsiveContainer width="100%" height="90%">
            <ComposedChart data={getDisplayData()} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(120, 140, 180, 0.1)" />
              <XAxis dataKey="time" stroke="#5C677D" tick={{ fill: '#9AA5B8', fontSize: 11 }} />
              <YAxis yAxisId="left" stroke="#5C677D" tick={{ fill: '#9AA5B8', fontSize: 11 }} />
              <YAxis yAxisId="right" orientation="right" stroke="#5C677D" tick={{ fill: '#9AA5B8', fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#101521',
                  border: '1px solid rgba(53, 216, 255, 0.4)',
                  borderRadius: 8,
                  fontSize: '0.74rem'
                }}
              />
              <Bar yAxisId="left" dataKey="rainfall" fill="#35D8FF" radius={[4, 4, 0, 0]} maxBarSize={28} />
              <Line yAxisId="right" type="monotone" dataKey="risk" stroke="#FF3B6B" strokeWidth={2.5} dot={{ fill: '#FF3B6B', r: 4 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Right: SUMMARY Card matching Screen 4 */}
        <div
          style={{
            background: 'var(--bg-surface-elevated)',
            border: '1px solid rgba(120, 140, 180, 0.2)',
            borderRadius: 10,
            padding: '16px 18px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: 12
          }}
        >
          <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#9AA5B8', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'Space Grotesk, sans-serif' }}>
            SUMMARY
          </span>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div>
              <span style={{ fontSize: '0.68rem', color: '#9AA5B8' }}>Current Rainfall</span>
              <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#FFFFFF', fontFamily: 'Space Grotesk, sans-serif' }}>
                68 mm
              </div>
            </div>

            <div style={{ borderTop: '1px solid rgba(120, 140, 180, 0.15)', paddingTop: 8 }}>
              <span style={{ fontSize: '0.68rem', color: '#9AA5B8' }}>Peak Forecast</span>
              <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#FF3B6B', fontFamily: 'Space Grotesk, sans-serif' }}>
                186 mm <span style={{ fontSize: '0.72rem', color: '#9AA5B8', fontWeight: 600 }}>+24h</span>
              </div>
            </div>

            <div style={{ borderTop: '1px solid rgba(120, 140, 180, 0.15)', paddingTop: 8 }}>
              <span style={{ fontSize: '0.68rem', color: '#9AA5B8' }}>Highest Risk Window</span>
              <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#FF9D3D', fontFamily: 'Space Grotesk, sans-serif' }}>
                18h – 30h
              </div>
            </div>

            <div style={{ borderTop: '1px solid rgba(120, 140, 180, 0.15)', paddingTop: 8 }}>
              <span style={{ fontSize: '0.68rem', color: '#9AA5B8' }}>Confidence</span>
              <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#39D98A', fontFamily: 'Space Grotesk, sans-serif' }}>
                High (92%)
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom: WARNING THRESHOLDS matching Screen 4 */}
      <div style={{ borderTop: '1px solid rgba(120, 140, 180, 0.18)', paddingTop: 14 }}>
        <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#9AA5B8', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'Space Grotesk, sans-serif', display: 'block', marginBottom: 10 }}>
          WARNING THRESHOLDS
        </span>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
          {/* Card 1 */}
          <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid rgba(255, 59, 107, 0.3)', borderRadius: 8, padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <span style={{ fontSize: '0.66rem', color: '#9AA5B8' }}>Rainfall Threshold</span>
              <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#FFFFFF', fontFamily: 'Space Grotesk, sans-serif' }}>
                Rainfall &gt; 150 mm
              </div>
            </div>
            <span className="badge-critical">Extreme</span>
          </div>

          {/* Card 2 */}
          <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid rgba(255, 59, 107, 0.3)', borderRadius: 8, padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <span style={{ fontSize: '0.66rem', color: '#9AA5B8' }}>Risk Threshold</span>
              <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#FFFFFF', fontFamily: 'Space Grotesk, sans-serif' }}>
                Risk Index &gt; 80%
              </div>
            </div>
            <span className="badge-critical">Critical</span>
          </div>

          {/* Card 3 */}
          <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid rgba(255, 157, 61, 0.3)', borderRadius: 8, padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <span style={{ fontSize: '0.66rem', color: '#9AA5B8' }}>Soil Moisture Threshold</span>
              <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#FFFFFF', fontFamily: 'Space Grotesk, sans-serif' }}>
                Soil Moisture &gt; 80%
              </div>
            </div>
            <span className="badge-high">High</span>
          </div>

          {/* Card 4 */}
          <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid rgba(255, 157, 61, 0.3)', borderRadius: 8, padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <span style={{ fontSize: '0.66rem', color: '#9AA5B8' }}>ARI Threshold</span>
              <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#FFFFFF', fontFamily: 'Space Grotesk, sans-serif' }}>
                ARI &gt; 60 mm
              </div>
            </div>
            <span className="badge-high">High</span>
          </div>
        </div>
      </div>
    </div>
  );
}

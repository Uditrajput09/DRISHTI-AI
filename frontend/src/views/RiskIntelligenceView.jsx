import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Search, 
  Users,
  Building2,
  Home,
  Navigation,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  FileText
} from 'lucide-react';
import ZoneComparison from '../components/ZoneComparison';
import { exportZoneRiskPDF } from '../utils/pdfExport';

export default function RiskIntelligenceView({
  zones = [],
  onSelectZone,
  onNavigateToGIS
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedZone, setSelectedZone] = useState(null);

  // Exact 10 zones matching Screen 2 table
  const exactRiskZones = [
    { id: 1, name: 'Sohra (Cherrapunji) Escarpment', risk_score: 100, level: 'Critical', prob: '100%', rain: '186 mm', moisture: '72%', trend: 'up', status: 'Active', area: '452.6 km²', elevation: '1,640 m', slope: '31.7°', geology: 'Gneiss & Shale', drainage: '2.8 km/km²' },
    { id: 2, name: 'Mawsynram Ridge', risk_score: 87, level: 'High', prob: '87%', rain: '142 mm', moisture: '68%', trend: 'up', status: 'Active', area: '310.2 km²', elevation: '1,420 m', slope: '28.4°', geology: 'Quartzite', drainage: '3.1 km/km²' },
    { id: 3, name: 'Pynursla Pass', risk_score: 72, level: 'High', prob: '72%', rain: '120 mm', moisture: '61%', trend: 'up', status: 'Active', area: '280.5 km²', elevation: '1,380 m', slope: '26.8°', geology: 'Sandstone', drainage: '2.4 km/km²' },
    { id: 4, name: 'Nongstoin Road', risk_score: 61, level: 'High', prob: '61%', rain: '98 mm', moisture: '56%', trend: 'neutral', status: 'Active', area: '195.0 km²', elevation: '1,210 m', slope: '22.3°', geology: 'Schist Complex', drainage: '2.1 km/km²' },
    { id: 5, name: 'Mawphlang Valley', risk_score: 49, level: 'Medium', prob: '49%', rain: '76 mm', moisture: '52%', trend: 'neutral', status: 'Active', area: '220.4 km²', elevation: '1,560 m', slope: '19.5°', geology: 'Granitoid', drainage: '1.9 km/km²' },
    { id: 6, name: 'Laitkynsew Area', risk_score: 36, level: 'Medium', prob: '36%', rain: '60 mm', moisture: '48%', trend: 'down', status: 'Active', area: '175.8 km²', elevation: '980 m', slope: '24.1°', geology: 'Limestone Scarp', drainage: '2.6 km/km²' },
    { id: 7, name: 'Mawlynnong', risk_score: 28, level: 'Low', prob: '28%', rain: '48 mm', moisture: '41%', trend: 'down', status: 'Active', area: '140.2 km²', elevation: '850 m', slope: '16.2°', geology: 'Sedimentary', drainage: '1.8 km/km²' },
    { id: 8, name: 'Mylliem', risk_score: 22, level: 'Low', prob: '22%', rain: '40 mm', moisture: '39%', trend: 'down', status: 'Active', area: '160.0 km²', elevation: '1,490 m', slope: '14.0°', geology: 'Granite', drainage: '1.5 km/km²' },
    { id: 9, name: 'Mawphlang', risk_score: 12, level: 'Safe', prob: '12%', rain: '28 mm', moisture: '34%', trend: 'down', status: 'Active', area: '110.0 km²', elevation: '1,510 m', slope: '11.5°', geology: 'Stable Mantle', drainage: '1.2 km/km²' },
    { id: 10, name: 'Mawsmai Cave', risk_score: 8, level: 'Safe', prob: '8%', rain: '16 mm', moisture: '20%', trend: 'down', status: 'Active', area: '85.4 km²', elevation: '1,190 m', slope: '8.4°', geology: 'Limestone Bed', drainage: '1.0 km/km²' }
  ];

  const activeInspectorZone = selectedZone || exactRiskZones[0];

  const filteredZones = exactRiskZones.filter(z => 
    z.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getLevelBadge = (lvl) => {
    switch (lvl) {
      case 'Critical': return 'badge-critical';
      case 'High': return 'badge-high';
      case 'Medium': return 'badge-medium';
      default: return 'badge-safe';
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
      {/* Header & KPI Summary Strip */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#FFFFFF', letterSpacing: '0.04em', fontFamily: 'Space Grotesk, sans-serif', margin: 0 }}>
            RISK INTELLIGENCE
          </h1>
          <span style={{ fontSize: '0.74rem', color: '#9AA5B8' }}>
            East Khasi Hills • 10 Monitored Zones • Live Analysis
          </span>
        </div>

        {/* 5 KPI Summary Pills matching Screen 2 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid rgba(120, 140, 180, 0.2)', padding: '5px 12px', borderRadius: 6, fontSize: '0.74rem', display: 'flex', gap: 6 }}>
            <span style={{ color: '#9AA5B8' }}>Total Zones:</span>
            <strong style={{ color: '#35D8FF', fontFamily: 'Space Grotesk, sans-serif' }}>10</strong>
          </div>

          <div style={{ background: 'rgba(255, 59, 107, 0.12)', border: '1px solid rgba(255, 59, 107, 0.35)', padding: '5px 12px', borderRadius: 6, fontSize: '0.74rem', display: 'flex', gap: 6 }}>
            <span style={{ color: '#FF3B6B' }}>Critical Zones:</span>
            <strong style={{ color: '#FF3B6B', fontFamily: 'Space Grotesk, sans-serif' }}>2</strong>
          </div>

          <div style={{ background: 'rgba(255, 157, 61, 0.12)', border: '1px solid rgba(255, 157, 61, 0.35)', padding: '5px 12px', borderRadius: 6, fontSize: '0.74rem', display: 'flex', gap: 6 }}>
            <span style={{ color: '#FF9D3D' }}>High Risk:</span>
            <strong style={{ color: '#FF9D3D', fontFamily: 'Space Grotesk, sans-serif' }}>4</strong>
          </div>

          <div style={{ background: 'rgba(255, 216, 77, 0.12)', border: '1px solid rgba(255, 216, 77, 0.35)', padding: '5px 12px', borderRadius: 6, fontSize: '0.74rem', display: 'flex', gap: 6 }}>
            <span style={{ color: '#FFD84D' }}>Medium Risk:</span>
            <strong style={{ color: '#FFD84D', fontFamily: 'Space Grotesk, sans-serif' }}>3</strong>
          </div>

          <div style={{ background: 'rgba(57, 217, 138, 0.12)', border: '1px solid rgba(57, 217, 138, 0.35)', padding: '5px 12px', borderRadius: 6, fontSize: '0.74rem', display: 'flex', gap: 6 }}>
            <span style={{ color: '#39D98A' }}>Low Risk:</span>
            <strong style={{ color: '#39D98A', fontFamily: 'Space Grotesk, sans-serif' }}>1</strong>
          </div>
        </div>
      </div>

      {/* TOP RISK ZONES Table matching Screen 2 */}
      <div className="command-panel" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '12px 18px', borderBottom: '1px solid rgba(120, 140, 180, 0.18)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#FFFFFF', letterSpacing: '0.04em', fontFamily: 'Space Grotesk, sans-serif' }}>
            TOP RISK ZONES
          </span>
          <div style={{ position: 'relative', width: 200 }}>
            <Search size={13} color="#5C677D" style={{ position: 'absolute', left: 8, top: 9 }} />
            <input
              type="text"
              placeholder="Filter zone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="command-input"
              style={{ paddingLeft: 26, fontSize: '0.74rem', height: 30 }}
            />
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.76rem' }}>
            <thead>
              <tr style={{ background: 'var(--bg-surface-elevated)', borderBottom: '1px solid rgba(120, 140, 180, 0.2)', color: '#9AA5B8', fontFamily: 'Space Grotesk, sans-serif' }}>
                <th style={{ padding: '10px 14px' }}>Zone</th>
                <th style={{ padding: '10px 14px' }}>Risk Score</th>
                <th style={{ padding: '10px 14px' }}>Level</th>
                <th style={{ padding: '10px 14px' }}>Probability</th>
                <th style={{ padding: '10px 14px' }}>Rainfall (24h)</th>
                <th style={{ padding: '10px 14px' }}>Soil Moisture</th>
                <th style={{ padding: '10px 14px' }}>Trend</th>
                <th style={{ padding: '10px 14px' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredZones.map((z) => {
                const isSelected = activeInspectorZone.id === z.id;
                return (
                  <tr
                    key={z.id}
                    onClick={() => setSelectedZone(z)}
                    style={{
                      borderBottom: '1px solid rgba(120, 140, 180, 0.1)',
                      cursor: 'pointer',
                      background: isSelected ? 'rgba(53, 216, 255, 0.08)' : 'transparent',
                      transition: 'background 0.15s ease'
                    }}
                    className="table-row-hover"
                  >
                    <td style={{ padding: '10px 14px', fontWeight: 700, color: '#FFFFFF' }}>
                      {z.name}
                    </td>
                    <td style={{ padding: '10px 14px', fontWeight: 900, fontFamily: 'Space Grotesk, sans-serif', color: z.risk_score >= 80 ? '#FF3B6B' : (z.risk_score >= 60 ? '#FF9D3D' : (z.risk_score >= 30 ? '#FFD84D' : '#39D98A')) }}>
                      {z.risk_score}%
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      <span className={getLevelBadge(z.level)}>
                        {z.level}
                      </span>
                    </td>
                    <td style={{ padding: '10px 14px', color: '#CBD5E1', fontFamily: 'JetBrains Mono, monospace' }}>
                      {z.prob}
                    </td>
                    <td style={{ padding: '10px 14px', color: '#35D8FF', fontFamily: 'JetBrains Mono, monospace' }}>
                      {z.rain}
                    </td>
                    <td style={{ padding: '10px 14px', color: '#8B6CFF', fontFamily: 'JetBrains Mono, monospace' }}>
                      {z.moisture}
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      {z.trend === 'up' && <span style={{ color: '#FF3B6B', fontWeight: 800 }}>↑</span>}
                      {z.trend === 'neutral' && <span style={{ color: '#FFD84D', fontWeight: 800 }}>→</span>}
                      {z.trend === 'down' && <span style={{ color: '#39D98A', fontWeight: 800 }}>↓</span>}
                    </td>
                    <td style={{ padding: '10px 14px', color: '#39D98A', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#39D98A' }} />
                      <span>{z.status}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* BOTTOM SPLIT: Zone Comparison Radar on Left | Vulnerability & Inspector on Right */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.15fr) minmax(360px, 1fr)',
          gap: 16,
          alignItems: 'stretch'
        }}
        className="simulation-xai-grid"
      >
        {/* Left: ZONE COMPARISON Radar Chart */}
        <div>
          <ZoneComparison zones={zones.length > 0 ? zones : exactRiskZones} />
        </div>

        {/* Right Column: VULNERABILITY OVERVIEW (Top) + ZONE INSPECTOR (Bottom) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* VULNERABILITY OVERVIEW (3 Cards in a Row matching Screen 2) */}
          <div className="command-panel" style={{ padding: '14px 16px' }}>
            <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#9AA5B8', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'Space Grotesk, sans-serif', marginBottom: 10 }}>
              VULNERABILITY OVERVIEW
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
              {/* Card 1: Population at Risk */}
              <div style={{ background: 'var(--bg-surface-elevated)', padding: '10px 10px', borderRadius: 8, border: '1px solid rgba(120, 140, 180, 0.15)' }}>
                <span style={{ fontSize: '0.62rem', color: '#9AA5B8', textTransform: 'uppercase', display: 'block' }}>Population at Risk</span>
                <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#FF3B6B', fontFamily: 'Space Grotesk, sans-serif', lineHeight: 1.1, marginTop: 4 }}>
                  12,842
                </div>
                <span style={{ fontSize: '0.62rem', color: '#39D98A', fontWeight: 700 }}>+ 1,234</span>
              </div>

              {/* Card 2: Critical Infrastructure */}
              <div style={{ background: 'var(--bg-surface-elevated)', padding: '10px 10px', borderRadius: 8, border: '1px solid rgba(120, 140, 180, 0.15)' }}>
                <span style={{ fontSize: '0.62rem', color: '#9AA5B8', textTransform: 'uppercase', display: 'block' }}>Critical Infra</span>
                <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#FF9D3D', fontFamily: 'Space Grotesk, sans-serif', lineHeight: 1.1, marginTop: 4 }}>
                  24
                </div>
                <span style={{ fontSize: '0.6rem', color: '#5C677D' }}>Bridges, Schools</span>
              </div>

              {/* Card 3: Settlements */}
              <div style={{ background: 'var(--bg-surface-elevated)', padding: '10px 10px', borderRadius: 8, border: '1px solid rgba(120, 140, 180, 0.15)' }}>
                <span style={{ fontSize: '0.62rem', color: '#9AA5B8', textTransform: 'uppercase', display: 'block' }}>Settlements</span>
                <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#35D8FF', fontFamily: 'Space Grotesk, sans-serif', lineHeight: 1.1, marginTop: 4 }}>
                  36
                </div>
                <span style={{ fontSize: '0.6rem', color: '#5C677D' }}>Villages</span>
              </div>

              {/* Card 4: Road Length at Risk */}
              <div style={{ background: 'var(--bg-surface-elevated)', padding: '10px 10px', borderRadius: 8, border: '1px solid rgba(120, 140, 180, 0.15)' }}>
                <span style={{ fontSize: '0.62rem', color: '#9AA5B8', textTransform: 'uppercase', display: 'block' }}>Road at Risk</span>
                <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#FF4DB8', fontFamily: 'Space Grotesk, sans-serif', lineHeight: 1.1, marginTop: 4 }}>
                  48.6 km
                </div>
                <span style={{ fontSize: '0.6rem', color: '#5C677D' }}>NH-6 & NH-106</span>
              </div>
            </div>
          </div>

          {/* ZONE INSPECTOR matching Screen 2 */}
          <div className="command-panel" style={{ padding: '16px 18px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#9AA5B8', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'Space Grotesk, sans-serif' }}>
                  ZONE INSPECTOR
                </span>
                <span className={getLevelBadge(activeInspectorZone.level)}>
                  {activeInspectorZone.level}
                </span>
              </div>

              <h3 style={{ fontSize: '1.05rem', fontWeight: 900, color: '#FFFFFF', fontFamily: 'Space Grotesk, sans-serif', margin: '0 0 12px' }}>
                {activeInspectorZone.name}
              </h3>

              {/* Metrics Grid matching Screen 2 */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 12 }}>
                <div style={{ background: 'var(--bg-surface-elevated)', padding: '8px 10px', borderRadius: 6 }}>
                  <span style={{ fontSize: '0.62rem', color: '#9AA5B8' }}>Area</span>
                  <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#FFFFFF', fontFamily: 'Space Grotesk, sans-serif' }}>
                    {activeInspectorZone.area}
                  </div>
                </div>

                <div style={{ background: 'var(--bg-surface-elevated)', padding: '8px 10px', borderRadius: 6 }}>
                  <span style={{ fontSize: '0.62rem', color: '#9AA5B8' }}>Max Elevation</span>
                  <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#35D8FF', fontFamily: 'Space Grotesk, sans-serif' }}>
                    {activeInspectorZone.elevation}
                  </div>
                </div>

                <div style={{ background: 'var(--bg-surface-elevated)', padding: '8px 10px', borderRadius: 6 }}>
                  <span style={{ fontSize: '0.62rem', color: '#9AA5B8' }}>Avg Slope</span>
                  <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#FF9D3D', fontFamily: 'Space Grotesk, sans-serif' }}>
                    {activeInspectorZone.slope}
                  </div>
                </div>

                <div style={{ background: 'var(--bg-surface-elevated)', padding: '8px 10px', borderRadius: 6 }}>
                  <span style={{ fontSize: '0.62rem', color: '#9AA5B8' }}>Geology</span>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#CBD5E1' }}>
                    {activeInspectorZone.geology}
                  </div>
                </div>

                <div style={{ background: 'var(--bg-surface-elevated)', padding: '8px 10px', borderRadius: 6, gridColumn: 'span 2' }}>
                  <span style={{ fontSize: '0.62rem', color: '#9AA5B8' }}>Drainage Density</span>
                  <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#8B6CFF', fontFamily: 'Space Grotesk, sans-serif' }}>
                    {activeInspectorZone.drainage}
                  </div>
                </div>
              </div>
            </div>

            {/* View Detailed Report Button */}
            <button
              onClick={() => {
                const found = zones.find(z => z.id === activeInspectorZone.id) || activeInspectorZone;
                exportZoneRiskPDF(found);
              }}
              className="btn-primary-cyan"
              style={{ width: '100%', padding: '9px 0', fontSize: '0.78rem', justifyContent: 'center' }}
            >
              <FileText size={14} />
              <span>View Detailed Report</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

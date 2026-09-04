import React, { useState } from 'react';
import { 
  ShieldAlert, 
  TrendingUp, 
  MapPin, 
  Layers, 
  ArrowRight, 
  Search, 
  Download, 
  Filter, 
  Scale 
} from 'lucide-react';
import ZoneComparison from '../components/ZoneComparison';
import { exportZoneRiskPDF } from '../utils/pdfExport';

export default function RiskIntelligenceView({
  zones = [],
  onSelectZone,
  onNavigateToGIS
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('ALL');

  const filteredZones = zones.filter(z => {
    const matchesSearch = (z.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (z.zone_code || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = selectedLevel === 'ALL' || z.risk_level === selectedLevel;
    return matchesSearch && matchesLevel;
  });

  const sortedZones = [...filteredZones].sort((a, b) => (b.risk_score || 0) - (a.risk_score || 0));

  const getBadgeColor = (level) => {
    switch (level) {
      case 'Critical': return { color: '#FF3B6B', bg: 'rgba(255, 59, 107, 0.15)' };
      case 'High': return { color: '#FF9D3D', bg: 'rgba(255, 157, 61, 0.15)' };
      case 'Medium': return { color: '#FFD84D', bg: 'rgba(255, 216, 77, 0.15)' };
      default: return { color: '#39D98A', bg: 'rgba(57, 217, 138, 0.15)' };
    }
  };

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Title */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: 10, fontFamily: 'Space Grotesk, sans-serif' }}>
            <ShieldAlert size={22} color="#35D8FF" />
            <span>RISK INTELLIGENCE & GEOTECHNICAL MATRIX</span>
          </h1>
          <p style={{ fontSize: '0.78rem', color: '#9AA5B8', marginTop: 3 }}>
            District-wide micro-zone susceptibility rankings, vulnerability indices, and physics-informed parameters.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ position: 'relative', width: 220 }}>
            <Search size={14} color="#5C677D" style={{ position: 'absolute', left: 10, top: 11 }} />
            <input
              type="text"
              placeholder="Search zones..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="command-input"
              style={{ paddingLeft: 30, fontSize: '0.78rem' }}
            />
          </div>

          <div style={{ display: 'flex', gap: 4 }}>
            {['ALL', 'Critical', 'High', 'Medium', 'Low'].map(lvl => (
              <button
                key={lvl}
                onClick={() => setSelectedLevel(lvl)}
                style={{
                  background: selectedLevel === lvl ? '#35D8FF' : '#101521',
                  color: selectedLevel === lvl ? '#070A10' : '#9AA5B8',
                  border: `1px solid ${selectedLevel === lvl ? '#35D8FF' : 'rgba(120, 140, 180, 0.22)'}`,
                  borderRadius: 6,
                  padding: '5px 10px',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Ranking Table */}
      <div
        style={{
          background: '#101521',
          border: '1px solid rgba(120, 140, 180, 0.22)',
          borderRadius: 14,
          overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)'
        }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8rem' }}>
            <thead>
              <tr style={{ background: '#151B29', borderBottom: '1px solid rgba(120, 140, 180, 0.2)', color: '#9AA5B8', fontFamily: 'Space Grotesk, sans-serif' }}>
                <th style={{ padding: '12px 16px' }}>ZONE & CODE</th>
                <th style={{ padding: '12px 16px' }}>RISK INDEX</th>
                <th style={{ padding: '12px 16px' }}>SEVERITY</th>
                <th style={{ padding: '12px 16px' }}>24H RAIN</th>
                <th style={{ padding: '12px 16px' }}>SLOPE</th>
                <th style={{ padding: '12px 16px' }}>SOIL SATURATION</th>
                <th style={{ padding: '12px 16px' }}>GEOLOGY</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {sortedZones.map((zone, idx) => {
                const badge = getBadgeColor(zone.risk_level);
                return (
                  <tr
                    key={zone.id || idx}
                    style={{
                      borderBottom: '1px solid rgba(120, 140, 180, 0.1)',
                      transition: 'background 0.15s ease'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.background = 'rgba(120, 140, 180, 0.05)'}
                    onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontWeight: 800, color: '#F4F6FB' }}>{zone.name}</div>
                      <div style={{ fontSize: '0.7rem', color: '#35D8FF', fontFamily: 'JetBrains Mono, monospace' }}>
                        {zone.zone_code} • {zone.district}
                      </div>
                    </td>

                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ fontSize: '1.2rem', fontWeight: 900, color: badge.color, fontFamily: 'Space Grotesk, sans-serif' }}>
                        {zone.risk_score}%
                      </span>
                    </td>

                    <td style={{ padding: '12px 16px' }}>
                      <span
                        style={{
                          background: badge.bg,
                          color: badge.color,
                          padding: '3px 8px',
                          borderRadius: 4,
                          fontWeight: 800,
                          fontSize: '0.68rem',
                          textTransform: 'uppercase'
                        }}
                      >
                        {zone.risk_level}
                      </span>
                    </td>

                    <td style={{ padding: '12px 16px', color: '#F4F6FB', fontWeight: 600 }}>
                      {zone.rainfall_24h} mm
                    </td>

                    <td style={{ padding: '12px 16px', color: '#F4F6FB', fontWeight: 600 }}>
                      {zone.base_slope_deg}°
                    </td>

                    <td style={{ padding: '12px 16px', color: '#F4F6FB', fontWeight: 600 }}>
                      {zone.soil_moisture_pct}%
                    </td>

                    <td style={{ padding: '12px 16px', color: '#9AA5B8', fontSize: '0.74rem' }}>
                      {zone.geology || 'Precambrian Gneiss'}
                    </td>

                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <button
                        onClick={() => {
                          if (onSelectZone) onSelectZone(zone);
                          if (onNavigateToGIS) onNavigateToGIS();
                        }}
                        className="btn-surface"
                        style={{ padding: '5px 10px', fontSize: '0.72rem' }}
                      >
                        <span>Inspect on GIS</span>
                        <ArrowRight size={11} color="#35D8FF" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Zone Comparison Tool Component */}
      <div style={{ marginTop: 8 }}>
        <ZoneComparison zones={zones} />
      </div>
    </div>
  );
}

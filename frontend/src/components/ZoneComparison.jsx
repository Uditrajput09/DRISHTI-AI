/**
 * frontend/src/components/ZoneComparison.jsx
 * Multi-zone geotechnical radar comparison using Recharts.
 */
import React, { useState } from 'react';
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer, 
  Legend, 
  Tooltip 
} from 'recharts';
import { Scale, Layers, ChevronDown } from 'lucide-react';

export default function ZoneComparison({ zones = [] }) {
  // Select up to 3-4 zones for comparison
  const [selectedZoneIds, setSelectedZoneIds] = useState([1, 2, 4, 6]);

  const activeZones = zones.filter(z => selectedZoneIds.includes(z.id));

  // Radar metrics
  const radarData = [
    { subject: 'Rainfall', max: 100 },
    { subject: 'Slope', max: 100 },
    { subject: 'Soil Moisture', max: 100 },
    { subject: 'ARI Index', max: 100 },
    { subject: 'Historical', max: 100 },
    { subject: 'Population', max: 100 }
  ];

  // Colors for compared zones matching design board
  const ZONE_COLORS = ['#FF3B6B', '#FF9D3D', '#35D8FF', '#8B6CFF'];

  // Populate data for radar
  const formattedData = radarData.map(metric => {
    const row = { subject: metric.subject };
    activeZones.forEach((z, idx) => {
      let val = 50;
      if (metric.subject === 'Rainfall') {
        val = Math.min(100, Math.round(((z.rainfall_24h || 120) / 700) * 100));
      } else if (metric.subject === 'Slope') {
        val = Math.min(100, Math.round(((z.base_slope_deg || 35) / 50) * 100));
      } else if (metric.subject === 'Soil Moisture') {
        val = z.soil_moisture_pct || 75;
      } else if (metric.subject === 'ARI Index') {
        val = Math.min(100, Math.round(((z.rainfall_72h || 150) / 400) * 100));
      } else if (metric.subject === 'Historical') {
        val = Math.min(100, (z.historical_landslides_count || 3) * 12);
      } else if (metric.subject === 'Population') {
        val = Math.min(100, Math.round(((z.population_at_risk || 3000) / 10000) * 100));
      }
      row[`zone_${z.id}`] = val;
    });
    return row;
  });

  const toggleZone = (id) => {
    if (selectedZoneIds.includes(id)) {
      if (selectedZoneIds.length > 1) {
        setSelectedZoneIds(selectedZoneIds.filter(x => x !== id));
      }
    } else {
      if (selectedZoneIds.length < 4) {
        setSelectedZoneIds([...selectedZoneIds, id]);
      }
    }
  };

  return (
    <div
      className="command-panel"
      style={{
        padding: 20,
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ background: 'rgba(53, 216, 255, 0.12)', padding: 6, borderRadius: 8 }}>
            <Scale size={18} color="#35D8FF" />
          </div>
          <div>
            <h3 style={{ fontSize: '0.96rem', fontWeight: 800, color: '#FFFFFF', letterSpacing: '0.04em', fontFamily: 'Space Grotesk, sans-serif' }}>
              ZONE COMPARISON RADAR
            </h3>
            <div style={{ fontSize: '0.72rem', color: '#9AA5B8' }}>
              Compare up to 4 zones across geotechnical and demographic vectors
            </div>
          </div>
        </div>

        {/* Zone Selector Chips */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {zones.slice(0, 6).map((z, idx) => {
            const isSelected = selectedZoneIds.includes(z.id);
            return (
              <button
                key={z.id}
                onClick={() => toggleZone(z.id)}
                style={{
                  background: isSelected ? 'rgba(53, 216, 255, 0.15)' : 'var(--bg-surface-elevated)',
                  border: `1px solid ${isSelected ? '#35D8FF' : 'rgba(120, 140, 180, 0.25)'}`,
                  color: isSelected ? '#35D8FF' : '#9AA5B8',
                  borderRadius: 6,
                  padding: '4px 10px',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  fontFamily: 'Space Grotesk, sans-serif',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {z.name?.split(' ')[0]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Recharts Radar Chart */}
      <div style={{ width: '100%', height: 320, position: 'relative' }}>
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="75%" data={formattedData}>
            <PolarGrid stroke="rgba(120, 140, 180, 0.2)" />
            <PolarAngleAxis
              dataKey="subject"
              tick={{ fill: '#9AA5B8', fontSize: 11, fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600 }}
            />
            <PolarRadiusAxis
              angle={30}
              domain={[0, 100]}
              tick={{ fill: '#5C677D', fontSize: 9 }}
              stroke="rgba(120, 140, 180, 0.15)"
            />
            {activeZones.map((z, idx) => {
              const color = ZONE_COLORS[idx % ZONE_COLORS.length];
              return (
                <Radar
                  key={z.id}
                  name={z.name}
                  dataKey={`zone_${z.id}`}
                  stroke={color}
                  fill={color}
                  fillOpacity={0.25}
                  strokeWidth={2}
                />
              );
            })}
            <Tooltip
              contentStyle={{
                backgroundColor: '#101521',
                borderColor: 'rgba(120, 140, 180, 0.3)',
                borderRadius: 8,
                fontSize: 12,
                color: '#F4F6FB'
              }}
            />
            <Legend
              wrapperStyle={{
                fontSize: 11,
                fontFamily: 'Space Grotesk, sans-serif',
                paddingTop: 10
              }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

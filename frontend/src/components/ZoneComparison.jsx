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
import { Scale } from 'lucide-react';
import { Card } from './ui/Card';

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

  // Colors for compared zones: Electric blue, Low/green, Warning/orange, Neutral gray
  const ZONE_COLORS = ['#4F6FFF', '#31B77A', '#FF8A4C', '#A1A1A1'];

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
    <Card
      style={{
        padding: 22,
        display: 'flex',
        flexDirection: 'column',
        gap: 16
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ background: 'var(--brand-primary-light)', border: '1px solid var(--border-primary)', padding: 7, borderRadius: 'var(--radius-md)' }}>
            <Scale size={18} color="var(--brand-primary)" />
          </div>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
              Zone Comparison Radar
            </h3>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: 2 }}>
              Multi-vector geotechnical risk comparison across selected sectors
            </div>
          </div>
        </div>

        {/* Zone Selector Chips */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {zones.slice(0, 6).map((z) => {
            const isSelected = selectedZoneIds.includes(z.id);
            return (
              <button
                key={z.id}
                onClick={() => toggleZone(z.id)}
                style={{
                  background: isSelected ? 'var(--brand-primary)' : 'var(--bg-card)',
                  border: `1px solid ${isSelected ? 'var(--brand-primary)' : 'var(--border-primary)'}`,
                  color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                  borderRadius: 'var(--radius-full, 9999px)',
                  padding: '4px 12px',
                  fontSize: '0.72rem',
                  fontWeight: 600,
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
            <PolarGrid stroke="var(--border-primary)" />
            <PolarAngleAxis
              dataKey="subject"
              tick={{ fill: 'var(--text-secondary)', fontSize: 11, fontWeight: 500 }}
            />
            <PolarRadiusAxis
              angle={30}
              domain={[0, 100]}
              tick={{ fill: 'var(--text-muted)', fontSize: 9 }}
              stroke="var(--border-primary)"
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
                  fillOpacity={0.22}
                  strokeWidth={2}
                />
              );
            })}
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--bg-surface)',
                borderColor: 'var(--border-primary)',
                borderRadius: 8,
                fontSize: 12,
                color: 'var(--text-primary)',
                boxShadow: 'var(--shadow-md)'
              }}
            />
            <Legend
              wrapperStyle={{
                fontSize: 11,
                paddingTop: 10
              }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

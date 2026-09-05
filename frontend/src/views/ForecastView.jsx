import React from 'react';
import ForecastChart from '../components/ForecastChart';
import { TrendingUp, MapPin } from 'lucide-react';

export default function ForecastView({
  zones = [],
  selectedZone,
  onSelectZone
}) {
  const currentZone = selectedZone || (zones.length > 0 ? zones[0] : null);

  return (
    <div
      style={{
        maxWidth: 1680,
        margin: '0 auto',
        padding: '20px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: 20
      }}
    >
      {/* Header with Zone Switcher */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#35D8FF', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'Space Grotesk, sans-serif' }}>
              HYDRO-METEOROLOGICAL PREDICTION
            </span>
            <span style={{ color: '#5C677D' }}>•</span>
            <span style={{ fontSize: '0.72rem', color: '#9AA5B8' }}>East Khasi Hills</span>
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#FFFFFF', letterSpacing: '-0.02em', fontFamily: 'Space Grotesk, sans-serif', marginTop: 2 }}>
            48-HOUR WEATHER & RISK FORECAST
          </h1>
          <p style={{ fontSize: '0.78rem', color: '#9AA5B8' }}>
            Continuous kinematic precipitation and subsurface pore pressure projection powered by Open-Meteo & IMD.
          </p>
        </div>

        {/* Zone Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: '0.76rem', color: '#9AA5B8', fontWeight: 600 }}>Active Zone:</span>
          <select
            value={currentZone?.id || 1}
            onChange={(e) => {
              const target = zones.find(z => z.id === Number(e.target.value));
              if (target && onSelectZone) onSelectZone(target);
            }}
            className="command-input"
            style={{ width: 'auto', minWidth: 220, padding: '6px 12px', fontSize: '0.78rem', fontWeight: 700 }}
          >
            {zones.map(z => (
              <option key={z.id} value={z.id}>
                {z.name} ({z.risk_score}%)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 48-Hour Forecast Component */}
      <ForecastChart
        zoneId={currentZone?.id || 1}
        zoneName={currentZone?.name || 'Sohra (Cherrapunji) Escarpment'}
      />
    </div>
  );
}

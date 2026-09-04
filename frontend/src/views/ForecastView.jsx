import React, { useState } from 'react';
import ForecastChart from '../components/ForecastChart';
import { TrendingUp, MapPin, CloudRain, Droplet } from 'lucide-react';

export default function ForecastView({
  zones = [],
  selectedZone,
  onSelectZone
}) {
  const currentZone = selectedZone || (zones.length > 0 ? zones[0] : null);

  return (
    <div style={{ maxWidth: 1300, margin: '0 auto', padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header with Zone Switcher */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: 10, fontFamily: 'Space Grotesk, sans-serif' }}>
            <TrendingUp size={22} color="#35D8FF" />
            <span>EXTENDED 48-HOUR & 7-DAY FORECAST ENGINE</span>
          </h1>
          <p style={{ fontSize: '0.78rem', color: '#9AA5B8', marginTop: 3 }}>
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
            style={{ width: 'auto', minWidth: 200, padding: '6px 12px', fontSize: '0.78rem', fontWeight: 700 }}
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
        zoneName={currentZone?.name || 'Sohra Escarpment'}
      />
    </div>
  );
}

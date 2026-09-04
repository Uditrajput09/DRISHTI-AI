import React, { useState } from 'react';
import { 
  BellRing, 
  Filter, 
  Send, 
  CheckCheck, 
  Volume2, 
  ShieldAlert, 
  RefreshCw 
} from 'lucide-react';
import AlertCard from '../components/AlertCard';

export default function AlertsView({
  alerts = [],
  onViewZone,
  onRefreshAlerts
}) {
  const [activeCategory, setActiveCategory] = useState('ALL'); // ALL, CRITICAL, HIGH, MEDIUM, INFO

  // Sample default alerts matching user specification if alerts list is empty
  const defaultAlerts = [
    {
      id: 'ALT-01',
      level: 'Critical',
      zone_name: 'Sohra (Cherrapunji) Escarpment',
      location: 'Sohra, East Khasi Hills',
      previous_score: 76,
      risk_score: 92,
      delta: 'Risk increased from 76% → 92%',
      cause: 'Extreme rainfall (124 mm/24h) + soil saturation (88%)',
      timeAgo: '2 min ago',
      zone_id: 1
    },
    {
      id: 'ALT-02',
      level: 'High',
      zone_name: 'Mawsynram South Ridge',
      location: 'Mawsynram Road Sector 4',
      previous_score: 58,
      risk_score: 78,
      delta: 'Risk increased from 58% → 78%',
      cause: 'Intense precipitation rate exceeding 45 mm/hr',
      timeAgo: '14 min ago',
      zone_id: 2
    },
    {
      id: 'ALT-03',
      level: 'Critical',
      zone_name: 'Pynursla Gorge Corridor',
      location: 'NH-206 km 42 Lifeline',
      previous_score: 81,
      risk_score: 94,
      delta: 'Risk increased from 81% → 94%',
      cause: 'Active rockfall debris accumulation & slope movement',
      timeAgo: '26 min ago',
      zone_id: 4
    },
    {
      id: 'ALT-04',
      level: 'Medium',
      zone_name: 'Shillong Peak Foothills',
      location: 'Laitkor Catchment Area',
      previous_score: 30,
      risk_score: 52,
      delta: 'Risk increased from 30% → 52%',
      cause: 'Hydrological runoff accumulation in urban culverts',
      timeAgo: '48 min ago',
      zone_id: 6
    },
    {
      id: 'ALT-05',
      level: 'Info',
      zone_name: 'Dawki Border Transit Hub',
      location: 'Umngot River Highway',
      previous_score: 25,
      risk_score: 28,
      delta: 'Pre-monsoon safety inspection completed',
      cause: 'Routine geotechnical baseline sensor calibration',
      timeAgo: '1 hour ago',
      zone_id: 5
    }
  ];

  const mergedAlerts = alerts.length > 0 ? alerts : defaultAlerts;

  const categories = ['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'INFO'];

  const filteredAlerts = mergedAlerts.filter(a => {
    if (activeCategory === 'ALL') return true;
    const lvl = (a.level || a.risk_level || '').toUpperCase();
    return lvl === activeCategory;
  });

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: 10, fontFamily: 'Space Grotesk, sans-serif' }}>
            <BellRing size={22} color="#FF3B6B" />
            <span>EMERGENCY ALERT BROADCAST CENTER</span>
          </h1>
          <p style={{ fontSize: '0.78rem', color: '#9AA5B8', marginTop: 3 }}>
            Real-time threshold exceedance alerts, multi-channel dispatches (SMS/FCM), and evacuation triggers.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={onRefreshAlerts}
            className="btn-surface"
            style={{ padding: '8px 14px' }}
          >
            <RefreshCw size={14} color="#35D8FF" />
            <span>Refresh Feed</span>
          </button>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
        {categories.map(cat => {
          const isActive = activeCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                background: isActive ? '#35D8FF' : '#101521',
                color: isActive ? '#070A10' : '#9AA5B8',
                border: `1px solid ${isActive ? '#35D8FF' : 'rgba(120, 140, 180, 0.22)'}`,
                borderRadius: 20,
                padding: '6px 14px',
                fontSize: '0.74rem',
                fontWeight: 800,
                fontFamily: 'Space Grotesk, sans-serif',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Alerts Stream */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {filteredAlerts.length === 0 ? (
          <div style={{ background: '#101521', border: '1px solid rgba(120, 140, 180, 0.22)', borderRadius: 12, padding: 36, textAlign: 'center', color: '#9AA5B8' }}>
            No alerts currently in category "{activeCategory}".
          </div>
        ) : (
          filteredAlerts.map((alert, index) => (
            <AlertCard
              key={alert.id || index}
              alert={alert}
              onViewZone={onViewZone}
            />
          ))
        )}
      </div>
    </div>
  );
}

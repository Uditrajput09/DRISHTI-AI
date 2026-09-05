import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  MapPin, 
  CheckCircle2, 
  AlertTriangle,
  Clock
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip 
} from 'recharts';

export default function IncidentsView({
  reports = [],
  onNavigateToReport,
  onLocateOnMap
}) {
  const [filterType, setFilterType] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Exact 5 incidents from Screen 5 with explicit hazard, zone, road, reporter metadata
  const exactIncidents = [
    {
      id: 'INC-01',
      hazard: 'Landslide',
      zone: 'Sohra (Cherrapunji) Escarpment',
      road: 'NH-6',
      title: 'Sohra (Cherrapunji) Escarpment, NH-6',
      severity: 'Critical',
      verified: true,
      desc: 'Road partially blocked due to landslide.',
      reporter: 'Citizen Responder',
      photo: '/images/incidents/incident-landslide.jpg',
      time: 'Just now'
    },
    {
      id: 'INC-02',
      hazard: 'Rockfall',
      zone: 'Mawsynram Ridge',
      road: 'Near 7th Mile',
      title: 'Mawsynram Ridge, Near 7th Mile',
      severity: 'High',
      verified: false,
      desc: 'Rockfall reported on road shoulder.',
      reporter: 'PWD Road Inspector',
      photo: '/images/incidents/incident-rockfall.jpg',
      time: '15 min ago'
    },
    {
      id: 'INC-03',
      hazard: 'Road Blockage',
      zone: 'Pynursla Pass',
      road: 'NH-106',
      title: 'Pynursla Pass, NH-106',
      severity: 'Medium',
      verified: true,
      desc: 'Waterlogging and mud deposit due to heavy rain.',
      reporter: 'Field Volunteer',
      photo: '/images/incidents/incident-road-blockage.jpg',
      time: '35 min ago'
    },
    {
      id: 'INC-04',
      hazard: 'Soil Creep',
      zone: 'Laitkynsew Area',
      road: 'Rural Scarp',
      title: 'Laitkynsew Area',
      severity: 'Low',
      verified: true,
      desc: 'Minor soil creep observed near terrace farming.',
      reporter: 'Local Farmer',
      photo: '/images/incidents/incident-debris-flow.jpg',
      time: '1 hr ago'
    },
    {
      id: 'INC-05',
      hazard: 'Debris Flow',
      zone: 'Nongpoh Rim',
      road: 'Local Road',
      title: 'Nongpoh Rim, Local Road',
      severity: 'High',
      verified: false,
      desc: 'Debris flow near culvert drainage channel.',
      reporter: 'Community Responder',
      photo: '/images/incidents/incident-rockfall.jpg',
      time: '2 hr ago'
    }
  ];

  // Exact stats matching Screen 5 donut
  const donutData = [
    { name: 'Critical', value: 6, color: '#FF3B6B' },
    { name: 'High', value: 10, color: '#FF9D3D' },
    { name: 'Medium', value: 7, color: '#FFD84D' },
    { name: 'Low', value: 4, color: '#39D98A' }
  ];

  const totalIncidents = 27;

  const filtered = exactIncidents.filter(inc => {
    const matchesSearch = inc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          inc.desc.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (filterType === 'All') return true;
    if (filterType === 'Critical') return inc.severity === 'Critical';
    if (filterType === 'High') return inc.severity === 'High';
    if (filterType === 'Medium') return inc.severity === 'Medium';
    if (filterType === 'Verified') return inc.verified;
    if (filterType === 'Unverified') return !inc.verified;
    return true;
  });

  const getSeverityBadge = (sev) => {
    switch (sev) {
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
      {/* Header matching Screen 5 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#FFFFFF', letterSpacing: '0.04em', fontFamily: 'Space Grotesk, sans-serif', margin: 0 }}>
          LIVE INCIDENT FEED
        </h1>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {/* Search incidents... */}
          <div style={{ position: 'relative', width: 220 }}>
            <Search size={13} color="#5C677D" style={{ position: 'absolute', left: 8, top: 9 }} />
            <input
              type="text"
              placeholder="Search incidents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="command-input"
              style={{ paddingLeft: 28, fontSize: '0.74rem', height: 32 }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.7rem', color: '#9AA5B8' }}>
            <span className="live-indicator-dot" />
            <span>Live • Last updated: 1 min ago</span>
          </div>
        </div>
      </div>

      {/* Filter Row matching Screen 5: All, Critical, High, Medium, Verified, Unverified, Filters */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        {['All', 'Critical', 'High', 'Medium', 'Verified', 'Unverified'].map(pill => {
          const isActive = filterType === pill;
          return (
            <button
              key={pill}
              onClick={() => setFilterType(pill)}
              style={{
                background: isActive ? 'rgba(53, 216, 255, 0.15)' : 'rgba(21, 27, 41, 0.8)',
                border: `1px solid ${isActive ? '#35D8FF' : 'rgba(120, 140, 180, 0.2)'}`,
                color: isActive ? '#35D8FF' : '#9AA5B8',
                borderRadius: 20,
                padding: '4px 14px',
                fontSize: '0.74rem',
                fontWeight: 700,
                fontFamily: 'Space Grotesk, sans-serif',
                cursor: 'pointer'
              }}
            >
              {pill}
            </button>
          );
        })}
        <button
          className="btn-surface"
          style={{ borderRadius: 20, padding: '4px 12px', fontSize: '0.74rem', display: 'flex', alignItems: 'center', gap: 4 }}
        >
          <Filter size={12} />
          <span>Filters</span>
        </button>
      </div>

      {/* Main 2-Column Split: Left Incidents Feed | Right Incident Statistics Donut */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.6fr) minmax(320px, 1fr)',
          gap: 16,
          alignItems: 'start'
        }}
        className="simulation-xai-grid"
      >
        {/* Left: Incident Feed matching Screen 5 cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map(inc => (
            <div
              key={inc.id}
              className="command-panel"
              style={{
                padding: '10px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                cursor: 'pointer'
              }}
              onClick={() => onLocateOnMap && onLocateOnMap(inc)}
            >
              {/* Photo Thumbnail */}
              <div
                style={{
                  width: 76,
                  height: 60,
                  borderRadius: 6,
                  overflow: 'hidden',
                  flexShrink: 0,
                  border: '1px solid rgba(120, 140, 180, 0.2)'
                }}
              >
                <img
                  src={inc.photo}
                  alt={inc.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>

              {/* Text Information */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.84rem', fontWeight: 800, color: '#FFFFFF', fontFamily: 'Space Grotesk, sans-serif' }}>
                    {inc.title}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span className={getSeverityBadge(inc.severity)}>
                      {inc.severity.toUpperCase()}
                    </span>
                    <span
                      style={{
                        fontSize: '0.62rem',
                        fontWeight: 700,
                        padding: '1px 6px',
                        borderRadius: 4,
                        background: inc.verified ? 'rgba(57, 217, 138, 0.15)' : 'rgba(255, 157, 61, 0.15)',
                        color: inc.verified ? '#39D98A' : '#FF9D3D',
                        border: `1px solid ${inc.verified ? 'rgba(57, 217, 138, 0.3)' : 'rgba(255, 157, 61, 0.3)'}`
                      }}
                    >
                      {inc.verified ? 'Verified' : 'Unverified'}
                    </span>
                  </div>
                </div>

                <p style={{ fontSize: '0.74rem', color: '#CBD5E1', margin: '2px 0' }}>
                  {inc.desc}
                </p>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.66rem', color: '#9AA5B8', flexWrap: 'wrap' }}>
                  <span style={{ color: '#35D8FF', fontWeight: 700 }}>Hazard: {inc.hazard}</span>
                  <span style={{ color: '#5C677D' }}>•</span>
                  <span>Road: {inc.road}</span>
                  <span style={{ color: '#5C677D' }}>•</span>
                  <span>By: {inc.reporter}</span>
                  <span style={{ color: '#5C677D' }}>•</span>
                  <span style={{ color: '#CBD5E1' }}>{inc.time}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Right: INCIDENT STATISTICS (24h) Donut Chart matching Screen 5 */}
        <div className="command-panel" style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#FFFFFF', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'Space Grotesk, sans-serif' }}>
            INCIDENT STATISTICS (24h)
          </span>

          {/* Donut with 27 in center */}
          <div style={{ position: 'relative', width: '100%', height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={donutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={58}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {donutData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#101521',
                    borderColor: 'rgba(120, 140, 180, 0.3)',
                    borderRadius: 8,
                    fontSize: 12,
                    color: '#F4F6FB'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Center Total 27 */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                pointerEvents: 'none'
              }}
            >
              <span style={{ fontSize: '2rem', fontWeight: 900, color: '#FFFFFF', fontFamily: 'Space Grotesk, sans-serif', lineHeight: 1 }}>
                {totalIncidents}
              </span>
              <span style={{ fontSize: '0.68rem', color: '#9AA5B8', fontWeight: 700, textTransform: 'uppercase' }}>
                Total
              </span>
            </div>
          </div>

          {/* Donut Legend */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, borderTop: '1px solid rgba(120, 140, 180, 0.15)', paddingTop: 10 }}>
            {donutData.map(d => (
              <div key={d.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.76rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: d.color }} />
                  <span style={{ color: '#CBD5E1', fontWeight: 600 }}>{d.name}</span>
                </div>
                <span style={{ fontWeight: 800, color: d.color, fontFamily: 'Space Grotesk, sans-serif' }}>
                  {d.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { 
  AlertTriangle, 
  MapPin, 
  Filter, 
  Plus, 
  RefreshCw, 
  CheckCircle2, 
  Radio 
} from 'lucide-react';
import IncidentCard from '../components/IncidentCard';

export default function IncidentsView({
  reports = [],
  onNavigateToReport,
  onLocateOnMap
}) {
  const [filterType, setFilterType] = useState('ALL');

  const defaultIncidents = [
    {
      id: 'INC-01',
      incident_type: 'Rockfall Reported',
      hazard_type: 'Rockfall',
      location: 'Pynursla NH-40 km 38',
      zone_name: 'Pynursla Gorge',
      severity: 'Critical',
      timeAgo: '12 min ago',
      status: 'verified',
      description: 'Massive boulders detached from upper terrace blocking one lane of NH-40 corridor. Clearing crews dispatched by PWD.',
      latitude: 25.3160,
      longitude: 91.9050
    },
    {
      id: 'INC-02',
      incident_type: 'Landslide Reported',
      hazard_type: 'Landslide',
      location: 'Mawsynram Road Sector 2',
      zone_name: 'Mawsynram South Ridge',
      severity: 'High',
      timeAgo: '24 min ago',
      status: 'verified',
      description: 'Debris flow across road shoulder following heavy rainfall surge. Traffic diverted via alternative ridge bypass.',
      latitude: 25.3010,
      longitude: 91.5850
    },
    {
      id: 'INC-03',
      incident_type: 'Water Overflow Reported',
      hazard_type: 'Flooding',
      location: 'Sohra Market Crossing',
      zone_name: 'Sohra Escarpment',
      severity: 'Medium',
      timeAgo: '31 min ago',
      status: 'verified',
      description: 'Mountain drainage culvert clogged with silt and gravel causing 15cm road surface sheet wash.',
      latitude: 25.2785,
      longitude: 91.7280
    },
    {
      id: 'INC-04',
      incident_type: 'Road Blockage Reported',
      hazard_type: 'Road Blockage',
      location: 'SH-5 Shillong-Sohra Highway km 18',
      zone_name: 'Sohra Escarpment',
      severity: 'High',
      timeAgo: '45 min ago',
      status: 'in_review',
      description: 'Fallen pine trees and slope debris partially obstructing heavy transport trucks.',
      latitude: 25.4200,
      longitude: 91.7800
    }
  ];

  const merged = reports.length > 0 ? reports : defaultIncidents;

  const filtered = merged.filter(inc => {
    if (filterType === 'ALL') return true;
    const type = (inc.hazard_type || inc.incident_type || '').toUpperCase();
    return type.includes(filterType);
  });

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: 10, fontFamily: 'Space Grotesk, sans-serif' }}>
            <Radio size={22} color="#FF9D3D" />
            <span>LIVE INCIDENT INTEL FEED</span>
          </h1>
          <p style={{ fontSize: '0.78rem', color: '#9AA5B8', marginTop: 3 }}>
            Crowdsourced and responder-verified hazard logs across East Khasi Hills transit arteries.
          </p>
        </div>

        <button
          onClick={onNavigateToReport}
          className="btn-primary-cyan"
        >
          <Plus size={15} />
          <span>+ REPORT INCIDENT</span>
        </button>
      </div>

      {/* Filter Buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
        {['ALL', 'ROCKFALL', 'LANDSLIDE', 'FLOOD', 'BLOCKAGE'].map(t => (
          <button
            key={t}
            onClick={() => setFilterType(t)}
            style={{
              background: filterType === t ? '#FF9D3D' : '#101521',
              color: filterType === t ? '#070A10' : '#9AA5B8',
              border: `1px solid ${filterType === t ? '#FF9D3D' : 'rgba(120, 140, 180, 0.22)'}`,
              borderRadius: 20,
              padding: '6px 14px',
              fontSize: '0.74rem',
              fontWeight: 800,
              fontFamily: 'Space Grotesk, sans-serif',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Incidents Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 14 }}>
        {filtered.map((inc, i) => (
          <IncidentCard
            key={inc.id || i}
            incident={inc}
            onViewOnMap={() => onLocateOnMap && onLocateOnMap(inc)}
          />
        ))}
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  MapPin, 
  PlusCircle,
  AlertTriangle,
  Clock,
  ArrowUpRight
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip 
} from 'recharts';
import { 
  Card, 
  PageHeader, 
  Button, 
  SearchInput, 
  Tabs, 
  RiskBadge, 
  StatusBadge, 
  EmptyState,
  Badge
} from '../components/ui';
import CopyButton from '../components/CopyButton';

export default function IncidentsView({
  reports = [],
  onNavigateToReport,
  onLocateOnMap
}) {
  const [filterType, setFilterType] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // 5 Ground incidents with explicit hazard, zone, road, reporter metadata
  const exactIncidents = [
    {
      id: 'INC-01',
      hazard: 'Landslide',
      zone: 'Sohra (Cherrapunji) Escarpment',
      road: 'NH-6',
      title: 'Sohra (Cherrapunji) Escarpment, NH-6',
      severity: 'Critical',
      verified: true,
      desc: 'Road partially blocked due to landslide slope failure.',
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
      desc: 'Rockfall reported on road shoulder with debris rolling into lane.',
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
      desc: 'Waterlogging and mud deposit due to heavy rain saturation.',
      reporter: 'Field Volunteer',
      photo: '/images/incidents/incident-road-blockage.jpg',
      time: '35 min ago'
    },
    {
      id: 'INC-04',
      hazard: 'Soil Creep',
      zone: 'Laitkynsew Area',
      road: 'Rural Scarp',
      title: 'Laitkynsew Area, Rural Scarp',
      severity: 'Low',
      verified: true,
      desc: 'Minor progressive soil creep observed near terrace cultivation.',
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
      desc: 'Debris flow near culvert drainage channel threatening access road.',
      reporter: 'Community Responder',
      photo: '/images/incidents/incident-rockfall.jpg',
      time: '2 hr ago'
    }
  ];

  // Statistics Donut Data matching semantic tokens
  const donutData = [
    { name: 'Critical', value: 6, color: 'var(--risk-critical)' },
    { name: 'High', value: 10, color: 'var(--risk-high)' },
    { name: 'Medium', value: 7, color: 'var(--risk-medium)' },
    { name: 'Low', value: 4, color: 'var(--risk-safe)' }
  ];

  const totalIncidents = 27;

  const filtered = exactIncidents.filter(inc => {
    const matchesSearch = inc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          inc.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          inc.road.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (filterType === 'All') return true;
    if (filterType === 'Critical') return inc.severity === 'Critical';
    if (filterType === 'High') return inc.severity === 'High';
    if (filterType === 'Medium') return inc.severity === 'Medium';
    if (filterType === 'Verified') return inc.verified;
    if (filterType === 'Unverified') return !inc.verified;
    return true;
  });

  const filterTabs = [
    { id: 'All', label: 'All Incidents' },
    { id: 'Critical', label: 'Critical' },
    { id: 'High', label: 'High Risk' },
    { id: 'Medium', label: 'Medium' },
    { id: 'Verified', label: 'Verified' },
    { id: 'Unverified', label: 'Unverified' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* 1. Standardized Page Header */}
      <PageHeader
        breadcrumbs={['Command Center', 'Ground Observations', 'Live Incidents']}
        title="Live Incident Feed"
        subtitle="Real-time crowdsourced reports, ground ground-truthing, and road blockage reports"
        actions={
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Badge variant="live">Live Telemetry</Badge>
            {onNavigateToReport && (
              <Button
                variant="primary"
                size="sm"
                icon={PlusCircle}
                onClick={onNavigateToReport}
              >
                Submit Incident Report
              </Button>
            )}
          </div>
        }
      />

      {/* 2. Filter Bar & Search Row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12
        }}
      >
        <Tabs
          tabs={filterTabs}
          activeTab={filterType}
          onChange={setFilterType}
        />

        <div style={{ width: 240 }}>
          <SearchInput
            size="sm"
            placeholder="Search road, hazard, ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onClear={() => setSearchQuery('')}
          />
        </div>
      </div>

      {/* 3. Main 2-Column Grid: Incidents Feed | Incident Statistics Donut */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.7fr) minmax(320px, 1fr)',
          gap: 16,
          alignItems: 'start'
        }}
        className="simulation-xai-grid"
      >
        {/* Left: Incidents Feed */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.length === 0 ? (
            <EmptyState
              title="No Incidents Found"
              description="No active slope failures, rockfalls, or road blockages match your current filter query."
              actionLabel="Submit New Field Report"
              onAction={onNavigateToReport}
            />
          ) : (
            filtered.map((inc) => (
              <Card
                key={inc.id}
                hoverable
                onClick={() => onLocateOnMap && onLocateOnMap(inc)}
                padding={14}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16
                }}
              >
                {/* Photo Thumbnail */}
                <div
                  style={{
                    width: 84,
                    height: 68,
                    borderRadius: 'var(--radius-input)',
                    overflow: 'hidden',
                    flexShrink: 0,
                    border: '1px solid var(--border-primary)',
                    backgroundColor: 'var(--bg-surface-elevated)'
                  }}
                >
                  <img
                    src={inc.photo}
                    alt={inc.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>

                {/* Text Content */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span className="font-mono" style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        {inc.id}
                      </span>
                      <h4 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                        {inc.title}
                      </h4>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <RiskBadge level={inc.severity} size="sm" />
                      <StatusBadge status={inc.verified ? 'VERIFIED' : 'PENDING'} size="sm" />
                      <CopyButton text={`[${inc.id}] ${inc.title} - ${inc.desc}`} label="Incident" />
                    </div>
                  </div>

                  <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>
                    {inc.desc}
                  </p>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      fontSize: 11,
                      color: 'var(--text-muted)',
                      flexWrap: 'wrap',
                      marginTop: 2
                    }}
                  >
                    <span style={{ color: 'var(--brand-primary)', fontWeight: 500 }}>
                      Hazard: {inc.hazard}
                    </span>
                    <span>•</span>
                    <span>Corridor: {inc.road}</span>
                    <span>•</span>
                    <span>Reporter: {inc.reporter}</span>
                    <span>•</span>
                    <span className="font-mono">{inc.time}</span>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Right: Incident Statistics Donut Chart */}
        <Card padding={20} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
              Incident Distribution (24h)
            </h3>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>East Khasi Hills</span>
          </div>

          {/* Donut Chart with Centered Total */}
          <div style={{ position: 'relative', width: '100%', height: 210 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={donutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={62}
                  outerRadius={84}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {donutData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--bg-surface-elevated)',
                    borderColor: 'var(--border-primary)',
                    borderRadius: 8,
                    fontSize: 12,
                    color: 'var(--text-primary)'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Center Total Counter */}
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
              <span
                className="font-mono"
                style={{
                  fontSize: 28,
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  lineHeight: 1
                }}
              >
                {totalIncidents}
              </span>
              <span
                style={{
                  fontSize: 10,
                  color: 'var(--text-muted)',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  marginTop: 2
                }}
              >
                Incidents
              </span>
            </div>
          </div>

          {/* Donut Legend */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
              borderTop: '1px solid var(--border-primary)',
              paddingTop: 14
            }}
          >
            {donutData.map((d) => (
              <div
                key={d.name}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: 12
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      backgroundColor: d.color
                    }}
                  />
                  <span style={{ color: 'var(--text-secondary)' }}>{d.name} Severity</span>
                </div>
                <span className="font-mono" style={{ fontWeight: 600, color: d.color }}>
                  {d.value}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Search, 
  Users, 
  Building2, 
  Home, 
  FileText, 
  MapPin, 
  Compass, 
  Layers, 
  ArrowUpRight,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { 
  Card, 
  PageHeader, 
  Button, 
  SearchInput, 
  RiskBadge, 
  Badge, 
  DataTable 
} from '../components/ui';
import ZoneComparison from '../components/ZoneComparison';
import { exportZoneRiskPDF } from '../utils/pdfExport';

export default function RiskIntelligenceView({
  zones = [],
  onSelectZone,
  onNavigateToGIS
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedZone, setSelectedZone] = useState(null);
  const [expandedZoneId, setExpandedZoneId] = useState(null);
  const [mobileTab, setMobileTab] = useState('zones'); // 'zones' | 'vulnerability'
  const [isMobile, setIsMobile] = useState(() => 
    typeof window !== 'undefined' ? (window.innerWidth < 768 || new URLSearchParams(window.location.search).get('mode') === 'mobile') : false
  );

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768 || new URLSearchParams(window.location.search).get('mode') === 'mobile';
      setIsMobile(mobile);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Exact 10 monitored micro-zones
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

  const columns = [
    {
      key: 'name',
      label: 'Zone Corridor',
      render: (val, row) => (
        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
          {val}
        </span>
      )
    },
    {
      key: 'risk_score',
      label: 'Risk Score',
      align: 'left',
      render: (val, row) => (
        <span
          className="font-mono"
          style={{
            fontWeight: 600,
            fontSize: 14,
            color: val >= 80 ? 'var(--risk-critical)' : val >= 60 ? 'var(--risk-high)' : val >= 30 ? 'var(--risk-medium)' : 'var(--risk-safe)'
          }}
        >
          {val}%
        </span>
      )
    },
    {
      key: 'level',
      label: 'Severity Level',
      render: (val) => <RiskBadge level={val} size="sm" />
    },
    {
      key: 'prob',
      label: 'AI Probability',
      render: (val) => <span className="font-mono" style={{ color: 'var(--text-secondary)' }}>{val}</span>
    },
    {
      key: 'rain',
      label: 'Rainfall (24h)',
      render: (val) => <span className="font-mono" style={{ color: 'var(--brand-primary)', fontWeight: 500 }}>{val}</span>
    },
    {
      key: 'moisture',
      label: 'Soil Moisture',
      render: (val) => <span className="font-mono" style={{ color: 'var(--text-primary)' }}>{val}</span>
    },
    {
      key: 'trend',
      label: 'Trend',
      align: 'center',
      render: (val) => {
        if (val === 'up') return <span style={{ color: 'var(--risk-critical)', fontWeight: 600 }}>▲ UP</span>;
        if (val === 'down') return <span style={{ color: 'var(--risk-safe)', fontWeight: 600 }}>▼ DOWN</span>;
        return <span style={{ color: 'var(--text-muted)' }}>— STABLE</span>;
      }
    },
    {
      key: 'status',
      label: 'Status',
      render: (val) => <Badge variant="live" size="sm">{val}</Badge>
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* 1. Page Header */}
      <PageHeader
        breadcrumbs={['Command Center', 'Geotechnical Matrix', 'Risk Intelligence']}
        title="Risk Intelligence & Analysis"
        subtitle="East Khasi Hills • 10 Monitored Micro-Zones • Telemetry & Susceptibility Matrix"
        actions={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <Badge variant="neutral">Total: 10</Badge>
            <Badge variant="critical">Critical: 2</Badge>
            <Badge variant="high">High Risk: 4</Badge>
            <Badge variant="medium">Medium: 3</Badge>
            <Badge variant="safe">Safe: 1</Badge>
          </div>
        }
      />

      {/* Mobile Segmented Controller */}
      {isMobile && (
        <div style={{ display: 'flex', gap: 6, padding: 4, background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-input)', border: '1px solid var(--border-primary)' }}>
          <button 
            onClick={() => setMobileTab('zones')}
            style={{ 
              flex: 1, 
              padding: '10px 12px', 
              borderRadius: 'var(--radius-sm)', 
              border: 'none', 
              background: mobileTab === 'zones' ? 'var(--brand-primary)' : 'transparent', 
              color: mobileTab === 'zones' ? '#FFFFFF' : 'var(--text-secondary)', 
              fontWeight: 600, 
              fontSize: '0.82rem', 
              cursor: 'pointer',
              transition: 'background var(--transition-fast)'
            }}
          >
            Hazard Zones ({filteredZones.length})
          </button>
          <button 
            onClick={() => setMobileTab('vulnerability')}
            style={{ 
              flex: 1, 
              padding: '10px 12px', 
              borderRadius: 'var(--radius-sm)', 
              border: 'none', 
              background: mobileTab === 'vulnerability' ? 'var(--brand-primary)' : 'transparent', 
              color: mobileTab === 'vulnerability' ? '#FFFFFF' : 'var(--text-secondary)', 
              fontWeight: 600, 
              fontSize: '0.82rem', 
              cursor: 'pointer',
              transition: 'background var(--transition-fast)'
            }}
          >
            Vulnerability & Radar
          </button>
        </div>
      )}

      {/* 2. Top Risk Zones Section */}
      {isMobile ? (
        mobileTab === 'zones' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ width: '100%' }}>
              <SearchInput
                size="sm"
                placeholder="Filter zone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onClear={() => setSearchTerm('')}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {filteredZones.map(zone => {
                const isExpanded = expandedZoneId === zone.id;
                const scoreColor = zone.risk_score >= 80 ? 'var(--risk-critical)' : zone.risk_score >= 60 ? 'var(--risk-high)' : zone.risk_score >= 30 ? 'var(--risk-medium)' : 'var(--risk-safe)';
                
                return (
                  <div
                    key={zone.id}
                    style={{
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border-primary)',
                      borderRadius: 'var(--radius-card)',
                      padding: '14px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 10
                    }}
                  >
                    {/* Header */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                      <div>
                        <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                          {zone.name}
                        </h4>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                          <RiskBadge level={zone.level} size="xs" />
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{zone.geology}</span>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span className="font-mono" style={{ fontSize: '1.2rem', fontWeight: 700, color: scoreColor }}>
                          {zone.risk_score}%
                        </span>
                        <span style={{ display: 'block', fontSize: '0.65rem', color: 'var(--text-muted)' }}>RISK INDEX</span>
                      </div>
                    </div>

                    {/* Visual Progress Bar */}
                    <div style={{ width: '100%', height: 4, background: 'var(--bg-surface-elevated)', borderRadius: 2, overflow: 'hidden' }}>
                      <div style={{ width: `${zone.risk_score}%`, height: '100%', background: scoreColor, borderRadius: 2 }} />
                    </div>

                    {/* Key Metrics Row */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
                      <div style={{ background: 'var(--bg-surface-elevated)', padding: '6px 8px', borderRadius: 'var(--radius-sm)' }}>
                        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'block' }}>24H RAIN</span>
                        <span className="font-mono" style={{ fontSize: '0.80rem', fontWeight: 600, color: 'var(--brand-primary)' }}>{zone.rain}</span>
                      </div>
                      <div style={{ background: 'var(--bg-surface-elevated)', padding: '6px 8px', borderRadius: 'var(--radius-sm)' }}>
                        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'block' }}>MOISTURE</span>
                        <span className="font-mono" style={{ fontSize: '0.80rem', fontWeight: 600, color: 'var(--text-primary)' }}>{zone.moisture}</span>
                      </div>
                      <div style={{ background: 'var(--bg-surface-elevated)', padding: '6px 8px', borderRadius: 'var(--radius-sm)' }}>
                        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'block' }}>SLOPE</span>
                        <span className="font-mono" style={{ fontSize: '0.80rem', fontWeight: 600, color: 'var(--text-primary)' }}>{zone.slope}</span>
                      </div>
                    </div>

                    {/* Expand/Collapse Button */}
                    <button
                      onClick={() => setExpandedZoneId(isExpanded ? null : zone.id)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        padding: '6px 0 0 0',
                        color: 'var(--brand-primary)',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 4,
                        cursor: 'pointer'
                      }}
                    >
                      {isExpanded ? <>Hide Details <ChevronUp size={14} /></> : <>Geotechnical Details <ChevronDown size={14} /></>}
                    </button>

                    {isExpanded && (
                      <div style={{ paddingTop: 8, borderTop: '1px solid var(--border-primary)', display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: '0.75rem' }}>
                          <div><span style={{ color: 'var(--text-muted)' }}>Elevation:</span> <strong style={{ color: 'var(--text-primary)' }}>{zone.elevation}</strong></div>
                          <div><span style={{ color: 'var(--text-muted)' }}>Drainage:</span> <strong style={{ color: 'var(--text-primary)' }}>{zone.drainage}</strong></div>
                          <div><span style={{ color: 'var(--text-muted)' }}>Surface Area:</span> <strong style={{ color: 'var(--text-primary)' }}>{zone.area}</strong></div>
                          <div><span style={{ color: 'var(--text-muted)' }}>AI Probability:</span> <strong style={{ color: 'var(--text-primary)' }}>{zone.prob}</strong></div>
                        </div>
                        {onNavigateToGIS && (
                          <Button
                            variant="secondary"
                            size="sm"
                            icon={Compass}
                            onClick={() => {
                              if (onSelectZone) onSelectZone(zone);
                              onNavigateToGIS();
                            }}
                          >
                            Inspect on GIS Map
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )
      ) : (
        <Card padding={0} style={{ overflow: 'hidden' }}>
          <div
            style={{
              padding: '14px 20px',
              borderBottom: '1px solid var(--border-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 12,
              backgroundColor: 'var(--bg-surface-elevated)'
            }}
          >
            <div>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                Top Landslide Hazard Zones
              </h3>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
                Micro-zone severity hierarchy ranked by geotechnical slope failure probability
              </p>
            </div>

            <div style={{ width: 220 }}>
              <SearchInput
                size="sm"
                placeholder="Filter zone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onClear={() => setSearchTerm('')}
              />
            </div>
          </div>

          <DataTable
            columns={columns}
            data={filteredZones}
            keyField="id"
            onSelectKey={(id) => {
              const found = exactRiskZones.find(z => z.id === id);
              if (found) setSelectedZone(found);
            }}
          />
        </Card>
      )}

      {/* 3. Bottom Split: Zone Comparison Radar | Vulnerability & Inspector */}
      {(!isMobile || mobileTab === 'vulnerability') && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'minmax(0, 1.15fr) minmax(360px, 1fr)',
            gap: 16,
            alignItems: 'stretch'
          }}
          className="simulation-xai-grid"
        >
        {/* Left: Zone Comparison Radar Chart */}
        <Card padding={18}>
          <ZoneComparison zones={zones.length > 0 ? zones : exactRiskZones} />
        </Card>

        {/* Right Column: Vulnerability Overview + Zone Inspector */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Vulnerability Overview (4 metric boxes) */}
          <Card padding={16}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                marginBottom: 12
              }}
            >
              Vulnerability Assessment
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 8 }}>
              {/* Population */}
              <div
                style={{
                  backgroundColor: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-primary)',
                  padding: '10px',
                  borderRadius: 'var(--radius-input)'
                }}
              >
                <span style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block' }}>
                  Population
                </span>
                <div
                  className="font-mono"
                  style={{
                    fontSize: 18,
                    fontWeight: 600,
                    color: 'var(--risk-critical)',
                    lineHeight: 1.1,
                    marginTop: 4
                  }}
                >
                  12,842
                </div>
                <span style={{ fontSize: 10, color: 'var(--risk-safe)', fontWeight: 500 }}>+1,234 live</span>
              </div>

              {/* Critical Infrastructure */}
              <div
                style={{
                  backgroundColor: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-primary)',
                  padding: '10px',
                  borderRadius: 'var(--radius-input)'
                }}
              >
                <span style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block' }}>
                  Critical Infra
                </span>
                <div
                  className="font-mono"
                  style={{
                    fontSize: 18,
                    fontWeight: 600,
                    color: 'var(--risk-high)',
                    lineHeight: 1.1,
                    marginTop: 4
                  }}
                >
                  24
                </div>
                <span style={{ fontSize: 10, color: 'var(--text-secondary)' }}>Bridges, Schools</span>
              </div>

              {/* Settlements */}
              <div
                style={{
                  backgroundColor: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-primary)',
                  padding: '10px',
                  borderRadius: 'var(--radius-input)'
                }}
              >
                <span style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block' }}>
                  Settlements
                </span>
                <div
                  className="font-mono"
                  style={{
                    fontSize: 18,
                    fontWeight: 600,
                    color: 'var(--brand-primary)',
                    lineHeight: 1.1,
                    marginTop: 4
                  }}
                >
                  36
                </div>
                <span style={{ fontSize: 10, color: 'var(--text-secondary)' }}>Villages</span>
              </div>

              {/* Road at Risk */}
              <div
                style={{
                  backgroundColor: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-primary)',
                  padding: '10px',
                  borderRadius: 'var(--radius-input)'
                }}
              >
                <span style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block' }}>
                  Road at Risk
                </span>
                <div
                  className="font-mono"
                  style={{
                    fontSize: 18,
                    fontWeight: 600,
                    color: 'var(--brand-light)',
                    lineHeight: 1.1,
                    marginTop: 4
                  }}
                >
                  48.6 km
                </div>
                <span style={{ fontSize: 10, color: 'var(--text-secondary)' }}>NH-6 & NH-106</span>
              </div>
            </div>
          </Card>

          {/* Zone Inspector Card */}
          <Card
            padding={18}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: 14
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--brand-primary)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  Zone Inspector
                </span>
                <RiskBadge level={activeInspectorZone.level} size="sm" />
              </div>

              <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 12px 0' }}>
                {activeInspectorZone.name}
              </h3>

              {/* Geotechnical Parameters Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(95px, 1fr))', gap: 8, marginBottom: 14 }}>
                <div style={{ backgroundColor: 'var(--bg-surface-elevated)', border: '1px solid var(--border-primary)', padding: '8px 10px', borderRadius: 'var(--radius-input)' }}>
                  <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>Surface Area</span>
                  <div className="font-mono" style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-primary)', marginTop: 2 }}>
                    {activeInspectorZone.area}
                  </div>
                </div>

                <div style={{ backgroundColor: 'var(--bg-surface-elevated)', border: '1px solid var(--border-primary)', padding: '8px 10px', borderRadius: 'var(--radius-input)' }}>
                  <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>Elevation</span>
                  <div className="font-mono" style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--brand-primary)', marginTop: 2 }}>
                    {activeInspectorZone.elevation}
                  </div>
                </div>

                <div style={{ backgroundColor: 'var(--bg-surface-elevated)', border: '1px solid var(--border-primary)', padding: '8px 10px', borderRadius: 'var(--radius-input)' }}>
                  <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>Avg Slope</span>
                  <div className="font-mono" style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--risk-high)', marginTop: 2 }}>
                    {activeInspectorZone.slope}
                  </div>
                </div>

                <div style={{ backgroundColor: 'var(--bg-surface-elevated)', border: '1px solid var(--border-primary)', padding: '8px 10px', borderRadius: 'var(--radius-input)' }}>
                  <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>Geology</span>
                  <div style={{ fontSize: 11.5, fontWeight: 500, color: 'var(--text-secondary)', marginTop: 2 }}>
                    {activeInspectorZone.geology}
                  </div>
                </div>

                <div style={{ backgroundColor: 'var(--bg-surface-elevated)', border: '1px solid var(--border-primary)', padding: '8px 10px', borderRadius: 'var(--radius-input)' }}>
                  <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>Drainage Density</span>
                  <div className="font-mono" style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--brand-light)', marginTop: 2 }}>
                    {activeInspectorZone.drainage}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons: Locate on Map + Export Dossier */}
            <div style={{ display: 'flex', gap: 8 }}>
              {onNavigateToGIS && (
                <Button
                  variant="secondary"
                  size="sm"
                  icon={ArrowUpRight}
                  onClick={() => {
                    if (onSelectZone) onSelectZone(activeInspectorZone);
                    onNavigateToGIS();
                  }}
                  style={{ flex: 1 }}
                >
                  Locate on GIS
                </Button>
              )}
              <Button
                variant="primary"
                size="sm"
                icon={FileText}
                onClick={() => {
                  const found = zones.find(z => z.id === activeInspectorZone.id) || activeInspectorZone;
                  exportZoneRiskPDF(found);
                }}
                style={{ flex: 1 }}
              >
                Export Dossier
              </Button>
            </div>
          </Card>
        </div>
      </div>
      )}
    </div>
  );
}

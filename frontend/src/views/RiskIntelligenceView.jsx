import React, { useState } from 'react';
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
  ArrowUpRight
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

      {/* 2. Top Risk Zones Table matching Reference Image Table Spec */}
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

      {/* 3. Bottom Split: Zone Comparison Radar | Vulnerability & Inspector */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.15fr) minmax(360px, 1fr)',
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
    </div>
  );
}

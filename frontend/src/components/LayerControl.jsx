import React, { useState } from 'react';
import { 
  Layers, 
  ChevronLeft, 
  ChevronRight, 
  RotateCcw, 
  ShieldAlert, 
  MapPin, 
  Compass, 
  CloudRain, 
  Activity, 
  Home, 
  Hospital 
} from 'lucide-react';

export default function LayerControl({
  layerVisibility = {},
  onToggleLayer,
  onResetFilters
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const layerOptions = [
    { key: 'zones', label: 'Hazard Zones' },
    { key: 'roads', label: 'Road Network' },
    { key: 'shelters', label: 'Shelters & Havens' },
    { key: 'hospitals', label: 'Medical Facilities' },
    { key: 'reports', label: 'Field Observations' },
    { key: 'rainfall', label: 'IMD Doppler Radar' }
  ];

  return (
    <div
      style={{
        position: 'absolute',
        top: 14,
        left: 14,
        zIndex: 500,
        width: isCollapsed ? 36 : 210,
        backgroundColor: 'rgba(16, 16, 16, 0.94)',
        backdropFilter: 'blur(16px)',
        border: '1px solid var(--border-primary)',
        borderRadius: 'var(--radius-card)',
        boxShadow: 'var(--shadow-elevated)',
        transition: 'width var(--transition-normal)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'var(--font-primary)'
      }}
      className="ui-layer-control"
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: isCollapsed ? 'center' : 'space-between',
          padding: isCollapsed ? '10px 0' : '10px 14px',
          borderBottom: isCollapsed ? 'none' : '1px solid var(--border-primary)',
          backgroundColor: 'var(--bg-surface-elevated)'
        }}
      >
        {!isCollapsed && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Layers size={14} style={{ color: 'var(--brand-primary)' }} />
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: 'var(--text-secondary)',
                letterSpacing: '0.05em',
                textTransform: 'uppercase'
              }}
            >
              GIS LAYERS
            </span>
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          title={isCollapsed ? 'Expand Layers' : 'Collapse Layers'}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          aria-label={isCollapsed ? 'Expand Layers' : 'Collapse Layers'}
        >
          {isCollapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
        </button>
      </div>

      {!isCollapsed && (
        <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Layer Checkboxes */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {layerOptions.map((layer) => (
              <label
                key={layer.key}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  fontSize: 12,
                  color: layerVisibility[layer.key] ? 'var(--text-primary)' : 'var(--text-muted)',
                  cursor: 'pointer',
                  userSelect: 'none'
                }}
              >
                <input
                  type="checkbox"
                  checked={Boolean(layerVisibility[layer.key])}
                  onChange={() => onToggleLayer && onToggleLayer(layer.key)}
                  style={{
                    accentColor: 'var(--brand-primary)',
                    cursor: 'pointer'
                  }}
                />
                <span>{layer.label}</span>
              </label>
            ))}
          </div>

          {/* Reset Filters */}
          <button
            onClick={onResetFilters}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              padding: '6px 0',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-secondary)',
              color: 'var(--text-secondary)',
              fontSize: 11,
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all var(--transition-fast)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--text-primary)';
              e.currentTarget.style.borderColor = 'var(--border-hover)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--text-secondary)';
              e.currentTarget.style.borderColor = 'var(--border-secondary)';
            }}
          >
            <RotateCcw size={12} />
            <span>Reset Layers</span>
          </button>
        </div>
      )}
    </div>
  );
}

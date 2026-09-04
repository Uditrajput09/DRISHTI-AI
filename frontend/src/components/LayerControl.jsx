import React, { useState } from 'react';
import { 
  Filter, 
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
  riskFilters,
  onToggleRiskFilter,
  layerVisibility,
  onToggleLayer,
  onResetFilters
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const riskOptions = [
    { key: 'Critical', label: 'Critical', color: '#FF3B6B' },
    { key: 'High', label: 'High', color: '#FF9D3D' },
    { key: 'Medium', label: 'Medium', color: '#FFD84D' },
    { key: 'Low', label: 'Low', color: '#39D98A' }
  ];

  const layerOptions = [
    { key: 'zones', label: 'Risk Zones', icon: ShieldAlert, color: '#35D8FF' },
    { key: 'roads', label: 'Roads', icon: Compass, color: '#9AA5B8' },
    { key: 'rivers', label: 'Rivers', icon: Activity, color: '#35D8FF' },
    { key: 'hospitals', label: 'Hospitals', icon: Hospital, color: '#FF3B6B' },
    { key: 'shelters', label: 'Shelters', icon: Home, color: '#39D98A' },
    { key: 'reports', label: 'Citizen Reports', icon: MapPin, color: '#FF9D3D' },
    { key: 'rainfall', label: 'Rainfall', icon: CloudRain, color: '#35D8FF' },
    { key: 'terrain', label: 'Terrain', icon: Layers, color: '#8B6CFF' }
  ];

  return (
    <div
      style={{
        position: 'absolute',
        top: 16,
        left: 16,
        zIndex: 500,
        width: isCollapsed ? 42 : 230,
        maxHeight: 'calc(100% - 32px)',
        background: 'rgba(16, 21, 33, 0.92)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(120, 140, 180, 0.25)',
        borderRadius: 12,
        boxShadow: '0 12px 36px rgba(0, 0, 0, 0.55)',
        transition: 'width 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Panel Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: isCollapsed ? 'center' : 'space-between',
          padding: isCollapsed ? '12px 0' : '12px 14px',
          borderBottom: isCollapsed ? 'none' : '1px solid rgba(120, 140, 180, 0.18)',
          background: 'rgba(21, 27, 41, 0.6)'
        }}
      >
        {!isCollapsed && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <Filter size={14} color="#35D8FF" />
            <span
              style={{
                fontSize: '0.74rem',
                fontWeight: 800,
                color: '#F4F6FB',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                fontFamily: 'Space Grotesk, sans-serif'
              }}
            >
              Control Panel
            </span>
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          title={isCollapsed ? 'Expand Control Panel' : 'Collapse Control Panel'}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#9AA5B8',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 4,
            borderRadius: 4
          }}
        >
          {isCollapsed ? <ChevronRight size={18} color="#35D8FF" /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {!isCollapsed && (
        <div
          style={{
            padding: '12px 14px',
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
            overflowY: 'auto'
          }}
        >
          {/* Section 1: RISK FILTER */}
          <div>
            <div
              style={{
                fontSize: '0.68rem',
                fontWeight: 800,
                color: '#9AA5B8',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                fontFamily: 'Space Grotesk, sans-serif',
                marginBottom: 8
              }}
            >
              Risk Filter
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {riskOptions.map(opt => {
                const isChecked = !!riskFilters[opt.key];
                return (
                  <label
                    key={opt.key}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      fontSize: '0.76rem',
                      color: isChecked ? '#F4F6FB' : '#5C677D',
                      cursor: 'pointer',
                      userSelect: 'none'
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => onToggleRiskFilter(opt.key)}
                      style={{
                        accentColor: opt.color,
                        width: 14,
                        height: 14,
                        cursor: 'pointer'
                      }}
                    />
                    <span
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        backgroundColor: opt.color,
                        boxShadow: isChecked ? `0 0 8px ${opt.color}` : 'none'
                      }}
                    />
                    <span style={{ fontWeight: isChecked ? 600 : 400 }}>{opt.label}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Section 2: MAP LAYERS */}
          <div style={{ borderTop: '1px solid rgba(120, 140, 180, 0.15)', paddingTop: 10 }}>
            <div
              style={{
                fontSize: '0.68rem',
                fontWeight: 800,
                color: '#9AA5B8',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                fontFamily: 'Space Grotesk, sans-serif',
                marginBottom: 8
              }}
            >
              Map Layers
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {layerOptions.map(layer => {
                const isChecked = !!layerVisibility[layer.key];
                const IconComponent = layer.icon;
                return (
                  <label
                    key={layer.key}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      fontSize: '0.76rem',
                      color: isChecked ? '#F4F6FB' : '#5C677D',
                      cursor: 'pointer',
                      userSelect: 'none'
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => onToggleLayer(layer.key)}
                      style={{
                        accentColor: layer.color,
                        width: 14,
                        height: 14,
                        cursor: 'pointer'
                      }}
                    />
                    <IconComponent size={13} color={isChecked ? layer.color : '#5C677D'} />
                    <span style={{ fontWeight: isChecked ? 600 : 400 }}>{layer.label}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* RESET FILTERS Button */}
          <button
            onClick={onResetFilters}
            style={{
              marginTop: 4,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              background: 'rgba(120, 140, 180, 0.12)',
              border: '1px solid rgba(120, 140, 180, 0.25)',
              borderRadius: 6,
              color: '#9AA5B8',
              fontSize: '0.72rem',
              fontWeight: 700,
              fontFamily: 'Space Grotesk, sans-serif',
              letterSpacing: '0.04em',
              padding: '7px 0',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.color = '#F4F6FB';
              e.currentTarget.style.borderColor = 'rgba(53, 216, 255, 0.45)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.color = '#9AA5B8';
              e.currentTarget.style.borderColor = 'rgba(120, 140, 180, 0.25)';
            }}
          >
            <RotateCcw size={12} />
            RESET FILTERS
          </button>
        </div>
      )}
    </div>
  );
}

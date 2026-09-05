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
    { key: 'zones', label: 'Risk Zones' },
    { key: 'roads', label: 'Road Network' },
    { key: 'shelters', label: 'Shelters' },
    { key: 'hospitals', label: 'Hospitals' },
    { key: 'reports', label: 'Field Reports' },
    { key: 'evacuation', label: 'Evacuation Routes' },
    { key: 'rainfall', label: 'Rainfall (Radar)' }
  ];

  const riskLegend = [
    { label: 'Critical', range: '80 - 100', color: '#FF3B6B' },
    { label: 'High', range: '60 - 79', color: '#FF9D3D' },
    { label: 'Medium', range: '30 - 59', color: '#FFD84D' },
    { label: 'Low', range: '10 - 29', color: '#7BED9F' },
    { label: 'Safe', range: '0 - 9', color: '#39D98A' }
  ];

  return (
    <div
      style={{
        position: 'absolute',
        top: 14,
        left: 14,
        zIndex: 500,
        width: isCollapsed ? 38 : 205,
        background: 'rgba(10, 14, 23, 0.94)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(120, 140, 180, 0.25)',
        borderRadius: 10,
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.7)',
        transition: 'all 0.2s ease',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: isCollapsed ? 'center' : 'space-between',
          padding: isCollapsed ? '10px 0' : '10px 12px',
          borderBottom: isCollapsed ? 'none' : '1px solid rgba(120, 140, 180, 0.18)',
          background: 'rgba(16, 21, 33, 0.7)'
        }}
      >
        {!isCollapsed && (
          <span
            style={{
              fontSize: '0.68rem',
              fontWeight: 800,
              color: '#9AA5B8',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              fontFamily: 'Space Grotesk, sans-serif'
            }}
          >
            MAP LAYERS
          </span>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          title={isCollapsed ? 'Expand' : 'Collapse'}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#9AA5B8',
            cursor: 'pointer',
            padding: 2
          }}
        >
          {isCollapsed ? <ChevronRight size={16} color="#35D8FF" /> : <ChevronLeft size={14} />}
        </button>
      </div>

      {!isCollapsed && (
        <div style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Layer Switches List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {layerOptions.map(layer => {
              const isChecked = layerVisibility[layer.key] !== false;
              return (
                <div
                  key={layer.key}
                  onClick={() => onToggleLayer(layer.key)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '0.72rem',
                    color: isChecked ? '#F4F6FB' : '#5C677D',
                    cursor: 'pointer'
                  }}
                >
                  <span style={{ fontWeight: isChecked ? 600 : 400 }}>{layer.label}</span>
                  {/* Cyan / Blue Toggle Switch */}
                  <div
                    style={{
                      width: 28,
                      height: 15,
                      borderRadius: 10,
                      background: isChecked ? '#35D8FF' : 'rgba(120, 140, 180, 0.25)',
                      position: 'relative',
                      transition: 'background 0.2s ease'
                    }}
                  >
                    <div
                      style={{
                        width: 11,
                        height: 11,
                        borderRadius: '50%',
                        background: '#FFFFFF',
                        position: 'absolute',
                        top: 2,
                        left: isChecked ? 15 : 2,
                        transition: 'left 0.2s ease',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.4)'
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* RISK LEGEND */}
          <div style={{ borderTop: '1px solid rgba(120, 140, 180, 0.18)', paddingTop: 10 }}>
            <span
              style={{
                fontSize: '0.64rem',
                fontWeight: 800,
                color: '#9AA5B8',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                fontFamily: 'Space Grotesk, sans-serif',
                display: 'block',
                marginBottom: 6
              }}
            >
              RISK LEGEND
            </span>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {riskLegend.map(item => (
                <div
                  key={item.label}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '0.68rem',
                    color: '#CBD5E1'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        background: item.color,
                        boxShadow: `0 0 6px ${item.color}`
                      }}
                    />
                    <span>{item.label}</span>
                  </div>
                  <span style={{ color: '#5C677D', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.64rem' }}>
                    {item.range}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState } from 'react';
import { 
  Plus, 
  Minus, 
  LocateFixed, 
  Maximize2, 
  Minimize2, 
  RefreshCw, 
  Layers,
  ChevronDown
} from 'lucide-react';

export default function MapControls({
  activeBaseMap,
  onChangeBaseMap,
  onZoomIn,
  onZoomOut,
  onLocateMe,
  isLocating,
  isFullscreen,
  onToggleFullscreen,
  onRefreshData,
  isRefreshing
}) {
  const [isStyleMenuOpen, setIsStyleMenuOpen] = useState(false);

  const baseStyles = [
    { id: 'satellite', label: 'Satellite' },
    { id: 'topo', label: 'Terrain' },
    { id: 'osm', label: 'Dark Carto' }
  ];

  return (
    <div
      style={{
        position: 'absolute',
        top: 14,
        right: 14,
        zIndex: 500,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        fontFamily: 'var(--font-primary)'
      }}
      className="ui-map-controls"
    >
      {/* Map Style Selector Dropdown */}
      <div style={{ position: 'relative' }}>
        <button
          onClick={() => setIsStyleMenuOpen(!isStyleMenuOpen)}
          title="Switch Map Base Layer"
          style={{
            backgroundColor: 'rgba(16, 16, 16, 0.94)',
            backdropFilter: 'blur(16px)',
            border: '1px solid var(--border-primary)',
            borderRadius: 'var(--radius-input)',
            color: 'var(--text-primary)',
            padding: '6px 12px',
            fontSize: 12,
            fontWeight: 500,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            boxShadow: 'var(--shadow-card)',
            transition: 'border-color var(--transition-fast)'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--border-hover)')}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-primary)')}
        >
          <Layers size={14} style={{ color: 'var(--brand-primary)' }} />
          <span>{baseStyles.find((s) => s.id === activeBaseMap)?.label || 'Satellite'}</span>
          <ChevronDown size={12} style={{ color: 'var(--text-muted)' }} />
        </button>

        {isStyleMenuOpen && (
          <div
            style={{
              position: 'absolute',
              top: 'calc(100% + 6px)',
              right: 0,
              backgroundColor: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-primary)',
              borderRadius: 'var(--radius-input)',
              padding: 4,
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              minWidth: 120,
              boxShadow: 'var(--shadow-modal)',
              zIndex: 600
            }}
          >
            {baseStyles.map((st) => (
              <button
                key={st.id}
                onClick={() => {
                  onChangeBaseMap(st.id);
                  setIsStyleMenuOpen(false);
                }}
                style={{
                  backgroundColor: activeBaseMap === st.id ? 'var(--brand-tint)' : 'transparent',
                  color: activeBaseMap === st.id ? 'var(--brand-light)' : 'var(--text-secondary)',
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  padding: '6px 10px',
                  fontSize: 12,
                  fontWeight: activeBaseMap === st.id ? 600 : 400,
                  cursor: 'pointer',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}
              >
                <span>{st.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Control Buttons Cluster */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'rgba(16, 16, 16, 0.94)',
          backdropFilter: 'blur(16px)',
          border: '1px solid var(--border-primary)',
          borderRadius: 'var(--radius-input)',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-card)'
        }}
      >
        <button
          onClick={onZoomIn}
          title="Zoom In"
          style={{
            width: 34,
            height: 34,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'transparent',
            border: 'none',
            color: 'var(--text-primary)',
            cursor: 'pointer',
            borderBottom: '1px solid var(--border-primary)'
          }}
        >
          <Plus size={15} />
        </button>

        <button
          onClick={onZoomOut}
          title="Zoom Out"
          style={{
            width: 34,
            height: 34,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'transparent',
            border: 'none',
            color: 'var(--text-primary)',
            cursor: 'pointer'
          }}
        >
          <Minus size={15} />
        </button>
      </div>

      {/* Location Button */}
      <button
        onClick={onLocateMe}
        title="Locate Device Position"
        style={{
          width: 34,
          height: 34,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(16, 16, 16, 0.94)',
          backdropFilter: 'blur(16px)',
          border: '1px solid var(--border-primary)',
          borderRadius: 'var(--radius-input)',
          color: isLocating ? 'var(--brand-primary)' : 'var(--text-primary)',
          cursor: 'pointer',
          boxShadow: 'var(--shadow-card)'
        }}
      >
        <LocateFixed size={15} style={{ animation: isLocating ? 'pulseDot 1.5s infinite' : 'none' }} />
      </button>

      {/* Fullscreen Toggle */}
      <button
        onClick={onToggleFullscreen}
        title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Map'}
        style={{
          width: 34,
          height: 34,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(16, 16, 16, 0.94)',
          backdropFilter: 'blur(16px)',
          border: '1px solid var(--border-primary)',
          borderRadius: 'var(--radius-input)',
          color: 'var(--text-primary)',
          cursor: 'pointer',
          boxShadow: 'var(--shadow-card)'
        }}
      >
        {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
      </button>
    </div>
  );
}

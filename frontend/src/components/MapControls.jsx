import React, { useState } from 'react';
import { 
  Plus, 
  Minus, 
  LocateFixed, 
  Maximize2, 
  Minimize2, 
  RefreshCw, 
  Layers 
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
    { id: 'osm', label: 'Dark OSM' }
  ];

  return (
    <div
      style={{
        position: 'absolute',
        top: 16,
        right: 16,
        zIndex: 500,
        display: 'flex',
        flexDirection: 'column',
        gap: 8
      }}
    >
      {/* Map Style Selector */}
      <div style={{ position: 'relative' }}>
        <button
          onClick={() => setIsStyleMenuOpen(!isStyleMenuOpen)}
          title="Switch Map Style"
          style={{
            background: 'rgba(16, 21, 33, 0.92)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(120, 140, 180, 0.25)',
            borderRadius: 8,
            color: '#F4F6FB',
            padding: '7px 12px',
            fontSize: '0.74rem',
            fontWeight: 700,
            fontFamily: 'Space Grotesk, sans-serif',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            boxShadow: '0 8px 24px rgba(0,0,0,0.45)'
          }}
        >
          <Layers size={14} color="#35D8FF" />
          <span>{baseStyles.find(s => s.id === activeBaseMap)?.label || 'Satellite'}</span>
        </button>

        {isStyleMenuOpen && (
          <div
            style={{
              position: 'absolute',
              top: 'calc(100% + 6px)',
              right: 0,
              background: '#101521',
              border: '1px solid rgba(120, 140, 180, 0.3)',
              borderRadius: 8,
              padding: 4,
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              minWidth: 120,
              boxShadow: '0 12px 28px rgba(0,0,0,0.6)',
              zIndex: 600
            }}
          >
            {baseStyles.map(st => (
              <button
                key={st.id}
                onClick={() => {
                  onChangeBaseMap(st.id);
                  setIsStyleMenuOpen(false);
                }}
                style={{
                  background: activeBaseMap === st.id ? 'rgba(53, 216, 255, 0.15)' : 'transparent',
                  color: activeBaseMap === st.id ? '#35D8FF' : '#9AA5B8',
                  border: 'none',
                  borderRadius: 6,
                  padding: '6px 10px',
                  fontSize: '0.74rem',
                  fontWeight: 600,
                  textAlign: 'left',
                  cursor: 'pointer'
                }}
              >
                {st.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Action Controls Group */}
      <div
        style={{
          background: 'rgba(16, 21, 33, 0.92)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(120, 140, 180, 0.25)',
          borderRadius: 8,
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 8px 24px rgba(0,0,0,0.45)',
          overflow: 'hidden'
        }}
      >
        <button
          onClick={onZoomIn}
          title="Zoom In"
          style={{
            background: 'transparent',
            border: 'none',
            borderBottom: '1px solid rgba(120, 140, 180, 0.18)',
            color: '#F4F6FB',
            padding: 8,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Plus size={16} />
        </button>

        <button
          onClick={onZoomOut}
          title="Zoom Out"
          style={{
            background: 'transparent',
            border: 'none',
            borderBottom: '1px solid rgba(120, 140, 180, 0.18)',
            color: '#F4F6FB',
            padding: 8,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Minus size={16} />
        </button>

        <button
          onClick={onLocateMe}
          disabled={isLocating}
          title="Locate Me"
          style={{
            background: 'transparent',
            border: 'none',
            borderBottom: '1px solid rgba(120, 140, 180, 0.18)',
            color: isLocating ? '#35D8FF' : '#9AA5B8',
            padding: 8,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <LocateFixed size={16} />
        </button>

        <button
          onClick={onToggleFullscreen}
          title={isFullscreen ? 'Exit Fullscreen' : 'Toggle Fullscreen'}
          style={{
            background: 'transparent',
            border: 'none',
            borderBottom: '1px solid rgba(120, 140, 180, 0.18)',
            color: '#9AA5B8',
            padding: 8,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
        </button>

        <button
          onClick={onRefreshData}
          disabled={isRefreshing}
          title="Refresh Geospatial Data"
          style={{
            background: 'transparent',
            border: 'none',
            color: isRefreshing ? '#35D8FF' : '#9AA5B8',
            padding: 8,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <RefreshCw size={15} style={{ animation: isRefreshing ? 'spin 1s linear infinite' : 'none' }} />
        </button>
      </div>
    </div>
  );
}

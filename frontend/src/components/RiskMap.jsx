import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  MapContainer, 
  TileLayer, 
  Polygon, 
  Marker, 
  Popup, 
  Polyline, 
  CircleMarker, 
  useMap 
} from 'react-leaflet';
import L from 'leaflet';
import LayerControl from './LayerControl';
import MapControls from './MapControls';
import { RIVERS_DATA } from '../data/rivers';

// Map Imperative Controller for zooming and center transitions
function MapController({ centerPos, zoomLevel, userLocation }) {
  const map = useMap();

  useEffect(() => {
    if (centerPos && Array.isArray(centerPos)) {
      map.flyTo(centerPos, zoomLevel || 11, { duration: 1.2 });
    }
  }, [centerPos, zoomLevel, map]);

  useEffect(() => {
    if (userLocation) {
      map.flyTo([userLocation.lat, userLocation.lon], 13, { duration: 1.2 });
    }
  }, [userLocation, map]);

  return null;
}

// Marker helper using DivIcon
const createCustomPin = (color, text) => {
  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `
      <div style="
        background: ${color};
        width: 30px;
        height: 30px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #fff;
        font-size: 13px;
        box-shadow: 0 4px 14px rgba(0,0,0,0.6);
        border: 2px solid #ffffff;
      ">
        ${text}
      </div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 15]
  });
};

const hospitalIcon = createCustomPin('var(--risk-critical, #FF4D5A)', '🏥');
const shelterIcon = createCustomPin('var(--risk-low, #31B77A)', '🛡️');
const reportIcon = createCustomPin('var(--risk-high, #FF8A4C)', '📸');

export default function RiskMap({
  zones = [],
  selectedZone,
  onSelectZone,
  facilities = [],
  roads = [],
  reports = [],
  onRefreshData,
  isRefreshing,
  isLiveConnected = false,
  liveLastUpdate = null
}) {
  const [activeBaseMap, setActiveBaseMap] = useState('satellite');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const [mapCenter, setMapCenter] = useState([25.4200, 91.8000]);
  const [mapZoom, setMapZoom] = useState(10);
  const mapContainerRef = useRef(null);

  // Risk filters: Critical, High, Medium, Low
  const [riskFilters, setRiskFilters] = useState({
    Critical: true,
    High: true,
    Medium: true,
    Low: true
  });

  // Layer visibility
  const [layerVisibility, setLayerVisibility] = useState({
    zones: true,
    roads: true,
    rivers: true,
    hospitals: true,
    shelters: true,
    reports: true,
    rainfall: false,
    terrain: true
  });

  // Handle zone selection centering
  useEffect(() => {
    if (selectedZone && selectedZone.center_lat && selectedZone.center_lon) {
      setMapCenter([selectedZone.center_lat, selectedZone.center_lon]);
      setMapZoom(12);
    }
  }, [selectedZone]);

  const handleToggleRiskFilter = (level) => {
    setRiskFilters(prev => ({ ...prev, [level]: !prev[level] }));
  };

  const handleToggleLayer = (layerKey) => {
    setLayerVisibility(prev => ({ ...prev, [layerKey]: !prev[layerKey] }));
  };

  const handleResetFilters = () => {
    setRiskFilters({ Critical: true, High: true, Medium: true, Low: true });
    setLayerVisibility({
      zones: true,
      roads: true,
      rivers: true,
      hospitals: true,
      shelters: true,
      reports: true,
      rainfall: false,
      terrain: true
    });
  };

  const handleLocateMe = useCallback(() => {
    if (!navigator.geolocation) return alert('Geolocation is not supported by your browser.');
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lon: pos.coords.longitude });
        setIsLocating(false);
      },
      () => {
        alert('Location access denied or unavailable.');
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      if (mapContainerRef.current?.requestFullscreen) {
        mapContainerRef.current.requestFullscreen();
        setIsFullscreen(true);
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  const getRiskColor = (level) => {
    switch (level) {
      case 'Critical': return '#FF4D5A';
      case 'High': return '#FF8A4C';
      case 'Medium': return '#E8B84B';
      case 'Low': return '#31B77A';
      default: return '#4F6FFF';
    }
  };

  // Filtered zones based on risk filter checkboxes
  const displayedZones = zones.filter(z => riskFilters[z.risk_level] !== false);

  return (
    <div
      ref={mapContainerRef}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        minHeight: 580,
        borderRadius: 'var(--radius-lg, 12px)',
        overflow: 'hidden',
        border: '1px solid var(--border-primary)',
        boxShadow: 'var(--shadow-md)',
        background: 'var(--bg-surface)'
      }}
    >
      {/* 4. Left Collapsible Map Control Panel */}
      <LayerControl
        riskFilters={riskFilters}
        onToggleRiskFilter={handleToggleRiskFilter}
        layerVisibility={layerVisibility}
        onToggleLayer={handleToggleLayer}
        onResetFilters={handleResetFilters}
      />

      {/* Map Controls (Right Top) */}
      <MapControls
        activeBaseMap={activeBaseMap}
        onChangeBaseMap={setActiveBaseMap}
        onZoomIn={() => setMapZoom(z => Math.min(z + 1, 18))}
        onZoomOut={() => setMapZoom(z => Math.max(z - 1, 6))}
        onLocateMe={handleLocateMe}
        isLocating={isLocating}
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
        onRefreshData={onRefreshData}
        isRefreshing={isRefreshing}
      />

      {/* Bottom Map Legend */}
      <div
        style={{
          position: 'absolute',
          bottom: 16,
          left: 16,
          zIndex: 500,
          background: 'rgba(16, 16, 16, 0.94)',
          backdropFilter: 'blur(16px)',
          border: '1px solid var(--border-primary)',
          borderRadius: 'var(--radius-md, 8px)',
          padding: '10px 14px',
          boxShadow: 'var(--shadow-md)',
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
          fontSize: '0.74rem',
          fontFamily: 'Inter, sans-serif'
        }}
      >
        <div style={{ fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', fontSize: '0.68rem', letterSpacing: '0.06em' }}>
          Susceptibility Index
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--risk-critical)' }} />
          <span style={{ color: 'var(--risk-critical)', fontWeight: 600 }}>Critical (&gt;80%)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--risk-high)' }} />
          <span style={{ color: 'var(--risk-high)', fontWeight: 600 }}>High (60–79%)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--risk-medium)' }} />
          <span style={{ color: 'var(--risk-medium)', fontWeight: 600 }}>Medium (35–59%)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--risk-low)' }} />
          <span style={{ color: 'var(--risk-low)', fontWeight: 600 }}>Low / Safe (&lt;35%)</span>
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTop: '1px solid var(--border-primary)',
            paddingTop: 6,
            marginTop: 4
          }}
        >
          <span style={{ fontSize: '0.66rem', color: 'var(--text-secondary)' }}>Telemetry Feed</span>
          <span
            style={{
              fontSize: '0.66rem',
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              color: isLiveConnected ? 'var(--risk-low)' : 'var(--text-muted)',
              fontWeight: 600
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: isLiveConnected ? 'var(--risk-low)' : 'var(--text-muted)',
                boxShadow: isLiveConnected ? '0 0 6px var(--risk-low)' : 'none'
              }}
            />
            {isLiveConnected ? 'Live WebSocket' : 'Polling'}
          </span>
        </div>
      </div>

      {/* Primary Leaflet Map Container */}
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        style={{ width: '100%', height: '100%' }}
        zoomControl={false}
      >
        <MapController centerPos={mapCenter} zoomLevel={mapZoom} userLocation={userLocation} />

        {/* 1. Base Map Layer Tile Providers */}
        {activeBaseMap === 'satellite' && (
          <TileLayer
            attribution='&copy; Esri World Imagery'
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            maxZoom={18}
          />
        )}
        {activeBaseMap === 'topo' && (
          <TileLayer
            attribution='&copy; Esri World Topographic Map'
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}"
            maxZoom={18}
          />
        )}
        {activeBaseMap === 'osm' && (
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            maxZoom={19}
          />
        )}

        {/* Live Rainfall Radar Overlay */}
        {layerVisibility.rainfall && (
          <TileLayer
            url="https://tilecache.rainviewer.com/v2/coverage/0/256/{z}/{x}/{y}/2/1_1.png"
            opacity={0.65}
            zIndex={400}
          />
        )}

        {/* 2. Translucent Risk Polygons (Choropleth) */}
        {layerVisibility.zones && displayedZones.map(zone => {
          if (!zone.geometry || !zone.geometry.coordinates || !Array.isArray(zone.geometry.coordinates)) return null;
          const ring = Array.isArray(zone.geometry.coordinates[0]) ? zone.geometry.coordinates[0] : zone.geometry.coordinates;
          const latLngs = ring
            .filter(c => Array.isArray(c) && c.length >= 2)
            .map(c => [c[1], c[0]]);

          if (latLngs.length === 0) return null;
          const color = getRiskColor(zone.risk_level);
          const isSelected = selectedZone && selectedZone.id === zone.id;

          return (
            <Polygon
              key={zone.id}
              positions={latLngs}
              pathOptions={{
                color: isSelected ? '#4F6FFF' : color,
                weight: isSelected ? 3.5 : 2,
                fillColor: color,
                fillOpacity: isSelected ? 0.6 : 0.38,
                dashArray: isSelected ? '4, 4' : null
              }}
              eventHandlers={{
                click: () => onSelectZone(zone)
              }}
            >
              <Popup>
                <div style={{ minWidth: 210, color: 'var(--text-primary)', padding: '4px 2px', fontFamily: 'Inter, sans-serif' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--brand-primary)', fontWeight: 700, fontFamily: 'monospace' }}>
                      {zone.zone_code}
                    </span>
                    <span
                      style={{
                        background: color,
                        color: '#0A0A0A',
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        padding: '1px 6px',
                        borderRadius: 4
                      }}
                    >
                      {zone.risk_level}
                    </span>
                  </div>

                  <div style={{ fontWeight: 700, fontSize: '0.96rem', color: 'var(--text-primary)', marginBottom: 6 }}>
                    {zone.name}
                  </div>

                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 10 }}>
                    <div>Risk Index: <strong style={{ color: color }}>{zone.risk_score}%</strong></div>
                    <div>Slope: <strong>{zone.base_slope_deg}°</strong></div>
                    <div>24h Rain: <strong>{zone.rainfall_24h} mm</strong></div>
                    <div>Saturation: <strong>{zone.soil_moisture_pct}%</strong></div>
                  </div>

                  <button
                    onClick={() => onSelectZone(zone)}
                    style={{
                      width: '100%',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      padding: '6px 10px',
                      background: 'var(--brand-primary)',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: 6,
                      cursor: 'pointer'
                    }}
                  >
                    Inspect Zone Intelligence →
                  </button>
                </div>
              </Popup>
            </Polygon>
          );
        })}

        {/* 3. Selected Zone Center Pulsing Marker */}
        {selectedZone && selectedZone.center_lat && selectedZone.center_lon && (
          <CircleMarker
            center={[selectedZone.center_lat, selectedZone.center_lon]}
            radius={9}
            pathOptions={{
              color: '#4F6FFF',
              fillColor: '#4F6FFF',
              fillOpacity: 0.8,
              weight: 3
            }}
          />
        )}

        {/* 4. Lifeline Road Networks */}
        {layerVisibility.roads && roads.map(road => {
          if (!road.coordinates || road.coordinates.length === 0) return null;
          const polyCoords = road.coordinates.map(pt => [pt[1], pt[0]]);
          const isCriticalRoad = road.vulnerability?.includes('Critical');
          return (
            <Polyline
              key={road.id}
              positions={polyCoords}
              pathOptions={{
                color: isCriticalRoad ? '#FF4D5A' : '#4F6FFF',
                weight: 3.5,
                opacity: 0.85
              }}
            >
              <Popup>
                <div style={{ color: 'var(--text-primary)', fontFamily: 'Inter, sans-serif' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>{road.name}</div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: 2 }}>{road.category}</div>
                  <div style={{ fontSize: '0.74rem', color: isCriticalRoad ? '#FF4D5A' : '#4F6FFF', fontWeight: 600, marginTop: 4 }}>
                    Vulnerability: {road.vulnerability}
                  </div>
                </div>
              </Popup>
            </Polyline>
          );
        })}

        {/* 5. Hydrological Drainage & Rivers Network */}
        {layerVisibility.rivers && RIVERS_DATA.map(river => {
          const coords = river.coordinates.map(pt => [pt[1], pt[0]]);
          return (
            <Polyline
              key={river.id}
              positions={coords}
              pathOptions={{
                color: '#4F6FFF',
                weight: 2.5,
                opacity: 0.75,
                dashArray: '5, 5'
              }}
            >
              <Popup>
                <div style={{ color: 'var(--text-primary)', fontFamily: 'Inter, sans-serif' }}>
                  <div style={{ fontWeight: 700, color: '#4F6FFF' }}>🌊 {river.name}</div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: 2 }}>{river.type}</div>
                  <div style={{ fontSize: '0.74rem', color: '#E8B84B', marginTop: 4 }}>{river.flow_status}</div>
                </div>
              </Popup>
            </Polyline>
          );
        })}


        {/* 6. Hospitals & Safe Shelters */}
        {facilities.map(fac => {
          if (!fac.latitude || !fac.longitude) return null;
          const isHospital = fac.type === 'hospital';
          if (isHospital && !layerVisibility.hospitals) return null;
          if (!isHospital && !layerVisibility.shelters) return null;

          return (
            <Marker
              key={fac.id}
              position={[fac.latitude, fac.longitude]}
              icon={isHospital ? hospitalIcon : shelterIcon}
            >
              <Popup>
                <div style={{ color: 'var(--text-primary)', fontFamily: 'Inter, sans-serif' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>{fac.name}</div>
                  <div style={{ fontSize: '0.74rem', color: isHospital ? 'var(--risk-critical)' : 'var(--risk-low)', fontWeight: 600 }}>
                    {fac.category}
                  </div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                    Capacity: <strong style={{ color: 'var(--text-primary)' }}>{fac.capacity} {isHospital ? 'Beds' : 'Persons'}</strong>
                  </div>
                  {fac.contact && (
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>
                      Contact: {fac.contact}
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* 7. Citizen Field Reports */}
        {layerVisibility.reports && reports.map(rep => {
          if (!rep.latitude || !rep.longitude) return null;
          return (
            <Marker
              key={rep.id}
              position={[rep.latitude, rep.longitude]}
              icon={reportIcon}
            >
              <Popup>
                <div style={{ maxWidth: 220, color: 'var(--text-primary)', fontFamily: 'Inter, sans-serif' }}>
                  <div style={{ fontWeight: 700, color: 'var(--risk-high)', fontSize: '0.85rem' }}>
                    📸 Field Report: {rep.hazard_type}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', margin: '3px 0' }}>
                    Severity: <strong style={{ color: 'var(--risk-critical)' }}>{rep.severity}</strong> • By: {rep.reporter_name}
                  </div>
                  <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginBottom: 6 }}>
                    {rep.description}
                  </div>
                  {rep.photo_data_url && (
                    <img 
                      src={rep.photo_data_url} 
                      alt="Hazard capture" 
                      style={{ width: '100%', height: 95, objectFit: 'cover', borderRadius: 6, marginBottom: 4 }} 
                    />
                  )}
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                    Status: <span style={{ color: rep.status === 'verified' ? 'var(--risk-low)' : 'var(--risk-medium)' }}>{rep.status?.toUpperCase()}</span>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* 8. User Geolocation Pin */}
        {userLocation && (
          <CircleMarker
            center={[userLocation.lat, userLocation.lon]}
            radius={10}
            pathOptions={{ color: 'var(--brand-primary)', fillColor: 'var(--brand-primary)', fillOpacity: 0.45, weight: 3 }}
          >
            <Popup>
              <div style={{ color: 'var(--text-primary)', fontWeight: 700, fontFamily: 'Inter, sans-serif' }}>📍 Your Current Location</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{userLocation.lat.toFixed(5)}, {userLocation.lon.toFixed(5)}</div>
            </Popup>
          </CircleMarker>
        )}
      </MapContainer>
    </div>
  );
}

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

const hospitalIcon = createCustomPin('#FF3B6B', '🏥');
const shelterIcon = createCustomPin('#39D98A', '🛡️');
const reportIcon = createCustomPin('#FF9D3D', '📸');

export default function RiskMap({
  zones = [],
  selectedZone,
  onSelectZone,
  facilities = [],
  roads = [],
  reports = [],
  onRefreshData,
  isRefreshing
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
      case 'Critical': return '#FF3B6B';
      case 'High': return '#FF9D3D';
      case 'Medium': return '#FFD84D';
      case 'Low': return '#39D98A';
      default: return '#35D8FF';
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
        borderRadius: 14,
        overflow: 'hidden',
        border: '1px solid rgba(120, 140, 180, 0.25)',
        boxShadow: '0 12px 36px rgba(0, 0, 0, 0.55)',
        background: '#070A10'
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
          background: 'rgba(16, 21, 33, 0.92)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(120, 140, 180, 0.25)',
          borderRadius: 10,
          padding: '10px 14px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
          fontSize: '0.74rem'
        }}
      >
        <div style={{ fontWeight: 800, color: '#F4F6FB', textTransform: 'uppercase', fontSize: '0.68rem', letterSpacing: '0.06em', fontFamily: 'Space Grotesk, sans-serif' }}>
          Susceptibility Index
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 10, height: 10, borderRadius: 2, background: '#FF3B6B', boxShadow: '0 0 6px #FF3B6B' }} />
          <span style={{ color: '#FF3B6B', fontWeight: 600 }}>Critical (&gt;80%)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 10, height: 10, borderRadius: 2, background: '#FF9D3D' }} />
          <span style={{ color: '#FF9D3D', fontWeight: 600 }}>High (60–79%)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 10, height: 10, borderRadius: 2, background: '#FFD84D' }} />
          <span style={{ color: '#FFD84D', fontWeight: 600 }}>Medium (35–59%)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 10, height: 10, borderRadius: 2, background: '#39D98A' }} />
          <span style={{ color: '#39D98A', fontWeight: 600 }}>Low / Safe (&lt;35%)</span>
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
                color: isSelected ? '#35D8FF' : color,
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
                <div style={{ minWidth: 210, color: '#F4F6FB', padding: '4px 2px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: '0.72rem', color: '#35D8FF', fontWeight: 700, fontFamily: 'Space Grotesk, sans-serif' }}>
                      {zone.zone_code}
                    </span>
                    <span
                      style={{
                        background: color,
                        color: '#070A10',
                        fontSize: '0.68rem',
                        fontWeight: 800,
                        padding: '1px 6px',
                        borderRadius: 4
                      }}
                    >
                      {zone.risk_level}
                    </span>
                  </div>

                  <div style={{ fontWeight: 800, fontSize: '0.96rem', color: '#FFFFFF', marginBottom: 6 }}>
                    {zone.name}
                  </div>

                  <div style={{ fontSize: '0.78rem', color: '#9AA5B8', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 10 }}>
                    <div>Risk Index: <strong style={{ color: color }}>{zone.risk_score}%</strong></div>
                    <div>Slope: <strong>{zone.base_slope_deg}°</strong></div>
                    <div>24h Rain: <strong>{zone.rainfall_24h} mm</strong></div>
                    <div>Saturation: <strong>{zone.soil_moisture_pct}%</strong></div>
                  </div>

                  <button
                    onClick={() => onSelectZone(zone)}
                    className="btn-primary-cyan"
                    style={{ width: '100%', fontSize: '0.74rem', padding: '6px 10px' }}
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
              color: '#35D8FF',
              fillColor: '#35D8FF',
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
                color: isCriticalRoad ? '#FF3B6B' : '#35D8FF',
                weight: 3.5,
                opacity: 0.85
              }}
            >
              <Popup>
                <div style={{ color: '#F4F6FB' }}>
                  <div style={{ fontWeight: 800, fontSize: '0.88rem' }}>{road.name}</div>
                  <div style={{ fontSize: '0.74rem', color: '#9AA5B8', marginTop: 2 }}>{road.category}</div>
                  <div style={{ fontSize: '0.74rem', color: isCriticalRoad ? '#FF3B6B' : '#35D8FF', fontWeight: 600, marginTop: 4 }}>
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
                color: '#35D8FF',
                weight: 2.5,
                opacity: 0.75,
                dashArray: '5, 5'
              }}
            >
              <Popup>
                <div style={{ color: '#F4F6FB' }}>
                  <div style={{ fontWeight: 800, color: '#35D8FF' }}>🌊 {river.name}</div>
                  <div style={{ fontSize: '0.74rem', color: '#9AA5B8', marginTop: 2 }}>{river.type}</div>
                  <div style={{ fontSize: '0.74rem', color: '#FFD84D', marginTop: 4 }}>{river.flow_status}</div>
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
                <div style={{ color: '#F4F6FB' }}>
                  <div style={{ fontWeight: 800, fontSize: '0.88rem' }}>{fac.name}</div>
                  <div style={{ fontSize: '0.74rem', color: isHospital ? '#FF3B6B' : '#39D98A', fontWeight: 600 }}>
                    {fac.category}
                  </div>
                  <div style={{ fontSize: '0.74rem', color: '#9AA5B8', marginTop: 4 }}>
                    Capacity: <strong style={{ color: '#F4F6FB' }}>{fac.capacity} {isHospital ? 'Beds' : 'Persons'}</strong>
                  </div>
                  {fac.contact && (
                    <div style={{ fontSize: '0.72rem', color: '#5C677D', marginTop: 2 }}>
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
                <div style={{ maxWidth: 220, color: '#F4F6FB' }}>
                  <div style={{ fontWeight: 800, color: '#FF9D3D', fontSize: '0.85rem' }}>
                    📸 Field Report: {rep.hazard_type}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#9AA5B8', margin: '3px 0' }}>
                    Severity: <strong style={{ color: '#FF3B6B' }}>{rep.severity}</strong> • By: {rep.reporter_name}
                  </div>
                  <div style={{ fontSize: '0.76rem', color: '#CBD5E1', marginBottom: 6 }}>
                    {rep.description}
                  </div>
                  {rep.photo_data_url && (
                    <img 
                      src={rep.photo_data_url} 
                      alt="Hazard capture" 
                      style={{ width: '100%', height: 95, objectFit: 'cover', borderRadius: 6, marginBottom: 4 }} 
                    />
                  )}
                  <div style={{ fontSize: '0.68rem', color: '#5C677D' }}>
                    Status: <span style={{ color: rep.status === 'verified' ? '#39D98A' : '#FFD84D' }}>{rep.status?.toUpperCase()}</span>
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
            pathOptions={{ color: '#35D8FF', fillColor: '#35D8FF', fillOpacity: 0.45, weight: 3 }}
          >
            <Popup>
              <div style={{ color: '#F4F6FB', fontWeight: 800 }}>📍 Your Current Location</div>
              <div style={{ fontSize: '0.72rem', color: '#9AA5B8' }}>{userLocation.lat.toFixed(5)}, {userLocation.lon.toFixed(5)}</div>
            </Popup>
          </CircleMarker>
        )}
      </MapContainer>
    </div>
  );
}

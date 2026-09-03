import React, { useState, useEffect, useCallback } from 'react';
import { 
  MapContainer, 
  TileLayer, 
  Polygon, 
  Marker, 
  Popup, 
  Polyline, 
  CircleMarker, 
  LayersControl,
  useMap
} from 'react-leaflet';
import L from 'leaflet';
import { 
  ShieldAlert, 
  Hospital, 
  Home, 
  AlertTriangle, 
  Eye, 
  Layers, 
  CheckCircle, 
  Radio,
  LocateFixed
} from 'lucide-react';

// Sub-component that imperatively controls the map (must be inside MapContainer)
function MapController({ userLocation }) {
  const map = useMap();
  if (userLocation) {
    map.setView([userLocation.lat, userLocation.lon], Math.max(map.getZoom(), 13));
  }
  return null;
}

// Custom Map Marker Icons using HTML DivIcons
const createCustomIcon = (bgColor, iconText) => {
  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `
      <div style="
        background: ${bgColor};
        width: 32px;
        height: 32px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: 14px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.5);
        border: 2px solid #ffffff;
      ">
        ${iconText}
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16]
  });
};

const hospitalIcon = createCustomIcon('#ef4444', '🏥');
const shelterIcon = createCustomIcon('#10b981', '🛡️');
const reportIcon = createCustomIcon('#f59e0b', '📸');

export default function GisMap({ 
  zones = [], 
  selectedZone, 
  onSelectZone, 
  facilities = [], 
  roads = [], 
  reports = [],
  historyPoints = []
}) {
  const [activeBaseMap, setActiveBaseMap] = useState('satellite');
  const [visibleLayers, setVisibleLayers] = useState({
    zones: true,
    facilities: true,
    roads: true,
    reports: true,
    radar: false,
    flood: false
  });
  const [sosEvents, setSosEvents] = useState([]);
  const [floodZones, setFloodZones] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [isLocating, setIsLocating] = useState(false);

  // Poll active SOS events every 10 seconds
  useEffect(() => {
    const fetchSOS = () => {
      fetch('/api/sos/active')
        .then(r => r.json())
        .then(data => Array.isArray(data) && setSosEvents(data))
        .catch(() => {});
    };
    fetchSOS();
    const iv = setInterval(fetchSOS, 10000);
    return () => clearInterval(iv);
  }, []);

  // Fetch flood risk for all zones
  useEffect(() => {
    if (visibleLayers.flood) {
      fetch('/api/flood/all-zones')
        .then(r => r.json())
        .then(data => Array.isArray(data) && setFloodZones(data))
        .catch(() => {});
    }
  }, [visibleLayers.flood]);

  const handleLocateMe = useCallback(() => {
    if (!navigator.geolocation) return alert('Geolocation not supported by your browser.');
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lon: pos.coords.longitude });
        setIsLocating(false);
      },
      (err) => { alert('Location access denied or unavailable.'); setIsLocating(false); },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }, []);

  const toggleLayer = (layerName) => {
    setVisibleLayers(prev => ({ ...prev, [layerName]: !prev[layerName] }));
  };

  const getZoneColor = (level) => {
    switch (level) {
      case 'Critical': return '#ef4444';
      case 'High': return '#f97316';
      case 'Medium': return '#f59e0b';
      case 'Low': return '#10b981';
      default: return '#06b6d4';
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: 560, borderRadius: 16, overflow: 'hidden', border: '1px solid var(--border-glass)' }}>
      {/* Floating Map Layers Control Panel */}
      <div style={{
        position: 'absolute',
        top: 16,
        right: 16,
        zIndex: 500,
        background: 'rgba(17, 24, 39, 0.92)',
        backdropFilter: 'blur(12px)',
        border: '1px solid var(--border-glass)',
        borderRadius: 12,
        padding: '10px 14px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        maxWidth: 240
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem', fontWeight: 700, color: '#f8fafc', borderBottom: '1px solid var(--border-glass)', paddingBottom: 6 }}>
          <Layers size={15} color="#06b6d4" />
          <span>GIS Layer Controls</span>
        </div>

        {/* Base Map Selector */}
        <div style={{ display: 'flex', gap: 4 }}>
          <button
            onClick={() => setActiveBaseMap('satellite')}
            style={{
              flex: 1,
              padding: '4px 6px',
              fontSize: '0.72rem',
              fontWeight: 600,
              borderRadius: 6,
              border: 'none',
              cursor: 'pointer',
              background: activeBaseMap === 'satellite' ? '#0284c7' : 'rgba(255,255,255,0.06)',
              color: '#fff'
            }}
          >
            Satellite
          </button>
          <button
            onClick={() => setActiveBaseMap('topo')}
            style={{
              flex: 1,
              padding: '4px 6px',
              fontSize: '0.72rem',
              fontWeight: 600,
              borderRadius: 6,
              border: 'none',
              cursor: 'pointer',
              background: activeBaseMap === 'topo' ? '#0284c7' : 'rgba(255,255,255,0.06)',
              color: '#fff'
            }}
          >
            Terrain Topo
          </button>
          <button
            onClick={() => setActiveBaseMap('osm')}
            style={{
              flex: 1,
              padding: '4px 6px',
              fontSize: '0.72rem',
              fontWeight: 600,
              borderRadius: 6,
              border: 'none',
              cursor: 'pointer',
              background: activeBaseMap === 'osm' ? '#0284c7' : 'rgba(255,255,255,0.06)',
              color: '#fff'
            }}
          >
            OSM Map
          </button>
        </div>

        {/* Layer Checkboxes */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: '0.78rem', color: '#cbd5e1' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
            <input type="checkbox" checked={visibleLayers.zones} onChange={() => toggleLayer('zones')} />
            <span>Risk Zones (AI Susceptibility)</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
            <input type="checkbox" checked={visibleLayers.facilities} onChange={() => toggleLayer('facilities')} />
            <span>Hospitals & Safe Shelters</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
            <input type="checkbox" checked={visibleLayers.roads} onChange={() => toggleLayer('roads')} />
            <span>Lifeline Roads (NH-6 / NH-206)</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
            <input type="checkbox" checked={visibleLayers.reports} onChange={() => toggleLayer('reports')} />
            <span>Citizen Field Reports ({reports.length})</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', color: '#67e8f9' }}>
            <input type="checkbox" checked={visibleLayers.radar} onChange={() => toggleLayer('radar')} />
            <span>🌧️ Live Rainfall Radar</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', color: '#93c5fd' }}>
            <input type="checkbox" checked={visibleLayers.flood} onChange={() => toggleLayer('flood')} />
            <span>🌊 Flash Flood Risk</span>
          </label>

          {/* My Location Button */}
          <button
            id="locate-me-btn"
            onClick={handleLocateMe}
            disabled={isLocating}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              marginTop: 4,
              background: userLocation ? 'rgba(6, 182, 212, 0.15)' : 'rgba(255,255,255,0.06)',
              color: userLocation ? '#06b6d4' : '#94a3b8',
              border: `1px solid ${userLocation ? 'rgba(6,182,212,0.4)' : 'var(--border-glass)'}`,
              borderRadius: 8, padding: '5px 10px',
              fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', width: '100%'
            }}
          >
            <LocateFixed size={13} />
            <span>{isLocating ? 'Locating...' : userLocation ? '📍 Location Found' : '📍 My Location'}</span>
          </button>
        </div>
      </div>

      {/* Map Legend */}
      <div style={{
        position: 'absolute',
        bottom: 16,
        left: 16,
        zIndex: 500,
        background: 'rgba(17, 24, 39, 0.92)',
        backdropFilter: 'blur(12px)',
        border: '1px solid var(--border-glass)',
        borderRadius: 12,
        padding: '10px 14px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        fontSize: '0.78rem'
      }}>
        <div style={{ fontWeight: 700, color: '#f8fafc', marginBottom: 2 }}>Landslide Hazard Level</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 12, height: 12, borderRadius: 3, background: '#ef4444' }}></span>
          <span style={{ color: '#fca5a5' }}>Critical Risk (&gt;80%)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 12, height: 12, borderRadius: 3, background: '#f97316' }}></span>
          <span style={{ color: '#fdba74' }}>High Warning (60-79%)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 12, height: 12, borderRadius: 3, background: '#f59e0b' }}></span>
          <span style={{ color: '#fde68a' }}>Medium Advisory (35-59%)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 12, height: 12, borderRadius: 3, background: '#10b981' }}></span>
          <span style={{ color: '#6ee7b7' }}>Low Susceptibility (&lt;35%)</span>
        </div>
      </div>

      {/* Leaflet Map Component */}
      <MapContainer
        center={[25.4200, 91.8000]}
        zoom={10}
        style={{ width: '100%', height: '100%' }}
        zoomControl={false}
      >
        <MapController userLocation={userLocation} />
        {activeBaseMap === 'satellite' && (
          <TileLayer
            attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            maxZoom={18}
          />
        )}
        {activeBaseMap === 'topo' && (
          <TileLayer
            attribution='Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community'
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}"
            maxZoom={18}
          />
        )}
        {activeBaseMap === 'osm' && (
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            maxZoom={19}
          />
        )}

        {/* Live Rainfall Radar Overlay */}
        {visibleLayers.radar && (
          <TileLayer
            url="https://tilecache.rainviewer.com/v2/coverage/0/256/{z}/{x}/{y}/2/1_1.png"
            opacity={0.6}
            zIndex={400}
          />
        )}

        {/* 1. Risk Polygons */}
        {visibleLayers.zones && zones.map(zone => {
          if (!zone.geometry || !zone.geometry.coordinates || !Array.isArray(zone.geometry.coordinates)) return null;
          // Leaflet expects [lat, lon], GeoJSON has [lon, lat]
          const ring = Array.isArray(zone.geometry.coordinates[0]) ? zone.geometry.coordinates[0] : zone.geometry.coordinates;
          const latLngs = ring
            .filter(coord => Array.isArray(coord) && coord.length >= 2)
            .map(coord => [coord[1], coord[0]]);

          if (latLngs.length === 0) return null;
          const color = getZoneColor(zone.risk_level);
          const isSelected = selectedZone && selectedZone.id === zone.id;

          return (
            <Polygon
              key={zone.id}
              positions={latLngs}
              pathOptions={{
                color: isSelected ? '#38bdf8' : color,
                weight: isSelected ? 3.5 : 2,
                fillColor: color,
                fillOpacity: isSelected ? 0.65 : 0.42,
                dashArray: isSelected ? '4, 4' : null
              }}
              eventHandlers={{
                click: () => onSelectZone(zone)
              }}
            >
              <Popup>
                <div style={{ minWidth: 200, color: '#f8fafc' }}>
                  <div style={{ fontWeight: 800, fontSize: '0.95rem', marginBottom: 4 }}>{zone.name}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                    <span style={{
                      background: color,
                      color: '#fff',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: 4
                    }}>
                      {zone.risk_level} ({zone.risk_score}%)
                    </span>
                    <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Slope: {zone.base_slope_deg}°</span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#cbd5e1', marginBottom: 6 }}>
                    <div>🌧️ 24h Rain: <strong>{zone.rainfall_24h} mm</strong></div>
                    <div>💧 Soil Saturation: <strong>{zone.soil_moisture_pct}%</strong></div>
                  </div>
                  <button
                    onClick={() => onSelectZone(zone)}
                    style={{
                      width: '100%',
                      background: '#0284c7',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 6,
                      padding: '4px 8px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Inspect AI Analysis →
                  </button>
                </div>
              </Popup>
            </Polygon>
          );
        })}

        {/* 2. Lifeline Road Networks */}
        {visibleLayers.roads && roads.map(road => {
          if (!road.coordinates || road.coordinates.length === 0) return null;
          const polyCoords = road.coordinates.map(pt => [pt[1], pt[0]]);
          return (
            <Polyline
              key={road.id}
              positions={polyCoords}
              pathOptions={{
                color: road.vulnerability.includes('Critical') ? '#f43f5e' : '#38bdf8',
                weight: 3.5,
                opacity: 0.85
              }}
            >
              <Popup>
                <div style={{ color: '#fff' }}>
                  <strong>{road.name}</strong>
                  <div style={{ fontSize: '0.78rem', color: '#cbd5e1' }}>Category: {road.category}</div>
                  <div style={{ fontSize: '0.78rem', color: '#fca5a5' }}>Vulnerability: {road.vulnerability}</div>
                </div>
              </Popup>
            </Polyline>
          );
        })}

        {/* 3. Hospitals & Safe Shelters */}
        {visibleLayers.facilities && facilities.map(fac => {
          if (!fac.latitude || !fac.longitude) return null;
          const isHospital = fac.type === 'hospital';
          return (
            <Marker
              key={fac.id}
              position={[fac.latitude, fac.longitude]}
              icon={isHospital ? hospitalIcon : shelterIcon}
            >
              <Popup>
                <div style={{ color: '#fff' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{fac.name}</div>
                  <div style={{ fontSize: '0.78rem', color: '#06b6d4', fontWeight: 600 }}>{fac.category}</div>
                  <div style={{ fontSize: '0.78rem', color: '#cbd5e1', marginTop: 4 }}>
                    Capacity: <strong>{fac.capacity} {isHospital ? 'Beds' : 'Persons'}</strong>
                  </div>
                  {fac.contact && (
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Contact: {fac.contact}</div>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* 4. Citizen Field Reports */}
        {visibleLayers.reports && reports.map(rep => {
          if (!rep.latitude || !rep.longitude) return null;
          return (
            <Marker
              key={rep.id}
              position={[rep.latitude, rep.longitude]}
              icon={reportIcon}
            >
              <Popup>
                <div style={{ maxWidth: 220, color: '#fff' }}>
                  <div style={{ fontWeight: 700, color: '#f59e0b', fontSize: '0.85rem' }}>
                    📸 Field Report: {rep.hazard_type}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: 4 }}>
                    Severity: <strong style={{ color: '#fca5a5' }}>{rep.severity}</strong> • By: {rep.reporter_name}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#e2e8f0', marginBottom: 6 }}>
                    {rep.description}
                  </div>
                  {rep.photo_data_url && (
                    <img 
                      src={rep.photo_data_url} 
                      alt="Hazard capture" 
                      style={{ width: '100%', height: 100, objectFit: 'cover', borderRadius: 6, marginBottom: 4 }} 
                    />
                  )}
                  <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                    Status: <span style={{ color: rep.status === 'verified' ? '#34d399' : '#fbbf24' }}>{rep.status.toUpperCase()}</span>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
        {/* 5. My Location Pin */}
        {userLocation && (
          <>
            <CircleMarker
              center={[userLocation.lat, userLocation.lon]}
              radius={10}
              pathOptions={{ color: '#06b6d4', fillColor: '#06b6d4', fillOpacity: 0.35, weight: 3 }}
            >
              <Popup>
                <div style={{ color: '#fff', fontWeight: 700 }}>📍 You are here</div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{userLocation.lat.toFixed(5)}, {userLocation.lon.toFixed(5)}</div>
              </Popup>
            </CircleMarker>
            <CircleMarker
              center={[userLocation.lat, userLocation.lon]}
              radius={18}
              pathOptions={{ color: '#06b6d4', fillColor: 'transparent', fillOpacity: 0, weight: 1.5, dashArray: '4,4' }}
            />
          </>
        )}
        {/* 6. Active Emergency SOS Beacon Distress Markers */}
        {sosEvents.map(sos => (
          <CircleMarker
            key={`sos-${sos.id}`}
            center={[sos.lat, sos.lon]}
            radius={16}
            pathOptions={{ color: '#ef4444', fillColor: '#ef4444', fillOpacity: 0.6, weight: 3 }}
          >
            <Popup>
              <div style={{ color: '#fff', minWidth: 180 }}>
                <div style={{ color: '#fca5a5', fontWeight: 900, fontSize: '0.9rem' }}>🆘 SOS DISTRESS BEACON</div>
                <div style={{ fontSize: '0.8rem', marginTop: 4 }}><strong>By:</strong> {sos.reporter_name}</div>
                {sos.contact && <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Contact: {sos.contact}</div>}
                <div style={{ fontSize: '0.78rem', color: '#f8fafc', margin: '4px 0' }}>{sos.message}</div>
                <button
                  onClick={() => {
                    fetch(`/api/sos/beacon/${sos.id}/acknowledge`, { method: 'PUT' })
                      .then(() => setSosEvents(prev => prev.filter(s => s.id !== sos.id)));
                  }}
                  style={{
                    background: '#10b981', color: '#fff', border: 'none', borderRadius: 6,
                    padding: '4px 8px', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer', width: '100%', marginTop: 4
                  }}
                >
                  ✓ Acknowledge & Dispatch
                </button>
              </div>
            </Popup>
          </CircleMarker>
        ))}

        {/* 7. Flash Flood Risk Overlay Circles */}
        {visibleLayers.flood && floodZones.map(fz => (
          <CircleMarker
            key={`flood-${fz.zone_id}`}
            center={[fz.lat, fz.lon]}
            radius={fz.flood_risk_score ? Math.max(12, fz.flood_risk_score / 3) : 15}
            pathOptions={{
              color: fz.flood_risk_level === 'Critical' ? '#2563eb' : '#60a5fa',
              fillColor: '#3b82f6',
              fillOpacity: 0.45,
              weight: 2
            }}
          >
            <Popup>
              <div style={{ color: '#fff' }}>
                <div style={{ fontWeight: 800, color: '#93c5fd' }}>🌊 Flash Flood Risk: {fz.zone_name}</div>
                <div style={{ fontSize: '0.8rem', marginTop: 4 }}>Score: <strong>{fz.flood_risk_score}%</strong> ({fz.flood_risk_level})</div>
              </div>
            </Popup>
          </CircleMarker>
        ))}

        {/* 8. Historical Heatmap Event Points */}
        {historyPoints.map((hp, i) => (
          <CircleMarker
            key={`hp-${i}`}
            center={[hp.lat, hp.lon]}
            radius={8}
            pathOptions={{
              color: hp.intensity > 0.8 ? '#7c3aed' : '#f97316',
              fillColor: hp.intensity > 0.8 ? '#a855f7' : '#fb923c',
              fillOpacity: hp.intensity * 0.7,
              weight: 1
            }}
          />
        ))}
      </MapContainer>
    </div>
  );
}

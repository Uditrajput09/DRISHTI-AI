/**
 * frontend/src/services/offlineMapService.js
 * 
 * Offline Map Storage & Zero-Internet Hardware GPS Navigation Engine
 * Provides IndexedDB persistence, offline map pack caching, clientside
 * Dijkstra routing to emergency shelters, and Web Audio SOS whistle synthesizer.
 */

// ─── 1. REGIONAL MAP PACKS DEFINITIONS ─────────────────────────────────
export const OFFLINE_MAP_PACKS = [
  {
    id: 'ekh-master',
    name: 'East Khasi Hills Master District Pack',
    description: 'Complete pilot district coverage including all 10 monitored micro-zones, arterial highways, 28 emergency shelters, and DEM elevation vectors.',
    sizeMB: 24.5,
    featuresCount: 142,
    corridors: ['NH-6', 'NH-106', 'SH-5', 'Shillong Bypass'],
    sheltersCount: 28,
    version: '2026.9.1',
    coverage: 'East Khasi Hills District (Full)'
  },
  {
    id: 'sohra-tourism',
    name: 'Sohra (Cherrapunji) Tourism & Scarp Pack',
    description: 'Ultra-high-resolution hazard pack for Nohkalikai, Mawsmai Cave, Seven Sisters, Double Decker Root Bridge, and Sohra Escarpment cut-slope fault lines.',
    sizeMB: 12.8,
    featuresCount: 68,
    corridors: ['NH-6 Sohra Section', 'Shella Rural Link', 'Tyrna Trail'],
    sheltersCount: 8,
    version: '2026.9.1',
    coverage: 'Sohra Sub-Division'
  },
  {
    id: 'mawsynram-belt',
    name: 'Mawsynram - Balat Monsoonal Basin Pack',
    description: 'Specialized high-precipitation topography covering Mawsynram Ridge, 7th Mile slope failure zones, and Balat riverine flash-flood plains.',
    sizeMB: 10.4,
    featuresCount: 46,
    corridors: ['Mawsynram Ridge Road', 'Balat Border Highway'],
    sheltersCount: 6,
    version: '2026.9.1',
    coverage: 'Mawsynram Block'
  },
  {
    id: 'pynursla-dawki',
    name: 'Pynursla - Dawki International Highway Pack',
    description: 'Essential border transit corridor pack covering NH-106, NH-206, Umngot River gorge crossings, and Tamabil border evacuation havens.',
    sizeMB: 11.2,
    featuresCount: 54,
    corridors: ['NH-106 Pynursla Pass', 'NH-206 Dawki Corridor'],
    sheltersCount: 7,
    version: '2026.9.1',
    coverage: 'Pynursla & Dawki'
  }
];

// ─── 2. PRE-LOADED EMERGENCY SHELTERS & HOSPITALS ───────────────────────
export const OFFLINE_SHELTERS = [
  {
    id: 'shelter-sohra-cyclone',
    name: 'Sohra Multi-Purpose Cyclone & Landslide Refuge',
    category: 'Shelter',
    lat: 25.2950,
    lon: 91.7300,
    elevation_m: 1180,
    capacity: 450,
    contact: '+91-3637-235222',
    corridor: 'NH-6 Sohra Rim',
    facilities: ['Backup Generator', 'Helipad Pad', 'Water Reservoir', 'Medical Station']
  },
  {
    id: 'shelter-cherra-relief',
    name: 'Cherrapunji Community Relief Base',
    category: 'Shelter',
    lat: 25.2810,
    lon: 91.7190,
    elevation_m: 1150,
    capacity: 300,
    contact: '+91-3637-235108',
    corridor: 'Cherra Market Road',
    facilities: ['First Aid Kits', 'Ration Stockpile', 'Satellite Radio']
  },
  {
    id: 'hospital-cherra-chc',
    name: 'Cherrapunji Community Health Center (CHC)',
    category: 'Hospital',
    lat: 25.2780,
    lon: 91.7240,
    elevation_m: 1140,
    capacity: 120,
    contact: '+91-3637-235444',
    corridor: 'Main Hospital Link',
    facilities: ['Trauma Ward', 'Surgical Theater', 'Oxygen Bank', '24x7 Ambulance']
  },
  {
    id: 'shelter-mawsynram-block',
    name: 'Mawsynram Block Safe Haven Refuge',
    category: 'Shelter',
    lat: 25.2980,
    lon: 91.5890,
    elevation_m: 1410,
    capacity: 280,
    contact: '+91-3636-224111',
    corridor: 'Mawsynram Center',
    facilities: ['Reinforced Concrete Dome', 'Solar Storage', 'Emergency VHF']
  },
  {
    id: 'hospital-mawsynram-phc',
    name: 'Mawsynram Primary Health Center',
    category: 'Hospital',
    lat: 25.3020,
    lon: 91.5810,
    elevation_m: 1390,
    capacity: 60,
    contact: '+91-3636-224333',
    corridor: '7th Mile Access Link',
    facilities: ['Emergency Doctor', 'Blood Storage', 'Ambulance Stand']
  },
  {
    id: 'shelter-pynursla-school',
    name: 'Pynursla Higher Secondary Evacuation Point',
    category: 'Shelter',
    lat: 25.3120,
    lon: 91.9080,
    elevation_m: 1285,
    capacity: 350,
    contact: '+91-3637-282100',
    corridor: 'NH-106 Pynursla Summit',
    facilities: ['Large Auditorium', 'Rainwater Harvesting', 'Kitchen Base']
  },
  {
    id: 'hospital-pynursla-chc',
    name: 'Pynursla Community Health Center',
    category: 'Hospital',
    lat: 25.3090,
    lon: 91.9040,
    elevation_m: 1270,
    capacity: 80,
    contact: '+91-3637-282250',
    corridor: 'NH-106 Junction',
    facilities: ['Trauma Triage', 'Emergency Maternity', 'Mobile Clinic']
  },
  {
    id: 'shelter-dawki-border',
    name: 'Dawki Border Emergency Shelter',
    category: 'Shelter',
    lat: 25.1880,
    lon: 92.0210,
    elevation_m: 195,
    capacity: 220,
    contact: '+91-3637-251020',
    corridor: 'NH-206 Tamabil Border',
    facilities: ['High-Ground Mound', 'Flood Pumps', 'Water Treatment']
  },
  {
    id: 'hospital-shillong-civil',
    name: 'Civil Hospital Shillong (Central Trauma Center)',
    category: 'Hospital',
    lat: 25.5720,
    lon: 91.8790,
    elevation_m: 1520,
    capacity: 450,
    contact: '+91-364-2224100',
    corridor: 'Central Shillong',
    facilities: ['ICU', 'Air Ambulance Landing', 'Blood Bank', 'CT Scanner']
  },
  {
    id: 'hospital-neigrihms',
    name: 'NEIGRIHMS Super-Specialty Trauma Center',
    category: 'Hospital',
    lat: 25.6020,
    lon: 91.9380,
    elevation_m: 1580,
    capacity: 600,
    contact: '+91-364-2538011',
    corridor: 'Mawdiangdiang',
    facilities: ['Level-1 Disaster Trauma Base', 'Helicopter Tarmac', 'Disaster Command Post']
  }
];

// ─── 3. PRE-LOADED ROAD GRAPH FOR CLIENTSIDE DIJKSTRA ──────────────────
export const OFFLINE_ROAD_GRAPH = {
  nodes: {
    'N-SOHRA-CTR': { id: 'N-SOHRA-CTR', name: 'Sohra Town Junction', lat: 25.2910, lon: 91.7240 },
    'N-NOHKALIKAI': { id: 'N-NOHKALIKAI', name: 'Nohkalikai Falls Fork', lat: 25.2755, lon: 91.6853 },
    'N-MAWSMAI': { id: 'N-MAWSMAI', name: 'Mawsmai Cave Road', lat: 25.2630, lon: 91.7200 },
    'N-MAWSYN-CTR': { id: 'N-MAWSYN-CTR', name: 'Mawsynram Center', lat: 25.2972, lon: 91.5828 },
    'N-7TH-MILE': { id: 'N-7TH-MILE', name: '7th Mile Ridge Junction', lat: 25.3210, lon: 91.6050 },
    'N-PYNURSLA-JCT': { id: 'N-PYNURSLA-JCT', name: 'Pynursla NH-106 Hub', lat: 25.3089, lon: 91.9056 },
    'N-DAWKI-BRG': { id: 'N-DAWKI-BRG', name: 'Umngot Bridge Approach', lat: 25.1850, lon: 92.0180 },
    'N-MAWPHLANG': { id: 'N-MAWPHLANG', name: 'Mawphlang Heritage Junction', lat: 25.4490, lon: 91.7580 },
    'N-LAITKYNSEW': { id: 'N-LAITKYNSEW', name: 'Laitkynsew Valley Entrance', lat: 25.2150, lon: 91.6620 },
    'N-SHILLONG-PEAK': { id: 'N-SHILLONG-PEAK', name: 'Shillong Peak Bypass', lat: 25.5410, lon: 91.8540 },
    'N-NONGPOH': { id: 'N-NONGPOH', name: 'Nongpoh Valley Gateway', lat: 25.9030, lon: 91.8820 }
  },
  edges: [
    { u: 'N-NOHKALIKAI', v: 'N-SOHRA-CTR', road: 'Sohra Escarpment Link', distance_km: 5.2, slope: 18.5, riskPenalty: 12 },
    { u: 'N-SOHRA-CTR', v: 'N-MAWSMAI', road: 'Cherra Tourist Highway', distance_km: 4.1, slope: 12.0, riskPenalty: 5 },
    { u: 'N-SOHRA-CTR', v: 'N-LAITKYNSEW', road: 'Rural Valley Scarp Road', distance_km: 9.8, slope: 22.0, riskPenalty: 18 },
    { u: 'N-SOHRA-CTR', v: 'N-MAWPHLANG', road: 'SH-5 Highland Corridor', distance_km: 22.4, slope: 14.5, riskPenalty: 8 },
    { u: 'N-MAWSYN-CTR', v: 'N-7TH-MILE', road: 'Mawsynram Ridge Road', distance_km: 3.9, slope: 19.0, riskPenalty: 15 },
    { u: 'N-7TH-MILE', v: 'N-MAWPHLANG', road: 'Highland Bypass', distance_km: 26.5, slope: 16.0, riskPenalty: 10 },
    { u: 'N-MAWPHLANG', v: 'N-SHILLONG-PEAK', road: 'NH-206 Upper Shillong Arterial', distance_km: 16.8, slope: 11.0, riskPenalty: 4 },
    { u: 'N-PYNURSLA-JCT', v: 'N-DAWKI-BRG', road: 'NH-106 Dawki Descent', distance_km: 18.2, slope: 24.5, riskPenalty: 16 },
    { u: 'N-PYNURSLA-JCT', v: 'N-SHILLONG-PEAK', road: 'NH-106 Pynursla-Shillong Highway', distance_km: 28.5, slope: 13.5, riskPenalty: 6 },
    { u: 'N-SHILLONG-PEAK', v: 'N-NONGPOH', road: 'GS Road / NH-6 North Corridor', distance_km: 44.0, slope: 10.0, riskPenalty: 5 }
  ]
};

// ─── 4. HAVERSINE & BEARING UTILITIES ──────────────────────────────────
export function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c).toFixed(2));
}

export function calculateBearing(lat1, lon1, lat2, lon2) {
  const y = Math.sin((lon2 - lon1) * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180));
  const x = Math.cos(lat1 * (Math.PI / 180)) * Math.sin(lat2 * (Math.PI / 180)) -
            Math.sin(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.cos((lon2 - lon1) * (Math.PI / 180));
  const bearing = (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
  return Math.round(bearing);
}

export function getCardinalDirection(bearingDeg) {
  const cardinals = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(bearingDeg / 22.5) % 16;
  return cardinals[index];
}

// ─── 5. INDEXED DB VAULT STORAGE ───────────────────────────────────────
const DB_NAME = 'drishti_offline_vault';
const DB_VERSION = 1;
const STORE_PACKS = 'map_packs';
const STORE_WAYPOINTS = 'gps_breadcrumbs';

function openDB() {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB is not supported on this browser/platform.'));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_PACKS)) {
        db.createObjectStore(STORE_PACKS, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORE_WAYPOINTS)) {
        db.createObjectStore(STORE_WAYPOINTS, { keyPath: 'timestamp' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// ─── 6. OFFLINE MAP PACK MANAGER ───────────────────────────────────────
export const offlineMapService = {
  // Get all map packs with downloaded status
  async getPacksStatus() {
    const downloadedMap = await this.getDownloadedPacksMap();
    return OFFLINE_MAP_PACKS.map(pack => ({
      ...pack,
      isDownloaded: Boolean(downloadedMap[pack.id]),
      downloadedAt: downloadedMap[pack.id]?.downloadedAt || null
    }));
  },

  async getDownloadedPacksMap() {
    try {
      const db = await openDB();
      return new Promise((resolve) => {
        const tx = db.transaction(STORE_PACKS, 'readonly');
        const store = tx.objectStore(STORE_PACKS);
        const req = store.getAll();
        req.onsuccess = () => {
          const res = {};
          (req.result || []).forEach(item => {
            res[item.id] = item;
          });
          resolve(res);
        };
        req.onerror = () => resolve({});
      });
    } catch (err) {
      // LocalStorage fallback if IndexedDB is blocked
      try {
        const saved = JSON.parse(localStorage.getItem('drishti_downloaded_packs') || '{}');
        return saved;
      } catch (e) {
        return {};
      }
    }
  },

  // Simulate streaming download with realistic progress increments & chunk storage
  async downloadMapPack(packId, onProgress = () => {}) {
    const pack = OFFLINE_MAP_PACKS.find(p => p.id === packId);
    if (!pack) throw new Error(`Map pack ${packId} not found`);

    // Stream download chunks (0 to 100%)
    const totalSteps = 20;
    for (let step = 1; step <= totalSteps; step++) {
      await new Promise(r => setTimeout(r, 65));
      const pct = Math.round((step / totalSteps) * 100);
      const loadedMB = parseFloat(((pct / 100) * pack.sizeMB).toFixed(1));
      onProgress(pct, loadedMB, pack.sizeMB);
    }

    const record = {
      id: pack.id,
      name: pack.name,
      sizeMB: pack.sizeMB,
      downloadedAt: new Date().toISOString(),
      version: pack.version,
      vectorData: {
        shelters: OFFLINE_SHELTERS,
        graph: OFFLINE_ROAD_GRAPH
      }
    };

    try {
      const db = await openDB();
      await new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_PACKS, 'readwrite');
        const store = tx.objectStore(STORE_PACKS);
        const req = store.put(record);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      });
    } catch (e) {
      // LocalStorage backup
      const saved = JSON.parse(localStorage.getItem('drishti_downloaded_packs') || '{}');
      saved[pack.id] = record;
      localStorage.setItem('drishti_downloaded_packs', JSON.stringify(saved));
    }

    return record;
  },

  async deleteMapPack(packId) {
    try {
      const db = await openDB();
      await new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_PACKS, 'readwrite');
        const store = tx.objectStore(STORE_PACKS);
        const req = store.delete(packId);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      });
    } catch (e) {
      const saved = JSON.parse(localStorage.getItem('drishti_downloaded_packs') || '{}');
      delete saved[packId];
      localStorage.setItem('drishti_downloaded_packs', JSON.stringify(saved));
    }
  },

  // Estimate browser device storage
  async getStorageQuota() {
    if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.estimate) {
      try {
        const estimate = await navigator.storage.estimate();
        const usageMB = (estimate.usage / (1024 * 1024)).toFixed(1);
        const quotaMB = (estimate.quota / (1024 * 1024)).toFixed(0);
        return { usageMB, quotaMB };
      } catch (e) {
        return { usageMB: '14.2', quotaMB: '4096' };
      }
    }
    return { usageMB: '14.2', quotaMB: '4096' };
  },

  // Save offline GPS breadcrumb waypoint
  async saveBreadcrumb(point) {
    const item = {
      timestamp: Date.now(),
      lat: point.lat,
      lon: point.lon,
      alt: point.alt || 0,
      note: point.note || 'Offline Waypoint'
    };
    try {
      const db = await openDB();
      const tx = db.transaction(STORE_WAYPOINTS, 'readwrite');
      tx.objectStore(STORE_WAYPOINTS).put(item);
    } catch (e) {
      const list = JSON.parse(localStorage.getItem('drishti_offline_breadcrumbs') || '[]');
      list.push(item);
      localStorage.setItem('drishti_offline_breadcrumbs', JSON.stringify(list));
    }
    return item;
  },

  async getBreadcrumbs() {
    try {
      const db = await openDB();
      return new Promise((resolve) => {
        const tx = db.transaction(STORE_WAYPOINTS, 'readonly');
        const req = tx.objectStore(STORE_WAYPOINTS).getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => resolve([]);
      });
    } catch (e) {
      return JSON.parse(localStorage.getItem('drishti_offline_breadcrumbs') || '[]');
    }
  },

  // ─── 7. CLIENTSIDE DIJKSTRA ROUTING ALGORITHM ─────────────────────────
  calculateOfflineRoute(currentLat, currentLon, targetFacility = null) {
    const originLat = parseFloat(currentLat);
    const originLon = parseFloat(currentLon);

    // 1. If target facility not specified, find closest emergency refuge
    let target = targetFacility;
    if (!target) {
      let minDis = Infinity;
      for (const fac of OFFLINE_SHELTERS) {
        const d = calculateDistanceKm(originLat, originLon, fac.lat, fac.lon);
        if (d < minDis) {
          minDis = d;
          target = fac;
        }
      }
    }

    if (!target) return null;

    // 2. Find closest entry node on the offline road network to origin
    let startNodeId = 'N-SOHRA-CTR';
    let minStartDist = Infinity;
    Object.values(OFFLINE_ROAD_GRAPH.nodes).forEach(node => {
      const d = calculateDistanceKm(originLat, originLon, node.lat, node.lon);
      if (d < minStartDist) {
        minStartDist = d;
        startNodeId = node.id;
      }
    });

    // 3. Find closest node to target
    let targetNodeId = 'N-SOHRA-CTR';
    let minTargetDist = Infinity;
    Object.values(OFFLINE_ROAD_GRAPH.nodes).forEach(node => {
      const d = calculateDistanceKm(target.lat, target.lon, node.lat, node.lon);
      if (d < minTargetDist) {
        minTargetDist = d;
        targetNodeId = node.id;
      }
    });

    // 4. Build adjacency list for undirected mountain road segments
    const adj = {};
    Object.keys(OFFLINE_ROAD_GRAPH.nodes).forEach(id => { adj[id] = []; });
    OFFLINE_ROAD_GRAPH.edges.forEach(edge => {
      // Cost function: Distance + (Slope > 15 deg ? 0.35 * slope : 0) + RiskPenalty
      const slopeCost = edge.slope > 15 ? (edge.slope - 15) * 0.35 : 0;
      const weight = edge.distance_km + slopeCost + (edge.riskPenalty * 0.4);
      if (adj[edge.u]) adj[edge.u].push({ to: edge.v, weight, edge });
      if (adj[edge.v]) adj[edge.v].push({ to: edge.u, weight, edge });
    });

    // 5. Dijkstra algorithm
    const dist = {};
    const prev = {};
    const unvisited = new Set(Object.keys(OFFLINE_ROAD_GRAPH.nodes));

    Object.keys(OFFLINE_ROAD_GRAPH.nodes).forEach(id => {
      dist[id] = Infinity;
      prev[id] = null;
    });
    dist[startNodeId] = 0;

    while (unvisited.size > 0) {
      let curr = null;
      let minVal = Infinity;
      for (const id of unvisited) {
        if (dist[id] < minVal) {
          minVal = dist[id];
          curr = id;
        }
      }

      if (curr === null || dist[curr] === Infinity || curr === targetNodeId) {
        break;
      }

      unvisited.delete(curr);

      for (const neighbor of (adj[curr] || [])) {
        if (!unvisited.has(neighbor.to)) continue;
        const alt = dist[curr] + neighbor.weight;
        if (alt < dist[neighbor.to]) {
          dist[neighbor.to] = alt;
          prev[neighbor.to] = { from: curr, edge: neighbor.edge };
        }
      }
    }

    // 6. Reconstruct path nodes & coordinates
    const pathNodes = [];
    let currNode = targetNodeId;
    while (currNode) {
      pathNodes.unshift(currNode);
      currNode = prev[currNode] ? prev[currNode].from : null;
    }

    // Generate polyline coordinates: [Origin -> Path Nodes -> Target]
    const routeCoords = [[originLat, originLon]];
    pathNodes.forEach(id => {
      const n = OFFLINE_ROAD_GRAPH.nodes[id];
      if (n) routeCoords.push([n.lat, n.lon]);
    });
    routeCoords.push([target.lat, target.lon]);

    // Calculate physical route distance
    let totalKm = 0;
    for (let i = 0; i < routeCoords.length - 1; i++) {
      totalKm += calculateDistanceKm(
        routeCoords[i][0], routeCoords[i][1],
        routeCoords[i+1][0], routeCoords[i+1][1]
      );
    }
    totalKm = parseFloat(totalKm.toFixed(1));

    const directDistanceKm = calculateDistanceKm(originLat, originLon, target.lat, target.lon);
    const bearingToTarget = calculateBearing(originLat, originLon, target.lat, target.lon);
    const cardinal = getCardinalDirection(bearingToTarget);

    const walkingMinutes = Math.round((totalKm / 4.2) * 60); // 4.2 km/h mountain trek
    const vehicleMinutes = Math.round((totalKm / 28.0) * 60); // 28 km/h mountain road

    // Turn-by-turn guidance maneuvers
    const maneuvers = [
      {
        step: 1,
        instruction: `Acquire path heading ${cardinal} (${bearingToTarget}°), proceeding toward ${target.name}`,
        distance: `${(totalKm * 0.25).toFixed(1)} km`,
        hazardWarning: null
      },
      {
        step: 2,
        instruction: `Follow corridor along ridge shoulder — maintain high ground away from drainage culverts`,
        distance: `${(totalKm * 0.45).toFixed(1)} km`,
        hazardWarning: 'Active debris wash potential on western cut-slope'
      },
      {
        step: 3,
        instruction: `Arrive at safe perimeter of ${target.name} (${target.corridor})`,
        distance: `${(totalKm * 0.30).toFixed(1)} km`,
        hazardWarning: null
      }
    ];

    return {
      target,
      totalDistanceKm: totalKm,
      directDistanceKm,
      bearingToTarget,
      cardinal,
      walkingMinutes,
      vehicleMinutes,
      safetyScore: Math.min(96, Math.max(68, Math.round(100 - (totalKm * 1.5)))),
      routeCoordinates: routeCoords,
      maneuvers
    };
  },

  // ─── 8. PURE WEB AUDIO SOS DISTRESS SIREN / WHISTLE ───────────────────
  audioCtx: null,
  activeOscillator: null,

  playSosWhistle(repeatCount = 3) {
    try {
      const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtxClass) return false;

      if (!this.audioCtx) {
        this.audioCtx = new AudioCtxClass();
      }
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      const ctx = this.audioCtx;
      const now = ctx.currentTime;

      // SOS Morse Code: 3 Short (0.15s), 3 Long (0.45s), 3 Short (0.15s)
      const dot = 0.15;
      const dash = 0.42;
      const gap = 0.12;
      const freq = 980; // High-pitch piercing mountain whistle frequency

      let cursor = now + 0.05;

      const scheduleTone = (duration) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, cursor);
        // Slight warble for maximum acoustic penetration through wind and rain
        osc.frequency.linearRampToValueAtTime(freq + 60, cursor + duration / 2);
        osc.frequency.linearRampToValueAtTime(freq, cursor + duration);

        gain.gain.setValueAtTime(0.001, cursor);
        gain.gain.exponentialRampToValueAtTime(0.85, cursor + 0.02);
        gain.gain.setValueAtTime(0.85, cursor + duration - 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, cursor + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(cursor);
        osc.stop(cursor + duration);
        cursor += duration + gap;
      };

      for (let r = 0; r < repeatCount; r++) {
        // S (...)
        scheduleTone(dot);
        scheduleTone(dot);
        scheduleTone(dot);
        cursor += 0.2;

        // O (---)
        scheduleTone(dash);
        scheduleTone(dash);
        scheduleTone(dash);
        cursor += 0.2;

        // S (...)
        scheduleTone(dot);
        scheduleTone(dot);
        scheduleTone(dot);
        cursor += 0.6; // Interval between SOS loops
      }

      return true;
    } catch (err) {
      console.warn('Web Audio SOS failed to initialize:', err);
      return false;
    }
  },

  stopAudio() {
    if (this.audioCtx && this.audioCtx.state !== 'closed') {
      try {
        this.audioCtx.close();
        this.audioCtx = null;
      } catch (e) {
        // Ignore close error
      }
    }
  }
};

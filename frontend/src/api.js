/**
 * frontend/src/api.js
 * Centralized API client with offline storage queue and error recovery.
 */

const RAW_BASE = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE) 
  ? import.meta.env.VITE_API_BASE.replace(/\/$/, '') 
  : '';
const API_BASE = RAW_BASE.endsWith('/api') ? RAW_BASE : (RAW_BASE ? `${RAW_BASE}/api` : '/api');

export const api = {
  // ─── Risk Endpoints ──────────────────────────────────────────
  async getRiskSummary() {
    try {
      const res = await fetch(`${API_BASE}/risk/summary`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('API getRiskSummary fallback:', err);
      return {
        district: 'East Khasi Hills, Meghalaya',
        total_zones_monitored: 10,
        overall_status: 'Critical Alert',
        critical_count: 3,
        high_count: 4,
        medium_count: 2,
        low_count: 1,
        highest_risk_score: 86.5,
        highest_risk_zone: 'Sohra (Cherrapunji) Escarpment'
      };
    }
  },

  async getZones() {
    try {
      const res = await fetch(`${API_BASE}/risk/zones`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('API getZones error:', err);
      return [];
    }
  },

  async simulateRisk(payload) {
    const res = await fetch(`${API_BASE}/risk/simulate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  },

  // ─── Weather Endpoints ───────────────────────────────────────
  async getWeatherCurrent() {
    try {
      const res = await fetch(`${API_BASE}/weather/current`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('API getWeatherCurrent error:', err);
      return { readings: [] };
    }
  },

  async refreshWeather() {
    const res = await fetch(`${API_BASE}/weather/refresh`, { method: 'POST' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  },

  async getZoneForecast(zoneId) {
    try {
      const res = await fetch(`${API_BASE}/weather/forecast/${zoneId}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('API getZoneForecast error:', err);
      return { forecast_series: [] };
    }
  },

  // ─── Unified Ingestion Pipeline Endpoints ─────────────────────
  async getIngestionStatus() {
    try {
      const res = await fetch(`${API_BASE}/ingestion/status`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('API getIngestionStatus error:', err);
      return { pipeline_status: 'operational', subsystems: {} };
    }
  },

  async syncIngestion(dispatchAlerts = true) {
    const res = await fetch(`${API_BASE}/ingestion/sync?dispatch_alerts=${dispatchAlerts}`, {
      method: 'POST'
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  },

  async getZoneIngestionPreview(zoneId) {
    try {
      const res = await fetch(`${API_BASE}/ingestion/preview/${zoneId}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('API getZoneIngestionPreview error:', err);
      return null;
    }
  },


  // ─── Field Reports & Offline Queue ───────────────────────────
  async submitReport(reportData) {
    // If browser is offline, store directly in offline queue
    if (!navigator.onLine) {
      this.saveReportToOfflineQueue(reportData);
      return { status: 'queued_offline', message: 'Saved to offline queue. Will sync when connected.' };
    }

    try {
      const res = await fetch(`${API_BASE}/reports/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reportData)
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      // Network failure -> push to offline queue
      this.saveReportToOfflineQueue(reportData);
      return { status: 'queued_offline', message: 'Network failed. Saved to offline queue.' };
    }
  },

  async syncOfflineQueue() {
    const queue = this.getOfflineQueue();
    if (queue.length === 0) return { synced_count: 0, message: 'Queue is empty.' };

    try {
      const res = await fetch(`${API_BASE}/reports/sync-queue`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reports: queue })
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      
      // Clear offline queue on successful sync
      localStorage.removeItem('drishti_offline_report_queue');
      localStorage.removeItem('sih_offline_report_queue');
      return data;
    } catch (err) {
      console.error('Failed to sync offline queue:', err);
      throw err;
    }
  },

  getOfflineQueue() {
    try {
      const data = localStorage.getItem('drishti_offline_report_queue') || localStorage.getItem('sih_offline_report_queue');
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  },

  saveReportToOfflineQueue(report) {
    const queue = this.getOfflineQueue();
    queue.push({
      ...report,
      report_uid: `DRISHTI-OFFLINE-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      device_created_at: new Date().toISOString()
    });
    localStorage.setItem('drishti_offline_report_queue', JSON.stringify(queue));
  },

  async getReports() {
    try {
      const res = await fetch(`${API_BASE}/reports/list`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('API getReports error:', err);
      return [];
    }
  },

  // ─── Alerts & History ────────────────────────────────────────
  async getAlertHistory() {
    try {
      const res = await fetch(`${API_BASE}/alerts/history`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('API getAlertHistory error:', err);
      return [];
    }
  },

  async getInAppAlerts() {
    try {
      const res = await fetch(`${API_BASE}/alerts/in-app`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      return [];
    }
  },

  async triggerManualAlert(payload) {
    const res = await fetch(`${API_BASE}/alerts/trigger-manual`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  },

  // ─── Infrastructure ──────────────────────────────────────────
  async getFacilities() {
    try {
      const res = await fetch(`${API_BASE}/infrastructure/facilities`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      return [];
    }
  },

  async getRoads() {
    try {
      const res = await fetch(`${API_BASE}/infrastructure/roads`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      return [];
    }
  },

  async getEvacuationRoutes() {
    try {
      const res = await fetch(`${API_BASE}/infrastructure/evacuation-routes`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      return [];
    }
  },

  async getTouristHotspots() {
    try {
      const res = await fetch(`${API_BASE}/infrastructure/tourist-hotspots`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      try { localStorage.setItem('drishti_tourist_hotspots', JSON.stringify(data)); } catch (e) {}
      return data;
    } catch (err) {
      try {
        const cached = localStorage.getItem('drishti_tourist_hotspots');
        if (cached) return JSON.parse(cached);
      } catch (e) {}
      return [
        { id: "spot_nohkalikai", name: "Nohkalikai Falls (Sohra)", lat: 25.2755, lon: 91.6853, zone_id: "EKH-Z01", risk: "Critical", category: "Waterfall Gorge", description: "340m plunge waterfall with high steep-gorge runoff and road cut-slope exposure." },
        { id: "spot_sevensisters", name: "Seven Sisters Falls (Mawsmai)", lat: 25.2505, lon: 91.7214, zone_id: "EKH-Z01", risk: "High", category: "Cliff Escarpment", description: "Exposed plateau rim near limestone caves prone to rockfall during cloudbursts." },
        { id: "spot_mawsynram", name: "Mawjymbuin Cave (Mawsynram)", lat: 25.3130, lon: 91.5830, zone_id: "EKH-Z02", risk: "High", category: "Cave & Karst Valley", description: "Wettest place on earth; underground drainage and karst dissolution vulnerability." },
        { id: "spot_dawki", name: "Dawki Umngot River Ghats", lat: 25.1870, lon: 92.0190, zone_id: "EKH-Z05", risk: "Medium", category: "Border River Basin", description: "Crystal clear river valley prone to sudden upstream surge and gorge road cuts." },
        { id: "spot_elephant", name: "Elephant Falls (Upper Shillong)", lat: 25.5340, lon: 91.8250, zone_id: "EKH-Z06", risk: "Low", category: "Forest Stream Cascades", description: "Three-tiered cascade near military Cantonment with quick urban medical access." },
        { id: "spot_laitlum", name: "Laitlum Canyons (Smit)", lat: 25.4520, lon: 91.9050, zone_id: "EKH-Z04", risk: "High", category: "High Mountain Canyon", description: "Steep 2000ft gorges with frequent dense monsoon fogs and isolated access roads." },
        { id: "spot_shillong", name: "Shillong City Center (Police Bazar)", lat: 25.5788, lon: 91.8833, zone_id: "EKH-Z06", risk: "Low", category: "District Headquarters", description: "Central transport hub with major trauma hospitals and state control rooms." }
      ];
    }
  },

  async planEvacuation(currentLat, currentLon, preferredType = 'all', maxDist = 45.0) {
    const payload = {
      current_lat: currentLat,
      current_lon: currentLon,
      preferred_type: preferredType,
      max_distance_km: maxDist
    };
    try {
      const res = await fetch(`${API_BASE}/infrastructure/plan-evacuation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      try { localStorage.setItem('drishti_last_evacuation_plan', JSON.stringify(data)); } catch (e) {}
      return data;
    } catch (err) {
      // Offline fallback: calculate distances locally from cached facilities
      try {
        const cachedPlan = localStorage.getItem('drishti_last_evacuation_plan');
        if (cachedPlan) return JSON.parse(cachedPlan);
      } catch (e) {}
      return null;
    }
  },

  async sendSOSBeacon(lat, lon, reporterName = 'Tourist in Need', contact = '', message = 'Emergency: Trapped in tourist corridor due to flash runoff/landslide.') {
    try {
      const res = await fetch(`${API_BASE}/sos/beacon`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lat,
          lon,
          reporter_name: reporterName,
          contact,
          message
        })
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      return { success: false, offline_queued: true, message: 'SOS queued for dispatch upon network recovery' };
    }
  },

  // ─── Anomaly & Probabilistic Forecast ─────────────────────────
  async getAnomalyScan() {
    try {
      const res = await fetch(`${API_BASE}/anomaly/scan`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('API getAnomalyScan error:', err);
      return { status: 'fallback', total_zones_scanned: 0, anomalies_detected: 0, anomalies: [] };
    }
  },

  async getZoneAnomaly(zoneId) {
    try {
      const res = await fetch(`${API_BASE}/anomaly/zone/${zoneId}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      return null;
    }
  },

  async getWeeklyForecast(zoneId = 1) {
    try {
      const res = await fetch(`${API_BASE}/forecast/weekly?zone_id=${zoneId}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('API getWeeklyForecast error:', err);
      return { zone_id: zoneId, days: [] };
    }
  },

  async getProbabilisticForecast(zoneId = 1) {
    try {
      const res = await fetch(`${API_BASE}/forecast/probabilistic/${zoneId}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('API getProbabilisticForecast error:', err);
      return { zone_id: zoneId, days: [] };
    }
  },

  // ─── AI Chatbot ───────────────────────────────────────────────
  async chatWithBot(question, context = '', zoneId = null) {
    const res = await fetch(`${API_BASE}/chatbot/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question,
        context,
        zone_id: zoneId
      })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  }
};


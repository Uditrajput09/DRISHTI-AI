/**
 * frontend/src/api.js
 * Centralized API client with offline storage queue and error recovery.
 */

const API_BASE = '/api';

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
      localStorage.removeItem('sih_offline_report_queue');
      return data;
    } catch (err) {
      console.error('Failed to sync offline queue:', err);
      throw err;
    }
  },

  getOfflineQueue() {
    try {
      const data = localStorage.getItem('sih_offline_report_queue');
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  },

  saveReportToOfflineQueue(report) {
    const queue = this.getOfflineQueue();
    queue.push({
      ...report,
      report_uid: `OFFLINE-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      device_created_at: new Date().toISOString()
    });
    localStorage.setItem('sih_offline_report_queue', JSON.stringify(queue));
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
  }
};

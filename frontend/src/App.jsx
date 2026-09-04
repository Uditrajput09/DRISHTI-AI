import React, { useState, useEffect } from 'react';
import TopNavigation from './components/TopNavigation';
import BottomNavigation from './components/BottomNavigation';
import DashboardView from './views/DashboardView';
import RiskIntelligenceView from './views/RiskIntelligenceView';
import ForecastView from './views/ForecastView';
import IncidentsView from './views/IncidentsView';
import AlertsView from './views/AlertsView';
import FieldReportsView from './views/FieldReportsView';
import ProfileView from './views/ProfileView';
import AuthModal from './components/AuthModal';
import AndroidAppModal from './components/AndroidAppModal';
import ChatbotPanel from './components/ChatbotPanel';
import { authService } from './services/authService';
import { api } from './api';

export default function App() {
  // Current user authentication
  const [currentUser, setCurrentUser] = useState(() => authService.getCurrentUser());

  // Primary Application Section: Default to 'gis' (GIS Command Center)
  const [activeSection, setActiveSection] = useState(() => {
    const path = window.location.pathname;
    if (path === '/risk') return 'risk';
    if (path === '/forecast') return 'forecast';
    if (path === '/incidents') return 'incidents';
    if (path === '/alerts') return 'alerts';
    if (path === '/reports') return 'reports';
    if (path === '/profile') return 'profile';
    return 'gis';
  });

  // Data states
  const [summary, setSummary] = useState({});
  const [zones, setZones] = useState([]);
  const [selectedZone, setSelectedZone] = useState(null);
  const [facilities, setFacilities] = useState([]);
  const [roads, setRoads] = useState([]);
  const [reports, setReports] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Modals & Panels
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAndroidModalOpen, setIsAndroidModalOpen] = useState(false);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);

  // Handle URL history state
  const handleSelectSection = (sectionId) => {
    setActiveSection(sectionId);
    const newPath = sectionId === 'gis' ? '/app' : `/${sectionId}`;
    window.history.pushState({}, '', newPath);
  };

  useEffect(() => {
    const handlePopState = () => {
      const p = window.location.pathname.replace('/', '');
      if (['gis', 'risk', 'forecast', 'incidents', 'alerts', 'reports', 'profile'].includes(p)) {
        setActiveSection(p);
      } else {
        setActiveSection('gis');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Fetch all backend telemetry
  const loadAllData = async () => {
    try {
      const [sumRes, zonesRes, facRes, roadsRes, repRes, alertRes] = await Promise.all([
        api.getRiskSummary(),
        api.getZones(),
        api.getFacilities(),
        api.getRoads(),
        api.getReports(),
        api.getAlertHistory()
      ]);

      setSummary(sumRes || {});
      setZones(zonesRes || []);
      setFacilities(facRes || []);
      setRoads(roadsRes || []);
      setReports(repRes || []);
      setAlerts(alertRes || []);

      if (zonesRes && zonesRes.length > 0 && !selectedZone) {
        // Pick the zone with highest risk score as initial selected
        const highest = [...zonesRes].sort((a, b) => (b.risk_score || 0) - (a.risk_score || 0))[0];
        setSelectedZone(highest || zonesRes[0]);
      }
    } catch (err) {
      console.warn('Telemetry polling error:', err);
    }
  };

  useEffect(() => {
    loadAllData();
    const interval = setInterval(loadAllData, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleRefreshAll = async () => {
    setIsRefreshing(true);
    try {
      await api.refreshWeather();
      await loadAllData();
    } catch (err) {
      console.error('Refresh error:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Cross-navigation helpers
  const handleViewZoneOnGIS = (target) => {
    let targetZone = null;
    if (target?.zone_id) {
      targetZone = zones.find(z => z.id === target.zone_id);
    } else if (target?.id) {
      targetZone = zones.find(z => z.id === target.id);
    } else if (target?.zone_name) {
      targetZone = zones.find(z => z.name === target.zone_name);
    }
    if (targetZone) {
      setSelectedZone(targetZone);
    }
    handleSelectSection('gis');
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#070A10',
        color: '#F4F6FB',
        display: 'flex',
        flexDirection: 'column',
        paddingBottom: 70
      }}
    >
      {/* Top Desktop Command Navigation Bar */}
      <TopNavigation
        activeSection={activeSection}
        onSelectSection={handleSelectSection}
        unreadAlertCount={alerts.length > 0 ? alerts.length : 3}
        onOpenAlerts={() => handleSelectSection('alerts')}
        onOpenProfile={() => handleSelectSection('profile')}
        currentUser={currentUser}
        onRefreshData={handleRefreshAll}
        isRefreshing={isRefreshing}
      />

      {/* Main Section Content Router */}
      <main style={{ flex: 1 }}>
        {/* 1. GIS Command Center (Default View) */}
        {activeSection === 'gis' && (
          <DashboardView
            summary={summary}
            zones={zones}
            selectedZone={selectedZone}
            setSelectedZone={setSelectedZone}
            facilities={facilities}
            roads={roads}
            reports={reports}
            alerts={alerts}
            onRefreshAll={handleRefreshAll}
            isRefreshing={isRefreshing}
            onNavigateToSection={handleSelectSection}
          />
        )}

        {/* 2. Risk Intelligence Section */}
        {activeSection === 'risk' && (
          <RiskIntelligenceView
            zones={zones}
            onSelectZone={setSelectedZone}
            onNavigateToGIS={() => handleSelectSection('gis')}
          />
        )}

        {/* 3. 48-Hour Forecast Section */}
        {activeSection === 'forecast' && (
          <ForecastView
            zones={zones}
            selectedZone={selectedZone}
            onSelectZone={setSelectedZone}
          />
        )}

        {/* 4. Live Incident Feed Section */}
        {activeSection === 'incidents' && (
          <IncidentsView
            reports={reports}
            onNavigateToReport={() => handleSelectSection('reports')}
            onLocateOnMap={handleViewZoneOnGIS}
          />
        )}

        {/* 5. Emergency Alerts Center */}
        {activeSection === 'alerts' && (
          <AlertsView
            alerts={alerts}
            onViewZone={handleViewZoneOnGIS}
            onRefreshAlerts={loadAllData}
          />
        )}

        {/* 6. Field Reporting Interface */}
        {activeSection === 'reports' && (
          <FieldReportsView
            onReportSubmitted={loadAllData}
          />
        )}

        {/* 7. User Profile / Settings */}
        {activeSection === 'profile' && (
          <ProfileView
            currentUser={currentUser}
            setCurrentUser={setCurrentUser}
            onNavigate={handleSelectSection}
          />
        )}
      </main>

      {/* Bottom Navigation for Mobile Devices */}
      <BottomNavigation
        activeSection={activeSection}
        onSelectSection={handleSelectSection}
        unreadAlertCount={alerts.length > 0 ? alerts.length : 3}
      />

      {/* Floating AI Chatbot Assistant */}
      <button
        id="drishti-chatbot-fab"
        onClick={() => setIsChatbotOpen(!isChatbotOpen)}
        title="Open DRISHTI-AI Intelligence Assistant"
        style={{
          position: 'fixed',
          bottom: 74,
          right: 20,
          zIndex: 1999,
          width: 48,
          height: 48,
          borderRadius: '50%',
          background: isChatbotOpen
            ? 'linear-gradient(135deg, #FF4DB8, #8B6CFF)'
            : 'linear-gradient(135deg, #35D8FF, #8B6CFF)',
          border: '2px solid rgba(255, 255, 255, 0.25)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: isChatbotOpen
            ? '0 6px 22px rgba(255, 77, 184, 0.45)'
            : '0 6px 22px rgba(53, 216, 255, 0.45)',
          fontSize: '1.25rem',
          transition: 'all 0.2s ease'
        }}
      >
        {isChatbotOpen ? '✕' : '🤖'}
      </button>

      {isChatbotOpen && (
        <ChatbotPanel zones={zones} onClose={() => setIsChatbotOpen(false)} />
      )}

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        onLogin={(user) => setCurrentUser(user)}
      />

      {/* Standalone Android App Modal */}
      <AndroidAppModal
        isOpen={isAndroidModalOpen}
        onClose={() => setIsAndroidModalOpen(false)}
        onLaunchMobilePreview={() => handleSelectSection('reports')}
      />
    </div>
  );
}

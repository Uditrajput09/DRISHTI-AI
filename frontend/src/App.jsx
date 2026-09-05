import React, { useState, useEffect } from 'react';
import TopNavigation from './components/TopNavigation';
import SidebarNavigation from './components/SidebarNavigation';
import HeaderBar from './components/HeaderBar';
import BottomNavigation from './components/BottomNavigation';
import DashboardView from './views/DashboardView';
import RiskIntelligenceView from './views/RiskIntelligenceView';
import ForecastView from './views/ForecastView';
import IncidentsView from './views/IncidentsView';
import AlertsView from './views/AlertsView';
import FieldReportsView from './views/FieldReportsView';
import ProfileView from './views/ProfileView';
import LoginView from './views/LoginView';
import SimulationView from './views/SimulationView';
import AuthModal from './components/AuthModal';
import AndroidAppModal from './components/AndroidAppModal';
import ChatbotPanel from './components/ChatbotPanel';
import { authService } from './services/authService';
import { api } from './api';
import { Bot, X } from 'lucide-react';

export default function App() {
  // Current user authentication
  const [currentUser, setCurrentUser] = useState(() => authService.getCurrentUser());

  // Primary Application Section: Default to 'gis' (GIS Command Center)
  const [activeSection, setActiveSection] = useState(() => {
    const path = window.location.pathname;
    if (path === '/risk') return 'risk';
    if (path === '/forecast') return 'forecast';
    if (path === '/simulation') return 'simulation';
    if (path === '/incidents') return 'incidents';
    if (path === '/alerts') return 'alerts';
    if (path === '/reports') return 'reports';
    if (path === '/profile') return 'profile';
    if (path === '/login') return 'login';
    return 'gis';
  });

  // Telemetry state
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
  const [showSidebar, setShowSidebar] = useState(false);

  // Handle URL history state
  const handleSelectSection = (sectionId) => {
    const raw = String(sectionId || '').replace(/^\//, '');
    const normalized = (!raw || raw === 'app' || raw === 'gis') ? 'gis' : raw;
    setActiveSection(normalized);
    const newPath = normalized === 'gis' ? '/app' : `/${normalized}`;
    window.history.pushState({}, '', newPath);
  };

  useEffect(() => {
    const handlePopState = () => {
      const raw = window.location.pathname.replace(/^\//, '');
      if (['gis', 'risk', 'forecast', 'simulation', 'incidents', 'alerts', 'reports', 'profile', 'login'].includes(raw)) {
        setActiveSection(raw);
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

  const getSectionMetadata = (section) => {
    switch (section) {
      case 'gis': return { title: '1. GIS COMMAND CENTER', routeTag: '(/app)' };
      case 'risk': return { title: '2. RISK INTELLIGENCE', routeTag: '(/risk)' };
      case 'alerts': return { title: '3. ALERTS CENTER', routeTag: '(/alerts)' };
      case 'forecast': return { title: '4. FORECAST', routeTag: '(/forecast)' };
      case 'incidents': return { title: '5. INCIDENTS', routeTag: '(/incidents)' };
      case 'reports': return { title: '6. FIELD REPORT', routeTag: '(/reports)' };
      case 'profile': return { title: '7. PROFILE', routeTag: '(/profile)' };
      case 'simulation': return { title: 'CLOUDBURST SIMULATION', routeTag: '(/simulation)' };
      default: return { title: 'GIS COMMAND CENTER', routeTag: '(/app)' };
    }
  };

  const currentMeta = getSectionMetadata(activeSection);

  // If on pure login screen, render full-page split-screen without sidebar
  if (activeSection === 'login') {
    return (
      <LoginView
        currentUser={currentUser}
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          handleSelectSection('gis');
        }}
        onNavigate={(p) => handleSelectSection(p)}
      />
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#070A10',
        color: '#F4F6FB',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* 1. FIXED TOP NAVIGATION (Desktop >= 769px) matching "GLOBAL PAGE STRUCTURE" */}
      <TopNavigation
        activeSection={activeSection}
        onSelectSection={handleSelectSection}
        unreadAlertCount={alerts.length > 0 ? alerts.length : 6}
        onOpenAlerts={() => handleSelectSection('alerts')}
        onOpenProfile={() => handleSelectSection('profile')}
        currentUser={currentUser}
        onRefreshData={handleRefreshAll}
        isRefreshing={isRefreshing}
        showSidebar={showSidebar}
        onToggleSidebar={() => setShowSidebar(!showSidebar)}
      />

      {/* 2. Main Content Layout (With Optional EOC Left Sidebar) */}
      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        {showSidebar && (
          <SidebarNavigation
            activeSection={activeSection}
            onSelectSection={handleSelectSection}
            unreadAlertCount={alerts.length > 0 ? alerts.length : 6}
            onOpenChatbot={() => setIsChatbotOpen(true)}
          />
        )}

        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            minWidth: 0,
            paddingBottom: 70
          }}
        >
          {showSidebar && (
            <HeaderBar
              title={currentMeta.title}
              routeTag={currentMeta.routeTag}
              currentUser={currentUser}
              unreadAlertCount={alerts.length > 0 ? alerts.length : 6}
              onOpenAlerts={() => handleSelectSection('alerts')}
              onOpenProfile={() => handleSelectSection('profile')}
              onRefreshData={handleRefreshAll}
              isRefreshing={isRefreshing}
            />
          )}

          {/* View Router */}
          <main style={{ flex: 1 }}>
          {/* Screen 1: GIS Command Center */}
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

          {/* Screen 2: Risk Intelligence */}
          {activeSection === 'risk' && (
            <RiskIntelligenceView
              zones={zones}
              onSelectZone={setSelectedZone}
              onNavigateToGIS={() => handleSelectSection('gis')}
            />
          )}

          {/* Screen 3: Alerts Center */}
          {activeSection === 'alerts' && (
            <AlertsView
              alerts={alerts}
              onViewZone={handleViewZoneOnGIS}
              onRefreshAlerts={loadAllData}
            />
          )}

          {/* Screen 4: 48-Hour Forecast */}
          {activeSection === 'forecast' && (
            <ForecastView
              zones={zones}
              selectedZone={selectedZone}
              onSelectZone={setSelectedZone}
            />
          )}

          {/* Screen 5: Live Incidents */}
          {activeSection === 'incidents' && (
            <IncidentsView
              reports={reports}
              onNavigateToReport={() => handleSelectSection('reports')}
              onLocateOnMap={handleViewZoneOnGIS}
            />
          )}

          {/* Screen 6: Field Report */}
          {activeSection === 'reports' && (
            <FieldReportsView
              onReportSubmitted={loadAllData}
            />
          )}

          {/* Screen 7: Profile & Settings */}
          {activeSection === 'profile' && (
            <ProfileView
              currentUser={currentUser}
              setCurrentUser={setCurrentUser}
              onNavigate={handleSelectSection}
            />
          )}

          {/* Dedicated Cloudburst Simulation Studio */}
          {activeSection === 'simulation' && (
            <SimulationView
              zones={zones}
              onNavigateToGIS={() => handleSelectSection('gis')}
              onSelectZone={setSelectedZone}
            />
          )}
        </main>
        </div>
      </div>

      {/* 3. Mobile Bottom Navigation Bar (Screens <= 768px, matching Screen 9) */}
      <BottomNavigation
        activeSection={activeSection}
        onSelectSection={handleSelectSection}
        unreadAlertCount={alerts.length > 0 ? alerts.length : 6}
      />

      {/* 4. Circular AI Assistant FAB (Screens 1 & 9) */}
      <button
        onClick={() => setIsChatbotOpen(!isChatbotOpen)}
        title="Ask DRISHTI AI Assistant"
        style={{
          position: 'fixed',
          bottom: 74,
          right: 20,
          width: 46,
          height: 46,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #8B6CFF 0%, #35D8FF 100%)',
          border: '2px solid rgba(255, 255, 255, 0.4)',
          color: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 20px rgba(139, 108, 255, 0.55)',
          cursor: 'pointer',
          zIndex: 1999,
          transition: 'transform 0.2s ease'
        }}
        onMouseOver={(e) => { e.currentTarget.style.transform = 'scale(1.08)'; }}
        onMouseOut={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
      >
        {isChatbotOpen ? <X size={20} /> : <Bot size={22} />}
      </button>

      {/* Floating Chatbot Panel */}
      {isChatbotOpen && (
        <ChatbotPanel zones={zones} onClose={() => setIsChatbotOpen(false)} />
      )}

      {/* Modals */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        onLogin={(user) => setCurrentUser(user)}
      />

      <AndroidAppModal
        isOpen={isAndroidModalOpen}
        onClose={() => setIsAndroidModalOpen(false)}
        onLaunchMobilePreview={() => handleSelectSection('reports')}
      />
    </div>
  );
}

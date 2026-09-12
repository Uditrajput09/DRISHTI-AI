import React, { useState, useEffect, useCallback, Suspense, lazy } from 'react';
import AppShell from './components/ui/AppShell';
import LoginView from './views/LoginView';
import CookieBanner from './components/CookieBanner';
import BackToTop from './components/BackToTop';
import SkeletonLoader from './components/SkeletonLoader';
import { ToastProvider, useToast } from './context/ToastContext';
import { authService } from './services/authService';
import { useRiskWebSocket } from './hooks/useRiskWebSocket';
import { api } from './api';

// Route-level dynamic code splitting for high mobile performance
const DashboardView = lazy(() => import('./views/DashboardView'));
const RiskIntelligenceView = lazy(() => import('./views/RiskIntelligenceView'));
const ForecastView = lazy(() => import('./views/ForecastView'));
const IncidentsView = lazy(() => import('./views/IncidentsView'));
const AlertsView = lazy(() => import('./views/AlertsView'));
const FieldReportsView = lazy(() => import('./views/FieldReportsView'));
const ProfileView = lazy(() => import('./views/ProfileView'));
const SimulationView = lazy(() => import('./views/SimulationView'));
const EvacuationView = lazy(() => import('./views/EvacuationView'));
const OfflineMapsView = lazy(() => import('./views/OfflineMapsView'));

// Modals / Simulators (deferred until user interaction)
const AuthModal = lazy(() => import('./components/AuthModal'));
const AndroidAppModal = lazy(() => import('./components/AndroidAppModal'));
const AndroidDeviceSimulator = lazy(() => import('./components/AndroidDeviceSimulator'));
const KeyboardShortcutsModal = lazy(() => import('./components/KeyboardShortcutsModal'));

function ViewFallback() {
  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <SkeletonLoader type="chart" height={280} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginTop: 8 }}>
        <SkeletonLoader height={140} />
        <SkeletonLoader height={140} />
      </div>
    </div>
  );
}

function AppContent() {
  const { showToast } = useToast();
  const isSimulatorEmbed = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('mode') === 'mobile';

  // Current user authentication
  const [currentUser, setCurrentUser] = useState(() => authService.getCurrentUser());

  // Theme state: default to 'dark'
  const [theme, setTheme] = useState(() => localStorage.getItem('drishti_theme') || 'dark');

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('drishti_theme', next);
    document.documentElement.setAttribute('data-theme', next);
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Primary Application Section: Default to 'login' as the first landing page
  const [activeSection, setActiveSection] = useState(() => {
    const path = window.location.pathname;
    if (path === '/risk') return 'risk';
    if (path === '/forecast') return 'forecast';
    if (path === '/simulation') return 'simulation';
    if (path === '/incidents') return 'incidents';
    if (path === '/alerts') return 'alerts';
    if (path === '/reports') return 'reports';
    if (path === '/profile') return 'profile';
    if (path === '/evacuation' || path === '/shelters') return 'evacuation';
    if (path === '/offline-maps') return 'offline-maps';
    if (path === '/app' || path === '/gis') return 'gis';
    return 'login';
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
  const [isLoadingInitial, setIsLoadingInitial] = useState(true);

  // Modals & Panels
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAndroidModalOpen, setIsAndroidModalOpen] = useState(false);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);

  // Handle messages from embedded Android Device Simulator
  useEffect(() => {
    const handleSimulatorMessage = (e) => {
      if (e.data?.type === 'DRISHTI_SIMULATOR_NAVIGATE') {
        handleSelectSection(e.data.payload);
      }
      if (e.data?.type === 'DRISHTI_SIMULATOR_AUTH_SWITCH' && e.data.payload) {
        const { email, password, guest, logout } = e.data.payload;
        if (logout) {
          authService.logout();
          setCurrentUser(null);
          handleSelectSection('login');
          if (showToast) showToast('Logged out of simulated Android session', 'info');
        } else if (guest) {
          handleSelectSection('gis');
          if (showToast) showToast('Entered Command Center as Guest / Evaluator', 'success');
        } else if (email && password) {
          authService.login(email, password).then((u) => {
            setCurrentUser(u);
            handleSelectSection('gis');
            if (showToast) showToast(`Simulated Login: ${u.name} (${u.role})`, 'success');
          }).catch(() => {
            handleSelectSection('login');
          });
        }
      }
      if (e.data?.type === 'DRISHTI_SIMULATOR_NOTIFICATION' && e.data.payload) {
        const notif = e.data.payload;
        if (showToast) {
          showToast(`${notif.title}: ${notif.body}`, notif.severity === 'critical' ? 'error' : 'warning');
        }
        setAlerts(prev => [{
          id: `SIM-${notif.id || Date.now()}`,
          level: notif.severity === 'critical' ? 'Critical' : notif.severity === 'high' ? 'High' : 'Medium',
          score: notif.severity === 'critical' ? 98 : 75,
          zone: 'Sohra (Cherrapunji) Sector',
          message: notif.body,
          channels: ['SMS', 'Push'],
          language: 'English',
          time: notif.time || 'Just now'
        }, ...prev]);
      }
    };
    window.addEventListener('message', handleSimulatorMessage);
    return () => window.removeEventListener('message', handleSimulatorMessage);
  }, [showToast]);

  // Global keyboard shortcuts listener
  useEffect(() => {
    const handleGlobalKey = (e) => {
      // Cmd+K or Ctrl+K
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsShortcutsOpen(prev => !prev);
      }
      // '?' key
      if (e.key === '?' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
        e.preventDefault();
        setIsShortcutsOpen(true);
      }
    };
    window.addEventListener('keydown', handleGlobalKey);
    return () => window.removeEventListener('keydown', handleGlobalKey);
  }, []);

  // Handle URL history state
  const handleSelectSection = (sectionId) => {
    const raw = String(sectionId || '').replace(/^\//, '');
    const normalized = (!raw || raw === 'login') ? 'login' : (raw === 'app' || raw === 'gis') ? 'gis' : raw;
    setActiveSection(normalized);
    const search = window.location.search || '';
    const newPath = (normalized === 'login' ? '/login' : normalized === 'gis' ? '/app' : `/${normalized}`) + search;
    window.history.pushState({}, '', newPath);
  };

  useEffect(() => {
    const handlePopState = () => {
      const raw = window.location.pathname.replace(/^\//, '');
      if (!raw || raw === 'login') {
        setActiveSection('login');
      } else if (['gis', 'risk', 'forecast', 'simulation', 'incidents', 'alerts', 'reports', 'profile', 'evacuation', 'shelters', 'offline-maps', 'app'].includes(raw)) {
        setActiveSection(raw === 'shelters' ? 'evacuation' : raw === 'app' ? 'gis' : raw);
      } else {
        setActiveSection('login');
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
    } finally {
      setIsLoadingInitial(false);
    }
  };

  // Real-time WebSocket listener for live risk score broadcasts
  const handleLiveZoneUpdate = useCallback((newZones, rawEvent) => {
    if (!newZones || !Array.isArray(newZones)) return;
    setZones(newZones);
    setSelectedZone(prev => {
      if (!prev) return newZones[0] || null;
      const match = newZones.find(z => z.id === prev.id);
      return match || newZones[0];
    });

    // Dynamically update high-level district risk metrics
    const critical_count = newZones.filter(z => z.risk_level === 'Critical').length;
    const high_count = newZones.filter(z => z.risk_level === 'High').length;
    const medium_count = newZones.filter(z => z.risk_level === 'Medium').length;
    const low_count = newZones.filter(z => z.risk_level === 'Low').length;
    const highest = [...newZones].sort((a, b) => (b.risk_score || 0) - (a.risk_score || 0))[0];

    setSummary(prev => ({
      ...prev,
      total_zones_monitored: newZones.length,
      critical_count,
      high_count,
      medium_count,
      low_count,
      highest_risk_score: highest?.risk_score ?? prev.highest_risk_score,
      highest_risk_zone: highest?.name || prev.highest_risk_zone,
      last_updated: rawEvent?.timestamp || new Date().toISOString()
    }));

    if (showToast && rawEvent?.type === 'SIMULATION_UPDATE') {
      showToast('Live Cloudburst Simulation streamed to GIS map', 'info');
    }
  }, [showToast]);

  const { isConnected: isLiveConnected, lastUpdate: liveLastUpdate } = useRiskWebSocket(handleLiveZoneUpdate);

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
      case 'evacuation': return { title: '8. TOURIST & EVACUATION GUIDE', routeTag: '(/evacuation)' };
      case 'simulation': return { title: 'CLOUDBURST SIMULATION', routeTag: '(/simulation)' };
      case 'offline-maps': return { title: 'OFFLINE MAPS & GPS NAVIGATION', routeTag: '(/offline-maps)' };
      default: return { title: 'GIS COMMAND CENTER', routeTag: '(/app)' };
    }
  };

  const currentMeta = getSectionMetadata(activeSection);

  // If on pure login screen, render full-page split-screen without sidebar
  if (activeSection === 'login') {
    return (
      <div style={{ position: 'relative' }}>
        <a href="#main-content" className="skip-to-content">Skip to content</a>
        <Suspense fallback={<ViewFallback />}>
          <LoginView
            currentUser={currentUser}
            onLoginSuccess={(user) => {
              setCurrentUser(user);
              handleSelectSection('gis');
            }}
            onNavigate={(p) => handleSelectSection(p)}
          />
        </Suspense>
        <CookieBanner />
      </div>
    );
  }

  return (
    <AppShell
      activeSection={activeSection}
      onSelectSection={handleSelectSection}
      currentUser={currentUser}
      unreadAlertCount={alerts.length > 0 ? alerts.length : 0}
      onRefreshData={handleRefreshAll}
      isRefreshing={isRefreshing}
      currentTheme={theme}
      onToggleTheme={toggleTheme}
      onOpenAlerts={() => handleSelectSection('alerts')}
      onOpenProfile={() => handleSelectSection('profile')}
      onOpenShortcuts={() => setIsShortcutsOpen(true)}
      onOpenAndroidModal={() => setIsAndroidModalOpen(true)}
      onOpenSimulator={() => setIsSimulatorOpen(true)}
      zones={zones}
      selectedZone={selectedZone}
      alerts={alerts}
    >
      {isLoadingInitial ? (
        <div style={{ padding: 24 }}>
          <SkeletonLoader type="chart" height={280} />
          <div style={{ marginTop: 20 }}>
            <SkeletonLoader count={2} height={140} />
          </div>
        </div>
      ) : (
        <Suspense fallback={<ViewFallback />}>
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
              isLiveConnected={isLiveConnected}
              liveLastUpdate={liveLastUpdate}
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
              onOpenAndroidModal={() => setIsAndroidModalOpen(true)}
              onOpenSimulator={() => setIsSimulatorOpen(true)}
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

          {/* Screen 8: Tourist Emergency & Evacuation Guide */}
          {activeSection === 'evacuation' && (
            <EvacuationView
              currentUser={currentUser}
              zones={zones}
              facilities={facilities}
              onNavigateToGIS={() => handleSelectSection('gis')}
              onOpenAlerts={() => handleSelectSection('alerts')}
              onNavigate={handleSelectSection}
            />
          )}

          {/* Screen 9: Offline Maps Downloader & Zero-Signal GPS Navigation */}
          {activeSection === 'offline-maps' && (
            <OfflineMapsView
              onNavigateToGIS={() => handleSelectSection('gis')}
              onNavigateToEvac={() => handleSelectSection('evacuation')}
            />
          )}
        </Suspense>
      )}

      {/* Floating Back to Top Button (Desktop only) */}
      {!isSimulatorEmbed && <BackToTop />}

      {/* Cookie Consent Banner (Desktop only) */}
      {!isSimulatorEmbed && <CookieBanner />}

      {/* Keyboard Shortcuts Modal (Desktop only) */}
      {!isSimulatorEmbed && isShortcutsOpen && (
        <Suspense fallback={null}>
          <KeyboardShortcutsModal
            isOpen={isShortcutsOpen}
            onClose={() => setIsShortcutsOpen(false)}
            onNavigate={handleSelectSection}
            onToggleTheme={toggleTheme}
            currentTheme={theme}
            onOpenAndroidModal={() => setIsAndroidModalOpen(true)}
            onOpenSimulator={() => setIsSimulatorOpen(true)}
          />
        </Suspense>
      )}

      {/* Modals */}
      {isAuthModalOpen && (
        <Suspense fallback={null}>
          <AuthModal
            isOpen={isAuthModalOpen}
            onClose={() => setIsAuthModalOpen(false)}
            currentUser={currentUser}
            onLogin={(user) => setCurrentUser(user)}
          />
        </Suspense>
      )}

      {!isSimulatorEmbed && isAndroidModalOpen && (
        <Suspense fallback={null}>
          <AndroidAppModal
            isOpen={isAndroidModalOpen}
            onClose={() => setIsAndroidModalOpen(false)}
            onLaunchSimulator={() => {
              setIsAndroidModalOpen(false);
              setIsSimulatorOpen(true);
            }}
            onLaunchMobilePreview={() => handleSelectSection('reports')}
          />
        </Suspense>
      )}

      {/* Android Hardware Device Simulator Overlay (Top window only) */}
      {!isSimulatorEmbed && isSimulatorOpen && (
        <Suspense fallback={null}>
          <AndroidDeviceSimulator
            isOpen={isSimulatorOpen}
            onClose={() => setIsSimulatorOpen(false)}
          />
        </Suspense>
      )}
    </AppShell>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}

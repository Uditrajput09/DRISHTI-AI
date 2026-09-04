import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import DashboardView from './views/DashboardView';
import SocialFieldAppView from './views/SocialFieldAppView';
import AuthModal from './components/AuthModal';
import AndroidAppModal from './components/AndroidAppModal';
import ChatbotPanel from './components/ChatbotPanel';
import LoginView from './views/LoginView';
import HomeFeedView from './views/HomeFeedView';
import ProfileView from './views/ProfileView';
import HoloNavbar from './components/HoloNavbar';
import { authService } from './services/authService';
import { api } from './api';
import { ArrowLeft } from 'lucide-react';

export default function App() {
  // User Authentication State
  const [currentUser, setCurrentUser] = useState(() => {
    return authService.getCurrentUser();
  });

  // Navigation / Route State: default to '/app' (Original GIS Dashboard Command Center)
  const [currentPath, setCurrentPath] = useState(() => {
    const p = window.location.pathname;
    if (p === '/home') return '/home';
    if (p === '/profile') return '/profile';
    if (p === '/login') return '/login';
    return '/app';
  });

  const [activeTab, setActiveTab] = useState('dashboard');
  const [summary, setSummary] = useState({});
  const [zones, setZones] = useState([]);
  const [selectedZone, setSelectedZone] = useState(null);
  const [facilities, setFacilities] = useState([]);
  const [roads, setRoads] = useState([]);
  const [reports, setReports] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAndroidModalOpen, setIsAndroidModalOpen] = useState(false);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);

  // Check if opened directly on Mobile / Android Webview or standalone URL
  const [isMobileMode, setIsMobileMode] = useState(() => {
    return window.location.search.includes('mode=mobile') || window.location.hash.includes('mobile');
  });

  const navigateTo = (path) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
  };

  useEffect(() => {
    const handlePopState = () => {
      const p = window.location.pathname;
      if (['/home', '/profile', '/app', '/login'].includes(p)) {
        setCurrentPath(p);
      } else {
        setCurrentPath('/app');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

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

      setSummary(sumRes);
      setZones(zonesRes);
      setFacilities(facRes);
      setRoads(roadsRes);
      setReports(repRes);
      setAlerts(alertRes);

      if (zonesRes.length > 0 && !selectedZone) {
        const highest = [...zonesRes].sort((a, b) => b.risk_score - a.risk_score)[0];
        setSelectedZone(highest || zonesRes[0]);
      }
    } catch (err) {
      console.warn('Error loading initial data:', err);
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
      console.error('Refresh failed:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  // If in Standalone Mobile Mode (Android App Simulation)
  if (isMobileMode) {
    return (
      <div style={{ minHeight: '100vh', background: '#060608', padding: '12px 0 90px' }}>
        <div style={{
          maxWidth: 720,
          margin: '0 auto 14px',
          padding: '10px 18px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'rgba(15, 15, 20, 0.85)',
          backgroundImage: 'linear-gradient(rgba(15,15,20,0.85), rgba(15,15,20,0.85)), linear-gradient(90deg, #FF6EC7, #7873F5, #4FD8EA)',
          backgroundOrigin: 'border-box',
          backgroundClip: 'padding-box, border-box',
          border: '1px solid transparent',
          borderRadius: 14,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)'
        }}>
          <span style={{ fontSize: '0.82rem', color: '#4FD8EA', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'Space Grotesk, sans-serif' }}>
            <span className="holo-live-dot" /> 📱 Standalone Citizen App (APK Simulation)
          </span>
          <button
            onClick={() => setIsMobileMode(false)}
            className="holo-btn-primary"
            style={{
              fontSize: '0.74rem',
              padding: '6px 14px'
            }}
          >
            Switch to GIS Command 🖥️
          </button>
        </div>

        <SocialFieldAppView
          currentUser={currentUser}
          onOpenAuth={() => setIsAuthModalOpen(true)}
          facilities={facilities}
          onReportSubmitted={loadAllData}
        />

        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          currentUser={currentUser}
          onLogin={(user) => setCurrentUser(user)}
        />
      </div>
    );
  }

  // Router Dispatching
  if (currentPath === '/login') {
    return (
      <LoginView
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          navigateTo('/app');
        }}
        onNavigate={navigateTo}
      />
    );
  }

  if (currentPath === '/home') {
    return (
      <HomeFeedView
        currentUser={currentUser}
        onNavigate={navigateTo}
        summary={summary}
        zones={zones}
        selectedZone={selectedZone}
        setSelectedZone={setSelectedZone}
        facilities={facilities}
        roads={roads}
        reports={reports}
        alerts={alerts}
        onRefreshAll={handleRefreshAll}
      />
    );
  }

  if (currentPath === '/profile') {
    return (
      <ProfileView
        currentUser={currentUser}
        setCurrentUser={setCurrentUser}
        onNavigate={navigateTo}
      />
    );
  }

  // '/app' -> Unified SentinelWatch GIS Dashboard Command Center
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#060608', display: 'flex', flexDirection: 'column', paddingBottom: 90 }}>
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onRefreshAll={handleRefreshAll}
        isRefreshing={isRefreshing}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onOpenAndroidModal={() => setIsAndroidModalOpen(true)}
      />

      <main style={{ flex: 1, paddingBottom: 32 }}>
        <DashboardView
          summary={summary}
          zones={zones}
          selectedZone={selectedZone}
          setSelectedZone={setSelectedZone}
          facilities={facilities}
          roads={roads}
          reports={reports}
          alerts={alerts}
          currentUser={currentUser}
          onOpenAuth={() => setIsAuthModalOpen(true)}
          onRefreshAll={handleRefreshAll}
        />
      </main>

      {/* Bottom Sticky Navigation Bar matching Home Feed */}
      <HoloNavbar
        currentPath="/app"
        onNavigate={navigateTo}
        currentUser={currentUser}
        onlyBottomNav={true}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        onLogin={(user) => setCurrentUser(user)}
      />

      <AndroidAppModal
        isOpen={isAndroidModalOpen}
        onClose={() => setIsAndroidModalOpen(false)}
        onLaunchMobilePreview={() => setIsMobileMode(true)}
      />

      {/* AI Chatbot FAB Button floating smoothly above bottom nav */}
      <button
        id="chatbot-fab-btn"
        onClick={() => setIsChatbotOpen(p => !p)}
        title="Open DRISHTI-AI Assistant"
        style={{
          position: 'fixed',
          bottom: 74,
          right: 24,
          zIndex: 1999,
          width: 50,
          height: 50,
          borderRadius: '50%',
          background: isChatbotOpen
            ? 'linear-gradient(135deg, #FF6EC7, #7873F5)'
            : 'linear-gradient(135deg, #7873F5, #4FD8EA)',
          border: '2px solid rgba(255, 255, 255, 0.25)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: isChatbotOpen
            ? '0 8px 24px rgba(255, 110, 199, 0.5)'
            : '0 8px 24px rgba(120, 115, 245, 0.5)',
          fontSize: '1.3rem',
          transition: 'all 0.25s ease'
        }}
      >
        {isChatbotOpen ? '✕' : '🤖'}
      </button>

      {isChatbotOpen && (
        <ChatbotPanel zones={zones} onClose={() => setIsChatbotOpen(false)} />
      )}
    </div>
  );
}

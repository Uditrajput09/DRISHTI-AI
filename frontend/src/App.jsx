import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import DashboardView from './views/DashboardView';
import SocialFieldAppView from './views/SocialFieldAppView';
import AuthModal from './components/AuthModal';
import AndroidAppModal from './components/AndroidAppModal';
import ChatbotPanel from './components/ChatbotPanel';
import { api } from './api';

export default function App() {
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

  // User Authentication / Persona State
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('drishti_current_user');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      role: 'citizen',
      name: 'Community Responder',
      phone: '+91-8630868896',
      district: 'East Khasi Hills',
      language: 'en',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80'
    };
  });

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
        // Select highest risk zone by default
        const highest = [...zonesRes].sort((a, b) => b.risk_score - a.risk_score)[0];
        setSelectedZone(highest || zonesRes[0]);
      }
    } catch (err) {
      console.warn('Error loading initial data:', err);
    }
  };

  useEffect(() => {
    loadAllData();
    // Background refresh every 30 seconds
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
      <div style={{ minHeight: '100vh', background: '#090d16', padding: '10px 0' }}>
        {/* Top Exit Banner for Desktop Testers */}
        <div style={{
          maxWidth: 720,
          margin: '0 auto 10px',
          padding: '8px 16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'rgba(6, 182, 212, 0.15)',
          border: '1px solid rgba(6, 182, 212, 0.3)',
          borderRadius: 12
        }}>
          <span style={{ fontSize: '0.78rem', color: '#67e8f9', fontWeight: 700 }}>
            📱 Standalone Android App (APK Simulation)
          </span>
          <button
            onClick={() => setIsMobileMode(false)}
            style={{
              background: '#0284c7',
              border: 'none',
              color: '#fff',
              fontSize: '0.74rem',
              fontWeight: 700,
              padding: '4px 10px',
              borderRadius: 6,
              cursor: 'pointer'
            }}
          >
            Switch to Desktop GIS Command Center 🖥️
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

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
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

      {/* AI Chatbot FAB Button */}
      <button
        id="chatbot-fab-btn"
        onClick={() => setIsChatbotOpen(p => !p)}
        title="Open DRISHTI-AI Assistant"
        style={{
          position: 'fixed',
          bottom: 28,
          right: 28,
          zIndex: 1999,
          width: 52,
          height: 52,
          borderRadius: '50%',
          background: isChatbotOpen
            ? 'linear-gradient(135deg, #ef4444, #dc2626)'
            : 'linear-gradient(135deg, #0284c7, #06b6d4)',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: isChatbotOpen
            ? '0 8px 24px rgba(239,68,68,0.5)'
            : '0 8px 24px rgba(6,182,212,0.5)',
          fontSize: '1.4rem',
          transition: 'all 0.2s'
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

import React, { useState, useEffect } from 'react';
import { Bot, Sparkles, X } from 'lucide-react';
import Sidebar from './Sidebar';
import TopNavigation from './TopNavigation';
import AIAssistantDrawer from './AIAssistantDrawer';
import BottomNavigation from '../BottomNavigation';

/**
 * Enterprise Application Shell (AppShell)
 * - Standardized layout wrapper for all authenticated views
 * - Coordinates 240px Sidebar, 60px TopNavigation, Page Container, and Floating AI Assistant
 * - Handles responsiveness: Desktop (>=1200px), Tablet (768-1199px), Mobile (<768px)
 */
export function AppShell({
  children,
  activeSection = 'gis',
  onSelectSection,
  currentUser,
  unreadAlertCount = 0,
  onRefreshData,
  isRefreshing = false,
  currentTheme = 'dark',
  onToggleTheme,
  onOpenAlerts,
  onOpenProfile,
  onOpenShortcuts,
  onOpenAndroidModal,
  onOpenSimulator,
  zones = [],
  selectedZone,
  alerts = [],
  breadcrumbs
}) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isAIDrawerOpen, setIsAIDrawerOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1440
  );

  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      setWindowWidth(w);
      // Auto-collapse sidebar on tablet
      if (w < 1200 && w >= 768) {
        setIsSidebarCollapsed(true);
      } else if (w >= 1200) {
        setIsSidebarCollapsed(false);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Auto-close mobile drawer whenever active section changes
  useEffect(() => {
    setIsMobileSidebarOpen(false);
  }, [activeSection]);

  const isSimulatorEmbed = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('mode') === 'mobile';
  const isMobile = windowWidth < 768 || isSimulatorEmbed;

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: 'var(--bg-main)',
        color: 'var(--text-primary)',
        position: 'relative'
      }}
      className="drishti-app-shell"
    >
      {/* 1. Accessibility: Skip to Content */}
      <a href="#main-content" className="skip-to-content">
        Skip to main content
      </a>

      {/* 2. Global Enterprise Sidebar (hidden by default on mobile, collapsible on tablet) */}
      {(!isMobile || isMobileSidebarOpen) && (
        <Sidebar
          activeSection={activeSection}
          onSelectSection={(id) => {
            setIsMobileSidebarOpen(false);
            onSelectSection && onSelectSection(id);
          }}
          unreadAlertCount={unreadAlertCount}
          currentUser={currentUser}
          isCollapsed={!isMobile && isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          isMobileOpen={isMobile && isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
          onOpenHelp={onOpenShortcuts}
        />
      )}

      {/* 3. Main Workspace Area */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          position: 'relative',
          marginRight: isAIDrawerOpen && !isMobile ? 420 : 0,
          transition: 'margin-right var(--transition-normal, 200ms cubic-bezier(0.4, 0, 0.2, 1))'
        }}
        className="drishti-workspace"
      >
        {/* Top Navigation */}
        <TopNavigation
          activeSection={activeSection}
          breadcrumbs={breadcrumbs}
          currentUser={currentUser}
          unreadAlertCount={unreadAlertCount}
          onRefreshData={onRefreshData}
          isRefreshing={isRefreshing}
          currentTheme={currentTheme}
          onToggleTheme={onToggleTheme}
          onOpenAlerts={onOpenAlerts}
          onOpenProfile={onOpenProfile}
          onOpenShortcuts={onOpenShortcuts}
          onOpenAndroidModal={onOpenAndroidModal}
          onOpenEvacuation={() => onSelectSection && onSelectSection('evacuation')}
          onOpenDevGraph={() => onSelectSection && onSelectSection('devgraph')}
          onToggleSidebarMobile={isMobile ? () => setIsMobileSidebarOpen(prev => !prev) : undefined}
          isSidebarOpen={isMobileSidebarOpen}
          onOpenAI={() => setIsAIDrawerOpen(true)}
        />

        {/* Dynamic Page Container */}
        <main
          id="main-content"
          style={{
            flex: 1,
            padding: isMobile ? `14px 14px ${activeSection === 'evacuation' ? 140 : (activeSection === 'reports' ? 120 : 100)}px 14px` : '24px',
            maxWidth: 'var(--content-max-width)',
            width: '100%',
            boxSizing: 'border-box',
            overflowX: 'hidden'
          }}
          className="drishti-page-container"
        >
          {children}
        </main>
      </div>

      {/* 4. Mobile Bottom Navigation (Visible on mobile viewports & simulator iframe) */}
      {isMobile && (
        <BottomNavigation
          activeSection={activeSection}
          onSelectSection={(id) => {
            setIsMobileSidebarOpen(false);
            onSelectSection && onSelectSection(id);
          }}
          unreadAlertCount={unreadAlertCount}
        />
      )}

      {/* 5. Floating Enterprise AI Assistant FAB Button (hidden on evacuation & reports view on mobile to prevent blocking critical action bars & form controls) */}
      {!isAIDrawerOpen && (!isMobile || (activeSection !== 'evacuation' && activeSection !== 'reports')) && (
        <button
          onClick={() => setIsAIDrawerOpen(true)}
          title="DRISHTI AI Assistant"
          aria-label="Open AI Assistant"
          style={{
            position: 'fixed',
            bottom: isMobile ? 70 : 24,
            right: isMobile ? 14 : 24,
            width: isMobile ? 42 : 48,
            height: isMobile ? 42 : 48,
            borderRadius: 'var(--radius-pill)',
            backgroundColor: 'var(--brand-primary)',
            color: '#FFFFFF',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--shadow-elevated)',
            cursor: 'pointer',
            zIndex: 'var(--z-fab)',
            transition: 'transform var(--transition-fast), background-color var(--transition-fast)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.08)';
            e.currentTarget.style.backgroundColor = 'var(--brand-hover)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.backgroundColor = 'var(--brand-primary)';
          }}
        >
          <Bot size={isMobile ? 20 : 22} />
        </button>
      )}

      {/* 6. Right-Side Enterprise AI Drawer */}
      <AIAssistantDrawer
        isOpen={isAIDrawerOpen}
        onClose={() => setIsAIDrawerOpen(false)}
        zones={zones}
        selectedZone={selectedZone}
        alerts={alerts}
      />
    </div>
  );
}

export default AppShell;

import React from 'react';
import { ShieldAlert, Search, Home, Map, Bell, User, Sparkles } from 'lucide-react';

export default function HoloNavbar({
  currentPath = '/home',
  onNavigate,
  currentUser,
  searchQuery = '',
  onSearchChange,
  unreadCount = 3,
  onlyBottomNav = false,
  hideTopHeader = false
}) {
  return (
    <>
      {/* Top Navbar */}
      {!onlyBottomNav && !hideTopHeader && (
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        backgroundColor: '#060608',
        backgroundImage: 'linear-gradient(rgba(15,15,20,0.85), rgba(15,15,20,0.85)), linear-gradient(90deg, rgba(255,110,199,0.3), rgba(120,115,245,0.3), rgba(79,216,234,0.3))',
        backgroundOrigin: 'border-box',
        backgroundClip: 'padding-box, border-box',
        borderBottom: '1px solid transparent',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        padding: '12px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 4px 24px rgba(0, 0, 0, 0.6)'
      }}>
        {/* Brand Logo & Title */}
        <div
          onClick={() => onNavigate && onNavigate('/home')}
          style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}
        >
          <div style={{
            width: 38,
            height: 38,
            borderRadius: 12,
            background: 'linear-gradient(135deg, #FF6EC7, #7873F5, #4FD8EA)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 16px rgba(120, 115, 245, 0.5)'
          }}>
            <ShieldAlert size={22} color="#ffffff" />
          </div>
          <div>
            <h1 className="holo-gradient-text" style={{ fontSize: '1.25rem', margin: 0, lineHeight: 1.2 }}>
              NER SentinelWatch
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.7rem', color: '#94a3b8' }}>
              <span className="holo-live-dot" />
              <span>East Khasi Hills • Live Monitoring</span>
            </div>
          </div>
        </div>

        {/* Center Search Input (Hidden on extra small screens) */}
        {onSearchChange !== undefined && (
          <div style={{ flex: '0 1 420px', margin: '0 16px', position: 'relative' }}>
            <Search size={16} color="#4FD8EA" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search zones, alerts, incidents..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="holo-input"
              style={{ width: '100%', paddingLeft: 40, fontSize: '0.88rem' }}
            />
          </div>
        )}

        {/* Right User Actions & Avatar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {/* Quick Launch Dashboard Link */}
          <button
            onClick={() => onNavigate && onNavigate('/app')}
            className="holo-btn-primary"
            style={{
              padding: '8px 16px',
              fontSize: '0.82rem',
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            <Map size={15} />
            <span>GIS Map</span>
          </button>

          {/* User Profile Avatar with Gradient Ring */}
          <div
            onClick={() => onNavigate && onNavigate('/profile')}
            className="avatar-ring-gradient"
            style={{ cursor: 'pointer', transition: 'transform 0.2s ease' }}
            title="View Profile"
          >
            <img
              src={currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
              alt={currentUser?.name || 'User'}
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                objectFit: 'cover',
                display: 'block',
                border: '2px solid #060608'
              }}
            />
          </div>
        </div>
      </header>
      )}

      {/* Bottom Sticky Navigation Bar for Mobile & Desktop consistency */}
      <nav style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 999,
        backgroundColor: '#060608',
        backgroundImage: 'linear-gradient(rgba(15,15,20,0.92), rgba(15,15,20,0.92)), linear-gradient(90deg, #FF6EC7, #7873F5, #4FD8EA)',
        backgroundOrigin: 'border-box',
        backgroundClip: 'padding-box, border-box',
        borderTop: '1px solid transparent',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        padding: '10px 16px'
      }}>
        <button
          onClick={() => onNavigate && onNavigate('/home')}
          style={{
            background: 'none',
            border: 'none',
            color: currentPath === '/home' ? '#FF6EC7' : '#94a3b8',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 4,
            cursor: 'pointer',
            fontSize: '0.72rem',
            fontWeight: currentPath === '/home' ? 700 : 500,
            transition: 'all 0.2s ease'
          }}
        >
          <div style={{
            padding: '6px 16px',
            borderRadius: 12,
            background: currentPath === '/home' ? 'rgba(255, 110, 199, 0.15)' : 'transparent',
            boxShadow: currentPath === '/home' ? '0 0 12px rgba(255, 110, 199, 0.3)' : 'none'
          }}>
            <Home size={20} color={currentPath === '/home' ? '#FF6EC7' : '#94a3b8'} />
          </div>
          <span>Home Feed</span>
        </button>

        <button
          onClick={() => onNavigate && onNavigate('/app')}
          style={{
            background: 'none',
            border: 'none',
            color: currentPath === '/app' ? '#7873F5' : '#94a3b8',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 4,
            cursor: 'pointer',
            fontSize: '0.72rem',
            fontWeight: currentPath === '/app' ? 700 : 500,
            transition: 'all 0.2s ease'
          }}
        >
          <div style={{
            padding: '6px 16px',
            borderRadius: 12,
            background: currentPath === '/app' ? 'rgba(120, 115, 245, 0.15)' : 'transparent',
            boxShadow: currentPath === '/app' ? '0 0 12px rgba(120, 115, 245, 0.3)' : 'none'
          }}>
            <Map size={20} color={currentPath === '/app' ? '#7873F5' : '#94a3b8'} />
          </div>
          <span>GIS Command</span>
        </button>

        <button
          onClick={() => onNavigate && onNavigate('/home')}
          style={{
            background: 'none',
            border: 'none',
            color: '#94a3b8',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 4,
            cursor: 'pointer',
            fontSize: '0.72rem',
            fontWeight: 500,
            position: 'relative'
          }}
        >
          <div style={{ padding: '6px 16px', borderRadius: 12 }}>
            <Bell size={20} color="#94a3b8" />
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute',
                top: 4,
                right: 22,
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: '#4FD8EA',
                boxShadow: '0 0 8px #4FD8EA'
              }} />
            )}
          </div>
          <span>Alerts</span>
        </button>

        <button
          onClick={() => onNavigate && onNavigate('/profile')}
          style={{
            background: 'none',
            border: 'none',
            color: currentPath === '/profile' ? '#4FD8EA' : '#94a3b8',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 4,
            cursor: 'pointer',
            fontSize: '0.72rem',
            fontWeight: currentPath === '/profile' ? 700 : 500,
            transition: 'all 0.2s ease'
          }}
        >
          <div style={{
            padding: '6px 16px',
            borderRadius: 12,
            background: currentPath === '/profile' ? 'rgba(79, 216, 234, 0.15)' : 'transparent',
            boxShadow: currentPath === '/profile' ? '0 0 12px rgba(79, 216, 234, 0.3)' : 'none'
          }}>
            <User size={20} color={currentPath === '/profile' ? '#4FD8EA' : '#94a3b8'} />
          </div>
          <span>Profile</span>
        </button>
      </nav>
    </>
  );
}

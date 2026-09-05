import React, { useState } from 'react';
import { 
  Lock, 
  Mail, 
  Phone, 
  Eye, 
  EyeOff, 
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  User,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { authService, PRESET_USERS } from '../services/authService';

export default function LoginView({ currentUser, onLoginSuccess, onNavigate }) {
  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'signup'
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Login form states — default to Citizen Scientist Volunteer
  const [emailOrPhone, setEmailOrPhone] = useState('responder@drishti.ai');
  const [password, setPassword] = useState('drishti2026');

  // Sign up form states
  const [signupName, setSignupName] = useState('');
  const [signupRole, setSignupRole] = useState('Citizen Scientist');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');

  const navigateToGIS = (user) => {
    if (onLoginSuccess && user) {
      onLoginSuccess(user);
    } else if (onNavigate) {
      onNavigate('gis');
    } else {
      window.location.href = '/app';
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    try {
      setLoading(true);
      const user = await authService.login(emailOrPhone, password);
      setSuccessMsg(`Authenticated as ${user.name} (${user.role}). Redirecting...`);
      setTimeout(() => {
        navigateToGIS(user);
      }, 400);
    } catch (err) {
      setErrorMsg(err.message || 'Login failed. Please check your credentials.');
      setLoading(false);
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (signupPassword !== signupConfirmPassword) {
      setErrorMsg('Passwords do not match. Please re-enter.');
      return;
    }

    try {
      setLoading(true);
      const user = await authService.signup({
        name: signupName,
        email: signupEmail,
        phone: signupPhone,
        password: signupPassword,
        role: signupRole
      });
      setSuccessMsg(`Account created for ${user.name}! Redirecting to Command Center...`);
      setTimeout(() => {
        navigateToGIS(user);
      }, 500);
    } catch (err) {
      setErrorMsg(err.message || 'Sign up failed. Please check your details.');
      setLoading(false);
    }
  };

  const handleSocialLogin = (provider = 'google') => {
    try {
      setLoading(true);
      const user = authService.loginAsGuest(provider);
      setSuccessMsg(`Signed in as ${user.name}! Redirecting to Command Center...`);
      setTimeout(() => {
        navigateToGIS(user);
      }, 400);
    } catch (err) {
      setErrorMsg(err.message || 'Social login failed.');
      setLoading(false);
    }
  };

  const handleQuickFill = (type) => {
    setErrorMsg('');
    if (type === 'responder') {
      setEmailOrPhone(PRESET_USERS.responder.email);
      setPassword(PRESET_USERS.responder.password);
      setSuccessMsg('Loaded preset: Community Responder (Citizen Scientist).');
    } else if (type === 'officer') {
      setEmailOrPhone(PRESET_USERS.officer.email);
      setPassword(PRESET_USERS.officer.password);
      setSuccessMsg('Loaded preset: SDMA Operations Officer (Official Admin).');
    } else if (type === 'sdrf') {
      setEmailOrPhone(PRESET_USERS.sdrf.email);
      setPassword(PRESET_USERS.sdrf.password);
      setSuccessMsg('Loaded preset: SDRF Quick Response Lead (Field Responder).');
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        backgroundColor: '#070A10',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        padding: '24px 16px',
        overflowY: 'auto',
        boxSizing: 'border-box'
      }}
    >
      {/* Top Bar with "Back to GIS Command Center" and optional Active User Pill */}
      <div
        style={{
          width: '100%',
          maxWidth: 960,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16,
          zIndex: 10,
          flexWrap: 'wrap',
          gap: 12
        }}
      >
        <button
          type="button"
          onClick={() => navigateToGIS(currentUser)}
          style={{
            background: 'rgba(16, 21, 33, 0.85)',
            border: '1px solid rgba(120, 140, 180, 0.3)',
            borderRadius: 8,
            padding: '8px 14px',
            color: '#CBD5E1',
            fontSize: '0.78rem',
            fontWeight: 700,
            fontFamily: 'Space Grotesk, sans-serif',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
            transition: 'all 0.15s ease'
          }}
          onMouseOver={(e) => { e.currentTarget.style.borderColor = '#35D8FF'; e.currentTarget.style.color = '#35D8FF'; }}
          onMouseOut={(e) => { e.currentTarget.style.borderColor = 'rgba(120, 140, 180, 0.3)'; e.currentTarget.style.color = '#CBD5E1'; }}
        >
          <ArrowLeft size={15} />
          <span>Back to GIS Command Center</span>
        </button>

        {currentUser && (
          <div
            style={{
              background: 'rgba(53, 216, 255, 0.08)',
              border: '1px solid rgba(53, 216, 255, 0.3)',
              borderRadius: 8,
              padding: '6px 12px',
              fontSize: '0.74rem',
              color: '#CBD5E1',
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}
          >
            <span style={{ color: '#9AA5B8' }}>Active User:</span>
            <strong style={{ color: '#FFFFFF' }}>{currentUser.name}</strong>
            <span style={{ color: '#35D8FF', fontWeight: 700 }}>• {currentUser.role}</span>
          </div>
        )}
      </div>

      {/* Centered Split-Screen Container matching Screen 8 */}
      <div className="login-split-card" style={{ margin: 'auto 0' }}>
        {/* LEFT COLUMN: Rainy Mountain Landscape & Ministry Credentials */}
        <div className="login-visual-panel">
          {/* Top DRISHTI AI Branding Over Image */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 10,
                background: 'linear-gradient(135deg, rgba(53, 216, 255, 0.3), rgba(139, 108, 255, 0.35))',
                border: '1px solid rgba(53, 216, 255, 0.55)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 20px rgba(53, 216, 255, 0.4)'
              }}
            >
              <Lock size={20} color="#35D8FF" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: '1.35rem', fontWeight: 900, color: '#FFFFFF', letterSpacing: '0.04em', fontFamily: 'Space Grotesk, sans-serif' }}>
                  DRISHTI <span style={{ color: '#35D8FF' }}>AI</span>
                </span>
                <span style={{ fontSize: '0.62rem', color: '#35D8FF', background: 'rgba(53, 216, 255, 0.12)', border: '1px solid rgba(53, 216, 255, 0.35)', padding: '1px 6px', borderRadius: 4, fontWeight: 800, fontFamily: 'Space Grotesk, sans-serif' }}>
                  MEGHALAYA
                </span>
              </div>
              <div style={{ fontSize: '0.66rem', color: '#CBD5E1', fontWeight: 600, letterSpacing: '0.02em', marginTop: 2 }}>
                Landslide Early Warning & Risk Intelligence Platform
              </div>
            </div>
          </div>

          {/* Overlaid Bottom Items matching Screen 8 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* 4 Core Value Bullets */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.8rem', color: '#FFFFFF', fontWeight: 700, fontFamily: 'Space Grotesk, sans-serif' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#35D8FF', boxShadow: '0 0 8px #35D8FF' }} />
                <span>AI-Powered Monitoring</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#FF3B6B', boxShadow: '0 0 8px #FF3B6B' }} />
                <span>Real-time Alerts</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#8B6CFF', boxShadow: '0 0 8px #8B6CFF' }} />
                <span>Multi-language Support</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#39D98A', boxShadow: '0 0 8px #39D98A' }} />
                <span>Offline First</span>
              </div>
            </div>

            {/* MDoNER Ministry Badge matching Screen 8 */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                background: 'rgba(7, 10, 16, 0.82)',
                backdropFilter: 'blur(12px)',
                padding: '10px 14px',
                borderRadius: 8,
                border: '1px solid rgba(120, 140, 180, 0.25)',
                marginTop: 4
              }}
            >
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: '50%',
                  background: 'rgba(255, 216, 77, 0.15)',
                  border: '1px solid rgba(255, 216, 77, 0.45)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.05rem',
                  flexShrink: 0
                }}
              >
                🏛️
              </div>
              <div>
                <span style={{ fontSize: '0.88rem', fontWeight: 900, color: '#FFFFFF', fontFamily: 'Space Grotesk, sans-serif' }}>
                  MDoNER
                </span>
                <span style={{ fontSize: '0.64rem', color: '#9AA5B8', display: 'block', lineHeight: 1.25 }}>
                  Ministry of Development of North Eastern Region, India
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Modern Glass Card matching Screen 8 */}
        <div
          style={{
            background: 'var(--bg-surface)',
            padding: '36px 32px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            gap: 16
          }}
        >
          {/* Active Session shortcut if already logged in */}
          {currentUser && (
            <div
              style={{
                background: 'rgba(53, 216, 255, 0.08)',
                border: '1px solid rgba(53, 216, 255, 0.3)',
                borderRadius: 8,
                padding: '10px 14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 10
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.74rem' }}>
                <CheckCircle2 size={16} color="#35D8FF" />
                <div>
                  <span style={{ color: '#9AA5B8' }}>Logged in as: </span>
                  <strong style={{ color: '#FFFFFF' }}>{currentUser.name}</strong>
                  <span style={{ color: '#35D8FF', marginLeft: 4 }}>({currentUser.role})</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => navigateToGIS(currentUser)}
                style={{
                  background: '#35D8FF',
                  color: '#070A10',
                  border: 'none',
                  borderRadius: 6,
                  padding: '5px 10px',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4
                }}
              >
                <span>Continue</span>
                <ChevronRight size={12} />
              </button>
            </div>
          )}

          {/* Tabs: Login | Sign Up with underline matching Screen 8 */}
          <div
            style={{
              display: 'flex',
              borderBottom: '1px solid rgba(120, 140, 180, 0.2)',
              position: 'relative'
            }}
          >
            <button
              type="button"
              onClick={() => { setActiveTab('login'); setErrorMsg(''); setSuccessMsg(''); }}
              style={{
                flex: 1,
                padding: '10px 0',
                background: 'transparent',
                border: 'none',
                color: activeTab === 'login' ? '#FFFFFF' : '#9AA5B8',
                fontSize: '0.88rem',
                fontWeight: 800,
                fontFamily: 'Space Grotesk, sans-serif',
                cursor: 'pointer',
                position: 'relative'
              }}
            >
              Login
              {activeTab === 'login' && (
                <div style={{ position: 'absolute', bottom: -1, left: '25%', right: '25%', height: 2.5, background: 'linear-gradient(90deg, #8B6CFF, #35D8FF)', boxShadow: '0 0 10px #8B6CFF' }} />
              )}
            </button>

            <button
              type="button"
              onClick={() => { setActiveTab('signup'); setErrorMsg(''); setSuccessMsg(''); }}
              style={{
                flex: 1,
                padding: '10px 0',
                background: 'transparent',
                border: 'none',
                color: activeTab === 'signup' ? '#FFFFFF' : '#9AA5B8',
                fontSize: '0.88rem',
                fontWeight: 800,
                fontFamily: 'Space Grotesk, sans-serif',
                cursor: 'pointer',
                position: 'relative'
              }}
            >
              Sign Up
              {activeTab === 'signup' && (
                <div style={{ position: 'absolute', bottom: -1, left: '25%', right: '25%', height: 2.5, background: 'linear-gradient(90deg, #FF4DB8, #8B6CFF)', boxShadow: '0 0 10px #FF4DB8' }} />
              )}
            </button>
          </div>

          {/* Feedback banners */}
          {errorMsg && (
            <div style={{ background: 'rgba(255, 59, 107, 0.15)', border: '1px solid rgba(255, 59, 107, 0.45)', borderRadius: 6, padding: '8px 12px', color: '#FF3B6B', fontSize: '0.74rem', display: 'flex', alignItems: 'center', gap: 6 }}>
              <AlertCircle size={14} />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div style={{ background: 'rgba(57, 217, 138, 0.15)', border: '1px solid rgba(57, 217, 138, 0.45)', borderRadius: 6, padding: '8px 12px', color: '#39D98A', fontSize: '0.74rem', display: 'flex', alignItems: 'center', gap: 6 }}>
              <CheckCircle2 size={14} />
              <span>{successMsg}</span>
            </div>
          )}

          {/* TAB 1: LOGIN FORM matching Screen 8 */}
          {activeTab === 'login' && (
            <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: '0.72rem', color: '#9AA5B8', fontWeight: 600, display: 'block', marginBottom: 5 }}>
                  Email / Phone
                </label>
                <input
                  type="text"
                  required
                  value={emailOrPhone}
                  onChange={(e) => setEmailOrPhone(e.target.value)}
                  className="command-input"
                  placeholder="Enter email or phone"
                  style={{ fontSize: '0.78rem', padding: '9px 12px' }}
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                  <label style={{ fontSize: '0.72rem', color: '#9AA5B8', fontWeight: 600 }}>
                    Password
                  </label>
                  <span
                    onClick={() => setSuccessMsg('Quick Demo Access: Click the Quick Fill buttons below or use password "drishti2026".')}
                    style={{ fontSize: '0.7rem', color: '#35D8FF', cursor: 'pointer', fontWeight: 600 }}
                  >
                    Forgot Password?
                  </span>
                </div>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="command-input"
                    placeholder="Enter password"
                    style={{ fontSize: '0.78rem', padding: '9px 36px 9px 12px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: 10, top: 10, background: 'none', border: 'none', color: '#5C677D', cursor: 'pointer' }}
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.74rem', color: '#CBD5E1', cursor: 'pointer', userSelect: 'none' }}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={{ accentColor: '#8B6CFF', width: 14, height: 14 }}
                />
                <span>Remember me</span>
              </label>

              {/* [ Login ] Button matching Screen 8 */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '12px 0',
                  borderRadius: 8,
                  border: 'none',
                  background: 'linear-gradient(135deg, #8B6CFF 0%, #FF4DB8 100%)',
                  color: '#FFFFFF',
                  fontSize: '0.88rem',
                  fontWeight: 800,
                  fontFamily: 'Space Grotesk, sans-serif',
                  letterSpacing: '0.04em',
                  cursor: loading ? 'wait' : 'pointer',
                  boxShadow: '0 4px 20px rgba(255, 77, 184, 0.45)',
                  marginTop: 4,
                  transition: 'transform 0.15s ease',
                  opacity: loading ? 0.8 : 1
                }}
                onMouseOver={(e) => { if (!loading) e.currentTarget.style.transform = 'scale(1.02)'; }}
                onMouseOut={(e) => { if (!loading) e.currentTarget.style.transform = 'scale(1)'; }}
              >
                {loading ? 'Authenticating...' : 'Login'}
              </button>

              {/* Demo Quick Fill Presets (3 Roles) */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6, marginTop: 2 }}>
                <button
                  type="button"
                  onClick={() => handleQuickFill('responder')}
                  style={{
                    background: 'rgba(53, 216, 255, 0.08)',
                    border: '1px solid rgba(53, 216, 255, 0.25)',
                    borderRadius: 6,
                    padding: '6px 4px',
                    fontSize: '0.66rem',
                    color: '#35D8FF',
                    cursor: 'pointer',
                    fontWeight: 700,
                    textAlign: 'center'
                  }}
                  title="Login as Citizen Scientist volunteer"
                >
                  ⚡ Volunteer
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickFill('officer')}
                  style={{
                    background: 'rgba(255, 157, 61, 0.08)',
                    border: '1px solid rgba(255, 157, 61, 0.25)',
                    borderRadius: 6,
                    padding: '6px 4px',
                    fontSize: '0.66rem',
                    color: '#FF9D3D',
                    cursor: 'pointer',
                    fontWeight: 700,
                    textAlign: 'center'
                  }}
                  title="Login as SDMA Emergency Official"
                >
                  ⚡ SDMA Officer
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickFill('sdrf')}
                  style={{
                    background: 'rgba(57, 217, 138, 0.08)',
                    border: '1px solid rgba(57, 217, 138, 0.25)',
                    borderRadius: 6,
                    padding: '6px 4px',
                    fontSize: '0.66rem',
                    color: '#39D98A',
                    cursor: 'pointer',
                    fontWeight: 700,
                    textAlign: 'center'
                  }}
                  title="Login as SDRF Field Responder"
                >
                  ⚡ SDRF Lead
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: SIGN UP FORM */}
          {activeTab === 'signup' && (
            <form onSubmit={handleSignupSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ fontSize: '0.72rem', color: '#9AA5B8', fontWeight: 600, display: 'block', marginBottom: 4 }}>
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={signupName}
                  onChange={(e) => setSignupName(e.target.value)}
                  className="command-input"
                  placeholder="e.g. Lee Montaria"
                  style={{ fontSize: '0.78rem', padding: '8px 12px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.72rem', color: '#9AA5B8', fontWeight: 600, display: 'block', marginBottom: 4 }}>
                  Role & Sector
                </label>
                <select
                  value={signupRole}
                  onChange={(e) => setSignupRole(e.target.value)}
                  className="command-input"
                  style={{ fontSize: '0.78rem', padding: '8px 12px' }}
                >
                  <option value="Citizen Scientist">Citizen Scientist (Early Warning Volunteer)</option>
                  <option value="Field Responder">Field Responder (ASDMA / SDRF Team)</option>
                  <option value="Official Admin">SDMA Emergency Operations Center Official</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ fontSize: '0.72rem', color: '#9AA5B8', fontWeight: 600, display: 'block', marginBottom: 4 }}>
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    className="command-input"
                    placeholder="name@drishti.ai"
                    style={{ fontSize: '0.78rem', padding: '8px 10px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.72rem', color: '#9AA5B8', fontWeight: 600, display: 'block', marginBottom: 4 }}>
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={signupPhone}
                    onChange={(e) => setSignupPhone(e.target.value)}
                    className="command-input"
                    placeholder="+91-XXXXXXXXXX"
                    style={{ fontSize: '0.78rem', padding: '8px 10px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ fontSize: '0.72rem', color: '#9AA5B8', fontWeight: 600, display: 'block', marginBottom: 4 }}>
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    className="command-input"
                    placeholder="Min. 6 chars"
                    style={{ fontSize: '0.78rem', padding: '8px 10px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.72rem', color: '#9AA5B8', fontWeight: 600, display: 'block', marginBottom: 4 }}>
                    Confirm
                  </label>
                  <input
                    type="password"
                    required
                    value={signupConfirmPassword}
                    onChange={(e) => setSignupConfirmPassword(e.target.value)}
                    className="command-input"
                    placeholder="Re-enter"
                    style={{ fontSize: '0.78rem', padding: '8px 10px' }}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '11px 0',
                  borderRadius: 8,
                  border: 'none',
                  background: 'linear-gradient(135deg, #FF4DB8 0%, #8B6CFF 100%)',
                  color: '#FFFFFF',
                  fontSize: '0.86rem',
                  fontWeight: 800,
                  fontFamily: 'Space Grotesk, sans-serif',
                  letterSpacing: '0.04em',
                  cursor: loading ? 'wait' : 'pointer',
                  boxShadow: '0 4px 18px rgba(255, 77, 184, 0.4)',
                  marginTop: 6,
                  opacity: loading ? 0.8 : 1
                }}
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>
          )}

          {/* Social login divider matching Screen 8 */}
          <div style={{ textAlign: 'center', position: 'relative', marginTop: 4 }}>
            <div style={{ borderTop: '1px solid rgba(120, 140, 180, 0.18)', position: 'absolute', top: '50%', left: 0, right: 0 }} />
            <span style={{ background: 'var(--bg-surface)', padding: '0 10px', fontSize: '0.7rem', color: '#5C677D', position: 'relative' }}>
              or continue with
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 14 }}>
            <button
              type="button"
              onClick={() => handleSocialLogin('google')}
              style={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                background: 'var(--bg-surface-elevated)',
                border: '1px solid rgba(120, 140, 180, 0.25)',
                color: '#FFFFFF',
                fontSize: '1rem',
                fontWeight: 800,
                fontFamily: 'Space Grotesk, sans-serif',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'transform 0.15s ease'
              }}
              title="Sign in with Google"
              onMouseOver={(e) => { e.currentTarget.style.borderColor = '#35D8FF'; e.currentTarget.style.transform = 'scale(1.08)'; }}
              onMouseOut={(e) => { e.currentTarget.style.borderColor = 'rgba(120, 140, 180, 0.25)'; e.currentTarget.style.transform = 'scale(1)'; }}
            >
              G
            </button>
            <button
              type="button"
              onClick={() => handleSocialLogin('phone')}
              style={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                background: 'var(--bg-surface-elevated)',
                border: '1px solid rgba(120, 140, 180, 0.25)',
                color: '#35D8FF',
                fontSize: '1rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'transform 0.15s ease'
              }}
              title="Sign in with Phone (SMS OTP)"
              onMouseOver={(e) => { e.currentTarget.style.borderColor = '#8B6CFF'; e.currentTarget.style.transform = 'scale(1.08)'; }}
              onMouseOut={(e) => { e.currentTarget.style.borderColor = 'rgba(120, 140, 180, 0.25)'; e.currentTarget.style.transform = 'scale(1)'; }}
            >
              <Phone size={17} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { 
  Lock, 
  Mail, 
  Phone, 
  Eye, 
  EyeOff, 
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Shield,
  User,
  Sparkles,
  Activity,
  Compass,
  Database,
  WifiOff,
  Radio,
  ExternalLink,
  MapPin,
  ChevronRight
} from 'lucide-react';
import { 
  Card, 
  Button, 
  SecondaryButton, 
  Input, 
  Select, 
  Tabs, 
  Badge 
} from '../components/ui';
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

  const handleQuickFill = (type) => {
    setErrorMsg('');
    if (type === 'responder') {
      setEmailOrPhone(PRESET_USERS.responder.email);
      setPassword(PRESET_USERS.responder.password);
      setSuccessMsg('Loaded preset: Community Responder (Citizen Scientist). Click Sign In to enter.');
    } else if (type === 'officer') {
      setEmailOrPhone(PRESET_USERS.officer.email);
      setPassword(PRESET_USERS.officer.password);
      setSuccessMsg('Loaded preset: SDMA Operations Officer (Official Admin). Click Sign In to enter.');
    } else if (type === 'sdrf') {
      setEmailOrPhone(PRESET_USERS.sdrf.email);
      setPassword(PRESET_USERS.sdrf.password);
      setSuccessMsg('Loaded preset: SDRF Quick Response Lead (Field Responder). Click Sign In to enter.');
    }
  };

  return (
    <div className="login-landing-root">
      <style>{`
        .login-landing-root {
          min-height: 100vh;
          width: 100%;
          background: #08080A;
          background-image: 
            radial-gradient(circle at 18% 25%, rgba(79, 111, 255, 0.12) 0%, transparent 45%),
            radial-gradient(circle at 82% 75%, rgba(49, 183, 122, 0.08) 0%, transparent 40%),
            linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
          background-size: 100% 100%, 100% 100%, 48px 48px, 48px 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 32px 20px;
          box-sizing: border-box;
          font-family: var(--font-body, -apple-system, BlinkMacSystemFont, sans-serif);
          color: var(--text-primary, #F5F5F5);
        }

        .login-landing-wrapper {
          width: 100%;
          max-width: 1240px;
          display: flex;
          flex-direction: column;
          gap: 32px;
          margin: 0 auto;
        }

        @media (min-width: 980px) {
          .login-landing-wrapper {
            flex-direction: row;
            align-items: stretch;
            gap: 48px;
          }
          .login-hero-pane {
            flex: 1.15;
          }
          .login-card-pane {
            flex: 0.95;
            max-width: 480px;
          }
        }

        .login-hero-pane {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 16px 8px;
        }

        .pulse-beacon {
          display: inline-block;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #10B981;
          box-shadow: 0 0 10px #10B981;
          animation: beaconPulse 2s infinite ease-in-out;
        }

        @keyframes beaconPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(1.3); }
        }

        .pillar-card {
          background: rgba(18, 20, 26, 0.7);
          border: 1px solid rgba(255, 255, 255, 0.07);
          border-radius: 10px;
          padding: 14px 16px;
          display: flex;
          gap: 12px;
          align-items: flex-start;
          transition: all 0.2s ease;
        }

        .pillar-card:hover {
          background: rgba(24, 28, 38, 0.9);
          border-color: rgba(79, 111, 255, 0.3);
          transform: translateY(-1px);
        }

        .preset-chip-card {
          background: rgba(18, 20, 26, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 8px;
          padding: 10px 12px;
          cursor: pointer;
          display: flex;
          justify-content: space-between;
          align-items: center;
          transition: all 0.15s ease;
        }

        .preset-chip-card:hover {
          background: rgba(79, 111, 255, 0.12);
          border-color: rgba(79, 111, 255, 0.4);
          transform: translateX(2px);
        }

        .direct-jury-cta {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: linear-gradient(135deg, rgba(79, 111, 255, 0.16) 0%, rgba(108, 131, 255, 0.08) 100%);
          border: 1px solid rgba(79, 111, 255, 0.35);
          border-radius: 12px;
          padding: 14px 18px;
          cursor: pointer;
          color: #F5F5F5;
          text-decoration: none;
          transition: all 0.2s ease;
        }

        .direct-jury-cta:hover {
          background: linear-gradient(135deg, rgba(79, 111, 255, 0.28) 0%, rgba(108, 131, 255, 0.18) 100%);
          border-color: rgba(79, 111, 255, 0.6);
          box-shadow: 0 0 20px rgba(79, 111, 255, 0.25);
          transform: translateY(-2px);
        }
      `}</style>

      <div className="login-landing-wrapper">
        {/* LEFT COLUMN: Mission Context & System Intelligence */}
        <div className="login-hero-pane">
          <div>
            {/* National & State Government Accreditation Banner */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 9999, padding: '6px 14px', marginBottom: 20 }}>
              <span className="pulse-beacon" />
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#31B77A' }}>
                Operational Early Warning Grid
              </span>
              <span style={{ color: 'rgba(255,255,255,0.2)' }}>•</span>
              <span style={{ fontSize: 11, color: 'var(--text-secondary, #A1A1A1)', letterSpacing: '0.04em' }}>
                East Khasi Hills, Meghalaya Pilot
              </span>
            </div>

            {/* Platform Emblem & Title */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
              <img 
                src="/logo.jpg" 
                alt="DRISHTI-AI Emblem"
                style={{ 
                  width: 52, 
                  height: 52, 
                  borderRadius: 14, 
                  objectFit: 'cover',
                  border: '1px solid rgba(79, 111, 255, 0.45)',
                  boxShadow: '0 0 24px rgba(79, 111, 255, 0.4)',
                  flexShrink: 0
                }}
              />
              <div>
                <h1 style={{ fontSize: 26, fontWeight: 800, margin: 0, letterSpacing: '-0.03em', lineHeight: 1.1, color: '#F5F5F5' }}>
                  DRISHTI-AI
                </h1>
                <span style={{ fontSize: 12, color: 'var(--text-secondary, #A1A1A1)', letterSpacing: '0.04em', textTransform: 'uppercase', fontWeight: 600 }}>
                  Disaster Risk Intelligence & Geospatial Hazard Tracker
                </span>
              </div>
            </div>

            {/* Core Mission Headline */}
            <h2 style={{ fontSize: 32, fontWeight: 700, lineHeight: 1.25, margin: '18px 0 12px 0', letterSpacing: '-0.02em', textWrap: 'balance' }}>
              Real-time Landslide Early Warning & Evacuation Intelligence
            </h2>

            <p style={{ fontSize: 15, lineHeight: 1.6, color: 'var(--text-secondary, #A1A1A1)', margin: '0 0 28px 0', maxWidth: 580, textWrap: 'pretty' }}>
              Protecting lives, arterial highways (<code style={{ color: '#5C78FF', background: 'rgba(79,111,255,0.1)', padding: '2px 6px', borderRadius: 4 }}>NH-6</code>, <code style={{ color: '#5C78FF', background: 'rgba(79,111,255,0.1)', padding: '2px 6px', borderRadius: 4 }}>NH-106</code>), and 10 mountainous micro-zones in Cherrapunji and Mawsynram with physics-informed AI modeling and zero-signal offline routing.
            </p>

            {/* 4 Core Pillars Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12, marginBottom: 28 }}>
              <div className="pillar-card">
                <div style={{ color: '#4F6FFF', padding: 4 }}><Activity size={20} /></div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#F5F5F5', marginBottom: 2 }}>Physics-Informed Ensemble</div>
                  <div style={{ fontSize: 12, color: '#A1A1A1', lineHeight: 1.4 }}>XGBoost + Random Forest with SHAP factor attribution & 7-day CI forecast.</div>
                </div>
              </div>

              <div className="pillar-card">
                <div style={{ color: '#10B981', padding: 4 }}><Compass size={20} /></div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#F5F5F5', marginBottom: 2 }}>Dijkstra Safe Corridors</div>
                  <div style={{ fontSize: 12, color: '#A1A1A1', lineHeight: 1.4 }}>Dynamic road blockage simulation & ranked multi-path emergency evacuation.</div>
                </div>
              </div>

              <div className="pillar-card">
                <div style={{ color: '#F59E0B', padding: 4 }}><Database size={20} /></div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#F5F5F5', marginBottom: 2 }}>5-Source Autonomous Ingestion</div>
                  <div style={{ fontSize: 12, color: '#A1A1A1', lineHeight: 1.4 }}>Open-Meteo, IMD bulletins, DEM slope gradients & OSM highway cut-slopes.</div>
                </div>
              </div>

              <div className="pillar-card">
                <div style={{ color: '#A78BFA', padding: 4 }}><WifiOff size={20} /></div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#F5F5F5', marginBottom: 2 }}>Zero-Signal Offline Nav</div>
                  <div style={{ fontSize: 12, color: '#A1A1A1', lineHeight: 1.4 }}>Hardware GNSS compass HUD, offline map packs & Web Audio SOS distress whistle.</div>
                </div>
              </div>
            </div>

            {/* Live Pilot Region Telemetry Ticker */}
            <div style={{ 
              background: 'rgba(14, 16, 22, 0.9)', 
              border: '1px solid rgba(255, 255, 255, 0.08)', 
              borderRadius: 12, 
              padding: '12px 18px',
              display: 'flex',
              flexWrap: 'wrap',
              gap: 20,
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 24
            }}>
              <div>
                <span style={{ fontSize: 11, color: '#6F6F6F', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block' }}>Sector</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#F5F5F5' }}>East Khasi Hills</span>
              </div>
              <div>
                <span style={{ fontSize: 11, color: '#6F6F6F', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block' }}>Zones Monitored</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#4F6FFF' }}>10 Micro-Zones</span>
              </div>
              <div>
                <span style={{ fontSize: 11, color: '#6F6F6F', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block' }}>Safe Shelters</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#31B77A' }}>28 Havens Listed</span>
              </div>
              <div>
                <span style={{ fontSize: 11, color: '#6F6F6F', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block' }}>Model Precision</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#F59E0B' }}>96.5% Precision</span>
              </div>
            </div>
          </div>

          {/* Prominent Direct Guest / Jury Access CTA */}
          <div 
            className="direct-jury-cta"
            onClick={() => navigateToGIS(currentUser)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter') navigateToGIS(currentUser); }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(79, 111, 255, 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#5C78FF' }}>
                <Sparkles size={20} />
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#FFFFFF' }}>
                  Explore Live Command Center
                </div>
                <div style={{ fontSize: 12, color: 'rgba(255, 255, 255, 0.65)' }}>
                  Instant Guest & Jury Evaluation Access (Bypass Login)
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#5C78FF', fontWeight: 600, fontSize: 13 }}>
              <span>Enter GIS Map</span>
              <ArrowRight size={16} />
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Interactive Operator Access & Sign-In Card */}
        <div className="login-card-pane">
          <Card padding={28} style={{ background: 'rgba(16, 17, 22, 0.95)', border: '1px solid rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(20px)', borderRadius: 16 }}>
            {/* Card Brand Header */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: 20 }}>
              <img
                src="/logo.jpg"
                alt="DRISHTI-AI"
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  objectFit: 'cover',
                  marginBottom: 10,
                  border: '1px solid rgba(79, 111, 255, 0.45)',
                  boxShadow: '0 0 16px rgba(79, 111, 255, 0.35)'
                }}
              />
              <h3 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary, #F5F5F5)', margin: 0 }}>
                Operator Authentication
              </h3>
              <p style={{ fontSize: 13, color: 'var(--text-secondary, #A1A1A1)', margin: '4px 0 0 0' }}>
                Authorized SDMA, SDRF & Citizen Responder Gate
              </p>
            </div>

            {/* Active Session Notification (if already logged in) */}
            {currentUser && (
              <div style={{
                background: 'rgba(49, 183, 122, 0.1)',
                border: '1px solid rgba(49, 183, 122, 0.35)',
                borderRadius: 10,
                padding: '12px 14px',
                marginBottom: 18,
                display: 'flex',
                flexDirection: 'column',
                gap: 8
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className="pulse-beacon" />
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#31B77A' }}>
                      Active Session: {currentUser.name}
                    </span>
                  </div>
                  <Badge variant="safe" size="sm">{currentUser.role || 'Active'}</Badge>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  fullWidth
                  onClick={() => navigateToGIS(currentUser)}
                  style={{ marginTop: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                >
                  <span>Continue to Command Center</span>
                  <ArrowRight size={14} />
                </Button>
              </div>
            )}

            {/* Tab Switcher */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 18 }}>
              <Tabs
                tabs={[
                  { id: 'login', label: 'Operator Sign In' },
                  { id: 'signup', label: 'Register Responder' }
                ]}
                activeTab={activeTab}
                onChange={(tab) => {
                  setActiveTab(tab);
                  setErrorMsg('');
                  setSuccessMsg('');
                }}
              />
            </div>

            {/* Feedback Banners */}
            {errorMsg && (
              <div
                style={{
                  padding: '10px 12px',
                  backgroundColor: 'var(--risk-critical-bg, rgba(255, 77, 90, 0.1))',
                  border: '1px solid var(--risk-critical-border, rgba(255, 77, 90, 0.35))',
                  borderRadius: 8,
                  color: 'var(--risk-critical, #FF4D5A)',
                  fontSize: 12,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  marginBottom: 14
                }}
              >
                <AlertCircle size={15} style={{ flexShrink: 0 }} />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div
                style={{
                  padding: '10px 12px',
                  backgroundColor: 'var(--risk-safe-bg, rgba(49, 183, 122, 0.1))',
                  border: '1px solid var(--risk-safe-border, rgba(49, 183, 122, 0.35))',
                  borderRadius: 8,
                  color: 'var(--risk-safe, #31B77A)',
                  fontSize: 12,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  marginBottom: 14
                }}
              >
                <CheckCircle2 size={15} style={{ flexShrink: 0 }} />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Sign In Form */}
            {activeTab === 'login' && (
              <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <Input
                  label="Official Email or Phone"
                  icon={Mail}
                  fullWidth
                  value={emailOrPhone}
                  onChange={(e) => setEmailOrPhone(e.target.value)}
                  placeholder="e.g. responder@drishti.ai"
                  required
                />

                <div style={{ position: 'relative' }}>
                  <Input
                    label="Security Passcode"
                    icon={Lock}
                    type={showPassword ? 'text' : 'password'}
                    fullWidth
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter passcode"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: 12,
                      top: 32,
                      color: 'var(--text-muted, #6F6F6F)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary, #A1A1A1)', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={rememberMe} 
                      onChange={(e) => setRememberMe(e.target.checked)}
                      style={{ accentColor: '#4F6FFF' }}
                    />
                    <span>Remember terminal</span>
                  </label>
                  <span style={{ color: '#4F6FFF', cursor: 'pointer' }} onClick={() => setErrorMsg('Contact SDMA Admin at sdma@meghalaya.gov.in for passcode reset.')}>
                    Need access?
                  </span>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  loading={loading}
                  style={{ marginTop: 4, height: 42, fontSize: 14, fontWeight: 600 }}
                >
                  {loading ? 'Verifying Credentials...' : 'Sign In to Command Center'}
                </Button>
              </form>
            )}

            {/* Sign Up Form */}
            {activeTab === 'signup' && (
              <form onSubmit={handleSignupSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <Input
                  label="Full Name"
                  icon={User}
                  fullWidth
                  value={signupName}
                  onChange={(e) => setSignupName(e.target.value)}
                  placeholder="e.g. Wanphrang Lyngdoh"
                  required
                />

                <Select
                  label="Deployment Role"
                  value={signupRole}
                  onChange={setSignupRole}
                  options={[
                    'Citizen Scientist',
                    'Community Responder',
                    'PWD Road Inspector',
                    'SDMA Operations Officer'
                  ]}
                />

                <Input
                  label="Official Email"
                  icon={Mail}
                  type="email"
                  fullWidth
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  placeholder="name@drishti.ai"
                  required
                />

                <Input
                  label="Contact Phone"
                  icon={Phone}
                  type="tel"
                  fullWidth
                  value={signupPhone}
                  onChange={(e) => setSignupPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  required
                />

                <Input
                  label="Create Passcode"
                  icon={Lock}
                  type="password"
                  fullWidth
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  placeholder="Min 8 characters"
                  required
                />

                <Input
                  label="Confirm Passcode"
                  icon={Lock}
                  type="password"
                  fullWidth
                  value={signupConfirmPassword}
                  onChange={(e) => setSignupConfirmPassword(e.target.value)}
                  placeholder="Confirm passcode"
                  required
                />

                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  loading={loading}
                  style={{ marginTop: 6, height: 42, fontSize: 14, fontWeight: 600 }}
                >
                  {loading ? 'Registering...' : 'Register Responder Profile'}
                </Button>
              </form>
            )}

            {/* Demo Operator Presets (1-Click for Jury / Demo) */}
            <div style={{ marginTop: 22, paddingTop: 16, borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted, #6F6F6F)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Demo Operator Presets
                </span>
                <span style={{ fontSize: 11, color: '#4F6FFF' }}>1-Click Load</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div className="preset-chip-card" onClick={() => handleQuickFill('responder')}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#31B77A' }} />
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#F5F5F5' }}>Citizen Volunteer</div>
                      <div style={{ fontSize: 11, color: '#A1A1A1' }}>Sohra Escarpment Sector</div>
                    </div>
                  </div>
                  <Badge variant="safe" size="sm">Field Active</Badge>
                </div>

                <div className="preset-chip-card" onClick={() => handleQuickFill('officer')}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#4F6FFF' }} />
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#F5F5F5' }}>SDMA Operations Officer</div>
                      <div style={{ fontSize: 11, color: '#A1A1A1' }}>State Emergency HQ</div>
                    </div>
                  </div>
                  <Badge variant="info" size="sm">Admin Level</Badge>
                </div>

                <div className="preset-chip-card" onClick={() => handleQuickFill('sdrf')}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#FF4D5A' }} />
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#F5F5F5' }}>SDRF Quick Response Lead</div>
                      <div style={{ fontSize: 11, color: '#A1A1A1' }}>Search & Rescue Squad</div>
                    </div>
                  </div>
                  <Badge variant="critical" size="sm">Emergency</Badge>
                </div>
              </div>
            </div>

            {/* National Emergency Hotline Strip */}
            <div style={{ marginTop: 18, paddingTop: 12, borderTop: '1px solid rgba(255, 255, 255, 0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 11, color: '#6F6F6F' }}>
              <span>🚨 National Emergency: <strong style={{ color: '#F5F5F5' }}>112</strong></span>
              <span>SDMA Helpline: <strong style={{ color: '#F5F5F5' }}>1070</strong></span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

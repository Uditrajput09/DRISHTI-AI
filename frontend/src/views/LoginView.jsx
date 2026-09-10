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
  User,
  Sparkles,
  Shield,
  Zap,
  Compass,
  Radio,
  Activity
} from 'lucide-react';
import { 
  Select 
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
      }, 350);
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
      }, 400);
    } catch (err) {
      setErrorMsg(err.message || 'Sign up failed. Please check your details.');
      setLoading(false);
    }
  };

  const handleQuickFill = (type) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(15);
    }
    setErrorMsg('');
    if (type === 'responder') {
      setEmailOrPhone(PRESET_USERS.responder.email);
      setPassword(PRESET_USERS.responder.password);
      setSuccessMsg('Loaded preset: Community Responder');
    } else if (type === 'officer') {
      setEmailOrPhone(PRESET_USERS.officer.email);
      setPassword(PRESET_USERS.officer.password);
      setSuccessMsg('Loaded preset: SDMA Operations Officer');
    } else if (type === 'sdrf') {
      setEmailOrPhone(PRESET_USERS.sdrf.email);
      setPassword(PRESET_USERS.sdrf.password);
      setSuccessMsg('Loaded preset: SDRF Quick Response Lead');
    }
  };

  return (
    <div className="aegis-format-root">
      <style>{`
        .aegis-format-root {
          min-height: 100vh;
          width: 100%;
          background: #08080A;
          background-image: 
            radial-gradient(circle at 15% 20%, rgba(79, 111, 255, 0.09) 0%, transparent 45%),
            radial-gradient(circle at 85% 70%, rgba(49, 183, 122, 0.05) 0%, transparent 40%),
            linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
          background-size: 100% 100%, 100% 100%, 48px 48px, 48px 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 36px 24px;
          box-sizing: border-box;
          font-family: var(--font-primary, 'Inter', -apple-system, BlinkMacSystemFont, sans-serif);
          color: #F5F5F5;
        }

        .aegis-format-container {
          width: 100%;
          max-width: 1220px;
          display: flex;
          flex-direction: column;
          gap: 40px;
          margin: 0 auto;
        }

        /* Desktop Layout (>= 980px): Classic 2-column Reference Format */
        @media (min-width: 980px) {
          .aegis-format-container {
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
            gap: 60px;
          }
          .mobile-auth-brand {
            display: none !important;
          }
        }

        /* Mobile / Android Layout (< 980px): Minimal, Clean, Focused App Login */
        @media (max-width: 979px) {
          .aegis-format-root {
            padding: 16px 12px;
            align-items: center;
          }
          .aegis-format-container {
            gap: 0;
            max-width: 420px;
          }
          .hero-intelligence-col {
            display: none !important;
          }
          .auth-card-col {
            width: 100%;
            max-width: 410px;
            margin: 0 auto;
          }
          .auth-surface-box {
            padding: 26px 20px !important;
            border-radius: 16px !important;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.45) !important;
          }
          .mobile-auth-brand {
            display: flex !important;
          }
        }

        /* ─── MOBILE BRAND HEADER (Tailored for Android Mobile App) ─── */
        .mobile-auth-brand {
          display: none;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
          padding-bottom: 16px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.07);
        }

        .mobile-brand-emblem-box {
          width: 44px;
          height: 44px;
          border-radius: 11px;
          overflow: hidden;
          background: #14161F;
          border: 1px solid rgba(79, 111, 255, 0.35);
          box-shadow: 0 0 14px rgba(79, 111, 255, 0.25);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .mobile-brand-emblem-box img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .mobile-brand-text-wrap {
          display: flex;
          flex-direction: column;
        }

        .mobile-brand-title {
          font-size: 18px;
          font-weight: 800;
          color: #F5F5F5;
          letter-spacing: -0.01em;
          line-height: 1.2;
        }

        .mobile-brand-subtitle {
          font-size: 11px;
          color: #8E929D;
          display: flex;
          align-items: center;
          gap: 5px;
          margin-top: 2px;
        }

        .mobile-brand-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #31B77A;
          box-shadow: 0 0 6px #31B77A;
        }

        /* ─── LEFT COLUMN: HERO INTELLIGENCE PRESENTATION ─── */
        .hero-intelligence-col {
          flex: 1.15;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .hero-brand-header {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .hero-logo-box {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          overflow: hidden;
          background: #14161F;
          border: 1px solid rgba(79, 111, 255, 0.35);
          box-shadow: 0 0 14px rgba(79, 111, 255, 0.25);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .hero-logo-box img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .hero-brand-meta {
          display: flex;
          flex-direction: column;
        }

        .hero-brand-name {
          font-size: 18px;
          font-weight: 800;
          letter-spacing: -0.01em;
          color: #F5F5F5;
          line-height: 1.1;
        }

        .hero-brand-tag {
          font-size: 10px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #8E929D;
          font-weight: 600;
          margin-top: 2px;
        }

        .hero-main-title {
          font-size: 42px;
          font-weight: 800;
          line-height: 1.15;
          letter-spacing: -0.03em;
          color: #F5F5F5;
          margin: 0;
          text-wrap: balance;
        }

        .hero-main-title span {
          color: #4F6FFF;
          display: block;
        }

        .hero-main-desc {
          font-size: 15px;
          line-height: 1.6;
          color: #A1A1A1;
          margin: 0;
          max-width: 540px;
          text-wrap: pretty;
        }

        /* 3 Pills in Horizontal Row */
        .hero-pillars-row {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
        }

        .hero-pill-item {
          flex: 1;
          min-width: 140px;
          background: rgba(18, 20, 26, 0.65);
          border: 1px solid rgba(255, 255, 255, 0.07);
          border-radius: 10px;
          padding: 10px 14px;
          display: flex;
          align-items: center;
          gap: 10px;
          transition: all 0.2s ease;
        }

        .hero-pill-item:hover {
          background: rgba(24, 28, 38, 0.85);
          border-color: rgba(79, 111, 255, 0.35);
          transform: translateY(-1px);
        }

        .hero-pill-icon {
          width: 28px;
          height: 28px;
          border-radius: 7px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .hero-pill-title {
          font-size: 12px;
          font-weight: 600;
          color: #F5F5F5;
          line-height: 1.2;
        }

        .hero-pill-sub {
          font-size: 10px;
          color: #8E929D;
          margin-top: 1px;
        }

        /* Live Intelligence Signal Card (matching Aegis bottom card format) */
        .live-signal-card {
          background: rgba(16, 17, 22, 0.85);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 14px;
          padding: 16px 20px;
          display: flex;
          flex-direction: column;
          gap: 14px;
          backdrop-filter: blur(16px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
        }

        .signal-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .signal-header-left {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .signal-live-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #31B77A;
          box-shadow: 0 0 8px #31B77A;
          animation: pulseGreen 2s infinite ease-in-out;
        }

        @keyframes pulseGreen {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(1.3); }
        }

        .signal-title-meta {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: #31B77A;
        }

        .signal-location-tag {
          font-size: 12px;
          color: #F5F5F5;
          font-weight: 600;
        }

        .signal-badge-live {
          font-size: 11px;
          color: #4F6FFF;
          background: rgba(79, 111, 255, 0.12);
          border: 1px solid rgba(79, 111, 255, 0.3);
          border-radius: 9999px;
          padding: 3px 10px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .signal-metrics-row {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          padding: 10px 14px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }

        .signal-metric-item {
          display: flex;
          flex-direction: column;
        }

        .signal-metric-label {
          font-size: 10px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #6F6F6F;
          margin-bottom: 2px;
        }

        .signal-metric-val {
          font-size: 14px;
          font-weight: 700;
          color: #F5F5F5;
        }

        .signal-ai-insight-pill {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          color: #A1A1A1;
          background: rgba(79, 111, 255, 0.06);
          border: 1px solid rgba(79, 111, 255, 0.2);
          border-radius: 8px;
          padding: 6px 10px;
        }

        .signal-ai-insight-pill strong {
          color: #4F6FFF;
        }

        /* ─── RIGHT COLUMN: CLEAN MINIMAL AUTH CARD ─── */
        .auth-card-col {
          flex: 0.92;
          width: 100%;
          max-width: 440px;
          margin: 0 auto;
        }

        .auth-surface-box {
          background: #101114;
          border: 1px solid rgba(255, 255, 255, 0.09);
          border-radius: 18px;
          padding: 34px 30px;
          box-shadow: 0 16px 48px rgba(0, 0, 0, 0.5);
          display: flex;
          flex-direction: column;
          backdrop-filter: blur(20px);
        }

        .auth-header-block {
          margin-bottom: 20px;
        }

        .auth-title-text {
          font-size: 24px;
          font-weight: 700;
          color: #F5F5F5;
          margin: 0 0 6px 0;
          letter-spacing: -0.02em;
        }

        .auth-subtitle-text {
          font-size: 13px;
          color: #8E929D;
          margin: 0;
        }

        .active-session-chip {
          background: rgba(49, 183, 122, 0.08);
          border: 1px solid rgba(49, 183, 122, 0.25);
          border-radius: 10px;
          padding: 10px 14px;
          margin-bottom: 18px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .active-session-meta {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          color: #31B77A;
          font-weight: 500;
        }

        .active-session-btn {
          background: #31B77A;
          color: #FFFFFF;
          border: none;
          border-radius: 6px;
          padding: 4px 10px;
          font-size: 11px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .input-group-field {
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-bottom: 14px;
        }

        .field-label-text {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: #8E929D;
        }

        .field-input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .field-input-icon {
          position: absolute;
          left: 14px;
          color: #6F6F6F;
          pointer-events: none;
          display: flex;
          align-items: center;
        }

        .field-text-input {
          width: 100%;
          height: 44px;
          background: #16171B;
          border: 1px solid rgba(255, 255, 255, 0.09);
          border-radius: 8px;
          padding: 0 14px 0 40px;
          color: #F5F5F5;
          font-size: 14px;
          font-family: inherit;
          box-sizing: border-box;
          transition: all 0.15s ease;
        }

        .field-text-input:focus {
          outline: none;
          border-color: #4F6FFF;
          box-shadow: 0 0 0 3px rgba(79, 111, 255, 0.15);
          background: #1A1C22;
        }

        .field-text-input::placeholder {
          color: #55555C;
        }

        .field-eye-btn {
          position: absolute;
          right: 12px;
          background: none;
          border: none;
          color: #6F6F6F;
          cursor: pointer;
          padding: 4px;
          display: flex;
          align-items: center;
          transition: color 0.15s ease;
        }

        .field-eye-btn:hover {
          color: #A1A1A1;
        }

        .auth-row-options {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 12px;
          margin: 4px 0 16px 0;
        }

        .auth-checkbox-label {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #A1A1A1;
          cursor: pointer;
          user-select: none;
        }

        .auth-checkbox-label input[type="checkbox"] {
          accent-color: #4F6FFF;
          cursor: pointer;
        }

        .auth-action-link {
          color: #4F6FFF;
          cursor: pointer;
          transition: color 0.15s ease;
          font-weight: 500;
        }

        .auth-action-link:hover {
          color: #6C83FF;
          text-decoration: underline;
        }

        .primary-sign-btn {
          width: 100%;
          height: 44px;
          background: #4F6FFF;
          color: #FFFFFF;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.2s ease;
          touch-action: manipulation;
        }

        .primary-sign-btn:hover {
          background: #5C78FF;
          box-shadow: 0 4px 16px rgba(79, 111, 255, 0.35);
          transform: translateY(-1px);
        }

        .primary-sign-btn:active {
          transform: translateY(0);
        }

        .primary-sign-btn:disabled {
          opacity: 0.65;
          cursor: not-allowed;
          transform: none;
        }

        .auth-switch-prompt {
          text-align: center;
          font-size: 12px;
          color: #8E929D;
          margin-top: 16px;
        }

        .auth-switch-btn {
          background: none;
          border: none;
          color: #4F6FFF;
          font-weight: 600;
          cursor: pointer;
          padding: 0 4px;
          font-size: 12px;
        }

        .auth-switch-btn:hover {
          text-decoration: underline;
          color: #6C83FF;
        }

        /* 1-Click Demo Presets */
        .demo-presets-row {
          margin-top: 18px;
          padding-top: 16px;
          border-top: 1px solid rgba(255, 255, 255, 0.07);
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .presets-title-meta {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: #6F6F6F;
        }

        .presets-button-grid {
          display: flex;
          gap: 6px;
        }

        .preset-quick-pill {
          flex: 1;
          height: 32px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 6px;
          color: #A1A1A1;
          font-size: 11px;
          font-weight: 500;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
          transition: all 0.15s ease;
          padding: 0 4px;
        }

        .preset-quick-pill:hover {
          background: rgba(79, 111, 255, 0.08);
          border-color: rgba(79, 111, 255, 0.3);
          color: #F5F5F5;
        }

        .preset-quick-pill.active {
          background: rgba(79, 111, 255, 0.12);
          border-color: rgba(79, 111, 255, 0.45);
          color: #F5F5F5;
        }

        .preset-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
        }

        .auth-bottom-status-strip {
          margin-top: 20px;
          padding-top: 12px;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 11px;
          color: #66666F;
        }

        .guest-bypass-text-btn {
          background: none;
          border: none;
          color: #8E929D;
          font-size: 12px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          margin-top: 12px;
          width: 100%;
          transition: color 0.15s ease;
        }

        .guest-bypass-text-btn:hover {
          color: #F5F5F5;
        }
      `}</style>

      <div className="aegis-format-container">
        {/* ─── LEFT COLUMN: HERO INTELLIGENCE PRESENTATION (Desktop Only) ─── */}
        <div className="hero-intelligence-col">
          {/* Brand Header */}
          <div className="hero-brand-header">
            <div className="hero-logo-box">
              <img src="/logo.jpg" alt="DRISHTI-AI Emblem" />
            </div>
            <div className="hero-brand-meta">
              <span className="hero-brand-name">DRISHTI-AI</span>
              <span className="hero-brand-tag">DISASTER RISK INTELLIGENCE & EARLY WARNING</span>
            </div>
          </div>

          {/* Big Bold Headline (matching Aegis format) */}
          <h1 className="hero-main-title">
            Intelligence for
            <span>every terrain decision.</span>
          </h1>

          {/* Subtitle / Value Proposition */}
          <p className="hero-main-desc">
            Transform meteorological, geotechnical, and highway sensor telemetry into actionable early warning with physics-informed AI modeling and zero-signal evacuation routing.
          </p>

          {/* 3 Pill Feature Items in a Clean Row */}
          <div className="hero-pillars-row">
            <div className="hero-pill-item">
              <div className="hero-pill-icon" style={{ background: 'rgba(79, 111, 255, 0.15)', color: '#4F6FFF' }}>
                <Zap size={16} />
              </div>
              <div>
                <div className="hero-pill-title">AI Predictions</div>
                <div className="hero-pill-sub">XGBoost + SHAP</div>
              </div>
            </div>

            <div className="hero-pill-item">
              <div className="hero-pill-icon" style={{ background: 'rgba(49, 183, 122, 0.15)', color: '#31B77A' }}>
                <Compass size={16} />
              </div>
              <div>
                <div className="hero-pill-title">Dijkstra Corridors</div>
                <div className="hero-pill-sub">Safe Evacuation</div>
              </div>
            </div>

            <div className="hero-pill-item">
              <div className="hero-pill-icon" style={{ background: 'rgba(232, 184, 75, 0.15)', color: '#E8B84B' }}>
                <Radio size={16} />
              </div>
              <div>
                <div className="hero-pill-title">5-Source Ingestion</div>
                <div className="hero-pill-sub">Open-Meteo & IMD</div>
              </div>
            </div>
          </div>

          {/* Live Telemetry Signal Card (matching Aegis preview card format) */}
          <div className="live-signal-card">
            <div className="signal-card-header">
              <div className="signal-header-left">
                <span className="signal-live-dot" />
                <span className="signal-title-meta">AI PREDICTIVE HAZARD SIGNAL</span>
                <span style={{ color: 'rgba(255, 255, 255, 0.2)' }}>•</span>
                <span className="signal-location-tag">East Khasi Hills (NH-6 / NH-106)</span>
              </div>
              <div className="signal-badge-live">
                <Activity size={12} />
                <span>Live Grid</span>
              </div>
            </div>

            <div className="signal-metrics-row">
              <div className="signal-metric-item">
                <span className="signal-metric-label">MODEL PRECISION</span>
                <span className="signal-metric-val" style={{ color: '#31B77A' }}>96.5% Precision</span>
              </div>
              <div className="signal-metric-item">
                <span className="signal-metric-label">MONITORED ZONES</span>
                <span className="signal-metric-val" style={{ color: '#4F6FFF' }}>10 Micro-Zones</span>
              </div>
              <div className="signal-metric-item">
                <span className="signal-metric-label">SAFE SHELTERS</span>
                <span className="signal-metric-val" style={{ color: '#E8B84B' }}>28 Havens Listed</span>
              </div>
            </div>

            <div className="signal-ai-insight-pill">
              <Sparkles size={14} style={{ color: '#4F6FFF', flexShrink: 0 }} />
              <span>
                <strong>AI Geotechnical Insight:</strong> Antecedent Rainfall Index at 42.8mm; Cherrapunji Escarpment slope factor remains below critical failure threshold.
              </span>
            </div>
          </div>
        </div>

        {/* ─── RIGHT COLUMN: CLEAN MINIMAL AUTH CARD ─── */}
        <div className="auth-card-col">
          <div className="auth-surface-box">
            {/* Mobile Brand Header (Displayed only on Android mobile screens) */}
            <div className="mobile-auth-brand">
              <div className="mobile-brand-emblem-box">
                <img src="/logo.jpg" alt="DRISHTI-AI Logo" />
              </div>
              <div className="mobile-brand-text-wrap">
                <span className="mobile-brand-title">DRISHTI-AI</span>
                <span className="mobile-brand-subtitle">
                  <span className="mobile-brand-dot" />
                  <span>Early Warning & Risk Intelligence</span>
                </span>
              </div>
            </div>

            {/* Active Session Notification (if already logged in) */}
            {currentUser && (
              <div className="active-session-chip">
                <div className="active-session-meta">
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#31B77A', boxShadow: '0 0 6px #31B77A' }} />
                  <span>Signed in as <strong>{currentUser.name}</strong></span>
                </div>
                <button
                  type="button"
                  className="active-session-btn"
                  onClick={() => {
                    if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(10);
                    navigateToGIS(currentUser);
                  }}
                >
                  <span>Continue →</span>
                </button>
              </div>
            )}

            {/* Heading & Subtitle */}
            <div className="auth-header-block">
              <h2 className="auth-title-text">
                {activeTab === 'login' ? 'Welcome back' : 'Register Responder'}
              </h2>
              <p className="auth-subtitle-text">
                {activeTab === 'login' 
                  ? 'Sign in to access your field terminal.'
                  : 'Join the East Khasi Hills emergency network.'}
              </p>
            </div>

            {/* Error / Success Alerts */}
            {errorMsg && (
              <div style={{
                background: 'rgba(255, 77, 90, 0.1)',
                border: '1px solid rgba(255, 77, 90, 0.3)',
                color: '#FF4D5A',
                padding: '10px 12px',
                borderRadius: 8,
                fontSize: 12,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginBottom: 14
              }}>
                <AlertCircle size={15} style={{ flexShrink: 0 }} />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div style={{
                background: 'rgba(49, 183, 122, 0.1)',
                border: '1px solid rgba(49, 183, 122, 0.3)',
                color: '#31B77A',
                padding: '10px 12px',
                borderRadius: 8,
                fontSize: 12,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginBottom: 14
              }}>
                <CheckCircle2 size={15} style={{ flexShrink: 0 }} />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Form Mode: Login */}
            {activeTab === 'login' ? (
              <form onSubmit={handleLoginSubmit}>
                {/* Username or Email */}
                <div className="input-group-field">
                  <label className="field-label-text">Official Email or Phone</label>
                  <div className="field-input-wrapper">
                    <span className="field-input-icon"><Mail size={16} /></span>
                    <input
                      type="text"
                      inputMode="email"
                      autoComplete="email"
                      spellCheck="false"
                      className="field-text-input"
                      value={emailOrPhone}
                      onChange={(e) => setEmailOrPhone(e.target.value)}
                      placeholder="e.g. responder@drishti.ai"
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="input-group-field">
                  <label className="field-label-text">Security Passcode</label>
                  <div className="field-input-wrapper">
                    <span className="field-input-icon"><Lock size={16} /></span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      spellCheck="false"
                      className="field-text-input"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter passcode"
                      required
                    />
                    <button
                      type="button"
                      className="field-eye-btn"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Hide passcode' : 'Show passcode'}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Remember me & Forgot Passcode */}
                <div className="auth-row-options">
                  <label className="auth-checkbox-label">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                    />
                    <span>Remember terminal</span>
                  </label>
                  <span
                    className="auth-action-link"
                    onClick={() => setErrorMsg('For passcode reset, contact SDMA Emergency Desk at sdma@meghalaya.gov.in')}
                  >
                    Forgot passcode?
                  </span>
                </div>

                {/* Full-width Primary Sign In Button */}
                <button
                  type="submit"
                  className="primary-sign-btn"
                  disabled={loading}
                >
                  {loading ? 'Authenticating...' : 'Sign In to Command Center'}
                </button>

                {/* Switch between Login and Signup */}
                <div className="auth-switch-prompt">
                  <span>Don't have an account?</span>
                  <button
                    type="button"
                    className="auth-switch-btn"
                    onClick={() => {
                      setActiveTab('signup');
                      setErrorMsg('');
                      setSuccessMsg('');
                    }}
                  >
                    Create an account
                  </button>
                </div>

                {/* Explore as Guest / Jury Bypass */}
                <button
                  type="button"
                  className="guest-bypass-text-btn"
                  onClick={() => {
                    if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(15);
                    navigateToGIS(currentUser);
                  }}
                >
                  <Sparkles size={13} style={{ color: '#4F6FFF' }} />
                  <span>Explore as Guest / Jury (Bypass Login) →</span>
                </button>

                {/* 1-Click Demo Presets for Jury / Evaluator convenience */}
                <div className="demo-presets-row">
                  <div className="presets-title-meta">
                    <span>Demo Operator Presets</span>
                    <span style={{ color: '#4F6FFF' }}>1-Click</span>
                  </div>
                  <div className="presets-button-grid">
                    <button
                      type="button"
                      className={`preset-quick-pill ${emailOrPhone === PRESET_USERS.responder.email ? 'active' : ''}`}
                      onClick={() => handleQuickFill('responder')}
                    >
                      <span className="preset-dot" style={{ background: '#31B77A' }} />
                      <span>Volunteer</span>
                    </button>
                    <button
                      type="button"
                      className={`preset-quick-pill ${emailOrPhone === PRESET_USERS.officer.email ? 'active' : ''}`}
                      onClick={() => handleQuickFill('officer')}
                    >
                      <span className="preset-dot" style={{ background: '#4F6FFF' }} />
                      <span>SDMA Admin</span>
                    </button>
                    <button
                      type="button"
                      className={`preset-quick-pill ${emailOrPhone === PRESET_USERS.sdrf.email ? 'active' : ''}`}
                      onClick={() => handleQuickFill('sdrf')}
                    >
                      <span className="preset-dot" style={{ background: '#FF4D5A' }} />
                      <span>SDRF Lead</span>
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              /* Form Mode: Register */
              <form onSubmit={handleSignupSubmit}>
                <div className="input-group-field">
                  <label className="field-label-text">Full Name</label>
                  <div className="field-input-wrapper">
                    <span className="field-input-icon"><User size={16} /></span>
                    <input
                      type="text"
                      autoComplete="name"
                      spellCheck="false"
                      className="field-text-input"
                      value={signupName}
                      onChange={(e) => setSignupName(e.target.value)}
                      placeholder="Wanphrang Lyngdoh"
                      required
                    />
                  </div>
                </div>

                <div className="input-group-field">
                  <label className="field-label-text">Deployment Role</label>
                  <Select
                    value={signupRole}
                    onChange={setSignupRole}
                    options={[
                      'Citizen Scientist',
                      'Community Responder',
                      'PWD Road Inspector',
                      'SDMA Operations Officer'
                    ]}
                  />
                </div>

                <div className="input-group-field">
                  <label className="field-label-text">Official Email</label>
                  <div className="field-input-wrapper">
                    <span className="field-input-icon"><Mail size={16} /></span>
                    <input
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      spellCheck="false"
                      className="field-text-input"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      placeholder="name@drishti.ai"
                      required
                    />
                  </div>
                </div>

                <div className="input-group-field">
                  <label className="field-label-text">Contact Phone</label>
                  <div className="field-input-wrapper">
                    <span className="field-input-icon"><Phone size={16} /></span>
                    <input
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      spellCheck="false"
                      className="field-text-input"
                      value={signupPhone}
                      onChange={(e) => setSignupPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      required
                    />
                  </div>
                </div>

                <div className="input-group-field">
                  <label className="field-label-text">Create Passcode</label>
                  <div className="field-input-wrapper">
                    <span className="field-input-icon"><Lock size={16} /></span>
                    <input
                      type="password"
                      autoComplete="new-password"
                      spellCheck="false"
                      className="field-text-input"
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      placeholder="Min 8 characters"
                      required
                    />
                  </div>
                </div>

                <div className="input-group-field">
                  <label className="field-label-text">Confirm Passcode</label>
                  <div className="field-input-wrapper">
                    <span className="field-input-icon"><Lock size={16} /></span>
                    <input
                      type="password"
                      autoComplete="new-password"
                      spellCheck="false"
                      className="field-text-input"
                      value={signupConfirmPassword}
                      onChange={(e) => setSignupConfirmPassword(e.target.value)}
                      placeholder="Confirm passcode"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="primary-sign-btn"
                  disabled={loading}
                  style={{ marginTop: 8 }}
                >
                  {loading ? 'Registering...' : 'Create Account'}
                </button>

                <div className="auth-switch-prompt">
                  <span>Already have an account?</span>
                  <button
                    type="button"
                    className="auth-switch-btn"
                    onClick={() => {
                      setActiveTab('login');
                      setErrorMsg('');
                      setSuccessMsg('');
                    }}
                  >
                    Sign In
                  </button>
                </div>
              </form>
            )}

            {/* Bottom Status Strip */}
            <div className="auth-bottom-status-strip">
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Shield size={13} style={{ color: '#6F6F6F' }} />
                <span>Secure Mobile Terminal</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#31B77A', boxShadow: '0 0 6px #31B77A' }} />
                <span style={{ color: '#8E929D' }}>Grid Online</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

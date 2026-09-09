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
  Shield,
  User,
  Sparkles,
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
        backgroundColor: 'var(--bg-main)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 16px',
        boxSizing: 'border-box'
      }}
    >
      {/* Back button */}
      <div style={{ width: '100%', maxWidth: 440, marginBottom: 16 }}>
        <button
          onClick={() => onNavigate && onNavigate('gis')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            color: 'var(--text-secondary)',
            fontSize: 12,
            cursor: 'pointer'
          }}
        >
          <ArrowLeft size={14} />
          <span>Back to Live Command Center</span>
        </button>
      </div>

      {/* Main Auth Card */}
      <Card padding={28} style={{ width: '100%', maxWidth: 440 }}>
        {/* Brand Header */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: 20 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 'var(--radius-input)',
              backgroundColor: 'var(--brand-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              marginBottom: 12
            }}
          >
            <Shield size={24} />
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
            DRISHTI-AI Command Center
          </h2>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
            Disaster Risk Intelligence & Early Warning Network
          </p>
        </div>

        {/* Tab Switcher */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
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
              backgroundColor: 'var(--risk-critical-bg)',
              border: '1px solid var(--risk-critical-border)',
              borderRadius: 'var(--radius-input)',
              color: 'var(--risk-critical)',
              fontSize: 12,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 16
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
              backgroundColor: 'var(--risk-safe-bg)',
              border: '1px solid var(--risk-safe-border)',
              borderRadius: 'var(--radius-input)',
              color: 'var(--risk-safe)',
              fontSize: 12,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 16
            }}
          >
            <CheckCircle2 size={15} style={{ flexShrink: 0 }} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Login Form */}
        {activeTab === 'login' && (
          <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Input
              label="Email or Official Phone"
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
                  color: 'var(--text-muted)',
                  cursor: 'pointer'
                }}
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>

            <Button
              type="submit"
              variant="primary"
              fullWidth
              loading={loading}
              style={{ marginTop: 6 }}
            >
              {loading ? 'Authenticating Operator...' : 'Sign In to Command Center'}
            </Button>
          </form>
        )}

        {/* Sign Up Form */}
        {activeTab === 'signup' && (
          <form onSubmit={handleSignupSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
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
              style={{ marginTop: 6 }}
            >
              {loading ? 'Registering...' : 'Complete Responder Registration'}
            </Button>
          </form>
        )}

        {/* Preset Operator Quick Access */}
        <div style={{ marginTop: 22, paddingTop: 18, borderTop: '1px solid var(--border-primary)' }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 10 }}>
            Demo Operator Presets
          </span>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <SecondaryButton
              size="sm"
              fullWidth
              onClick={() => handleQuickFill('responder')}
              style={{ justifyContent: 'space-between' }}
            >
              <span>Citizen Volunteer (Sohra)</span>
              <Badge variant="safe" size="sm">Field Active</Badge>
            </SecondaryButton>

            <SecondaryButton
              size="sm"
              fullWidth
              onClick={() => handleQuickFill('officer')}
              style={{ justifyContent: 'space-between' }}
            >
              <span>SDMA Operations Officer</span>
              <Badge variant="info" size="sm">Admin Level</Badge>
            </SecondaryButton>

            <SecondaryButton
              size="sm"
              fullWidth
              onClick={() => handleQuickFill('sdrf')}
              style={{ justifyContent: 'space-between' }}
            >
              <span>SDRF Quick Response Lead</span>
              <Badge variant="critical" size="sm">Emergency Lead</Badge>
            </SecondaryButton>
          </div>
        </div>
      </Card>
    </div>
  );
}

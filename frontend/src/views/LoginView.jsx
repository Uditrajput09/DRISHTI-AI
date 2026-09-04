import React, { useState } from 'react';
import { ShieldAlert, Lock, Mail, Phone, User, ArrowRight, CheckCircle2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { authService } from '../services/authService';

export default function LoginView({ onLoginSuccess, onNavigate }) {
  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'signup'
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Login Form state
  const [loginField, setLoginField] = useState('responder@drishti.ai');
  const [loginPassword, setLoginPassword] = useState('drishti2026');

  // Sign Up Form state
  const [fullName, setFullName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Forgot password modal state
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!loginField.trim()) {
      setErrorMsg('Please enter your email or phone number.');
      return;
    }
    if (!loginPassword) {
      setErrorMsg('Please enter your password.');
      return;
    }

    try {
      setLoading(true);
      const user = await authService.login(loginField, loginPassword);
      if (onLoginSuccess) onLoginSuccess(user);
      if (onNavigate) onNavigate('/home');
    } catch (err) {
      setErrorMsg(err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!fullName.trim()) {
      setErrorMsg('Full name is required.');
      return;
    }
    if (!signupEmail.trim() || !signupEmail.includes('@')) {
      setErrorMsg('Please provide a valid email address.');
      return;
    }
    if (!signupPassword || signupPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }
    if (signupPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    try {
      setLoading(true);
      const user = await authService.signup({
        name: fullName,
        email: signupEmail,
        phone: signupPhone,
        password: signupPassword
      });
      if (onLoginSuccess) onLoginSuccess(user);
      if (onNavigate) onNavigate('/home');
    } catch (err) {
      setErrorMsg(err.message || 'Account creation failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = () => {
    const user = authService.loginAsGuest();
    if (onLoginSuccess) onLoginSuccess(user);
    if (onNavigate) onNavigate('/home');
  };

  const handleResetSubmit = (e) => {
    e.preventDefault();
    if (!resetEmail || !resetEmail.includes('@')) {
      return;
    }
    setResetSuccess(true);
    setTimeout(() => {
      setResetSuccess(false);
      setIsForgotModalOpen(false);
      setResetEmail('');
    }, 2500);
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#060608',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 16px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background Subtle Holographic Glow Elements */}
      <div style={{
        position: 'absolute',
        top: '-15%',
        left: '-10%',
        width: '50vw',
        height: '50vw',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255, 110, 199, 0.12) 0%, rgba(0,0,0,0) 70%)',
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-15%',
        right: '-10%',
        width: '50vw',
        height: '50vw',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(79, 216, 234, 0.12) 0%, rgba(0,0,0,0) 70%)',
        pointerEvents: 'none'
      }} />

      {/* Main Centered Holographic Card */}
      <div className="holo-card" style={{
        width: '100%',
        maxWidth: 440,
        padding: '36px 32px',
        position: 'relative',
        zIndex: 10
      }}>
        {/* App Logo & Header */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            width: 64,
            height: 64,
            margin: '0 auto 16px',
            borderRadius: 20,
            background: 'linear-gradient(135deg, #FF6EC7, #7873F5, #4FD8EA)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 28px rgba(120, 115, 245, 0.6)'
          }}>
            <ShieldAlert size={34} color="#ffffff" />
          </div>
          <h1 className="holo-gradient-text" style={{ fontSize: '1.85rem', margin: '0 0 6px' }}>
            NER SentinelWatch
          </h1>
          <p className="holo-body" style={{ fontSize: '0.86rem', color: '#94a3b8', margin: 0 }}>
            AI-Powered Landslide Early Warning System
          </p>
        </div>

        {/* Tab Switch: Login vs Sign Up */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          marginBottom: 28,
          position: 'relative'
        }}>
          <button
            onClick={() => { setActiveTab('login'); setErrorMsg(''); }}
            style={{
              flex: 1,
              padding: '12px 0',
              background: 'none',
              border: 'none',
              color: activeTab === 'login' ? '#ffffff' : '#94a3b8',
              fontFamily: 'Space Grotesk, sans-serif',
              fontWeight: 600,
              fontSize: '0.98rem',
              cursor: 'pointer',
              position: 'relative',
              transition: 'color 0.2s ease'
            }}
          >
            Log In
            {activeTab === 'login' && (
              <div style={{
                position: 'absolute',
                bottom: -1,
                left: 0,
                right: 0,
                height: 3,
                background: 'linear-gradient(90deg, #FF6EC7, #4FD8EA)',
                borderRadius: '3px 3px 0 0',
                boxShadow: '0 0 10px #FF6EC7'
              }} />
            )}
          </button>

          <button
            onClick={() => { setActiveTab('signup'); setErrorMsg(''); }}
            style={{
              flex: 1,
              padding: '12px 0',
              background: 'none',
              border: 'none',
              color: activeTab === 'signup' ? '#ffffff' : '#94a3b8',
              fontFamily: 'Space Grotesk, sans-serif',
              fontWeight: 600,
              fontSize: '0.98rem',
              cursor: 'pointer',
              position: 'relative',
              transition: 'color 0.2s ease'
            }}
          >
            Create Account
            {activeTab === 'signup' && (
              <div style={{
                position: 'absolute',
                bottom: -1,
                left: 0,
                right: 0,
                height: 3,
                background: 'linear-gradient(90deg, #FF6EC7, #4FD8EA)',
                borderRadius: '3px 3px 0 0',
                boxShadow: '0 0 10px #4FD8EA'
              }} />
            )}
          </button>
        </div>

        {/* Error Banner */}
        {errorMsg && (
          <div style={{
            background: 'rgba(255, 110, 199, 0.15)',
            border: '1px solid rgba(255, 110, 199, 0.4)',
            borderRadius: 12,
            padding: '10px 14px',
            marginBottom: 20,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            color: '#FF9AD7',
            fontSize: '0.84rem'
          }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* TAB 1: LOGIN FORM */}
        {activeTab === 'login' ? (
          <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: 6, fontWeight: 500 }}>
                Email or Mobile Number
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} color="#7873F5" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  placeholder="responder@drishti.ai or +91..."
                  value={loginField}
                  onChange={(e) => setLoginField(e.target.value)}
                  className="holo-input"
                  style={{ width: '100%', paddingLeft: 42 }}
                />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <label style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 500 }}>
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setIsForgotModalOpen(true)}
                  style={{ background: 'none', border: 'none', color: '#4FD8EA', fontSize: '0.78rem', cursor: 'pointer' }}
                >
                  Forgot password?
                </button>
              </div>
              <div style={{ position: 'relative' }}>
                <Lock size={18} color="#7873F5" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="holo-input"
                  style={{ width: '100%', paddingLeft: 42, paddingRight: 42 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(p => !p)}
                  style={{
                    position: 'absolute',
                    right: 14,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#94a3b8',
                    cursor: 'pointer'
                  }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="holo-btn-primary"
              style={{
                width: '100%',
                padding: '14px',
                fontSize: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                marginTop: 6
              }}
            >
              <span>{loading ? 'Authenticating...' : 'Log In'}</span>
              <ArrowRight size={18} />
            </button>
          </form>
        ) : (
          /* TAB 2: SIGN UP FORM */
          <form onSubmit={handleSignupSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: 6, fontWeight: 500 }}>
                Full Name
              </label>
              <div style={{ position: 'relative' }}>
                <User size={18} color="#FF6EC7" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  placeholder="e.g. Daphishisha Kharbhih"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="holo-input"
                  style={{ width: '100%', paddingLeft: 42 }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: 6, fontWeight: 500 }}>
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} color="#7873F5" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="email"
                  placeholder="name@domain.com"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  className="holo-input"
                  style={{ width: '100%', paddingLeft: 42 }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: 6, fontWeight: 500 }}>
                Mobile Number (SMS Alerts)
              </label>
              <div style={{ position: 'relative' }}>
                <Phone size={18} color="#4FD8EA" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={signupPhone}
                  onChange={(e) => setSignupPhone(e.target.value)}
                  className="holo-input"
                  style={{ width: '100%', paddingLeft: 42 }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: 6, fontWeight: 500 }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} color="#7873F5" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="password"
                  placeholder="At least 6 characters"
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  className="holo-input"
                  style={{ width: '100%', paddingLeft: 42 }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: 6, fontWeight: 500 }}>
                Confirm Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} color="#7873F5" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="password"
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="holo-input"
                  style={{ width: '100%', paddingLeft: 42 }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="holo-btn-primary"
              style={{
                width: '100%',
                padding: '14px',
                fontSize: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                marginTop: 6
              }}
            >
              <span>{loading ? 'Creating Account...' : 'Create Account'}</span>
              <ArrowRight size={18} />
            </button>
          </form>
        )}

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '24px 0 18px' }}>
          <div style={{ flex: 1, height: 1, background: 'rgba(255, 255, 255, 0.1)' }} />
          <span style={{ fontSize: '0.74rem', color: '#64748b', textTransform: 'uppercase' }}>or</span>
          <div style={{ flex: 1, height: 1, background: 'rgba(255, 255, 255, 0.1)' }} />
        </div>

        {/* Continue as Guest Button */}
        <button
          onClick={handleGuestLogin}
          className="holo-btn-secondary"
          style={{
            width: '100%',
            padding: '12px',
            fontSize: '0.88rem'
          }}
        >
          Continue as Guest
        </button>
      </div>

      {/* Forgot Password Modal */}
      {isForgotModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 2000,
          backgroundColor: 'rgba(6, 6, 8, 0.85)',
          backdropFilter: 'blur(12px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 16
        }}>
          <div className="holo-card" style={{ width: '100%', maxWidth: 400, padding: 28 }}>
            <h3 className="holo-gradient-text" style={{ fontSize: '1.25rem', marginBottom: 10 }}>
              Reset Password
            </h3>
            <p style={{ fontSize: '0.84rem', color: '#94a3b8', marginBottom: 20 }}>
              Enter your registered email address to receive a secure password reset link.
            </p>

            {resetSuccess ? (
              <div style={{
                background: 'rgba(52, 211, 153, 0.15)',
                border: '1px solid rgba(52, 211, 153, 0.4)',
                borderRadius: 12,
                padding: '14px',
                textAlign: 'center',
                color: '#6EE7B7'
              }}>
                <CheckCircle2 size={24} style={{ margin: '0 auto 8px' }} />
                <p style={{ margin: 0, fontWeight: 600, fontSize: '0.9rem' }}>
                  Reset link sent to email!
                </p>
              </div>
            ) : (
              <form onSubmit={handleResetSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <input
                    type="email"
                    placeholder="Enter your email address"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="holo-input"
                    style={{ width: '100%' }}
                    required
                  />
                </div>
                <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
                  <button
                    type="button"
                    onClick={() => setIsForgotModalOpen(false)}
                    className="holo-btn-secondary"
                    style={{ flex: 1, padding: '10px' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="holo-btn-primary"
                    style={{ flex: 1, padding: '10px' }}
                  >
                    Send Link
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

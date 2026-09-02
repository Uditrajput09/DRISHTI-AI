import React, { useState } from 'react';
import { 
  ShieldCheck, 
  UserCheck, 
  Smartphone, 
  Lock, 
  MapPin, 
  Languages, 
  CheckCircle2, 
  X, 
  ArrowRight,
  Sparkles
} from 'lucide-react';

export default function AuthModal({ isOpen, onClose, currentUser, onLogin }) {
  const [role, setRole] = useState('citizen'); // 'citizen' or 'official'
  const [name, setName] = useState(currentUser?.name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [district, setDistrict] = useState(currentUser?.district || 'East Khasi Hills');
  const [language, setLanguage] = useState(currentUser?.language || 'en');
  const [officialId, setOfficialId] = useState('');
  const [officialDept, setOfficialDept] = useState('DDMA Emergency Operations');
  const [successAnim, setSuccessAnim] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setSuccessAnim(true);
    setTimeout(() => {
      const userObj = {
        role,
        name: name || (role === 'official' ? 'Inspector P. Marbaniang' : 'Community Volunteer'),
        phone: phone || '+91-9876543210',
        district,
        language,
        officialId: role === 'official' ? (officialId || 'DDMA-EKH-2026') : null,
        department: role === 'official' ? officialDept : null,
        avatar: role === 'official' 
          ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
          : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80'
      };
      localStorage.setItem('drishti_current_user', JSON.stringify(userObj));
      onLogin(userObj);
      setSuccessAnim(false);
      onClose();
    }, 600);
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(5, 10, 20, 0.85)',
      backdropFilter: 'blur(16px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 3000,
      padding: 16
    }}>
      <div style={{
        background: 'rgba(15, 23, 42, 0.96)',
        border: '1px solid var(--border-glass-bright)',
        borderRadius: 20,
        boxShadow: '0 24px 64px rgba(0, 0, 0, 0.7)',
        width: '100%',
        maxWidth: 480,
        overflow: 'hidden',
        position: 'relative'
      }}>
        {/* Modal Header */}
        <div style={{
          padding: '20px 24px 16px',
          borderBottom: '1px solid var(--border-glass)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'linear-gradient(135deg, rgba(2, 132, 199, 0.15) 0%, rgba(6, 182, 212, 0.05) 100%)'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Sparkles size={18} color="#06b6d4" />
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
                DRISHTI_Ai Portal Sign In
              </h2>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
              Select your persona to access tailored early warning features
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              border: 'none',
              borderRadius: '50%',
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#94a3b8',
              cursor: 'pointer'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Role Switcher Tabs */}
        <div style={{ padding: '16px 24px 0' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            background: 'rgba(30, 41, 59, 0.6)',
            padding: 4,
            borderRadius: 12,
            border: '1px solid var(--border-glass)'
          }}>
            <button
              type="button"
              onClick={() => setRole('citizen')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: '10px 14px',
                borderRadius: 9,
                border: 'none',
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: '0.82rem',
                transition: 'all 0.2s',
                background: role === 'citizen' ? 'linear-gradient(135deg, #059669 0%, #10b981 100%)' : 'transparent',
                color: role === 'citizen' ? '#ffffff' : '#94a3b8'
              }}
            >
              <UserCheck size={16} />
              <span>Citizen & Responder</span>
            </button>
            <button
              type="button"
              onClick={() => setRole('official')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: '10px 14px',
                borderRadius: 9,
                border: 'none',
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: '0.82rem',
                transition: 'all 0.2s',
                background: role === 'official' ? 'linear-gradient(135deg, #0284c7 0%, #06b6d4 100%)' : 'transparent',
                color: role === 'official' ? '#ffffff' : '#94a3b8'
              }}
            >
              <ShieldCheck size={16} />
              <span>DDMA Official</span>
            </button>
          </div>
        </div>

        {/* Form Fields */}
        <form onSubmit={handleSubmit} style={{ padding: '20px 24px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Name */}
          <div>
            <label style={{ fontSize: '0.76rem', fontWeight: 600, color: '#cbd5e1', display: 'block', marginBottom: 5 }}>
              {role === 'official' ? 'Official Name & Rank' : 'Your Full Name'}
            </label>
            <input
              type="text"
              required
              placeholder={role === 'official' ? 'e.g. Inspector P. Marbaniang' : 'e.g. Daphisha Lyngdoh'}
              value={name}
              onChange={e => setName(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 10,
                background: 'rgba(15, 23, 42, 0.8)',
                border: '1px solid var(--border-glass)',
                color: '#fff',
                fontSize: '0.85rem'
              }}
            />
          </div>

          {/* Phone / Mobile */}
          <div>
            <label style={{ fontSize: '0.76rem', fontWeight: 600, color: '#cbd5e1', display: 'block', marginBottom: 5 }}>
              Mobile Phone (for localized disaster alerts)
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="tel"
                required
                placeholder="+91-8630868896"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px 10px 38px',
                  borderRadius: 10,
                  background: 'rgba(15, 23, 42, 0.8)',
                  border: '1px solid var(--border-glass)',
                  color: '#fff',
                  fontSize: '0.85rem'
                }}
              />
              <Smartphone size={16} color="#94a3b8" style={{ position: 'absolute', left: 12, top: 13 }} />
            </div>
          </div>

          {/* Conditional Official Fields */}
          {role === 'official' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label style={{ fontSize: '0.76rem', fontWeight: 600, color: '#cbd5e1', display: 'block', marginBottom: 5 }}>
                  Officer Badge / ID
                </label>
                <input
                  type="text"
                  placeholder="DDMA-EKH-2026"
                  value={officialId}
                  onChange={e => setOfficialId(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 10,
                    background: 'rgba(15, 23, 42, 0.8)',
                    border: '1px solid var(--border-glass)',
                    color: '#fff',
                    fontSize: '0.82rem'
                  }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.76rem', fontWeight: 600, color: '#cbd5e1', display: 'block', marginBottom: 5 }}>
                  Department
                </label>
                <select
                  value={officialDept}
                  onChange={e => setOfficialDept(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 8px',
                    borderRadius: 10,
                    background: 'rgba(15, 23, 42, 0.8)',
                    border: '1px solid var(--border-glass)',
                    color: '#fff',
                    fontSize: '0.82rem'
                  }}
                >
                  <option value="DDMA Emergency Operations">DDMA Operations</option>
                  <option value="PWD Meghalaya (Roads)">PWD Highway Dept</option>
                  <option value="NDRF / SDRF Team">NDRF / SDRF Rescue</option>
                  <option value="District Magistrate Office">District Magistrate</option>
                </select>
              </div>
            </div>
          )}

          {/* Preferred Language & District */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label style={{ fontSize: '0.76rem', fontWeight: 600, color: '#cbd5e1', display: 'block', marginBottom: 5 }}>
                Alert Language
              </label>
              <select
                value={language}
                onChange={e => setLanguage(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 10,
                  background: 'rgba(15, 23, 42, 0.8)',
                  border: '1px solid var(--border-glass)',
                  color: '#fff',
                  fontSize: '0.82rem'
                }}
              >
                <option value="en">English (Default)</option>
                <option value="kha">Khasi (Meghalaya)</option>
                <option value="hi">Hindi (हिंदी)</option>
                <option value="as">Assamese (অসমীয়া)</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: '0.76rem', fontWeight: 600, color: '#cbd5e1', display: 'block', marginBottom: 5 }}>
                District Location
              </label>
              <input
                type="text"
                disabled
                value="East Khasi Hills"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 10,
                  background: 'rgba(30, 41, 59, 0.4)',
                  border: '1px solid var(--border-glass)',
                  color: '#94a3b8',
                  fontSize: '0.82rem',
                  cursor: 'not-allowed'
                }}
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            style={{
              marginTop: 6,
              padding: '13px 20px',
              borderRadius: 12,
              border: 'none',
              cursor: 'pointer',
              fontWeight: 800,
              fontSize: '0.92rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              background: role === 'official' 
                ? 'linear-gradient(135deg, #0284c7 0%, #06b6d4 100%)' 
                : 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
              color: '#ffffff',
              boxShadow: role === 'official'
                ? '0 6px 20px rgba(6, 182, 212, 0.35)'
                : '0 6px 20px rgba(16, 185, 129, 0.35)',
              transition: 'transform 0.15s ease'
            }}
          >
            {successAnim ? (
              <>
                <CheckCircle2 size={18} />
                <span>Signing you in...</span>
              </>
            ) : (
              <>
                <span>Enter as {role === 'official' ? 'Command Official' : 'Community Responder'}</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

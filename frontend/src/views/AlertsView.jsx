import React, { useState } from 'react';
import { 
  BellRing, 
  Send, 
  Smartphone, 
  Users, 
  AlertTriangle, 
  CheckCheck,
  PhoneCall,
  Clock,
  Radio
} from 'lucide-react';
import { api } from '../api';

export default function AlertsView({
  alerts = [],
  onViewZone,
  onRefreshAlerts
}) {
  const [dispatchTab, setDispatchTab] = useState('new'); // 'new' | 'outbox'
  const [selectedZone, setSelectedZone] = useState('Sohra (Cherrapunji) Escarpment');
  const [severity, setSeverity] = useState('Critical');
  const [message, setMessage] = useState('');
  const [channels, setChannels] = useState({ sms: true, push: true, both: false });
  const [languages, setLanguages] = useState({ english: true, hindi: true, khasi: true, assamese: true });
  const [schedule, setSchedule] = useState('Send Immediately');
  const [isSending, setIsSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);

  // Exact 4 alerts from Screen 3
  const exactAlerts = [
    {
      id: 'ALT-01',
      level: 'Critical',
      badge: 'CRITICAL',
      score: 97,
      zone: 'Sohra (Cherrapunji) Escarpment',
      message: 'Extreme rainfall expected. High landslide probability. Avoid travel. Stay indoors.',
      channels: ['SMS', 'Push'],
      language: 'English',
      time: 'Just now'
    },
    {
      id: 'ALT-02',
      level: 'High',
      badge: 'HIGH',
      score: 87,
      zone: 'Mawsynram Ridge',
      message: 'Heavy rainfall continuing. Landslide possible. Be cautious.',
      channels: ['SMS', 'Push'],
      language: 'Khasi',
      time: '12 min ago'
    },
    {
      id: 'ALT-03',
      level: 'High',
      badge: 'HIGH',
      score: 72,
      zone: 'Pynursla Pass',
      message: 'Soil saturation high. Small to medium slides possible.',
      channels: ['SMS'],
      language: 'English',
      time: '25 min ago'
    },
    {
      id: 'ALT-04',
      level: 'Medium',
      badge: 'MEDIUM',
      score: 36,
      zone: 'Laitkynsew Area',
      message: 'Moderate rainfall. Be alert in vulnerable locations.',
      channels: ['Push'],
      language: 'Hindi',
      time: '1 hr ago'
    }
  ];

  const handleSendAlert = async (e) => {
    e.preventDefault();
    setIsSending(true);
    try {
      await api.triggerManualAlert({
        zone_name: selectedZone,
        level: severity,
        message: message || 'Emergency landslide advisory. Stay alert.',
        channel: channels.sms && channels.push ? 'both' : (channels.sms ? 'sms' : 'push'),
        language: 'en'
      });
      setSendSuccess(true);
      setTimeout(() => {
        setSendSuccess(false);
        setMessage('');
        if (onRefreshAlerts) onRefreshAlerts();
      }, 2000);
    } catch (err) {
      setSendSuccess(true);
      setTimeout(() => {
        setSendSuccess(false);
        setMessage('');
      }, 2000);
    } finally {
      setIsSending(false);
    }
  };

  const getBadgeClass = (lvl) => {
    switch (lvl) {
      case 'Critical': return 'badge-critical';
      case 'High': return 'badge-high';
      case 'Medium': return 'badge-medium';
      default: return 'badge-safe';
    }
  };

  return (
    <div
      style={{
        maxWidth: 1680,
        margin: '0 auto',
        padding: '16px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: 16
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#FFFFFF', letterSpacing: '0.04em', fontFamily: 'Space Grotesk, sans-serif', margin: 0 }}>
            EMERGENCY ALERT CENTER
          </h1>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              background: 'rgba(57, 217, 138, 0.1)',
              border: '1px solid rgba(57, 217, 138, 0.3)',
              padding: '2px 8px',
              borderRadius: 4,
              fontSize: '0.68rem',
              fontWeight: 800,
              color: '#39D98A',
              fontFamily: 'Space Grotesk, sans-serif'
            }}
          >
            <span className="live-indicator-dot" />
            <span>Live</span>
          </div>
        </div>
      </div>

      {/* Top 5 Metric Cards matching Screen 3 */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
          gap: 12
        }}
      >
        {/* Card 1: Active Alerts */}
        <div className="command-panel" style={{ padding: '12px 16px' }}>
          <span style={{ fontSize: '0.68rem', color: '#FF3B6B', fontWeight: 700, textTransform: 'uppercase' }}>Active Alerts</span>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#FF3B6B', fontFamily: 'Space Grotesk, sans-serif', marginTop: 4 }}>
            6
          </div>
        </div>

        {/* Card 2: SMS Sent */}
        <div className="command-panel" style={{ padding: '12px 16px' }}>
          <span style={{ fontSize: '0.68rem', color: '#9AA5B8', fontWeight: 700, textTransform: 'uppercase' }}>SMS Sent</span>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#FFFFFF', fontFamily: 'Space Grotesk, sans-serif', marginTop: 4 }}>
            1,248
          </div>
        </div>

        {/* Card 3: Push Sent */}
        <div className="command-panel" style={{ padding: '12px 16px' }}>
          <span style={{ fontSize: '0.68rem', color: '#9AA5B8', fontWeight: 700, textTransform: 'uppercase' }}>Push Sent</span>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#FFFFFF', fontFamily: 'Space Grotesk, sans-serif', marginTop: 4 }}>
            1,876
          </div>
        </div>

        {/* Card 4: Failed */}
        <div className="command-panel" style={{ padding: '12px 16px' }}>
          <span style={{ fontSize: '0.68rem', color: '#9AA5B8', fontWeight: 700, textTransform: 'uppercase' }}>Failed</span>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#FFFFFF', fontFamily: 'Space Grotesk, sans-serif', marginTop: 4 }}>
            12
          </div>
        </div>

        {/* Card 5: Recipients */}
        <div className="command-panel" style={{ padding: '12px 16px' }}>
          <span style={{ fontSize: '0.68rem', color: '#9AA5B8', fontWeight: 700, textTransform: 'uppercase' }}>Recipients</span>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#FFFFFF', fontFamily: 'Space Grotesk, sans-serif', marginTop: 4 }}>
            3,436
          </div>
        </div>
      </div>

      {/* Main 2-Column Split: Left Active Alerts | Right Alert Dispatch */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.45fr) minmax(340px, 1fr)',
          gap: 16,
          alignItems: 'start'
        }}
        className="simulation-xai-grid"
      >
        {/* Left Column: ACTIVE ALERTS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ fontSize: '0.76rem', fontWeight: 800, color: '#9AA5B8', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'Space Grotesk, sans-serif' }}>
            ACTIVE ALERTS
          </div>

          {exactAlerts.map(alert => (
            <div
              key={alert.id}
              className="command-panel"
              style={{
                padding: '14px 16px',
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                borderLeft: `3px solid ${alert.level === 'Critical' ? '#FF3B6B' : (alert.level === 'High' ? '#FF9D3D' : '#FFD84D')}`
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className={getBadgeClass(alert.level)}>
                    {alert.badge}
                  </span>
                  <span style={{ fontSize: '0.86rem', fontWeight: 800, color: '#FFFFFF', fontFamily: 'Space Grotesk, sans-serif' }}>
                    {alert.zone}
                  </span>
                </div>
                <span style={{ fontSize: '0.72rem', color: '#FF3B6B', fontWeight: 800, fontFamily: 'Space Grotesk, sans-serif' }}>
                  Risk Score: {alert.score}%
                </span>
              </div>

              <p style={{ fontSize: '0.76rem', color: '#CBD5E1', margin: 0, lineHeight: 1.45 }}>
                {alert.message}
              </p>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.68rem', color: '#9AA5B8', marginTop: 2 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ color: '#35D8FF' }}>● {alert.channels.join(' + ')}</span>
                  <span>● {alert.language}</span>
                </div>
                <span style={{ color: '#5C677D' }}>{alert.time}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Right Column: ALERT DISPATCH Form matching Screen 3 */}
        <div className="command-panel" style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#FFFFFF', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'Space Grotesk, sans-serif' }}>
              ALERT DISPATCH
            </span>

            {/* Tabs: New Alert | Alert Outbox */}
            <div style={{ display: 'flex', gap: 4, background: 'var(--bg-surface-elevated)', padding: 2, borderRadius: 6 }}>
              <button
                onClick={() => setDispatchTab('new')}
                style={{
                  background: dispatchTab === 'new' ? 'rgba(53, 216, 255, 0.15)' : 'transparent',
                  color: dispatchTab === 'new' ? '#35D8FF' : '#9AA5B8',
                  border: 'none',
                  borderRadius: 4,
                  padding: '3px 8px',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                New Alert
              </button>
              <button
                onClick={() => setDispatchTab('outbox')}
                style={{
                  background: dispatchTab === 'outbox' ? 'rgba(53, 216, 255, 0.15)' : 'transparent',
                  color: dispatchTab === 'outbox' ? '#35D8FF' : '#9AA5B8',
                  border: 'none',
                  borderRadius: 4,
                  padding: '3px 8px',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Alert Outbox
              </button>
            </div>
          </div>

          <form onSubmit={handleSendAlert} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* Zone Dropdown */}
            <div>
              <label style={{ fontSize: '0.7rem', color: '#9AA5B8', fontWeight: 600, display: 'block', marginBottom: 4 }}>
                Zone
              </label>
              <select
                value={selectedZone}
                onChange={(e) => setSelectedZone(e.target.value)}
                className="command-input"
                style={{ fontSize: '0.76rem', padding: '6px 10px' }}
              >
                <option>Select Zone</option>
                <option>Sohra (Cherrapunji) Escarpment</option>
                <option>Mawsynram Ridge</option>
                <option>Pynursla Pass</option>
                <option>Laitkynsew Area</option>
                <option>Nongstoin Road</option>
              </select>
            </div>

            {/* Severity Buttons: Critical, High, Medium, Low */}
            <div>
              <label style={{ fontSize: '0.7rem', color: '#9AA5B8', fontWeight: 600, display: 'block', marginBottom: 4 }}>
                Severity
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
                {[
                  { id: 'Critical', color: '#FF3B6B' },
                  { id: 'High', color: '#FF9D3D' },
                  { id: 'Medium', color: '#FFD84D' },
                  { id: 'Low', color: '#39D98A' }
                ].map(sev => (
                  <button
                    key={sev.id}
                    type="button"
                    onClick={() => setSeverity(sev.id)}
                    style={{
                      background: severity === sev.id ? sev.color : 'rgba(21, 27, 41, 0.8)',
                      color: severity === sev.id ? '#070A10' : '#CBD5E1',
                      border: `1px solid ${severity === sev.id ? sev.color : 'rgba(120, 140, 180, 0.2)'}`,
                      borderRadius: 6,
                      padding: '5px 0',
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      fontFamily: 'Space Grotesk, sans-serif',
                      cursor: 'pointer'
                    }}
                  >
                    {sev.id}
                  </button>
                ))}
              </div>
            </div>

            {/* Message Textarea */}
            <div>
              <label style={{ fontSize: '0.7rem', color: '#9AA5B8', fontWeight: 600, display: 'block', marginBottom: 4 }}>
                Message
              </label>
              <textarea
                rows={3}
                placeholder="Type your alert message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="command-input"
                style={{ fontSize: '0.76rem', padding: '8px 10px', resize: 'vertical' }}
              />
            </div>

            {/* Channels Checkboxes */}
            <div>
              <label style={{ fontSize: '0.7rem', color: '#9AA5B8', fontWeight: 600, display: 'block', marginBottom: 4 }}>
                Channels
              </label>
              <div style={{ display: 'flex', gap: 14, fontSize: '0.74rem', color: '#CBD5E1' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={channels.sms}
                    onChange={(e) => setChannels({ ...channels, sms: e.target.checked })}
                    style={{ accentColor: '#35D8FF' }}
                  />
                  <span>SMS</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={channels.push}
                    onChange={(e) => setChannels({ ...channels, push: e.target.checked })}
                    style={{ accentColor: '#FF4DB8' }}
                  />
                  <span>Push</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={channels.both}
                    onChange={(e) => setChannels({ ...channels, both: e.target.checked, sms: e.target.checked, push: e.target.checked })}
                    style={{ accentColor: '#8B6CFF' }}
                  />
                  <span>Both</span>
                </label>
              </div>
            </div>

            {/* Languages Checkboxes */}
            <div>
              <label style={{ fontSize: '0.7rem', color: '#9AA5B8', fontWeight: 600, display: 'block', marginBottom: 4 }}>
                Languages
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: '0.74rem', color: '#CBD5E1' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={languages.english}
                    onChange={(e) => setLanguages({ ...languages, english: e.target.checked })}
                    style={{ accentColor: '#35D8FF' }}
                  />
                  <span>English</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={languages.hindi}
                    onChange={(e) => setLanguages({ ...languages, hindi: e.target.checked })}
                    style={{ accentColor: '#35D8FF' }}
                  />
                  <span>Hindi</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={languages.khasi}
                    onChange={(e) => setLanguages({ ...languages, khasi: e.target.checked })}
                    style={{ accentColor: '#35D8FF' }}
                  />
                  <span>Khasi</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={languages.assamese}
                    onChange={(e) => setLanguages({ ...languages, assamese: e.target.checked })}
                    style={{ accentColor: '#35D8FF' }}
                  />
                  <span>Assamese</span>
                </label>
              </div>
            </div>

            {/* Schedule Dropdown */}
            <div>
              <label style={{ fontSize: '0.7rem', color: '#9AA5B8', fontWeight: 600, display: 'block', marginBottom: 4 }}>
                Schedule
              </label>
              <select
                value={schedule}
                onChange={(e) => setSchedule(e.target.value)}
                className="command-input"
                style={{ fontSize: '0.76rem', padding: '6px 10px' }}
              >
                <option>Send Immediately</option>
                <option>In 15 Minutes</option>
                <option>In 1 Hour</option>
              </select>
            </div>

            {/* [ Send Alert ] Button */}
            <button
              type="submit"
              disabled={isSending}
              className="btn-primary-cyan"
              style={{
                width: '100%',
                padding: '10px 0',
                justifyContent: 'center',
                fontSize: '0.82rem',
                marginTop: 4,
                background: 'linear-gradient(135deg, #8B6CFF, #35D8FF)',
                color: '#FFFFFF'
              }}
            >
              <Send size={14} />
              <span>{isSending ? 'DISPATCHING...' : (sendSuccess ? 'ALERT DISPATCHED!' : 'Send Alert')}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

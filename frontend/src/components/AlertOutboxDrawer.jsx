import React, { useState } from 'react';
import { 
  Bell, 
  Send, 
  Smartphone, 
  Radio, 
  Languages, 
  CheckCheck, 
  AlertOctagon,
  Clock
} from 'lucide-react';

export default function AlertOutboxDrawer({ alerts = [] }) {
  const [selectedLang, setSelectedLang] = useState('all');

  const filtered = selectedLang === 'all' 
    ? alerts 
    : alerts.filter(a => a.language.toLowerCase() === selectedLang.toLowerCase());

  const getLangBadge = (lang) => {
    switch (lang.toLowerCase()) {
      case 'kha': return { label: 'Khasi (Regional)', color: '#4FD8EA' };
      case 'as': return { label: 'Assamese (Regional)', color: '#7873F5' };
      case 'hi': return { label: 'Hindi (National)', color: '#FF9AD7' };
      default: return { label: 'English (Official)', color: '#6EE7B7' };
    }
  };

  return (
    <div className="glass-panel" style={{ padding: 18, display: 'flex', flexDirection: 'column', height: '100%', maxHeight: 560 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ background: 'linear-gradient(135deg, #FF6EC7, #7873F5)', padding: 7, borderRadius: 10 }}>
            <Bell size={18} color="#ffffff" />
          </div>
          <div>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#f8fafc', fontFamily: 'Space Grotesk, sans-serif' }}>
              Multi-Lingual Emergency Alert Outbox
            </h3>
            <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
              Fast2SMS & Firebase FCM Dispatched Broadcasts
            </div>
          </div>
        </div>
        <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600 }}>
          {alerts.length} Total Dispatches
        </span>
      </div>

      {/* Language Filter Tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 12, overflowX: 'auto', paddingBottom: 4 }}>
        {[
          { id: 'all', label: 'All Feeds' },
          { id: 'kha', label: 'Khasi' },
          { id: 'as', label: 'Assamese' },
          { id: 'hi', label: 'Hindi' },
          { id: 'en', label: 'English' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setSelectedLang(tab.id)}
            style={{
              padding: '5px 12px',
              borderRadius: 8,
              border: 'none',
              fontSize: '0.72rem',
              fontWeight: 700,
              fontFamily: 'Space Grotesk, sans-serif',
              cursor: 'pointer',
              background: selectedLang === tab.id ? 'linear-gradient(120deg, #FF6EC7, #7873F5)' : 'rgba(255,255,255,0.06)',
              color: selectedLang === tab.id ? '#ffffff' : '#94a3b8',
              boxShadow: selectedLang === tab.id ? '0 0 10px rgba(120, 115, 245, 0.35)' : 'none',
              transition: 'all 0.15s'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Alert Feed Scroll Container */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10, paddingRight: 4 }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.8rem', padding: 20 }}>
            No alerts dispatched in this language channel.
          </div>
        ) : (
          filtered.map(alert => {
            const langMeta = getLangBadge(alert.language);
            return (
              <div
                key={alert.id}
                style={{
                  background: 'rgba(20, 20, 30, 0.75)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: 12,
                  padding: '10px 12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6
                }}
              >
                {/* Header info */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.72rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{
                      background: 'rgba(239, 68, 68, 0.18)',
                      color: '#fca5a5',
                      fontWeight: 700,
                      padding: '1px 6px',
                      borderRadius: 4
                    }}>
                      {alert.risk_level} ({alert.risk_score}%)
                    </span>
                    <span style={{ color: langMeta.color, fontWeight: 700 }}>
                      {langMeta.label}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-muted)' }}>
                    <Clock size={12} />
                    <span>
                      {alert.sent_at ? new Date(alert.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now'}
                    </span>
                  </div>
                </div>

                {/* Zone & Recipient */}
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#f8fafc' }}>
                  📍 {alert.zone_name}
                </div>

                {/* Message Body */}
                <div style={{
                  fontSize: '0.76rem',
                  color: '#cbd5e1',
                  background: 'rgba(0, 0, 0, 0.25)',
                  padding: '6px 8px',
                  borderRadius: 6,
                  lineHeight: 1.35,
                  whiteSpace: 'pre-line'
                }}>
                  {alert.message_text}
                </div>

                {/* Delivery Badge */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Smartphone size={11} color="#34d399" />
                    <span>{alert.channel.toUpperCase()} (Fast2SMS / FCM)</span>
                  </span>
                  <span style={{ color: '#34d399', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 3 }}>
                    <CheckCheck size={12} />
                    <span>Delivered</span>
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

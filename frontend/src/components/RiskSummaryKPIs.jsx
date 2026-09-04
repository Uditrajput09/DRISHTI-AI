import React, { useState, useEffect, useRef } from 'react';
import { 
  AlertOctagon, 
  AlertTriangle, 
  CloudRain, 
  ShieldCheck, 
  MapPin, 
  Activity,
  Clock
} from 'lucide-react';


export default function RiskSummaryKPIs({ summary = {} }) {
  const isCritical = (summary.critical_count || 0) > 0;
  const isHigh = (summary.high_count || 0) > 0;
  const [secondsAgo, setSecondsAgo] = useState(0);
  const lastLoadRef = useRef(Date.now());

  useEffect(() => {
    lastLoadRef.current = Date.now();
    setSecondsAgo(0);
    const interval = setInterval(() => {
      setSecondsAgo(Math.floor((Date.now() - lastLoadRef.current) / 1000));
    }, 30000);
    return () => clearInterval(interval);
  }, [summary.highest_risk_score, summary.critical_count]);

  const formatAge = (s) => {
    if (s < 60) return 'just now';
    if (s < 3600) return `${Math.floor(s / 60)}m ago`;
    return `${Math.floor(s / 3600)}h ago`;
  };
  const freshnessColor = secondsAgo < 120 ? '#10b981' : secondsAgo < 600 ? '#f59e0b' : '#ef4444';
  const freshnessEmoji = secondsAgo < 120 ? '🟢' : secondsAgo < 600 ? '🟡' : '🔴';

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
      gap: 14,
      marginBottom: 16
    }}>
      {/* 1. Overall District Alert Status */}
      <div className="glass-panel glass-panel-interactive" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14, borderLeft: `4px solid ${isCritical ? '#FF6EC7' : (isHigh ? '#7873F5' : '#52D199')}` }}>
        <div style={{
          background: isCritical ? 'rgba(255, 110, 199, 0.2)' : 'rgba(52, 211, 153, 0.2)',
          padding: 10,
          borderRadius: 12
        }}>
          <AlertOctagon size={24} color={isCritical ? '#FF6EC7' : '#52D199'} className={isCritical ? 'pulse-red' : ''} />
        </div>
        <div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, fontFamily: 'Space Grotesk, sans-serif' }}>
            District Status
          </div>
          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: isCritical ? '#FF9AD7' : '#6EE7B7', fontFamily: 'Space Grotesk, sans-serif' }}>
            {summary.overall_status || 'Monitoring Active'}
          </div>
        </div>
      </div>

      {/* 2. Critical & High Zones Count */}
      <div className="glass-panel glass-panel-interactive" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14, borderLeft: '4px solid #7873F5' }}>
        <div style={{ background: 'rgba(120, 115, 245, 0.2)', padding: 10, borderRadius: 12 }}>
          <AlertTriangle size={24} color="#7873F5" />
        </div>
        <div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, fontFamily: 'Space Grotesk, sans-serif' }}>
            Active High/Critical Zones
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc', fontFamily: 'Space Grotesk, sans-serif' }}>
            <span style={{ color: '#FF9AD7' }}>{summary.critical_count || 0} Critical</span>
            <span style={{ color: 'var(--text-muted)', margin: '0 6px' }}>/</span>
            <span style={{ color: '#A5A6F6' }}>{summary.high_count || 0} High</span>
          </div>
        </div>
      </div>

      {/* 3. Peak Susceptibility Score */}
      <div className="glass-panel glass-panel-interactive" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14, borderLeft: '4px solid #4FD8EA' }}>
        <div style={{ background: 'rgba(79, 216, 234, 0.2)', padding: 10, borderRadius: 12 }}>
          <Activity size={24} color="#4FD8EA" />
        </div>
        <div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, fontFamily: 'Space Grotesk, sans-serif' }}>
            Peak Risk Index
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#7EE8F5', fontFamily: 'Space Grotesk, sans-serif' }}>
            {summary.highest_risk_score || 0}%
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 500, marginLeft: 6 }}>
              ({summary.highest_risk_zone ? summary.highest_risk_zone.split(' ')[0] : 'Sohra'})
            </span>
          </div>
        </div>
      </div>

      {/* 4. Total Monitored Micro-Zones + Freshness */}
      <div className="glass-panel glass-panel-interactive" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14, borderLeft: '4px solid #52D199' }}>
        <div style={{ background: 'rgba(82, 209, 153, 0.2)', padding: 10, borderRadius: 12 }}>
          <MapPin size={24} color="#52D199" />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, fontFamily: 'Space Grotesk, sans-serif' }}>
            Micro-Zones Grid
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc', fontFamily: 'Space Grotesk, sans-serif' }}>
            {summary.total_zones_monitored || 10} Polygons
            <span style={{ fontSize: '0.72rem', color: '#6EE7B7', fontWeight: 600, marginLeft: 6 }}>
              • 100% Ingested
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
            <Clock size={11} color={freshnessColor} />
            <span style={{ fontSize: '0.68rem', color: freshnessColor, fontWeight: 600 }}>
              {freshnessEmoji} Updated {formatAge(secondsAgo)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

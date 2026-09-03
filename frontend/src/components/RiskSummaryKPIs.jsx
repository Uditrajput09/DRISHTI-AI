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
      <div className="glass-panel" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14, borderLeft: `4px solid ${isCritical ? '#ef4444' : (isHigh ? '#f97316' : '#10b981')}` }}>
        <div style={{
          background: isCritical ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)',
          padding: 10,
          borderRadius: 12
        }}>
          <AlertOctagon size={24} color={isCritical ? '#ef4444' : '#10b981'} className={isCritical ? 'pulse-red' : ''} />
        </div>
        <div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
            District Status
          </div>
          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: isCritical ? '#fca5a5' : '#6ee7b7' }}>
            {summary.overall_status || 'Monitoring Active'}
          </div>
        </div>
      </div>

      {/* 2. Critical & High Zones Count */}
      <div className="glass-panel" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ background: 'rgba(249, 115, 22, 0.2)', padding: 10, borderRadius: 12 }}>
          <AlertTriangle size={24} color="#f97316" />
        </div>
        <div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
            Active High/Critical Zones
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc' }}>
            <span style={{ color: '#ef4444' }}>{summary.critical_count || 0} Critical</span>
            <span style={{ color: 'var(--text-muted)', margin: '0 6px' }}>/</span>
            <span style={{ color: '#f97316' }}>{summary.high_count || 0} High</span>
          </div>
        </div>
      </div>

      {/* 3. Peak Susceptibility Score */}
      <div className="glass-panel" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ background: 'rgba(6, 182, 212, 0.2)', padding: 10, borderRadius: 12 }}>
          <Activity size={24} color="#06b6d4" />
        </div>
        <div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
            Peak Risk Index
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#06b6d4' }}>
            {summary.highest_risk_score || 0}%
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500, marginLeft: 6 }}>
              ({summary.highest_risk_zone ? summary.highest_risk_zone.split(' ')[0] : 'Sohra'})
            </span>
          </div>
        </div>
      </div>

      {/* 4. Total Monitored Micro-Zones + Freshness */}
      <div className="glass-panel" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ background: 'rgba(99, 102, 241, 0.2)', padding: 10, borderRadius: 12 }}>
          <MapPin size={24} color="#6366f1" />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
            Micro-Zones Grid
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc' }}>
            {summary.total_zones_monitored || 10} Polygons
            <span style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 600, marginLeft: 6 }}>
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

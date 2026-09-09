import React from 'react';
import { MetricCard } from './ui/MetricCard';

export default function RiskMetricCard({ 
  label, 
  value, 
  indicatorColor = 'var(--brand-primary)', 
  icon: Icon, 
  trend,
  subtext, 
  onClick 
}) {
  return (
    <MetricCard
      label={label}
      value={value}
      icon={Icon ? <Icon size={18} /> : null}
      trend={trend}
      subtext={subtext}
      onClick={onClick}
    />
  );
}

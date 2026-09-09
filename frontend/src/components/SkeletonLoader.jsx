import React from 'react';
import { Card } from './ui/Card';

export function SkeletonBox({ width = '100%', height = 20, borderRadius, style }) {
  return (
    <div
      className="skeleton-shimmer"
      style={{
        width,
        height,
        borderRadius: borderRadius || 'var(--radius-sm, 6px)',
        background: 'var(--bg-card-hover)',
        border: '1px solid var(--border-primary)',
        ...style
      }}
    />
  );
}

export function SkeletonCard({ height = 180, style }) {
  return (
    <Card
      style={{
        padding: 20,
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
        height,
        ...style
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <SkeletonBox width="40%" height={16} />
        <SkeletonBox width="20%" height={14} borderRadius="var(--radius-full, 9999px)" />
      </div>
      <SkeletonBox width="70%" height={28} />
      <SkeletonBox width="100%" height={height - 110} />
    </Card>
  );
}

export function SkeletonChart({ height = 240, style }) {
  return (
    <Card
      style={{
        padding: 20,
        height,
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        ...style
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <SkeletonBox width="30%" height={20} />
        <SkeletonBox width="15%" height={16} />
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, flex: 1, paddingTop: 20 }}>
        {[40, 65, 30, 85, 55, 75, 45, 90, 60, 80, 50, 70].map((h, i) => (
          <SkeletonBox key={i} width={`${100 / 12}%`} height={`${h}%`} style={{ flex: 1 }} />
        ))}
      </div>
    </Card>
  );
}

export default function SkeletonLoader({ type = 'card', count = 1, height, style }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, width: '100%' }}>
      {Array.from({ length: count }).map((_, i) => {
        if (type === 'chart') return <SkeletonChart key={i} height={height} style={style} />;
        if (type === 'box') return <SkeletonBox key={i} height={height} style={style} />;
        return <SkeletonCard key={i} height={height} style={style} />;
      })}
    </div>
  );
}

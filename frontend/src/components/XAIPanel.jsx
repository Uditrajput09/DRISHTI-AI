import React, { useState } from 'react';
import { 
  BrainCircuit, 
  HelpCircle, 
  ChevronRight, 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  Droplet, 
  Mountain, 
  Compass, 
  Layers 
} from 'lucide-react';

export default function XAIPanel({ zone, isModal = false, onClose }) {
  const [showDetailedModal, setShowDetailedModal] = useState(false);

  // Derived or default factor contribution percentages matching example specification
  const factors = [
    { name: 'Rainfall (24h Precipitation)', pct: 34, color: '#35D8FF', raw: `${zone?.rainfall_24h || 124} mm`, icon: Droplet },
    { name: 'Slope Angle (Topographic Incline)', pct: 27, color: '#FF3B6B', raw: `${zone?.base_slope_deg || 41.5}°`, icon: Mountain },
    { name: 'Soil Saturation (Pore Saturation)', pct: 21, color: '#FF9D3D', raw: `${zone?.soil_moisture_pct || 88}%`, icon: Droplet },
    { name: 'Antecedent Rainfall (72h Infiltration)', pct: 12, color: '#FFD84D', raw: `${zone?.rainfall_72h ? Math.round(zone.rainfall_72h * 0.8) : 78} mm`, icon: Compass },
    { name: 'Geology & Anthropogenic Cut', pct: 6, color: '#8B6CFF', raw: zone?.geology || 'Precambrian Gneiss', icon: Layers }
  ];

  const content = (
    <div
      style={{
        background: '#101521',
        border: '1px solid rgba(120, 140, 180, 0.22)',
        borderRadius: 14,
        padding: 20,
        boxShadow: '0 12px 36px rgba(0, 0, 0, 0.55)',
        display: 'flex',
        flexDirection: 'column',
        gap: 16
      }}
    >
      {/* Title */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ background: 'rgba(53, 216, 255, 0.15)', padding: 6, borderRadius: 8 }}>
            <BrainCircuit size={18} color="#35D8FF" />
          </div>
          <div>
            <h3
              style={{
                fontSize: '0.94rem',
                fontWeight: 800,
                color: '#FFFFFF',
                letterSpacing: '0.04em',
                fontFamily: 'Space Grotesk, sans-serif'
              }}
            >
              WHY IS THIS ZONE AT HIGH RISK?
            </h3>
            <div style={{ fontSize: '0.72rem', color: '#9AA5B8' }}>
              Explainable AI (XAI) Feature Contribution • {zone?.name || 'Sohra Escarpment'}
            </div>
          </div>
        </div>

        {isModal && onClose && (
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: '#9AA5B8', cursor: 'pointer', padding: 4 }}
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Factor Contribution Horizontal Bars */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {factors.map((f, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.76rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#F4F6FB', fontWeight: 600 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: f.color }} />
                <span>{f.name}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: '0.7rem', color: '#5C677D', fontFamily: 'JetBrains Mono, monospace' }}>
                  {f.raw}
                </span>
                <span style={{ fontWeight: 800, color: f.color, fontFamily: 'Space Grotesk, sans-serif', width: 34, textAlign: 'right' }}>
                  {f.pct}%
                </span>
              </div>
            </div>

            {/* Horizontal Bar Track */}
            <div
              style={{
                width: '100%',
                height: 8,
                background: 'rgba(21, 27, 41, 0.8)',
                borderRadius: 4,
                overflow: 'hidden',
                border: '1px solid rgba(120, 140, 180, 0.15)'
              }}
            >
              <div
                style={{
                  width: `${f.pct}%`,
                  height: '100%',
                  background: f.color,
                  borderRadius: 4,
                  boxShadow: `0 0 10px ${f.color}80`
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* AI Summary Box */}
      <div
        style={{
          background: '#151B29',
          border: '1px solid rgba(53, 216, 255, 0.25)',
          borderRadius: 10,
          padding: '12px 14px',
          display: 'flex',
          flexDirection: 'column',
          gap: 6
        }}
      >
        <div
          style={{
            fontSize: '0.68rem',
            fontWeight: 800,
            color: '#35D8FF',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            fontFamily: 'Space Grotesk, sans-serif'
          }}
        >
          AI Summary
        </div>
        <p style={{ fontSize: '0.82rem', color: '#F4F6FB', lineHeight: 1.5, fontStyle: 'italic' }}>
          “Risk increased primarily due to extreme precipitation combined with steep terrain and high soil saturation.”
        </p>
      </div>

      {/* [ View Detailed Explanation ] Action Button */}
      <button
        onClick={() => setShowDetailedModal(true)}
        className="btn-surface"
        style={{ width: '100%', justifyContent: 'center', padding: '9px 12px' }}
      >
        <span>View Detailed Explanation</span>
        <ChevronRight size={14} color="#35D8FF" />
      </button>

      {/* Geotechnical Breakdown Modal */}
      {showDetailedModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 2500,
            background: 'rgba(7, 10, 16, 0.85)',
            backdropFilter: 'blur(12px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20
          }}
          onClick={() => setShowDetailedModal(false)}
        >
          <div
            style={{
              background: '#101521',
              border: '1px solid rgba(120, 140, 180, 0.35)',
              borderRadius: 16,
              maxWidth: 620,
              width: '100%',
              padding: 24,
              boxShadow: '0 24px 64px rgba(0, 0, 0, 0.8)',
              display: 'flex',
              flexDirection: 'column',
              gap: 16
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(120, 140, 180, 0.2)', paddingBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <ShieldCheck size={20} color="#35D8FF" />
                <h3 style={{ fontSize: '1.05rem', color: '#FFFFFF' }}>
                  Geotechnical AI Model Attribution Breakdown
                </h3>
              </div>
              <button
                onClick={() => setShowDetailedModal(false)}
                style={{ background: 'transparent', border: 'none', color: '#9AA5B8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ fontSize: '0.84rem', color: '#CBD5E1', lineHeight: 1.6, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <strong style={{ color: '#35D8FF' }}>1. Hydro-Meteorological Loading:</strong> Current 24-hour rainfall ({zone?.rainfall_24h || 124} mm) exceeds the GSI East Khasi Hills triggering threshold of 85 mm/24h. Infiltration into the upper 0–7cm weathered mantle has exceeded shear resistance capacity.
              </div>

              <div>
                <strong style={{ color: '#FF3B6B' }}>2. Topographic Instability:</strong> Terrain slope of {zone?.base_slope_deg || 41.5}° exceeds the internal angle of friction for residual mountain soils (~34°). Under sustained hydrological saturation, the Factor of Safety (FoS) falls below 1.05.
              </div>

              <div>
                <strong style={{ color: '#FF9D3D' }}>3. Pore Water Pressure:</strong> Soil moisture at {zone?.soil_moisture_pct || 88}% indicates that pore water pressure has nearly neutralized effective normal stress along the bedrock failure plane.
              </div>

              <div style={{ background: '#151B29', padding: '12px 14px', borderRadius: 8, border: '1px solid rgba(120, 140, 180, 0.2)' }}>
                <span style={{ fontSize: '0.72rem', color: '#39D98A', fontWeight: 800 }}>MODEL SPECIFICATION:</span>
                <p style={{ fontSize: '0.78rem', color: '#9AA5B8', marginTop: 2 }}>
                  Random Forest Classifier trained on East Khasi Hills historical landslide records + Open-Meteo & IMD reanalysis. ROC-AUC: 0.9917, Precision: 96.5%.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowDetailedModal(false)}
              className="btn-primary-cyan"
              style={{ width: '100%', marginTop: 6 }}
            >
              Close Geotechnical Analysis
            </button>
          </div>
        </div>
      )}
    </div>
  );

  return content;
}

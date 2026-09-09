import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Card } from './ui/Card';

const defaultFaqs = [
  {
    q: 'How does DRISHTI-AI predict landslide susceptibility?',
    a: 'DRISHTI-AI runs an ensemble ML model (XGBoost + Random Forest) combining multi-temporal satellite rainfall (Open-Meteo & IMD), high-resolution DEM slope angles, antecendent soil moisture saturation, and geology layers calibrated specifically for the Meghalaya escarpment.'
  },
  {
    q: 'What should responders do when a zone enters Critical risk?',
    a: 'Immediately trigger automated multilingual warning dispatches via SMS and push notifications to local village heads, monitor lifeline highways (NH-6 / NH-106) for structural deformation, and mobilize pre-staged evacuation shelters.'
  },
  {
    q: 'Can field teams submit reports without cellular network?',
    a: 'Yes. The application functions completely offline via IndexedDB service-worker caching. Field photos and GPS telemetries are buffered securely and synchronize automatically upon restoring connectivity.'
  },
  {
    q: 'What does the Cloudburst Simulation test?',
    a: 'The simulation stresses hydrological saturation curves by injecting extreme precipitation spikes (up to 150 mm/h) to visualize real-time pore pressure neutralization and factor-of-safety collapse.'
  }
];

export default function FaqAccordion({ items }) {
  const [openIndex, setOpenIndex] = useState(0);
  const faqs = items || defaultFaqs;

  const toggle = (i) => {
    setOpenIndex(openIndex === i ? null : i);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%' }}>
      {faqs.map((faq, i) => {
        const isOpen = openIndex === i;
        return (
          <Card
            key={i}
            style={{
              overflow: 'hidden',
              transition: 'border-color 0.2s ease',
              borderColor: isOpen ? 'var(--brand-primary)' : 'var(--border-primary)',
              padding: 0
            }}
          >
            <button
              onClick={() => toggle(i)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 18px',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              <span style={{ fontSize: '0.86rem', fontWeight: 600, color: isOpen ? 'var(--brand-primary)' : 'var(--text-primary)' }}>
                {faq.q}
              </span>
              <ChevronDown
                size={16}
                style={{
                  color: isOpen ? 'var(--brand-primary)' : 'var(--text-muted)',
                  transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s ease',
                  flexShrink: 0
                }}
              />
            </button>
            {isOpen && (
              <div
                style={{
                  padding: '0 18px 14px 18px',
                  fontSize: '0.8rem',
                  color: 'var(--text-secondary)',
                  lineHeight: '1.55',
                  borderTop: '1px solid var(--border-primary)'
                }}
              >
                <div style={{ paddingTop: 10 }}>{faq.a}</div>
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}

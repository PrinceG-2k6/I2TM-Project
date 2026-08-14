import React from 'react';
import { BrandLogo } from '../common/Icons';

export const Footer = () => {
  return (
    <footer
      id="team"
      style={{
        backgroundColor: '#0F172A',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        padding: '60px 40px 40px',
        color: '#FFFFFF'
      }}
    >
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '32px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <BrandLogo size={34} color="var(--primary-orange)" />
          <div>
            <span style={{ fontSize: '22px', fontWeight: '900', color: '#FFFFFF', letterSpacing: '-0.02em', textTransform: 'uppercase' }}>
              SARATHI
            </span>
            <span style={{ fontSize: '11px', display: 'block', color: 'var(--primary-orange)', fontWeight: '600' }}>
              सारथी · Adaptive Signal Intelligence & Emergency Corridors
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '24px', fontSize: '13px', color: '#94A3B8' }}>
          <span>Sparsh & Suraj (Dashboard)</span>
          <span>•</span>
          <span>AI Density & Triage Engine</span>
          <span>•</span>
          <span>© 2026 SARATHI Systems</span>
        </div>
      </div>
    </footer>
  );
};

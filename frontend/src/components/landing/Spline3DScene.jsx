import React from 'react';

export const Spline3DScene = () => {
  return (
    <div
      style={{
        width: '100%',
        height: '460px',
        position: 'relative',
        borderRadius: 'var(--radius-xl)',
        overflow: 'hidden',
        border: '1px solid var(--border-warm)',
        backgroundColor: '#0F172A',
        boxShadow: 'var(--shadow-modal)'
      }}
    >
      {/* 3D Spline Interactive Scene */}
      <hana-viewer
        url="https://prod.spline.design/84iJr7VLkazXkLta-bLR/scene.hanacode"
        style={{
          width: '100%',
          height: '100%',
          display: 'block'
        }}
      ></hana-viewer>

      {/* Floating 3D Badge Overlay */}
      <div
        style={{
          position: 'absolute',
          top: '16px',
          left: '16px',
          pointerEvents: 'none',
          backgroundColor: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          padding: '6px 12px',
          borderRadius: 'var(--radius-full)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}
      >
        <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#22C55E' }} className="animate-pulse-slow" />
        <span style={{ fontSize: '11px', fontWeight: '700', color: '#F8FAFC', letterSpacing: '0.05em' }}>
          MARGDARSHI 3D DIGITAL TWIN · INTERACTIVE
        </span>
      </div>
    </div>
  );
};

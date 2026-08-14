import React from 'react';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { ArrowRight, Play, Siren, ShieldAlert, ChevronDown, AlertTriangle, ShieldCheck } from 'lucide-react';

export const HeroSection = ({ onOpenDashboard, onSimulateCorridor }) => {
  const scrollToFeatures = () => {
    const el = document.getElementById('features');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      style={{
        position: 'relative',
        width: '100%',
        minHeight: 'calc(100vh - 80px)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        overflow: 'hidden',
        backgroundColor: '#0B0F19'
      }}
    >
      {/* 1. Full-Screen Interactive 3D Spline Scene as Hero Canvas */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 1
        }}
      >
        <hana-viewer
          url="https://prod.spline.design/84iJr7VLkazXkLta-bLR/scene.hanacode"
          style={{
            width: '100%',
            height: '100%',
            display: 'block'
          }}
        ></hana-viewer>
      </div>

      {/* Subtle Dark Gradient Overlay on the Left for text readability */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'linear-gradient(90deg, rgba(11, 15, 25, 0.96) 0%, rgba(11, 15, 25, 0.82) 48%, rgba(11, 15, 25, 0.2) 100%)',
          zIndex: 2,
          pointerEvents: 'none'
        }}
      />

      {/* 2. Glassmorphic Hero Overlay Content */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          maxWidth: '1280px',
          width: '100%',
          margin: '0 auto',
          padding: '60px 40px 40px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          flex: 1
        }}
      >
        <div style={{ maxWidth: '680px' }}>
          {/* Government Official Initiative Pill */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 16px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'rgba(220, 38, 38, 0.2)',
              border: '1px solid rgba(248, 113, 113, 0.4)',
              backdropFilter: 'blur(10px)',
              marginBottom: '20px'
            }}
          >
            <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#EF4444' }} className="animate-pulse-slow" />
            <span style={{ fontSize: '12px', fontWeight: '800', color: '#FECACA', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              🇮🇳 GOVT. SMART CITY INITIATIVE · ZERO-ACCIDENT VISION COMMAND
            </span>
          </div>

          {/* Main Hero Headline */}
          <h1
            style={{
              fontSize: 'clamp(40px, 5.5vw, 64px)',
              fontWeight: '900',
              lineHeight: 1.08,
              letterSpacing: '-0.03em',
              color: '#FFFFFF',
              marginBottom: '20px',
              fontFamily: 'var(--font-heading)'
            }}
          >
            SARATHI
            <span
              style={{
                display: 'block',
                fontSize: 'clamp(24px, 3.2vw, 36px)',
                fontWeight: '700',
                background: 'linear-gradient(90deg, #F97316 0%, #FBBF24 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                marginTop: '10px'
              }}
            >
              Real-Time Accident Prevention & Emergency Corridor Intelligence
            </span>
          </h1>

          {/* Subtitle */}
          <p
            style={{
              fontSize: '18px',
              color: '#E2E8F0',
              lineHeight: 1.6,
              marginBottom: '36px',
              maxWidth: '600px'
            }}
          >
            Engineered for national traffic safety to eliminate intersection collisions, intercept risky swerving trajectories, dynamically clear ambulance corridors, and guide driver compliance.
          </p>

          {/* Primary Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap', marginBottom: '40px' }}>
            <Button
              variant="primary"
              size="lg"
              iconRight={ArrowRight}
              onClick={() => onOpenDashboard && onOpenDashboard('dashboard')}
              style={{
                boxShadow: '0 10px 25px rgba(249, 115, 22, 0.4)',
                padding: '14px 28px',
                fontSize: '16px'
              }}
            >
              Open Safety Dashboard
            </Button>

            <Button
              variant="secondary"
              size="lg"
              icon={Play}
              onClick={onSimulateCorridor || (() => onOpenDashboard && onOpenDashboard('guards'))}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                color: '#FFFFFF',
                borderColor: 'rgba(255, 255, 255, 0.25)',
                backdropFilter: 'blur(10px)',
                padding: '14px 24px',
                fontSize: '16px'
              }}
            >
              Simulate Green Corridor
            </Button>
          </div>

          {/* Quick Accident Prevention Metrics Badges */}
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <div style={{ padding: '8px 14px', backgroundColor: 'rgba(15, 23, 42, 0.75)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(248, 113, 113, 0.3)', backdropFilter: 'blur(8px)' }}>
              <div style={{ fontSize: '11px', color: '#FCA5A5', fontWeight: '700' }}>COLLISION PREVENTION</div>
              <div style={{ fontSize: '15px', fontWeight: '800', color: '#F87171' }}>-42% Signal Crashes</div>
            </div>

            <div style={{ padding: '8px 14px', backgroundColor: 'rgba(15, 23, 42, 0.75)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)' }}>
              <div style={{ fontSize: '11px', color: '#94A3B8' }}>AMBULANCE TRIAGE</div>
              <div style={{ fontSize: '15px', fontWeight: '800', color: '#4ADE80' }}>90s Pre-Clear</div>
            </div>

            <div style={{ padding: '8px 14px', backgroundColor: 'rgba(15, 23, 42, 0.75)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)' }}>
              <div style={{ fontSize: '11px', color: '#94A3B8' }}>RISK INTERCEPTION</div>
              <div style={{ fontSize: '15px', fontWeight: '800', color: '#FDE047' }}>Real-Time Vision AI</div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Bottom Scroll Indicator */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          padding: '16px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        <button
          onClick={scrollToFeatures}
          style={{
            background: 'none',
            border: 'none',
            color: '#94A3B8',
            fontSize: '12px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'color 0.15s ease'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#F97316')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#94A3B8')}
        >
          Explore System Features & Safety Modules
          <ChevronDown size={16} />
        </button>
      </div>
    </section>
  );
};

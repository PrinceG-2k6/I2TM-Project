import React, { useEffect, useState } from 'react';
import { ArrowRight, Play, Activity, Shield, Zap } from 'lucide-react';

export const HeroSection = ({ onOpenDashboard, onSimulateCorridor }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    const t = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <section
      style={{
        position: 'relative',
        width: '100%',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}
    >
      {/* Content */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          padding: '0 60px',
          maxWidth: '1280px',
          margin: '0 auto',
          width: '100%',
        }}
      >
        {/* Animated entrance */}
        <div
          style={{
            maxWidth: '700px',
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
            transition: 'all 0.6s ease',
          }}
        >
          {/* Main headline */}
          <h1
            style={{
              fontSize: 'clamp(44px, 6vw, 76px)',
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
              color: 'var(--color-4)',
              marginBottom: '8px',
            }}
          >
            SARATHI
          </h1>
          <h2
            style={{
              fontSize: 'clamp(18px, 2.8vw, 30px)',
              color: 'var(--color-6)',
              marginBottom: '24px',
              lineHeight: 1.3,
            }}
          >
            Traffic Intelligence & Accident Prevention
          </h2>

          {/* Subtitle */}
          <p
            style={{
              fontSize: '16px',
              color: 'var(--color-3)',
              lineHeight: 1.6,
              marginBottom: '40px',
              maxWidth: '560px',
            }}
          >
            Designed for traffic command centers to intercept risks, clear emergency corridors automatically, and optimize traffic flow across the city network.
          </p>

          {/* Action buttons */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              flexWrap: 'wrap',
              marginBottom: '48px',
            }}
          >
            <button
              onClick={() => onOpenDashboard && onOpenDashboard('dashboard')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '14px 26px',
                fontSize: '15px',
                color: 'var(--color-4)',
                background: 'var(--color-6)',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Open Dashboard
              <ArrowRight size={16} />
            </button>

            <button
              onClick={onSimulateCorridor || (() => onOpenDashboard && onOpenDashboard('green-corridors'))}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '13px 24px',
                fontSize: '15px',
                color: 'var(--color-4)',
                background: 'var(--color-2)',
                border: '1px solid var(--color-3)',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              <Play size={15} fill="currentColor" />
              Simulate Emergency
            </button>
          </div>

          {/* Quick metrics */}
          <div
            style={{
              display: 'flex',
              gap: '12px',
              flexWrap: 'wrap',
            }}
          >
            {[
              { icon: Shield, label: 'PREVENTION', value: 'Collision Avoidance', color: 'var(--color-6)', bg: 'var(--color-1)', border: 'var(--color-2)' },
              { icon: Activity, label: 'EMERGENCY', value: 'Automated Corridors', color: 'var(--color-6)', bg: 'var(--color-1)', border: 'var(--color-2)' },
              { icon: Zap, label: 'INTELLIGENCE', value: 'Live Camera Feeds', color: 'var(--color-6)', bg: 'var(--color-1)', border: 'var(--color-2)' },
            ].map((m) => {
              const Icon = m.icon;
              return (
                <div
                  key={m.label}
                  style={{
                    padding: '10px 16px',
                    backgroundColor: m.bg,
                    borderRadius: '4px',
                    border: `1px solid ${m.border}`,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
                    <Icon size={14} color={m.color} />
                    <div style={{ fontSize: '11px', color: m.color, letterSpacing: '0.05em' }}>
                      {m.label}
                    </div>
                  </div>
                  <div style={{ fontSize: '14px', color: 'var(--color-4)' }}>{m.value}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

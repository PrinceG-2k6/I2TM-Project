import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, Siren, Gauge, ShieldAlert, Tv } from 'lucide-react';

const useScrollReveal = () => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.12 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return [ref, visible];
};

const PillarCard = ({ pillar, idx, onOpenDashboard }) => {
  const [ref, visible] = useScrollReveal();
  const isReversed = idx % 2 === 1;
  const [cardHover, setCardHover] = useState(false);

  return (
    <div
      ref={ref}
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))',
        gap: '48px',
        alignItems: 'center',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(50px)',
        transition: `all 0.75s cubic-bezier(0.16, 1, 0.3, 1) ${idx * 0.1}s`,
      }}
    >
      {/* Text side */}
      <div style={{ order: isReversed ? 2 : 1 }}>
        <span
          style={{
            fontSize: '10px',
            fontWeight: '800',
            color: '#F97316',
            backgroundColor: 'rgba(249, 115, 22, 0.12)',
            border: '1px solid rgba(249, 115, 22, 0.25)',
            padding: '4px 12px',
            borderRadius: '9999px',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            display: 'inline-block',
            marginBottom: '20px',
          }}
        >
          {pillar.badge}
        </span>

        <h2
          style={{
            fontSize: 'clamp(26px, 3vw, 36px)',
            fontWeight: '800',
            lineHeight: 1.2,
            color: '#FFFFFF',
            marginBottom: '16px',
            fontFamily: 'var(--font-heading)',
            letterSpacing: '-0.02em',
          }}
        >
          {pillar.title}
        </h2>

        <p
          style={{
            fontSize: '15px',
            color: 'rgba(148, 163, 184, 0.9)',
            lineHeight: 1.75,
            marginBottom: '28px',
          }}
        >
          {pillar.description}
        </p>

        <button
          onClick={() => onOpenDashboard && onOpenDashboard(pillar.targetTab)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '11px 22px',
            fontSize: '14px',
            fontWeight: '700',
            color: '#FFFFFF',
            background: 'linear-gradient(135deg, #F97316, #EA580C)',
            border: 'none',
            borderRadius: '9px',
            cursor: 'pointer',
            boxShadow: '0 6px 20px rgba(249, 115, 22, 0.35)',
            transition: 'all 0.25s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 10px 30px rgba(249, 115, 22, 0.55)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(249, 115, 22, 0.35)';
          }}
        >
          {pillar.cta}
          <ArrowRight size={14} />
        </button>
      </div>

      {/* Mock UI card */}
      <div
        onClick={() => onOpenDashboard && onOpenDashboard(pillar.targetTab)}
        onMouseEnter={() => setCardHover(true)}
        onMouseLeave={() => setCardHover(false)}
        style={{
          order: isReversed ? 1 : 2,
          backgroundColor: '#1a1a1a',
          border: `1px solid ${cardHover ? 'rgba(249, 115, 22, 0.35)' : 'rgba(255,255,255,0.07)'}`,
          borderRadius: '16px',
          padding: '32px',
          cursor: 'pointer',
          transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          transform: cardHover ? 'translateY(-4px) scale(1.01)' : 'translateY(0) scale(1)',
          boxShadow: cardHover
            ? '0 20px 60px rgba(0,0,0,0.5), 0 0 30px rgba(249, 115, 22, 0.12)'
            : '0 8px 30px rgba(0,0,0,0.3)',
          backdropFilter: 'blur(10px)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Card glow effect */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '1px',
            background: cardHover
              ? 'linear-gradient(90deg, transparent, rgba(249,115,22,0.6), transparent)'
              : 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)',
            transition: 'all 0.3s ease',
          }}
        />

        {pillar.mockType === 'density' && (
          <div>
            <div style={{ fontSize: '12px', fontWeight: '700', marginBottom: '20px', color: '#94A3B8', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Approach Density Distribution
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { label: 'East Arterial (Critical)', pct: 92, time: '50s Green', color: '#EF4444', bg: 'rgba(239, 68, 68, 0.1)', border: 'rgba(239, 68, 68, 0.2)' },
                { label: 'North Corridor', pct: 76, time: '35s Green', color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.08)', border: 'rgba(245, 158, 11, 0.2)' },
                { label: 'West Feeder', pct: 28, time: '15s Green', color: '#22C55E', bg: 'rgba(34, 197, 94, 0.08)', border: 'rgba(34, 197, 94, 0.2)' },
              ].map((row) => (
                <div key={row.label} style={{ padding: '12px 14px', backgroundColor: row.bg, borderRadius: '9px', border: `1px solid ${row.border}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '13px', color: '#CBD5E1', fontWeight: '500' }}>{row.label}</span>
                    <strong style={{ fontSize: '13px', color: row.color, fontWeight: '700' }}>{row.time}</strong>
                  </div>
                  <div style={{ height: '4px', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${row.pct}%`, height: '100%', backgroundColor: row.color, borderRadius: '4px', transition: 'width 1s ease' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {pillar.mockType === 'emergency' && (
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '14px',
                backgroundColor: 'rgba(220, 38, 38, 0.15)',
                border: '1px solid rgba(220, 38, 38, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                animation: 'sirenFlash 1.5s infinite',
              }}
            >
              <Siren size={26} color="#DC2626" />
            </div>
            <div style={{ fontSize: '16px', fontWeight: '800', color: '#FFFFFF', marginBottom: '6px', fontFamily: 'var(--font-heading)' }}>
              Ambulance DL-01-AMB-889
            </div>
            <div style={{ fontSize: '13px', color: '#94A3B8', marginBottom: '20px' }}>
              Patient Severity: Critical · Route: AIIMS Corridor
            </div>
            <div
              style={{
                display: 'inline-flex',
                gap: '8px',
                padding: '8px 20px',
                backgroundColor: 'rgba(220, 38, 38, 0.15)',
                border: '1px solid rgba(220, 38, 38, 0.3)',
                color: '#FCA5A5',
                borderRadius: '9999px',
                fontWeight: '700',
                fontSize: '12px',
                letterSpacing: '0.06em',
              }}
            >
              TRIAGE RED · PRE-CLEARING JUNCTIONS
            </div>
          </div>
        )}

        {pillar.mockType === 'roadside' && (
          <div
            style={{
              backgroundColor: '#000000',
              padding: '24px',
              borderRadius: '12px',
              color: '#F8FAFC',
              textAlign: 'center',
              border: '2px solid rgba(255,255,255,0.08)',
            }}
          >
            <div style={{ fontSize: '10px', color: '#67E8F9', fontWeight: '800', marginBottom: '10px', letterSpacing: '0.12em' }}>
              ◉ VMS ROADSIDE BROADCAST · LIVE
            </div>
            <div style={{ fontSize: '15px', fontWeight: '600', marginBottom: '14px', color: '#F1F5F9', lineHeight: 1.4 }}>
              Ambulance approaching.<br />Keep left lane clear.
            </div>
            <div
              style={{
                fontSize: '28px',
                fontWeight: '900',
                color: '#FDE047',
                fontFamily: 'monospace',
                letterSpacing: '0.04em',
                textShadow: '0 0 20px rgba(253, 224, 71, 0.5)',
              }}
            >
              WAIT: 90s
            </div>
          </div>
        )}

        {pillar.mockType === 'risk' && (
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '16px',
              }}
            >
              <span style={{ fontSize: '14px', fontWeight: '700', color: '#F1F5F9' }}>Vehicle DL-04-TC-201</span>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: '800',
                  color: '#FCA5A5',
                  backgroundColor: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  padding: '3px 10px',
                  borderRadius: '9999px',
                  letterSpacing: '0.04em',
                }}
              >
                Risk: 84/100
              </span>
            </div>
            <div
              style={{
                height: '8px',
                backgroundColor: 'rgba(255,255,255,0.05)',
                borderRadius: '8px',
                overflow: 'hidden',
                marginBottom: '14px',
              }}
            >
              <div
                style={{
                  width: '84%',
                  height: '100%',
                  background: 'linear-gradient(90deg, #F59E0B, #EF4444)',
                  borderRadius: '8px',
                }}
              />
            </div>
            <p style={{ fontSize: '13px', color: '#94A3B8', lineHeight: 1.6 }}>
              Detected 38° aggressive lane cut across 3 lanes at 58 km/h. Marshal alert logged.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export const FeaturePillars = ({ onOpenDashboard }) => {
  const [headerRef, headerVisible] = useScrollReveal();

  const pillars = [
    {
      badge: 'SUSTAINABILITY',
      title: 'Adaptive capabilities for improving junction resilience',
      description:
        'ASI continuously evaluates real-time density across all approaches. When heavy congestion builds, it auto-allocates green cycles to prevent cascading gridlocks.',
      cta: 'Explore Density AI',
      targetTab: 'junctions',
      mockType: 'density',
    },
    {
      badge: 'FLEXIBILITY',
      title: 'Emergency Green Corridors with patient triage',
      description:
        'Ambulance dispatch is synced with patient severity (Critical, Serious, Stable). The system predicts route congestion and pre-clears upcoming signals before arrival.',
      cta: 'See Green Corridor',
      targetTab: 'green-corridors',
      mockType: 'emergency',
    },
    {
      badge: 'OPTIMIZATION',
      title: 'Roadside countdown boards for driver psychology',
      description:
        'Displays definite wait timers (e.g. 90s) on roadside LED screens. Drivers knowing the exact duration yield left with 84% higher compliance.',
      cta: 'View LED Simulator',
      targetTab: 'green-corridors',
      mockType: 'roadside',
    },
    {
      badge: 'MONITORING',
      title: 'Pattern recognition of aggressive lane cutting & swerving',
      description:
        'Computer vision models analyze erratic trajectories, sudden swerving, and aggressive lane cutting near signals to alert traffic marshals in real time.',
      cta: 'Inspect Vision Guard',
      targetTab: 'cameras',
      mockType: 'risk',
    },
  ];

  return (
    <section
      id="features"
      style={{
        padding: '120px 60px',
        maxWidth: '1280px',
        margin: '0 auto',
      }}
    >
      {/* Section header */}
      <div
        ref={headerRef}
        style={{
          textAlign: 'center',
          marginBottom: '80px',
          opacity: headerVisible ? 1 : 0,
          transform: headerVisible ? 'translateY(0)' : 'translateY(30px)',
          transition: 'all 0.75s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        <span
          style={{
            fontSize: '10px',
            fontWeight: '800',
            color: '#F97316',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            display: 'block',
            marginBottom: '14px',
          }}
        >
          Platform Capabilities
        </span>
        <h2
          style={{
            fontSize: 'clamp(32px, 4vw, 52px)',
            fontWeight: '900',
            color: '#FFFFFF',
            letterSpacing: '-0.03em',
            marginBottom: '16px',
            fontFamily: 'var(--font-heading)',
            lineHeight: 1.1,
          }}
        >
          Built for every traffic scenario
        </h2>
        <p
          style={{
            fontSize: '16px',
            color: 'rgba(148, 163, 184, 0.85)',
            maxWidth: '520px',
            margin: '0 auto',
            lineHeight: 1.65,
          }}
        >
          Four interconnected modules that collectively eliminate signal-induced accidents and emergency delays.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '80px' }}>
        {pillars.map((pillar, idx) => (
          <PillarCard key={pillar.badge} pillar={pillar} idx={idx} onOpenDashboard={onOpenDashboard} />
        ))}
      </div>
    </section>
  );
};

export default FeaturePillars;

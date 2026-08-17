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
            color: 'var(--color-6)',
            backgroundColor: 'var(--color-2)',
            border: '1px solid var(--color-3)',
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
            lineHeight: 1.2,
            color: 'var(--color-4)',
            marginBottom: '16px',
            letterSpacing: '-0.02em',
          }}
        >
          {pillar.title}
        </h2>

        <p
          style={{
            fontSize: '15px',
            color: 'var(--color-3)',
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
            color: 'var(--color-4)',
            background: 'var(--color-6)',
            border: 'none',
            borderRadius: '9px',
            cursor: 'pointer',
          }}
        >
          {pillar.cta}
          <ArrowRight size={14} />
        </button>
      </div>

      {/* Mock UI card */}
      <div
        onClick={() => onOpenDashboard && onOpenDashboard(pillar.targetTab)}
        style={{
          order: isReversed ? 1 : 2,
          backgroundColor: 'var(--color-2)',
          border: '1px solid var(--color-3)',
          borderRadius: '4px',
          padding: '32px',
          cursor: 'pointer',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {pillar.mockType === 'density' && (
          <div>
            <div style={{ fontSize: '12px', marginBottom: '20px', color: 'var(--color-3)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Approach Density Distribution
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { label: 'East Arterial (Critical)', pct: 92, time: '50s Green' },
                { label: 'North Corridor', pct: 76, time: '35s Green' },
                { label: 'West Feeder', pct: 28, time: '15s Green' },
              ].map((row) => (
                <div key={row.label} style={{ padding: '12px 14px', backgroundColor: 'var(--color-1)', borderRadius: '9px', border: `1px solid var(--color-3)` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '13px', color: 'var(--color-4)' }}>{row.label}</span>
                    <strong style={{ fontSize: '13px', color: 'var(--color-6)' }}>{row.time}</strong>
                  </div>
                  <div style={{ height: '4px', backgroundColor: 'var(--color-2)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${row.pct}%`, height: '100%', backgroundColor: 'var(--color-6)', borderRadius: '4px', transition: 'width 1s ease' }} />
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
                backgroundColor: 'var(--color-1)',
                border: '1px solid var(--color-6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
              }}
            >
              <Siren size={26} color="var(--color-6)" />
            </div>
            <div style={{ fontSize: '16px', color: 'var(--color-4)', marginBottom: '6px' }}>
              Ambulance DL-01-AMB-889
            </div>
            <div style={{ fontSize: '13px', color: 'var(--color-3)', marginBottom: '20px' }}>
              Patient Severity: Critical · Route: AIIMS Corridor
            </div>
            <div
              style={{
                display: 'inline-flex',
                gap: '8px',
                padding: '8px 20px',
                backgroundColor: 'var(--color-1)',
                border: '1px solid var(--color-6)',
                color: 'var(--color-6)',
                borderRadius: '9999px',
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
              backgroundColor: 'var(--color-1)',
              padding: '24px',
              borderRadius: '12px',
              color: 'var(--color-4)',
              textAlign: 'center',
              border: '1px solid var(--color-3)',
            }}
          >
            <div style={{ fontSize: '10px', color: 'var(--color-6)', marginBottom: '10px', letterSpacing: '0.12em' }}>
              ◉ VMS ROADSIDE BROADCAST · LIVE
            </div>
            <div style={{ fontSize: '15px', marginBottom: '14px', color: 'var(--color-4)', lineHeight: 1.4 }}>
              Ambulance approaching.<br />Keep left lane clear.
            </div>
            <div
              style={{
                fontSize: '28px',
                color: 'var(--color-6)',
                fontFamily: 'monospace',
                letterSpacing: '0.04em',
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
              <span style={{ fontSize: '14px', color: 'var(--color-4)' }}>Vehicle DL-04-TC-201</span>
              <span
                style={{
                  fontSize: '11px',
                  color: 'var(--color-6)',
                  backgroundColor: 'var(--color-1)',
                  border: '1px solid var(--color-6)',
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
                backgroundColor: 'var(--color-1)',
                borderRadius: '8px',
                overflow: 'hidden',
                marginBottom: '14px',
              }}
            >
              <div
                style={{
                  width: '84%',
                  height: '100%',
                  background: 'var(--color-6)',
                  borderRadius: '8px',
                }}
              />
            </div>
            <p style={{ fontSize: '13px', color: 'var(--color-3)', lineHeight: 1.6 }}>
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
          transition: 'all 0.75s ease',
        }}
      >
        <span
          style={{
            fontSize: '10px',
            color: 'var(--color-6)',
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
            color: 'var(--color-4)',
            letterSpacing: '-0.03em',
            marginBottom: '16px',
            lineHeight: 1.1,
          }}
        >
          Built for every traffic scenario
        </h2>
        <p
          style={{
            fontSize: '16px',
            color: 'var(--color-3)',
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

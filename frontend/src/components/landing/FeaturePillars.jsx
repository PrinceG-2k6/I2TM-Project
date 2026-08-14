import React from 'react';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Siren, Gauge, ShieldAlert, Tv, ArrowRight } from 'lucide-react';

export const FeaturePillars = ({ onOpenDashboard }) => {
  const pillars = [
    {
      badge: 'SUSTAINABILITY',
      title: 'Adaptive capabilities for improving junction resilience',
      description:
        'ASI continuously evaluates real-time density across all approaches. When heavy congestion builds, it auto-allocates green cycles to prevent cascading gridlocks.',
      cta: 'Explore Density AI',
      targetTab: 'services',
      mockType: 'density'
    },
    {
      badge: 'FLEXIBILITY',
      title: 'Emergency Green Corridors with patient triage',
      description:
        'Ambulance dispatch is synced with patient severity (Critical, Serious, Stable). The system predicts route congestion and pre-clears upcoming signals before arrival.',
      cta: 'See Green Corridor',
      targetTab: 'guards',
      mockType: 'emergency'
    },
    {
      badge: 'OPTIMIZATION',
      title: 'Roadside countdown boards for driver psychology',
      description:
        'Displays definite wait timers (e.g. 90s) on roadside LED screens. Drivers knowing the exact duration yield left with 84% higher compliance.',
      cta: 'View LED Simulator',
      targetTab: 'guards',
      mockType: 'roadside'
    },
    {
      badge: 'MONITORING',
      title: 'Pattern recognition of aggressive lane cutting & swerving',
      description:
        'Computer vision models analyze erratic trajectories, sudden swerving, and aggressive lane cutting near signals to alert traffic marshals in real time.',
      cta: 'Inspect Vision Guard',
      targetTab: 'guards',
      mockType: 'risk'
    }
  ];

  return (
    <section id="features" style={{ padding: '80px 40px', maxWidth: '1280px', margin: '0 auto' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '80px' }}>
        {pillars.map((pillar, idx) => {
          const isReversed = idx % 2 === 1;

          return (
            <div
              key={pillar.badge}
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(440px, 1fr))',
                gap: '60px',
                alignItems: 'center'
              }}
            >
              {/* Text Side */}
              <div style={{ order: isReversed ? 2 : 1 }}>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: '700',
                    color: 'var(--primary-orange-dark)',
                    backgroundColor: 'var(--primary-orange-soft)',
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-full)',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    display: 'inline-block',
                    marginBottom: '16px'
                  }}
                >
                  {pillar.badge}
                </span>

                <h2
                  style={{
                    fontSize: '36px',
                    fontWeight: '800',
                    lineHeight: 1.2,
                    color: 'var(--text-main)',
                    marginBottom: '18px'
                  }}
                >
                  {pillar.title}
                </h2>

                <p
                  style={{
                    fontSize: '16px',
                    color: 'var(--text-body)',
                    lineHeight: 1.6,
                    marginBottom: '28px'
                  }}
                >
                  {pillar.description}
                </p>

                <Button
                  variant="primary"
                  size="md"
                  iconRight={ArrowRight}
                  onClick={() => onOpenDashboard && onOpenDashboard(pillar.targetTab)}
                >
                  {pillar.cta}
                </Button>
              </div>

              {/* Mock UI Card Side */}
              <div
                onClick={() => onOpenDashboard && onOpenDashboard(pillar.targetTab)}
                style={{
                  order: isReversed ? 1 : 2,
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-warm)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '32px',
                  boxShadow: 'var(--shadow-card)',
                  cursor: 'pointer',
                  transition: 'transform 0.2s ease'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-3px)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
              >
                {pillar.mockType === 'density' && (
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '700', marginBottom: '16px', color: 'var(--text-main)' }}>
                      Approach Density Distribution
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div style={{ padding: '10px', backgroundColor: '#FEE2E2', borderRadius: '8px', display: 'flex', justifyContent: 'space-between' }}>
                        <span>East Arterial (Critical)</span>
                        <strong>92% (50s Green)</strong>
                      </div>
                      <div style={{ padding: '10px', backgroundColor: '#FEF3C7', borderRadius: '8px', display: 'flex', justifyContent: 'space-between' }}>
                        <span>North Corridor</span>
                        <strong>76% (35s Green)</strong>
                      </div>
                      <div style={{ padding: '10px', backgroundColor: '#DCFCE7', borderRadius: '8px', display: 'flex', justifyContent: 'space-between' }}>
                        <span>West Feeder</span>
                        <strong>28% (15s Green)</strong>
                      </div>
                    </div>
                  </div>
                )}

                {pillar.mockType === 'emergency' && (
                  <div style={{ textAlign: 'center' }}>
                    <Siren size={36} color="#DC2626" style={{ margin: '0 auto 12px' }} />
                    <div style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '4px' }}>
                      Ambulance DL-01-AMB-889
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
                      Patient Severity: Critical · Route: AIIMS Corridor
                    </div>
                    <div style={{ display: 'inline-flex', gap: '8px', padding: '8px 16px', backgroundColor: '#FEE2E2', color: '#DC2626', borderRadius: 'var(--radius-full)', fontWeight: '700', fontSize: '13px' }}>
                      TRIAGE RED · PRE-CLEARING JUNCTIONS
                    </div>
                  </div>
                )}

                {pillar.mockType === 'roadside' && (
                  <div style={{ backgroundColor: '#0F172A', padding: '20px', borderRadius: '12px', color: '#F8FAFC', textAlign: 'center' }}>
                    <div style={{ fontSize: '12px', color: '#67E8F9', fontWeight: '700', marginBottom: '8px' }}>
                      VMS ROADSIDE BROADCAST
                    </div>
                    <div style={{ fontSize: '16px', fontWeight: '700', marginBottom: '12px', color: '#FFFFFF' }}>
                      Ambulance approaching. Keep left lane clear.
                    </div>
                    <div style={{ fontSize: '24px', fontWeight: '900', color: '#FDE047', fontFamily: 'monospace' }}>
                      WAIT TIME: 90 SECONDS
                    </div>
                  </div>
                )}

                {pillar.mockType === 'risk' && (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <span style={{ fontSize: '14px', fontWeight: '700' }}>Vehicle DL-04-TC-201</span>
                      <Badge variant="critical" size="sm">Risk Score: 84/100</Badge>
                    </div>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                      Detected 38° aggressive lane cut across 3 lanes at 58 km/h. Marshal alert logged.
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

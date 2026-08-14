import React from 'react';
import { ShieldCheck, BarChart3, Clock, Target } from 'lucide-react';

export const WhyChooseUs = () => {
  const cards = [
    {
      icon: ShieldCheck,
      title: 'Protect emergency response times',
      description: 'Pre-clears conflicting junctions before the ambulance arrives, cutting average transit delays by up to 52%.'
    },
    {
      icon: BarChart3,
      title: 'Smooth out density spikes',
      description: 'Real-time adaptive green allocation reduces peak junction queues without fixed timer penalties.'
    },
    {
      icon: Clock,
      title: 'Reduce driver waiting ambiguity',
      description: 'Roadside countdown boards eliminate driver frustration and dramatically increase lane yielding compliance.'
    },
    {
      icon: Target,
      title: 'Recognize risky movement',
      description: 'Computer vision trajectory analytics detect aggressive lane cutting, sudden swerving, and unsafe lane violations.'
    }
  ];

  return (
    <section id="why-us" style={{ padding: '80px 40px', maxWidth: '1280px', margin: '0 auto', textAlign: 'center' }}>
      <h2 style={{ fontSize: '36px', fontWeight: '800', marginBottom: '16px', color: 'var(--text-main)' }}>
        Why Choose Us
      </h2>

      <p style={{ fontSize: '16px', color: 'var(--text-body)', maxWidth: '600px', margin: '0 auto 48px' }}>
        ASI provides municipal control rooms with end-to-end adaptive intelligence from density sensors to emergency triage.
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '24px'
        }}
      >
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <div
              key={c.title}
              style={{
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-warm)',
                borderRadius: 'var(--radius-lg)',
                padding: '28px 20px',
                textAlign: 'left',
                boxShadow: 'var(--shadow-card)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--primary-orange-soft)',
                  color: 'var(--primary-orange-dark)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '20px'
                }}
              >
                <Icon size={20} />
              </div>

              <div>
                <h3 style={{ fontSize: '17px', fontWeight: '700', color: 'var(--text-main)', marginBottom: '8px' }}>
                  {c.title}
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  {c.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

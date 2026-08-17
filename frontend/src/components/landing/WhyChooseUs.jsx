import React, { useEffect, useRef, useState } from 'react';
import { ShieldCheck, BarChart3, Clock, Target } from 'lucide-react';

const useScrollReveal = (threshold = 0.1) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold]);
  return [ref, visible];
};

const WhyCard = ({ card, idx }) => {
  const [cardRef, cardVisible] = useScrollReveal(0.08);
  const Icon = card.icon;

  return (
    <div
      ref={cardRef}
      style={{
        backgroundColor: 'var(--color-2)',
        border: '1px solid var(--color-3)',
        borderRadius: '4px',
        padding: '28px',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'default',
        transition: 'all 0.35s ease',
        transform: cardVisible ? 'translateY(0)' : 'translateY(40px)',
        opacity: cardVisible ? 1 : 0,
        transitionDelay: `${idx * 0.08}s`,
      }}
    >
      {/* Icon */}
      <div
        style={{
          width: '44px',
          height: '44px',
          borderRadius: '4px',
          backgroundColor: card.bg,
          border: `1px solid ${card.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '20px',
        }}
      >
        <Icon size={20} color={card.accent} />
      </div>

      {/* Big stat */}
      <div
        style={{
          fontSize: '38px',
          color: card.accent,
          lineHeight: 1,
          marginBottom: '4px',
          letterSpacing: '-0.03em',
        }}
      >
        {card.stat}
      </div>
      <div
        style={{
          fontSize: '11px',
          color: 'var(--color-3)',
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          marginBottom: '18px',
        }}
      >
        {card.statLabel}
      </div>

      {/* Title */}
      <h3
        style={{
          fontSize: '15px',
          color: 'var(--color-4)',
          marginBottom: '10px',
          lineHeight: 1.3,
        }}
      >
        {card.title}
      </h3>

      {/* Description */}
      <p
        style={{
          fontSize: '13px',
          color: 'var(--color-3)',
          lineHeight: 1.65,
          margin: 0,
        }}
      >
        {card.description}
      </p>
    </div>
  );
};

export const WhyChooseUs = () => {
  const [headerRef, headerVisible] = useScrollReveal();

  const cards = [
    {
      icon: ShieldCheck,
      title: 'Protect emergency response times',
      description: 'Pre-clears conflicting junctions before the ambulance arrives, cutting average transit delays by up to 52%.',
      stat: '52%',
      statLabel: 'delay reduction',
      accent: 'var(--color-6)',
      bg: 'var(--color-1)',
      border: 'var(--color-3)',
    },
    {
      icon: BarChart3,
      title: 'Smooth out density spikes',
      description: 'Real-time adaptive green allocation reduces peak junction queues without fixed timer penalties.',
      stat: '3.2×',
      statLabel: 'throughput gain',
      accent: 'var(--color-6)',
      bg: 'var(--color-1)',
      border: 'var(--color-3)',
    },
    {
      icon: Clock,
      title: 'Reduce driver waiting ambiguity',
      description: 'Roadside countdown boards eliminate driver frustration and dramatically increase lane yielding compliance.',
      stat: '84%',
      statLabel: 'compliance rate',
      accent: 'var(--color-6)',
      bg: 'var(--color-1)',
      border: 'var(--color-3)',
    },
    {
      icon: Target,
      title: 'Recognize risky movement',
      description: 'Computer vision trajectory analytics detect aggressive lane cutting, sudden swerving, and unsafe violations.',
      stat: '94%',
      statLabel: 'detection accuracy',
      accent: 'var(--color-6)',
      bg: 'var(--color-1)',
      border: 'var(--color-3)',
    },
  ];

  return (
    <section
      id="why-us"
      style={{
        padding: '100px 60px 120px',
        backgroundColor: 'transparent',
        borderTop: '1px solid var(--color-2)',
        borderBottom: '1px solid var(--color-2)',
      }}
    >
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        {/* Header */}
        <div
          ref={headerRef}
          style={{
            textAlign: 'center',
            marginBottom: '64px',
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
            Impact &amp; Results
          </span>
          <h2
            style={{
              fontSize: 'clamp(30px, 3.5vw, 48px)',
              color: 'var(--color-4)',
              letterSpacing: '-0.03em',
              marginBottom: '16px',
            }}
          >
            Why Choose SARATHI
          </h2>
          <p
            style={{
              fontSize: '15px',
              color: 'var(--color-3)',
              maxWidth: '480px',
              margin: '0 auto',
              lineHeight: 1.65,
            }}
          >
            ASI provides municipal control rooms with end-to-end adaptive intelligence — from density sensors to emergency triage.
          </p>
        </div>

        {/* Cards grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '20px',
          }}
        >
          {cards.map((card, idx) => (
            <WhyCard key={card.title} card={card} idx={idx} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;

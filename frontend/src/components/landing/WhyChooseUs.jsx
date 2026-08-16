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
  const [hovered, setHovered] = useState(false);

  return (
    <div
      ref={cardRef}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        backgroundColor: hovered ? card.bg : '#1a1a1a',
        border: `1px solid ${hovered ? card.border : 'rgba(255,255,255,0.06)'}`,
        borderRadius: '16px',
        padding: '28px',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'default',
        transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
        transform: cardVisible
          ? hovered ? 'translateY(-4px)' : 'translateY(0)'
          : 'translateY(40px)',
        opacity: cardVisible ? 1 : 0,
        transitionDelay: `${idx * 0.08}s`,
        boxShadow: hovered
          ? `0 20px 50px rgba(0,0,0,0.4), 0 0 0 1px ${card.border}`
          : '0 4px 20px rgba(0,0,0,0.25)',
      }}
    >
      {/* Icon */}
      <div
        style={{
          width: '44px',
          height: '44px',
          borderRadius: '11px',
          backgroundColor: card.bg,
          border: `1px solid ${card.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '20px',
          transition: 'all 0.3s ease',
          transform: hovered ? 'scale(1.1)' : 'scale(1)',
        }}
      >
        <Icon size={20} color={card.accent} />
      </div>

      {/* Big stat */}
      <div
        style={{
          fontSize: '38px',
          fontWeight: '900',
          color: card.accent,
          fontFamily: 'var(--font-heading)',
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
          color: 'rgba(255,255,255,0.35)',
          fontWeight: '600',
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
          fontWeight: '700',
          color: '#FFFFFF',
          marginBottom: '10px',
          fontFamily: 'var(--font-heading)',
          lineHeight: 1.3,
        }}
      >
        {card.title}
      </h3>

      {/* Description */}
      <p
        style={{
          fontSize: '13px',
          color: 'rgba(148, 163, 184, 0.75)',
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
      accent: '#22C55E',
      bg: 'rgba(34, 197, 94, 0.08)',
      border: 'rgba(34, 197, 94, 0.18)',
    },
    {
      icon: BarChart3,
      title: 'Smooth out density spikes',
      description: 'Real-time adaptive green allocation reduces peak junction queues without fixed timer penalties.',
      stat: '3.2×',
      statLabel: 'throughput gain',
      accent: '#3B82F6',
      bg: 'rgba(59, 130, 246, 0.08)',
      border: 'rgba(59, 130, 246, 0.18)',
    },
    {
      icon: Clock,
      title: 'Reduce driver waiting ambiguity',
      description: 'Roadside countdown boards eliminate driver frustration and dramatically increase lane yielding compliance.',
      stat: '84%',
      statLabel: 'compliance rate',
      accent: '#F59E0B',
      bg: 'rgba(245, 158, 11, 0.08)',
      border: 'rgba(245, 158, 11, 0.18)',
    },
    {
      icon: Target,
      title: 'Recognize risky movement',
      description: 'Computer vision trajectory analytics detect aggressive lane cutting, sudden swerving, and unsafe violations.',
      stat: '94%',
      statLabel: 'detection accuracy',
      accent: '#F97316',
      bg: 'rgba(249, 115, 22, 0.08)',
      border: 'rgba(249, 115, 22, 0.18)',
    },
  ];

  return (
    <section
      id="why-us"
      style={{
        padding: '100px 60px 120px',
        backgroundColor: '#111111',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
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
            Impact &amp; Results
          </span>
          <h2
            style={{
              fontSize: 'clamp(30px, 3.5vw, 48px)',
              fontWeight: '900',
              color: '#FFFFFF',
              letterSpacing: '-0.03em',
              marginBottom: '16px',
              fontFamily: 'var(--font-heading)',
            }}
          >
            Why Choose SARATHI
          </h2>
          <p
            style={{
              fontSize: '15px',
              color: 'rgba(148, 163, 184, 0.8)',
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

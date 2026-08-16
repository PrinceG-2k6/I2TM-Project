import React from 'react';
import { BrandLogo } from '../common/Icons';
import { ArrowRight } from 'lucide-react';

export const Footer = ({ onOpenDashboard }) => {
  const links = [
    { label: 'Features', id: 'features' },
    { label: 'Architecture', id: 'architecture' },
    { label: 'Why Us', id: 'why-us' },
  ];

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const team = [
    { name: 'Sparsh Gupta', role: 'Dashboard & Frontend' },
    { name: 'Suraj', role: 'AI Density & Triage Engine' },
  ];

  return (
    <footer
      id="team"
      style={{
        backgroundColor: '#0d0d0d',
        borderTop: '1px solid rgba(255, 255, 255, 0.06)',
        padding: '64px 60px 40px',
        color: '#FFFFFF',
      }}
    >
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        {/* Top section */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '48px',
            marginBottom: '60px',
          }}
        >
          {/* Brand column */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <BrandLogo size={30} color="#F97316" />
              <div>
                <span
                  style={{
                    fontSize: '18px',
                    fontWeight: '900',
                    color: '#FFFFFF',
                    letterSpacing: '-0.02em',
                    textTransform: 'uppercase',
                    fontFamily: 'var(--font-heading)',
                  }}
                >
                  SARATHI
                </span>
                <span
                  style={{
                    fontSize: '9px',
                    display: 'block',
                    color: '#F97316',
                    fontWeight: '700',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                  }}
                >
                  सारथी · Adaptive Signal Intelligence
                </span>
              </div>
            </div>
            <p
              style={{
                fontSize: '13px',
                color: 'rgba(148, 163, 184, 0.7)',
                lineHeight: 1.7,
                maxWidth: '260px',
              }}
            >
              National traffic safety system engineered for zero-accident intersections and real-time emergency corridor management.
            </p>
          </div>

          {/* Navigation column */}
          <div>
            <div
              style={{
                fontSize: '11px',
                fontWeight: '700',
                color: 'rgba(255,255,255,0.35)',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                marginBottom: '20px',
              }}
            >
              Navigation
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {links.map((link) => (
                <button
                  key={link.id}
                  onClick={() => scrollTo(link.id)}
                  style={{
                    fontSize: '14px',
                    color: 'rgba(148, 163, 184, 0.75)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                    padding: 0,
                    transition: 'color 0.2s ease',
                    fontWeight: '500',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#F97316')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(148, 163, 184, 0.75)')}
                >
                  {link.label}
                </button>
              ))}
              <button
                onClick={() => onOpenDashboard && onOpenDashboard('dashboard')}
                style={{
                  fontSize: '14px',
                  color: '#F97316',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                  padding: 0,
                  fontWeight: '700',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'gap 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  const arrow = e.currentTarget.querySelector('svg');
                  if (arrow) arrow.style.transform = 'translateX(3px)';
                }}
                onMouseLeave={(e) => {
                  const arrow = e.currentTarget.querySelector('svg');
                  if (arrow) arrow.style.transform = 'translateX(0)';
                }}
              >
                Command Center
                <ArrowRight size={13} style={{ transition: 'transform 0.2s ease' }} />
              </button>
            </div>
          </div>

          {/* Team column */}
          <div id="team-members">
            <div
              style={{
                fontSize: '11px',
                fontWeight: '700',
                color: 'rgba(255,255,255,0.35)',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                marginBottom: '20px',
              }}
            >
              Team
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {team.map((member) => (
                <div key={member.name}>
                  <div
                    style={{
                      fontSize: '14px',
                      fontWeight: '700',
                      color: '#F1F5F9',
                      marginBottom: '2px',
                    }}
                  >
                    {member.name}
                  </div>
                  <div style={{ fontSize: '12px', color: 'rgba(148, 163, 184, 0.6)' }}>
                    {member.role}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA column */}
          <div>
            <div
              style={{
                fontSize: '11px',
                fontWeight: '700',
                color: 'rgba(255,255,255,0.35)',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                marginBottom: '20px',
              }}
            >
              Get Started
            </div>
            <button
              onClick={() => onOpenDashboard && onOpenDashboard('dashboard')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 22px',
                fontSize: '14px',
                fontWeight: '700',
                color: '#FFFFFF',
                background: 'linear-gradient(135deg, #F97316, #EA580C)',
                border: 'none',
                borderRadius: '10px',
                cursor: 'pointer',
                boxShadow: '0 6px 20px rgba(249, 115, 22, 0.35)',
                transition: 'all 0.25s ease',
                marginBottom: '12px',
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
              Open Dashboard
              <ArrowRight size={14} />
            </button>
            <p style={{ fontSize: '12px', color: 'rgba(148, 163, 184, 0.5)', margin: 0 }}>
              No login required · Instant demo
            </p>
          </div>
        </div>

        {/* Divider */}
        <div
          style={{
            height: '1px',
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)',
            marginBottom: '28px',
          }}
        />

        {/* Bottom bar */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '16px',
          }}
        >
          <span style={{ fontSize: '12px', color: 'rgba(148, 163, 184, 0.4)' }}>
            © 2026 SARATHI Systems · Built for Smart City Initiative · All rights reserved
          </span>
          <span
            style={{
              fontSize: '11px',
              color: '#F97316',
              fontWeight: '700',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
            }}
          >
            🇮🇳 Made in India · Zero-Accident Vision
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

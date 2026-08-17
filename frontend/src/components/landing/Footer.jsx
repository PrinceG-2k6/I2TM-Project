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

  return (
    <footer
      id="team"
      style={{
        backgroundColor: 'var(--color-1)',
        borderTop: '1px solid var(--color-2)',
        padding: '64px 60px 40px',
        color: 'var(--color-4)',
      }}
    >
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        {/* Top section */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '48px',
          }}
        >
          {/* Brand column */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <BrandLogo size={30} />
              <div>
                <span
                  style={{
                    fontSize: '18px',
                    color: 'var(--color-4)',
                    letterSpacing: '-0.02em',
                    textTransform: 'uppercase',
                  }}
                >
                  SARATHI
                </span>
                <span
                  style={{
                    fontSize: '9px',
                    display: 'block',
                    color: 'var(--color-6)',
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
                color: 'var(--color-3)',
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
                color: 'var(--color-3)',
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
                    color: 'var(--color-3)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                    padding: 0,
                  }}
                >
                  {link.label}
                </button>
              ))}
              <button
                onClick={() => onOpenDashboard && onOpenDashboard('dashboard')}
                style={{
                  fontSize: '14px',
                  color: 'var(--color-6)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                Command Center
                <ArrowRight size={13} />
              </button>
            </div>
          </div>

          {/* CTA column */}
          <div>
            <div
              style={{
                fontSize: '11px',
                color: 'var(--color-3)',
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
                color: 'var(--color-4)',
                background: 'var(--color-6)',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Open Dashboard
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { BrandLogo } from '../common/Icons';
import { Button } from '../common/Button';
import { ArrowRight } from 'lucide-react';

export const Navbar = ({ onOpenDashboard }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogoClick = () => {
    if (location.pathname === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate('/');
    }
  };

  const scrollToSection = (id) => {
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const navLinks = [
    { label: 'Features', action: () => scrollToSection('features') },
    { label: 'Architecture', action: () => scrollToSection('architecture') },
    { label: 'Why Us', action: () => scrollToSection('why-us') },
    { label: 'Team', action: () => scrollToSection('team') },
    { label: 'Command Center', action: () => onOpenDashboard ? onOpenDashboard('dashboard') : navigate('/dashboard') }
  ];

  return (
    <nav
      style={{
        height: '80px',
        padding: '0 40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#0F172A',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        color: '#FFFFFF'
      }}
    >
      {/* Brand Logo (Navigates home / scrolls to top) */}
      <div
        onClick={handleLogoClick}
        style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
      >
        <BrandLogo size={34} color="var(--primary-orange)" />
        <div>
          <span style={{ fontSize: '24px', fontWeight: '900', color: '#FFFFFF', letterSpacing: '-0.02em', fontFamily: 'var(--font-heading)', textTransform: 'uppercase' }}>
            SARATHI
          </span>
          <span style={{ fontSize: '10px', display: 'block', color: 'var(--primary-orange)', fontWeight: '700', letterSpacing: '0.08em', marginTop: '-2px' }}>
            सारथी · SMART TRAFFIC INTELLIGENCE
          </span>
        </div>
      </div>

      {/* Purposeful Page Section Scroll Links + Direct Dashboard Link */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
        {navLinks.map((link) => (
          <button
            key={link.label}
            onClick={link.action}
            style={{
              fontSize: '14px',
              fontWeight: link.label === 'Command Center' ? '700' : '600',
              color: link.label === 'Command Center' ? 'var(--primary-orange)' : '#CBD5E1',
              textDecoration: 'none',
              cursor: 'pointer',
              background: 'none',
              border: 'none',
              padding: '4px 8px',
              transition: 'color 0.15s ease'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--primary-orange)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = link.label === 'Command Center' ? 'var(--primary-orange)' : '#CBD5E1')}
          >
            {link.label}
          </button>
        ))}
      </div>

      {/* Single Clear "Get Started" Entry CTA */}
      <div>
        <Button
          variant="primary"
          size="md"
          iconRight={ArrowRight}
          onClick={() => onOpenDashboard ? onOpenDashboard('dashboard') : navigate('/dashboard')}
        >
          Get Started
        </Button>
      </div>
    </nav>
  );
};

export default Navbar;

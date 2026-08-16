import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { BrandLogo } from '../common/Icons';
import { ArrowRight, Menu, X } from 'lucide-react';

export const Navbar = ({ onOpenDashboard }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogoClick = () => {
    if (location.pathname === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate('/');
    }
  };

  const scrollToSection = (id) => {
    setMobileOpen(false);
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
  ];

  return (
    <>
      <nav
        style={{
          height: '72px',
          padding: '0 32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: scrolled ? 'rgba(13, 13, 13, 0.92)' : 'transparent',
          backdropFilter: scrolled ? 'blur(20px) saturate(180%)' : 'none',
          WebkitBackdropFilter: scrolled ? 'blur(20px) saturate(180%)' : 'none',
          borderBottom: scrolled ? '1px solid rgba(255, 255, 255, 0.06)' : '1px solid transparent',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
          color: '#FFFFFF'
        }}
      >
        {/* Brand Logo */}
        <div
          onClick={handleLogoClick}
          style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
        >
          <BrandLogo size={30} color="#F97316" />
          <div>
            <span style={{
              fontSize: '20px',
              fontWeight: '900',
              color: '#FFFFFF',
              letterSpacing: '-0.02em',
              fontFamily: 'var(--font-heading)',
              textTransform: 'uppercase'
            }}>
              SARATHI
            </span>
            <span style={{
              fontSize: '9px',
              display: 'block',
              color: '#F97316',
              fontWeight: '700',
              letterSpacing: '0.1em',
              marginTop: '-2px',
              textTransform: 'uppercase'
            }}>
              सारथी · Smart Traffic Intelligence
            </span>
          </div>
        </div>

        {/* Desktop Nav Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {navLinks.map((link) => (
            <button
              key={link.label}
              onClick={link.action}
              style={{
                fontSize: '13px',
                fontWeight: '500',
                color: 'rgba(255,255,255,0.65)',
                cursor: 'pointer',
                background: 'none',
                border: 'none',
                padding: '8px 14px',
                borderRadius: '8px',
                transition: 'all 0.2s ease',
                letterSpacing: '0.01em'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#FFFFFF';
                e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'rgba(255,255,255,0.65)';
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              {link.label}
            </button>
          ))}
        </div>

        {/* CTA Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={() => onOpenDashboard && onOpenDashboard('dashboard')}
            style={{
              fontSize: '13px',
              fontWeight: '600',
              color: 'rgba(255,255,255,0.75)',
              cursor: 'pointer',
              background: 'none',
              border: '1px solid rgba(255,255,255,0.15)',
              padding: '8px 16px',
              borderRadius: '8px',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#FFFFFF';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.35)';
              e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.07)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'rgba(255,255,255,0.75)';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            Command Center
          </button>

          <button
            onClick={() => onOpenDashboard && onOpenDashboard('dashboard')}
            style={{
              fontSize: '13px',
              fontWeight: '700',
              color: '#FFFFFF',
              cursor: 'pointer',
              background: 'linear-gradient(135deg, #F97316, #EA580C)',
              border: 'none',
              padding: '9px 18px',
              borderRadius: '8px',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 4px 15px rgba(249, 115, 22, 0.35)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(249, 115, 22, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(249, 115, 22, 0.35)';
            }}
          >
            Get Started
            <ArrowRight size={14} />
          </button>

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            style={{
              display: 'none',
              background: 'none',
              border: 'none',
              color: '#FFF',
              cursor: 'pointer',
              padding: '4px'
            }}
            className="mobile-menu-btn"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      <style>{`
        @media (max-width: 768px) {
          .mobile-menu-btn { display: block !important; }
        }
      `}</style>
    </>
  );
};

export default Navbar;

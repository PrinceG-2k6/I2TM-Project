import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { BrandLogo } from '../common/Icons';
import { ArrowRight, Menu, X } from 'lucide-react';

export const Navbar = ({ onOpenDashboard }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const currentScrollY = window.scrollY;
      setScrolled(currentScrollY > 20);
      
      if (currentScrollY > lastScrollY && currentScrollY > 80) {
        setHidden(true); // scrolling down
      } else {
        setHidden(false); // scrolling up
      }
      setLastScrollY(currentScrollY);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [lastScrollY]);

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
          backgroundColor: scrolled ? 'var(--color-1)' : 'transparent',
          borderBottom: scrolled ? '1px solid var(--color-2)' : '1px solid transparent',
          position: 'fixed',
          top: hidden ? '-72px' : '0',
          left: 0,
          right: 0,
          zIndex: 100,
          transition: 'top 0.3s ease, background-color 0.3s ease, border-bottom 0.3s ease',
          color: 'var(--color-4)'
        }}
      >
        {/* Brand Logo */}
        <div
          onClick={handleLogoClick}
          style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
        >
          <BrandLogo size={28} />
          <div>
            <span style={{
              fontSize: '18px',
              color: 'var(--color-4)',
              letterSpacing: '0.05em',
            }}>
              SARATHI
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
                color: 'var(--color-3)',
                cursor: 'pointer',
                background: 'none',
                border: 'none',
                padding: '8px 14px',
                borderRadius: '2px',
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
              color: 'var(--color-3)',
              cursor: 'pointer',
              background: 'none',
              border: '1px solid var(--color-2)',
              padding: '8px 16px',
              borderRadius: '2px',
            }}
          >
            Dashboard
          </button>

          <button
            onClick={() => onOpenDashboard && onOpenDashboard('dashboard')}
            style={{
              fontSize: '13px',
              color: 'var(--color-4)',
              cursor: 'pointer',
              background: 'var(--color-6)',
              border: 'none',
              padding: '9px 18px',
              borderRadius: '2px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            Open App
            <ArrowRight size={14} />
          </button>

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            style={{
              display: 'none',
              background: 'none',
              border: 'none',
              color: 'var(--color-4)',
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

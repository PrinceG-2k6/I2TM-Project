import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GitFork,
  LayoutDashboard,
  AlertTriangle,
  Camera,
  ShieldCheck,
  Clock,
  ArrowLeft,
  ChevronUp,
  Radio,
  Siren,
  RotateCcw
} from 'lucide-react';
import { BrandLogo } from '../common/Icons';
import { useTraffic } from '../../context/TrafficContext';

export const Sidebar = ({ activeTab = 'dashboard', onSelectTab, onNavigateLanding }) => {
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { activeCorridors, removeEmergencyCorridor } = useTraffic();
  const emergency = activeCorridors && activeCorridors.length > 0 ? activeCorridors[0] : { active: false };

  const handleSelectTab = (tabId) => {
    if (onSelectTab) {
      onSelectTab(tabId);
    } else {
      navigate(tabId === 'dashboard' ? '/dashboard' : `/dashboard/${tabId}`);
    }
  };

  const handleLanding = () => {
    if (onNavigateLanding) {
      onNavigateLanding();
    } else {
      navigate('/');
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard Map', icon: LayoutDashboard, badge: 'Live' },
    { id: 'junctions', label: 'Junctions', icon: GitFork, badge: '10' },
    { id: 'cameras', label: 'Cameras & Signals', icon: Camera, badge: 'Live' },
    { id: 'incidents', label: 'Incidents Feed', icon: Radio, badge: 'Live', badgeVariant: 'warning' },
    { id: 'green-corridors', label: 'Green Corridors', icon: Siren },
    { id: 'timeline', label: 'Timeline', icon: Clock }
  ];

  return (
    <aside
      style={{
        width: '240px',
        minWidth: '240px',
        maxWidth: '240px',
        flexShrink: 0,
        height: '100%',
        backgroundColor: '#121624',
        color: '#94A3B8',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '24px 16px',
        borderRight: '1px solid #1E2337',
        zIndex: 40,
        userSelect: 'none'
      }}
    >
      {/* Brand Header & Top Actions */}
      <div>
        <div
          onClick={handleLanding}
          style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '0 8px', marginBottom: '14px', cursor: 'pointer' }}
          title="Click to return to Landing Page"
        >
          <BrandLogo size={32} color="#FF5A43" />
          <div>
            <span style={{ fontSize: '22px', fontWeight: '900', color: '#FFFFFF', letterSpacing: '-0.02em', fontFamily: 'Outfit, sans-serif', textTransform: 'uppercase', display: 'block', lineHeight: 1 }}>
              SARATHI
            </span>
            <span style={{ fontSize: '10px', display: 'block', color: '#FF5A43', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: '4px' }}>
              सारथी · TRAFFIC INTEL
            </span>
          </div>
        </div>

        {/* Dedicated Back to Landing Page link button in Sidebar */}
        <button
          onClick={handleLanding}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            width: '100%',
            padding: '8px 12px',
            borderRadius: '8px',
            backgroundColor: '#1E2438',
            color: '#F1F5F9',
            fontSize: '12px',
            fontWeight: '700',
            marginBottom: '10px',
            cursor: 'pointer',
            border: '1px solid #334155',
            transition: 'all 0.15s ease'
          }}
        >
          <ArrowLeft size={15} color="#FF5A43" />
          <span>← Back to Landing</span>
        </button>


        {/* Navigation items */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isSelected = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleSelectTab(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  backgroundColor: isSelected ? '#FF5A43' : 'transparent',
                  color: isSelected ? '#FFFFFF' : '#94A3B8',
                  fontWeight: isSelected ? '700' : '500',
                  fontSize: '13px',
                  boxShadow: isSelected ? '0 4px 14px rgba(255, 90, 67, 0.35)' : 'none',
                  transition: 'all 0.15s ease',
                  textAlign: 'left',
                  cursor: 'pointer'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Icon size={16} color={isSelected ? '#FFFFFF' : '#94A3B8'} />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    style={{
                      backgroundColor: isSelected ? 'rgba(0,0,0,0.25)' : item.badgeVariant === 'warning' ? '#FF5A43' : '#334155',
                      color: '#FFFFFF',
                      fontSize: '11px',
                      fontWeight: '700',
                      padding: '2px 7px',
                      borderRadius: '9999px'
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Operator Profile Card & Status */}
      <div style={{ position: 'relative' }}>
        {/* Grid Online Card */}
        <div style={{ backgroundColor: '#1A1F33', border: '1px solid #28304D', borderRadius: '8px', padding: '12px', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <Radio size={13} color="#F97316" className="animate-pulse-slow" />
            <span style={{ fontSize: '11px', fontWeight: '700', color: '#E2E8F0' }}>
              SARATHI Grid Live
            </span>
          </div>
          <p style={{ fontSize: '11px', color: '#94A3B8', margin: 0 }}>
            4 Junction nodes synced
          </p>
        </div>

        {/* User Badge */}
        <div
          onClick={() => setShowUserMenu(!showUserMenu)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 10px',
            backgroundColor: '#1E2337',
            borderRadius: '8px',
            cursor: 'pointer',
            border: '1px solid #2A3047'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: 28, height: 28, borderRadius: '6px', backgroundColor: '#D97706', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '12px' }}>
              ST
            </div>
            <div>
              <div style={{ fontSize: '12px', fontWeight: '700', color: '#FFFFFF' }}>SARATHI Node</div>
              <div style={{ fontSize: '10px', color: '#94A3B8' }}>ops@sarathi.gov.in</div>
            </div>
          </div>

          <ChevronUp size={15} color="#94A3B8" />
        </div>

        {/* User Popup Menu */}
        {showUserMenu && (
          <div
            style={{
              position: 'absolute',
              bottom: 'calc(100% + 8px)',
              left: 0,
              right: 0,
              backgroundColor: '#FFFFFF',
              borderRadius: '8px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
              padding: '8px 0',
              border: '1px solid #E2E8F0',
              zIndex: 100
            }}
          >
            <div style={{ padding: '8px 16px', borderBottom: '1px solid #F1F5F9' }}>
              <div style={{ fontSize: '13px', fontWeight: '700', color: '#0F172A' }}>SARATHI Control</div>
              <div style={{ fontSize: '11px', color: '#64748B' }}>ops@sarathi.gov.in</div>
            </div>
            <div style={{ padding: '4px 0' }}>
              {['Central Command', 'Delhi Ring Node', 'AIIMS Hub (Active)', 'Bengaluru Unit'].map((org, i) => (
                <div
                  key={org}
                  style={{
                    padding: '6px 16px',
                    fontSize: '12px',
                    color: i === 2 ? '#FF5A43' : '#334155',
                    fontWeight: i === 2 ? '700' : '400',
                    cursor: 'pointer'
                  }}
                >
                  {org}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;

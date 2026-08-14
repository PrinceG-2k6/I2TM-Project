import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  AlertTriangle, 
  Map, 
  Settings, 
  Sliders, 
  Layers, 
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
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { emergency, triggerEmergencyCorridor, resetEmergencyCorridor } = useTraffic();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: '10' },
    { id: 'fyis', label: 'FYIs', icon: AlertTriangle, badge: '10', badgeVariant: 'warning' },
    { id: 'map', label: 'Grid Map', icon: Map, badge: 'Live', badgeVariant: 'warning' },
    { id: 'features', label: 'Features', icon: Sliders },
    { id: 'services', label: 'Services', icon: Layers },
    { id: 'guards', label: 'Guards', icon: ShieldCheck },
    { id: 'timeline', label: 'Timeline', icon: Clock },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <aside
      style={{
        width: '240px',
        backgroundColor: 'var(--bg-sidebar)',
        color: 'var(--text-sidebar)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '24px 16px',
        borderRight: '1px solid #1E2337',
        height: '100vh',
        position: 'sticky',
        top: 0,
        zIndex: 40,
        userSelect: 'none',
        flexShrink: 0
      }}
    >
      {/* Brand Header & Top Actions */}
      <div>
        <div
          onClick={onNavigateLanding}
          style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '0 8px', marginBottom: '14px', cursor: 'pointer' }}
          title="Click to return to Landing Page"
        >
          <BrandLogo size={32} color="var(--primary-orange)" />
          <div>
            <span style={{ fontSize: '22px', fontWeight: '900', color: '#FFFFFF', letterSpacing: '-0.02em', fontFamily: 'var(--font-heading)', textTransform: 'uppercase' }}>
              SARATHI
            </span>
            <span style={{ fontSize: '10px', display: 'block', color: 'var(--primary-orange)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              सारथी · TRAFFIC INTEL
            </span>
          </div>
        </div>

        {/* Dedicated Back to Landing Page link button in Sidebar */}
        <button
          onClick={onNavigateLanding}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            width: '100%',
            padding: '8px 12px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: '#1E2438',
            color: '#F1F5F9',
            fontSize: '12px',
            fontWeight: '700',
            marginBottom: '10px',
            cursor: 'pointer',
            border: '1px solid #334155',
            transition: 'all 0.15s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#2D3748';
            e.currentTarget.style.borderColor = 'var(--primary-orange)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#1E2438';
            e.currentTarget.style.borderColor = '#334155';
          }}
        >
          <ArrowLeft size={15} color="var(--primary-orange)" />
          <span>← Back to Landing</span>
        </button>

        {/* Top Emergency Green Corridor Simulation & Reset Button (Dedicated in Sidebar) */}
        <div style={{ marginBottom: '16px' }}>
          {emergency.active ? (
            <button
              onClick={resetEmergencyCorridor}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                width: '100%',
                padding: '10px 12px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: '#7F1D1D',
                border: '2px solid #EF4444',
                color: '#FFFFFF',
                fontSize: '12px',
                fontWeight: '800',
                cursor: 'pointer',
                boxShadow: '0 0 12px rgba(239, 68, 68, 0.4)',
                transition: 'all 0.15s ease'
              }}
            >
              <RotateCcw size={14} className="animate-pulse-slow" />
              <span>Reset Corridor ({emergency.countdownSeconds}s)</span>
            </button>
          ) : (
            <button
              onClick={() => triggerEmergencyCorridor('CRITICAL')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                width: '100%',
                padding: '10px 12px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: '#DC2626',
                border: '1px solid #F87171',
                color: '#FFFFFF',
                fontSize: '12px',
                fontWeight: '800',
                cursor: 'pointer',
                boxShadow: '0 4px 10px rgba(220, 38, 38, 0.35)',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#B91C1C')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#DC2626')}
            >
              <Siren size={15} />
              <span>Simulate Green Corridor</span>
            </button>
          )}
        </div>

        {/* Navigation items */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isSelected = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onSelectTab && onSelectTab(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '9px 12px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: isSelected ? 'var(--primary-orange)' : 'transparent',
                  color: isSelected ? '#FFFFFF' : 'var(--text-sidebar)',
                  fontWeight: isSelected ? '700' : '500',
                  fontSize: '13px',
                  transition: 'all 0.15s ease',
                  textAlign: 'left',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) e.currentTarget.style.backgroundColor = 'var(--bg-sidebar-hover)';
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Icon size={16} color={isSelected ? '#FFFFFF' : '#94A3B8'} />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    style={{
                      backgroundColor: isSelected ? 'rgba(0,0,0,0.25)' : item.badgeVariant === 'warning' ? '#EA580C' : '#334155',
                      color: '#FFFFFF',
                      fontSize: '11px',
                      fontWeight: '700',
                      padding: '2px 7px',
                      borderRadius: 'var(--radius-full)'
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
        <div
          style={{
            backgroundColor: '#1A1F33',
            border: '1px solid #28304D',
            borderRadius: 'var(--radius-md)',
            padding: '12px',
            marginBottom: '14px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <Radio size={13} color="var(--primary-orange)" className="animate-pulse-slow" />
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
            borderRadius: 'var(--radius-md)',
            cursor: 'pointer',
            border: '1px solid #2A3047'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 'var(--radius-sm)',
                backgroundColor: '#D97706',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '700',
                fontSize: '12px'
              }}
            >
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
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-modal)',
              padding: '8px 0',
              border: '1px solid var(--border-warm)',
              zIndex: 100
            }}
          >
            <div style={{ padding: '8px 16px', borderBottom: '1px solid var(--border-warm)' }}>
              <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-main)' }}>SARATHI Control</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>ops@sarathi.gov.in</div>
            </div>
            <div style={{ padding: '4px 0' }}>
              {['Central Command', 'Delhi Ring Node', 'AIIMS Hub (Active)', 'Bengaluru Unit'].map((org, i) => (
                <div
                  key={org}
                  style={{
                    padding: '6px 16px',
                    fontSize: '12px',
                    color: i === 2 ? 'var(--primary-orange-dark)' : 'var(--text-body)',
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

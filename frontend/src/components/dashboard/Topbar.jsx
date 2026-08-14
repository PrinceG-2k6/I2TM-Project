import React from 'react';
import { Radio, Filter } from 'lucide-react';
import { useTraffic } from '../../context/TrafficContext';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';

const TAB_TITLES = {
  dashboard: 'Command Overview',
  fyis: 'FYIs & Alerts',
  map: 'Grid & Corridor Map',
  features: 'Features & Controls',
  services: 'AI Services & Telemetry',
  guards: 'Guards & Emergency Triage',
  timeline: 'Timeline & Event Log',
  settings: 'System & Junction Settings'
};

export const Topbar = ({ 
  activeTab = 'dashboard', 
  activeSubsection = null, 
  hasMultipleSubsections = false,
  onToggleFilters 
}) => {
  const {
    environment,
    emergency,
    isLiveSimulating,
    setIsLiveSimulating,
    activeFilterCount,
    selectedJunction
  } = useTraffic();

  const sectionName = TAB_TITLES[activeTab] || 'Command Overview';

  return (
    <header
      style={{
        height: '76px',
        minHeight: '76px',
        maxHeight: '76px',
        padding: '0 28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'nowrap',
        borderBottom: '1px solid var(--border-warm)',
        backgroundColor: 'var(--bg-surface)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        boxShadow: '0 2px 8px rgba(78, 45, 20, 0.04)',
        boxSizing: 'border-box'
      }}
    >
      {/* Left: Brand Tag + Main Section Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0 }}>
        <div>
          {/* Top Brand Subtitle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', lineHeight: 1, marginBottom: '4px' }}>
            <span
              style={{
                fontSize: '11px',
                fontWeight: '900',
                letterSpacing: '0.1em',
                color: 'var(--primary-orange-dark)',
                textTransform: 'uppercase'
              }}
            >
              SARATHI · सारथी
            </span>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>•</span>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600' }}>
              {selectedJunction}
            </span>
          </div>

          {/* Main Section Title + Optional Subsection Breadcrumb inline */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', lineHeight: 1 }}>
            <h1
              style={{
                fontSize: '22px',
                fontWeight: '900',
                color: 'var(--text-main)',
                letterSpacing: '-0.02em',
                fontFamily: 'var(--font-heading)',
                margin: 0,
                whiteSpace: 'nowrap'
              }}
            >
              {sectionName}
            </h1>

            {hasMultipleSubsections && activeSubsection && (
              <span
                className="view-fade-in"
                style={{
                  fontSize: '11px',
                  fontWeight: '700',
                  color: 'var(--primary-orange-dark)',
                  backgroundColor: 'var(--primary-orange-soft)',
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid #FED7AA',
                  whiteSpace: 'nowrap'
                }}
              >
                {activeSubsection}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Right Controls: Status Badges + Clean Action Buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
        {/* Collision Radar Status Badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '5px 10px',
            borderRadius: 'var(--radius-full)',
            backgroundColor: emergency.active ? '#FEF2F2' : '#F0FDF4',
            border: emergency.active ? '1px solid #FCA5A5' : '1px solid #BBF7D0',
            whiteSpace: 'nowrap'
          }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: emergency.active ? '#DC2626' : '#16A34A'
            }}
            className={emergency.active ? 'animate-pulse-slow' : ''}
          />
          <span
            style={{
              fontSize: '11px',
              fontWeight: '800',
              color: emergency.active ? '#991B1B' : '#166534',
              letterSpacing: '0.02em'
            }}
          >
            {emergency.active ? `EMERGENCY (${emergency.countdownSeconds}s)` : 'RADAR: LOW RISK'}
          </span>
        </div>

        {/* Live Simulation Engine Toggle */}
        <Button
          variant="secondary"
          size="sm"
          icon={Radio}
          onClick={() => setIsLiveSimulating(!isLiveSimulating)}
          style={{
            color: isLiveSimulating ? 'var(--status-healthy)' : 'var(--text-muted)',
            whiteSpace: 'nowrap',
            padding: '6px 12px'
          }}
        >
          {isLiveSimulating ? 'Live Feeds' : 'Paused'}
        </Button>

        {/* Filter Toggle Button */}
        <Button
          variant="filter"
          size="sm"
          hasChevron
          onClick={onToggleFilters}
          style={{ whiteSpace: 'nowrap', padding: '6px 12px' }}
        >
          Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
        </Button>

        {/* Environment Tag */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '5px 10px',
            backgroundColor: 'var(--bg-surface-warm)',
            border: '1px solid var(--border-warm)',
            borderRadius: 'var(--radius-md)',
            fontSize: '11px',
            fontWeight: '600',
            color: 'var(--text-body)',
            whiteSpace: 'nowrap'
          }}
        >
          <span style={{ color: 'var(--text-muted)' }}>Env:</span>
          <span style={{ color: 'var(--text-main)', fontWeight: '700' }}>{environment}</span>
        </div>
      </div>
    </header>
  );
};

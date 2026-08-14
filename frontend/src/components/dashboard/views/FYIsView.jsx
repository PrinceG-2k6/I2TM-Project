import React, { useState } from 'react';
import { CongestionAlerts } from '../CongestionAlerts';
import { useTraffic } from '../../../context/TrafficContext';
import { Search } from 'lucide-react';

export const FYIsView = () => {
  const { alerts, filters, setFilters } = useTraffic();
  const [filterSeverity, setFilterSeverity] = useState('ALL');
  const [search, setSearch] = useState('');

  return (
    <div className="view-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* 1. Filter & Search Controls */}
      <div
        data-subsection="Severity Filters & Search"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          backgroundColor: 'var(--bg-surface)',
          padding: '16px 20px',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-warm)'
        }}
      >
        {/* Severity Filter Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {['ALL', 'CRITICAL', 'WARNING', 'HEALTHY'].map((sev) => {
            const isSelected = filterSeverity === sev;
            return (
              <button
                key={sev}
                onClick={() => setFilterSeverity(sev)}
                style={{
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '12px',
                  fontWeight: '700',
                  backgroundColor: isSelected ? 'var(--primary-orange)' : 'var(--bg-surface-warm)',
                  color: isSelected ? '#FFFFFF' : 'var(--text-body)',
                  border: isSelected ? '1px solid transparent' : '1px solid var(--border-warm)',
                  cursor: 'pointer'
                }}
              >
                {sev}
              </button>
            );
          })}
        </div>

        {/* Search Filter Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            backgroundColor: 'var(--bg-surface-warm)',
            padding: '8px 14px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-warm)',
            minWidth: '320px'
          }}
        >
          <Search size={16} color="var(--text-muted)" />
          <input
            type="text"
            placeholder="Search alerts by title, vehicle, or author..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              fontSize: '13px',
              color: 'var(--text-main)',
              backgroundColor: 'transparent'
            }}
          />
          {search && (
            <button onClick={() => setSearch('')} style={{ fontSize: '11px', color: 'var(--primary-orange)', fontWeight: '600' }}>
              Clear
            </button>
          )}
        </div>
      </div>

      {/* 2. Main Alerts List */}
      <div data-subsection="Live Operational Alerts Stream">
        <CongestionAlerts />
      </div>
    </div>
  );
};

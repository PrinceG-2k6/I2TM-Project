import React from 'react';
import { CongestionAlerts } from '../CongestionAlerts';
import { useTraffic } from '../../../context/TrafficContext';
import { Search, AlertOctagon, AlertTriangle, CheckCircle, RotateCcw } from 'lucide-react';

export const FYIsView = () => {
  const { alerts, filters, setFilters, clearAllFilters } = useTraffic();

  const currentSeverity = filters.severity || 'ALL';
  const searchQuery = filters.searchQuery || '';

  const handleSeverityChange = (sev) => {
    setFilters((prev) => ({
      ...prev,
      severity: sev
    }));
  };

  const handleSearchChange = (val) => {
    setFilters((prev) => ({
      ...prev,
      searchQuery: val
    }));
  };

  // Count items per severity
  const countAll = alerts.length;
  const countCritical = alerts.filter((a) => a.severity === 'CRITICAL').length;
  const countWarning = alerts.filter((a) => a.severity === 'WARNING').length;
  const countHealthy = alerts.filter((a) => a.severity === 'HEALTHY').length;

  const severityOptions = [
    { id: 'ALL', label: 'All Alerts', count: countAll, color: 'var(--primary-orange)' },
    { id: 'CRITICAL', label: 'Critical', count: countCritical, color: '#DC2626' },
    { id: 'WARNING', label: 'Warning', count: countWarning, color: '#F59E0B' },
    { id: 'HEALTHY', label: 'Healthy / Info', count: countHealthy, color: '#16A34A' }
  ];

  return (
    <div className="view-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* 1. Interactive Severity Tabs & Search Controls */}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {severityOptions.map((opt) => {
            const isSelected = currentSeverity.toUpperCase() === opt.id;

            return (
              <button
                key={opt.id}
                onClick={() => handleSeverityChange(opt.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 14px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '12px',
                  fontWeight: '800',
                  backgroundColor: isSelected ? opt.color : 'var(--bg-surface-warm)',
                  color: isSelected ? '#FFFFFF' : 'var(--text-body)',
                  border: isSelected ? '1px solid transparent' : '1px solid var(--border-warm)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  boxShadow: isSelected ? `0 2px 8px ${opt.color}40` : 'none'
                }}
              >
                <span>{opt.label}</span>
                <span
                  style={{
                    backgroundColor: isSelected ? 'rgba(255,255,255,0.25)' : 'var(--border-warm-dark)',
                    color: isSelected ? '#FFFFFF' : 'var(--text-muted)',
                    fontSize: '10px',
                    fontWeight: '800',
                    padding: '1px 6px',
                    borderRadius: 'var(--radius-full)'
                  }}
                >
                  {opt.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Real-Time Search Filter Input */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: 'var(--bg-surface-warm)',
              padding: '8px 14px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-warm)',
              minWidth: '280px'
            }}
          >
            <Search size={15} color="var(--text-muted)" />
            <input
              type="text"
              placeholder="Search title, vehicle, author, or ID..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              style={{
                flex: 1,
                border: 'none',
                outline: 'none',
                fontSize: '13px',
                color: 'var(--text-main)',
                backgroundColor: 'transparent'
              }}
            />
            {searchQuery && (
              <button
                onClick={() => handleSearchChange('')}
                style={{
                  fontSize: '11px',
                  color: 'var(--primary-orange)',
                  fontWeight: '700',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Clear
              </button>
            )}
          </div>

          {(currentSeverity !== 'ALL' || searchQuery) && (
            <button
              onClick={clearAllFilters}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '12px',
                fontWeight: '700',
                color: 'var(--text-muted)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '6px 8px'
              }}
            >
              <RotateCcw size={12} />
              Reset
            </button>
          )}
        </div>
      </div>

      {/* 2. Main Alerts List (Fully Filtered by TrafficContext State) */}
      <div data-subsection="Live Operational Alerts Stream">
        <CongestionAlerts />
      </div>
    </div>
  );
};

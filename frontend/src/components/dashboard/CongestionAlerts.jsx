import React, { useState } from 'react';
import { AlertTriangle, ChevronRight, ChevronDown, CheckCircle2, RotateCcw, Filter, AlertOctagon } from 'lucide-react';
import { useTraffic } from '../../context/TrafficContext';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';

export const CongestionAlerts = ({ overrideSeverity = null, overrideSearch = null }) => {
  const { alerts, setAlerts, filters, setFilters, clearAllFilters, activeFilterCount, setIsFilterDrawerOpen } = useTraffic();
  const [activeActionId, setActiveActionId] = useState(null);

  const handleResolveAlert = (alertId) => {
    setAlerts((prev) => prev.filter((a) => a.id !== alertId));
    setActiveActionId(null);
  };

  // Dynamic Filtering Logic
  const filteredAlerts = alerts.filter((alert) => {
    // 1. Severity Filter (ALL, CRITICAL, WARNING, HEALTHY)
    const effectiveSeverity = overrideSeverity || filters.severity;
    if (effectiveSeverity && effectiveSeverity !== 'ALL' && effectiveSeverity !== 'All') {
      if (alert.severity.toUpperCase() !== effectiveSeverity.toUpperCase()) {
        return false;
      }
    }

    // 2. User / Author filter
    if (filters.userRole && filters.userRole !== 'All users') {
      if (!alert.author.toLowerCase().includes(filters.userRole.toLowerCase()) &&
          !alert.role.toLowerCase().includes(filters.userRole.toLowerCase())) {
        return false;
      }
    }

    // 3. Feature filter
    if (filters.featureStatus && filters.featureStatus !== 'All features') {
      if (alert.feature !== filters.featureStatus && !alert.title.includes(filters.featureStatus)) {
        return false;
      }
    }

    // 4. Service filter
    if (filters.serviceStatus && filters.serviceStatus !== 'All service') {
      if (alert.service !== filters.serviceStatus) {
        return false;
      }
    }

    // 5. Tags filter
    if (filters.tags && filters.tags.length > 0) {
      const hasMatchingTag = filters.tags.some((tag) => alert.tags && alert.tags.includes(tag));
      if (!hasMatchingTag) return false;
    }

    // 6. Search query
    const effectiveSearch = overrideSearch !== null ? overrideSearch : filters.searchQuery;
    if (effectiveSearch) {
      const query = effectiveSearch.toLowerCase();
      const matchesSearch = alert.title.toLowerCase().includes(query) ||
                            alert.description.toLowerCase().includes(query) ||
                            alert.author.toLowerCase().includes(query) ||
                            (alert.id && alert.id.toLowerCase().includes(query));
      if (!matchesSearch) return false;
    }

    return true;
  });

  return (
    <div
      style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-warm)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-card)',
        overflow: 'hidden'
      }}
    >
      {/* Header Bar */}
      <div
        style={{
          padding: '18px 24px',
          borderBottom: '1px solid var(--border-warm)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <AlertTriangle size={18} color="var(--primary-orange)" />
          <h3 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text-main)', margin: 0 }}>
            Operational Congestion & Safety Alert Stream
          </h3>
          <Badge variant={filteredAlerts.length > 0 ? 'orange' : 'healthy'} size="sm">
            {filteredAlerts.length} Active
          </Badge>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {activeFilterCount > 0 && (
            <button
              onClick={clearAllFilters}
              style={{
                fontSize: '12px',
                fontWeight: '600',
                color: 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                cursor: 'pointer',
                background: 'none',
                border: 'none'
              }}
            >
              <RotateCcw size={12} />
              Reset filters
            </button>
          )}

          <button
            onClick={() => setIsFilterDrawerOpen(true)}
            style={{
              fontSize: '13px',
              fontWeight: '600',
              color: 'var(--primary-orange)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              cursor: 'pointer',
              background: 'none',
              border: 'none'
            }}
          >
            Adjust filters
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* Alert Feed Items */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {filteredAlerts.length === 0 ? (
          <div style={{ padding: '40px 24px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Filter size={32} color="var(--border-warm-dark)" style={{ margin: '0 auto 12px' }} />
            <div style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-main)', marginBottom: '4px' }}>
              No alerts match the selected criteria
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Try selecting 'ALL' severity or resetting the filters in the right drawer.
            </p>
            <Button variant="secondary" size="sm" onClick={clearAllFilters}>
              Clear all filters
            </Button>
          </div>
        ) : (
          filteredAlerts.map((alert, idx) => {
            const isCritical = alert.severity === 'CRITICAL';
            const isWarning = alert.severity === 'WARNING';

            return (
              <div
                key={alert.id}
                style={{
                  padding: '18px 24px',
                  borderBottom: idx === filteredAlerts.length - 1 ? 'none' : '1px solid var(--border-warm)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: '24px',
                  backgroundColor: isCritical ? '#FEF2F2' : isWarning ? '#FFFBEB' : 'transparent',
                  borderLeft: isCritical ? '4px solid #DC2626' : isWarning ? '4px solid #F59E0B' : '4px solid transparent',
                  transition: 'background-color 0.15s ease'
                }}
              >
                {/* Left Content */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <Badge variant={isCritical ? 'critical' : isWarning ? 'degraded' : 'healthy'} size="sm">
                      {alert.severity}
                    </Badge>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600' }}>
                      {alert.time} • {alert.id}
                    </span>
                  </div>

                  <p style={{ fontSize: '14px', color: 'var(--text-main)', fontWeight: '600', lineHeight: 1.5, marginBottom: '8px' }}>
                    {alert.title}
                  </p>

                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '10px' }}>
                    {alert.description}
                  </p>

                  {/* Tag Pills */}
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {alert.tags &&
                      alert.tags.map((tag) => (
                        <span
                          key={tag}
                          style={{
                            fontSize: '11px',
                            fontWeight: '600',
                            color: 'var(--text-body)',
                            backgroundColor: 'var(--bg-surface)',
                            border: '1px solid var(--border-warm)',
                            borderRadius: 'var(--radius-sm)',
                            padding: '1px 7px'
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                  </div>
                </div>

                {/* Right Author + Actions Button */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexShrink: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div
                      style={{
                        width: 30,
                        height: 30,
                        borderRadius: 'var(--radius-full)',
                        backgroundColor: alert.role === 'System' ? '#E2E8F0' : alert.role === 'Operator' ? '#DCFCE7' : '#FED7AA',
                        color: alert.role === 'System' ? '#475569' : alert.role === 'Operator' ? '#16A34A' : '#C2410C',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: '700',
                        fontSize: '11px'
                      }}
                    >
                      {alert.author.charAt(0)}
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-main)' }}>
                        {alert.author}
                      </div>
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{alert.role}</div>
                    </div>
                  </div>

                  {/* 1-Click Resolve Action */}
                  <button
                    onClick={() => handleResolveAlert(alert.id)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--bg-surface)',
                      border: '1px solid var(--border-warm)',
                      color: 'var(--text-main)',
                      fontSize: '12px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#DCFCE7';
                      e.currentTarget.style.color = '#166534';
                      e.currentTarget.style.borderColor = '#86EFAC';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--bg-surface)';
                      e.currentTarget.style.color = 'var(--text-main)';
                      e.currentTarget.style.borderColor = 'var(--border-warm)';
                    }}
                  >
                    <CheckCircle2 size={13} />
                    <span>Acknowledge</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

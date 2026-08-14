import React, { useState } from 'react';
import { AlertTriangle, ChevronRight, ChevronDown, CheckCircle2, RotateCcw, Filter } from 'lucide-react';
import { useTraffic } from '../../context/TrafficContext';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';

export const CongestionAlerts = () => {
  const { alerts, setAlerts, filters, clearAllFilters, activeFilterCount, setIsFilterDrawerOpen } = useTraffic();
  const [activeActionId, setActiveActionId] = useState(null);

  const handleResolveAlert = (alertId) => {
    setAlerts((prev) => prev.filter((a) => a.id !== alertId));
    setActiveActionId(null);
  };

  // Dynamic Filtering Logic
  const filteredAlerts = alerts.filter((alert) => {
    // 1. User / Author filter
    if (filters.userRole && filters.userRole !== 'All users') {
      if (!alert.author.toLowerCase().includes(filters.userRole.toLowerCase()) &&
          !alert.role.toLowerCase().includes(filters.userRole.toLowerCase())) {
        return false;
      }
    }

    // 2. Feature filter
    if (filters.featureStatus && filters.featureStatus !== 'All features') {
      if (alert.feature !== filters.featureStatus && !alert.title.includes(filters.featureStatus)) {
        return false;
      }
    }

    // 3. Service filter
    if (filters.serviceStatus && filters.serviceStatus !== 'All service') {
      if (alert.service !== filters.serviceStatus) {
        return false;
      }
    }

    // 4. Tags filter
    if (filters.tags && filters.tags.length > 0) {
      const hasMatchingTag = filters.tags.some((tag) => alert.tags && alert.tags.includes(tag));
      if (!hasMatchingTag) return false;
    }

    // 5. Search query
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      const matchesSearch = alert.title.toLowerCase().includes(query) ||
                            alert.description.toLowerCase().includes(query) ||
                            alert.author.toLowerCase().includes(query);
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
      {/* Header matching Reference */}
      <div
        style={{
          padding: '18px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid var(--border-warm)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <AlertTriangle size={18} color="#D97706" />
          <h3 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text-main)' }}>
            FYIs
          </h3>
          <Badge variant="orange" size="sm">
            {filteredAlerts.length} {activeFilterCount > 0 ? 'Filtered' : 'Active'}
          </Badge>

          {activeFilterCount > 0 && (
            <span style={{ fontSize: '12px', color: 'var(--primary-orange-dark)', fontWeight: '600' }}>
              ({activeFilterCount} active filters applied)
            </span>
          )}
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
                cursor: 'pointer'
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
              cursor: 'pointer'
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
              No alerts match the selected filters
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Try changing the user, tag, or feature filters in the right sidebar.
            </p>
            <Button variant="secondary" size="sm" onClick={clearAllFilters}>
              Clear all filters
            </Button>
          </div>
        ) : (
          filteredAlerts.map((alert, idx) => (
            <div
              key={alert.id}
              style={{
                padding: '20px 24px',
                borderBottom: idx === filteredAlerts.length - 1 ? 'none' : '1px solid var(--border-warm)',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: '24px',
                transition: 'background-color 0.15s ease'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-surface-warm)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              {/* Left Content */}
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px', fontWeight: '500' }}>
                  June 18 · {alert.time}
                </div>

                <p style={{ fontSize: '14px', color: 'var(--text-main)', fontWeight: '500', lineHeight: 1.5, marginBottom: '12px' }}>
                  {alert.title.includes("'") ? (
                    alert.title.split("'").map((part, i) =>
                      i % 2 === 1 ? (
                        <span key={i} style={{ fontWeight: '700', color: 'var(--primary-orange-dark)' }}>
                          '{part}'
                        </span>
                      ) : (
                        part
                      )
                    )
                  ) : (
                    alert.title
                  )}
                </p>

                {/* Tag Pills */}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {alert.tags &&
                    alert.tags.map((tag) => (
                      <span
                        key={tag}
                        style={{
                          fontSize: '11px',
                          fontWeight: '600',
                          color: 'var(--text-body)',
                          backgroundColor: 'var(--bg-surface-warm)',
                          border: '1px solid var(--border-warm)',
                          borderRadius: 'var(--radius-sm)',
                          padding: '2px 8px'
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                </div>
              </div>

              {/* Right Author + Actions Button */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexShrink: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 'var(--radius-full)',
                      backgroundColor: alert.role === 'System' ? '#E2E8F0' : alert.role === 'Operator' ? '#DCFCE7' : '#FED7AA',
                      color: alert.role === 'System' ? '#475569' : alert.role === 'Operator' ? '#16A34A' : '#C2410C',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: '700',
                      fontSize: '12px'
                    }}
                  >
                    {alert.author.charAt(0)}
                  </div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-main)' }}>
                      {alert.author}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      last action: {alert.time}
                    </div>
                  </div>
                </div>

                {/* Action Dropdown Menu */}
                <div style={{ position: 'relative' }}>
                  <button
                    onClick={() => setActiveActionId(activeActionId === alert.id ? null : alert.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '6px 12px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-warm)',
                      backgroundColor: 'var(--bg-surface)',
                      fontSize: '12px',
                      fontWeight: '600',
                      color: 'var(--text-main)',
                      cursor: 'pointer'
                    }}
                  >
                    Actions
                    <ChevronDown size={14} />
                  </button>

                  {activeActionId === alert.id && (
                    <div
                      style={{
                        position: 'absolute',
                        right: 0,
                        top: 'calc(100% + 4px)',
                        backgroundColor: '#FFFFFF',
                        border: '1px solid var(--border-warm)',
                        borderRadius: 'var(--radius-md)',
                        boxShadow: 'var(--shadow-card)',
                        width: '160px',
                        zIndex: 30,
                        padding: '4px'
                      }}
                    >
                      <div
                        onClick={() => handleResolveAlert(alert.id)}
                        style={{
                          padding: '8px 12px',
                          fontSize: '12px',
                          fontWeight: '600',
                          color: 'var(--status-healthy)',
                          cursor: 'pointer',
                          borderRadius: 'var(--radius-sm)'
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--status-healthy-bg)')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                      >
                        Acknowledge & Clear
                      </div>
                      <div
                        style={{
                          padding: '8px 12px',
                          fontSize: '12px',
                          color: 'var(--text-main)',
                          cursor: 'pointer',
                          borderRadius: 'var(--radius-sm)'
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-surface-warm)')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                      >
                        Adjust Signal Timing
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

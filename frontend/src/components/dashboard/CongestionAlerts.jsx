import { AlertTriangle, CheckCircle2, Filter } from 'lucide-react';
import { useTraffic } from '../../context/TrafficContext';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';

export const CongestionAlerts = ({ overrideSeverity = null, overrideSearch = null }) => {
  const { alerts, setAlerts, filters, setFilters, clearAllFilters } = useTraffic();

  const handleResolveAlert = (alertId) => {
    setAlerts((prev) => prev.filter((a) => a.id !== alertId));
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
    <div className="bg-(--color-4) rounded-sm h-fit overflow-hidden pb-4">
      <div className="p-4 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2.5">
          <AlertTriangle size={16} color="#272727" />
          <div className="text-sm text-(--color-1)">
            Operational Congestion & Safety Alert Stream
          </div>
          <Badge variant={filteredAlerts.length > 0 ? 'orange' : 'healthy'}>
            {filteredAlerts.length} Active
          </Badge>
        </div>
        <div className="flex items-center gap-1">
          {[
            { id: 'All', label: 'All' },
            { id: 'CRITICAL', label: 'Critical' },
            { id: 'WARNING', label: 'Warning' },
            { id: 'HEALTHY', label: 'Healthy' }
          ].map((sev) => {
            const currentSev = overrideSeverity || filters.severity || 'All';
            const isActive = currentSev.toUpperCase() === sev.id.toUpperCase();
            return (
              <button
                key={sev.id}
                onClick={() => setFilters((prev) => ({ ...prev, severity: sev.id }))}
                className={`py-1 px-2 text-xs rounded-sm border cursor-pointer transition-colors duration-150 ${isActive
                  ? 'border-(--color-6) text-(--color-6) bg-(--color-5)'
                  : 'border-(--color-3) text-(--color-2) hover:border-(--color-2)'
                  }`}
              >
                {sev.label}
              </button>
            );
          })}
        </div>
      </div>
      <div className="space-y-4 p-4 pt-0 max-h-100 overflow-y-auto">
        {filteredAlerts.length === 0 ? (
          <div className="py-10 px-6 text-center text-(--color-2)">
            <Filter size={28} color="#bfbfbd" className="mx-auto mb-3" />
            <div className="text-(--color-1) mb-1">
              No alerts match the selected criteria
            </div>
            <Button
              variant="secondary"
              onClick={clearAllFilters}
              className='mt-1.5'
            >
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
                className={`py-3.5 px-4 flex items-start justify-between gap-4 transition-colors duration-300 rounded-sm bg-(--color-5) ${isCritical ? 'border-2 border-red-600/40' : isWarning ? 'border-2 border-amber-500/50' : ''
                  }`}
              >
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2 mb-1 text-xs">
                    <Badge variant={isCritical ? 'critical' : isWarning ? 'degraded' : 'healthy'} size="sm">
                      {alert.severity}
                    </Badge>
                    <span>
                      {alert.time}
                    </span>
                    <span>
                      {alert.id}
                    </span>
                  </div>
                  <div className="text-(--color-1) mb-1 leading-snug">
                    {alert.title}
                  </div>
                  <div className="text-sm text-(--color-2) mb-2">
                    {alert.description}
                  </div>
                  <div className="flex gap-1.5 flex-wrap">
                    {alert.tags &&
                      alert.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-xs text-(--color-2) bg-(--color-5) border border-(--color-3) py-0.5 px-2.5 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                  </div>
                </div>
                <button
                  onClick={() => handleResolveAlert(alert.id)}
                  className="py-1 px-2.5 rounded-sm bg-(--color-5) border border-(--color-3) text-xs text-(--color-1) cursor-pointer flex items-center gap-1 hover:border-(--color-6) hover:text-(--color-6) transition-colors duration-150"
                >
                  <CheckCircle2 size={13} />
                  <span>Acknowledge</span>
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

import React from 'react';
import { useTraffic } from '../../../context/TrafficContext';

export const IncidentsView = () => {
  const { alerts, activeCorridors } = useTraffic();
  const emergency = activeCorridors && activeCorridors.length > 0 ? activeCorridors[0] : { active: false };
  const now = new Date();

  const typeConfig = {
    CONGESTION:     { label: 'Congestion',      color: '#DC2626', icon: '🚦' },
    RISKY_MOVEMENT: { label: 'Risky Movement',  color: '#EA580C', icon: '⚠️'  },
    EMERGENCY:      { label: 'Emergency',       color: '#7C3AED', icon: '🚨'  },
    SYSTEM:         { label: 'System',          color: '#0284C7', icon: '🤖'  },
    SIGNAL:         { label: 'Signal Override', color: '#D97706', icon: '🟢'  },
  };

  const severityDot = {
    CRITICAL: '#DC2626',
    WARNING:  '#F59E0B',
    HEALTHY:  '#16A34A',
  };

  const relTime = (timeStr) => {
    const [h, m] = (timeStr || '').split(':').map(Number);
    const nowMin = now.getHours() * 60 + now.getMinutes();
    const itemMin = h * 60 + m;
    const diff = Math.max(0, nowMin - itemMin);
    if (diff === 0) return 'Just now';
    if (diff < 60) return `${diff}m ago`;
    return `${Math.floor(diff / 60)}h ${diff % 60}m ago`;
  };

  const feed = [...(alerts || [])];
  if (emergency?.active) {
    feed.unshift({
      id: 'EMG-LIVE',
      time: `${now.getHours()}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}`,
      title: `Green Corridor ACTIVE — ${emergency.vehicleLabel || 'Emergency Vehicle'} en route`,
      description: `${emergency.vehicleId || 'DL-01-AMB-889'} clearing East Arterial. All signals forced GREEN. ${emergency.countdownSeconds}s remaining.`,
      severity: 'CRITICAL',
      type: 'EMERGENCY',
      author: 'SARATHI AI',
      role: 'Emergency Engine',
      tags: ['Emergency', 'Corridor'],
      live: true
    });
  }

  return (
    <div className="view-fade-in max-w-[800px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="text-sm">Live Incident Feed</div>
          <div className="flex items-center gap-1.5 py-0.5 px-2 rounded-sm bg-(--color-5) border border-(--color-3)">
            <span className="w-1.5 h-1.5 rounded-full bg-green-600 inline-block animate-pulse-slow" />
            <span className="text-xs text-green-700">LIVE</span>
          </div>
        </div>
        <div className="text-xs text-(--color-2)">
          {feed.length} active incident{feed.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Feed */}
      <div className="bg-(--color-4) border border-(--color-3) rounded-sm overflow-hidden">
        {feed.length === 0 ? (
          <div className="p-10 text-center text-(--color-2)">
            <div className="text-2xl mb-2">✅</div>
            <div className="text-sm mb-1">All clear</div>
            <div className="text-xs">No active incidents at this time.</div>
          </div>
        ) : (
          feed.map((incident, idx) => {
            const tc = typeConfig[incident.type] || typeConfig.SYSTEM;
            const dot = severityDot[incident.severity] || '#16A34A';
            const isLast = idx === feed.length - 1;

            return (
              <div
                key={incident.id}
                className={`flex items-start gap-4 py-4 px-4 relative ${isLast ? '' : 'border-b border-(--color-3)'} ${incident.live ? 'bg-red-50' : 'bg-transparent'}`}
                style={{ borderLeft: `3px solid ${dot}` }}
              >
                {/* Icon */}
                <div className="w-8 h-8 shrink-0 rounded-sm bg-(--color-5) border border-(--color-3) flex items-center justify-center text-base">
                  {tc.icon}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-xs" style={{ color: dot }}>
                      {incident.severity}
                    </span>
                    <span className="text-xs text-(--color-2)">
                      {tc.label}
                    </span>
                    {incident.live && (
                      <span className="text-xs text-red-600 animate-pulse-slow">● LIVE</span>
                    )}
                    <span className="text-xs text-(--color-2) ml-auto">
                      {incident.id} · {relTime(incident.time)}
                    </span>
                  </div>

                  <div className="text-sm mb-1 leading-snug">
                    {incident.title}
                  </div>
                  <div className="text-xs text-(--color-2) leading-relaxed mb-2">
                    {incident.description}
                  </div>

                  {/* Tags + Author */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {(incident.tags || []).map((tag) => (
                      <span
                        key={tag}
                        className="text-xs text-(--color-2) bg-(--color-5) border border-(--color-3) py-px px-2 rounded-sm"
                      >
                        {tag}
                      </span>
                    ))}
                    <span className="ml-auto flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded-sm bg-(--color-5) border border-(--color-3) flex items-center justify-center text-xs">
                        {(incident.author || 'S').charAt(0)}
                      </div>
                      <span className="text-xs text-(--color-2)">
                        {incident.author} · {incident.role}
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

import React from 'react';
import { useTraffic } from '../../../context/TrafficContext';

export const IncidentsView = () => {
  const { alerts, activeCorridors } = useTraffic();
  const emergency = activeCorridors && activeCorridors.length > 0 ? activeCorridors[0] : { active: false };
  const now = new Date();

  const typeConfig = {
    CONGESTION:     { label: 'Congestion',      color: '#DC2626', bg: '#FEF2F2', icon: '🚦' },
    RISKY_MOVEMENT: { label: 'Risky Movement',  color: '#EA580C', bg: '#FFF7ED', icon: '⚠️'  },
    EMERGENCY:      { label: 'Emergency',       color: '#7C3AED', bg: '#F5F3FF', icon: '🚨'  },
    SYSTEM:         { label: 'System',          color: '#0284C7', bg: '#F0F9FF', icon: '🤖'  },
    SIGNAL:         { label: 'Signal Override', color: '#D97706', bg: '#FFFBEB', icon: '🟢'  },
  };

  const severityStyle = {
    CRITICAL: { color: '#DC2626', bg: '#FEF2F2', dot: '#DC2626' },
    WARNING:  { color: '#B45309', bg: '#FFFBEB', dot: '#F59E0B' },
    HEALTHY:  { color: '#15803D', bg: '#F0FDF4', dot: '#16A34A' },
  };

  // Compute relative time label from time string like "14:23:13"
  const relTime = (timeStr) => {
    const [h, m] = (timeStr || '').split(':').map(Number);
    const nowMin = now.getHours() * 60 + now.getMinutes();
    const itemMin = h * 60 + m;
    const diff = Math.max(0, nowMin - itemMin);
    if (diff === 0) return 'Just now';
    if (diff < 60) return `${diff}m ago`;
    return `${Math.floor(diff / 60)}h ${diff % 60}m ago`;
  };

  // Build enriched feed: real alerts + live corridor entry when active
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
    <div className="view-fade-in" style={{ padding: '0 20px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '12px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: 36, height: 36, borderRadius: '10px',
                backgroundColor: '#FFEBE8',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}
            >
              <span style={{ fontSize: '18px' }}>📡</span>
            </div>
            <div>
              <div style={{ fontSize: '16px', fontWeight: '800', color: '#0F172A', letterSpacing: '-0.01em' }}>
                Live Incident Feed
              </div>
              <div style={{ fontSize: '11px', color: '#64748B', fontWeight: '500' }}>
                Real-time operational alerts · auto-updating
              </div>
            </div>
            {/* Live pulse */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '3px 10px', borderRadius: '9999px', backgroundColor: '#F0FDF4', border: '1px solid #86EFAC' }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: '#16A34A', display: 'inline-block' }} className="animate-pulse-slow" />
              <span style={{ fontSize: '10px', fontWeight: '800', color: '#15803D', letterSpacing: '0.04em' }}>LIVE</span>
            </div>
          </div>
          <div style={{ fontSize: '12px', fontWeight: '600', color: '#94A3B8' }}>
            {feed.length} active incident{feed.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Feed Cards */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: '0 1px 4px rgba(0,0,0,0.04)'
          }}
        >
          {feed.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#94A3B8' }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>✅</div>
              <div style={{ fontSize: '14px', fontWeight: '700', color: '#0F172A', marginBottom: '4px' }}>All clear</div>
              <div style={{ fontSize: '12px' }}>No active incidents at this time.</div>
            </div>
          ) : (
            feed.map((incident, idx) => {
              const tc = typeConfig[incident.type] || typeConfig.SYSTEM;
              const sc = severityStyle[incident.severity] || severityStyle.HEALTHY;
              const isLast = idx === feed.length - 1;
              const isCritical = incident.severity === 'CRITICAL';

              return (
                <div
                  key={incident.id}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '16px',
                    padding: '16px 20px',
                    borderBottom: isLast ? 'none' : '1px solid #F1F5F9',
                    backgroundColor: incident.live
                      ? '#FFF5F5'
                      : isCritical
                        ? '#FFFBFA'
                        : 'transparent',
                    borderLeft: `4px solid ${sc.dot}`,
                    transition: 'background-color 0.2s ease',
                    position: 'relative'
                  }}
                >
                  {/* Type Icon Badge */}
                  <div
                    style={{
                      width: 38, height: 38, flexShrink: 0,
                      borderRadius: '10px',
                      backgroundColor: tc.bg,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '18px',
                      border: `1px solid ${tc.color}22`
                    }}
                  >
                    {tc.icon}
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px', flexWrap: 'wrap' }}>
                      {/* Severity badge */}
                      <span
                        style={{
                          fontSize: '10px', fontWeight: '800',
                          color: sc.color, backgroundColor: sc.bg,
                          padding: '2px 8px', borderRadius: '9999px',
                          border: `1px solid ${sc.dot}44`,
                          letterSpacing: '0.04em'
                        }}
                      >
                        {incident.severity}
                      </span>
                      {/* Type badge */}
                      <span
                        style={{
                          fontSize: '10px', fontWeight: '700',
                          color: tc.color, backgroundColor: tc.bg,
                          padding: '2px 8px', borderRadius: '9999px'
                        }}
                      >
                        {tc.label}
                      </span>
                      {/* Live pill */}
                      {incident.live && (
                        <span
                          style={{
                            fontSize: '10px', fontWeight: '800',
                            color: '#DC2626', backgroundColor: '#FEE2E2',
                            padding: '2px 8px', borderRadius: '9999px',
                            letterSpacing: '0.06em'
                          }}
                          className="animate-pulse-slow"
                        >
                          ● LIVE
                        </span>
                      )}
                      <span style={{ fontSize: '10px', color: '#94A3B8', marginLeft: 'auto' }}>
                        {incident.id} · {relTime(incident.time)}
                      </span>
                    </div>

                    <div style={{ fontSize: '13px', fontWeight: '700', color: '#0F172A', marginBottom: '4px', lineHeight: 1.4 }}>
                      {incident.title}
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748B', lineHeight: 1.5, marginBottom: '8px' }}>
                      {incident.description}
                    </div>

                    {/* Tags + Author row */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                      {(incident.tags || []).map((tag) => (
                        <span
                          key={tag}
                          style={{
                            fontSize: '10px', fontWeight: '600',
                            color: '#475569', backgroundColor: '#F1F5F9',
                            border: '1px solid #E2E8F0',
                            padding: '1px 7px', borderRadius: '6px'
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                      <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div
                          style={{
                            width: 22, height: 22, borderRadius: '6px', flexShrink: 0,
                            backgroundColor: incident.role === 'System' || incident.role === 'Emergency Engine' ? '#E2E8F0' : '#FED7AA',
                            color: incident.role === 'System' || incident.role === 'Emergency Engine' ? '#475569' : '#C2410C',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontWeight: '700', fontSize: '10px'
                          }}
                        >
                          {(incident.author || 'S').charAt(0)}
                        </div>
                        <span style={{ fontSize: '11px', fontWeight: '600', color: '#475569' }}>
                          {incident.author} · <span style={{ color: '#94A3B8' }}>{incident.role}</span>
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
    </div>
  );
};

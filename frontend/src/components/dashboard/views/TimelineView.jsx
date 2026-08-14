import React from 'react';
import { DynamicSuggestions } from '../DynamicSuggestions';
import { Clock } from 'lucide-react';
import { Badge } from '../../common/Badge';

export const TimelineView = () => {
  const timelineEvents = [
    {
      time: '14:23:13',
      title: 'East Commercial Arterial Green Extended (+25s)',
      reason: 'Density reached 96% with queue spilling beyond 280m.',
      type: 'OPTIMIZATION',
      badgeVariant: 'orange'
    },
    {
      time: '14:21:40',
      title: 'Aggressive Lane Cut Flagged (Vehicle DL-04-TC-201)',
      reason: 'Erratic 38° swerve detected across 3 lanes at 58 km/h. Marshal alert dispatched.',
      type: 'SAFETY',
      badgeVariant: 'critical'
    },
    {
      time: '14:18:05',
      title: 'Emergency Green Corridor Pre-Clear Triggered',
      reason: 'Ambulance DL-01-AMB-889 dispatched with Critical patient. Roadside display set to 90s countdown.',
      type: 'EMERGENCY',
      badgeVariant: 'healthy'
    },
    {
      time: '14:10:00',
      title: 'Automatic Adaptive Cycle Recalibrated',
      reason: 'Traffic shifted from morning peak to steady afternoon flow across Ring Road node.',
      type: 'SYSTEM',
      badgeVariant: 'info'
    }
  ];

  return (
    <div className="view-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* 1. Dynamic Suggestions Module */}
      <div data-subsection="AI Dynamic Signal Suggestions">
        <DynamicSuggestions />
      </div>

      {/* 2. Timeline Stream */}
      <div
        data-subsection="Chronological Event Audit Log"
        style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-warm)',
          borderRadius: 'var(--radius-lg)',
          padding: '24px',
          boxShadow: 'var(--shadow-card)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          <Clock size={20} color="var(--primary-orange)" />
          <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-main)' }}>
            Chronological Event Log
          </h3>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative' }}>
          {timelineEvents.map((evt) => (
            <div
              key={evt.time}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '16px',
                padding: '16px 20px',
                backgroundColor: 'var(--bg-surface-warm)',
                border: '1px solid var(--border-warm)',
                borderRadius: 'var(--radius-md)'
              }}
            >
              <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', width: '65px', flexShrink: 0 }}>
                {evt.time}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-main)' }}>
                    {evt.title}
                  </span>
                  <Badge variant={evt.badgeVariant} size="sm">
                    {evt.type}
                  </Badge>
                </div>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  {evt.reason}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

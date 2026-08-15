import React from 'react';
import { Sliders, CheckCircle2, ShieldAlert } from 'lucide-react';
import { useTraffic } from '../../context/TrafficContext';
import { Badge } from '../common/Badge';

export const SignalControlPreview = () => {
  const { approaches, activeCorridors } = useTraffic();
  const emergency = activeCorridors && activeCorridors.length > 0 ? activeCorridors[0] : { active: false };

  return (
    <div
      style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-warm)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-card)',
        padding: '24px'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-main)' }}>
          Signal Control Preview
        </h3>
        {emergency.active && (
          <Badge variant="critical" size="sm">
            PRIORITY OVERRIDE
          </Badge>
        )}
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '12px'
        }}
      >
        {Object.entries(approaches).map(([dir, app]) => {
          const isGreen = app.currentLight === 'GREEN';
          return (
            <div
              key={dir}
              style={{
                backgroundColor: 'var(--bg-surface-warm)',
                border: '1px solid var(--border-warm)',
                borderRadius: 'var(--radius-md)',
                padding: '14px',
                textAlign: 'center'
              }}
            >
              <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '8px' }}>
                {dir.toUpperCase()}
              </div>

              {/* Physical Signal Box UI */}
              <div
                style={{
                  display: 'inline-flex',
                  flexDirection: 'column',
                  gap: '6px',
                  backgroundColor: '#1E293B',
                  padding: '8px 10px',
                  borderRadius: '16px',
                  marginBottom: '10px'
                }}
              >
                <div
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: '50%',
                    backgroundColor: !isGreen ? '#EF4444' : '#475569',
                    boxShadow: !isGreen ? '0 0 10px #EF4444' : 'none'
                  }}
                />
                <div
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: '50%',
                    backgroundColor: '#475569'
                  }}
                />
                <div
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: '50%',
                    backgroundColor: isGreen ? '#22C55E' : '#475569',
                    boxShadow: isGreen ? '0 0 10px #22C55E' : 'none'
                  }}
                />
              </div>

              <div style={{ fontSize: '13px', fontWeight: '800', color: isGreen ? 'var(--status-healthy)' : 'var(--status-critical)' }}>
                {app.currentLight} ({app.greenSec}s)
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

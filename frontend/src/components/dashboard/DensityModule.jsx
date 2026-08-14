import React from 'react';
import { Activity, Car, Gauge, ArrowUpRight } from 'lucide-react';
import { useTraffic } from '../../context/TrafficContext';
import { Badge } from '../common/Badge';

export const DensityModule = () => {
  const { approaches } = useTraffic();

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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Gauge size={20} color="var(--primary-orange)" />
          <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-main)' }}>
            Traffic Density by Approach
          </h3>
        </div>
        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
          Real-time Video AI Analysis
        </span>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px'
        }}
      >
        {Object.entries(approaches).map(([dir, data]) => {
          const isCritical = data.densityPct >= 85;
          const isHigh = data.densityPct >= 65 && data.densityPct < 85;
          const isMedium = data.densityPct >= 40 && data.densityPct < 65;

          const badgeVariant = isCritical ? 'critical' : isHigh ? 'orange' : isMedium ? 'degraded' : 'healthy';

          return (
            <div
              key={dir}
              style={{
                backgroundColor: 'var(--bg-surface-warm)',
                border: isCritical ? '1px solid var(--status-critical-border)' : '1px solid var(--border-warm)',
                borderRadius: 'var(--radius-md)',
                padding: '18px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'transform 0.15s ease'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-body)' }}>
                    {dir} ({data.name.split(' ')[0]})
                  </span>
                  <Badge variant={badgeVariant} size="sm">
                    {data.status}
                  </Badge>
                </div>

                <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '28px', fontWeight: '800', color: 'var(--text-main)', fontFamily: 'var(--font-heading)' }}>
                    {data.densityPct}%
                  </span>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    density
                  </span>
                </div>

                {/* Progress bar */}
                <div
                  style={{
                    width: '100%',
                    height: '6px',
                    backgroundColor: '#E2E8F0',
                    borderRadius: 'var(--radius-full)',
                    overflow: 'hidden',
                    marginBottom: '14px'
                  }}
                >
                  <div
                    style={{
                      width: `${data.densityPct}%`,
                      height: '100%',
                      backgroundColor: isCritical ? 'var(--status-critical)' : isHigh ? 'var(--primary-orange)' : isMedium ? 'var(--status-degraded)' : 'var(--status-healthy)',
                      borderRadius: 'var(--radius-full)',
                      transition: 'width 0.4s ease'
                    }}
                  />
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: '10px',
                  borderTop: '1px solid var(--border-warm)',
                  fontSize: '12px',
                  color: 'var(--text-muted)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Car size={14} />
                  <span><strong>{data.vehicleCount}</strong> vehicles</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: data.currentLight === 'GREEN' ? '#16A34A' : '#DC2626',
                      display: 'inline-block'
                    }}
                  />
                  <span style={{ fontWeight: '600', color: 'var(--text-main)' }}>
                    {data.currentLight} ({data.greenSec}s)
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

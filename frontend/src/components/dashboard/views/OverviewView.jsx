import React from 'react';
import { AccidentHazardBanner } from '../AccidentHazardBanner';
import { CongestionAlerts } from '../CongestionAlerts';
import { DensityModule } from '../DensityModule';
import { SignalControlPreview } from '../SignalControlPreview';
import { useTraffic } from '../../../context/TrafficContext';
import { Badge } from '../../common/Badge';
import { ArrowUpRight, ShieldCheck, Siren } from 'lucide-react';

export const OverviewView = ({ onNavigateTab }) => {
  const { approaches, emergency, selectedJunction } = useTraffic();

  const totalVehicles = Object.values(approaches).reduce((acc, a) => acc + a.vehicleCount, 0);
  const avgDensity = Math.round(
    Object.values(approaches).reduce((acc, a) => acc + a.densityPct, 0) / 4
  );

  return (
    <div className="view-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* 1. Emergency Red Corridor Banner - ONLY shown when Emergency Corridor is Actively Simulated/Triggered */}
      {emergency.active && (
        <div className="view-fade-in">
          <AccidentHazardBanner onNavigateGuards={() => onNavigateTab && onNavigateTab('guards')} />
        </div>
      )}

      {/* 2. Overview Stat Cards Row */}
      <div
        data-subsection="Junction Health & Load Metrics"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px'
        }}
      >
        {/* Junction Card */}
        <div
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-warm)',
            borderRadius: 'var(--radius-lg)',
            padding: '18px 20px',
            boxShadow: 'var(--shadow-subtle)'
          }}
        >
          <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '4px' }}>
            ACTIVE INTERSECTION
          </div>
          <div style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '6px' }}>
            {selectedJunction}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#22C55E' }} />
            <span style={{ fontSize: '12px', color: 'var(--status-healthy)', fontWeight: '600' }}>
              Adaptive Controller Online
            </span>
          </div>
        </div>

        {/* Total Vehicles Card */}
        <div
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-warm)',
            borderRadius: 'var(--radius-lg)',
            padding: '18px 20px',
            boxShadow: 'var(--shadow-subtle)'
          }}
        >
          <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '4px' }}>
            TOTAL VEHICLES ON APPROACHES
          </div>
          <div style={{ fontSize: '28px', fontWeight: '800', color: 'var(--text-main)', fontFamily: 'var(--font-heading)' }}>
            {totalVehicles} <span style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: '500' }}>units</span>
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Capacity: 200 units across 4 lanes
          </div>
        </div>

        {/* Average Density Card */}
        <div
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-warm)',
            borderRadius: 'var(--radius-lg)',
            padding: '18px 20px',
            boxShadow: 'var(--shadow-subtle)'
          }}
        >
          <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '4px' }}>
            AVERAGE JUNCTION DENSITY
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '28px', fontWeight: '800', color: avgDensity > 70 ? 'var(--status-critical)' : 'var(--text-main)', fontFamily: 'var(--font-heading)' }}>
              {avgDensity}%
            </span>
            <Badge variant={avgDensity > 75 ? 'critical' : avgDensity > 50 ? 'degraded' : 'healthy'} size="sm">
              {avgDensity > 75 ? 'High Congestion' : 'Moderate Flow'}
            </Badge>
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
            Optimized via AI density allocation
          </div>
        </div>

        {/* Emergency Status Card */}
        <div
          onClick={() => onNavigateTab && onNavigateTab('guards')}
          style={{
            backgroundColor: emergency.active ? '#FEF2F2' : 'var(--bg-surface)',
            border: emergency.active ? '2px solid #DC2626' : '1px solid var(--border-warm)',
            borderRadius: 'var(--radius-lg)',
            padding: '18px 20px',
            boxShadow: emergency.active ? '0 0 16px rgba(220, 38, 38, 0.3)' : 'var(--shadow-subtle)',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span style={{ fontSize: '12px', fontWeight: '800', color: emergency.active ? '#DC2626' : 'var(--text-muted)' }}>
              EMERGENCY CORRIDOR
            </span>
            <ArrowUpRight size={14} color={emergency.active ? '#DC2626' : 'var(--text-muted)'} />
          </div>
          <div style={{ fontSize: '18px', fontWeight: '800', color: emergency.active ? '#DC2626' : 'var(--text-main)' }}>
            {emergency.active ? `ACTIVE (${emergency.countdownSeconds}s)` : 'Standby / Ready'}
          </div>
          <div style={{ fontSize: '12px', color: emergency.active ? '#B91C1C' : 'var(--text-muted)', marginTop: '4px' }}>
            {emergency.active ? `${emergency.vehicleLabel || 'Emergency Vehicle'} ${emergency.vehicleId || 'DL-01-AMB-889'} cleared →` : 'Simulate in sidebar or Guards to trigger run →'}
          </div>
        </div>
      </div>

      {/* 3. Top Alert Feed */}
      <div data-subsection="Active Operational Alerts">
        <CongestionAlerts />
      </div>

      {/* 4. 4-Way Traffic Density Approaches */}
      <div data-subsection="4-Approach Density Gauges">
        <DensityModule />
      </div>

      {/* 5. Signal Control Physical Visualizer */}
      <div data-subsection="Physical Signal Light Visualizer">
        <SignalControlPreview />
      </div>
    </div>
  );
};

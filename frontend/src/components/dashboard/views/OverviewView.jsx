import React from 'react';
import { AccidentHazardBanner } from '../AccidentHazardBanner';
import { CongestionAlerts } from '../CongestionAlerts';
import { DensityModule } from '../DensityModule';
import { SignalControlPreview } from '../SignalControlPreview';
import { useTraffic } from '../../../context/TrafficContext';
import { Badge } from '../../common/Badge';
import { ArrowUpRight, ShieldAlert, AlertTriangle, Activity } from 'lucide-react';

export const OverviewView = ({ onNavigateTab }) => {
  const { approaches, emergency, selectedJunction } = useTraffic();

  const totalVehicles = Object.values(approaches).reduce((acc, a) => acc + a.vehicleCount, 0);
  const avgDensity = Math.round(
    Object.values(approaches).reduce((acc, a) => acc + a.densityPct, 0) / 4
  );

  return (
    <div className="view-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* 1. High-Priority Government Accident Prevention Alert Banner */}
      <AccidentHazardBanner onNavigateGuards={() => onNavigateTab && onNavigateTab('guards')} />

      {/* 2. Overview Stat Cards Row with Accident Hazard Highlight */}
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

        {/* Accident Risk Radar Card */}
        <div
          style={{
            backgroundColor: '#FEF2F2',
            border: '2px solid #F87171',
            borderRadius: 'var(--radius-lg)',
            padding: '18px 20px',
            boxShadow: '0 4px 12px rgba(239, 68, 68, 0.15)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span style={{ fontSize: '12px', fontWeight: '800', color: '#DC2626', letterSpacing: '0.04em' }}>
              ACCIDENT HAZARD RADAR
            </span>
            <ShieldAlert size={16} color="#DC2626" />
          </div>
          <div style={{ fontSize: '24px', fontWeight: '900', color: '#B91C1C', fontFamily: 'var(--font-heading)' }}>
            HIGH RISK (84%)
          </div>
          <div style={{ fontSize: '12px', color: '#991B1B', fontWeight: '600', marginTop: '2px' }}>
            Erratic swerve detected on East approach
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
            transition: 'transform 0.15s ease'
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
            {emergency.active ? 'Click to inspect triage corridor →' : 'Click to trigger ambulance run →'}
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

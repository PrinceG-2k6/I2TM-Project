import React from 'react';
import { Siren, HeartPulse, Navigation, Clock, ShieldAlert, CheckCircle } from 'lucide-react';
import { useTraffic } from '../../context/TrafficContext';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';

export const GreenCorridorPanel = () => {
  const { emergency, triggerEmergencyCorridor, resetEmergencyCorridor } = useTraffic();

  return (
    <div
      style={{
        backgroundColor: 'var(--bg-surface)',
        border: emergency.active ? '1px solid #DC2626' : '1px solid var(--border-warm)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: emergency.active ? '0 8px 30px rgba(220, 38, 38, 0.12)' : 'var(--shadow-card)',
        padding: '24px',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Top Banner if Active */}
      {emergency.active && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            backgroundColor: '#DC2626'
          }}
        />
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 'var(--radius-sm)',
              backgroundColor: emergency.active ? '#FEE2E2' : 'var(--primary-orange-soft)',
              color: emergency.active ? '#DC2626' : 'var(--primary-orange-dark)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Siren size={20} className={emergency.active ? 'animate-pulse-slow' : ''} />
          </div>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-main)' }}>
              Emergency Triage & Green Corridor
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Dynamic Signal Manipulation & Pre-Clear Routing
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Badge
            variant={emergency.triageLevel === 'RED' ? 'critical' : emergency.triageLevel === 'YELLOW' ? 'degraded' : 'healthy'}
            size="md"
          >
            TRIAGE: {emergency.triageLevel}
          </Badge>

          {emergency.active && (
            <Badge variant="critical" pulsing>
              CORRIDOR ACTIVE
            </Badge>
          )}
        </div>
      </div>

      {/* Priority Selector Tabs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
        <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-body)' }}>
          Simulate Severity:
        </span>
        {['CRITICAL', 'SERIOUS', 'STABLE'].map((sev) => {
          const isSelected = emergency.patientSeverity === sev;
          return (
            <button
              key={sev}
              onClick={() => triggerEmergencyCorridor(sev)}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-full)',
                fontSize: '12px',
                fontWeight: '700',
                backgroundColor: isSelected ? (sev === 'CRITICAL' ? '#DC2626' : sev === 'SERIOUS' ? '#F59E0B' : '#16A34A') : 'var(--bg-surface-warm)',
                color: isSelected ? '#FFFFFF' : 'var(--text-body)',
                border: isSelected ? '1px solid transparent' : '1px solid var(--border-warm)',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {sev}
            </button>
          );
        })}
      </div>

      {/* Corridor Telemetry Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '12px',
          marginBottom: '20px'
        }}
      >
        {/* Ambulance ID */}
        <div style={{ backgroundColor: 'var(--bg-surface-warm)', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-warm)' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600', marginBottom: '4px' }}>
            VEHICLE ID
          </div>
          <div style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text-main)' }}>
            {emergency.ambulanceId}
          </div>
        </div>

        {/* Destination Hospital */}
        <div style={{ backgroundColor: 'var(--bg-surface-warm)', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-warm)' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600', marginBottom: '4px' }}>
            DESTINATION
          </div>
          <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-main)' }}>
            {emergency.hospital}
          </div>
        </div>

        {/* Distance & Route Congestion */}
        <div style={{ backgroundColor: 'var(--bg-surface-warm)', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-warm)' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600', marginBottom: '4px' }}>
            DISTANCE TO JUNCTION
          </div>
          <div style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text-main)' }}>
            {emergency.distanceMeters} meters
          </div>
        </div>

        {/* Live Countdown */}
        <div style={{ backgroundColor: emergency.active ? '#FEF2F2' : 'var(--bg-surface-warm)', padding: '14px', borderRadius: 'var(--radius-md)', border: emergency.active ? '1px solid #F87171' : '1px solid var(--border-warm)' }}>
          <div style={{ fontSize: '11px', color: emergency.active ? '#DC2626' : 'var(--text-muted)', fontWeight: '700', marginBottom: '4px' }}>
            ESTIMATED ETA
          </div>
          <div style={{ fontSize: '20px', fontWeight: '800', color: emergency.active ? '#DC2626' : 'var(--text-main)', fontFamily: 'var(--font-heading)' }}>
            {emergency.active ? `${emergency.countdownSeconds}s remaining` : `${emergency.etaSeconds}s`}
          </div>
        </div>
      </div>

      {/* Signal Manipulation Action Summary */}
      <div
        style={{
          padding: '14px 18px',
          backgroundColor: emergency.active ? '#FFF7ED' : 'var(--bg-surface-warm)',
          border: emergency.active ? '1px solid #FED7AA' : '1px solid var(--border-warm)',
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <ShieldAlert size={18} color="var(--primary-orange)" />
          <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-main)' }}>
            {emergency.active
              ? `Signal Overridden: Continuous Green for ${emergency.targetApproach}. Conflicting lanes held.`
              : 'Signal in balanced adaptive mode. Ready for emergency dispatch triage.'}
          </span>
        </div>

        {emergency.active && (
          <Button variant="plain" size="sm" onClick={resetEmergencyCorridor} style={{ color: 'var(--status-critical)' }}>
            End Corridor
          </Button>
        )}
      </div>
    </div>
  );
};

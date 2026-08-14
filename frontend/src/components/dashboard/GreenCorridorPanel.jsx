import React, { useState } from 'react';
import { Siren, HeartPulse, Flame, Shield, Navigation, Clock, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { useTraffic } from '../../context/TrafficContext';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';

export const GreenCorridorPanel = () => {
  const { emergency, triggerEmergencyCorridor, resetEmergencyCorridor } = useTraffic();
  const [emergencyType, setEmergencyType] = useState('AMBULANCE'); // 'AMBULANCE' | 'FIRE' | 'POLICE'

  const emergencyServices = [
    {
      id: 'AMBULANCE',
      label: 'Ambulance',
      icon: HeartPulse,
      vehicleId: 'DL-01-AMB-889',
      destination: 'AIIMS Trauma Center',
      priority: 'CRITICAL (Priority 1)',
      color: '#DC2626',
      badgeBg: '#FEE2E2',
      badgeText: '#991B1B'
    },
    {
      id: 'FIRE',
      label: 'Fire Engine',
      icon: Flame,
      vehicleId: 'DL-02-FIRE-101',
      destination: 'Connaught Commercial Hub',
      priority: 'URGENT RESCUE (Priority 1)',
      color: '#EA580C',
      badgeBg: '#FFEDD5',
      badgeText: '#9A3412'
    },
    {
      id: 'POLICE',
      label: 'Police Patrol',
      icon: Shield,
      vehicleId: 'DL-01-POL-999',
      destination: 'VIP Outer Ring Escort',
      priority: 'TACTICAL (Priority 2)',
      color: '#2563EB',
      badgeBg: '#DBEAFE',
      badgeText: '#1E40AF'
    }
  ];

  const activeService = emergencyServices.find((s) => s.id === emergencyType) || emergencyServices[0];

  return (
    <div
      style={{
        backgroundColor: 'var(--bg-surface)',
        border: emergency.active ? '2px solid #DC2626' : '1px solid var(--border-warm)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: emergency.active ? '0 8px 30px rgba(220, 38, 38, 0.15)' : 'var(--shadow-card)',
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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 'var(--radius-sm)',
              backgroundColor: emergency.active ? '#FEE2E2' : 'var(--primary-orange-soft)',
              color: emergency.active ? '#DC2626' : 'var(--primary-orange-dark)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Siren size={22} className={emergency.active ? 'animate-pulse-slow' : ''} />
          </div>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-main)', margin: 0 }}>
              Authorized Emergency Vehicle Corridor
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
              Official pre-clearance for Ambulances, Fire Engines & Police Responders (Distinguished from Civilian Traffic)
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
              🚨 CORRIDOR ACTIVE
            </Badge>
          )}
        </div>
      </div>

      {/* Vehicle Type Selector (Ambulance / Fire / Police) */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '8px' }}>
          SELECT AUTHORIZED EMERGENCY SERVICE:
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {emergencyServices.map((srv) => {
            const Icon = srv.icon;
            const isSelected = emergencyType === srv.id;

            return (
              <button
                key={srv.id}
                onClick={() => setEmergencyType(srv.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: isSelected ? srv.badgeBg : 'var(--bg-surface-warm)',
                  border: isSelected ? `2px solid ${srv.color}` : '1px solid var(--border-warm)',
                  color: isSelected ? srv.badgeText : 'var(--text-body)',
                  fontWeight: '800',
                  fontSize: '13px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <Icon size={16} color={srv.color} />
                <span>{srv.label} ({srv.vehicleId})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Corridor Telemetry Grid with Clear Identification */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '12px',
          marginBottom: '20px'
        }}
      >
        {/* Emergency Vehicle ID */}
        <div style={{ backgroundColor: 'var(--bg-surface-warm)', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-warm)' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700', marginBottom: '4px' }}>
            EMERGENCY VEHICLE
          </div>
          <div style={{ fontSize: '16px', fontWeight: '900', color: activeService.color, fontFamily: 'monospace' }}>
            {activeService.vehicleId}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
            {activeService.priority}
          </div>
        </div>

        {/* Destination Hospital / Hub */}
        <div style={{ backgroundColor: 'var(--bg-surface-warm)', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-warm)' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700', marginBottom: '4px' }}>
            DESTINATION HUB
          </div>
          <div style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-main)' }}>
            {activeService.destination}
          </div>
        </div>

        {/* Distance */}
        <div style={{ backgroundColor: 'var(--bg-surface-warm)', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-warm)' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700', marginBottom: '4px' }}>
            DISTANCE TO JUNCTION
          </div>
          <div style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text-main)' }}>
            {emergency.distanceMeters} meters
          </div>
        </div>

        {/* Live Countdown */}
        <div style={{ backgroundColor: emergency.active ? '#FEF2F2' : 'var(--bg-surface-warm)', padding: '14px', borderRadius: 'var(--radius-md)', border: emergency.active ? '1px solid #F87171' : '1px solid var(--border-warm)' }}>
          <div style={{ fontSize: '11px', color: emergency.active ? '#DC2626' : 'var(--text-muted)', fontWeight: '700', marginBottom: '4px' }}>
            CORRIDOR TIME TO CLEAR
          </div>
          <div style={{ fontSize: '20px', fontWeight: '900', color: emergency.active ? '#DC2626' : 'var(--text-main)', fontFamily: 'var(--font-heading)' }}>
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
          flexWrap: 'wrap',
          gap: '16px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <ShieldAlert size={18} color="var(--primary-orange)" />
          <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-main)' }}>
            {emergency.active
              ? `🚨 Signal Override Active: Continuous Green on East Approach for ${activeService.label}. All civilian lanes held.`
              : `Signal in balanced adaptive mode. Ready to pre-clear corridor for ${activeService.label}.`}
          </span>
        </div>

        {emergency.active ? (
          <Button variant="plain" size="sm" onClick={resetEmergencyCorridor} style={{ color: 'var(--status-critical)' }}>
            End Corridor
          </Button>
        ) : (
          <Button variant="primary" size="sm" icon={Siren} onClick={() => triggerEmergencyCorridor('CRITICAL')}>
            Trigger {activeService.label} Corridor
          </Button>
        )}
      </div>
    </div>
  );
};

import React from 'react';
import { AlertOctagon, ShieldAlert, Siren, RotateCcw } from 'lucide-react';
import { useTraffic } from '../../context/TrafficContext';

export const AccidentHazardBanner = ({ onNavigateGuards }) => {
  const { emergency, triggerEmergencyCorridor, resetEmergencyCorridor } = useTraffic();

  return (
    <div
      style={{
        backgroundColor: emergency.active ? '#450A0A' : '#7F1D1D',
        backgroundImage: emergency.active
          ? 'linear-gradient(90deg, #450A0A 0%, #7F1D1D 50%, #450A0A 100%)'
          : 'linear-gradient(90deg, #7F1D1D 0%, #991B1B 50%, #7F1D1D 100%)',
        border: emergency.active ? '2px solid #F87171' : '2px solid #EF4444',
        borderRadius: 'var(--radius-lg)',
        padding: '16px 20px',
        color: '#FFFFFF',
        boxShadow: '0 8px 24px rgba(239, 68, 68, 0.25)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Animated Hazard Glow Line */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: 'linear-gradient(90deg, #F87171, #FDE047, #F87171)',
          animation: 'pulse 2s infinite'
        }}
      />

      {/* Left: Siren & High Priority Message */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: '1 1 500px' }}>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: '50%',
            backgroundColor: '#DC2626',
            border: '2px solid #FCA5A5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: '0 0 16px rgba(239, 68, 68, 0.8)'
          }}
          className="animate-pulse-slow"
        >
          {emergency.active ? <Siren size={24} color="#FFFFFF" /> : <AlertOctagon size={24} color="#FFFFFF" />}
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '2px' }}>
            <span
              style={{
                fontSize: '11px',
                fontWeight: '900',
                backgroundColor: emergency.active ? '#DC2626' : '#EF4444',
                color: '#FFFFFF',
                padding: '2px 8px',
                borderRadius: 'var(--radius-sm)',
                letterSpacing: '0.08em',
                textTransform: 'uppercase'
              }}
            >
              {emergency.active ? '🚨 EMERGENCY CORRIDOR ACTIVE' : '⚠️ ACCIDENT RISK INTERCEPTION'}
            </span>
            <span style={{ fontSize: '12px', color: '#FECACA', fontWeight: '700' }}>
              {emergency.active ? `TIME TO CLEAR: ${emergency.countdownSeconds}s` : 'COLLISION HAZARD LEVEL: HIGH (84%)'}
            </span>
          </div>

          <div style={{ fontSize: '15px', fontWeight: '800', color: '#FFFFFF', lineHeight: 1.3 }}>
            {emergency.active
              ? `Ambulance DL-01-AMB-889 en route to AIIMS Trauma Hub. All conflicting signals held RED.`
              : 'Erratic 38° Lane Swerve & Queue Spill Flagged on East Approach. Upstream Signal Held to Prevent T-Bone Collision.'}
          </div>
        </div>
      </div>

      {/* Right: Quick Action Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
        <button
          onClick={onNavigateGuards}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            backgroundColor: '#FEF2F2',
            color: '#991B1B',
            fontWeight: '800',
            fontSize: '13px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid #FECACA',
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
            transition: 'transform 0.15s ease'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.03)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        >
          <ShieldAlert size={16} color="#DC2626" />
          <span>Inspect Triage Guard →</span>
        </button>

        {emergency.active ? (
          <button
            onClick={resetEmergencyCorridor}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              backgroundColor: '#FEF2F2',
              color: '#991B1B',
              fontWeight: '800',
              fontSize: '13px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid #FCA5A5',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
            }}
          >
            <RotateCcw size={15} color="#991B1B" />
            <span>Reset Corridor ({emergency.countdownSeconds}s)</span>
          </button>
        ) : (
          <button
            onClick={() => triggerEmergencyCorridor('CRITICAL')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              backgroundColor: '#DC2626',
              color: '#FFFFFF',
              fontWeight: '800',
              fontSize: '13px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid #F87171',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(220, 38, 38, 0.5)'
            }}
          >
            <Siren size={16} />
            <span>Simulate Green Corridor</span>
          </button>
        )}
      </div>
    </div>
  );
};

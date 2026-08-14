import React, { useState } from 'react';
import { ShieldAlert, Crosshair, AlertTriangle, Radio, BellRing, CheckCircle2 } from 'lucide-react';
import { Badge } from '../common/Badge';

export const RiskPatternModule = () => {
  const [dispatchedMarshals, setDispatchedMarshals] = useState({});

  const riskEvents = [
    {
      vehicleId: 'DL-04-TC-201',
      pattern: 'Aggressive Multi-Lane Cut (38° Swerve)',
      riskScore: 84,
      severity: 'CRITICAL',
      speed: '58 km/h',
      swerveAngle: '38° abrupt',
      time: '14:21:40',
      hazard: 'High Collision Potential with Southbound Bus'
    },
    {
      vehicleId: 'HR-26-BK-9102',
      pattern: 'Wrong-Side Approach Feeder',
      riskScore: 72,
      severity: 'HIGH',
      speed: '28 km/h',
      swerveAngle: '180° counter-flow',
      time: '14:09:12',
      hazard: 'Head-On Crash Risk at Junction Exit Ramp'
    }
  ];

  const handleDispatchMarshal = (vehicleId) => {
    setDispatchedMarshals((prev) => ({ ...prev, [vehicleId]: true }));
  };

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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 'var(--radius-md)',
              backgroundColor: '#FEF2F2',
              border: '1px solid #FECACA',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <ShieldAlert size={20} color="#DC2626" />
          </div>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-main)', margin: 0 }}>
              Live Accident Prevention & Collision Interceptor
            </h3>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              AI Vision monitors trajectory deflection, wrong-side entries, and pedestrian zone encroachments
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#DC2626' }} className="animate-pulse-slow" />
          <Badge variant="critical" size="sm">
            2 Trajectories Intercepted
          </Badge>
        </div>
      </div>

      {/* High-Risk Event Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {riskEvents.map((evt) => {
          const isDispatched = dispatchedMarshals[evt.vehicleId];

          return (
            <div
              key={evt.vehicleId}
              style={{
                padding: '18px 20px',
                backgroundColor: evt.severity === 'CRITICAL' ? '#FEF2F2' : 'var(--bg-surface-warm)',
                border: evt.severity === 'CRITICAL' ? '2px solid #F87171' : '1px solid var(--border-warm)',
                borderRadius: 'var(--radius-md)',
                boxShadow: evt.severity === 'CRITICAL' ? '0 4px 12px rgba(239, 68, 68, 0.12)' : 'none',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div
                    style={{
                      padding: '4px 10px',
                      backgroundColor: '#1E293B',
                      color: '#F8FAFC',
                      fontWeight: '800',
                      fontSize: '13px',
                      fontFamily: 'monospace',
                      borderRadius: 'var(--radius-sm)'
                    }}
                  >
                    {evt.vehicleId}
                  </div>
                  <span style={{ fontSize: '14px', fontWeight: '800', color: '#991B1B' }}>
                    {evt.pattern}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div
                    style={{
                      padding: '4px 12px',
                      backgroundColor: '#DC2626',
                      color: '#FFFFFF',
                      fontSize: '12px',
                      fontWeight: '800',
                      borderRadius: 'var(--radius-full)'
                    }}
                  >
                    CRASH PROBABILITY: {evt.riskScore}%
                  </div>
                </div>
              </div>

              {/* Specific Crash Hazard Explanation */}
              <div
                style={{
                  padding: '8px 12px',
                  backgroundColor: 'rgba(255, 255, 255, 0.7)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid #FECACA',
                  fontSize: '13px',
                  color: '#7F1D1D',
                  fontWeight: '600'
                }}
              >
                ⚠️ <strong>Collision Risk:</strong> {evt.hazard}
              </div>

              {/* Metrics & Action Controls */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', borderTop: '1px solid #FECACA', paddingTop: '10px' }}>
                <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: 'var(--text-body)' }}>
                  <span>Speed: <strong style={{ color: '#DC2626' }}>{evt.speed}</strong></span>
                  <span>Deflection: <strong>{evt.swerveAngle}</strong></span>
                  <span>Logged: <strong>{evt.time}</strong></span>
                </div>

                <button
                  onClick={() => handleDispatchMarshal(evt.vehicleId)}
                  disabled={isDispatched}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 14px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: isDispatched ? '#DCFCE7' : '#DC2626',
                    color: isDispatched ? '#166534' : '#FFFFFF',
                    border: isDispatched ? '1px solid #86EFAC' : '1px solid #B91C1C',
                    fontSize: '12px',
                    fontWeight: '800',
                    cursor: isDispatched ? 'default' : 'pointer',
                    boxShadow: isDispatched ? 'none' : '0 2px 6px rgba(220, 38, 38, 0.3)'
                  }}
                >
                  {isDispatched ? (
                    <>
                      <CheckCircle2 size={14} color="#166534" />
                      <span>Traffic Marshal Dispatched & Signal Held</span>
                    </>
                  ) : (
                    <>
                      <BellRing size={14} />
                      <span>Dispatch Marshal & Hold Upstream Signal</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

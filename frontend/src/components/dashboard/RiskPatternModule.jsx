import React, { useState } from 'react';
import { ShieldAlert, Crosshair, BellRing, CheckCircle2, Car, Shield } from 'lucide-react';
import { Badge } from '../common/Badge';

export const RiskPatternModule = () => {
  const [dispatchedMarshals, setDispatchedMarshals] = useState({});

  const riskEvents = [
    {
      vehicleId: 'DL-04-TC-201',
      vehicleType: '🚗 Civilian Private Car',
      classification: 'Civilian Commuter (Traffic Violator)',
      pattern: 'Aggressive Multi-Lane Cut (38° Swerve)',
      riskScore: 84,
      severity: 'CRITICAL',
      speed: '58 km/h',
      swerveAngle: '38° abrupt lane cut',
      time: '14:21:40',
      hazard: 'High Collision Potential with Southbound Bus - Held by Signal'
    },
    {
      vehicleId: 'HR-26-BK-9102',
      vehicleType: '🛵 Civilian Two-Wheeler',
      classification: 'Civilian Commuter (Traffic Violator)',
      pattern: 'Wrong-Side Approach Feeder Violation',
      riskScore: 72,
      severity: 'HIGH',
      speed: '28 km/h',
      swerveAngle: '180° counter-flow entry',
      time: '14:09:12',
      hazard: 'Head-On Crash Risk at Junction Exit Ramp - Held by Signal'
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
              backgroundColor: '#FEF3C7',
              border: '1px solid #FCD34D',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <ShieldAlert size={20} color="#D97706" />
          </div>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-main)', margin: 0 }}>
              Civilian Traffic Violation & Collision Interceptor
            </h3>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Monitors dangerous civilian commuter maneuvers (NOT emergency vehicles) to hold signals and prevent accidents
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '11px', fontWeight: '800', backgroundColor: '#F1F5F9', color: '#475569', padding: '4px 10px', borderRadius: 'var(--radius-full)', border: '1px solid #CBD5E1' }}>
            2 Civilian Offenses Flagged
          </span>
        </div>
      </div>

      {/* Civilian Violator Cards (Distinguished with Slate/Amber styling and Car badges) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {riskEvents.map((evt) => {
          const isDispatched = dispatchedMarshals[evt.vehicleId];

          return (
            <div
              key={evt.vehicleId}
              style={{
                padding: '18px 20px',
                backgroundColor: 'var(--bg-surface-warm)',
                border: '1.5px solid #FCD34D',
                borderRadius: 'var(--radius-md)',
                boxShadow: '0 2px 8px rgba(217, 119, 6, 0.08)',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}
            >
              {/* Header: Clear Vehicle Type & Civilian Identity */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {/* Distinct Civilian Vehicle Plate */}
                  <div
                    style={{
                      padding: '4px 10px',
                      backgroundColor: '#334155',
                      color: '#FFFFFF',
                      fontWeight: '800',
                      fontSize: '13px',
                      fontFamily: 'monospace',
                      borderRadius: 'var(--radius-sm)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <Car size={14} color="#FBBF24" />
                    <span>{evt.vehicleId}</span>
                  </div>

                  {/* Vehicle Class Badge */}
                  <span
                    style={{
                      fontSize: '12px',
                      fontWeight: '800',
                      color: '#92400E',
                      backgroundColor: '#FEF3C7',
                      border: '1px solid #FDE68A',
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-sm)'
                    }}
                  >
                    {evt.vehicleType}
                  </span>

                  <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-main)' }}>
                    • {evt.pattern}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: '800',
                      backgroundColor: '#EF4444',
                      color: '#FFFFFF',
                      padding: '3px 10px',
                      borderRadius: 'var(--radius-full)'
                    }}
                  >
                    CRASH HAZARD: {evt.riskScore}%
                  </span>
                </div>
              </div>

              {/* Hazard Description */}
              <div
                style={{
                  padding: '8px 12px',
                  backgroundColor: '#FFFBEB',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid #FDE68A',
                  fontSize: '12px',
                  color: '#B45309',
                  fontWeight: '600'
                }}
              >
                ⚠️ <strong>Civilian Commuter Violation:</strong> {evt.hazard}
              </div>

              {/* Metrics & Dispatch Marshal Button */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', borderTop: '1px solid var(--border-warm)', paddingTop: '10px' }}>
                <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: 'var(--text-body)' }}>
                  <span>Speed: <strong>{evt.speed}</strong></span>
                  <span>Maneuver: <strong>{evt.swerveAngle}</strong></span>
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
                    backgroundColor: isDispatched ? '#DCFCE7' : '#EA580C',
                    color: isDispatched ? '#166534' : '#FFFFFF',
                    border: isDispatched ? '1px solid #86EFAC' : '1px solid #C2410C',
                    fontSize: '12px',
                    fontWeight: '800',
                    cursor: isDispatched ? 'default' : 'pointer'
                  }}
                >
                  {isDispatched ? (
                    <>
                      <CheckCircle2 size={14} color="#166534" />
                      <span>Marshal Dispatched & Upstream Light Held</span>
                    </>
                  ) : (
                    <>
                      <BellRing size={14} />
                      <span>Alert Traffic Marshal</span>
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

import React from 'react';
import { useTraffic, EMERGENCY_PRESETS } from '../../../context/TrafficContext';
import { Siren, Flame, ShieldAlert, Navigation2, MapPin, Zap, CheckCircle2, Clock, Map as MapIcon } from 'lucide-react';
import { Badge } from '../../common/Badge';

export const GreenCorridorsView = () => {
  const { activeCorridors, triggerEmergencyCorridor, removeEmergencyCorridor, activeCity } = useTraffic();

  return (
    <div className="view-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* 1. Header & Dispatch Controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: '900', color: '#0F172A', letterSpacing: '-0.02em', marginBottom: '4px' }}>
            Active Green Corridors
          </h2>
          <p style={{ fontSize: '13px', color: '#64748B', fontWeight: '500' }}>
            Real-time monitoring of automatically dispatched emergency vehicles on pre-empted routes.
          </p>
        </div>
      </div>

      {/* 2. Active Corridors Dashboard */}
      {activeCorridors.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '400px', backgroundColor: '#FFFFFF', borderRadius: '20px', border: '2px dashed #E2E8F0' }}>
          <div style={{ width: 64, height: 64, borderRadius: '16px', backgroundColor: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
            <MapIcon size={28} color="#94A3B8" />
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0F172A', marginBottom: '8px' }}>No Active Corridors</h3>
          <p style={{ fontSize: '13px', color: '#64748B', maxWidth: '300px', textAlign: 'center' }}>
            Traffic signals are operating in standard adaptive mode. Dispatch an emergency vehicle above to create a green corridor.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
          {activeCorridors.map(corridor => {
            const isArrived = corridor.status === 'ARRIVED';
            const progress = isArrived ? 100 : Math.min(100, Math.max(5, ((corridor.etaSeconds - corridor.countdownSeconds) / corridor.etaSeconds) * 100));
            
            // Icon component mapping
            const IconComp = corridor.vehicleType === 'AMBULANCE' ? Siren : corridor.vehicleType === 'FIRE' ? Flame : ShieldAlert;
            const themeColor = corridor.vehicleType === 'AMBULANCE' ? '#DC2626' : corridor.vehicleType === 'FIRE' ? '#EA580C' : '#2563EB';
            const themeBg = corridor.vehicleType === 'AMBULANCE' ? '#FEF2F2' : corridor.vehicleType === 'FIRE' ? '#FFF7ED' : '#EFF6FF';
            
            return (
              <div
                key={corridor.id}
                className="view-fade-in"
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '20px',
                  border: `2px solid ${isArrived ? '#86EFAC' : themeBg}`,
                  boxShadow: `0 8px 32px ${isArrived ? 'rgba(34,197,94,0.1)' : 'rgba(0,0,0,0.06)'}`,
                  overflow: 'hidden',
                  position: 'relative'
                }}
              >
                {/* Header (Top half) */}
                <div style={{ backgroundColor: isArrived ? '#F0FDF4' : themeBg, padding: '24px', borderBottom: `1px solid ${isArrived ? '#86EFAC' : '#E2E8F0'}` }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: 48, height: 48, borderRadius: '14px', backgroundColor: isArrived ? '#22C55E' : themeColor, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF', boxShadow: `0 4px 12px ${themeColor}40` }}>
                        <IconComp size={24} />
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <span style={{ fontSize: '16px', fontWeight: '900', color: '#0F172A' }}>
                            {corridor.vehicleId}
                          </span>
                          <span style={{ fontSize: '10px', fontWeight: '800', padding: '3px 8px', borderRadius: '9999px', backgroundColor: '#FFFFFF', color: themeColor, border: `1px solid ${themeColor}40` }}>
                            {corridor.vehicleLabel}
                          </span>
                        </div>
                        <div style={{ fontSize: '12px', color: '#475569', fontWeight: '600' }}>
                          {corridor.priorityTag || 'Priority 1'} • {corridor.id}
                        </div>
                      </div>
                    </div>
                    
                    {/* Live Status / ETA */}
                    <div style={{ textAlign: 'right' }}>
                      {isArrived ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#15803D', fontWeight: '800', fontSize: '14px', marginBottom: '4px' }}>
                            <CheckCircle2 size={16} />
                            ARRIVED
                          </div>
                          <button
                            onClick={() => removeEmergencyCorridor(corridor.id)}
                            style={{ fontSize: '11px', color: '#16A34A', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                          >
                            Clear Corridor
                          </button>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: themeColor, fontWeight: '800', fontSize: '14px', marginBottom: '4px' }}>
                            <Clock size={16} className="animate-pulse-slow" />
                            {corridor.countdownSeconds}s ETA
                          </div>
                          <div style={{ fontSize: '11px', color: '#64748B', fontWeight: '600' }}>
                            {corridor.distanceMeters}m away
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Route Timeline & Map */}
                  <div style={{ position: 'relative', marginTop: '24px' }}>
                    {/* Locations */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                        <div style={{ fontSize: '10px', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', marginBottom: '2px' }}>Origin</div>
                        <div style={{ fontSize: '12px', fontWeight: '700', color: '#0F172A' }}>{corridor.origin}</div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                        <div style={{ fontSize: '10px', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', marginBottom: '2px' }}>Destination</div>
                        <div style={{ fontSize: '12px', fontWeight: '700', color: '#0F172A' }}>{corridor.destination}</div>
                      </div>
                    </div>

                    {/* Progress Bar Container */}
                    <div style={{ position: 'relative', height: '8px', backgroundColor: '#E2E8F0', borderRadius: '9999px' }}>
                      <div style={{ position: 'absolute', top: 0, left: 0, height: '100%', width: `${progress}%`, backgroundColor: isArrived ? '#22C55E' : themeColor, borderRadius: '9999px', transition: 'width 1s linear' }} />
                      
                      {/* Vehicle Marker on Track */}
                      <div style={{ position: 'absolute', top: '50%', left: `${progress}%`, transform: 'translate(-50%, -50%)', width: 20, height: 20, borderRadius: '50%', backgroundColor: '#FFFFFF', border: `3px solid ${isArrived ? '#22C55E' : themeColor}`, boxShadow: '0 2px 8px rgba(0,0,0,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'left 1s linear', zIndex: 10 }}>
                        <Navigation2 size={10} color={isArrived ? '#22C55E' : themeColor} style={{ transform: 'rotate(45deg)' }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer (Bottom half: Nodes & Telemetry) */}
                <div style={{ padding: '24px' }}>
                  <div style={{ fontSize: '12px', fontWeight: '800', color: '#0F172A', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span>Route Signal Pre-emption</span>
                    <Badge variant={isArrived ? 'healthy' : 'critical'} size="sm">
                      {isArrived ? 'Adaptive Flow Restored' : 'Forced Green Override'}
                    </Badge>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {corridor.pathNodes && corridor.pathNodes.map((node, idx) => {
                      // Determine status based on overall progress
                      const nodeThreshold = (idx + 1) * (100 / corridor.pathNodes.length);
                      const isPassed = progress > nodeThreshold;
                      const isNext = progress <= nodeThreshold && progress > (idx * (100 / corridor.pathNodes.length));
                      
                      const nodeStatus = isArrived || isPassed ? 'PASSED' : isNext ? 'APPROACHING' : 'UPCOMING';
                      
                      return (
                        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '12px', backgroundColor: nodeStatus === 'APPROACHING' ? '#F0F9FF' : '#F8FAFC', border: nodeStatus === 'APPROACHING' ? '1px solid #BAE6FD' : '1px solid #F1F5F9' }}>
                          {/* Signal Light Indicator */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', backgroundColor: '#1E293B', padding: '4px', borderRadius: '8px' }}>
                            <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#334155' }} />
                            <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#334155' }} />
                            <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: nodeStatus === 'PASSED' ? '#334155' : '#22C55E', boxShadow: nodeStatus === 'PASSED' ? 'none' : '0 0 8px #22C55E' }} />
                          </div>

                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '13px', fontWeight: '700', color: '#0F172A' }}>{node.name}</div>
                            <div style={{ fontSize: '11px', color: '#64748B' }}>
                              {nodeStatus === 'PASSED' ? 'Cleared' : nodeStatus === 'APPROACHING' ? 'Forced Green Active' : 'Pre-empted Green'}
                            </div>
                          </div>

                          <div>
                            {nodeStatus === 'PASSED' ? (
                              <CheckCircle2 size={16} color="#94A3B8" />
                            ) : nodeStatus === 'APPROACHING' ? (
                              <span style={{ fontSize: '10px', fontWeight: '800', color: '#0284C7', backgroundColor: '#E0F2FE', padding: '2px 8px', borderRadius: '6px' }}>NEXT</span>
                            ) : (
                              <span style={{ fontSize: '10px', fontWeight: '700', color: '#94A3B8' }}>{Math.round(nodeThreshold - progress)}% away</span>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default GreenCorridorsView;

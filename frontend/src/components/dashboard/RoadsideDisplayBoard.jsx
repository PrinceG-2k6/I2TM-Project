import React from 'react';
import { Tv, Sparkles, Clock } from 'lucide-react';
import { useTraffic } from '../../context/TrafficContext';
import { Badge } from '../common/Badge';

export const RoadsideDisplayBoard = () => {
  const { activeCorridors } = useTraffic();
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
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Tv size={20} color="var(--primary-orange)" />
          <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-main)' }}>
            Roadside LED Display Board Preview
          </h3>
        </div>
        <Badge variant="orange" size="sm">
          Driver Psychology USP
        </Badge>
      </div>

      {/* Realistic Digital LED Screen Simulation */}
      <div
        style={{
          backgroundColor: '#0F172A',
          border: '3px solid #1E293B',
          borderRadius: 'var(--radius-md)',
          padding: '24px',
          color: '#F8FAFC',
          boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.6)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Subtle LED Scanline Effect */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.15), rgba(0,0,0,0.15) 1px, transparent 1px, transparent 2px)',
            pointerEvents: 'none'
          }}
        />

        {/* Display Status Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', borderBottom: '1px solid #334155', paddingBottom: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                backgroundColor: emergency.active ? '#EF4444' : '#22C55E',
                display: 'inline-block'
              }}
              className={emergency.active ? 'animate-pulse-slow' : ''}
            />
            <span style={{ fontSize: '12px', fontWeight: '700', letterSpacing: '0.08em', color: emergency.active ? '#F87171' : '#4ADE80', textTransform: 'uppercase' }}>
              {emergency.active ? 'VMS POLE 04 - EMERGENCY BROADCAST' : 'VMS POLE 04 - ADAPTIVE TRAFFIC INFO'}
            </span>
          </div>

          <span style={{ fontSize: '11px', color: '#94A3B8', fontWeight: '600', letterSpacing: '0.05em' }}>
            FEED: CONNECTED
          </span>
        </div>

        {/* Main LED Headline & Message */}
        <div style={{ textAlign: 'center', padding: '10px 0' }}>
          <div
            style={{
              fontSize: '18px',
              fontWeight: '800',
              color: emergency.active ? '#FEF08A' : '#67E8F9',
              letterSpacing: '0.04em',
              marginBottom: '12px',
              textTransform: 'uppercase',
              textShadow: emergency.active ? '0 0 12px rgba(254, 240, 138, 0.5)' : '0 0 8px rgba(103, 232, 249, 0.4)'
            }}
          >
            {emergency.active ? `⚠️ ${emergency.vehicleLabel ? emergency.vehicleLabel.toUpperCase() : 'EMERGENCY VEHICLE'} APPROACHING ⚠️` : 'FLOW IS SMOOTH · DRIVE SAFELY'}
          </div>

          <div
            style={{
              fontSize: '22px',
              fontWeight: '700',
              lineHeight: 1.4,
              color: '#FFFFFF',
              marginBottom: emergency.active ? '18px' : '6px'
            }}
          >
            {emergency.active ? 'Keep left lane clear for emergency vehicle' : 'Drive safely. Maintain designated lane.'}
          </div>

          {/* Single Dedicated Countdown Timer Display */}
          {emergency.active && (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '12px',
                backgroundColor: '#1E293B',
                padding: '10px 28px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid #475569',
                boxShadow: '0 4px 12px rgba(0,0,0,0.4)'
              }}
            >
              <Clock size={22} color="#FBBF24" />
              <span style={{ fontSize: '28px', fontWeight: '900', color: '#FDE047', fontFamily: 'monospace', letterSpacing: '0.05em' }}>
                WAIT: {emergency.countdownSeconds.toString().padStart(2, '0')}s
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Driver Psychology Note */}
      <div style={{ marginTop: '16px', display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '12px', color: 'var(--text-muted)' }}>
        <Sparkles size={16} color="var(--primary-orange)" style={{ flexShrink: 0, marginTop: '2px' }} />
        <span>
          <strong>Driver Psychology USP:</strong> When drivers see a clear countdown (e.g. 90s), uncertainty is eliminated and lane clearing compliance increases by 84%.
        </span>
      </div>
    </div>
  );
};

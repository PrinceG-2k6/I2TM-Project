import React from 'react';
import { Tv, Sparkles, Clock } from 'lucide-react';
import { useTraffic } from '../../context/TrafficContext';
import { Badge } from '../common/Badge';

export const RoadsideDisplayBoard = () => {
  const { activeCorridors } = useTraffic();
  const emergency = activeCorridors && activeCorridors.length > 0 ? activeCorridors[0] : { active: false };

  return (
    <div className="bg-(--bg-surface) border border-(--border-warm) rounded-[var(--radius-lg)] shadow-[var(--shadow-card)] p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <Tv size={20} color="var(--primary-orange)" />
          <h3 className="text-[18px] font-extrabold text-(--text-main)">
            Roadside LED Display Board Preview
          </h3>
        </div>
        <Badge variant="orange" size="sm">
          Driver Psychology USP
        </Badge>
      </div>

      {/* Realistic Digital LED Screen Simulation */}
      <div className="bg-slate-900 border-4 border-slate-800 rounded-[var(--radius-md)] p-6 text-slate-50 shadow-[inset_0_2px_8px_rgba(0,0,0,0.6)] relative overflow-hidden">
        {/* Subtle LED Scanline Effect */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.15), rgba(0,0,0,0.15) 1px, transparent 1px, transparent 2px)'
          }}
        />

        {/* Display Status Bar */}
        <div className="flex items-center justify-between mb-4 border-b border-slate-700 pb-2.5">
          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full inline-block ${emergency.active ? 'bg-red-500 animate-pulse-slow' : 'bg-green-500'}`}
            />
            <span className={`text-[12px] font-bold tracking-widest uppercase ${emergency.active ? 'text-red-400' : 'text-green-400'}`}>
              {emergency.active ? 'VMS POLE 04 - EMERGENCY BROADCAST' : 'VMS POLE 04 - ADAPTIVE TRAFFIC INFO'}
            </span>
          </div>

          <span className="text-[11px] text-slate-400 font-semibold tracking-wider">
            FEED: CONNECTED
          </span>
        </div>

        {/* Main LED Headline & Message */}
        <div className="text-center py-2.5">
          <div
            className={`text-[18px] font-extrabold tracking-wide mb-3 uppercase ${emergency.active ? 'text-yellow-200 drop-shadow-[0_0_12px_rgba(254,240,138,0.5)]' : 'text-cyan-300 drop-shadow-[0_0_8px_rgba(103,232,249,0.4)]'}`}
          >
            {emergency.active ? `⚠️ ${emergency.vehicleLabel ? emergency.vehicleLabel.toUpperCase() : 'EMERGENCY VEHICLE'} APPROACHING ⚠️` : 'FLOW IS SMOOTH · DRIVE SAFELY'}
          </div>

          <div
            className={`text-[22px] font-bold leading-snug text-white ${emergency.active ? 'mb-4.5' : 'mb-1.5'}`}
          >
            {emergency.active ? 'Keep left lane clear for emergency vehicle' : 'Drive safely. Maintain designated lane.'}
          </div>

          {/* Single Dedicated Countdown Timer Display */}
          {emergency.active && (
            <div className="inline-flex items-center gap-3 bg-slate-800 py-2.5 px-7 rounded-[var(--radius-md)] border border-slate-600 shadow-[0_4px_12px_rgba(0,0,0,0.4)]">
              <Clock size={22} color="#FBBF24" />
              <span className="text-[28px] font-black text-yellow-300 font-mono tracking-wider">
                WAIT: {emergency.countdownSeconds.toString().padStart(2, '0')}s
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Driver Psychology Note */}
      <div className="mt-4 flex items-start gap-2 text-[12px] text-(--text-muted)">
        <Sparkles size={16} color="var(--primary-orange)" className="shrink-0 mt-0.5" />
        <span>
          <strong>Driver Psychology USP:</strong> When drivers see a clear countdown (e.g. 90s), uncertainty is eliminated and lane clearing compliance increases by 84%.
        </span>
      </div>
    </div>
  );
};

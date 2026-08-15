import React from 'react';
import { useTraffic } from '../../../context/TrafficContext';
import { EMERGENCY_PRESETS } from '../../../data/dummyData';
import { Siren, Flame, ShieldAlert, Navigation2, CheckCircle2, Clock, Map as MapIcon } from 'lucide-react';

export const GreenCorridorsView = () => {
  const { activeCorridors, triggerEmergencyCorridor, removeEmergencyCorridor, activeCity } = useTraffic();

  return (
    <div className="view-fade-in flex flex-col gap-4">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm">Active Green Corridors</div>
          <div className="text-xs text-(--color-2) mt-0.5">
            Real-time monitoring of emergency vehicles on pre-empted routes.
          </div>
        </div>
      </div>

      {/* Dispatch buttons */}
      <div className="bg-(--color-4) border border-(--color-3) rounded-sm p-3.5 flex items-center gap-3 flex-wrap">
        <span className="text-xs text-(--color-2)">Dispatch:</span>
        {Object.values(EMERGENCY_PRESETS).map((preset) => {
          const IconComp = preset.vehicleType === 'AMBULANCE' ? Siren : preset.vehicleType === 'FIRE' ? Flame : ShieldAlert;
          return (
            <button
              key={preset.vehicleType}
              onClick={() => triggerEmergencyCorridor && triggerEmergencyCorridor(preset)}
              className="flex items-center gap-2 py-1.5 px-3 text-sm border border-(--color-3) rounded-sm cursor-pointer transition-all duration-150 hover:border-(--color-6) hover:text-(--color-6)"
            >
              <IconComp size={14} />
              {preset.vehicleLabel}
            </button>
          );
        })}
      </div>

      {/* Active Corridors */}
      {activeCorridors.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-80 bg-(--color-4) border border-(--color-3) rounded-sm">
          <MapIcon size={24} color="#bfbfbd" className="mb-3" />
          <div className="text-sm mb-1">No Active Corridors</div>
          <div className="text-xs text-(--color-2) max-w-xs text-center">
            Traffic signals are in standard adaptive mode. Dispatch above to create a green corridor.
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fit,minmax(380px,1fr))] gap-4">
          {activeCorridors.map(corridor => {
            const isArrived = corridor.status === 'ARRIVED';
            const progress = isArrived ? 100 : Math.min(100, Math.max(5, ((corridor.etaSeconds - corridor.countdownSeconds) / corridor.etaSeconds) * 100));
            const IconComp = corridor.vehicleType === 'AMBULANCE' ? Siren : corridor.vehicleType === 'FIRE' ? Flame : ShieldAlert;
            const themeColor = corridor.vehicleType === 'AMBULANCE' ? '#DC2626' : corridor.vehicleType === 'FIRE' ? '#EA580C' : '#2563EB';

            return (
              <div
                key={corridor.id}
                className="bg-(--color-4) border border-(--color-3) rounded-sm overflow-hidden"
              >
                {/* Header */}
                <div className="p-4 border-b border-(--color-3)">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-sm border border-(--color-3) bg-(--color-5) flex items-center justify-center">
                        <IconComp size={18} style={{ color: themeColor }} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-sm">{corridor.vehicleId}</span>
                          <span className="text-xs text-(--color-2) border border-(--color-3) bg-(--color-5) py-px px-1.5 rounded-sm">
                            {corridor.vehicleLabel}
                          </span>
                        </div>
                        <div className="text-xs text-(--color-2)">
                          {corridor.priorityTag || 'Priority 1'} · {corridor.id}
                        </div>
                      </div>
                    </div>

                    {/* ETA / Arrived */}
                    <div className="text-right">
                      {isArrived ? (
                        <div className="flex flex-col items-end gap-1">
                          <div className="flex items-center gap-1.5 text-green-700 text-sm">
                            <CheckCircle2 size={14} />
                            ARRIVED
                          </div>
                          <button
                            onClick={() => removeEmergencyCorridor(corridor.id)}
                            className="text-xs text-green-600 underline cursor-pointer bg-transparent border-none p-0"
                          >
                            Clear Corridor
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-end gap-0.5">
                          <div className="flex items-center gap-1.5 text-sm" style={{ color: themeColor }}>
                            <Clock size={14} className="animate-pulse-slow" />
                            {corridor.countdownSeconds}s ETA
                          </div>
                          <div className="text-xs text-(--color-2)">{corridor.distanceMeters}m away</div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Route progress */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <div className="text-xs text-(--color-2)">Origin</div>
                        <div className="text-xs">{corridor.origin}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-(--color-2)">Destination</div>
                        <div className="text-xs">{corridor.destination}</div>
                      </div>
                    </div>

                    <div className="relative h-1.5 bg-(--color-3) rounded-full">
                      <div
                        className="absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ease-linear"
                        style={{ width: `${progress}%`, backgroundColor: isArrived ? '#22C55E' : themeColor }}
                      />
                      <div
                        className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white border-2 flex items-center justify-center z-10 transition-all duration-1000 ease-linear"
                        style={{ left: `${progress}%`, borderColor: isArrived ? '#22C55E' : themeColor }}
                      >
                        <Navigation2 size={8} color={isArrived ? '#22C55E' : themeColor} className="rotate-45" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Path Nodes */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-(--color-2)">Route Signal Pre-emption</span>
                    <span className="text-xs" style={{ color: isArrived ? '#16A34A' : themeColor }}>
                      {isArrived ? 'Adaptive Flow Restored' : 'Forced Green Override'}
                    </span>
                  </div>

                  <div className="flex flex-col gap-2">
                    {corridor.pathNodes && corridor.pathNodes.map((node, idx) => {
                      const nodeThreshold = (idx + 1) * (100 / corridor.pathNodes.length);
                      const isPassed = progress > nodeThreshold;
                      const isNext = progress <= nodeThreshold && progress > (idx * (100 / corridor.pathNodes.length));
                      const nodeStatus = isArrived || isPassed ? 'PASSED' : isNext ? 'APPROACHING' : 'UPCOMING';

                      return (
                        <div key={idx} className={`flex items-center gap-3 p-2.5 rounded-sm border ${nodeStatus === 'APPROACHING' ? 'bg-(--color-5) border-(--color-6)' : 'bg-(--color-5) border-(--color-3)'}`}>
                          <div className="flex flex-col gap-0.5 bg-slate-800 p-1 rounded-sm">
                            <div className="w-2 h-2 rounded-full bg-slate-700" />
                            <div className="w-2 h-2 rounded-full bg-slate-700" />
                            <div className={`w-2 h-2 rounded-full ${nodeStatus === 'PASSED' ? 'bg-slate-700' : 'bg-green-500'}`} />
                          </div>

                          <div className="flex-1">
                            <div className="text-sm">{node.name}</div>
                            <div className="text-xs text-(--color-2)">
                              {nodeStatus === 'PASSED' ? 'Cleared' : nodeStatus === 'APPROACHING' ? 'Forced Green Active' : 'Pre-empted Green'}
                            </div>
                          </div>

                          <div>
                            {nodeStatus === 'PASSED' ? (
                              <span className="text-xs text-(--color-2)">✓</span>
                            ) : nodeStatus === 'APPROACHING' ? (
                              <span className="text-xs text-(--color-6)">NEXT</span>
                            ) : (
                              <span className="text-xs text-(--color-2)">{Math.round(nodeThreshold - progress)}%</span>
                            )}
                          </div>
                        </div>
                      );
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

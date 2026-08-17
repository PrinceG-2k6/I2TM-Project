import React from 'react';
import { useTraffic } from '../../../context/TrafficContext';
import { getEmergencyFromCorridors } from '../../../utils/trafficUtils';
import { Siren, Flame, Navigation2, CheckCircle2, Clock, Map as MapIcon } from 'lucide-react';

const VEHICLE_ICON_MAP = {
  AMBULANCE: Siren,
  FIRE: Flame
};

const AmbulanceRouteInsights = ({ vehicleId }) => {
  const [data, setData] = React.useState(null);

  React.useEffect(() => {
    if (!vehicleId) return;
    const fetchRouteData = async () => {
      try {
        const { fetchAPI } = await import('../../../utils/api');
        const res = await fetchAPI(`/ambulance/routes/${vehicleId}`);
        setData(res);
      } catch(e) {
        // silently fail if no data
      }
    };
    fetchRouteData();
    const int = setInterval(fetchRouteData, 10000);
    return () => clearInterval(int);
  }, [vehicleId]);

  if (!data) return null;

  return (
    <div className="mt-4 pt-3 border-t border-(--color-3) flex flex-col gap-2">
      <div className="text-xs font-semibold text-(--color-2) flex items-center gap-1.5">
        <Navigation2 size={12} /> AI Route Analysis
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="bg-(--color-5) p-2 rounded-sm border border-(--color-3)">
          <div className="text-(--color-2) mb-0.5">Route Risk</div>
          <div className="font-mono">{data.risk_score ? (data.risk_score * 100).toFixed(1) : 'N/A'}%</div>
        </div>
        <div className="bg-(--color-5) p-2 rounded-sm border border-(--color-3)">
          <div className="text-(--color-2) mb-0.5">Estimated ETA</div>
          <div className="font-mono">{data.eta_minutes ? data.eta_minutes.toFixed(1) : '--'} mins</div>
        </div>
      </div>
      {data.alternate_routes && data.alternate_routes.length > 0 && (
        <div className="bg-(--color-5) p-2 rounded-sm border border-(--color-3) text-xs">
          <div className="text-(--color-2) mb-1">Alternate Route:</div>
          <div>{data.alternate_routes[0]}</div>
        </div>
      )}
    </div>
  );
};


export const GreenCorridorsView = () => {
  const { activeCorridors, triggerEmergencyCorridor, removeEmergencyCorridor, appConfig } = useTraffic();

  return (
    <div className="space-y-6">
      <div>
        <div>Active Green Corridors</div>
        <div className="text-sm text-(--color-2) mt-0.5">
          Monitoring of emergency vehicles on pre-empted routes.
        </div>
      </div>

      {/* Dispatch bar */}
      <div className="bg-(--color-4) rounded-sm p-3 flex items-center gap-3 flex-wrap">
        <span className="text-sm text-(--color-2)">Dispatch:</span>
        {appConfig && appConfig.EMERGENCY_PRESETS && Object.values(appConfig.EMERGENCY_PRESETS).map((preset) => {
          const IconComp = VEHICLE_ICON_MAP[preset.vehicleType] || Siren;
          return (
            <button
              key={preset.vehicleType}
              onClick={() => triggerEmergencyCorridor && triggerEmergencyCorridor(preset)}
              className="flex items-center gap-2 py-1.5 px-3 text-sm bg-(--color-5) border border-(--color-3) rounded-sm cursor-pointer transition-all duration-300 hover:border-(--color-6) hover:text-(--color-6)"
            >
              <IconComp size={16} />
              {preset.vehicleLabel}
            </button>
          );
        })}
      </div>

      {/* Corridor cards */}
      {activeCorridors.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-80 bg-(--color-4) border border-(--color-3) rounded-sm">
          <MapIcon size={24} color="#bfbfbd" className="mb-3" />
          <div className="text-sm mb-1">No Active Corridors</div>
          <div className="text-xs text-(--color-2) max-w-xs text-center">
            Traffic signals are in standard adaptive mode. Dispatch above to create a green corridor.
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {activeCorridors.map((corridor) => {
            const isArrived   = corridor.status === 'ARRIVED';
            const progress    = isArrived
              ? 100
              : Math.min(100, Math.max(5, ((corridor.etaSeconds - corridor.countdownSeconds) / corridor.etaSeconds) * 100));
            const IconComp    = VEHICLE_ICON_MAP[corridor.vehicleType] || Siren;
            const themeColor  = corridor.vehicleType === 'AMBULANCE' ? '#DC2626' : '#EA580C';

            return (
              <div
                key={corridor.id}
                className="bg-(--color-4) rounded-sm overflow-hidden"
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
                        <div className="text-xs text-(--color-2) mt-1.5">
                          {corridor.priorityTag || 'Priority 1'} · {corridor.id}
                        </div>
                      </div>
                    </div>

                    {/* ETA / Arrived */}
                    <div className="text-right">
                      {isArrived ? (
                        <div className="flex flex-col items-end gap-1">
                          <div className="flex items-center gap-1 text-green-700 text-sm">
                            <CheckCircle2 size={14} />
                            Arrived
                          </div>
                          <button
                            onClick={() => removeEmergencyCorridor(corridor.id)}
                            className="text-xs text-green-600 underline cursor-pointer bg-transparent border-none p-0"
                          >
                            Clear Corridor
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-end gap-1.5">
                          <div className="flex items-center gap-1.5 text-sm" style={{ color: themeColor }}>
                            <Clock size={14} className="animate-pulse-slow" />
                            {corridor.countdownSeconds}s ETA
                          </div>
                          <div className="text-xs text-(--color-2)">{corridor.distanceMeters}m away</div>
                          <button
                            onClick={async () => {
                              try {
                                await fetch('http://localhost:8000/api/v1/emergency/telemetry', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({
                                    ambulance_id: corridor.vehicleId,
                                    latitude: corridor.originPos.lat + (Math.random() * 0.001),
                                    longitude: corridor.originPos.lng + (Math.random() * 0.001),
                                    speed_kmh: 60,
                                    heading_degrees: 90,
                                    timestamp: new Date().toISOString()
                                  })
                                });
                                alert("Telemetry Ping Sent!");
                              } catch(e) {
                                alert("Failed to send telemetry: " + e.message);
                              }
                            }}
                            className="mt-1 px-2 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-white rounded border border-slate-700"
                          >
                            Simulate Telemetry Ping
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Route progress bar */}
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
                      />
                    </div>
                  </div>
                  
                  {/* AI Ambulance Route Insights */}
                  {!isArrived && corridor.vehicleId && (
                    <AmbulanceRouteInsights vehicleId={corridor.vehicleId} />
                  )}
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
                      const isPassed      = progress > nodeThreshold;
                      const isNext        = progress <= nodeThreshold && progress > (idx * (100 / corridor.pathNodes.length));
                      const nodeStatus    = isArrived || isPassed ? 'PASSED' : isNext ? 'APPROACHING' : 'UPCOMING';

                      return (
                        <div
                          key={idx}
                          className={`flex items-center gap-3 p-2.5 rounded-sm ${nodeStatus === 'APPROACHING' ? 'bg-(--color-5) border border-(--color-6)' : 'bg-(--color-5)'}`}
                        >
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
                              <span className="text-sm text-(--color-2)">Passed</span>
                            ) : nodeStatus === 'APPROACHING' ? (
                              <span className="text-xs text-(--color-6)">Next</span>
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

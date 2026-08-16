import { useMemo } from 'react';
import { AccidentHazardBanner } from '../AccidentHazardBanner';
import { CongestionAlerts } from '../CongestionAlerts';
import { useTraffic } from '../../../context/TrafficContext';
import { Badge } from '../../common/Badge';
import { Dropdown } from '../../common/Dropdown';
import { getEmergencyFromCorridors, getSignalHex } from '../../../utils/trafficUtils';
import { ArrowUpRight, Camera, Zap, GitFork, MapPin, Gauge } from 'lucide-react';

export const JunctionsView = ({ onNavigateTab }) => {
  const { approaches, activeCorridors, selectedJunction, setSelectedJunction, activeCity } = useTraffic();
  const emergency = getEmergencyFromCorridors(activeCorridors);

  const currentCityJunctions = useMemo(() => {
    return activeCity?.junctions || [];
  }, [activeCity]);

  const approachEntries = Object.entries(approaches);
  const totalVehicles = approachEntries.reduce((acc, [, a]) => acc + (a.vehicleCount || 0), 0);
  const avgDensity = approachEntries.length
    ? Math.round(approachEntries.reduce((acc, [, a]) => acc + (a.densityPct || 0), 0) / approachEntries.length)
    : 0;

  // Derive cameras for selected junction from live approach data
  const junctionCameras = useMemo(() => {
    if (!approaches.North) return [];
    return [
      { id: 'CAM-N', name: `${selectedJunction} North CCTV`, approach: 'North Approach', fovSector: '70° Sector Arc', detectionModel: 'YOLOv8 Dynamic Density',    activeVehicles: approaches.North.vehicleCount, densityPct: approaches.North.densityPct },
      { id: 'CAM-E', name: `${selectedJunction} East CCTV`,  approach: 'East Approach',  fovSector: '70° Sector Arc', detectionModel: 'YOLOv8 Swerve Risk AI',     activeVehicles: approaches.East.vehicleCount,  densityPct: approaches.East.densityPct  },
      { id: 'CAM-W', name: `${selectedJunction} West CCTV`,  approach: 'West Approach',  fovSector: '70° Sector Arc', detectionModel: 'YOLOv8 Multi-Class',         activeVehicles: approaches.West.vehicleCount,  densityPct: approaches.West.densityPct  },
      { id: 'CAM-S', name: `${selectedJunction} South CCTV`, approach: 'South Approach', fovSector: '70° Sector Arc', detectionModel: 'YOLOv8 Emergency Triage',    activeVehicles: approaches.South.vehicleCount, densityPct: approaches.South.densityPct }
    ];
  }, [approaches, selectedJunction]);

  return (
    <div className="space-y-6">
      {emergency.active && (
        <AccidentHazardBanner onNavigateGuards={() => onNavigateTab && onNavigateTab('guards')} />
      )}

      {/* Junction selector bar */}
      <div className="bg-(--color-4) rounded-sm py-2.5 px-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <GitFork size={16} color="#272727" />
          <span className="text-sm">{selectedJunction}</span>
          <span className="text-xs text-(--color-2) bg-(--color-5) border border-(--color-3) py-0.5 px-2 rounded-sm flex items-center gap-1">
            <MapPin size={11} />
            {activeCity?.name || '—'}
          </span>
        </div>
        <div className="w-72 shrink-0">
          <Dropdown
            options={currentCityJunctions.map((j) => ({ value: j, label: j }))}
            value={selectedJunction}
            onChange={(val) => setSelectedJunction(val)}
            isSearchable={true}
            placeholder="Search & select junction..."
          />
        </div>
      </div>

      <div className="flex gap-6 items-start">
        <div className="flex-1 min-w-0 flex flex-col gap-6">
          {/* Health & Load Metrics */}
          <div
            data-subsection="Junction Health & Load Metrics"
            className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3"
          >
            <div className="bg-(--color-5) border border-(--color-3) rounded-sm p-4 space-y-1">
              <div className="text-xs text-(--color-2) mb-1">Total Vehicles on Approaches</div>
              <div className="text-xl">
                {totalVehicles} <span className="text-sm text-(--color-2)">units</span>
              </div>
              <div className="text-xs text-(--color-2)">Capacity: 200 units across 4 lanes</div>
            </div>
            <div className="bg-(--color-5) border border-(--color-3) rounded-sm p-4 space-y-1">
              <div className="text-xs text-(--color-2) mb-1">Average Junction Density</div>
              <div className="flex items-baseline gap-2">
                <span className={`text-xl ${avgDensity > 70 ? 'text-red-600' : 'text-(--color-1)'}`}>
                  {avgDensity}%
                </span>
                <Badge variant={avgDensity > 75 ? 'critical' : avgDensity > 50 ? 'degraded' : 'healthy'} size="sm">
                  {avgDensity > 75 ? 'High Congestion' : avgDensity > 0 ? 'Moderate Flow' : 'No Data'}
                </Badge>
              </div>
              <div className="text-xs text-(--color-2) mt-1">Optimized via AI density allocation</div>
            </div>
            <div
              onClick={() => onNavigateTab && onNavigateTab('guards')}
              className={`border rounded-sm p-4 cursor-pointer transition-all duration-150 space-y-1 ${emergency.active ? 'bg-red-50 border-red-300' : 'bg-(--color-5) border-(--color-3)'}`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={`text-xs ${emergency.active ? 'text-red-600' : 'text-(--color-2)'}`}>Emergency Corridor</span>
                <ArrowUpRight size={14} color={emergency.active ? '#DC2626' : '#272727'} />
              </div>
              <div className={`text-sm ${emergency.active ? 'text-red-600' : ''}`}>
                {emergency.active ? `ACTIVE (${emergency.countdownSeconds}s)` : 'Standby / Ready'}
              </div>
              <div className={`text-xs mt-1 ${emergency.active ? 'text-red-700' : 'text-(--color-2)'}`}>
                {emergency.active
                  ? `${emergency.vehicleLabel || 'Emergency Vehicle'} ${emergency.vehicleId || ''} cleared`
                  : 'Trigger from Green Corridors tab'}
              </div>
            </div>
          </div>

          {/* Alert Stream */}
          <div data-subsection="Active Operational Alerts">
            <CongestionAlerts />
          </div>

          {/* Cameras & Signals Telemetry */}
          <div data-subsection="Cameras & Signal Telemetry" className="grid grid-cols-[repeat(auto-fit,minmax(340px,1fr))] gap-6">
            {/* Camera panel */}
            <div className="bg-(--color-4) rounded-sm p-4 h-fit">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Camera size={15} color="#272727" />
                  <span className="text-sm">Camera Coverage</span>
                </div>
                <Badge variant="healthy" size="sm">{junctionCameras.length} CCTV Wedges</Badge>
              </div>
              {junctionCameras.length === 0 ? (
                <div className="text-xs text-(--color-2) py-6 text-center">No approach data available</div>
              ) : (
                <div className="flex flex-col gap-2">
                  {junctionCameras.map((cam) => (
                    <div key={cam.id} className="py-2.5 px-3 bg-(--color-5) rounded-sm flex justify-between">
                      <div>
                        <div className="text-sm mb-2">{cam.name}</div>
                        <div className="text-xs text-(--color-2) mb-1">{cam.approach} • {cam.fovSector}</div>
                        <div className="text-xs text-(--color-2) mt-0.5">AI: {cam.detectionModel}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm mb-1">{cam.activeVehicles} units</div>
                        <div className="text-xs text-(--color-2)">{cam.densityPct}% load</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Signal panel */}
            <div className="bg-(--color-4) rounded-sm p-4 h-fit">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Zap size={15} color="#272727" />
                  <span className="text-sm">Traffic Signals</span>
                </div>
                <Badge variant={emergency?.active ? 'critical' : 'healthy'} size="sm">
                  {emergency?.active ? 'Corridor Pre-Cleared' : '4-Phase Adaptive'}
                </Badge>
              </div>
              {approachEntries.length === 0 ? (
                <div className="text-xs text-(--color-2) py-6 text-center">No approach data available</div>
              ) : (
                <div className="flex flex-col gap-2">
                  {approachEntries.map(([appKey, appData]) => {
                    const hex = getSignalHex(appData.currentLight);
                    return (
                      <div key={appKey} className="py-2.5 px-3 bg-(--color-5) rounded-sm flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <span style={{ backgroundColor: hex }} className="w-2.5 h-2.5 rounded-full shrink-0" />
                          <div>
                            <div className="text-sm mb-1.5">{appData.name}</div>
                            <div className="text-xs text-(--color-2)">{appData.vehicleCount} vehicles • {appData.densityPct}% load</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm" style={{ color: hex }}>{appData.currentLight} ({appData.greenSec}s)</div>
                          <div className="text-xs text-(--color-2)">{appData.avgSpeed} km/h</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right sidebar: signal grid + density bars */}
        <div className="w-72 shrink-0 space-y-6">
          {/* Signal grid */}
          <div className="bg-(--color-4) rounded-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Zap size={15} color="#272727" />
                <div className="text-sm">Traffic Signals</div>
              </div>
              {emergency?.active && <span className="text-xs text-red-600">Override</span>}
            </div>
            {approachEntries.length === 0 ? (
              <div className="text-xs text-(--color-2) py-4 text-center">No approach data</div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {approachEntries.map(([dir, app]) => {
                  const isGreen = app.currentLight === 'GREEN';
                  const isAmber = app.currentLight === 'AMBER';
                  return (
                    <div key={dir} className="bg-(--color-5) rounded-sm p-2.5 text-center">
                      <div className="text-xs text-(--color-2) mb-2">{dir}</div>
                      <div className="inline-flex flex-col gap-1 bg-slate-800 py-1.5 px-2 rounded-lg mb-2">
                        <div className={`w-3 h-3 rounded-full ${(!isGreen && !isAmber) ? 'bg-red-500' : 'bg-slate-700'}`} />
                        <div className={`w-3 h-3 rounded-full ${isAmber ? 'bg-amber-500' : 'bg-slate-700'}`} />
                        <div className={`w-3 h-3 rounded-full ${isGreen ? 'bg-green-500' : 'bg-slate-700'}`} />
                      </div>
                      <div className="text-xs">
                        <span className={`${isGreen ? 'text-green-700' : 'text-red-600'}`}>{app.currentLight}</span>
                        <span className="ml-0.5 text-(--color-2)">({app.greenSec}s)</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Density bars */}
          <div className="bg-(--color-4) rounded-sm p-4">
            <div className="flex items-center gap-3 mb-3">
              <Gauge size={15} color="#272727" />
              <div className="text-sm">Traffic Density</div>
            </div>
            {approachEntries.length === 0 ? (
              <div className="text-xs text-(--color-2) py-4 text-center">No approach data</div>
            ) : (
              <div className="space-y-2">
                {approachEntries.map(([dir, data]) => {
                  const isCritical = data.densityPct >= 85;
                  const isHigh    = data.densityPct >= 65 && data.densityPct < 85;
                  const isMedium  = data.densityPct >= 40 && data.densityPct < 65;
                  const barColor    = isCritical ? '#DC2626' : isHigh ? '#EA580C' : isMedium ? '#F59E0B' : '#16A34A';
                  const statusLabel = isCritical ? 'CRITICAL' : isHigh ? 'HIGH' : isMedium ? 'MED' : 'LOW';
                  const lightHex    = getSignalHex(data.currentLight);
                  return (
                    <div key={dir} className="bg-(--color-5) rounded-sm py-2.5 px-3">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm">{dir}</span>
                        <span className="text-xs text-(--color-2)">{statusLabel}</span>
                      </div>
                      <div className="flex items-baseline gap-1 mb-1.5">
                        <span className="text-xl" style={{ color: barColor }}>{data.densityPct}%</span>
                        <span className="text-xs text-(--color-2)">density</span>
                      </div>
                      <div className="h-0.5 bg-(--color-3) rounded-full overflow-hidden mb-2">
                        <div style={{ width: `${data.densityPct}%`, backgroundColor: barColor }} className="h-full rounded-full transition-all duration-500 ease-out" />
                      </div>
                      <div className="flex items-center justify-between text-xs text-(--color-2)">
                        <span>{data.vehicleCount} vehicles</span>
                        <span className="flex items-center gap-1" style={{ color: lightHex }}>
                          <span style={{ backgroundColor: lightHex }} className="w-1.5 h-1.5 rounded-full inline-block" />
                          {data.currentLight} ({data.greenSec}s)
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JunctionsView;

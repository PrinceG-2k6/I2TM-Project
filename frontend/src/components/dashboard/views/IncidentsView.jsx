import React from 'react';
import { useTraffic } from '../../../context/TrafficContext';
import { getEmergencyFromCorridors } from '../../../utils/trafficUtils';
import { Check, Car, AlertTriangle, Siren, Cpu, CircleDot } from 'lucide-react';

const TYPE_CONFIG = {
  CONGESTION:     { label: 'Congestion',      color: '#DC2626', Icon: Car          },
  RISKY_MOVEMENT: { label: 'Risky Movement',  color: '#EA580C', Icon: AlertTriangle },
  EMERGENCY:      { label: 'Emergency',       color: '#7C3AED', Icon: Siren        },
  SYSTEM:         { label: 'System',          color: '#0284C7', Icon: Cpu          },
  SIGNAL:         { label: 'Signal Override', color: '#D97706', Icon: CircleDot    }
};

const SEVERITY_DOT = {
  CRITICAL: '#DC2626',
  WARNING:  '#F59E0B',
  HEALTHY:  '#16A34A'
};

const relTime = (timeStr) => {
  const now = new Date();
  const [h, m] = (timeStr || '').split(':').map(Number);
  const diff = Math.max(0, now.getHours() * 60 + now.getMinutes() - (h * 60 + m));
  if (diff === 0) return 'Just now';
  if (diff < 60) return `${diff}m ago`;
  return `${Math.floor(diff / 60)}h ${diff % 60}m ago`;
};

export const IncidentsView = () => {
  const { alerts, activeCorridors, selectedJunctionId } = useTraffic();
  const emergency = getEmergencyFromCorridors(activeCorridors);
  const now = new Date();

  const [mlData, setMlData] = React.useState({ lane: null, risk: null, vms: null });

  React.useEffect(() => {
    if (!selectedJunctionId) return;
    const fetchMlData = async () => {
      try {
        const { fetchAPI } = await import('../../../utils/api');
        
        // We catch errors per request so one failure doesn't block the rest
        const laneReq = fetchAPI(`/lane-correction/${selectedJunctionId}`).catch(() => null);
        // Assuming risk pattern by junction id or default vehicle
        const riskReq = fetchAPI(`/risk-patterns/DL-TEST-001`).catch(() => null); 
        const vmsReq = fetchAPI(`/roadside-display/${selectedJunctionId}`).catch(() => null);

        const [lane, risk, vms] = await Promise.all([laneReq, riskReq, vmsReq]);
        setMlData({ lane, risk, vms });
      } catch(e) {
        console.error("Failed to fetch ML data", e);
      }
    };
    fetchMlData();
    const int = setInterval(fetchMlData, 10000); // refresh every 10s
    return () => clearInterval(int);
  }, [selectedJunctionId]);

  const feed = [...(alerts || [])];
  if (emergency.active) {
    feed.unshift({
      id: 'EMG-LIVE',
      time: `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`,
      title: `Green Corridor ACTIVE — ${emergency.vehicleLabel || 'Emergency Vehicle'} en route`,
      description: `${emergency.vehicleId || ''} clearing East Arterial. All signals forced GREEN. ${emergency.countdownSeconds}s remaining.`,
      severity: 'CRITICAL',
      type: 'EMERGENCY',
      author: 'SARATHI AI',
      role: 'Emergency Engine',
      tags: ['Emergency', 'Corridor'],
      live: true
    });
  }

  return (
    <div className="w-full space-y-6">
      
      {/* Suraj ML Module Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-(--color-4) border border-(--color-3) p-4 rounded-sm">
          <div className="text-sm font-semibold mb-2 text-orange-400">Lane Violations</div>
          {mlData.lane ? (
             <div className="text-xs text-(--color-2)">
               Violation Type: {mlData.lane.violation_type}<br/>
               Correction: {mlData.lane.correction_instruction}
             </div>
          ) : <div className="text-xs text-(--color-2)">No active violations</div>}
        </div>
        <div className="bg-(--color-4) border border-(--color-3) p-4 rounded-sm">
          <div className="text-sm font-semibold mb-2 text-purple-400">Risk Patterns</div>
          {mlData.risk ? (
             <div className="text-xs text-(--color-2)">
               Risk Score: {mlData.risk.risk_score}<br/>
               Category: {mlData.risk.risk_category}
             </div>
          ) : <div className="text-xs text-(--color-2)">No high-risk patterns detected</div>}
        </div>
        <div className="bg-(--color-4) border border-(--color-3) p-4 rounded-sm">
          <div className="text-sm font-semibold mb-2 text-blue-400">Roadside VMS Display</div>
          {mlData.vms ? (
             <div className="text-xs text-(--color-2)">
               Message: {mlData.vms.display_message}<br/>
               Priority: {mlData.vms.message_priority}
             </div>
          ) : <div className="text-xs text-(--color-2)">VMS Offline</div>}
        </div>
      </div>

      <div className="flex items-center justify-between mb-2">
        <div>Live Incident Feed</div>
        <div className="text-sm text-(--color-2)">
          {feed.length} active incident{feed.length !== 1 ? 's' : ''}
        </div>
      </div>
      <div className="bg-(--color-4) rounded-sm p-4 space-y-4">
        {feed.length === 0 ? (
          <div className="p-3 min-h-80 text-center text-(--color-2) flex flex-col items-center justify-center gap-2.5">
            <div className="h-fit aspect-square rounded-sm p-3 bg-(--color-5)">
              <Check size={42} />
            </div>
            <div className="text-xl">All clear</div>
            <div className="text-sm mt-1">No active incidents at this time.</div>
          </div>
        ) : (
          feed.map((incident) => {
            const tc  = TYPE_CONFIG[incident.type] || TYPE_CONFIG.SYSTEM;
            const dot = SEVERITY_DOT[incident.severity] || '#16A34A';
            return (
              <div
                key={incident.id}
                className="flex items-start gap-4 p-4 bg-(--color-5) rounded-sm"
                style={{ border: `1px solid ${dot}` }}
              >
                <div className="w-8 h-8 shrink-0 rounded-sm bg-(--color-5) border border-(--color-3) flex items-center justify-center">
                  <tc.Icon size={16} color="var(--color-2)" />
                </div>
                <div className="flex-1 min-w-0 space-y-3">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="text-xs" style={{ color: dot }}>{incident.severity}</span>
                    <span className="text-xs text-(--color-2)">{tc.label}</span>
                    {incident.live && <span className="text-xs text-red-600 animate-pulse-slow">● Live</span>}
                    <span className="text-xs text-(--color-2) ml-auto">{incident.id} · {relTime(incident.time)}</span>
                  </div>
                  <div className="space-y-1">
                    <div className="leading-snug">{incident.title}</div>
                    <div className="text-sm text-(--color-2) leading-relaxed">{incident.description}</div>
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {(incident.tags || []).map((tag) => (
                      <span key={tag} className="text-xs text-(--color-2) bg-(--color-5) border border-(--color-3) py-0.5 px-2 rounded-full">
                        {tag}
                      </span>
                    ))}
                    <span className="ml-auto text-xs text-(--color-2)">{incident.author} · {incident.role}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

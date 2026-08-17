import React, { useState, useEffect } from 'react';
import { useTraffic } from '../../../context/TrafficContext';
import { Cpu, Activity, AlertTriangle, MessageSquare, Zap, Clock, ChevronRight } from 'lucide-react';

export const AiInsightsView = () => {
  const { selectedJunctionId, appConfig, activeCorridors } = useTraffic();

  const [mlData, setMlData] = useState({ lane: null, risk: null, vms: null, recommendation: null });
  const [historyData, setHistoryData] = useState(null);
  const [historyType, setHistoryType] = useState(null); // 'lane', 'risk', 'vms', 'recommendation'
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    if (!selectedJunctionId) return;
    const fetchMlData = async () => {
      try {
        const { fetchAPI } = await import('../../../utils/api');
        
        const laneReq = fetchAPI(`/lane-correction/${selectedJunctionId}`).catch(() => null);
        const riskVehicleId = activeCorridors?.[0]?.vehicleId || appConfig?.EMERGENCY_PRESETS?.AMBULANCE?.vehicleId || 'DL-TEST-001';
        const riskReq = fetchAPI(`/risk-patterns/${riskVehicleId}`).catch(() => null);
        const vmsReq = fetchAPI(`/roadside-display/${selectedJunctionId}`).catch(() => null);
        
        // Let's fetch recommendation if available. The endpoint returns a list of history, but let's grab the latest.
        const recReq = fetchAPI(`/traffic/recommendations/${selectedJunctionId}`).catch(() => null);

        const [lane, risk, vms, recList] = await Promise.all([laneReq, riskReq, vmsReq, recReq]);
        
        setMlData({ 
          lane, 
          risk, 
          vms,
          recommendation: (recList && recList.length > 0) ? recList[0] : null
        });
      } catch(e) {
        console.error("Failed to fetch ML data", e);
      }
    };
    
    fetchMlData();
    const int = setInterval(fetchMlData, 10000); // refresh every 10s
    return () => clearInterval(int);
  }, [selectedJunctionId]);

  const loadHistory = async (type) => {
    if (!selectedJunctionId) return;
    if (historyType === type) {
      // Toggle off
      setHistoryType(null);
      setHistoryData(null);
      return;
    }
    
    setHistoryType(type);
    setLoadingHistory(true);
    setHistoryData(null);
    
    try {
      const { fetchAPI } = await import('../../../utils/api');
      let data = [];
      
      if (type === 'lane') {
        data = await fetchAPI(`/lane-correction/${selectedJunctionId}/history`);
      } else if (type === 'risk') {
        const riskVehicleId = activeCorridors?.[0]?.vehicleId || appConfig?.EMERGENCY_PRESETS?.AMBULANCE?.vehicleId || 'DL-TEST-001';
        data = await fetchAPI(`/risk-patterns/${riskVehicleId}/history`);
      } else if (type === 'vms') {
        data = await fetchAPI(`/roadside-display/${selectedJunctionId}/history`);
      } else if (type === 'recommendation') {
        data = await fetchAPI(`/traffic/recommendations/${selectedJunctionId}`); // This endpoint already returns history list
      }
      
      setHistoryData(data || []);
    } catch(e) {
      console.error(`Failed to fetch history for ${type}`, e);
      setHistoryData([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  const renderHistory = (type) => {
    if (historyType !== type) return null;
    
    return (
      <div className="mt-4 pt-4 border-t border-(--color-3) text-sm animate-in slide-in-from-top-2 fade-in duration-200">
        <div className="flex items-center gap-2 mb-3 text-(--color-2)">
          <Clock size={14} />
          <span>Historical Trends</span>
        </div>
        
        {loadingHistory ? (
          <div className="text-xs text-(--color-2) animate-pulse">Loading history...</div>
        ) : historyData && historyData.length > 0 ? (
          <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
            {historyData.map((item, idx) => (
              <div key={idx} className="bg-(--color-5) p-2 rounded-sm border border-(--color-3) text-xs flex justify-between items-start">
                <div>
                  {type === 'lane' && <span>{item.violation_type} &rarr; {item.correction_instruction}</span>}
                  {type === 'risk' && <span>Score: {item.risk_score} ({item.risk_category})</span>}
                  {type === 'vms' && <span>"{item.display_message}" ({item.message_priority})</span>}
                  {type === 'recommendation' && <span>{item.action}: {item.green_time_change}s ({item.priority})</span>}
                </div>
                <div className="text-(--color-2) shrink-0 ml-4">
                  {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-xs text-(--color-2)">No historical data available.</div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full space-y-6">
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-lg">
          <Cpu className="text-indigo-500" />
          <span>AI Engine Insights</span>
        </div>
        <div className="text-sm text-(--color-2)">
          {selectedJunctionId ? `Monitoring Junction: ${selectedJunctionId}` : 'Awaiting Junction Data'}
        </div>
      </div>

      {!selectedJunctionId ? (
        <div className="p-8 text-center text-(--color-2) bg-(--color-4) rounded-sm border border-(--color-3)">
          Please select a junction from the map to view AI insights.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Signal Optimization Recommendation */}
          <div className="bg-(--color-4) border border-(--color-3) p-5 rounded-sm flex flex-col transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 font-semibold text-indigo-400">
                <Zap size={18} />
                Signal Optimization
              </div>
              <button 
                onClick={() => loadHistory('recommendation')}
                className={`text-xs flex items-center gap-1 cursor-pointer transition-colors px-2 py-1 rounded-sm ${historyType === 'recommendation' ? 'bg-(--color-5) text-indigo-400' : 'text-(--color-2) hover:text-(--color-1)'}`}
              >
                History <ChevronRight size={12} className={`transform transition-transform ${historyType === 'recommendation' ? 'rotate-90' : ''}`} />
              </button>
            </div>
            
            {mlData.recommendation ? (
              <div className="flex-1 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-(--color-2)">Action:</span>
                    <span className="bg-(--color-5) border border-(--color-3) px-2 py-0.5 rounded-sm">{mlData.recommendation.action}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-(--color-2)">Timing Adjustment:</span>
                    <span className={mlData.recommendation.green_time_change > 0 ? "text-emerald-500" : "text-amber-500"}>
                      {mlData.recommendation.green_time_change > 0 ? '+' : ''}{mlData.recommendation.green_time_change}s
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-(--color-2)">Priority:</span>
                    <span>{mlData.recommendation.priority}</span>
                  </div>
                  <div className="text-sm mt-2 p-2 bg-(--color-5) border border-(--color-3) rounded-sm">
                    <span className="text-(--color-2) block mb-1 text-xs">Reason:</span>
                    {mlData.recommendation.reason}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-sm text-(--color-2) flex-1 flex items-center">No active signal optimizations required.</div>
            )}
            {renderHistory('recommendation')}
          </div>

          {/* Lane Violations */}
          <div className="bg-(--color-4) border border-(--color-3) p-5 rounded-sm flex flex-col transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 font-semibold text-orange-400">
                <Activity size={18} />
                Lane Analysis
              </div>
              <button 
                onClick={() => loadHistory('lane')}
                className={`text-xs flex items-center gap-1 cursor-pointer transition-colors px-2 py-1 rounded-sm ${historyType === 'lane' ? 'bg-(--color-5) text-orange-400' : 'text-(--color-2) hover:text-(--color-1)'}`}
              >
                History <ChevronRight size={12} className={`transform transition-transform ${historyType === 'lane' ? 'rotate-90' : ''}`} />
              </button>
            </div>
            
            {mlData.lane ? (
              <div className="flex-1 space-y-3 text-sm">
                 <div className="flex justify-between">
                   <span className="text-(--color-2)">Violation Type:</span>
                   <span>{mlData.lane.violation_type}</span>
                 </div>
                 <div className="p-2 bg-(--color-5) border border-(--color-3) rounded-sm mt-2">
                   <span className="text-(--color-2) block mb-1 text-xs">Correction Strategy:</span>
                   {mlData.lane.correction_instruction}
                 </div>
              </div>
            ) : <div className="text-sm text-(--color-2) flex-1 flex items-center">No active violations detected.</div>}
            {renderHistory('lane')}
          </div>

          {/* Risk Patterns */}
          <div className="bg-(--color-4) border border-(--color-3) p-5 rounded-sm flex flex-col transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 font-semibold text-purple-400">
                <AlertTriangle size={18} />
                Risk Patterns
              </div>
              <button 
                onClick={() => loadHistory('risk')}
                className={`text-xs flex items-center gap-1 cursor-pointer transition-colors px-2 py-1 rounded-sm ${historyType === 'risk' ? 'bg-(--color-5) text-purple-400' : 'text-(--color-2) hover:text-(--color-1)'}`}
              >
                History <ChevronRight size={12} className={`transform transition-transform ${historyType === 'risk' ? 'rotate-90' : ''}`} />
              </button>
            </div>
            
            {mlData.risk ? (
              <div className="flex-1 space-y-3 text-sm">
                 <div className="flex justify-between">
                   <span className="text-(--color-2)">Risk Category:</span>
                   <span>{mlData.risk.risk_category}</span>
                 </div>
                 <div className="flex justify-between">
                   <span className="text-(--color-2)">Confidence Score:</span>
                   <span>{(mlData.risk.risk_score * 100).toFixed(1)}%</span>
                 </div>
                 <div className="p-2 bg-(--color-5) border border-(--color-3) rounded-sm mt-2">
                   <span className="text-(--color-2) block mb-1 text-xs">Analysis:</span>
                   {mlData.risk.action_required}
                 </div>
              </div>
            ) : <div className="text-sm text-(--color-2) flex-1 flex items-center">No high-risk patterns detected.</div>}
            {renderHistory('risk')}
          </div>

          {/* Roadside VMS Display */}
          <div className="bg-(--color-4) border border-(--color-3) p-5 rounded-sm flex flex-col transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 font-semibold text-blue-400">
                <MessageSquare size={18} />
                VMS Broadcast
              </div>
              <button 
                onClick={() => loadHistory('vms')}
                className={`text-xs flex items-center gap-1 cursor-pointer transition-colors px-2 py-1 rounded-sm ${historyType === 'vms' ? 'bg-(--color-5) text-blue-400' : 'text-(--color-2) hover:text-(--color-1)'}`}
              >
                History <ChevronRight size={12} className={`transform transition-transform ${historyType === 'vms' ? 'rotate-90' : ''}`} />
              </button>
            </div>
            
            {mlData.vms ? (
              <div className="flex-1 space-y-3 text-sm">
                 <div className="flex justify-between">
                   <span className="text-(--color-2)">Priority:</span>
                   <span>{mlData.vms.message_priority}</span>
                 </div>
                 <div className="p-3 bg-black text-amber-500 border border-neutral-700 rounded-sm mt-2 text-center font-mono">
                   {mlData.vms.display_message}
                 </div>
              </div>
            ) : <div className="text-sm text-(--color-2) flex-1 flex items-center">VMS display is currently offline or idle.</div>}
            {renderHistory('vms')}
          </div>

        </div>
      )}
    </div>
  );
};

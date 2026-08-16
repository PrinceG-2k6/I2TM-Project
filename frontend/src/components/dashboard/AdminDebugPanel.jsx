import React, { useState } from 'react';
import { useTraffic } from '../../context/TrafficContext';
import { fetchAPI } from '../../utils/api';
import { Bug, Activity, ShieldAlert, Cpu } from 'lucide-react';

export const AdminDebugPanel = () => {
  const { selectedJunctionId, runSimulation } = useTraffic();
  const [isOpen, setIsOpen] = useState(false);

  const handleSeedDatabase = async () => {
    try {
      await fetchAPI('/junctions', {
        method: 'POST',
        body: JSON.stringify({
          name: "Test Debug Junction",
          latitude: 28.5672,
          longitude: 77.2100,
          roads: ["Main St"],
          lanes: 4
        })
      });
      alert("Database seeded! Refresh the page to load new junctions.");
    } catch (err) {
      alert("Seed failed: " + err.message);
    }
  };

  const handleSimulateML = async () => {
    if (!selectedJunctionId) return alert("Select a junction first");
    try {
      await fetchAPI('/ml/traffic-frame', {
        method: 'POST',
        body: JSON.stringify({
          frame_id: Math.floor(Math.random() * 1000),
          junction_id: selectedJunctionId,
          timestamp: new Date().toISOString(),
          source: "CAMERA_1",
          camera_id: "CAM-01",
          detections: [],
          direction_analytics: {
            "NORTH": { vehicle_count: 55, density_ratio: 0.9, density_level: "CRITICAL", average_speed_kmh: 12.0, queue_length_meters: 150.0, flow_rate_veh_per_min: 15.0, occupancy_percent: 90.0 }
          },
          aggregate_stats: { total_vehicles: 55, avg_speed_kmh: 12.0, max_density_direction: "NORTH", overall_congestion_score: 9.0, overall_congestion_level: "CRITICAL", active_tracks: 55, new_tracks_this_frame: 10, lost_tracks_this_frame: 0 },
          frame_metadata: { resolution: { width: 1920, height: 1080 }, inference_time_ms: 15.5, tracking_time_ms: 5.0, total_processing_time_ms: 25.0, model_name: "YOLOv8-Test", tracker: "ByteTrack" }
        })
      });
      alert("ML Frame injected!");
    } catch (err) {
      alert("ML Injection failed: " + err.message);
    }
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-slate-900 text-white p-3 rounded-full shadow-lg hover:bg-slate-800 transition-colors z-50 flex items-center justify-center border border-slate-700"
      >
        <Bug size={24} className="text-emerald-400" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-4 w-80 z-50 text-slate-300">
      <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-2">
        <h3 className="font-semibold text-emerald-400 flex items-center gap-2">
          <Cpu size={18} />
          Admin Debug Panel
        </h3>
        <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white">✕</button>
      </div>
      
      <div className="space-y-3">
        <button onClick={handleSeedDatabase} className="w-full text-left p-2 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 transition flex items-center gap-2">
          <ShieldAlert size={16} /> Seed Database (Add Junction)
        </button>
        <button onClick={() => runSimulation("CRITICAL")} className="w-full text-left p-2 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 transition flex items-center gap-2">
          <Activity size={16} className="text-red-400"/> Trigger CRITICAL Simulation
        </button>
        <button onClick={() => runSimulation("NORMAL")} className="w-full text-left p-2 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 transition flex items-center gap-2">
          <Activity size={16} className="text-green-400"/> Trigger NORMAL Simulation
        </button>
        <button onClick={handleSimulateML} className="w-full text-left p-2 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 transition flex items-center gap-2">
          <Cpu size={16} className="text-purple-400"/> Inject Fake ML Payload
        </button>
      </div>
    </div>
  );
};

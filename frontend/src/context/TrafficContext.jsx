import React, { createContext, useContext, useState, useEffect, useRef, useMemo } from 'react';
import { fetchAPI, getWebSocketUrl } from '../utils/api';
import {
  INDIAN_CITIES,
  EMERGENCY_PRESETS,
  INITIAL_APPROACHES,
  INITIAL_CORRIDORS,
  INITIAL_ALERTS,
  DEFAULT_PATH_NODES
} from '../data/dummyData';

const TrafficContext = createContext(null);

export const TrafficProvider = ({ children }) => {
  // --- Backend Data State ---
  const [backendJunctions, setBackendJunctions] = useState([]);
  const [selectedJunctionId, setSelectedJunctionId] = useState(null);
  
  // Real-time backend state
  const [dashboardData, setDashboardData] = useState(null);
  const wsRef = useRef(null);

  // Active City & Location State
  const [activeCity, setActiveCity] = useState(INDIAN_CITIES[0]);
  const [cityCenter, setCityCenter] = useState(INDIAN_CITIES[0].center);

  // Layer Visibility Toggles
  const [showCameras, setShowCameras] = useState(true);
  const [showSignals, setShowSignals] = useState(true);
  const [showCorridor, setShowCorridor] = useState(true);

  // Junction & Simulation Mode
  const [selectedJunction, setSelectedJunction] = useState(''); // Keep string for UI compat initially
  const [isLiveSimulating, setIsLiveSimulating] = useState(true);

  //  const [alerts, setAlerts] = useState([]);

  // Live Simulation / WebSockets State
  const [liveAmbulances, setLiveAmbulances] = useState({}); // { id: { position, route, progress } }
  const [liveMLStats, setLiveMLStats] = useState({}); // { device_id: { densityPct, activeVehicles, status } }

  useEffect(() => {
    // Setup WebSocket connection to backend
    const ws = new WebSocket(getWebSocketUrl('/ws/live-dashboard'));
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'AMBULANCE_DISPATCH') {
          setLiveAmbulances(prev => ({
            ...prev,
            [data.ambulance_id]: { route: data.route, position: data.route[0], status: data.status, progressPct: 0 }
          }));
        } else if (data.type === 'AMBULANCE_MOVE') {
          setLiveAmbulances(prev => {
            if (!prev[data.ambulance_id]) return prev;
            return {
              ...prev,
              [data.ambulance_id]: { ...prev[data.ambulance_id], position: data.position, progressPct: data.progressPct }
            };
          });
        } else if (data.type === 'AMBULANCE_ARRIVED') {
          setLiveAmbulances(prev => {
            const next = { ...prev };
            delete next[data.ambulance_id];
            return next;
          });
        } else if (data.type === 'ML_UPDATE') {
          setLiveMLStats(prev => ({
            ...prev,
            [data.device_id]: {
              densityPct: data.densityPct,
              activeVehicles: data.activeVehicles,
              status: data.status,
              message: data.message
            }
          }));
        } else if (data.type === 'NEW_ALERT') {
          setAlerts(prev => [data.alert, ...prev]);
        }
      } catch (e) {
        console.error("WebSocket parse error", e);
      }
    };
    
    return () => ws.close();
  }, []);

  const [activeMapElementId, setActiveMapElementId] = useState(null);

  // 4 Junction Approaches
  const [approaches, setApproaches] = useState(INITIAL_APPROACHES);

  // Emergency Green Corridors
  const [activeCorridors, setActiveCorridors] = useState([]);

  // Master Alert List
  const [alerts, setAlerts] = useState([]);

  // Filters State
  const [filters, setFilters] = useState({
    userRole: 'All users',
    featureStatus: 'All features',
    serviceStatus: 'All service',
    tags: [],
    severity: 'All',
    searchQuery: ''
  });

  const [suggestions, setSuggestions] = useState([]);

  // ---------------------------------------------------------------------------
  // Backend Integration: Fetch Junctions
  // ---------------------------------------------------------------------------
  const [rawEquipmentList, setRawEquipmentList] = useState([]);

  // Merge live ML stats into equipment
  const equipmentList = useMemo(() => {
    if (!liveMLStats || Object.keys(liveMLStats).length === 0) return rawEquipmentList;
    return rawEquipmentList.map(eq => {
      const live = liveMLStats[eq.device_id];
      if (live) {
        return {
          ...eq,
          status: live.status || eq.status,
          live_vehicles: live.activeVehicles !== undefined ? live.activeVehicles : eq.live_vehicles,
          density_pct: live.densityPct !== undefined ? live.densityPct : eq.density_pct,
          ml_message: live.message
        };
      }
      return eq;
    });
  }, [rawEquipmentList, liveMLStats]);

  const loadJunctions = async () => {
    try {
      const data = await fetchAPI('/junctions');
      setBackendJunctions(data);
      if (data && data.length > 0) {
        setSelectedJunctionId(data[0].id);
        setSelectedJunction(data[0].name);
      }
    } catch (err) {
      console.error("Failed to load backend junctions:", err);
    }
  };

  useEffect(() => {
    loadJunctions();
  }, []);

  // ---------------------------------------------------------------------------
  // Backend Integration: WebSockets for Dashboard
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!selectedJunctionId) return;

    // Close existing connection
    if (wsRef.current) {
      wsRef.current.close();
    }

    const wsUrl = getWebSocketUrl(`/simulation/live/${selectedJunctionId}`);
    const ws = new WebSocket(wsUrl);
    
    ws.onopen = () => {
      console.log(`Connected to Live Dashboard for junction: ${selectedJunctionId}`);
      ws.send("snapshot"); // Request initial data
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setDashboardData(data);
        
        // Map backend density data to frontend approaches
        if (data.density && data.density.densities) {
           const newApproaches = { ...approaches };
           data.density.densities.forEach(d => {
             const key = d.direction === "NORTH" ? "North" :
                         d.direction === "SOUTH" ? "South" :
                         d.direction === "EAST" ? "East" :
                         d.direction === "WEST" ? "West" : null;
             if (key && newApproaches[key]) {
               newApproaches[key].vehicleCount = d.vehicle_count;
               newApproaches[key].densityPct = Math.round(d.density * 100);
               newApproaches[key].status = d.density_level;
             }
           });
           setApproaches(newApproaches);
        }

        // Map backend alerts to frontend alerts
        if (data.congestion_alerts) {
           const mappedAlerts = data.congestion_alerts.map(a => ({
             id: a.id,
             time: new Date(a.created_at).toLocaleTimeString(),
             title: a.message,
             description: `Score: ${a.congestion_score}. Queue: ${a.queue_length}m. Speed: ${a.average_speed}km/h`,
             severity: a.congestion_level === 'CRITICAL' ? 'CRITICAL' : a.congestion_level === 'WARNING' ? 'WARNING' : 'HEALTHY',
             type: 'CONGESTION',
             author: 'Backend AI',
             role: 'System',
             feature: 'Density Tracking',
             service: 'Backend API',
             tags: ['Backend', a.direction]
           }));
           setAlerts(mappedAlerts);
        }

      } catch (err) {
        console.error("Error parsing websocket message", err);
      }
    };

    ws.onerror = (err) => console.error("WebSocket error:", err);
    wsRef.current = ws;

    return () => {
      ws.close();
    };
  }, [selectedJunctionId]);




  const handleSelectJunction = (juncName) => {
    setSelectedJunction(juncName);
    const backendMatch = backendJunctions.find(j => j.name === juncName);
    if (backendMatch) {
      setSelectedJunctionId(backendMatch.id);
    }
  };

  // ---------------------------------------------------------------------------
  // Backend Integration: Green Corridor Actions
  // ---------------------------------------------------------------------------
  const triggerEmergencyCorridor = async (preset) => {
    if (!selectedJunctionId) return;
    const vehiclePreset = EMERGENCY_PRESETS[preset?.vehicleType] || EMERGENCY_PRESETS.AMBULANCE;
    
    try {
       const payload = {
         ambulance_id: vehiclePreset.vehicleId,
         route: [selectedJunctionId],
         upcoming_junctions: [{ junction_id: selectedJunctionId, priority_direction: "EAST" }],
         destination: vehiclePreset.destination
       };
       const data = await fetchAPI('/green-corridor/activate', { method: 'POST', body: JSON.stringify(payload) });
       
       const newCorridor = {
         id: data.id,
         active: true,
         status: 'IN_TRANSIT',
         vehicleType: vehiclePreset.vehicleType,
         vehicleLabel: vehiclePreset.vehicleLabel,
         vehicleIcon: vehiclePreset.vehicleIcon,
         vehicleId: vehiclePreset.vehicleId,
         patientSeverity: 'CRITICAL',
         etaSeconds: 120,
         countdownSeconds: 120,
         destination: payload.destination,
         origin: 'Backend Activated',
         distanceMeters: vehiclePreset.distanceMeters,
         routeCongestionPct: 0,
         roadsideMessage: `Green corridor active for ${vehiclePreset.vehicleId}`,
         targetApproach: 'East Commercial Arterial',
         originPos: { lat: cityCenter.lat - 0.0080, lng: cityCenter.lng - 0.0012 },
         destPos: { lat: cityCenter.lat + 0.0006, lng: cityCenter.lng + 0.0008 },
         pathNodes: DEFAULT_PATH_NODES,
         progressPct: 15
       };
       setActiveCorridors(prev => [newCorridor, ...prev]);
    } catch (err) {
       console.error("Failed to trigger corridor on backend:", err);
    }
  };

  const removeEmergencyCorridor = async (corridorId) => {
    try {
      await fetchAPI(`/green-corridor/deactivate/${corridorId}`, { method: 'POST' });
      setActiveCorridors((prev) => prev.filter((c) => c.id !== corridorId));
    } catch (err) {
      console.error("Failed to deactivate corridor:", err);
      // Fallback UI remove
      setActiveCorridors((prev) => prev.filter((c) => c.id !== corridorId));
    }
  };

  const applySuggestion = (suggestionId) => {
    setSuggestions((prev) => prev.map((s) => (s.id === suggestionId ? { ...s, applied: true } : s)));
  };

  const clearAllFilters = () => {
    setFilters({ userRole: 'All users', featureStatus: 'All features', serviceStatus: 'All service', tags: [], severity: 'All', searchQuery: '' });
  };

  // Helper method for the Debug Panel
  const runSimulation = async (scenario = "BUSY") => {
    if (!selectedJunctionId) return;
    try {
      await fetchAPI('/simulation/traffic', { 
        method: 'POST', 
        body: JSON.stringify({ junction_id: selectedJunctionId, scenario }) 
      });
      // Tell websocket to refresh
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send("snapshot");
      }
    } catch (err) {
      console.error("Simulation failed:", err);
    }
  };

  return (
    <TrafficContext.Provider
      value={{
        backendJunctions,
        selectedJunctionId,
        setSelectedJunctionId,
        dashboardData,
        runSimulation,
        
        activeCity,
        cityCenter,
        
        selectedJunction,
        setSelectedJunction: handleSelectJunction,
        isLiveSimulating,
        setIsLiveSimulating,
        
        approaches,
        setApproaches,
        showCameras, setShowCameras,
        showSignals, setShowSignals,
        showCorridor, setShowCorridor,
        activeMapElementId, setActiveMapElementId,
        
        activeCorridors,
        triggerEmergencyCorridor,
        removeEmergencyCorridor,
        // Live Simulation Values
        liveAmbulances,
        liveMLStats,
        
        alerts,
        setAlerts,
        
        suggestions,
        applySuggestion,
        setSuggestions,
        
        filters,
        setFilters,
        clearAllFilters
      }}
    >
      {children}
    </TrafficContext.Provider>
  );
};

export const useTraffic = () => {
  const context = useContext(TrafficContext);
  if (!context) throw new Error('useTraffic must be used within a TrafficProvider');
  return context;
};

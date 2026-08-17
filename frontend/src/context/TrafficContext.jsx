import React, { createContext, useContext, useState, useEffect, useRef, useMemo } from 'react';
import { fetchAPI, getWebSocketUrl } from '../utils/api';


const TrafficContext = createContext(null);

export const TrafficProvider = ({ children }) => {
  // --- Backend Data State ---
  const [backendJunctions, setBackendJunctions] = useState([]);
  const [selectedJunctionId, setSelectedJunctionId] = useState(null);
  
  // Real-time backend state
  const [dashboardData, setDashboardData] = useState(null);
  const wsRef = useRef(null);

  // App Config from Backend
  const [appConfig, setAppConfig] = useState(null);

  // Active City & Location State
  const [activeCity, setActiveCity] = useState(null);
  const [cityCenter, setCityCenter] = useState(null);

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
            [data.ambulance_id]: { 
              route: data.route, 
              position: data.route && data.route.length > 0 ? { lat: data.route[0][1], lng: data.route[0][0] } : null, 
              status: data.status, 
              progressPct: 0 
            }
          }));
          window.alert(`🚑 Emergency Dispatch: ${data.ambulance_id} is en route. Green corridor activated.`);
          setAlerts(prev => [{
             id: `amb-disp-${Date.now()}`,
             time: new Date().toLocaleTimeString(),
             title: 'Emergency Vehicle Dispatched',
             description: `Ambulance ${data.ambulance_id} is en route. Green Corridor tracking activated.`,
             severity: 'CRITICAL',
             type: 'GREEN_CORRIDOR',
             author: 'Dispatch Center',
             role: 'System',
             feature: 'Emergency Response',
             service: 'Green Corridor API',
             tags: ['Emergency', 'Live']
          }, ...prev].slice(0, 100));

          setActiveCorridors(prev => [{
            id: `corridor-${data.ambulance_id}`,
            active: true,
            status: 'IN_TRANSIT',
            vehicleType: 'ambulance',
            vehicleLabel: 'Critical Care',
            vehicleId: data.ambulance_id,
            patientSeverity: 'CRITICAL',
            etaSeconds: 180,
            countdownSeconds: 180,
            destination: 'Nagpur Medical College',
            origin: 'Dispatch Center',
            distanceMeters: 4500,
            routeCongestionPct: 0,
            roadsideMessage: `Green corridor active for ${data.ambulance_id}`,
            targetApproach: 'Priority Route',
            originPos: data.route && data.route.length > 0 ? { lat: data.route[0][1], lng: data.route[0][0] } : null,
            destPos: data.route && data.route.length > 0 ? { lat: data.route[data.route.length - 1][1], lng: data.route[data.route.length - 1][0] } : null,
            pathPoints: data.route && data.route.length > 0 ? data.route.map(pt => ({ lat: pt[1], lng: pt[0] })) : null,
            progressPct: 0
          }, ...prev]);
        } else if (data.type === 'AMBULANCE_MOVE') {
          setLiveAmbulances(prev => {
            if (!prev[data.ambulance_id]) return prev;
            return {
              ...prev,
              [data.ambulance_id]: { ...prev[data.ambulance_id], position: data.position, progressPct: data.progressPct }
            };
          });
          setActiveCorridors(prev => prev.map(c => {
            if (c.vehicleId === data.ambulance_id) {
              return { 
                ...c, 
                progressPct: data.progressPct,
                countdownSeconds: Math.max(0, Math.floor(c.etaSeconds * (1 - (data.progressPct / 100))))
              };
            }
            return c;
          }));
        } else if (data.type === 'AMBULANCE_ARRIVED') {
          window.alert(`🏁 Ambulance ${data.ambulance_id} has arrived at destination!`);
          setAlerts(prev => [{
             id: `amb-arr-${Date.now()}`,
             time: new Date().toLocaleTimeString(),
             title: 'Emergency Vehicle Arrived',
             description: `Ambulance ${data.ambulance_id} has successfully reached its destination.`,
             severity: 'HEALTHY',
             type: 'GREEN_CORRIDOR',
             author: 'Dispatch Center',
             role: 'System',
             feature: 'Emergency Response',
             service: 'Green Corridor API',
             tags: ['Emergency', 'Arrived']
          }, ...prev].slice(0, 100));
          setTimeout(() => {
            setLiveAmbulances(prev => {
              const next = { ...prev };
              delete next[data.ambulance_id];
              return next;
            });
          }, 5000);
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
    
    return () => {
      if (ws.readyState === 1) { // OPEN
        ws.close();
      } else if (ws.readyState === 0) { // CONNECTING
        ws.onopen = () => ws.close();
      }
    };
  }, []);

  const [activeMapElementId, setActiveMapElementId] = useState(null);

  // 4 Junction Approaches
  const [approaches, setApproaches] = useState(null);

  // Emergency Green Corridors
  const [activeCorridors, setActiveCorridors] = useState([]);

  // Master Alert List
  const [alerts, setAlerts] = useState([]);

  // Fetch Config on Mount
  useEffect(() => {
    const initConfig = async () => {
      try {
        const config = await fetchAPI('/config');
        setAppConfig(config);
        setActiveCity(config.INDIAN_CITIES[0]);
        setCityCenter(config.INDIAN_CITIES[0].center);
        setApproaches(config.INITIAL_APPROACHES);
        setAlerts(config.INITIAL_ALERTS || []);
        setActiveCorridors(config.INITIAL_CORRIDORS || []);
      } catch (err) {
        console.error("Failed to load dashboard config:", err);
      }
    };
    initConfig();
  }, []);

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
           setAlerts(prev => [...mappedAlerts, ...prev].slice(0, 100));
        }

      } catch (err) {
        console.error("Error parsing websocket message", err);
      }
    };

    ws.onerror = (err) => console.error("WebSocket error:", err);
    wsRef.current = ws;

    return () => {
      if (ws.readyState === 1) { // OPEN
        ws.close();
      } else if (ws.readyState === 0) { // CONNECTING
        ws.onopen = () => ws.close();
      }
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
    if (!selectedJunctionId || !appConfig) return;
    const vehiclePreset = appConfig.EMERGENCY_PRESETS[preset?.vehicleType] || appConfig.EMERGENCY_PRESETS.AMBULANCE;
    
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
         etaSeconds: data.etaSeconds || 120,
         countdownSeconds: data.etaSeconds || 120,
         destination: payload.destination,
         origin: 'Backend Activated',
         distanceMeters: data.distanceMeters || vehiclePreset.distanceMeters,
         routeCongestionPct: 0,
         roadsideMessage: `Green corridor active for ${vehiclePreset.vehicleId}`,
         targetApproach: 'East Commercial Arterial',
         originPos: data.originPos || { lat: cityCenter.lat - 0.0080, lng: cityCenter.lng - 0.0012 },
         destPos: data.destPos || { lat: cityCenter.lat + 0.0006, lng: cityCenter.lng + 0.0008 },
         pathNodes: data.pathNodes || appConfig.DEFAULT_PATH_NODES,
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

  if (!appConfig) {
    return (
      <div className="flex h-screen items-center justify-center bg-(--color-4) text-(--color-2)">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-(--color-3) border-t-(--color-6) rounded-full animate-spin" />
          <div>Loading system...</div>
        </div>
      </div>
    );
  }

  return (
    <TrafficContext.Provider
      value={{
        appConfig,
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

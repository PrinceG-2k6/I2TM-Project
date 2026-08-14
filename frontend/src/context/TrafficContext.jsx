import React, { createContext, useContext, useState, useEffect } from 'react';

const TrafficContext = createContext(null);

// Emergency Vehicle Presets
export const EMERGENCY_PRESETS = {
  AMBULANCE: {
    vehicleType: 'AMBULANCE',
    vehicleLabel: 'Ambulance',
    vehicleIcon: '🚑',
    vehicleId: 'DL-01-AMB-889',
    destination: 'AIIMS Trauma Center',
    hospital: 'AIIMS Trauma Center',
    origin: 'Connaught Place Outer Circle',
    distanceMeters: 850,
    priorityTag: 'CRITICAL (Priority 1)',
    color: '#DC2626'
  },
  FIRE: {
    vehicleType: 'FIRE',
    vehicleLabel: 'Fire Engine',
    vehicleIcon: '🚒',
    vehicleId: 'DL-02-FIRE-101',
    destination: 'Connaught Commercial Hub',
    hospital: 'Connaught Commercial Hub',
    origin: 'Central Fire Station HQ',
    distanceMeters: 1100,
    priorityTag: 'URGENT RESCUE (Priority 1)',
    color: '#EA580C'
  },
  POLICE: {
    vehicleType: 'POLICE',
    vehicleLabel: 'Police Patrol',
    vehicleIcon: '🚓',
    vehicleId: 'DL-01-POL-999',
    destination: 'VIP Outer Ring Escort',
    hospital: 'VIP Outer Ring Escort',
    origin: 'Police Control Room Node',
    distanceMeters: 650,
    priorityTag: 'TACTICAL (Priority 2)',
    color: '#2563EB'
  }
};

// Junction Preset Profiles
const JUNCTION_PROFILES = {
  'J-04 Ring Road South': {
    name: 'J-04 Ring Road South',
    city: 'New Delhi',
    approaches: {
      North: { name: 'North Ring Approach', vehicleCount: 42, capacity: 50, densityPct: 84.0, status: 'HIGH', currentLight: 'RED', greenSec: 35, avgSpeed: 18.2 },
      South: { name: 'South Flyover Connector', vehicleCount: 21, capacity: 50, densityPct: 42.0, status: 'MEDIUM', currentLight: 'RED', greenSec: 25, avgSpeed: 34.0 },
      East: { name: 'East Commercial Arterial', vehicleCount: 48, capacity: 50, densityPct: 96.0, status: 'CRITICAL', currentLight: 'GREEN', greenSec: 55, avgSpeed: 9.5 },
      West: { name: 'West Residential Feeder', vehicleCount: 12, capacity: 50, densityPct: 24.0, status: 'LOW', currentLight: 'RED', greenSec: 15, avgSpeed: 42.1 }
    }
  },
  'J-01 Connaught Inner': {
    name: 'J-01 Connaught Inner',
    city: 'Central Delhi',
    approaches: {
      North: { name: 'Radial Road 1', vehicleCount: 35, capacity: 50, densityPct: 70.0, status: 'HIGH', currentLight: 'GREEN', greenSec: 40, avgSpeed: 22.0 },
      South: { name: 'Radial Road 4', vehicleCount: 18, capacity: 50, densityPct: 36.0, status: 'LOW', currentLight: 'RED', greenSec: 20, avgSpeed: 38.5 },
      East: { name: 'Barakhamba Radial', vehicleCount: 44, capacity: 50, densityPct: 88.0, status: 'CRITICAL', currentLight: 'RED', greenSec: 45, avgSpeed: 12.0 },
      West: { name: 'Parliament St Feeder', vehicleCount: 25, capacity: 50, densityPct: 50.0, status: 'MEDIUM', currentLight: 'RED', greenSec: 25, avgSpeed: 29.0 }
    }
  },
  'J-02 AIIMS Intersection': {
    name: 'J-02 AIIMS Intersection',
    city: 'South Delhi (Emergency Node)',
    approaches: {
      North: { name: 'Aurobindo Marg North', vehicleCount: 47, capacity: 50, densityPct: 94.0, status: 'CRITICAL', currentLight: 'RED', greenSec: 50, avgSpeed: 8.0 },
      South: { name: 'AIIMS Emergency Flyover', vehicleCount: 15, capacity: 50, densityPct: 30.0, status: 'LOW', currentLight: 'GREEN', greenSec: 45, avgSpeed: 45.0 },
      East: { name: 'Ring Road Eastbound', vehicleCount: 39, capacity: 50, densityPct: 78.0, status: 'HIGH', currentLight: 'RED', greenSec: 35, avgSpeed: 16.5 },
      West: { name: 'Safdarjung Corridor', vehicleCount: 22, capacity: 50, densityPct: 44.0, status: 'MEDIUM', currentLight: 'RED', greenSec: 25, avgSpeed: 31.0 }
    }
  },
  'J-08 Silk Board Node': {
    name: 'J-08 Silk Board Node',
    city: 'Bengaluru Outer Ring',
    approaches: {
      North: { name: 'Hosur Road Inbound', vehicleCount: 49, capacity: 50, densityPct: 98.0, status: 'CRITICAL', currentLight: 'GREEN', greenSec: 60, avgSpeed: 6.2 },
      South: { name: 'Electronic City Flyover', vehicleCount: 41, capacity: 50, densityPct: 82.0, status: 'HIGH', currentLight: 'RED', greenSec: 35, avgSpeed: 14.0 },
      East: { name: 'BTM Layout Connector', vehicleCount: 33, capacity: 50, densityPct: 66.0, status: 'HIGH', currentLight: 'RED', greenSec: 30, avgSpeed: 19.0 },
      West: { name: 'HSR Layout Feeder', vehicleCount: 28, capacity: 50, densityPct: 56.0, status: 'MEDIUM', currentLight: 'RED', greenSec: 25, avgSpeed: 26.0 }
    }
  }
};

export const TrafficProvider = ({ children }) => {
  // Junction & Mode
  const [selectedJunction, setSelectedJunction] = useState('J-04 Ring Road South');
  const [environment, setEnvironment] = useState('Prod');
  const [isLiveSimulating, setIsLiveSimulating] = useState(true);

  // 4 Junction Approaches
  const [approaches, setApproaches] = useState(JUNCTION_PROFILES['J-04 Ring Road South'].approaches);

  // Switch Junction Handler
  const handleSelectJunction = (junctionName) => {
    setSelectedJunction(junctionName);
    if (JUNCTION_PROFILES[junctionName]) {
      setApproaches(JUNCTION_PROFILES[junctionName].approaches);
    }
  };

  // Emergency & Green Corridor Triage State
  const [emergency, setEmergency] = useState({
    active: false,
    vehicleType: 'AMBULANCE',
    vehicleLabel: 'Ambulance',
    vehicleIcon: '🚑',
    ambulanceId: 'DL-01-AMB-889',
    vehicleId: 'DL-01-AMB-889',
    patientSeverity: 'CRITICAL', // 'CRITICAL' | 'SERIOUS' | 'STABLE'
    triageLevel: 'RED', // 'RED' | 'YELLOW' | 'GREEN'
    etaSeconds: 90,
    countdownSeconds: 90,
    hospital: 'AIIMS Trauma Center',
    destination: 'AIIMS Trauma Center',
    origin: 'Connaught Place Outer Circle',
    distanceMeters: 850,
    routeCongestionPct: 88.0,
    roadsideMessage: 'Ambulance approaching. Keep left lane clear.',
    targetApproach: 'East Commercial Arterial'
  });

  // Master Alert List
  const [alerts, setAlerts] = useState([
    {
      id: 'ALT-101',
      time: '14:23:13',
      title: "Blocking call from 'East Commercial Arterial' detected. Traffic shed because it is a priority 100 feature.",
      description: 'Density reached 96% with queue spilling beyond 280m. Adaptive green extended by +25s.',
      severity: 'CRITICAL',
      type: 'CONGESTION',
      author: 'System',
      role: 'System',
      feature: 'Internal Reports',
      service: 'Vision Density Detector',
      tags: ['System', 'Feature', 'Admin Dashboard']
    },
    {
      id: 'ALT-102',
      time: '14:21:40',
      title: "Manually set 'Lane Cut Guard' to active with reason 'erratic swerve pattern detected'.",
      description: 'Vehicle DL-04-TC-201 performed abrupt 38° lane swerve across 3 lanes at 58 km/h. Marshal alert dispatched.',
      severity: 'WARNING',
      type: 'RISKY_MOVEMENT',
      author: 'Toby',
      role: 'Vision ML',
      feature: 'Lane Cut Guard',
      service: 'Vision Trajectory Interceptor',
      tags: ['Vision AI', 'Security']
    },
    {
      id: 'ALT-103',
      time: '14:18:05',
      title: 'Support tools UI updated due to traffic spike on South Flyover.',
      description: 'Density on South Flyover approached 75%. Signal timing automatically recalibrated.',
      severity: 'HEALTHY',
      type: 'SYSTEM',
      author: 'AI Dispatch',
      role: 'System',
      feature: 'Signal Timing Engine',
      service: 'Dynamic Signal Optimizer',
      tags: ['System', 'Optimization']
    },
    {
      id: 'ALT-104',
      time: '14:15:22',
      title: 'Emergency Corridor Pre-Clear Triggered on East Approach.',
      description: 'Ambulance DL-01-AMB-889 dispatched. Roadside display set to 90s countdown.',
      severity: 'CRITICAL',
      type: 'EMERGENCY_CORRIDOR',
      author: 'AI Dispatch',
      role: 'System',
      feature: 'Green Corridor Dispatch',
      service: 'Emergency Triage Engine',
      tags: ['Emergency', 'Live']
    },
    {
      id: 'ALT-105',
      time: '14:10:00',
      title: 'Automatic Adaptive Cycle Recalibrated for Afternoon Peak.',
      description: 'Cycle length adjusted to 110s across all 4 phases based on live vehicle queue sizes.',
      severity: 'HEALTHY',
      type: 'SYSTEM',
      author: 'System',
      role: 'System',
      feature: 'Internal Reports',
      service: 'Dynamic Signal Optimizer',
      tags: ['System', 'Feature']
    }
  ]);

  // Filters State
  const [filters, setFilters] = useState({
    userRole: 'All users',
    featureStatus: 'All features',
    serviceStatus: 'All service',
    tags: [],
    severity: 'All',
    searchQuery: ''
  });

  // Filter Drawer visibility
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  // Dynamic AI Suggestions
  const [suggestions, setSuggestions] = useState([
    {
      id: 'SUG-01',
      title: 'Extend Green Phase on East Arterial',
      reason: 'Density at 96% with queue spill over 280m.',
      priority: 'HIGH',
      actionType: 'EXTEND_GREEN',
      deltaSec: 25,
      applied: false
    },
    {
      id: 'SUG-02',
      title: 'Roadside Driver Notice on Junction 4 West Display',
      reason: 'Prevent lane locking before upcoming ambulance corridor.',
      priority: 'URGENT',
      actionType: 'BROADCAST_ROADSIDE',
      message: 'Keep left lane clear for emergency triage.',
      applied: false
    }
  ]);

  // Real-time tick engine
  useEffect(() => {
    if (!isLiveSimulating) return;

    const interval = setInterval(() => {
      // Countdown for emergency
      setEmergency((prev) => {
        if (!prev.active || prev.countdownSeconds <= 0) return prev;
        const nextSec = prev.countdownSeconds - 1;
        if (nextSec === 0) {
          return {
            ...prev,
            active: false,
            countdownSeconds: 0,
            roadsideMessage: `${prev.vehicleLabel || 'Emergency vehicle'} cleared. Adaptive signal flow resumed.`
          };
        }
        return {
          ...prev,
          countdownSeconds: nextSec,
          roadsideMessage: `${prev.vehicleLabel || 'Emergency vehicle'} approaching. Keep left lane clear.`
        };
      });

      // Realistic jitter for approaches
      setApproaches((prev) => {
        const jitter = (val) => Math.max(8, Math.min(50, val + Math.floor(Math.random() * 3) - 1));
        const newNorth = jitter(prev.North.vehicleCount);
        const newSouth = jitter(prev.South.vehicleCount);
        const newWest = jitter(prev.West.vehicleCount);

        return {
          ...prev,
          North: { ...prev.North, vehicleCount: newNorth, densityPct: Math.round((newNorth / 50) * 100) },
          South: { ...prev.South, vehicleCount: newSouth, densityPct: Math.round((newSouth / 50) * 100) },
          West: { ...prev.West, vehicleCount: newWest, densityPct: Math.round((newWest / 50) * 100) }
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isLiveSimulating]);

  // Trigger Emergency Corridor with Dynamic Vehicle Support (Ambulance, Fire, Police)
  const triggerEmergencyCorridor = (severity = 'CRITICAL', vehicleType = 'AMBULANCE') => {
    const countdown = severity === 'CRITICAL' ? 90 : severity === 'SERIOUS' ? 60 : 30;
    const triage = severity === 'CRITICAL' ? 'RED' : severity === 'SERIOUS' ? 'YELLOW' : 'GREEN';
    const preset = EMERGENCY_PRESETS[vehicleType] || EMERGENCY_PRESETS.AMBULANCE;

    setEmergency({
      active: true,
      vehicleType: preset.vehicleType,
      vehicleLabel: preset.vehicleLabel,
      vehicleIcon: preset.vehicleIcon,
      ambulanceId: preset.vehicleId,
      vehicleId: preset.vehicleId,
      patientSeverity: severity,
      triageLevel: triage,
      etaSeconds: countdown,
      countdownSeconds: countdown,
      hospital: preset.destination,
      destination: preset.destination,
      origin: preset.origin,
      distanceMeters: preset.distanceMeters,
      routeCongestionPct: 88.0,
      roadsideMessage: `${preset.vehicleLabel} approaching. Keep left lane clear.`,
      targetApproach: 'East Commercial Arterial'
    });

    setApproaches((prev) => ({
      North: { ...prev.North, currentLight: 'RED' },
      South: { ...prev.South, currentLight: 'RED' },
      West: { ...prev.West, currentLight: 'RED' },
      East: { ...prev.East, currentLight: 'GREEN' }
    }));

    setAlerts((prev) => [
      {
        id: `ALT-${Date.now().toString().slice(-4)}`,
        time: new Date().toLocaleTimeString(),
        title: `Emergency Green Corridor: ${preset.vehicleLabel} (${severity} Priority)`,
        description: `${preset.vehicleLabel} ${preset.vehicleId} en route to ${preset.destination}. Roadside screens broadcast ${countdown}s hold time. Conflicting approaches held.`,
        severity: 'CRITICAL',
        type: 'EMERGENCY_CORRIDOR',
        author: 'Rob Ocel',
        role: 'Operator',
        feature: 'Green Corridor Dispatch',
        service: 'Emergency Triage Engine',
        tags: ['Emergency', preset.vehicleLabel, 'Live']
      },
      ...prev
    ]);
  };

  const resetEmergencyCorridor = () => {
    setEmergency((prev) => ({
      ...prev,
      active: false,
      countdownSeconds: 0,
      roadsideMessage: 'Adaptive Signal Active. Normal traffic flow maintained.'
    }));
  };

  const applySuggestion = (suggestionId) => {
    setSuggestions((prev) =>
      prev.map((s) => (s.id === suggestionId ? { ...s, applied: true } : s))
    );
  };

  const clearAllFilters = () => {
    setFilters({
      userRole: 'All users',
      featureStatus: 'All features',
      serviceStatus: 'All service',
      tags: [],
      severity: 'All',
      searchQuery: ''
    });
  };

  // Active filter count calculation
  const activeFilterCount =
    (filters.userRole !== 'All users' ? 1 : 0) +
    (filters.featureStatus !== 'All features' ? 1 : 0) +
    (filters.serviceStatus !== 'All service' ? 1 : 0) +
    (filters.tags && filters.tags.length > 0 ? filters.tags.length : 0) +
    (filters.severity !== 'All' ? 1 : 0) +
    (filters.searchQuery ? 1 : 0);

  return (
    <TrafficContext.Provider
      value={{
        selectedJunction,
        setSelectedJunction: handleSelectJunction,
        environment,
        setEnvironment,
        isLiveSimulating,
        setIsLiveSimulating,
        approaches,
        setApproaches,
        emergency,
        triggerEmergencyCorridor,
        resetEmergencyCorridor,
        alerts,
        setAlerts,
        suggestions,
        applySuggestion,
        filters,
        setFilters,
        clearAllFilters,
        activeFilterCount,
        isFilterDrawerOpen,
        setIsFilterDrawerOpen
      }}
    >
      {children}
    </TrafficContext.Provider>
  );
};

export const useTraffic = () => {
  const context = useContext(TrafficContext);
  if (!context) {
    throw new Error('useTraffic must be used within a TrafficProvider');
  }
  return context;
};

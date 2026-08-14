import React, { createContext, useContext, useState, useEffect } from 'react';

const TrafficContext = createContext(null);

// Pre-defined Indian Cities Database
export const INDIAN_CITIES = [
  {
    id: 'delhi',
    name: 'New Delhi',
    state: 'Delhi NCR',
    center: { lat: 28.5672, lng: 77.2100 },
    zoom: 14,
    junctions: ['J-04 Ring Road South (AIIMS)', 'J-01 Connaught Inner', 'J-02 Aurobindo Marg Node']
  },
  {
    id: 'mumbai',
    name: 'Mumbai',
    state: 'Maharashtra',
    center: { lat: 19.0657, lng: 72.8686 },
    zoom: 14,
    junctions: ['M-01 BKC Central Junction', 'M-02 Dadar TT Circle', 'M-03 Marine Drive Flyover']
  },
  {
    id: 'bengaluru',
    name: 'Bengaluru',
    state: 'Karnataka',
    center: { lat: 12.9172, lng: 77.6228 },
    zoom: 14,
    junctions: ['B-01 Silk Board Node', 'B-02 HSR Outer Ring Road', 'B-03 Electronic City Toll']
  },
  {
    id: 'hyderabad',
    name: 'Hyderabad',
    state: 'Telangana',
    center: { lat: 17.4435, lng: 78.3772 },
    zoom: 14,
    junctions: ['H-01 Hitec City Cyber Towers', 'H-02 Gachibowli Junction', 'H-03 Punjagutta Flyover']
  },
  {
    id: 'chennai',
    name: 'Chennai',
    state: 'Tamil Nadu',
    center: { lat: 13.0067, lng: 80.2022 },
    zoom: 14,
    junctions: ['C-01 Kathipara Cloverleaf Node', 'C-02 Anna Salai Arterial', 'C-03 T Nagar Bus Terminus']
  },
  {
    id: 'kolkata',
    name: 'Kolkata',
    state: 'West Bengal',
    center: { lat: 22.5726, lng: 88.3639 },
    zoom: 14,
    junctions: ['K-01 Park Street Junction', 'K-02 Salt Lake Sector V Hub', 'K-03 Howrah Bridge Approach']
  },
  {
    id: 'pune',
    name: 'Pune',
    state: 'Maharashtra',
    center: { lat: 18.5308, lng: 73.8474 },
    zoom: 14,
    junctions: ['P-01 University Circle Hub', 'P-02 Hinjawadi Phase 1 Circle', 'P-03 Swargate Bus Terminal']
  },
  {
    id: 'ahmedabad',
    name: 'Ahmedabad',
    state: 'Gujarat',
    center: { lat: 23.0225, lng: 72.5714 },
    zoom: 14,
    junctions: ['A-01 SG Highway Iskcon Circle', 'A-02 Ashram Road Node', 'A-03 Kalupur Station Circle']
  },
  {
    id: 'jaipur',
    name: 'Jaipur',
    state: 'Rajasthan',
    center: { lat: 26.9124, lng: 75.7873 },
    zoom: 14,
    junctions: ['JPR-01 Statue Circle Hub', 'JPR-02 MI Road Junction', 'JPR-03 Ashram Marg Node']
  },
  {
    id: 'chandigarh',
    name: 'Chandigarh',
    state: 'Punjab / Haryana',
    center: { lat: 30.7333, lng: 76.7794 },
    zoom: 14,
    junctions: ['CH-01 Tribune Chowk Node', 'CH-02 Sector 17 Plaza Circle', 'CH-03 Press Chowk Junction']
  },
  {
    id: 'lucknow',
    name: 'Lucknow',
    state: 'Uttar Pradesh',
    center: { lat: 26.8467, lng: 80.9462 },
    zoom: 14,
    junctions: ['LKO-01 Hazratganj Central Cross', 'LKO-02 Polytechnic Chauraha', 'LKO-03 Awadh Chauraha Node']
  }
];

// Emergency Vehicle Presets
export const EMERGENCY_PRESETS = {
  AMBULANCE: {
    vehicleType: 'AMBULANCE',
    vehicleLabel: 'Ambulance',
    vehicleIcon: 'Siren',
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
    vehicleIcon: 'Flame',
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
    vehicleIcon: 'ShieldAlert',
    vehicleId: 'DL-01-POL-999',
    destination: 'VIP Outer Ring Escort',
    hospital: 'VIP Outer Ring Escort',
    origin: 'Police Control Room Node',
    distanceMeters: 650,
    priorityTag: 'TACTICAL (Priority 2)',
    color: '#2563EB'
  }
};

export const TrafficProvider = ({ children }) => {
  // Active City & Location State (Default New Delhi)
  const [activeCity, setActiveCity] = useState(INDIAN_CITIES[0]);
  const [cityCenter, setCityCenter] = useState(INDIAN_CITIES[0].center);
  const [userLocationDetected, setUserLocationDetected] = useState(false);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);

  // Layer Visibility Toggles (Shared across Topbar & Map Views)
  const [showCameras, setShowCameras] = useState(true);
  const [showSignals, setShowSignals] = useState(true);
  const [showCorridor, setShowCorridor] = useState(true);

  // Junction & Mode
  const [selectedJunction, setSelectedJunction] = useState('J-04 Ring Road South (AIIMS)');
  const [environment, setEnvironment] = useState('Prod');
  const [isLiveSimulating, setIsLiveSimulating] = useState(true);

  // 4 Junction Approaches (Dynamic calculation based on density)
  const [approaches, setApproaches] = useState({
    North: { name: 'North Approach Corridor', vehicleCount: 42, capacity: 50, densityPct: 84.0, status: 'HIGH', currentLight: 'RED', greenSec: 35, avgSpeed: 18.2 },
    South: { name: 'South Flyover Connector', vehicleCount: 21, capacity: 50, densityPct: 42.0, status: 'MEDIUM', currentLight: 'RED', greenSec: 25, avgSpeed: 34.0 },
    East: { name: 'East Commercial Arterial', vehicleCount: 48, capacity: 50, densityPct: 96.0, status: 'CRITICAL', currentLight: 'GREEN', greenSec: 55, avgSpeed: 9.5 },
    West: { name: 'West Residential Feeder', vehicleCount: 12, capacity: 50, densityPct: 24.0, status: 'LOW', currentLight: 'RED', greenSec: 15, avgSpeed: 42.1 }
  });

  // Automatically detect user location on initial load
  const detectUserLocation = () => {
    if (!navigator.geolocation) return;
    setIsDetectingLocation(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;

        // Find nearest predefined Indian city
        let minDistance = Infinity;
        let nearestCity = null;

        INDIAN_CITIES.forEach((city) => {
          const dist = Math.hypot(city.center.lat - latitude, city.center.lng - longitude);
          if (dist < minDistance) {
            minDistance = dist;
            nearestCity = city;
          }
        });

        // If user is within ~300km of a known city
        if (nearestCity && minDistance < 3.5) {
          setActiveCity({
            ...nearestCity,
            name: `${nearestCity.name} (Your Location)`
          });
          setCityCenter(nearestCity.center);
          setSelectedJunction(nearestCity.junctions[0]);
        } else {
          // Custom Indian coordinate location
          const customCity = {
            id: 'live-user-location',
            name: 'Live Detected Location',
            state: 'India',
            center: { lat: latitude, lng: longitude },
            zoom: 14,
            junctions: ['Local Central Junction']
          };
          setActiveCity(customCity);
          setCityCenter({ lat: latitude, lng: longitude });
          setSelectedJunction('Local Central Junction');
        }

        setUserLocationDetected(true);
        setIsDetectingLocation(false);
      },
      (error) => {
        console.warn('Geolocation access denied or unavailable. Using default city (New Delhi):', error);
        setIsDetectingLocation(false);
      },
      { timeout: 8000, maximumAge: 60000 }
    );
  };

  useEffect(() => {
    detectUserLocation();
  }, []);

  // Switch City Handler (Predefined or Custom Search)
  const handleSelectCity = (cityObj) => {
    setActiveCity(cityObj);
    setCityCenter(cityObj.center);
    if (cityObj.junctions && cityObj.junctions.length > 0) {
      setSelectedJunction(cityObj.junctions[0]);
    } else {
      setSelectedJunction(`${cityObj.name} Central Junction`);
    }
  };

  // Search City by text query
  const handleSearchCityQuery = async (queryText) => {
    if (!queryText || !queryText.trim()) return;
    const cleanQuery = queryText.trim().toLowerCase();

    // 1. Search in pre-built catalog
    const matchedCatalogCity = INDIAN_CITIES.find(
      (c) => c.name.toLowerCase().includes(cleanQuery) || c.state.toLowerCase().includes(cleanQuery)
    );

    if (matchedCatalogCity) {
      handleSelectCity(matchedCatalogCity);
      return matchedCatalogCity;
    }

    // 2. Geocode custom Indian city query via Nominatim / OpenStreetMap
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          queryText + ', India'
        )}`
      );
      const data = await response.json();
      if (data && data.length > 0) {
        const topResult = data[0];
        const newCity = {
          id: `custom-${cleanQuery}`,
          name: topResult.display_name.split(',')[0],
          state: topResult.display_name.split(',')[1] || 'India',
          center: { lat: parseFloat(topResult.lat), lng: parseFloat(topResult.lon) },
          zoom: 14,
          junctions: [`${topResult.display_name.split(',')[0]} Main Junction`]
        };
        handleSelectCity(newCity);
        return newCity;
      }
    } catch (err) {
      console.warn('Custom geocoding failed:', err);
    }
    return null;
  };

  // Switch Junction Handler
  const handleSelectJunction = (junctionName) => {
    setSelectedJunction(junctionName);
  };

  // Emergency & Green Corridor Triage State
  const [emergency, setEmergency] = useState({
    active: false,
    vehicleType: 'AMBULANCE',
    vehicleLabel: 'Ambulance',
    vehicleIcon: '🚑',
    ambulanceId: 'DL-01-AMB-889',
    vehicleId: 'DL-01-AMB-889',
    patientSeverity: 'CRITICAL',
    triageLevel: 'RED',
    etaSeconds: 90,
    countdownSeconds: 90,
    hospital: 'Trauma Emergency Hub',
    destination: 'Trauma Emergency Hub',
    origin: 'Outer Ring Corridor',
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
      title: "Density spike detected on East Arterial. Traffic shed requested.",
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
      title: "Lane Cut Guard triggered: erratic swerve pattern detected.",
      description: 'Vehicle performed abrupt 38° lane swerve across 3 lanes at 58 km/h. Traffic marshal alert dispatched.',
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
      title: 'Signal timing automatically recalibrated for city flow.',
      description: 'Density approached 75%. Signal timing dynamically optimized.',
      severity: 'HEALTHY',
      type: 'SYSTEM',
      author: 'AI Dispatch',
      role: 'System',
      feature: 'Signal Timing Engine',
      service: 'Dynamic Signal Optimizer',
      tags: ['System', 'Optimization']
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

  // Dynamic AI Suggestions
  const [suggestions, setSuggestions] = useState([
    {
      id: 'SUG-01',
      title: 'Extend Green Phase on Main Arterial',
      reason: 'Density at 96% with queue spill over 280m.',
      priority: 'HIGH',
      actionType: 'EXTEND_GREEN',
      deltaSec: 25,
      applied: false
    },
    {
      id: 'SUG-02',
      title: 'Roadside Driver Notice on VMS Display',
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

  // Trigger Emergency Corridor
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
      hospital: `${activeCity?.name || 'Local'} Trauma Center`,
      destination: `${activeCity?.name || 'Local'} Trauma Center`,
      origin: `${activeCity?.name || 'Local'} Outer Ring`,
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
        activeCity,
        cityCenter,
        handleSelectCity,
        handleSearchCityQuery,
        detectUserLocation,
        userLocationDetected,
        isDetectingLocation,
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
        showCameras,
        setShowCameras,
        showSignals,
        setShowSignals,
        showCorridor,
        setShowCorridor
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

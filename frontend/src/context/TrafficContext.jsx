import React, { createContext, useContext, useState, useEffect } from 'react';

const TrafficContext = createContext(null);

import { INDIAN_CITIES, EMERGENCY_PRESETS, INITIAL_CORRIDORS, INITIAL_ALERTS, INITIAL_SUGGESTIONS } from '../data/dummyData';

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

  // Emergency & Green Corridor Triage State (Array for multiple corridors)
  const [activeCorridors, setActiveCorridors] = useState(INITIAL_CORRIDORS);

  // Master Alert List
  const [alerts, setAlerts] = useState(INITIAL_ALERTS);

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
  const [suggestions, setSuggestions] = useState(INITIAL_SUGGESTIONS);

  // Real-time tick engine
  useEffect(() => {
    if (!isLiveSimulating) return;

    const interval = setInterval(() => {
      // Countdown for all active corridors
      setActiveCorridors((prev) => {
        if (prev.length === 0) return prev;
        
        return prev.map(corridor => {
          if (corridor.countdownSeconds <= 0) {
            return {
              ...corridor,
              countdownSeconds: 0,
              status: 'ARRIVED',
              roadsideMessage: `${corridor.vehicleLabel} arrived at destination.`
            };
          }
          return {
            ...corridor,
            countdownSeconds: corridor.countdownSeconds - 1,
            roadsideMessage: `${corridor.vehicleLabel} approaching. Keep left lane clear.`
          };
        });
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
    const countdown = severity === 'CRITICAL' ? 120 : severity === 'SERIOUS' ? 90 : 60;
    const triage = severity === 'CRITICAL' ? 'RED' : severity === 'SERIOUS' ? 'YELLOW' : 'GREEN';
    const preset = EMERGENCY_PRESETS[vehicleType] || EMERGENCY_PRESETS.AMBULANCE;

    // Build a unique ID and full route path with signals for the visualizer
    const newCorridor = {
      id: `CORR-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      active: true,
      status: 'IN_TRANSIT',
      vehicleType: preset.vehicleType,
      vehicleLabel: preset.vehicleLabel,
      vehicleIcon: preset.vehicleIcon,
      vehicleId: preset.vehicleId,
      patientSeverity: severity,
      triageLevel: triage,
      etaSeconds: countdown,
      countdownSeconds: countdown,
      destination: `${activeCity?.name || 'Local'} Trauma Center`,
      origin: `${activeCity?.name || 'Local'} Outer Ring`,
      distanceMeters: preset.distanceMeters,
      routeCongestionPct: 88.0,
      roadsideMessage: `${preset.vehicleLabel} approaching. Keep left lane clear.`,
      targetApproach: 'East Commercial Arterial',
      // Mock path data for tracking
      pathNodes: [
        { name: 'Outer Ring Entry', status: 'PASSED', isGreen: true },
        { name: 'Commercial Arterial', status: 'ACTIVE', isGreen: true },
        { name: 'City Center Node', status: 'UPCOMING', isGreen: true },
        { name: 'Hospital Approach', status: 'UPCOMING', isGreen: true }
      ],
      progressPct: 15
    };

    setActiveCorridors(prev => [newCorridor, ...prev]);

    setApproaches((prev) => ({
      North: { ...prev.North, currentLight: 'RED' },
      South: { ...prev.South, currentLight: 'RED' },
      West: { ...prev.West, currentLight: 'RED' },
      East: { ...prev.East, currentLight: 'GREEN' }
    }));
  };

  const removeEmergencyCorridor = (corridorId) => {
    setActiveCorridors(prev => prev.filter(c => c.id !== corridorId));
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
        activeCorridors,
        triggerEmergencyCorridor,
        removeEmergencyCorridor,
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

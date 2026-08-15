import React, { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import { useJsApiLoader, GoogleMap, MarkerF, PolygonF, Polyline, DirectionsRenderer, InfoWindow } from '@react-google-maps/api';
import { useTraffic, INDIAN_CITIES } from '../../../context/TrafficContext';
import { Badge } from '../../common/Badge';
import { Dropdown } from '../../common/Dropdown';
import {
  Camera,
  Siren,
  RotateCcw,
  Zap,
  Filter
} from 'lucide-react';

// Google Maps Libraries static array reference (prevents re-render reloads)
const GOOGLE_MAPS_LIBRARIES = ['geometry'];

/**
 * Calculates a circular sector (pie wedge / camera FOV cone) polygon path for Google Maps.
 * @param {Object} center - { lat, lng }
 * @param {number} radiusMeters - Radius/depth in meters
 * @param {number} startAngle - Start bearing in degrees (0 = North, 90 = East, 180 = South, 270 = West)
 * @param {number} endAngle - End bearing in degrees
 * @param {number} numPoints - Number of arc sample points
 */
const calculateSectorPath = (center, radiusMeters, startAngle, endAngle, numPoints = 16) => {
  const path = [center];
  const EARTH_RADIUS = 6378137; // Earth radius in meters

  const latRad = (center.lat * Math.PI) / 180;
  const lngRad = (center.lng * Math.PI) / 180;
  const distRatio = radiusMeters / EARTH_RADIUS;

  let normEnd = endAngle;
  if (normEnd < startAngle) {
    normEnd += 360;
  }

  const step = (normEnd - startAngle) / (numPoints - 1);

  for (let i = 0; i < numPoints; i++) {
    const bearingDeg = startAngle + step * i;
    const bearingRad = (bearingDeg * Math.PI) / 180;

    const pointLatRad = Math.asin(
      Math.sin(latRad) * Math.cos(distRatio) +
      Math.cos(latRad) * Math.sin(distRatio) * Math.cos(bearingRad)
    );

    const pointLngRad =
      lngRad +
      Math.atan2(
        Math.sin(bearingRad) * Math.sin(distRatio) * Math.cos(latRad),
        Math.cos(distRatio) - Math.sin(latRad) * Math.sin(pointLatRad)
      );

    path.push({
      lat: (pointLatRad * 180) / Math.PI,
      lng: (pointLngRad * 180) / Math.PI
    });
  }

  path.push(center);
  return path;
};

// AIIMS Central Junction Coordinates (Delhi)
const MAP_CENTER = { lat: 28.5672, lng: 77.2100 };
const MAP_CONTAINER_STYLE = {
  width: '100%',
  height: '640px',
  borderRadius: '16px',
  boxShadow: 'var(--shadow-card)'
};

// Google Map Options
const MAP_OPTIONS = {
  disableDefaultUI: false,
  zoomControl: true,
  mapTypeControl: true,
  streetViewControl: false,
  fullscreenControl: true,
  styles: [
    { elementType: 'geometry', stylers: [{ color: '#1d2c4d' }] },
    { elementType: 'labels.text.fill', stylers: [{ color: '#8ec3b9' }] },
    { elementType: 'labels.text.stroke', stylers: [{ color: '#1a3646' }] },
    {
      featureType: 'administrative.country',
      elementType: 'geometry.stroke',
      stylers: [{ color: '#4b687a' }]
    },
    {
      featureType: 'road',
      elementType: 'geometry',
      stylers: [{ color: '#304a7d' }]
    },
    {
      featureType: 'road',
      elementType: 'geometry.stroke',
      stylers: [{ color: '#1f2835' }]
    },
    {
      featureType: 'road.highway',
      elementType: 'geometry',
      stylers: [{ color: '#2c456b' }]
    },
    {
      featureType: 'water',
      elementType: 'geometry',
      stylers: [{ color: '#0e1626' }]
    }
  ]
};

export const OverviewView = () => {
  const {
    activeCity,
    cityCenter,
    approaches,
    activeCorridors,
    removeEmergencyCorridor,
    selectedJunction,
    setSelectedJunction,
    showCameras,
    setShowCameras,
    showSignals,
    setShowSignals,
    showCorridor,
    setShowCorridor,
    clearAllFilters,
    alerts
  } = useTraffic();

  const [selectedElement, setSelectedElement] = useState(null);

  // Map instance ref for smooth animated pan & zoom
  const mapRef = useRef(null);

  const onLoadMap = useCallback((map) => {
    mapRef.current = map;
  }, []);

  const onUnmountMap = useCallback(() => {
    mapRef.current = null;
  }, []);

  // Use the first active corridor for dashboard display if any exist
  const emergency = activeCorridors && activeCorridors.length > 0 ? activeCorridors[0] : { active: false };

  // Smoothly animate pan & zoom when user switches or searches a city
  useEffect(() => {
    if (mapRef.current && cityCenter) {
      mapRef.current.panTo(cityCenter);
      mapRef.current.setZoom(14);
    }
  }, [cityCenter]);

  // Safe approach extractors
  const northApp = approaches?.North || approaches?.north || { vehicleCount: 42, densityPct: 84, currentLight: 'RED', greenSec: 35 };
  const eastApp = approaches?.East || approaches?.east || { vehicleCount: 48, densityPct: 96, currentLight: 'GREEN', greenSec: 55 };
  const westApp = approaches?.West || approaches?.west || { vehicleCount: 12, densityPct: 24, currentLight: 'RED', greenSec: 15 };
  const southApp = approaches?.South || approaches?.south || { vehicleCount: 21, densityPct: 42, currentLight: 'RED', greenSec: 25 };

  // Center coordinates for selected Indian City
  const centerLat = cityCenter?.lat || 28.5672;
  const centerLng = cityCenter?.lng || 77.2100;
  const mapCenter = useMemo(() => ({ lat: centerLat, lng: centerLng }), [centerLat, centerLng]);

  // Google Maps JS Loader
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
    libraries: GOOGLE_MAPS_LIBRARIES
  });

  // 1. Generate Multi-Junction Nodes across ALL Indian Cities
  const junctionNodes = useMemo(() => {
    const nodes = [];

    INDIAN_CITIES.forEach((city) => {
      const lat = city.center.lat;
      const lng = city.center.lng;

      const cityJunctions = city.junctions || [`${city.name} Main Hub`];
      cityJunctions.forEach((jName, idx) => {
        // Offsets for each junction across the city
        const offsetLat = idx === 0 ? 0 : (idx % 2 === 0 ? -1 : 1) * (0.007 + idx * 0.005);
        const offsetLng = idx === 0 ? 0 : (idx % 3 === 0 ? -1 : 1) * (0.009 + idx * 0.006);

        nodes.push({
          id: `${city.id}-JUNC-${idx + 1}`,
          cityId: city.id,
          cityName: city.name,
          name: jName,
          position: { lat: lat + offsetLat, lng: lng + offsetLng },
          densityPct: Math.floor(Math.random() * 40) + 50,
          vehicleCount: Math.floor(Math.random() * 90) + 35,
          status: idx === 0 ? 'CRITICAL' : idx % 2 === 0 ? 'HIGH' : 'OPTIMAL'
        });
      });
    });

    // If activeCity is a custom searched location
    if (activeCity && !INDIAN_CITIES.some((c) => c.id === activeCity.id)) {
      const lat = activeCity.center.lat;
      const lng = activeCity.center.lng;
      nodes.push(
        {
          id: `${activeCity.id}-JUNC-1`,
          cityId: activeCity.id,
          cityName: activeCity.name,
          name: `${activeCity.name} Central Junction`,
          position: { lat, lng },
          densityPct: 78,
          vehicleCount: 64,
          status: 'CRITICAL'
        },
        {
          id: `${activeCity.id}-JUNC-2`,
          cityId: activeCity.id,
          cityName: activeCity.name,
          name: `${activeCity.name} Ring Road Node`,
          position: { lat: lat + 0.008, lng: lng + 0.010 },
          densityPct: 62,
          vehicleCount: 48,
          status: 'HIGH'
        }
      );
    }

    return nodes;
  }, [activeCity]);

  // 2. Camera Coverage Zones across ALL Junctions in ALL Cities
  const cameraZones = useMemo(() => {
    const zones = [];

    junctionNodes.forEach((junc) => {
      const lat = junc.position.lat;
      const lng = junc.position.lng;

      zones.push(
        {
          id: `${junc.id}-CAM-N`,
          junctionName: junc.name,
          name: `${junc.name} North CCTV`,
          approach: 'North Approach',
          center: { lat: lat + 0.0012, lng: lng + 0.0002 },
          radius: 140,
          startAngle: 145,
          endAngle: 215,
          fovSector: '70° Sector Arc',
          resolution: '1080p 60fps',
          detectionModel: 'YOLOv8 Dynamic',
          activeVehicles: Math.floor(Math.random() * 30) + 15,
          densityPct: Math.floor(Math.random() * 40) + 50,
          color: '#F59E0B'
        },
        {
          id: `${junc.id}-CAM-E`,
          junctionName: junc.name,
          name: `${junc.name} East CCTV`,
          approach: 'East Approach',
          center: { lat: lat - 0.0002, lng: lng + 0.0018 },
          radius: 145,
          startAngle: 235,
          endAngle: 305,
          fovSector: '70° Sector Arc',
          resolution: '1080p 60fps',
          detectionModel: 'YOLOv8 Swerve Risk',
          activeVehicles: Math.floor(Math.random() * 30) + 15,
          densityPct: Math.floor(Math.random() * 40) + 50,
          color: '#F59E0B'
        },
        {
          id: `${junc.id}-CAM-W`,
          junctionName: junc.name,
          name: `${junc.name} West CCTV`,
          approach: 'West Approach',
          center: { lat: lat + 0.0001, lng: lng - 0.0018 },
          radius: 140,
          startAngle: 55,
          endAngle: 125,
          fovSector: '70° Sector Arc',
          resolution: '1080p 60fps',
          detectionModel: 'YOLOv8 Multi-Class',
          activeVehicles: Math.floor(Math.random() * 30) + 15,
          densityPct: Math.floor(Math.random() * 40) + 50,
          color: '#F59E0B'
        },
        {
          id: `${junc.id}-CAM-S`,
          junctionName: junc.name,
          name: `${junc.name} South CCTV`,
          approach: 'South Approach',
          center: { lat: lat - 0.0014, lng: lng - 0.0002 },
          radius: 135,
          startAngle: 325,
          endAngle: 35,
          fovSector: '70° Sector Arc',
          resolution: '1080p 60fps',
          detectionModel: 'YOLOv8 Emergency Triage',
          activeVehicles: Math.floor(Math.random() * 30) + 15,
          densityPct: Math.floor(Math.random() * 40) + 50,
          color: '#F59E0B'
        }
      );
    });

    return zones;
  }, [junctionNodes]);

  // 3. Traffic Signal Nodes across ALL Junctions in ALL Cities
  const signalNodes = useMemo(() => {
    const signals = [];

    junctionNodes.forEach((junc) => {
      const lat = junc.position.lat;
      const lng = junc.position.lng;

      signals.push(
        {
          id: `${junc.id}-SIG-N`,
          junctionName: junc.name,
          name: `${junc.name} North Signal`,
          approach: 'North Approach',
          position: { lat: lat + 0.0008, lng: lng + 0.0001 },
          light: junc.name === selectedJunction ? northApp.currentLight : 'RED',
          greenSec: junc.name === selectedJunction ? northApp.greenSec : 30,
          densityPct: junc.densityPct,
          vehicles: junc.vehicleCount
        },
        {
          id: `${junc.id}-SIG-E`,
          junctionName: junc.name,
          name: `${junc.name} East Signal`,
          approach: 'East Approach',
          position: { lat: lat - 0.0001, lng: lng + 0.0014 },
          light: junc.name === selectedJunction ? eastApp.currentLight : 'GREEN',
          greenSec: junc.name === selectedJunction ? eastApp.greenSec : 45,
          densityPct: junc.densityPct,
          vehicles: junc.vehicleCount
        },
        {
          id: `${junc.id}-SIG-W`,
          junctionName: junc.name,
          name: `${junc.name} West Signal`,
          approach: 'West Approach',
          position: { lat: lat + 0.0000, lng: lng - 0.0014 },
          light: junc.name === selectedJunction ? westApp.currentLight : 'RED',
          greenSec: junc.name === selectedJunction ? westApp.greenSec : 20,
          densityPct: junc.densityPct,
          vehicles: junc.vehicleCount
        },
        {
          id: `${junc.id}-SIG-S`,
          junctionName: junc.name,
          name: `${junc.name} South Signal`,
          approach: 'South Approach',
          position: { lat: lat - 0.0011, lng: lng - 0.0001 },
          light: junc.name === selectedJunction ? southApp.currentLight : 'RED',
          greenSec: junc.name === selectedJunction ? southApp.greenSec : 25,
          densityPct: junc.densityPct,
          vehicles: junc.vehicleCount
        }
      );
    });

    return signals;
  }, [junctionNodes, selectedJunction, northApp, eastApp, westApp, southApp]);

  // Dynamic dropdown list of all junctions for current active city
  const cityJunctionOptions = useMemo(() => {
    const activeJuncs = junctionNodes.filter((j) => j.cityId === (activeCity?.id || 'hyderabad'));
    if (activeJuncs.length === 0) {
      return [{ value: selectedJunction || 'Central Hub', label: selectedJunction || 'Central Hub' }];
    }
    return activeJuncs.map((j) => ({
      value: j.name,
      label: j.name
    }));
  }, [junctionNodes, activeCity, selectedJunction]);

  // Pan map to selected junction when changed
  useEffect(() => {
    if (!selectedJunction || !mapRef.current) return;
    const targetJunc = junctionNodes.find((j) => j.name === selectedJunction);
    if (targetJunc) {
      mapRef.current.panTo(targetJunc.position);
      mapRef.current.setZoom(15);
    }
  }, [selectedJunction, junctionNodes]);

  // Origin & Destination coordinates on real road network
  const ambulancePos = useMemo(() => ({ lat: centerLat - 0.0080, lng: centerLng - 0.0012 }), [centerLat, centerLng]);
  const destinationPos = useMemo(() => ({ lat: centerLat + 0.0006, lng: centerLng + 0.0008 }), [centerLat, centerLng]);

  // Real Street Geometry Path Points
  const [roadPathPoints, setRoadPathPoints] = useState([]);

  // Fetch real street routing from Google DirectionsService or OSRM road engine
  useEffect(() => {
    let isMounted = true;

    const fetchRoute = async () => {
      // Use OSRM Driving Route Engine (guaranteed 100% real road geometry)
      // Bypassing Google DirectionsService to avoid legacy API REQUEST_DENIED errors.
      fetchOSRM();
    };

    const fetchOSRM = async () => {
      try {
        const url = `https://router.project-osrm.org/route/v1/driving/${ambulancePos.lng},${ambulancePos.lat};${destinationPos.lng},${destinationPos.lat}?overview=full&geometries=geojson`;
        const res = await fetch(url);
        const data = await res.json();
        if (data && data.routes && data.routes[0] && data.routes[0].geometry) {
          const coords = data.routes[0].geometry.coordinates; // [[lng, lat], ...]
          const formatted = coords.map(([lng, lat]) => ({ lat, lng }));
          if (isMounted && formatted.length > 0) {
            setRoadPathPoints(formatted);
          }
        }
      } catch (e) {
        console.warn('OSRM road routing error:', e);
      }
    };

    fetchRoute();

    return () => {
      isMounted = false;
    };
  }, [isLoaded, centerLat, centerLng, ambulancePos, destinationPos]);

  // Get color hex for signal light
  const getSignalHex = (light) => {
    switch (light) {
      case 'GREEN': return '#22C55E';
      case 'AMBER': return '#F59E0B';
      case 'RED': return '#EF4444';
      default: return '#EF4444';
    }
  };

  // Render Google Maps content when loaded
  const renderMapContent = () => (
    <>
      {/* 0. Junction Hub Node Markers */}
      {junctionNodes.map((junc) => (
        <MarkerF
          key={junc.id}
          position={junc.position}
          title={`Junction: ${junc.name} (${junc.vehicleCount} vehicles)`}
          icon={{
            path: window.google ? window.google.maps.SymbolPath.CIRCLE : undefined,
            scale: junc.name === selectedJunction ? 14 : 11,
            fillColor: junc.name === selectedJunction ? '#7C3AED' : '#4F46E5',
            fillOpacity: 1,
            strokeColor: '#FFFFFF',
            strokeWeight: 3
          }}
          onClick={() => {
            setSelectedJunction && setSelectedJunction(junc.name);
            setSelectedElement({ type: 'junction', data: junc });
          }}
        />
      ))}

      {/* 1. Camera FOV Sector Coverage Wedges */}
      {showCameras && cameraZones.map((cam) => {
        const sectorPath = calculateSectorPath(cam.center, cam.radius, cam.startAngle, cam.endAngle);
        return (
          <React.Fragment key={cam.id}>
            <PolygonF
              paths={sectorPath}
              options={{
                strokeColor: cam.color || '#F59E0B',
                strokeOpacity: 0.95,
                strokeWeight: 2.5,
                fillColor: cam.color || '#F59E0B',
                fillOpacity: 0.35,
                clickable: true
              }}
              onClick={() => setSelectedElement({ type: 'camera', data: cam })}
            />
            <MarkerF
              position={cam.center}
              title={`${cam.name} (${cam.fovSector})`}
              icon={{
                path: window.google ? window.google.maps.SymbolPath.CIRCLE : undefined,
                scale: 8,
                fillColor: cam.color || '#F59E0B',
                fillOpacity: 1,
                strokeColor: '#FFFFFF',
                strokeWeight: 2.5
              }}
              onClick={() => setSelectedElement({ type: 'camera', data: cam })}
            />
          </React.Fragment>
        );
      })}

      {/* 2. Signal Color Markers */}
      {showSignals && signalNodes.map((sig) => {
        const hex = getSignalHex(sig.light);
        return (
          <MarkerF
            key={sig.id}
            position={sig.position}
            title={`${sig.name}: ${sig.light}`}
            icon={{
              path: window.google ? window.google.maps.SymbolPath.CIRCLE : undefined,
              scale: 10,
              fillColor: hex,
              fillOpacity: 1,
              strokeColor: '#FFFFFF',
              strokeWeight: 3
            }}
            onClick={() => setSelectedElement({ type: 'signal', data: sig })}
          />
        );
      })}

      {/* 3. Green Corridor Emergency Path & Markers (Real Street Driving Polyline) */}
      {showCorridor && roadPathPoints.length > 0 && (
        <>
          {/* Single Real Street Driving Polyline */}
          <Polyline
            path={roadPathPoints}
            options={{
              strokeColor: '#22C55E',
              strokeOpacity: 0.95,
              strokeWeight: 6,
              geodesic: true
            }}
          />

          {/* Emergency Vehicle Arrow Marker at Start of Real Road */}
          <MarkerF
            position={roadPathPoints[0]}
            title={`Emergency Service (${emergency?.vehicleId || 'DL-01-AMB-889'})`}
            icon={{
              path: window.google ? window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW : undefined,
              scale: 8.5,
              fillColor: emergency?.active ? '#DC2626' : '#EA580C',
              fillOpacity: 1,
              strokeColor: '#FFFFFF',
              strokeWeight: 2.5,
              rotation: 15
            }}
            onClick={() => setSelectedElement({
              type: 'ambulance',
              data: {
                name: `Emergency ${emergency?.vehicleLabel || 'Ambulance'} (${emergency?.vehicleId || 'DL-01-AMB-889'})`,
                status: emergency?.active ? 'CLEARING GREEN CORRIDOR' : 'STANDBY DISPATCH',
                hospital: `${activeCity?.name || 'Local'} Emergency Trauma Hub`,
                speed: emergency?.active ? '68 km/h' : '0 km/h'
              }
            })}
          />

          {/* Destination Hospital Teardrop Pin Marker at End of Real Road */}
          <MarkerF
            position={roadPathPoints[roadPathPoints.length - 1]}
            title={`${activeCity?.name || 'Local'} Emergency Trauma Hub`}
            icon={{
              path: 'M 0 0 C -12 -12 -16 -20 -16 -28 A 16 16 0 1 1 16 -28 C 16 -20 12 -12 0 0 Z',
              scale: 1.1,
              fillColor: '#16A34A',
              fillOpacity: 1,
              strokeColor: '#FFFFFF',
              strokeWeight: 2.5
            }}
            onClick={() => setSelectedElement({
              type: 'hospital',
              data: {
                name: `${activeCity?.name || 'Local'} Emergency Trauma Hub`,
                triageReady: 'ICU Triage Bay 4 Prepped & Synced',
                distance: '2.4 km'
              }
            })}
          />
        </>
      )}

      {/* 4. InfoWindow Popup on Click */}
      {selectedElement && (
        <InfoWindow
          position={
            selectedElement.type === 'camera'
              ? selectedElement.data.center
              : selectedElement.type === 'signal'
                ? selectedElement.data.position
                : selectedElement.type === 'ambulance'
                  ? ambulancePos
                  : destinationPos
          }
          onCloseClick={() => setSelectedElement(null)}
        >
          <div style={{ padding: '8px 12px', minWidth: '180px', color: '#0F172A' }}>
            <div style={{ fontSize: '13px', fontWeight: '800', marginBottom: '4px' }}>
              {selectedElement.data.name}
            </div>
            {selectedElement.type === 'camera' && (
              <div style={{ fontSize: '11px', color: '#475569' }}>
                <div>Approach: {selectedElement.data.approach}</div>
                <div>Coverage Radius: {selectedElement.data.radius}m</div>
                <div>AI Model: {selectedElement.data.detectionModel}</div>
                <div style={{ color: '#0284C7', fontWeight: '700', marginTop: '4px' }}>
                  Live Vehicles: {selectedElement.data.activeVehicles} units ({selectedElement.data.densityPct}%)
                </div>
              </div>
            )}
            {selectedElement.type === 'signal' && (
              <div style={{ fontSize: '11px', color: '#475569' }}>
                <div>Approach: {selectedElement.data.approach}</div>
                <div>State: <strong style={{ color: getSignalHex(selectedElement.data.light) }}>{selectedElement.data.light}</strong> ({selectedElement.data.greenSec}s)</div>
                <div>Approach Density: {selectedElement.data.densityPct}%</div>
              </div>
            )}
            {selectedElement.type === 'ambulance' && (
              <div style={{ fontSize: '11px', color: '#475569' }}>
                <div>Status: <strong style={{ color: '#DC2626' }}>{selectedElement.data.status}</strong></div>
                <div>Destination: {selectedElement.data.hospital}</div>
                <div>Speed: {selectedElement.data.speed}</div>
              </div>
            )}
          </div>
        </InfoWindow>
      )}
    </>
  );

  return (
    <div className="view-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* 1. Emergency Active Live Banner Overlay */}
      {emergency?.active && (
        <div
          className="view-fade-in"
          style={{
            backgroundColor: '#7F1D1D',
            border: '2px solid #EF4444',
            borderRadius: 'var(--radius-md)',
            padding: '12px 20px',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Siren size={20} color="#FCA5A5" className="animate-pulse-slow" />
            <div>
              <span style={{ fontSize: '13px', fontWeight: '800' }}>
                GREEN CORRIDOR PATH ACTIVE: Emergency Vehicle ➔ Trauma Hub
              </span>
              <span style={{ fontSize: '11px', display: 'block', color: '#FECACA' }}>
                Live green trajectory active • Pre-clearing signals 75s ahead
              </span>
            </div>
          </div>


        </div>
      )}

      {/* 2. Network Stats Bar */}
      {(() => {
        const appArr = Object.values(approaches || {});
        const avgDensity = appArr.length
          ? Math.round(appArr.reduce((s, a) => s + (a.densityPct || 0), 0) / appArr.length)
          : 77;
        const networkRisk = Math.min(100, Math.round(avgDensity * 0.68 + (emergency?.active ? 12 : 0)));
        const highRiskCount = appArr.filter((a) => (a.densityPct || 0) >= 75).length;
        const activeIncidents = alerts?.length || 6;
        const emergencyUnits = emergency?.active ? 3 : 1;
        const ambulancesEnRoute = emergency?.active ? 1 : 0;
        const coveragePct = 50;

        const stats = [
          {
            id: 'network-risk',
            label: 'Network Risk',
            value: networkRisk,
            max: 100,
            unit: '/100',
            sub: 'Weighted across 16 junctions',
            color: networkRisk >= 70 ? '#DC2626' : networkRisk >= 50 ? '#F59E0B' : '#16A34A',
            bg: networkRisk >= 70 ? '#FEF2F2' : networkRisk >= 50 ? '#FFFBEB' : '#F0FDF4',
            border: networkRisk >= 70 ? '#FCA5A5' : networkRisk >= 50 ? '#FCD34D' : '#86EFAC',
            isScore: true
          },
          {
            id: 'avg-congestion',
            label: 'Avg Congestion',
            value: avgDensity,
            max: 100,
            unit: '/100',
            sub: 'Across active approaches',
            color: avgDensity >= 80 ? '#DC2626' : avgDensity >= 60 ? '#F59E0B' : '#16A34A',
            bg: avgDensity >= 80 ? '#FEF2F2' : avgDensity >= 60 ? '#FFFBEB' : '#F0FDF4',
            border: avgDensity >= 80 ? '#FCA5A5' : avgDensity >= 60 ? '#FCD34D' : '#86EFAC',
            isScore: true
          },
          {
            id: 'high-risk-junctions',
            label: 'High-Risk Junctions',
            value: highRiskCount,
            unit: '',
            sub: 'Density \u2265 75% threshold',
            color: '#EA580C',
            bg: '#FFF7ED',
            border: '#FDBA74',
            isScore: false
          },
          {
            id: 'active-incidents',
            label: 'Active Incidents',
            value: activeIncidents,
            unit: '',
            sub: 'Open in alert stream',
            color: '#7C3AED',
            bg: '#F5F3FF',
            border: '#C4B5FD',
            isScore: false
          },
          {
            id: 'emergency-units',
            label: 'Emergency Units',
            value: emergencyUnits,
            unit: '',
            sub: emergency?.active ? '\uD83D\uDEA8 Corridor active' : 'On standby',
            color: '#DC2626',
            bg: emergency?.active ? '#FEF2F2' : '#F8FAFC',
            border: emergency?.active ? '#F87171' : '#E2E8F0',
            isScore: false,
            pulse: emergency?.active
          },
          {
            id: 'ambulances-en-route',
            label: 'Ambulances En Route',
            value: ambulancesEnRoute,
            unit: '',
            sub: emergency?.active ? (emergency.vehicleId || 'DL-01-AMB-889') : 'No dispatch active',
            color: '#0284C7',
            bg: '#F0F9FF',
            border: '#7DD3FC',
            isScore: false
          },
          {
            id: 'junction-coverage',
            label: 'Junction Coverage',
            value: coveragePct,
            max: 100,
            unit: '%',
            sub: '16 nodes monitored',
            color: '#16A34A',
            bg: '#F0FDF4',
            border: '#86EFAC',
            isScore: true
          }
        ];

        return (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '10px' }}>
            {stats.map((s) => (
              <div
                key={s.id}
                style={{
                  backgroundColor: s.bg,
                  border: `1px solid ${s.border}`,
                  borderRadius: '12px',
                  padding: '14px 12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', backgroundColor: s.color, borderRadius: '12px 12px 0 0' }} />
                <div style={{ fontSize: '10px', fontWeight: '800', color: '#64748B', letterSpacing: '0.04em', textTransform: 'uppercase', lineHeight: 1.3 }}>
                  {s.label}
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '2px' }}>
                  <span
                    style={{ fontSize: '28px', fontWeight: '900', color: s.color, fontFamily: 'Outfit, sans-serif', lineHeight: 1, letterSpacing: '-0.02em' }}
                    className={s.pulse ? 'animate-pulse-slow' : ''}
                  >
                    {s.value}
                  </span>
                  {s.unit && (
                    <span style={{ fontSize: '12px', fontWeight: '700', color: '#94A3B8' }}>{s.unit}</span>
                  )}
                </div>
                {s.isScore && (
                  <div style={{ height: '4px', backgroundColor: '#E2E8F0', borderRadius: '9999px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${Math.min((s.value / s.max) * 100, 100)}%`, backgroundColor: s.color, borderRadius: '9999px', transition: 'width 0.6s ease' }} />
                  </div>
                )}
                <div style={{ fontSize: '10px', color: '#94A3B8', fontWeight: '500', lineHeight: 1.3 }}>{s.sub}</div>
              </div>
            ))}
          </div>
        );
      })()}

      {/* 3. Main Map Container & Permanent Side Filter Panel */}
      <div style={{ display: 'flex', gap: '16px', width: '100%', alignItems: 'stretch' }}>
        {/* Left: Map View */}
        <div style={{ flex: 1, minWidth: 0, position: 'relative', overflow: 'hidden', borderRadius: '16px' }}>
          {isLoaded ? (
            <GoogleMap
              mapContainerStyle={MAP_CONTAINER_STYLE}
              center={mapCenter}
              zoom={14}
              options={MAP_OPTIONS}
              onLoad={onLoadMap}
              onUnmount={onUnmountMap}
            >
              {renderMapContent()}
            </GoogleMap>
          ) : (
            <div
              style={{
                width: '100%',
                height: '640px',
                backgroundColor: '#0F172A',
                borderRadius: '16px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                color: '#94A3B8'
              }}
            >
              <div style={{ fontSize: '15px', fontWeight: '700', color: '#F8FAFC' }}>
                Loading Map Radar...
              </div>
              <div style={{ fontSize: '13px', color: '#64748B' }}>
                Synchronizing Live GIS Layers & Node Telemetry
              </div>
            </div>
          )}
        </div>

        {/* Right: Permanent Map Filters & Layer Controls Panel */}
        <div
          style={{
            width: '320px',
            flexShrink: 0,
            backgroundColor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '16px',
            padding: '20px',
            boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            position: 'relative',
            zIndex: 10
          }}
        >
          {/* Panel Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Filter size={18} color="#FF5A43" />
              <div style={{ fontSize: '15px', fontWeight: '800', color: '#0F172A' }}>
                Map Filters & Layers
              </div>
            </div>
            {clearAllFilters && (
              <button
                onClick={clearAllFilters}
                title="Reset all filters"
                style={{ fontSize: '11px', fontWeight: '700', color: '#FF5A43', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <RotateCcw size={12} />
                <span>Reset</span>
              </button>
            )}
          </div>

          {/* Section 1: GIS Radar Layers */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ fontSize: '11px', fontWeight: '800', color: '#94A3B8', uppercase: true, letterSpacing: '0.05em' }}>
              RADAR LAYERS
            </div>

            {/* 1. Camera Coverage Filter */}
            <div
              onClick={() => setShowCameras((prev) => !prev)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 12px',
                borderRadius: '10px',
                backgroundColor: showCameras ? '#F0F9FF' : '#F8FAFC',
                border: showCameras ? '1px solid #38BDF8' : '1px solid #E2E8F0',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                userSelect: 'none'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Camera size={16} color={showCameras ? '#0284C7' : '#64748B'} />
                <div>
                  <div style={{ fontSize: '12px', fontWeight: '700', color: showCameras ? '#0369A1' : '#0F172A' }}>
                    Camera Coverage
                  </div>
                  <div style={{ fontSize: '10px', color: '#64748B' }}>
                    {cameraZones.length} CCTV Wedges
                  </div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={showCameras}
                readOnly
                style={{ width: '16px', height: '16px', accentColor: '#0284C7', cursor: 'pointer', pointerEvents: 'none' }}
              />
            </div>

            {/* 2. Signal Colors Filter */}
            <div
              onClick={() => setShowSignals((prev) => !prev)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 12px',
                borderRadius: '10px',
                backgroundColor: showSignals ? '#F0FDF4' : '#F8FAFC',
                border: showSignals ? '1px solid #4ADE80' : '1px solid #E2E8F0',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                userSelect: 'none'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Zap size={16} color={showSignals ? '#16A34A' : '#64748B'} />
                <div>
                  <div style={{ fontSize: '12px', fontWeight: '700', color: showSignals ? '#15803D' : '#0F172A' }}>
                    Signal Colors
                  </div>
                  <div style={{ fontSize: '10px', color: '#64748B' }}>
                    {signalNodes.length} Traffic Lights
                  </div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={showSignals}
                readOnly
                style={{ width: '16px', height: '16px', accentColor: '#16A34A', cursor: 'pointer', pointerEvents: 'none' }}
              />
            </div>

            {/* 3. Green Corridor Path Filter */}
            <div
              onClick={() => setShowCorridor((prev) => !prev)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 12px',
                borderRadius: '10px',
                backgroundColor: emergency?.active ? '#FEF2F2' : showCorridor ? '#FEF3C7' : '#F8FAFC',
                border: emergency?.active ? '1px solid #F87171' : showCorridor ? '1px solid #FBBF24' : '1px solid #E2E8F0',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                userSelect: 'none'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Siren size={16} color={emergency?.active ? '#DC2626' : showCorridor ? '#D97706' : '#64748B'} />
                <div>
                  <div style={{ fontSize: '12px', fontWeight: '700', color: emergency?.active ? '#991B1B' : showCorridor ? '#B45309' : '#0F172A' }}>
                    Green Corridor Path
                  </div>
                  <div style={{ fontSize: '10px', color: '#64748B' }}>
                    {emergency?.active ? '🚨 Corridor Active' : 'Emergency Route Layer'}
                  </div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={showCorridor}
                readOnly
                style={{ width: '16px', height: '16px', accentColor: '#D97706', cursor: 'pointer', pointerEvents: 'none' }}
              />
            </div>
          </div>

          {/* Section 2: Global Telemetry Filters */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', borderTop: '1px solid #F1F5F9', paddingTop: '14px' }}>
            <div style={{ fontSize: '11px', fontWeight: '800', color: '#94A3B8', uppercase: true, letterSpacing: '0.05em' }}>
              GLOBAL FILTERS
            </div>

            {/* Junction Dropdown */}
            <Dropdown
              label={`Active Junction (${activeCity?.name || 'City'})`}
              options={cityJunctionOptions}
              value={selectedJunction}
              onChange={(val) => setSelectedJunction && setSelectedJunction(val)}
            />

          </div>
        </div>
      </div>

    </div>
  );
};

export default OverviewView;

import React, { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import { useJsApiLoader, GoogleMap, MarkerF, PolygonF, Polyline, DirectionsRenderer, InfoWindow } from '@react-google-maps/api';
import { useTraffic } from '../../../context/TrafficContext';
import { INDIAN_CITIES, generateOverviewStats } from '../../../data/dummyData';
import { Badge } from '../../common/Badge';
import { Dropdown } from '../../common/Dropdown';
import { AccidentHazardBanner } from '../AccidentHazardBanner';
import {
  Camera,
  Siren,
  RotateCcw,
  Zap,
  Filter,
  Road
} from 'lucide-react';

const RadarLayerItem = ({ title, subtitle, icon: Icon, isActive, onClick }) => (
  <div
    onClick={onClick}
    className={`flex items-center justify-between py-2.5 px-3 rounded-sm cursor-pointer duration-300 select-none border bg-(--color-5) ${isActive ? 'border-(--color-6)' : 'border-(--color-3)'}`}
  >
    <div className="flex items-center gap-2.5">
      <Icon size={18} color={isActive ? '#1629d2' : '#272727'} />
      <div>
        <div className={`text-[13px] ${isActive && 'text-(--color-6)'}`}>
          {title}
        </div>
        <div className="mt-0.5 text-xs text-(--color-2)">
          {subtitle}
        </div>
      </div>
    </div>
    <input
      type="checkbox"
      checked={isActive}
      readOnly
      className="w-4 h-4 accent-(--color-6) cursor-pointer pointer-events-none"
    />
  </div>
);

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
          <div className="py-2 px-3 min-w-[180px] text-slate-900">
            <div className="text-[13px] font-extrabold mb-1">
              {selectedElement.data.name}
            </div>
            {selectedElement.type === 'camera' && (
              <div className="text-[11px] text-slate-600">
                <div>Approach: {selectedElement.data.approach}</div>
                <div>Coverage Radius: {selectedElement.data.radius}m</div>
                <div>AI Model: {selectedElement.data.detectionModel}</div>
                <div className="text-sky-600 font-bold mt-1">
                  Live Vehicles: {selectedElement.data.activeVehicles} units ({selectedElement.data.densityPct}%)
                </div>
              </div>
            )}
            {selectedElement.type === 'signal' && (
              <div className="text-[11px] text-slate-600">
                <div>Approach: {selectedElement.data.approach}</div>
                <div>State: <strong style={{ color: getSignalHex(selectedElement.data.light) }}>{selectedElement.data.light}</strong> ({selectedElement.data.greenSec}s)</div>
                <div>Approach Density: {selectedElement.data.densityPct}%</div>
              </div>
            )}
            {selectedElement.type === 'ambulance' && (
              <div className="text-[11px] text-slate-600">
                <div>Status: <strong className="text-red-600">{selectedElement.data.status}</strong></div>
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
    <div className="space-y-6">
      {emergency?.active && (
        <AccidentHazardBanner />
      )}

      {(() => {
        const overview = generateOverviewStats(approaches, emergency, alerts);

        return (
          <div className='bg-(--color-4) rounded-sm p-2'>
            <div className="text-sm mb-2 ml-2">Analytics & Stats</div>
            <div className="flex flex-wrap gap-2.5">
              {overview.map((s) => (
                <div
                  key={s.id}
                  style={{ backgroundColor: s.bg, border: `1px solid ${s.border}` }}
                  className="py-3.5 px-3 rounded-sm flex flex-col gap-1.5 grow max-w-45"
                >
                  <div className="text-sm">
                    {s.label}
                  </div>
                  <div>
                    <span
                      style={{ color: s.color }}
                      className="text-xl"
                    >
                      {s.value}
                    </span>
                    {s.unit && (
                      <span className="text-sm ml-0.5">{s.unit}</span>
                    )}
                  </div>
                  {s.isScore && (
                    <div className="h-1 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${Math.min((s.value / s.max) * 100, 100)}%`, backgroundColor: s.color }}
                        className="h-full rounded-full transition-all duration-300 ease-out"
                      />
                    </div>
                  )}
                  <div className="text-xs">{s.sub}</div>
                </div>
              ))}
            </div>
          </div>
        );
      })()}

      <div className="flex gap-6 w-full">
        <div className="flex-1 min-w-1/2 relative overflow-hidden rounded-sm">
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
            <div className="w-full h-160 bg-(--color-2) grid place-items-center text-center text-(--color-3)">
              <div>
                <div className='text-lg'>
                  Loading Map Radar...
                </div>
                <div className="mt-1 text-sm">
                  Synchronizing Live GIS Layers & Node Telemetry
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="w-fit shrink-0 bg-(--color-4) rounded-sm p-3 space-y-4 relative z-10">
          <div className="flex items-center justify-between pb-3 border-b border-(--color-3)">
            <div className="flex items-center gap-2">
              <Filter size={16} color="#272727" />
              <div className='text-sm'>
                Map Filters & Layers
              </div>
            </div>
            {clearAllFilters && (
              <button
                onClick={clearAllFilters}
                title="Reset all filters"
                className="text-sm text-(--color-6) cursor-pointer flex items-center gap-1"
              >
                <RotateCcw size={14} />
                <span>Reset</span>
              </button>
            )}
          </div>
          <div className="flex flex-col gap-2.5">
            <div className="text-xs text-(--color-2)">
              Radar Layers
            </div>
            <RadarLayerItem
              title="Camera Coverage"
              subtitle={`${cameraZones.length} CCTV Wedges`}
              icon={Camera}
              isActive={showCameras}
              onClick={() => setShowCameras((prev) => !prev)}
            />
            <RadarLayerItem
              title="Traffic Signal"
              subtitle={`${signalNodes.length} Traffic Lights`}
              icon={Zap}
              isActive={showSignals}
              onClick={() => setShowSignals((prev) => !prev)}
            />
            <RadarLayerItem
              title="Green Corridor"
              subtitle="Emergency Route Layer"
              icon={Road}
              isActive={showCorridor}
              onClick={() => setShowCorridor((prev) => !prev)}
            />
          </div>
          <div className="flex flex-col gap-3 border-t border-(--color-3) pt-3">
            <div className="text-xs text-(--color-2)">
              Global Filters
            </div>
            <Dropdown
              label={`Active Junction (${activeCity?.name || ''})`}
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

import React, { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import { useJsApiLoader, GoogleMap, MarkerF, PolygonF, Polyline, InfoWindow } from '@react-google-maps/api';
import { useTraffic } from '../../../context/TrafficContext';
import { INDIAN_CITIES, generateOverviewStats, MAP_CONTAINER_STYLE, MAP_OPTIONS, CAMERA_APPROACH_CONFIG, SIGNAL_APPROACH_CONFIG } from '../../../data/dummyData';
import { getEmergencyFromCorridors, getSignalHex } from '../../../utils/trafficUtils';
import { Badge } from '../../common/Badge';
import { Dropdown } from '../../common/Dropdown';
import { AccidentHazardBanner } from '../AccidentHazardBanner';
import { Camera, Siren, RotateCcw, Zap, Filter, Road } from 'lucide-react';

const RadarLayerItem = ({ title, subtitle, icon: Icon, isActive, onClick }) => (
  <div
    onClick={onClick}
    className={`flex items-center justify-between py-2.5 px-3 rounded-sm cursor-pointer duration-300 select-none border bg-(--color-5) ${isActive ? 'border-(--color-6)' : 'border-(--color-3)'}`}
  >
    <div className="flex items-center gap-2.5">
      <Icon size={18} color={isActive ? '#1629d2' : '#272727'} />
      <div>
        <div className={`text-[13px] ${isActive && 'text-(--color-6)'}`}>{title}</div>
        <div className="mt-0.5 text-xs text-(--color-2)">{subtitle}</div>
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
 */
const calculateSectorPath = (center, radiusMeters, startAngle, endAngle, numPoints = 16) => {
  const path = [center];
  const EARTH_RADIUS = 6378137;
  const latRad = (center.lat * Math.PI) / 180;
  const lngRad = (center.lng * Math.PI) / 180;
  const distRatio = radiusMeters / EARTH_RADIUS;
  let normEnd = endAngle;
  if (normEnd < startAngle) normEnd += 360;
  const step = (normEnd - startAngle) / (numPoints - 1);
  for (let i = 0; i < numPoints; i++) {
    const bearingRad = ((startAngle + step * i) * Math.PI) / 180;
    const pointLatRad = Math.asin(
      Math.sin(latRad) * Math.cos(distRatio) +
      Math.cos(latRad) * Math.sin(distRatio) * Math.cos(bearingRad)
    );
    const pointLngRad = lngRad + Math.atan2(
      Math.sin(bearingRad) * Math.sin(distRatio) * Math.cos(latRad),
      Math.cos(distRatio) - Math.sin(latRad) * Math.sin(pointLatRad)
    );
    path.push({ lat: (pointLatRad * 180) / Math.PI, lng: (pointLngRad * 180) / Math.PI });
  }
  path.push(center);
  return path;
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
    showCameras, setShowCameras,
    showSignals, setShowSignals,
    showCorridor, setShowCorridor,
    clearAllFilters,
  } = useTraffic();
  const { alerts, activeMapElementId, setActiveMapElementId } = useTraffic();
  const [activeIncident, setActiveIncident] = useState(null);
  const [selectedElement, setSelectedElement] = useState(null);
  const emergency = getEmergencyFromCorridors(activeCorridors);
  const isTargeting = false;
  const [equipmentList, setEquipmentList] = useState([]);

  // Fetch Junctions & Equipment for markers
  const [junctions, setJunctions] = useState([]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const { fetchAPI } = await import('../../../utils/api');
        const [juncs, eq] = await Promise.all([
          fetchAPI('/junctions').catch(()=>[]),
          fetchAPI('/equipment').catch(()=>[])
        ]);
        setJunctions(juncs);
        setEquipmentList(eq);
      } catch(e) {
        console.error("Failed to load map data", e);
      }
    };
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);
  const mapRef = useRef(null);

  const onLoadMap = useCallback((map) => { mapRef.current = map; }, []);
  const onUnmountMap = useCallback(() => { mapRef.current = null; }, []);

  const centerLat = cityCenter?.lat || INDIAN_CITIES[0].center.lat;
  const centerLng = cityCenter?.lng || INDIAN_CITIES[0].center.lng;
  const mapCenter = useMemo(() => ({ lat: centerLat, lng: centerLng }), [centerLat, centerLng]);

  // Smoothly pan map when city changes
  useEffect(() => {
    if (mapRef.current && cityCenter) {
      mapRef.current.panTo(cityCenter);
      mapRef.current.setZoom(14);
    }
  }, [cityCenter]);

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
    libraries: GOOGLE_MAPS_LIBRARIES
  });

  // Safe approach extractors
  const northApp = approaches?.North || { vehicleCount: 0, densityPct: 0, currentLight: 'RED', greenSec: 0 };
  const eastApp  = approaches?.East  || { vehicleCount: 0, densityPct: 0, currentLight: 'RED', greenSec: 0 };
  const westApp  = approaches?.West  || { vehicleCount: 0, densityPct: 0, currentLight: 'RED', greenSec: 0 };
  const southApp = approaches?.South || { vehicleCount: 0, densityPct: 0, currentLight: 'RED', greenSec: 0 };

  // Generate junction nodes for ALL Indian cities from INDIAN_CITIES data
  const junctionNodes = useMemo(() => {
    const nodes = [];
    INDIAN_CITIES.forEach((city) => {
      const { lat, lng } = city.center;
      (city.junctions || [`${city.name} Main Hub`]).forEach((jName, idx) => {
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
    // Custom searched city
    if (activeCity && !INDIAN_CITIES.some((c) => c.id === activeCity.id)) {
      const { lat, lng } = activeCity.center;
      nodes.push(
        { id: `${activeCity.id}-JUNC-1`, cityId: activeCity.id, cityName: activeCity.name, name: `${activeCity.name} Central Junction`, position: { lat, lng }, densityPct: 78, vehicleCount: 64, status: 'CRITICAL' },
        { id: `${activeCity.id}-JUNC-2`, cityId: activeCity.id, cityName: activeCity.name, name: `${activeCity.name} Ring Road Node`, position: { lat: lat + 0.008, lng: lng + 0.010 }, densityPct: 62, vehicleCount: 48, status: 'HIGH' }
      );
    }
    return nodes;
  }, [activeCity]);

  // Camera FOV wedge zones derived from CAMERA_APPROACH_CONFIG
  const cameraZones = useMemo(() => {
    const zones = [];
    junctionNodes.forEach((junc) => {
      const { lat, lng } = junc.position;
      CAMERA_APPROACH_CONFIG.forEach((cfg) => {
        const appMap = { N: northApp, E: eastApp, W: westApp, S: southApp };
        const app = junc.name === selectedJunction ? appMap[cfg.dir] : null;
        if (!app) return;
        zones.push({
          id: `${junc.id}-CAM-${cfg.dir}`,
          junctionName: junc.name,
          name: `${junc.name} ${cfg.label}`,
          approach: `${cfg.dir === 'N' ? 'North' : cfg.dir === 'E' ? 'East' : cfg.dir === 'W' ? 'West' : 'South'} Approach`,
          center: { lat: lat + cfg.latOff, lng: lng + cfg.lngOff },
          radius: 140,
          startAngle: cfg.startAngle,
          endAngle: cfg.endAngle,
          fovSector: '70° Sector Arc',
          resolution: '1080p 60fps',
          detectionModel: cfg.model,
          activeVehicles: app.vehicleCount,
          densityPct: app.densityPct,
          color: '#F59E0B'
        });
      });
    });
    return zones;
  }, [junctionNodes]);

  // Signal nodes derived from SIGNAL_APPROACH_CONFIG
  const signalNodes = useMemo(() => {
    const signals = [];
    const appMap = { North: northApp, East: eastApp, West: westApp, South: southApp };
    junctionNodes.forEach((junc) => {
      const { lat, lng } = junc.position;
      SIGNAL_APPROACH_CONFIG.forEach((cfg) => {
        const app = junc.name === selectedJunction ? appMap[cfg.appKey] : null;
        if (!app) return;
        signals.push({
          id: `${junc.id}-SIG-${cfg.dir}`,
          junctionName: junc.name,
          name: `${junc.name} ${cfg.appKey} Signal`,
          approach: `${cfg.appKey} Approach`,
          position: { lat: lat + cfg.latOff, lng: lng + cfg.lngOff },
          light: app.currentLight,
          greenSec: app.greenSec,
          densityPct: app.densityPct,
          vehicles: app.vehicleCount
        });
      });
    });
    return signals;
  }, [junctionNodes, selectedJunction, northApp, eastApp, westApp, southApp]);

  // Junction dropdown options for active city
  const cityJunctionOptions = useMemo(() => {
    const activeJuncs = junctionNodes.filter((j) => j.cityId === (activeCity?.id || 'delhi'));
    if (activeJuncs.length === 0) {
      return [{ value: selectedJunction || 'Central Hub', label: selectedJunction || 'Central Hub' }];
    }
    return activeJuncs.map((j) => ({ value: j.name, label: j.name }));
  }, [junctionNodes, activeCity, selectedJunction]);

  // Pan to selected junction on change
  useEffect(() => {
    if (!selectedJunction || !mapRef.current) return;
    const targetJunc = junctionNodes.find((j) => j.name === selectedJunction);
    if (targetJunc) { mapRef.current.panTo(targetJunc.position); mapRef.current.setZoom(15); }
  }, [selectedJunction, junctionNodes]);

  // Listen for activeMapElementId to pan map to device
  useEffect(() => {
    if (activeMapElementId && mapRef.current) {
      const mapContainer = document.getElementById('map-radar-container');
      if (mapContainer) mapContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setIsTargeting(true);
      setTimeout(() => {
        setIsTargeting(false);
        const cam = cameraZones.find((c) => c.id === activeMapElementId);
        if (cam) { setSelectedElement({ type: 'camera', data: cam }); mapRef.current.panTo(cam.center); mapRef.current.setZoom(18); setActiveMapElementId(null); return; }
        const sig = signalNodes.find((s) => s.id === activeMapElementId);
        if (sig) { setSelectedElement({ type: 'signal', data: sig }); mapRef.current.panTo(sig.position); mapRef.current.setZoom(18); setActiveMapElementId(null); }
      }, 1000);
    }
  }, [activeMapElementId, cameraZones, signalNodes]);

  // Emergency corridor route polylines
  const [corridorPaths, setCorridorPaths] = useState({});

  useEffect(() => {
    let isMounted = true;
    activeCorridors.forEach(async (corridor) => {
      // Skip if we already have the path or it has dynamic points already
      if (corridorPaths[corridor.id] || (corridor.pathPoints && corridor.pathPoints.length > 0)) {
        if (corridor.pathPoints && corridor.pathPoints.length > 0 && !corridorPaths[corridor.id]) {
          setCorridorPaths((prev) => ({ ...prev, [corridor.id]: corridor.pathPoints }));
        }
        return;
      }
      
      const origin = corridor.originPos;
      const dest = corridor.destPos;
      if (!origin || !dest) return;

      try {
        const url = `https://router.project-osrm.org/route/v1/driving/${origin.lng},${origin.lat};${dest.lng},${dest.lat}?overview=full&geometries=geojson`;
        const res = await fetch(url);
        const data = await res.json();
        if (data?.routes?.[0]?.geometry) {
          const formatted = data.routes[0].geometry.coordinates.map(([lng, lat]) => ({ lat, lng }));
          if (isMounted && formatted.length > 0) {
            setCorridorPaths((prev) => ({ ...prev, [corridor.id]: formatted }));
          }
        }
      } catch (e) { console.warn('OSRM error for corridor:', corridor.id, e); }
    });
    
    return () => { isMounted = false; };
  }, [activeCorridors, corridorPaths]);

  const renderMapContent = () => (
    <>
      {/* Junction Hub Markers */}
      {junctionNodes.map((junc) => (
        <MarkerF
          key={junc.id}
          position={junc.position}
          title={`Junction: ${junc.name} (${junc.vehicleCount} vehicles)`}
          icon={{
            path: window.google ? window.google.maps.SymbolPath.CIRCLE : undefined,
            scale: junc.name === selectedJunction ? 14 : 11,
            fillColor: junc.name === selectedJunction ? '#7C3AED' : '#4F46E5',
            fillOpacity: 1, strokeColor: '#FFFFFF', strokeWeight: 3
          }}
          onClick={() => { setSelectedJunction && setSelectedJunction(junc.name); setSelectedElement({ type: 'junction', data: junc }); }}
        />
      ))}

      {/* Camera FOV Wedges */}
      {showCameras && cameraZones.map((cam) => {
        const sectorPath = calculateSectorPath(cam.center, cam.radius, cam.startAngle, cam.endAngle);
        return (
          <React.Fragment key={cam.id}>
            <PolygonF
              paths={sectorPath}
              options={{ strokeColor: cam.color, strokeOpacity: 0.95, strokeWeight: 2.5, fillColor: cam.color, fillOpacity: 0.35, clickable: true }}
              onClick={() => setSelectedElement({ type: 'camera', data: cam })}
            />
            <MarkerF
              position={cam.center}
              title={`${cam.name} (${cam.fovSector})`}
              icon={{ path: window.google ? window.google.maps.SymbolPath.CIRCLE : undefined, scale: 8, fillColor: cam.color, fillOpacity: 1, strokeColor: '#FFFFFF', strokeWeight: 2.5 }}
              onClick={() => setSelectedElement({ type: 'camera', data: cam })}
            />
          </React.Fragment>
        );
      })}

      {/* Signal Color Markers */}
      {showSignals && signalNodes.map((sig) => {
        const hex = getSignalHex(sig.light);
        return (
          <MarkerF
            key={sig.id}
            position={sig.position}
            title={`${sig.name}: ${sig.light}`}
            icon={{ path: window.google ? window.google.maps.SymbolPath.CIRCLE : undefined, scale: 10, fillColor: hex, fillOpacity: 1, strokeColor: '#FFFFFF', strokeWeight: 3 }}
            onClick={() => setSelectedElement({ type: 'signal', data: sig })}
          />
        );
      })}

      {/* Green Corridor Polyline & Markers */}
      {showCorridor && activeCorridors.map((corridor) => {
        const path = corridorPaths[corridor.id];
        if (!path || path.length === 0) return null;
        return (
          <React.Fragment key={corridor.id}>
            <Polyline
              path={path}
              options={{ strokeColor: '#22C55E', strokeOpacity: 0.95, strokeWeight: 6, geodesic: true }}
            />
            <MarkerF
              position={path[0]}
              title={`Emergency Service (${corridor.vehicleId})`}
              icon={{ path: window.google ? window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW : undefined, scale: 8.5, fillColor: corridor.active ? '#DC2626' : '#EA580C', fillOpacity: 1, strokeColor: '#FFFFFF', strokeWeight: 2.5, rotation: 15 }}
              onClick={() => setSelectedElement({
                type: 'ambulance',
                data: {
                  position: path[0],
                  name: `Emergency ${corridor.vehicleLabel} (${corridor.vehicleId})`,
                  status: corridor.active ? 'CLEARING GREEN CORRIDOR' : 'STANDBY DISPATCH',
                  hospital: corridor.destination,
                  speed: corridor.active ? '68 km/h' : '0 km/h'
                }
              })}
            />
            {junctions.map((j) => (
              <MarkerF
                key={j.id}
                position={{ lat: j.latitude, lng: j.longitude }}
                icon={{
                  path: window.google.maps.SymbolPath.CIRCLE,
                  scale: 8,
                  fillColor: '#6366f1',
                  fillOpacity: 0.8,
                  strokeWeight: 2,
                  strokeColor: '#ffffff',
                }}
                title={j.name}
              />
            ))}
            
            {equipmentList.map((eq) => {
              const isCam = eq.device_type === 'CAMERA';
              const isSelected = activeMapElementId === eq.device_id;
              
              return (
                <MarkerF
                  key={eq.device_id}
                  position={{ lat: eq.latitude, lng: eq.longitude }}
                  title={eq.name}
                  icon={{
                    // Camera icon (SVG path) or simple square for signals
                    path: isCam 
                      ? "M 10,2 10,6 22,6 22,22 2,22 2,6 10,6 10,2 z M 6,14 A 4,4 0 1,1 14,14 A 4,4 0 1,1 6,14" 
                      : "M 4,4 L 20,4 L 20,20 L 4,20 Z",
                    fillColor: isSelected ? '#3b82f6' : isCam ? '#10b981' : '#f59e0b',
                    fillOpacity: 1,
                    strokeWeight: 1,
                    strokeColor: '#ffffff',
                    scale: isSelected ? 1.2 : 0.8,
                    anchor: new window.google.maps.Point(12, 12)
                  }}
                  zIndex={isSelected ? 100 : 10}
                />
              );
            })}
            
            {/* Draw green corridor paths */}
            <MarkerF
              position={path[path.length - 1]}
              title={corridor.destination}
              icon={{ path: 'M 0 0 C -12 -12 -16 -20 -16 -28 A 16 16 0 1 1 16 -28 C 16 -20 12 -12 0 0 Z', scale: 1.1, fillColor: '#16A34A', fillOpacity: 1, strokeColor: '#FFFFFF', strokeWeight: 2.5 }}
              onClick={() => setSelectedElement({ 
                type: 'hospital', 
                data: { 
                  position: path[path.length - 1],
                  name: corridor.destination, 
                  triageReady: 'ICU Triage Bay Prepped & Synced', 
                  distance: 'Calculated dynamically' 
                } 
              })}
            />
          </React.Fragment>
        );
      })}

      {/* InfoWindow on Click */}
      {selectedElement && (
        <InfoWindow
          position={
            selectedElement.type === 'camera' ? selectedElement.data.center
            : selectedElement.type === 'signal' ? selectedElement.data.position
            : selectedElement.data.position
          }
          onCloseClick={() => setSelectedElement(null)}
        >
          <div className="py-2 px-3 min-w-45 text-slate-900">
            <div className="text-[13px] font-extrabold mb-1">{selectedElement.data.name}</div>
            {selectedElement.type === 'camera' && (
              <div className="text-[11px] text-slate-600">
                <div>Approach: {selectedElement.data.approach}</div>
                <div>Coverage Radius: {selectedElement.data.radius}m</div>
                <div>AI Model: {selectedElement.data.detectionModel}</div>
                <div className="text-sky-600 font-bold mt-1">Live Vehicles: {selectedElement.data.activeVehicles} units ({selectedElement.data.densityPct}%)</div>
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
      {emergency?.active && <AccidentHazardBanner />}

      {/* Analytics Stats */}
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
                  <div className="text-sm">{s.label}</div>
                  <div>
                    <span style={{ color: s.color }} className="text-xl">{s.value}</span>
                    {s.unit && <span className="text-sm ml-0.5">{s.unit}</span>}
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

      {/* Map + Filters */}
      <div className="flex gap-6 w-full" id="map-radar-container">
        <div className="flex-1 min-w-1/2 relative overflow-hidden rounded-sm border border-(--color-3)">
          {isTargeting && (
            <div className="absolute inset-0 z-50 bg-[#0f172a]/70 backdrop-blur-md flex flex-col items-center justify-center">
              <div className="w-10 h-10 border-4 border-[#3b82f6]/20 border-t-[#3b82f6] rounded-full animate-spin" />
              <div className="mt-4 text-(--color-5)">Locating Device</div>
              <div className="mt-1 text-sm text-(--color-3)">Please wait while loading location...</div>
            </div>
          )}
          {isLoaded ? (
            <GoogleMap mapContainerStyle={MAP_CONTAINER_STYLE} center={mapCenter} zoom={14} options={MAP_OPTIONS} onLoad={onLoadMap} onUnmount={onUnmountMap}>
              {renderMapContent()}
            </GoogleMap>
          ) : (
            <div className="w-full h-160 bg-(--color-2) grid place-items-center text-center text-(--color-3)">
              <div>
                <div className='text-lg'>Loading Map Radar...</div>
                <div className="mt-1 text-sm">Synchronizing Live GIS Layers & Node Telemetry</div>
              </div>
            </div>
          )}
        </div>

        {/* Layer Controls */}
        <div className="w-fit shrink-0 bg-(--color-4) rounded-sm p-3 space-y-4 relative z-10">
          <div className="flex items-center justify-between pb-3 border-b border-(--color-3)">
            <div className="flex items-center gap-2">
              <Filter size={16} color="#272727" />
              <div className='text-sm'>Map Filters & Layers</div>
            </div>
            {clearAllFilters && (
              <button onClick={clearAllFilters} title="Reset all filters" className="text-sm text-(--color-6) cursor-pointer flex items-center gap-1">
                <RotateCcw size={14} />
                <span>Reset</span>
              </button>
            )}
          </div>
          <div className="flex flex-col gap-2.5">
            <div className="text-xs text-(--color-2)">Radar Layers</div>
            <RadarLayerItem title="Camera Coverage" subtitle={`${cameraZones.length} CCTV Wedges`} icon={Camera} isActive={showCameras} onClick={() => setShowCameras((prev) => !prev)} />
            <RadarLayerItem title="Traffic Signal" subtitle={`${signalNodes.length} Traffic Lights`} icon={Zap} isActive={showSignals} onClick={() => setShowSignals((prev) => !prev)} />
            <RadarLayerItem title="Green Corridor" subtitle="Emergency Route Layer" icon={Road} isActive={showCorridor} onClick={() => setShowCorridor((prev) => !prev)} />
          </div>
          <div className="flex flex-col gap-3 border-t border-(--color-3) pt-3">
            <div className="text-xs text-(--color-2)">Global Filters</div>
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

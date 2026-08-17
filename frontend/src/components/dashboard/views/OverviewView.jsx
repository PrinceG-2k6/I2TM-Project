import React, { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
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
  const { alerts, activeMapElementId, setActiveMapElementId, liveAmbulances, liveMLStats } = useTraffic();
  const [activeIncident, setActiveIncident] = useState(null);
  const [selectedElement, setSelectedElement] = useState(null);
  const emergency = getEmergencyFromCorridors(activeCorridors);
  const [isTargeting, setIsTargeting] = useState(false);
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

  // Use junctions from the backend
  const junctionNodes = useMemo(() => {
    return junctions.map((j) => ({
      id: j.id,
      cityId: 'nagpur',
      cityName: 'Nagpur',
      name: j.name,
      position: { lat: j.latitude, lng: j.longitude },
      densityPct: Math.floor(Math.random() * 40) + 50,
      vehicleCount: Math.floor(Math.random() * 90) + 35,
      status: j.status || 'ACTIVE'
    }));
  }, [junctions]);

  // Camera FOV wedge zones derived from backend equipment
  const cameraZones = useMemo(() => {
    return equipmentList
      .filter(eq => eq.device_type === 'CAMERA')
      .map(eq => {
        const app = eq.approach || '';
        let startAngle = 0, endAngle = 360;
        if (app.includes('North')) { startAngle = 55; endAngle = 125; }
        else if (app.includes('East')) { startAngle = 145; endAngle = 215; }
        else if (app.includes('West')) { startAngle = 235; endAngle = 305; }
        else if (app.includes('South')) { startAngle = 325; endAngle = 35; }
        
        return {
          id: eq.device_id,
          junctionName: eq.junction_name,
          name: eq.name,
          approach: eq.approach,
          center: { lat: eq.latitude, lng: eq.longitude },
          radius: 140,
          startAngle,
          endAngle,
          fovSector: '70° Sector Arc',
          resolution: '1080p 60fps',
          detectionModel: 'YOLOv8',
          activeVehicles: Math.floor(Math.random() * 40),
          densityPct: Math.floor(Math.random() * 100),
          color: '#F59E0B'
        };
      });
  }, [equipmentList]);

  // Signal nodes derived from backend equipment
  const signalNodes = useMemo(() => {
    return equipmentList
      .filter(eq => eq.device_type === 'SIGNAL')
      .map(eq => {
        return {
          id: eq.device_id,
          junctionName: eq.junction_name,
          name: eq.name,
          approach: eq.approach,
          position: { lat: eq.latitude, lng: eq.longitude },
          light: ['RED', 'GREEN', 'YELLOW'][Math.floor(Math.random() * 3)],
          greenSec: Math.floor(Math.random() * 60),
          densityPct: Math.floor(Math.random() * 100),
          vehicles: Math.floor(Math.random() * 40)
        };
      });
  }, [equipmentList]);

  // Junction dropdown options
  const cityJunctionOptions = useMemo(() => {
    if (junctions.length === 0) return [{ value: selectedJunction || 'Central Hub', label: selectedJunction || 'Central Hub' }];
    return junctions.map((j) => ({ value: j.name, label: j.name }));
  }, [junctions, selectedJunction]);

  // Pan to selected junction on change
  useEffect(() => {
    if (!selectedJunction || !mapRef.current) return;
    const targetJunc = junctions.find((j) => j.name === selectedJunction);
    if (targetJunc) { 
      mapRef.current.panTo({ lat: targetJunc.latitude, lng: targetJunc.longitude }); 
      mapRef.current.setZoom(16); 
    }
  }, [selectedJunction, junctions]);

  // Listen for activeMapElementId to pan map to device
  useEffect(() => {
    if (activeMapElementId && mapRef.current) {
      const mapContainer = document.getElementById('map-radar-container');
      if (mapContainer) mapContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setIsTargeting(true);
      
      const timer = setTimeout(() => {
        setIsTargeting(false);
        if (equipmentList.length === 0) {
          // If equipment hasn't loaded yet, try again shortly or just abort. 
          // For now, we just clear it to prevent infinite loops, but since it's in a dependency array, 
          // we can just wait for equipmentList to populate.
          return; 
        }
        
        const eq = equipmentList.find((e) => e.device_id === activeMapElementId);
        if (eq) {
          setSelectedElement({ type: eq.device_type === 'CAMERA' ? 'camera' : 'signal', data: eq });
          mapRef.current.panTo({ lat: eq.latitude, lng: eq.longitude });
          mapRef.current.setZoom(20);
        }
        
        // Always clear so it doesn't re-trigger
        setActiveMapElementId(null);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [activeMapElementId, equipmentList, setActiveMapElementId]);

  // Emergency corridor route polylines
  const [corridorPaths, setCorridorPaths] = useState({});

  useEffect(() => {
    let isMounted = true;
    activeCorridors.forEach(async (corridor) => {
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
      {/* Real-time Moving Ambulances via WebSockets */}
      {showCorridor && Object.entries(liveAmbulances || {}).map(([id, amb]) => (
        <React.Fragment key={`live-amb-${id}`}>
          {amb.route && amb.route.length > 0 && (
            <PolylineF
              path={amb.route.map(pt => ({ lat: pt[1], lng: pt[0] }))}
              options={{
                strokeColor: '#22c55e',
                strokeOpacity: 0.8,
                strokeWeight: 6,
              }}
            />
          )}
          {amb.position && (
            <MarkerF
              position={{ lat: amb.position.lat, lng: amb.position.lng }}
              icon={{
                path: window.google ? window.google.maps.SymbolPath.CIRCLE : undefined,
                scale: 12,
                fillColor: '#ef4444',
                fillOpacity: 1,
                strokeWeight: 3,
                strokeColor: '#ffffff',
              }}
              title={`Live Ambulance ${id} - ${amb.progressPct}%`}
              zIndex={100}
            />
          )}
        </React.Fragment>
      ))}

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

      {/* Real Junction Markers from Database */}
      {junctions
        .map((j) => (
        <MarkerF
          key={j.id || j._id}
          position={{ lat: j.latitude, lng: j.longitude }}
          icon={{
            path: window.google ? window.google.maps.SymbolPath.CIRCLE : undefined,
            scale: 8,
            fillColor: '#6366f1',
            fillOpacity: 0.8,
            strokeWeight: 2,
            strokeColor: '#ffffff',
          }}
          title={j.name}
        />
      ))}
      
      {/* Camera FOV Zones */}
      {showCameras && cameraZones.map((zone) => (
        <PolygonF
          key={zone.id}
          path={calculateSectorPath(zone.center, zone.radius, zone.startAngle, zone.endAngle)}
          options={{
            fillColor: zone.color,
            fillOpacity: 0.25,
            strokeColor: zone.color,
            strokeOpacity: 0.6,
            strokeWeight: 1.5,
            clickable: true
          }}
          onClick={() => {
            navigate(`?tab=cameras_signals&id=${zone.id}`);
          }}
          onMouseOver={() => setSelectedElement({ type: 'camera', data: zone })}
        />
      ))}

      {/* Real Equipment Markers from Database */}
      {equipmentList
        .filter((eq) => {
          if (!showCameras && eq.device_type === 'CAMERA') return false;
          if (!showSignals && eq.device_type === 'SIGNAL') return false;
          return true;
        })
        .map((eq) => {
        const live = liveMLStats && liveMLStats[eq.device_id] ? liveMLStats[eq.device_id] : null;
        const displayEq = live ? {
          ...eq,
          status: live.status || eq.status,
          live_vehicles: live.activeVehicles !== undefined ? live.activeVehicles : eq.live_vehicles,
          density_pct: live.densityPct !== undefined ? live.densityPct : eq.density_pct
        } : eq;

        const isCam = displayEq.device_type === 'CAMERA';
        const isSelected = activeMapElementId === displayEq.device_id;
        
        return (
          <MarkerF
            key={displayEq.id || displayEq._id}
            position={{ lat: displayEq.latitude, lng: displayEq.longitude }}
            title={`${displayEq.name} - ${displayEq.status} (Density: ${displayEq.density_pct || 0}%)`}
            icon={{
              url: isCam ? '/cctv_icon.svg' : '/traffic_signal.svg',
              scaledSize: window.google ? new window.google.maps.Size(isSelected ? 36 : 26, isSelected ? 36 : 26) : null,
              anchor: window.google ? new window.google.maps.Point(13, 13) : null
            }}
            zIndex={isSelected ? 100 : 10}
            onClick={() => {
              setActiveMapElementId(displayEq.device_id);
              navigate(`?tab=cameras_signals&id=${displayEq.device_id}`);
            }}
            onMouseOver={() => setSelectedElement({ 
              type: isCam ? 'camera' : 'signal', 
              data: {
                ...displayEq,
                center: { lat: displayEq.latitude, lng: displayEq.longitude },
                position: { lat: displayEq.latitude, lng: displayEq.longitude },
                light: ['RED', 'GREEN', 'YELLOW'][Math.floor(Math.random() * 3)],
                greenSec: Math.floor(Math.random() * 60)
              } 
            })}
          />
        );
      })}

      {/* InfoWindow on Click */}
      {selectedElement && (
        <InfoWindow
          position={
            selectedElement.data.latitude ? { lat: selectedElement.data.latitude, lng: selectedElement.data.longitude } // Backend equipment
            : selectedElement.type === 'camera' ? selectedElement.data.center // Hardcoded camera
            : selectedElement.type === 'signal' ? selectedElement.data.position // Hardcoded signal
            : selectedElement.data.position
          }
          onCloseClick={() => setSelectedElement(null)}
        >
          <div className="py-2 px-3 min-w-45 text-slate-900">
            <div className="text-[13px] font-extrabold mb-1">{selectedElement.data.name}</div>
            
            {/* Camera Details */}
            {selectedElement.type === 'camera' && (
              <div className="text-[11px] text-slate-600">
                <div>Approach: {selectedElement.data.approach}</div>
                {selectedElement.data.device_id ? (
                  <>
                    <div>Device ID: {selectedElement.data.device_id}</div>
                    <div className="text-sky-600 font-bold mt-1">Status: {selectedElement.data.status}</div>
                  </>
                ) : (
                  <>
                    <div>Coverage Radius: {selectedElement.data.radius}m</div>
                    <div>AI Model: {selectedElement.data.detectionModel}</div>
                    <div className="text-sky-600 font-bold mt-1">Live Vehicles: {selectedElement.data.activeVehicles} units ({selectedElement.data.densityPct}%)</div>
                  </>
                )}
              </div>
            )}
            
            {/* Signal Details */}
            {selectedElement.type === 'signal' && (
              <div className="text-[11px] text-slate-600">
                <div>Approach: {selectedElement.data.approach}</div>
                {selectedElement.data.device_id ? (
                  <>
                    <div>Device ID: {selectedElement.data.device_id}</div>
                    <div className="text-emerald-600 font-bold mt-1">Status: {selectedElement.data.status}</div>
                  </>
                ) : (
                  <>
                    <div>State: <strong style={{ color: getSignalHex(selectedElement.data.light) }}>{selectedElement.data.light}</strong> ({selectedElement.data.greenSec}s)</div>
                    <div>Approach Density: {selectedElement.data.densityPct}%</div>
                  </>
                )}
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

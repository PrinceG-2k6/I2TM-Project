/**
 * dummyData.js
 * ============
 * Single source of truth for ALL static and seed data in I2TM dashboard.
 * To show empty states: keep initial arrays commented out (default).
 * To seed with demo data: uncomment the relevant export.
 */

// ---------------------------------------------------------------------------
// 1. CITIES — Pre-defined Indian city catalog
// ---------------------------------------------------------------------------
export const INDIAN_CITIES = [
  {
    id: 'nagpur',
    name: 'Nagpur',
    state: 'Maharashtra',
    center: { lat: 21.1534, lng: 79.0889 }, // Sitabuldi Interchange
    zoom: 14,
    junctions: []
  }
];

// ---------------------------------------------------------------------------
// 2. EMERGENCY VEHICLE PRESETS — Dispatch button configuration
// ---------------------------------------------------------------------------
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
    color: '#DC2626',
    originOffset: { lat: -0.0080, lng: -0.0012 },
    destOffset: { lat: 0.0006, lng: 0.0008 }
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
    color: '#EA580C',
    originOffset: { lat: 0.0090, lng: 0.0020 },
    destOffset: { lat: -0.0010, lng: -0.0030 }
  }
};

// ---------------------------------------------------------------------------
// 3. DEFAULT PATH NODES — Template route for new emergency corridors
// ---------------------------------------------------------------------------
export const DEFAULT_PATH_NODES = [
  { name: 'Outer Ring Entry',    status: 'PASSED',   isGreen: true },
  { name: 'Commercial Arterial', status: 'ACTIVE',   isGreen: true },
  { name: 'City Center Node',    status: 'UPCOMING', isGreen: true },
  { name: 'Hospital Approach',   status: 'UPCOMING', isGreen: true }
];

// ---------------------------------------------------------------------------
// 4. INITIAL APPROACHES — 4-direction junction approach seed data
//    Uncomment to pre-populate; leave commented for empty state.
// ---------------------------------------------------------------------------
export const INITIAL_APPROACHES = {
  North: { name: 'North Approach Corridor',  vehicleCount: 0, capacity: 50, densityPct: 0.0, status: 'LOW', currentLight: 'RED',   greenSec: 0, avgSpeed: 0.0 },
  South: { name: 'South Flyover Connector',  vehicleCount: 0, capacity: 50, densityPct: 0.0, status: 'LOW', currentLight: 'RED',   greenSec: 0, avgSpeed: 0.0 },
  East:  { name: 'East Commercial Arterial', vehicleCount: 0, capacity: 50, densityPct: 0.0, status: 'LOW', currentLight: 'RED',   greenSec: 0, avgSpeed: 0.0 },
  West:  { name: 'West Residential Feeder',  vehicleCount: 0, capacity: 50, densityPct: 0.0, status: 'LOW', currentLight: 'RED',   greenSec: 0, avgSpeed: 0.0 }
};

// ---------------------------------------------------------------------------
// 5. INITIAL CORRIDORS — Pre-seeded green corridor(s)
//    Uncomment to pre-populate; leave commented for empty state.
// ---------------------------------------------------------------------------
export const INITIAL_CORRIDORS = [];

// ---------------------------------------------------------------------------
// 6. INITIAL ALERTS — Pre-seeded incident feed
//    Uncomment to pre-populate; leave commented for empty state.
// ---------------------------------------------------------------------------
export const INITIAL_ALERTS = [];


// ---------------------------------------------------------------------------
// 10. MAP CONFIGURATION — Google Maps setup for OverviewView
// ---------------------------------------------------------------------------
export const MAP_CONTAINER_STYLE = {
  width: '100%',
  height: '640px',
  boxShadow: 'var(--shadow-card)'
};

export const MAP_OPTIONS = {
  disableDefaultUI: false,
  zoomControl: true,
  mapTypeControl: true,
  streetViewControl: false,
  fullscreenControl: true,
  styles: [
    { elementType: 'geometry',            stylers: [{ color: '#1d2c4d' }] },
    { elementType: 'labels.text.fill',    stylers: [{ color: '#8ec3b9' }] },
    { elementType: 'labels.text.stroke',  stylers: [{ color: '#1a3646' }] },
    { featureType: 'administrative.country', elementType: 'geometry.stroke', stylers: [{ color: '#4b687a' }] },
    { featureType: 'road',                elementType: 'geometry',        stylers: [{ color: '#304a7d' }] },
    { featureType: 'road',                elementType: 'geometry.stroke', stylers: [{ color: '#1f2835' }] },
    { featureType: 'road.highway',        elementType: 'geometry',        stylers: [{ color: '#2c456b' }] },
    { featureType: 'road.highway',        elementType: 'labels',          stylers: [{ visibility: 'on' }] },
    { featureType: 'water',               elementType: 'geometry',        stylers: [{ color: '#0e1626' }] },
    { featureType: 'poi',                 elementType: 'labels',          stylers: [{ visibility: 'off' }] },
    { featureType: 'poi.medical',         elementType: 'labels',          stylers: [{ visibility: 'on' }] },
    { featureType: 'poi.school',          elementType: 'labels',          stylers: [{ visibility: 'on' }] },
    { featureType: 'poi.government',      elementType: 'labels',          stylers: [{ visibility: 'on' }] },
    { featureType: 'transit',             elementType: 'labels',          stylers: [{ visibility: 'off' }] }
  ]
};

// ---------------------------------------------------------------------------
// 11. CAMERA APPROACH CONFIG — FOV wedge offsets & AI models per direction
// ---------------------------------------------------------------------------
export const CAMERA_APPROACH_CONFIG = [
  { dir: 'N', latOff:  0.0012, lngOff:  0.0002, startAngle: 145, endAngle: 215, model: 'YOLOv8 Dynamic',          label: 'North CCTV' },
  { dir: 'E', latOff: -0.0002, lngOff:  0.0018, startAngle: 235, endAngle: 305, model: 'YOLOv8 Swerve Risk',     label: 'East CCTV'  },
  { dir: 'W', latOff:  0.0001, lngOff: -0.0018, startAngle:  55, endAngle: 125, model: 'YOLOv8 Multi-Class',     label: 'West CCTV'  },
  { dir: 'S', latOff: -0.0014, lngOff: -0.0002, startAngle: 325, endAngle:  35, model: 'YOLOv8 Emergency Triage',label: 'South CCTV' }
];

// ---------------------------------------------------------------------------
// 12. SIGNAL APPROACH CONFIG — Position offsets per direction
// ---------------------------------------------------------------------------
export const SIGNAL_APPROACH_CONFIG = [
  { dir: 'N', appKey: 'North', latOff:  0.0008, lngOff:  0.0001, defaultLight: 'RED',   defaultGreen: 30 },
  { dir: 'E', appKey: 'East',  latOff: -0.0001, lngOff:  0.0014, defaultLight: 'GREEN', defaultGreen: 45 },
  { dir: 'W', appKey: 'West',  latOff:  0.0000, lngOff: -0.0014, defaultLight: 'RED',   defaultGreen: 20 },
  { dir: 'S', appKey: 'South', latOff: -0.0011, lngOff: -0.0001, defaultLight: 'RED',   defaultGreen: 25 }
];

// ---------------------------------------------------------------------------
// 13. OVERVIEW STATS — Computed from runtime state; see generateOverviewStats()
// ---------------------------------------------------------------------------
export const generateOverviewStats = (approaches, emergency, alerts) => {
  const appArr = Object.values(approaches || {});
  const avgDensity = appArr.length
    ? Math.round(appArr.reduce((s, a) => s + (a.densityPct || 0), 0) / appArr.length)
    : 0;
  const networkRisk     = Math.min(100, Math.round(avgDensity * 0.68 + (emergency?.active ? 12 : 0)));
  const highRiskCount   = appArr.filter((a) => (a.densityPct || 0) >= 75).length;
  const activeIncidents = alerts?.length || 0;
  const emergencyUnits  = emergency?.active ? 3 : 0;
  const ambulancesEnRoute = emergency?.active ? 1 : 0;
  const coveragePct     = 0;

  return [
    {
      id: 'network-risk',
      label: 'Network Risk',
      value: networkRisk,
      max: 100,
      unit: '/100',
      sub: 'Weighted across active junctions',
      color:  networkRisk >= 70 ? '#DC2626' : networkRisk >= 50 ? '#F59E0B' : '#16A34A',
      bg:     networkRisk >= 70 ? '#FEF2F2' : networkRisk >= 50 ? '#FFFBEB' : '#F0FDF4',
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
      color:  avgDensity >= 80 ? '#DC2626' : avgDensity >= 60 ? '#F59E0B' : '#16A34A',
      bg:     avgDensity >= 80 ? '#FEF2F2' : avgDensity >= 60 ? '#FFFBEB' : '#F0FDF4',
      border: avgDensity >= 80 ? '#FCA5A5' : avgDensity >= 60 ? '#FCD34D' : '#86EFAC',
      isScore: true
    },
    {
      id: 'high-risk-junctions',
      label: 'High-Risk Junctions',
      value: highRiskCount,
      unit: '',
      sub: 'Density ≥ 75% threshold',
      color: '#EA580C', bg: '#FFF7ED', border: '#FDBA74',
      isScore: false
    },
    {
      id: 'active-incidents',
      label: 'Active Incidents',
      value: activeIncidents,
      unit: '',
      sub: 'Open in alert stream',
      color: '#7C3AED', bg: '#F5F3FF', border: '#C4B5FD',
      isScore: false
    },
    {
      id: 'emergency-units',
      label: 'Emergency Units',
      value: emergencyUnits,
      unit: '',
      sub: emergency?.active ? 'Corridor active' : 'On standby',
      color: '#DC2626',
      bg:    emergency?.active ? '#FEF2F2' : '#F8FAFC',
      border: emergency?.active ? '#F87171' : '#E2E8F0',
      isScore: false,
      pulse: emergency?.active
    },
    {
      id: 'ambulances-en-route',
      label: 'Ambulances En Route',
      value: ambulancesEnRoute,
      unit: '',
      sub: emergency?.active ? (emergency.vehicleId || '') : 'No dispatch active',
      color: '#0284C7', bg: '#F0F9FF', border: '#7DD3FC',
      isScore: false
    },
    {
      id: 'junction-coverage',
      label: 'Junction Coverage',
      value: coveragePct,
      max: 100,
      unit: '%',
      sub: 'Active nodes monitored',
      color: '#16A34A', bg: '#F0FDF4', border: '#86EFAC',
      isScore: true
    }
  ];
};

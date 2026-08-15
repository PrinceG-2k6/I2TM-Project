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

// We will add more data structures (Timeline, Corridors, Cameras, etc.) here as we refactor each view.

export const INITIAL_CORRIDORS = [
  {
    id: 'CORR-INIT89',
    active: true,
    status: 'IN_TRANSIT',
    vehicleType: 'AMBULANCE',
    vehicleLabel: 'Ambulance',
    vehicleIcon: 'Siren',
    vehicleId: 'DL-01-AMB-889',
    patientSeverity: 'CRITICAL',
    triageLevel: 'RED',
    etaSeconds: 120,
    countdownSeconds: 95,
    destination: 'Local Trauma Center',
    origin: 'Outer Ring Corridor',
    distanceMeters: 850,
    routeCongestionPct: 88.0,
    roadsideMessage: 'Ambulance approaching. Keep left lane clear.',
    targetApproach: 'East Commercial Arterial',
    pathNodes: [
      { name: 'Outer Ring Entry', status: 'PASSED', isGreen: true },
      { name: 'Commercial Arterial', status: 'ACTIVE', isGreen: true },
      { name: 'City Center Node', status: 'UPCOMING', isGreen: true },
      { name: 'Hospital Approach', status: 'UPCOMING', isGreen: true }
    ],
    progressPct: 20
  }
];

export const INITIAL_ALERTS = [
  {
    id: 'ALT-101',
    time: '14:23:13',
    title: 'Density spike detected on East Arterial. Traffic shed requested.',
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
    title: 'Lane Cut Guard triggered: erratic swerve pattern detected.',
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
  },
  {
    id: 'ALT-104',
    time: '14:15:30',
    title: 'Wrong-way vehicle detected on North Approach flyover.',
    description: 'AI camera flagged vehicle travelling against traffic flow at 42 km/h. Alert relayed to traffic marshal unit.',
    severity: 'CRITICAL',
    type: 'RISKY_MOVEMENT',
    author: 'Toby',
    role: 'Vision ML',
    feature: 'Wrong-Way Guard',
    service: 'Vision Trajectory Interceptor',
    tags: ['Vision AI', 'Security', 'Critical']
  },
  {
    id: 'ALT-105',
    time: '14:11:58',
    title: 'VMS Roadside Display Board updated with congestion advisory.',
    description: 'Board J-04 (Ring Road South) now showing: "Heavy congestion ahead. Use alternate route via West Feeder."',
    severity: 'HEALTHY',
    type: 'SIGNAL',
    author: 'AI Dispatch',
    role: 'System',
    feature: 'Roadside Display Board',
    service: 'Dynamic Signal Optimizer',
    tags: ['System', 'VMS']
  },
  {
    id: 'ALT-106',
    time: '14:08:22',
    title: 'Signal override applied: West Residential Feeder green extended.',
    description: 'Adaptive control extended green phase by +18s on West approach to balance queue buildup detected by camera array.',
    severity: 'WARNING',
    type: 'SIGNAL',
    author: 'System',
    role: 'System',
    feature: 'Signal Timing Engine',
    service: 'Dynamic Signal Optimizer',
    tags: ['System', 'Optimization', 'Signal']
  }
];

export const INITIAL_SUGGESTIONS = [
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
  }
];

export const generateOverviewStats = (approaches, emergency, alerts) => {
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

  return [
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
      sub: 'Density ≥ 75% threshold',
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
      sub: emergency?.active ? 'Corridor active' : 'On standby',
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
};

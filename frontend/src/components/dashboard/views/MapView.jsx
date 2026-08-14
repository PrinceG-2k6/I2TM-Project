import React, { useState, useEffect } from 'react';
import { 
  Navigation, 
  MapPin, 
  Layers, 
  Siren, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Play, 
  Pause, 
  ShieldAlert, 
  Tv, 
  Eye, 
  Maximize2,
  Gauge,
  Radio
} from 'lucide-react';
import { useTraffic } from '../../../context/TrafficContext';
import { Badge } from '../../common/Badge';
import { Button } from '../../common/Button';

export const MapView = () => {
  const { 
    emergency, 
    triggerEmergencyCorridor, 
    resetEmergencyCorridor, 
    selectedJunction, 
    setSelectedJunction, 
    approaches 
  } = useTraffic();

  const [selectedNode, setSelectedNode] = useState('J-04');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [layers, setLayers] = useState({
    congestionHeat: true,
    corridorRoute: true,
    vmsBoards: true,
    cctvNodes: true
  });
  const [isSimulatingRun, setIsSimulatingRun] = useState(true);
  const [ambulanceProgress, setAmbulanceProgress] = useState(35); // % along the route

  // Move ambulance along the route smoothly during emergency
  useEffect(() => {
    if (!emergency.active || !isSimulatingRun) return;
    const interval = setInterval(() => {
      setAmbulanceProgress((prev) => (prev >= 98 ? 10 : prev + 1.2));
    }, 500);
    return () => clearInterval(interval);
  }, [emergency.active, isSimulatingRun]);

  // Connected Junction Nodes along the Delhi AIIMS Corridor
  const junctionNodes = [
    {
      id: 'J-01',
      name: 'Connaught Radial Node',
      x: 120,
      y: 110,
      density: 72,
      status: 'HIGH',
      color: '#F59E0B',
      corridorState: 'PASSED',
      vehicles: 36,
      currentLight: 'RED'
    },
    {
      id: 'J-02',
      name: 'Barakhamba Interchange',
      x: 280,
      y: 190,
      density: 45,
      status: 'MEDIUM',
      color: '#16A34A',
      corridorState: 'PASSED',
      vehicles: 22,
      currentLight: 'RED'
    },
    {
      id: 'J-03',
      name: 'Mandi House Arterial',
      x: 440,
      y: 260,
      density: 68,
      status: 'HIGH',
      color: '#F59E0B',
      corridorState: 'PRE_CLEARING',
      vehicles: 34,
      currentLight: 'GREEN'
    },
    {
      id: 'J-04',
      name: 'Ring Road South (Active Focus)',
      x: 620,
      y: 330,
      density: 92,
      status: 'CRITICAL',
      color: '#DC2626',
      corridorState: emergency.active ? 'PRIORITY_GREEN' : 'ADAPTIVE',
      vehicles: 48,
      currentLight: emergency.active ? 'GREEN' : 'RED'
    },
    {
      id: 'J-05',
      name: 'AIIMS Trauma Expressway Terminal',
      x: 820,
      y: 410,
      density: 32,
      status: 'LOW',
      color: '#16A34A',
      corridorState: 'READY',
      vehicles: 16,
      currentLight: 'GREEN'
    }
  ];

  // Inter-connecting road segments with congestion color coding
  const roadSegments = [
    { from: junctionNodes[0], to: junctionNodes[1], densityPct: 70, color: '#F59E0B', name: 'Radial Arterial 1' },
    { from: junctionNodes[1], to: junctionNodes[2], densityPct: 45, color: '#16A34A', name: 'Barakhamba Expressway' },
    { from: junctionNodes[2], to: junctionNodes[3], densityPct: 92, color: '#DC2626', name: 'Ring Road Southbound' },
    { from: junctionNodes[3], to: junctionNodes[4], densityPct: 30, color: '#16A34A', name: 'AIIMS Dedicated Ramp' }
  ];

  // Calculate Ambulance position along the SVG path
  const currentPathSegment = roadSegments[2]; // Active between Mandi House and Ring Road
  const ambX = currentPathSegment.from.x + ((currentPathSegment.to.x - currentPathSegment.from.x) * (ambulanceProgress / 100));
  const ambY = currentPathSegment.from.y + ((currentPathSegment.to.y - currentPathSegment.from.y) * (ambulanceProgress / 100));

  const activeNodeData = junctionNodes.find((n) => n.id === selectedNode) || junctionNodes[3];

  return (
    <div className="view-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Map Action Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: 0 }}>
          Geospatial node telemetry, color-coded congestion corridors (Green/Yellow/Red), and pre-cleared ambulance routes
        </p>

        {/* Map Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {emergency.active ? (
            <Button
              variant="plain"
              size="sm"
              onClick={resetEmergencyCorridor}
              style={{ color: 'var(--status-critical)', border: '1px solid var(--status-critical-border)' }}
            >
              Reset Corridor
            </Button>
          ) : (
            <Button
              variant="primary"
              size="sm"
              icon={Siren}
              onClick={() => triggerEmergencyCorridor('CRITICAL')}
              style={{ backgroundColor: '#DC2626', borderColor: '#B91C1C' }}
            >
              Dispatch Ambulance
            </Button>
          )}

          <Button
            variant="secondary"
            size="sm"
            icon={RotateCcw}
            onClick={() => {
              setZoomLevel(1);
              setSelectedNode('J-04');
            }}
          >
            Reset View
          </Button>
        </div>
      </div>

      {/* Main Map + Inspector Split View */}
      <div
        data-subsection="Geospatial Road Network"
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 340px',
          gap: '20px',
          minHeight: '620px'
        }}
      >
        {/* 1. Interactive SVG Map Canvas */}
        <div
          style={{
            backgroundColor: '#0F172A',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid #1E293B',
            boxShadow: 'var(--shadow-modal)',
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {/* Map Top Floating Toolbar (Layer Toggles & Zoom) */}
          <div
            style={{
              position: 'absolute',
              top: '16px',
              left: '16px',
              right: '16px',
              zIndex: 20,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              pointerEvents: 'none'
            }}
          >
            {/* Layer Toggles */}
            <div style={{ display: 'flex', gap: '8px', pointerEvents: 'auto', backgroundColor: 'rgba(15, 23, 42, 0.85)', padding: '6px 10px', borderRadius: 'var(--radius-md)', backdropFilter: 'blur(8px)', border: '1px solid #334155' }}>
              <button
                onClick={() => setLayers({ ...layers, congestionHeat: !layers.congestionHeat })}
                style={{
                  fontSize: '11px',
                  fontWeight: '700',
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: layers.congestionHeat ? 'var(--primary-orange)' : 'transparent',
                  color: layers.congestionHeat ? '#FFFFFF' : '#94A3B8',
                  cursor: 'pointer'
                }}
              >
                Congestion Heat
              </button>

              <button
                onClick={() => setLayers({ ...layers, corridorRoute: !layers.corridorRoute })}
                style={{
                  fontSize: '11px',
                  fontWeight: '700',
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: layers.corridorRoute ? '#16A34A' : 'transparent',
                  color: layers.corridorRoute ? '#FFFFFF' : '#94A3B8',
                  cursor: 'pointer'
                }}
              >
                Ambulance Path
              </button>

              <button
                onClick={() => setLayers({ ...layers, vmsBoards: !layers.vmsBoards })}
                style={{
                  fontSize: '11px',
                  fontWeight: '700',
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: layers.vmsBoards ? '#2563EB' : 'transparent',
                  color: layers.vmsBoards ? '#FFFFFF' : '#94A3B8',
                  cursor: 'pointer'
                }}
              >
                VMS Displays
              </button>
            </div>

            {/* Zoom Controls */}
            <div style={{ display: 'flex', gap: '6px', pointerEvents: 'auto', backgroundColor: 'rgba(15, 23, 42, 0.85)', padding: '4px 8px', borderRadius: 'var(--radius-md)', backdropFilter: 'blur(8px)', border: '1px solid #334155' }}>
              <button
                onClick={() => setZoomLevel((z) => Math.min(1.4, z + 0.1))}
                style={{ color: '#F8FAFC', padding: '4px', cursor: 'pointer' }}
                title="Zoom in"
              >
                <ZoomIn size={16} />
              </button>
              <button
                onClick={() => setZoomLevel((z) => Math.max(0.8, z - 0.1))}
                style={{ color: '#F8FAFC', padding: '4px', cursor: 'pointer' }}
                title="Zoom out"
              >
                <ZoomOut size={16} />
              </button>
            </div>
          </div>

          {/* SVG Map Canvas */}
          <div style={{ flex: 1, position: 'relative', width: '100%', height: '100%', minHeight: '520px' }}>
            <svg
              width="100%"
              height="100%"
              viewBox="0 0 960 520"
              style={{
                transform: `scale(${zoomLevel})`,
                transformOrigin: 'center center',
                transition: 'transform 0.25s ease'
              }}
            >
              {/* Background Map Grid */}
              <defs>
                <pattern id="mapGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1E293B" strokeWidth="1" />
                </pattern>
                <linearGradient id="corridorGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#22C55E" stopOpacity="0.8" />
                  <stop offset="50%" stopColor="#F97316" stopOpacity="1" />
                  <stop offset="100%" stopColor="#EF4444" stopOpacity="0.9" />
                </linearGradient>
              </defs>

              <rect width="100%" height="100%" fill="url(#mapGrid)" />

              {/* Secondary Feeder Roads (Background network) */}
              <path d="M 120 110 L 120 400 M 280 40 L 280 380 M 440 100 L 440 450 M 620 60 L 620 480 M 820 100 L 820 500" stroke="#1E293B" strokeWidth="6" strokeDasharray="4 4" fill="none" />
              <path d="M 40 260 L 900 260 M 60 410 L 920 410" stroke="#1E293B" strokeWidth="6" strokeDasharray="4 4" fill="none" />

              {/* 1. Main Arterial Road Segments with Color Coded Congestion */}
              {roadSegments.map((seg, idx) => {
                const strokeColor = layers.congestionHeat
                  ? seg.densityPct > 80
                    ? '#EF4444'
                    : seg.densityPct > 55
                    ? '#F59E0B'
                    : '#22C55E'
                  : '#475569';

                return (
                  <g key={idx}>
                    {/* Shadow/Glow road base */}
                    <line
                      x1={seg.from.x}
                      y1={seg.from.y}
                      x2={seg.to.x}
                      y2={seg.to.y}
                      stroke="#020617"
                      strokeWidth="16"
                      strokeLinecap="round"
                    />
                    {/* Color coded road surface */}
                    <line
                      x1={seg.from.x}
                      y1={seg.from.y}
                      x2={seg.to.x}
                      y2={seg.to.y}
                      stroke={strokeColor}
                      strokeWidth="10"
                      strokeLinecap="round"
                      opacity="0.9"
                    />
                    {/* Road Center Dotted Line */}
                    <line
                      x1={seg.from.x}
                      y1={seg.from.y}
                      x2={seg.to.x}
                      y2={seg.to.y}
                      stroke="#FFFFFF"
                      strokeWidth="2"
                      strokeDasharray="6 6"
                      opacity="0.5"
                    />
                  </g>
                );
              })}

              {/* 2. Active Green Corridor Glowing Trajectory Overlay */}
              {emergency.active && layers.corridorRoute && (
                <path
                  d="M 120 110 L 280 190 L 440 260 L 620 330 L 820 410"
                  fill="none"
                  stroke="url(#corridorGlow)"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray="12 6"
                  className="animate-pulse-slow"
                />
              )}

              {/* 3. VMS Roadside LED Display Board Markers */}
              {layers.vmsBoards && (
                <>
                  <g transform="translate(380, 210)" style={{ cursor: 'pointer' }}>
                    <rect x="0" y="0" width="110" height="30" rx="6" fill="#1E293B" stroke="#38BDF8" strokeWidth="1.5" />
                    <text x="10" y="18" fill="#FDE047" fontSize="10" fontWeight="bold" fontFamily="monospace">
                      VMS-03: {emergency.active ? '90s HOLD' : 'SMOOTH'}
                    </text>
                  </g>

                  <g transform="translate(560, 280)" style={{ cursor: 'pointer' }}>
                    <rect x="0" y="0" width="110" height="30" rx="6" fill="#1E293B" stroke="#F97316" strokeWidth="1.5" />
                    <text x="10" y="18" fill="#FDE047" fontSize="10" fontWeight="bold" fontFamily="monospace">
                      VMS-04: {emergency.active ? 'KEEP LEFT' : 'FLOW 35s'}
                    </text>
                  </g>
                </>
              )}

              {/* 4. Moving Ambulance Pin */}
              {emergency.active && (
                <g transform={`translate(${ambX}, ${ambY})`}>
                  {/* Glowing aura */}
                  <circle r="22" fill="rgba(220, 38, 38, 0.4)" className="animate-pulse-slow" />
                  <circle r="14" fill="#DC2626" stroke="#FFFFFF" strokeWidth="2.5" />
                  <text x="-7" y="5" fill="#FFFFFF" fontSize="13" fontWeight="bold">
                    {emergency.vehicleIcon || '🚑'}
                  </text>
                  {/* Vehicle Tooltip */}
                  <g transform="translate(18, -18)">
                    <rect x="0" y="0" width="160" height="24" rx="4" fill="#0F172A" stroke="#EF4444" strokeWidth="1" />
                    <text x="8" y="15" fill="#F8FAFC" fontSize="10" fontWeight="bold">
                      {emergency.vehicleId || 'DL-01-AMB'} ({emergency.countdownSeconds}s ETA)
                    </text>
                  </g>
                </g>
              )}

              {/* 5. Junction Nodes (Clickable for inspection) */}
              {junctionNodes.map((node) => {
                const isSelected = selectedNode === node.id;

                return (
                  <g
                    key={node.id}
                    transform={`translate(${node.x}, ${node.y})`}
                    onClick={() => {
                      setSelectedNode(node.id);
                      if (node.id === 'J-04') setSelectedJunction('J-04 Ring Road South');
                      else if (node.id === 'J-01') setSelectedJunction('J-01 Connaught Inner');
                      else if (node.id === 'J-02') setSelectedJunction('J-02 AIIMS Intersection');
                    }}
                    style={{ cursor: 'pointer' }}
                  >
                    {/* Selected Halo */}
                    {isSelected && (
                      <circle r="26" fill="none" stroke="var(--primary-orange)" strokeWidth="2.5" strokeDasharray="4 4" className="animate-pulse-slow" />
                    )}

                    {/* Node base */}
                    <circle r="16" fill="#1E293B" stroke={node.color} strokeWidth="3.5" />
                    <circle r="6" fill={node.currentLight === 'GREEN' ? '#22C55E' : '#EF4444'} />

                    {/* Junction Label */}
                    <text
                      x="0"
                      y="-22"
                      textAnchor="middle"
                      fill={isSelected ? '#F97316' : '#F1F5F9'}
                      fontSize="12"
                      fontWeight="bold"
                    >
                      {node.id}: {node.name.split(' ')[0]}
                    </text>

                    {/* Density pill below node */}
                    <g transform="translate(-24, 20)">
                      <rect x="0" y="0" width="48" height="16" rx="4" fill="#020617" stroke="#334155" strokeWidth="1" />
                      <text x="24" y="12" textAnchor="middle" fill={node.color} fontSize="10" fontWeight="bold">
                        {node.density}%
                      </text>
                    </g>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Map Bottom Legend */}
          <div
            style={{
              padding: '12px 20px',
              backgroundColor: '#090D1A',
              borderTop: '1px solid #1E293B',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '12px',
              color: '#94A3B8'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#22C55E' }} />
                Free Flow (&lt;50%)
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#F59E0B' }} />
                Moderate (50-80%)
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#EF4444' }} />
                Critical Congestion (&gt;80%)
              </span>
            </div>

            <span>Click any junction node to inspect live approach queues</span>
          </div>
        </div>

        {/* 2. Selected Node Inspector Panel */}
        <div
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-warm)',
            borderRadius: 'var(--radius-lg)',
            padding: '24px',
            boxShadow: 'var(--shadow-card)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}
        >
          <div>
            {/* Inspector Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-warm)', paddingBottom: '14px', marginBottom: '18px' }}>
              <div>
                <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--primary-orange-dark)', textTransform: 'uppercase' }}>
                  NODE TELEMETRY
                </span>
                <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-main)' }}>
                  {activeNodeData.id} - {activeNodeData.name}
                </h3>
              </div>
              <Badge variant={activeNodeData.density > 80 ? 'critical' : activeNodeData.density > 50 ? 'degraded' : 'healthy'}>
                {activeNodeData.status}
              </Badge>
            </div>

            {/* Quick Metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '18px' }}>
              <div style={{ padding: '12px', backgroundColor: 'var(--bg-surface-warm)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-warm)' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600' }}>VEHICLE QUEUE</div>
                <div style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-main)', fontFamily: 'var(--font-heading)' }}>
                  {activeNodeData.vehicles} units
                </div>
              </div>

              <div style={{ padding: '12px', backgroundColor: 'var(--bg-surface-warm)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-warm)' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600' }}>DENSITY LOAD</div>
                <div style={{ fontSize: '20px', fontWeight: '800', color: activeNodeData.color, fontFamily: 'var(--font-heading)' }}>
                  {activeNodeData.density}%
                </div>
              </div>
            </div>

            {/* Corridor Clearance State */}
            <div style={{ padding: '14px', backgroundColor: emergency.active ? '#FFF7ED' : 'var(--bg-surface-warm)', borderRadius: 'var(--radius-md)', border: emergency.active ? '1px solid #FED7AA' : '1px solid var(--border-warm)', marginBottom: '18px' }}>
              <div style={{ fontSize: '11px', fontWeight: '700', color: emergency.active ? '#C2410C' : 'var(--text-muted)', marginBottom: '4px' }}>
                CORRIDOR CLEARANCE STATE
              </div>
              <div style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-main)' }}>
                {activeNodeData.id === 'J-04' && emergency.active
                  ? '⚡ STAGED PRE-CLEAR: CONTINUOUS GREEN (75s)'
                  : activeNodeData.id === 'J-03' && emergency.active
                  ? '🟡 PRE-CLEARING IN PROGRESS (45s)'
                  : 'AUTOMATIC ADAPTIVE TIMING'}
              </div>
            </div>

            {/* Camera View Mini Mockup */}
            <div style={{ backgroundColor: '#020617', padding: '14px', borderRadius: 'var(--radius-md)', color: '#F8FAFC', marginBottom: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '11px', color: '#38BDF8', fontWeight: '700' }}>
                  CAM-04 FEED STREAM
                </span>
                <span style={{ fontSize: '10px', color: '#4ADE80' }}>● 1080p 30fps</span>
              </div>
              <div style={{ height: '80px', backgroundColor: '#0F172A', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed #334155' }}>
                <span style={{ fontSize: '11px', color: '#94A3B8' }}>
                  Vehicle Detection Bounding Boxes Active (YOLOv8)
                </span>
              </div>
            </div>
          </div>

          {/* Action Trigger */}
          <div>
            <Button
              variant="primary"
              size="md"
              style={{ width: '100%' }}
              onClick={() => {
                if (emergency.active) resetEmergencyCorridor();
                else triggerEmergencyCorridor('CRITICAL');
              }}
            >
              {emergency.active ? 'Reset Node Corridor' : 'Pre-Clear This Node For Ambulance'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

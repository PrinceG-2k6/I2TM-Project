import React, { useMemo } from 'react';
import { AccidentHazardBanner } from '../AccidentHazardBanner';
import { CongestionAlerts } from '../CongestionAlerts';
import { DensityModule } from '../DensityModule';
import { SignalControlPreview } from '../SignalControlPreview';
import { useTraffic } from '../../../context/TrafficContext';
import { Badge } from '../../common/Badge';
import { Dropdown } from '../../common/Dropdown';
import { ArrowUpRight, Camera, Zap, GitFork, MapPin } from 'lucide-react';

export const JunctionsView = ({ onNavigateTab }) => {
  const { approaches, emergency, selectedJunction, setSelectedJunction, activeCity } = useTraffic();

  // List of all junctions in active city (defaulting to Hyderabad junctions)
  const currentCityJunctions = useMemo(() => {
    return activeCity?.junctions || [
      'H-01 Hitec City Cyber Towers',
      'H-02 Gachibowli Junction',
      'H-03 Punjagutta Flyover',
      'H-04 Jubilee Hills Checkpost',
      'H-05 Begumpet Node'
    ];
  }, [activeCity]);

  const totalVehicles = Object.values(approaches).reduce((acc, a) => acc + a.vehicleCount, 0);
  const avgDensity = Math.round(
    Object.values(approaches).reduce((acc, a) => acc + a.densityPct, 0) / 4
  );

  const junctionCameras = [
    {
      id: 'CAM-N',
      name: `${selectedJunction} North CCTV`,
      approach: 'North Approach',
      fovSector: '70° Sector Arc',
      detectionModel: 'YOLOv8 Dynamic Density',
      activeVehicles: approaches.North.vehicleCount,
      densityPct: approaches.North.densityPct
    },
    {
      id: 'CAM-E',
      name: `${selectedJunction} East CCTV`,
      approach: 'East Approach',
      fovSector: '70° Sector Arc',
      detectionModel: 'YOLOv8 Swerve Risk AI',
      activeVehicles: approaches.East.vehicleCount,
      densityPct: approaches.East.densityPct
    },
    {
      id: 'CAM-W',
      name: `${selectedJunction} West CCTV`,
      approach: 'West Approach',
      fovSector: '70° Sector Arc',
      detectionModel: 'YOLOv8 Multi-Class',
      activeVehicles: approaches.West.vehicleCount,
      densityPct: approaches.West.densityPct
    },
    {
      id: 'CAM-S',
      name: `${selectedJunction} South CCTV`,
      approach: 'South Approach',
      fovSector: '70° Sector Arc',
      detectionModel: 'YOLOv8 Emergency Triage',
      activeVehicles: approaches.South.vehicleCount,
      densityPct: approaches.South.densityPct
    }
  ];

  return (
    <div className="view-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* 1. STICKY TOP BAR: Current Junction Name & Searchable Dropdown */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          backgroundColor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: '14px',
          padding: '12px 20px',
          boxShadow: '0 4px 12px rgba(15, 23, 42, 0.06)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px'
        }}
      >
        {/* Left Side: Current Junction Name & City */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#FFEBE8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <GitFork size={18} color="#FF5A43" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '17px', fontWeight: '800', color: '#0F172A', letterSpacing: '-0.02em' }}>
                {selectedJunction}
              </span>
              <span style={{ fontSize: '11px', fontWeight: '800', backgroundColor: '#F1F5F9', color: '#475569', padding: '2px 8px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <MapPin size={11} color="#FF5A43" />
                {activeCity?.name || 'Hyderabad'}
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: Searchable Dropdown with Search Input Inside */}
        <div style={{ width: '320px', flexShrink: 0 }}>
          <Dropdown
            options={currentCityJunctions.map((j) => ({ value: j, label: j }))}
            value={selectedJunction}
            onChange={(val) => setSelectedJunction(val)}
            isSearchable={true}
            placeholder="Search & select junction..."
          />
        </div>
      </div>

      {/* 2. Emergency Red Corridor Banner */}
      {emergency.active && (
        <div className="view-fade-in">
          <AccidentHazardBanner onNavigateGuards={() => onNavigateTab && onNavigateTab('guards')} />
        </div>
      )}

      {/* 3. Junction Health Stat Cards Row */}
      <div
        data-subsection="Junction Health & Load Metrics"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px'
        }}
      >
        {/* Junction Card */}
        <div
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-warm)',
            borderRadius: 'var(--radius-lg)',
            padding: '18px 20px',
            boxShadow: 'var(--shadow-subtle)'
          }}
        >
          <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '4px' }}>
            ACTIVE INTERSECTION
          </div>
          <div style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '6px' }}>
            {selectedJunction}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#22C55E' }} />
            <span style={{ fontSize: '12px', color: 'var(--status-healthy)', fontWeight: '600' }}>
              Adaptive Controller Online
            </span>
          </div>
        </div>

        {/* Total Vehicles Card */}
        <div
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-warm)',
            borderRadius: 'var(--radius-lg)',
            padding: '18px 20px',
            boxShadow: 'var(--shadow-subtle)'
          }}
        >
          <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '4px' }}>
            TOTAL VEHICLES ON APPROACHES
          </div>
          <div style={{ fontSize: '28px', fontWeight: '800', color: 'var(--text-main)', fontFamily: 'var(--font-heading)' }}>
            {totalVehicles} <span style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: '500' }}>units</span>
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Capacity: 200 units across 4 lanes
          </div>
        </div>

        {/* Average Density Card */}
        <div
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-warm)',
            borderRadius: 'var(--radius-lg)',
            padding: '18px 20px',
            boxShadow: 'var(--shadow-subtle)'
          }}
        >
          <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '4px' }}>
            AVERAGE JUNCTION DENSITY
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '28px', fontWeight: '800', color: avgDensity > 70 ? 'var(--status-critical)' : 'var(--text-main)', fontFamily: 'var(--font-heading)' }}>
              {avgDensity}%
            </span>
            <Badge variant={avgDensity > 75 ? 'critical' : avgDensity > 50 ? 'degraded' : 'healthy'} size="sm">
              {avgDensity > 75 ? 'High Congestion' : 'Moderate Flow'}
            </Badge>
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
            Optimized via AI density allocation
          </div>
        </div>

        {/* Emergency Status Card */}
        <div
          onClick={() => onNavigateTab && onNavigateTab('guards')}
          style={{
            backgroundColor: emergency.active ? '#FEF2F2' : 'var(--bg-surface)',
            border: emergency.active ? '2px solid #DC2626' : '1px solid var(--border-warm)',
            borderRadius: 'var(--radius-lg)',
            padding: '18px 20px',
            boxShadow: emergency.active ? '0 0 16px rgba(220, 38, 38, 0.3)' : 'var(--shadow-subtle)',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span style={{ fontSize: '12px', fontWeight: '800', color: emergency.active ? '#DC2626' : 'var(--text-muted)' }}>
              EMERGENCY CORRIDOR
            </span>
            <ArrowUpRight size={14} color={emergency.active ? '#DC2626' : 'var(--text-muted)'} />
          </div>
          <div style={{ fontSize: '18px', fontWeight: '800', color: emergency.active ? '#DC2626' : 'var(--text-main)' }}>
            {emergency.active ? `ACTIVE (${emergency.countdownSeconds}s)` : 'Standby / Ready'}
          </div>
          <div style={{ fontSize: '12px', color: emergency.active ? '#B91C1C' : 'var(--text-muted)', marginTop: '4px' }}>
            {emergency.active ? `${emergency.vehicleLabel || 'Emergency Vehicle'} ${emergency.vehicleId || 'DL-01-AMB-889'} cleared` : 'Simulate in sidebar or Guards to trigger run'}
          </div>
        </div>
      </div>

      {/* 4. Operational Alerts Feed */}
      <div data-subsection="Active Operational Alerts">
        <CongestionAlerts />
      </div>

      {/* 5. Junction Camera Coverage & Signal Telemetry Section */}
      <div data-subsection="Cameras & Signal Telemetry" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '16px' }}>
        {/* CCTV Camera Coverage Card */}
        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Camera size={18} color="#0284C7" />
              <span style={{ fontSize: '15px', fontWeight: '800', color: '#0F172A' }}>
                Camera Coverage ({selectedJunction})
              </span>
            </div>
            <Badge variant="healthy" size="sm">4 CCTV Sector Wedges</Badge>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {junctionCameras.map((cam) => (
              <div key={cam.id} style={{ padding: '12px 14px', backgroundColor: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: '#0F172A' }}>{cam.name}</div>
                  <div style={{ fontSize: '11px', color: '#64748B' }}>{cam.approach} • {cam.fovSector}</div>
                  <div style={{ fontSize: '10px', color: '#0284C7', fontWeight: '700', marginTop: '2px' }}>AI Model: {cam.detectionModel}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '13px', fontWeight: '800', color: '#0284C7' }}>{cam.activeVehicles} units</div>
                  <div style={{ fontSize: '11px', color: '#64748B' }}>{cam.densityPct}% load</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Traffic Signals Status Card */}
        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Zap size={18} color="#16A34A" />
              <span style={{ fontSize: '15px', fontWeight: '800', color: '#0F172A' }}>
                Traffic Signals ({selectedJunction})
              </span>
            </div>
            <Badge variant={emergency?.active ? 'critical' : 'healthy'} size="sm">
              {emergency?.active ? 'Corridor Pre-Cleared' : '4-Phase Adaptive'}
            </Badge>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {Object.entries(approaches).map(([appKey, appData]) => {
              const hex = appData.currentLight === 'GREEN' ? '#22C55E' : appData.currentLight === 'AMBER' ? '#F59E0B' : '#EF4444';
              return (
                <div key={appKey} style={{ padding: '12px 14px', backgroundColor: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ width: 14, height: 14, borderRadius: '50%', backgroundColor: hex, boxShadow: `0 0 10px ${hex}` }} />
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: '700', color: '#0F172A' }}>{appData.name}</div>
                      <div style={{ fontSize: '11px', color: '#64748B' }}>Vehicles: {appData.vehicleCount} units ({appData.densityPct}% load)</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '13px', fontWeight: '900', color: hex }}>
                      {appData.currentLight} ({appData.greenSec}s)
                    </div>
                    <div style={{ fontSize: '10px', color: '#64748B' }}>Avg speed: {appData.avgSpeed} km/h</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 6. 4-Way Traffic Density Gauges */}
      <div data-subsection="4-Approach Density Gauges">
        <DensityModule />
      </div>

      {/* 7. Physical Signal Control Visualizer */}
      <div data-subsection="Physical Signal Light Visualizer">
        <SignalControlPreview />
      </div>
    </div>
  );
};

export default JunctionsView;

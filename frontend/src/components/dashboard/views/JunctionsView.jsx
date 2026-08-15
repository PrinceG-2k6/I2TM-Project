import React, { useMemo } from 'react';
import { AccidentHazardBanner } from '../AccidentHazardBanner';
import { CongestionAlerts } from '../CongestionAlerts';
import { useTraffic } from '../../../context/TrafficContext';
import { Badge } from '../../common/Badge';
import { Dropdown } from '../../common/Dropdown';
import { ArrowUpRight, Camera, Zap, GitFork, MapPin, Gauge } from 'lucide-react';

export const JunctionsView = ({ onNavigateTab }) => {
  const { approaches, activeCorridors, selectedJunction, setSelectedJunction, activeCity } = useTraffic();
  const emergency = activeCorridors && activeCorridors.length > 0 ? activeCorridors[0] : { active: false };

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

      {/* 1. Sticky Top Bar */}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#FFEBE8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <GitFork size={18} color="#FF5A43" />
          </div>
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

      {/* 2. Emergency Banner */}
      {emergency.active && (
        <div className="view-fade-in">
          <AccidentHazardBanner onNavigateGuards={() => onNavigateTab && onNavigateTab('guards')} />
        </div>
      )}

      {/* 3. Two-column layout */}
      <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>

        {/* ─── LEFT: main content ─── */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Stat Cards */}
          <div
            data-subsection="Junction Health & Load Metrics"
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}
          >
            <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-warm)', borderRadius: 'var(--radius-lg)', padding: '18px 20px', boxShadow: 'var(--shadow-subtle)' }}>
              <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '4px' }}>ACTIVE INTERSECTION</div>
              <div style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '6px' }}>{selectedJunction}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#22C55E' }} />
                <span style={{ fontSize: '12px', color: 'var(--status-healthy)', fontWeight: '600' }}>Adaptive Controller Online</span>
              </div>
            </div>

            <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-warm)', borderRadius: 'var(--radius-lg)', padding: '18px 20px', boxShadow: 'var(--shadow-subtle)' }}>
              <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '4px' }}>TOTAL VEHICLES ON APPROACHES</div>
              <div style={{ fontSize: '28px', fontWeight: '800', color: 'var(--text-main)', fontFamily: 'var(--font-heading)' }}>
                {totalVehicles} <span style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: '500' }}>units</span>
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Capacity: 200 units across 4 lanes</div>
            </div>

            <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-warm)', borderRadius: 'var(--radius-lg)', padding: '18px 20px', boxShadow: 'var(--shadow-subtle)' }}>
              <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '4px' }}>AVERAGE JUNCTION DENSITY</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                <span style={{ fontSize: '28px', fontWeight: '800', color: avgDensity > 70 ? 'var(--status-critical)' : 'var(--text-main)', fontFamily: 'var(--font-heading)' }}>
                  {avgDensity}%
                </span>
                <Badge variant={avgDensity > 75 ? 'critical' : avgDensity > 50 ? 'degraded' : 'healthy'} size="sm">
                  {avgDensity > 75 ? 'High Congestion' : 'Moderate Flow'}
                </Badge>
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>Optimized via AI density allocation</div>
            </div>

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
                <span style={{ fontSize: '12px', fontWeight: '800', color: emergency.active ? '#DC2626' : 'var(--text-muted)' }}>EMERGENCY CORRIDOR</span>
                <ArrowUpRight size={14} color={emergency.active ? '#DC2626' : 'var(--text-muted)'} />
              </div>
              <div style={{ fontSize: '18px', fontWeight: '800', color: emergency.active ? '#DC2626' : 'var(--text-main)' }}>
                {emergency.active ? `ACTIVE (${emergency.countdownSeconds}s)` : 'Standby / Ready'}
              </div>
              <div style={{ fontSize: '12px', color: emergency.active ? '#B91C1C' : 'var(--text-muted)', marginTop: '4px' }}>
                {emergency.active ? `${emergency.vehicleLabel || 'Emergency Vehicle'} ${emergency.vehicleId || 'DL-01-AMB-889'} cleared` : 'Trigger from Green Corridors tab'}
              </div>
            </div>
          </div>

          {/* Alerts Feed */}
          <div data-subsection="Active Operational Alerts">
            <CongestionAlerts />
          </div>

          {/* Camera & Signal Telemetry */}
          <div data-subsection="Cameras & Signal Telemetry" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '16px' }}>
            <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Camera size={18} color="#0284C7" />
                  <span style={{ fontSize: '15px', fontWeight: '800', color: '#0F172A' }}>Camera Coverage ({selectedJunction})</span>
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

            <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Zap size={18} color="#16A34A" />
                  <span style={{ fontSize: '15px', fontWeight: '800', color: '#0F172A' }}>Traffic Signals ({selectedJunction})</span>
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
                        <div style={{ fontSize: '13px', fontWeight: '900', color: hex }}>{appData.currentLight} ({appData.greenSec}s)</div>
                        <div style={{ fontSize: '10px', color: '#64748B' }}>Avg speed: {appData.avgSpeed} km/h</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* ─── RIGHT: sticky side panel ─── */}
        <div
          style={{
            width: '340px',
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            position: 'sticky',
            top: '20px',
            alignSelf: 'flex-start'
          }}
        >
          {/* Traffic Density by Approach */}
          <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: 32, height: 32, borderRadius: '9px', backgroundColor: '#FFEBE8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Gauge size={16} color="#FF5A43" />
                </div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '800', color: '#0F172A' }}>Traffic Density by Approach</div>
                  <div style={{ fontSize: '10px', color: '#64748B' }}>Real-time Video AI Analysis</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#16A34A', display: 'inline-block' }} className="animate-pulse-slow" />
                <span style={{ fontSize: '10px', fontWeight: '800', color: '#15803D' }}>LIVE</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {Object.entries(approaches).map(([dir, data]) => {
                const isCritical = data.densityPct >= 85;
                const isHigh = data.densityPct >= 65 && data.densityPct < 85;
                const isMedium = data.densityPct >= 40 && data.densityPct < 65;
                const barColor = isCritical ? '#DC2626' : isHigh ? '#FF5A43' : isMedium ? '#F59E0B' : '#16A34A';
                const statusLabel = isCritical ? 'CRITICAL' : isHigh ? 'HIGH' : isMedium ? 'MEDIUM' : 'LOW';
                const statusBg = isCritical ? '#FEF2F2' : isHigh ? '#FFF4F2' : isMedium ? '#FFFBEB' : '#F0FDF4';
                const statusColor = isCritical ? '#DC2626' : isHigh ? '#FF5A43' : isMedium ? '#B45309' : '#15803D';
                const lightHex = data.currentLight === 'GREEN' ? '#16A34A' : '#DC2626';

                return (
                  <div
                    key={dir}
                    style={{
                      backgroundColor: '#F8FAFC',
                      border: isCritical ? '1px solid #FCA5A5' : '1px solid #E2E8F0',
                      borderRadius: '12px',
                      padding: '12px 14px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontSize: '12px', fontWeight: '700', color: '#0F172A' }}>
                        {dir} <span style={{ color: '#94A3B8', fontWeight: '500' }}>({data.name.split(' ')[0]})</span>
                      </span>
                      <span style={{ fontSize: '10px', fontWeight: '800', color: statusColor, backgroundColor: statusBg, padding: '2px 8px', borderRadius: '9999px' }}>
                        {statusLabel}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '6px' }}>
                      <span style={{ fontSize: '24px', fontWeight: '900', color: barColor, fontFamily: 'Outfit, sans-serif', lineHeight: 1 }}>
                        {data.densityPct}%
                      </span>
                      <span style={{ fontSize: '11px', color: '#94A3B8' }}>density</span>
                    </div>

                    <div style={{ height: '5px', backgroundColor: '#E2E8F0', borderRadius: '9999px', overflow: 'hidden', marginBottom: '10px' }}>
                      <div style={{ height: '100%', width: `${data.densityPct}%`, backgroundColor: barColor, borderRadius: '9999px', transition: 'width 0.5s ease' }} />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', color: '#64748B' }}>
                      <span><strong style={{ color: '#0F172A' }}>{data.vehicleCount}</strong> vehicles</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontWeight: '700', color: lightHex }}>
                        <span style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: lightHex, display: 'inline-block' }} />
                        {data.currentLight} ({data.greenSec}s)
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Signal Control Preview */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              border: emergency?.active ? '2px solid #DC2626' : '1px solid #E2E8F0',
              borderRadius: '16px',
              padding: '20px',
              boxShadow: emergency?.active ? '0 0 20px rgba(220,38,38,0.15)' : '0 1px 4px rgba(0,0,0,0.04)',
              transition: 'all 0.3s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: 32, height: 32, borderRadius: '9px', backgroundColor: emergency?.active ? '#FEF2F2' : '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Zap size={16} color={emergency?.active ? '#DC2626' : '#16A34A'} />
                </div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '800', color: '#0F172A' }}>Signal Control Preview</div>
                  <div style={{ fontSize: '10px', color: '#64748B' }}>4-Phase Adaptive</div>
                </div>
              </div>
              {emergency?.active && (
                <span
                  style={{ fontSize: '10px', fontWeight: '800', color: '#DC2626', backgroundColor: '#FEF2F2', padding: '3px 8px', borderRadius: '9999px', letterSpacing: '0.04em' }}
                  className="animate-pulse-slow"
                >
                  OVERRIDE ACTIVE
                </span>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {Object.entries(approaches).map(([dir, app]) => {
                const isGreen = app.currentLight === 'GREEN';
                const isAmber = app.currentLight === 'AMBER';
                return (
                  <div
                    key={dir}
                    style={{
                      backgroundColor: isGreen ? '#F0FDF4' : '#FEF2F2',
                      border: isGreen ? '1px solid #86EFAC' : '1px solid #FCA5A5',
                      borderRadius: '12px',
                      padding: '12px',
                      textAlign: 'center'
                    }}
                  >
                    <div style={{ fontSize: '11px', fontWeight: '800', color: '#64748B', marginBottom: '10px', letterSpacing: '0.05em' }}>
                      {dir.toUpperCase()}
                    </div>

                    {/* Traffic light */}
                    <div
                      style={{
                        display: 'inline-flex',
                        flexDirection: 'column',
                        gap: '5px',
                        backgroundColor: '#1E293B',
                        padding: '8px 10px',
                        borderRadius: '14px',
                        marginBottom: '10px'
                      }}
                    >
                      <div style={{ width: 16, height: 16, borderRadius: '50%', backgroundColor: (!isGreen && !isAmber) ? '#EF4444' : '#334155', boxShadow: (!isGreen && !isAmber) ? '0 0 10px #EF4444' : 'none', transition: 'all 0.3s' }} />
                      <div style={{ width: 16, height: 16, borderRadius: '50%', backgroundColor: isAmber ? '#F59E0B' : '#334155', boxShadow: isAmber ? '0 0 10px #F59E0B' : 'none', transition: 'all 0.3s' }} />
                      <div style={{ width: 16, height: 16, borderRadius: '50%', backgroundColor: isGreen ? '#22C55E' : '#334155', boxShadow: isGreen ? '0 0 10px #22C55E' : 'none', transition: 'all 0.3s' }} />
                    </div>

                    <div style={{ fontSize: '12px', fontWeight: '900', color: isGreen ? '#15803D' : '#DC2626' }}>
                      {app.currentLight}
                    </div>
                    <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '2px' }}>
                      {app.greenSec}s
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JunctionsView;

import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Camera, Zap, Search, Filter, Check, Radio, Siren, Activity, Layers, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTraffic, INDIAN_CITIES } from '../../../context/TrafficContext';
import { Badge } from '../../common/Badge';
import { Dropdown } from '../../common/Dropdown';
import { Button } from '../../common/Button';

export const CamerasSignalsView = () => {
  const { activeCity, selectedJunction, approaches, emergency } = useTraffic();
  const [searchParams, setSearchParams] = useSearchParams();

  // Route URL Parameter for Page Index (e.g. ?page=2)
  const pageParam = searchParams.get('page') || '1';
  const currentPage = Math.max(1, parseInt(pageParam, 10) || 1);
  const ITEMS_PER_PAGE = 8;

  // Active Sub-Tab View Mode: 'BOTH' (All Merged) | 'CAMERAS' | 'SIGNALS'
  const [activeTabMode, setActiveTabMode] = useState('BOTH');

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedJunctionFilter, setSelectedJunctionFilter] = useState('ALL');
  const [signalColorFilter, setSignalColorFilter] = useState('ALL'); // ALL, GREEN, RED

  // Master Equipment Dataset (Cameras + Signals Interleaved)
  const masterEquipmentList = useMemo(() => {
    const list = [];

    INDIAN_CITIES.forEach((city) => {
      (city.junctions || [`${city.name} Central Hub`]).forEach((jName, jIdx) => {
        // 4 Cameras per junction
        const camN = { id: `${city.id}-CAM-${jIdx + 1}-N`, deviceType: 'CAMERA', name: `${jName} North CCTV`, cityName: city.name, junction: jName, approach: 'North Approach', fovSector: '70° Sector Arc', resolution: '1080p 60fps', model: 'YOLOv8 Dynamic Density', vehicles: Math.floor(Math.random() * 35) + 15, densityPct: Math.floor(Math.random() * 45) + 45, status: 'ONLINE' };
        const camE = { id: `${city.id}-CAM-${jIdx + 1}-E`, deviceType: 'CAMERA', name: `${jName} East CCTV`, cityName: city.name, junction: jName, approach: 'East Approach', fovSector: '70° Sector Arc', resolution: '1080p 60fps', model: 'YOLOv8 Swerve Risk AI', vehicles: Math.floor(Math.random() * 40) + 20, densityPct: Math.floor(Math.random() * 40) + 55, status: 'ONLINE' };
        const camW = { id: `${city.id}-CAM-${jIdx + 1}-W`, deviceType: 'CAMERA', name: `${jName} West CCTV`, cityName: city.name, junction: jName, approach: 'West Approach', fovSector: '70° Sector Arc', resolution: '1080p 60fps', model: 'YOLOv8 Multi-Class', vehicles: Math.floor(Math.random() * 25) + 10, densityPct: Math.floor(Math.random() * 35) + 30, status: 'ONLINE' };
        const camS = { id: `${city.id}-CAM-${jIdx + 1}-S`, deviceType: 'CAMERA', name: `${jName} South CCTV`, cityName: city.name, junction: jName, approach: 'South Approach', fovSector: '70° Sector Arc', resolution: '1080p 60fps', model: 'YOLOv8 Emergency Triage', vehicles: Math.floor(Math.random() * 30) + 15, densityPct: Math.floor(Math.random() * 35) + 40, status: 'ONLINE' };

        // 4 Signals per junction
        const sigN = { id: `${city.id}-SIG-${jIdx + 1}-N`, deviceType: 'SIGNAL', name: `${jName} North Traffic Light`, cityName: city.name, junction: jName, approach: 'North Approach', light: jName === selectedJunction ? approaches.North.currentLight : (jIdx % 2 === 0 ? 'RED' : 'GREEN'), greenSec: jName === selectedJunction ? approaches.North.greenSec : (jIdx % 2 === 0 ? 25 : 45), densityPct: jName === selectedJunction ? approaches.North.densityPct : 75, vehicles: jName === selectedJunction ? approaches.North.vehicleCount : 38, avgSpeed: '18.2 km/h', status: 'ONLINE' };
        const sigE = { id: `${city.id}-SIG-${jIdx + 1}-E`, deviceType: 'SIGNAL', name: `${jName} East Traffic Light`, cityName: city.name, junction: jName, approach: 'East Approach', light: jName === selectedJunction ? approaches.East.currentLight : (jIdx % 2 === 0 ? 'GREEN' : 'RED'), greenSec: jName === selectedJunction ? approaches.East.greenSec : (jIdx % 2 === 0 ? 55 : 20), densityPct: jName === selectedJunction ? approaches.East.densityPct : 92, vehicles: jName === selectedJunction ? approaches.East.vehicleCount : 48, avgSpeed: '9.5 km/h', status: 'ONLINE' };
        const sigW = { id: `${city.id}-SIG-${jIdx + 1}-W`, deviceType: 'SIGNAL', name: `${jName} West Traffic Light`, cityName: city.name, junction: jName, approach: 'West Approach', light: jName === selectedJunction ? approaches.West.currentLight : 'RED', greenSec: jName === selectedJunction ? approaches.West.greenSec : 15, densityPct: jName === selectedJunction ? approaches.West.densityPct : 28, vehicles: jName === selectedJunction ? approaches.West.vehicleCount : 14, avgSpeed: '38.0 km/h', status: 'ONLINE' };
        const sigS = { id: `${city.id}-SIG-${jIdx + 1}-S`, deviceType: 'SIGNAL', name: `${jName} South Traffic Light`, cityName: city.name, junction: jName, approach: 'South Approach', light: jName === selectedJunction ? approaches.South.currentLight : 'RED', greenSec: jName === selectedJunction ? approaches.South.greenSec : 25, densityPct: jName === selectedJunction ? approaches.South.densityPct : 45, vehicles: jName === selectedJunction ? approaches.South.vehicleCount : 22, avgSpeed: '34.0 km/h', status: 'ONLINE' };

        // Interleave Cameras and Signals into unified master array
        list.push(camN, sigN, camE, sigE, camW, sigW, camS, sigS);
      });
    });

    return list;
  }, [selectedJunction, approaches]);

  // Filtered Equipment List based on mode, search query, junction filter, signal color filter
  const filteredEquipment = useMemo(() => {
    return masterEquipmentList.filter((item) => {
      // 1. Sub-Tab Mode Filter
      if (activeTabMode === 'CAMERAS' && item.deviceType !== 'CAMERA') return false;
      if (activeTabMode === 'SIGNALS' && item.deviceType !== 'SIGNAL') return false;

      // 2. Search Query Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const mName = item.name.toLowerCase().includes(q);
        const mId = item.id.toLowerCase().includes(q);
        const mJunc = item.junction.toLowerCase().includes(q);
        const mCity = item.cityName.toLowerCase().includes(q);
        if (!mName && !mId && !mJunc && !mCity) return false;
      }

      // 3. Junction Dropdown Filter
      if (selectedJunctionFilter !== 'ALL' && item.junction !== selectedJunctionFilter) {
        return false;
      }

      // 4. Signal Light Color Filter (only applies to Signals)
      if (signalColorFilter !== 'ALL' && item.deviceType === 'SIGNAL' && item.light !== signalColorFilter) {
        return false;
      }

      return true;
    });
  }, [masterEquipmentList, activeTabMode, searchQuery, selectedJunctionFilter, signalColorFilter]);

  // Total Page Calculation
  const totalPages = Math.max(1, Math.ceil(filteredEquipment.length / ITEMS_PER_PAGE));
  const validPage = Math.min(currentPage, totalPages);

  // Paginated Equipment Data Slice
  const paginatedEquipment = useMemo(() => {
    const start = (validPage - 1) * ITEMS_PER_PAGE;
    return filteredEquipment.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredEquipment, validPage]);

  // Page Index URL Parameter Updater
  const handlePageChange = (newPage) => {
    setSearchParams((prevParams) => {
      const newParams = new URLSearchParams(prevParams);
      newParams.set('page', newPage.toString());
      return newParams;
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Junction Dropdown Options
  const junctionOptions = useMemo(() => {
    const juncs = Array.from(new Set(masterEquipmentList.map((e) => e.junction)));
    return [
      { value: 'ALL', label: 'All Junctions (Nationwide)' },
      ...juncs.map((j) => ({ value: j, label: j }))
    ];
  }, [masterEquipmentList]);

  const totalCamsCount = masterEquipmentList.filter((e) => e.deviceType === 'CAMERA').length;
  const totalSigsCount = masterEquipmentList.filter((e) => e.deviceType === 'SIGNAL').length;

  return (
    <div className="view-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* 1. Header Control & Sub-Tabs Toolbar */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: '16px',
          padding: '16px 20px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px'
        }}
      >
        {/* Mode Selector Tabs (Merged All, Cameras Only, Signals Only) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => {
              setActiveTabMode('BOTH');
              handlePageChange(1);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              borderRadius: '10px',
              fontSize: '13px',
              fontWeight: '800',
              cursor: 'pointer',
              border: activeTabMode === 'BOTH' ? '2px solid #FF5A43' : '1px solid #E2E8F0',
              backgroundColor: activeTabMode === 'BOTH' ? '#FFEBE8' : '#F8FAFC',
              color: activeTabMode === 'BOTH' ? '#FF5A43' : '#475569',
              transition: 'all 0.15s ease'
            }}
          >
            <Layers size={16} color={activeTabMode === 'BOTH' ? '#FF5A43' : '#64748B'} />
            <span>All Merged Equipment ({totalCamsCount + totalSigsCount})</span>
          </button>

          <button
            onClick={() => {
              setActiveTabMode('CAMERAS');
              handlePageChange(1);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              borderRadius: '10px',
              fontSize: '13px',
              fontWeight: '800',
              cursor: 'pointer',
              border: activeTabMode === 'CAMERAS' ? '2px solid #0284C7' : '1px solid #E2E8F0',
              backgroundColor: activeTabMode === 'CAMERAS' ? '#F0F9FF' : '#F8FAFC',
              color: activeTabMode === 'CAMERAS' ? '#0369A1' : '#475569',
              transition: 'all 0.15s ease'
            }}
          >
            <Camera size={16} color={activeTabMode === 'CAMERAS' ? '#0284C7' : '#64748B'} />
            <span>Cameras Only ({totalCamsCount})</span>
          </button>

          <button
            onClick={() => {
              setActiveTabMode('SIGNALS');
              handlePageChange(1);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              borderRadius: '10px',
              fontSize: '13px',
              fontWeight: '800',
              cursor: 'pointer',
              border: activeTabMode === 'SIGNALS' ? '2px solid #16A34A' : '1px solid #E2E8F0',
              backgroundColor: activeTabMode === 'SIGNALS' ? '#F0FDF4' : '#F8FAFC',
              color: activeTabMode === 'SIGNALS' ? '#15803D' : '#475569',
              transition: 'all 0.15s ease'
            }}
          >
            <Zap size={16} color={activeTabMode === 'SIGNALS' ? '#16A34A' : '#64748B'} />
            <span>Signals Only ({totalSigsCount})</span>
          </button>
        </div>

        {/* Search Bar & Junction Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: '320px', justifyContent: 'flex-end' }}>
          <div style={{ position: 'relative', width: '280px' }}>
            <input
              type="text"
              placeholder="Search camera or signal..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                handlePageChange(1);
              }}
              style={{
                width: '100%',
                padding: '8px 12px 8px 34px',
                fontSize: '12px',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                outline: 'none',
                backgroundColor: '#F8FAFC'
              }}
            />
            <Search size={14} color="#64748B" style={{ position: 'absolute', left: '10px', top: '10px' }} />
          </div>

          <div style={{ width: '240px' }}>
            <Dropdown
              options={junctionOptions}
              value={selectedJunctionFilter}
              onChange={(val) => {
                setSelectedJunctionFilter(val);
                handlePageChange(1);
              }}
              placeholder="Filter by Junction"
            />
          </div>
        </div>
      </div>

      {/* 2. MERGED EQUIPMENT GRID CONTAINER */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}
      >
        {/* Container Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: '14px' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#0F172A', margin: 0 }}>
              {activeTabMode === 'BOTH' ? 'All Merged Cameras & Traffic Signals' : activeTabMode === 'CAMERAS' ? 'CCTV Camera Feeds' : 'Traffic Light Signals'}
            </h2>
            <div style={{ fontSize: '12px', color: '#64748B' }}>
              Showing {filteredEquipment.length} devices across Indian intersections • Page {validPage} of {totalPages}
            </div>
          </div>

          {/* Optional Light Color Filter Pills (when signals included) */}
          {(activeTabMode === 'BOTH' || activeTabMode === 'SIGNALS') && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748B', uppercase: true }}>Light:</span>
              {[
                { id: 'ALL', label: 'All' },
                { id: 'GREEN', label: 'GREEN' },
                { id: 'RED', label: 'RED' }
              ].map((btn) => (
                <button
                  key={btn.id}
                  onClick={() => {
                    setSignalColorFilter(btn.id);
                    handlePageChange(1);
                  }}
                  style={{
                    padding: '3px 8px',
                    fontSize: '11px',
                    fontWeight: '700',
                    borderRadius: '6px',
                    border: signalColorFilter === btn.id ? '1px solid #16A34A' : '1px solid #E2E8F0',
                    backgroundColor: signalColorFilter === btn.id ? '#DCFCE7' : '#F8FAFC',
                    color: signalColorFilter === btn.id ? '#15803D' : '#475569',
                    cursor: 'pointer'
                  }}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Merged Equipment Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))', gap: '14px' }}>
          {paginatedEquipment.map((item) => {
            const isCam = item.deviceType === 'CAMERA';
            const signalHex = item.light === 'GREEN' ? '#22C55E' : item.light === 'AMBER' ? '#F59E0B' : '#EF4444';

            return (
              <div
                key={item.id}
                style={{
                  backgroundColor: '#F8FAFC',
                  border: isCam ? '1px solid #BAE6FD' : `1px solid ${signalHex}44`,
                  borderRadius: '12px',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
                  transition: 'all 0.15s ease'
                }}
              >
                {/* Header Badge Row */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {isCam ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '10px', fontWeight: '800', backgroundColor: '#E0F2FE', color: '#0369A1', padding: '3px 8px', borderRadius: '6px' }}>
                        <Camera size={12} color="#0284C7" />
                        CCTV CAMERA
                      </span>
                    ) : (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '10px', fontWeight: '800', backgroundColor: `${signalHex}18`, color: signalHex, padding: '3px 8px', borderRadius: '6px' }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: signalHex, boxShadow: `0 0 6px ${signalHex}` }} />
                        TRAFFIC SIGNAL ({item.light})
                      </span>
                    )}
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: '700', color: isCam ? '#0284C7' : signalHex }}>
                    {item.densityPct}% Load
                  </span>
                </div>

                {/* Title & Location */}
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '800', color: '#0F172A' }}>
                    {item.name}
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748B' }}>
                    {item.junction} • {item.cityName}
                  </div>
                </div>

                {/* Details Table Card */}
                <div style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', padding: '10px', border: '1px solid #E2E8F0', fontSize: '11px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {isCam ? (
                    <>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#64748B' }}>Approach Corridor:</span>
                        <span style={{ fontWeight: '700', color: '#0F172A' }}>{item.approach}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#64748B' }}>Resolution / FOV:</span>
                        <span style={{ fontWeight: '700', color: '#0F172A' }}>{item.resolution} ({item.fovSector})</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#64748B' }}>AI Vision Model:</span>
                        <span style={{ fontWeight: '700', color: '#0284C7' }}>{item.model}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#64748B' }}>Active Vehicle Count:</span>
                        <span style={{ fontWeight: '800', color: '#0284C7' }}>{item.vehicles} units</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#64748B' }}>Signal Phase:</span>
                        <span style={{ fontWeight: '900', color: signalHex }}>{item.light} ({item.greenSec}s timer)</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#64748B' }}>Approach Corridor:</span>
                        <span style={{ fontWeight: '700', color: '#0F172A' }}>{item.approach}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#64748B' }}>Queue Vehicles:</span>
                        <span style={{ fontWeight: '700', color: '#0F172A' }}>{item.vehicles} units</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#64748B' }}>Average Flow Speed:</span>
                        <span style={{ fontWeight: '700', color: '#0F172A' }}>{item.avgSpeed}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <PaginationBar
            currentPage={validPage}
            totalPages={totalPages}
            totalItems={filteredEquipment.length}
            label="equipment items"
            onPageChange={handlePageChange}
          />
        )}
      </div>
    </div>
  );
};

// Reusable Pagination Bar
const PaginationBar = ({ currentPage, totalPages, onPageChange, totalItems, label }) => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 16px',
        backgroundColor: '#FFFFFF',
        border: '1px solid #E2E8F0',
        borderRadius: '12px',
        marginTop: '8px',
        flexWrap: 'wrap',
        gap: '10px'
      }}
    >
      <div style={{ fontSize: '12px', color: '#64748B', fontWeight: '600' }}>
        Showing page <strong>{currentPage}</strong> of <strong>{totalPages}</strong> ({totalItems} {label})
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <button
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          style={{
            padding: '6px 12px',
            fontSize: '12px',
            fontWeight: '700',
            borderRadius: '8px',
            border: '1px solid #CBD5E1',
            backgroundColor: currentPage <= 1 ? '#F1F5F9' : '#FFFFFF',
            color: currentPage <= 1 ? '#94A3B8' : '#0F172A',
            cursor: currentPage <= 1 ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          <ChevronLeft size={14} />
          <span>Previous</span>
        </button>

        {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
          <button
            key={pg}
            onClick={() => onPageChange(pg)}
            style={{
              width: '32px',
              height: '32px',
              fontSize: '12px',
              fontWeight: '800',
              borderRadius: '8px',
              border: pg === currentPage ? '2px solid #FF5A43' : '1px solid #E2E8F0',
              backgroundColor: pg === currentPage ? '#FFEBE8' : '#FFFFFF',
              color: pg === currentPage ? '#FF5A43' : '#475569',
              cursor: 'pointer'
            }}
          >
            {pg}
          </button>
        ))}

        <button
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          style={{
            padding: '6px 12px',
            fontSize: '12px',
            fontWeight: '700',
            borderRadius: '8px',
            border: '1px solid #CBD5E1',
            backgroundColor: currentPage >= totalPages ? '#F1F5F9' : '#FFFFFF',
            color: currentPage >= totalPages ? '#94A3B8' : '#0F172A',
            cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          <span>Next</span>
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
};

export default CamerasSignalsView;

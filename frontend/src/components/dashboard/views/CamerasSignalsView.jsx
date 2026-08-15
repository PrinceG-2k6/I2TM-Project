import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Camera, Zap, Search, Layers, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTraffic } from '../../../context/TrafficContext';
import { INDIAN_CITIES } from '../../../data/dummyData';
import { Dropdown } from '../../common/Dropdown';

export const CamerasSignalsView = () => {
  const { selectedJunction, approaches } = useTraffic();
  const [searchParams, setSearchParams] = useSearchParams();

  const pageParam = searchParams.get('page') || '1';
  const currentPage = Math.max(1, parseInt(pageParam, 10) || 1);
  const ITEMS_PER_PAGE = 8;

  const [activeTabMode, setActiveTabMode] = useState('BOTH');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedJunctionFilter, setSelectedJunctionFilter] = useState('ALL');
  const [signalColorFilter, setSignalColorFilter] = useState('ALL');

  const masterEquipmentList = useMemo(() => {
    const list = [];
    INDIAN_CITIES.forEach((city) => {
      (city.junctions || [`${city.name} Central Hub`]).forEach((jName, jIdx) => {
        const camN = { id: `${city.id}-CAM-${jIdx + 1}-N`, deviceType: 'CAMERA', name: `${jName} North CCTV`, cityName: city.name, junction: jName, approach: 'North Approach', fovSector: '70° Sector Arc', resolution: '1080p 60fps', model: 'YOLOv8 Dynamic Density', vehicles: Math.floor(Math.random() * 35) + 15, densityPct: Math.floor(Math.random() * 45) + 45, status: 'ONLINE' };
        const camE = { id: `${city.id}-CAM-${jIdx + 1}-E`, deviceType: 'CAMERA', name: `${jName} East CCTV`, cityName: city.name, junction: jName, approach: 'East Approach', fovSector: '70° Sector Arc', resolution: '1080p 60fps', model: 'YOLOv8 Swerve Risk AI', vehicles: Math.floor(Math.random() * 40) + 20, densityPct: Math.floor(Math.random() * 40) + 55, status: 'ONLINE' };
        const camW = { id: `${city.id}-CAM-${jIdx + 1}-W`, deviceType: 'CAMERA', name: `${jName} West CCTV`, cityName: city.name, junction: jName, approach: 'West Approach', fovSector: '70° Sector Arc', resolution: '1080p 60fps', model: 'YOLOv8 Multi-Class', vehicles: Math.floor(Math.random() * 25) + 10, densityPct: Math.floor(Math.random() * 35) + 30, status: 'ONLINE' };
        const camS = { id: `${city.id}-CAM-${jIdx + 1}-S`, deviceType: 'CAMERA', name: `${jName} South CCTV`, cityName: city.name, junction: jName, approach: 'South Approach', fovSector: '70° Sector Arc', resolution: '1080p 60fps', model: 'YOLOv8 Emergency Triage', vehicles: Math.floor(Math.random() * 30) + 15, densityPct: Math.floor(Math.random() * 35) + 40, status: 'ONLINE' };

        const sigN = { id: `${city.id}-SIG-${jIdx + 1}-N`, deviceType: 'SIGNAL', name: `${jName} North Traffic Light`, cityName: city.name, junction: jName, approach: 'North Approach', light: jName === selectedJunction ? approaches.North.currentLight : (jIdx % 2 === 0 ? 'RED' : 'GREEN'), greenSec: jName === selectedJunction ? approaches.North.greenSec : (jIdx % 2 === 0 ? 25 : 45), densityPct: jName === selectedJunction ? approaches.North.densityPct : 75, vehicles: jName === selectedJunction ? approaches.North.vehicleCount : 38, avgSpeed: '18.2 km/h', status: 'ONLINE' };
        const sigE = { id: `${city.id}-SIG-${jIdx + 1}-E`, deviceType: 'SIGNAL', name: `${jName} East Traffic Light`, cityName: city.name, junction: jName, approach: 'East Approach', light: jName === selectedJunction ? approaches.East.currentLight : (jIdx % 2 === 0 ? 'GREEN' : 'RED'), greenSec: jName === selectedJunction ? approaches.East.greenSec : (jIdx % 2 === 0 ? 55 : 20), densityPct: jName === selectedJunction ? approaches.East.densityPct : 92, vehicles: jName === selectedJunction ? approaches.East.vehicleCount : 48, avgSpeed: '9.5 km/h', status: 'ONLINE' };
        const sigW = { id: `${city.id}-SIG-${jIdx + 1}-W`, deviceType: 'SIGNAL', name: `${jName} West Traffic Light`, cityName: city.name, junction: jName, approach: 'West Approach', light: jName === selectedJunction ? approaches.West.currentLight : 'RED', greenSec: jName === selectedJunction ? approaches.West.greenSec : 15, densityPct: jName === selectedJunction ? approaches.West.densityPct : 28, vehicles: jName === selectedJunction ? approaches.West.vehicleCount : 14, avgSpeed: '38.0 km/h', status: 'ONLINE' };
        const sigS = { id: `${city.id}-SIG-${jIdx + 1}-S`, deviceType: 'SIGNAL', name: `${jName} South Traffic Light`, cityName: city.name, junction: jName, approach: 'South Approach', light: jName === selectedJunction ? approaches.South.currentLight : 'RED', greenSec: jName === selectedJunction ? approaches.South.greenSec : 25, densityPct: jName === selectedJunction ? approaches.South.densityPct : 45, vehicles: jName === selectedJunction ? approaches.South.vehicleCount : 22, avgSpeed: '34.0 km/h', status: 'ONLINE' };

        list.push(camN, sigN, camE, sigE, camW, sigW, camS, sigS);
      });
    });
    return list;
  }, [selectedJunction, approaches]);

  const filteredEquipment = useMemo(() => {
    return masterEquipmentList.filter((item) => {
      if (activeTabMode === 'CAMERAS' && item.deviceType !== 'CAMERA') return false;
      if (activeTabMode === 'SIGNALS' && item.deviceType !== 'SIGNAL') return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        if (!item.name.toLowerCase().includes(q) && !item.id.toLowerCase().includes(q) && !item.junction.toLowerCase().includes(q) && !item.cityName.toLowerCase().includes(q)) return false;
      }
      if (selectedJunctionFilter !== 'ALL' && item.junction !== selectedJunctionFilter) return false;
      if (signalColorFilter !== 'ALL' && item.deviceType === 'SIGNAL' && item.light !== signalColorFilter) return false;
      return true;
    });
  }, [masterEquipmentList, activeTabMode, searchQuery, selectedJunctionFilter, signalColorFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredEquipment.length / ITEMS_PER_PAGE));
  const validPage = Math.min(currentPage, totalPages);

  const paginatedEquipment = useMemo(() => {
    const start = (validPage - 1) * ITEMS_PER_PAGE;
    return filteredEquipment.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredEquipment, validPage]);

  const handlePageChange = (newPage) => {
    setSearchParams((prevParams) => {
      const newParams = new URLSearchParams(prevParams);
      newParams.set('page', newPage.toString());
      return newParams;
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const junctionOptions = useMemo(() => {
    const juncs = Array.from(new Set(masterEquipmentList.map((e) => e.junction)));
    return [
      { value: 'ALL', label: 'All Junctions (Nationwide)' },
      ...juncs.map((j) => ({ value: j, label: j }))
    ];
  }, [masterEquipmentList]);

  const totalCamsCount = masterEquipmentList.filter((e) => e.deviceType === 'CAMERA').length;
  const totalSigsCount = masterEquipmentList.filter((e) => e.deviceType === 'SIGNAL').length;

  const tabModes = [
    { id: 'BOTH', label: `All (${totalCamsCount + totalSigsCount})`, icon: Layers },
    { id: 'CAMERAS', label: `Cameras (${totalCamsCount})`, icon: Camera },
    { id: 'SIGNALS', label: `Signals (${totalSigsCount})`, icon: Zap },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-(--color-4) rounded-sm p-4 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-1.5">
          {tabModes.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => { setActiveTabMode(id); handlePageChange(1); }}
              className={`flex items-center gap-2 py-1 px-2.5 rounded-sm text-sm cursor-pointer transition-all duration-300 border ${activeTabMode === id ? 'bg-(--color-5) border-(--color-6) text-(--color-6)' : 'border-(--color-3) text-(--color-2)'}`}
            >
              <Icon size={14} />
              <span>{label}</span>
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 flex-1 min-w-60 justify-end">
          <div className="relative w-60">
            <input
              type="text"
              placeholder="Search camera or signal..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); handlePageChange(1); }}
              className="w-full py-1.5 pr-3 pl-7 text-sm rounded-sm border border-(--color-3) outline-none bg-(--color-5)"
            />
            <Search size={13} color="#272727" className="absolute left-2 top-2.5" />
          </div>
          <div className="w-52">
            <Dropdown
              options={junctionOptions}
              value={selectedJunctionFilter}
              onChange={(val) => { setSelectedJunctionFilter(val); handlePageChange(1); }}
              placeholder="Filter by Junction"
            />
          </div>
        </div>
      </div>
      <div className="bg-(--color-4) rounded-sm p-4 flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-(--color-3) pb-3">
          <div>
            <div>
              {activeTabMode === 'BOTH' ? 'All Cameras & Signals' : activeTabMode === 'CAMERAS' ? 'CCTV Camera Feeds' : 'Traffic Light Signals'}
            </div>
            <div className="mt-1 text-xs text-(--color-2)">
              {filteredEquipment.length} devices · Page {validPage} of {totalPages}
            </div>
          </div>
          {(activeTabMode === 'BOTH' || activeTabMode === 'SIGNALS') && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-(--color-2)">Light:</span>
              {['ALL', 'GREEN', 'RED'].map((id) => (
                <button
                  key={id}
                  onClick={() => { setSignalColorFilter(id); handlePageChange(1); }}
                  className={`py-1 px-2.5 text-xs rounded-sm cursor-pointer border transition-all duration-150 ${signalColorFilter === id ? 'border-(--color-6) text-(--color-6) bg-(--color-5)' : 'border-(--color-3) text-(--color-2)'}`}
                >
                  {id}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(290px,1fr))] gap-4">
          {paginatedEquipment.map((item) => {
            const isCam = item.deviceType === 'CAMERA';
            const signalHex = item.light === 'GREEN' ? '#22C55E' : item.light === 'AMBER' ? '#F59E0B' : '#EF4444';

            return (
              <div
                key={item.id}
                className="bg-(--color-5) rounded-sm p-3.5 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    {isCam ? (
                      <span className="flex items-center gap-1 text-xs text-(--color-2) bg-(--color-4) border border-(--color-3) py-0.5 px-2 rounded-sm">
                        <Camera size={12} />
                        Camera
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-xs py-0.5 px-2 rounded-sm border" style={{ color: signalHex, borderColor: `${signalHex}44`, backgroundColor: `${signalHex}10` }}>
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: signalHex }} />
                        {item.light}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-(--color-2)">{item.densityPct}% Load</span>
                </div>
                <div>
                  <div className="text-sm">{item.name}</div>
                  <div className="mt-2 text-xs text-(--color-2)">{item.junction} • {item.cityName}</div>
                </div>
                <div className="bg-(--color-4) rounded-sm p-2.5 text-xs space-y-2">
                  {isCam ? (
                    <>
                      <div className="flex justify-between">
                        <span className="text-(--color-2)">Approach:</span>
                        <span>{item.approach}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-(--color-2)">Resolution / FOV:</span>
                        <span>{item.resolution} ({item.fovSector})</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-(--color-2)">AI Model:</span>
                        <span>{item.model}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-(--color-2)">Vehicles:</span>
                        <span>{item.vehicles} units</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex justify-between">
                        <span className="text-(--color-2)">Phase:</span>
                        <span style={{ color: signalHex }}>{item.light} ({item.greenSec}s)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-(--color-2)">Approach:</span>
                        <span>{item.approach}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-(--color-2)">Queue:</span>
                        <span>{item.vehicles} units</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-(--color-2)">Avg Speed:</span>
                        <span>{item.avgSpeed}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between py-2.5 px-3 bg-(--color-5) rounded-sm flex-wrap gap-2">
            <div className="text-xs text-(--color-2)">
              Page {validPage} of {totalPages} ({filteredEquipment.length} items)
            </div>
            <div className="flex items-center gap-1.5">
              <button
                disabled={validPage <= 1}
                onClick={() => handlePageChange(validPage - 1)}
                className={`py-1 px-2.5 text-xs rounded-sm border flex items-center gap-1 ${validPage <= 1 ? 'border-(--color-3) text-(--color-2) cursor-not-allowed' : 'border-(--color-3) cursor-pointer'}`}
              >
                <ChevronLeft size={13} />
                Prev
              </button>

              {Array.from(
                { length: Math.min(totalPages, validPage + 2) - Math.max(1, validPage - 2) + 1 },
                (_, i) => Math.max(1, validPage - 2) + i
              ).map((pg) => (
                <button
                  key={pg}
                  onClick={() => handlePageChange(pg)}
                  className={`w-7 h-7 text-xs rounded-sm border cursor-pointer transition-colors duration-150 ${pg === validPage ? 'border-(--color-6) text-(--color-6) bg-(--color-5)' : 'border-(--color-3) text-(--color-2) hover:border-(--color-2)'}`}
                >
                  {pg}
                </button>
              ))}

              <button
                disabled={validPage >= totalPages}
                onClick={() => handlePageChange(validPage + 1)}
                className={`py-1 px-2.5 text-xs rounded-sm border flex items-center gap-1 ${validPage >= totalPages ? 'border-(--color-3) text-(--color-2) cursor-not-allowed' : 'border-(--color-3) cursor-pointer'}`}
              >
                Next
                <ChevronRight size={13} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CamerasSignalsView;

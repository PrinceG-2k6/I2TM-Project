import { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Camera, Zap, Search, Layers, ChevronLeft, ChevronRight, MapPin } from 'lucide-react';
import { useTraffic } from '../../../context/TrafficContext';
import { INDIAN_CITIES } from '../../../data/dummyData';
import { getSignalHex } from '../../../utils/trafficUtils';
import { Dropdown } from '../../common/Dropdown';

export const CamerasSignalsView = () => {
  const { selectedJunction, selectedJunctionId, approaches, setSelectedJunction, setActiveMapElementId } = useTraffic();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const pageParam = searchParams.get('page') || '1';
  const currentPage = Math.max(1, parseInt(pageParam, 10) || 1);
  const ITEMS_PER_PAGE = 8;

  const [activeTabMode, setActiveTabMode] = useState('BOTH');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedJunctionFilter, setSelectedJunctionFilter] = useState('ALL');
  const [signalColorFilter, setSignalColorFilter] = useState('ALL');

  // Fetch master equipment list from backend API
  const [masterEquipmentList, setMasterEquipmentList] = useState([]);
  
  useEffect(() => {
    const loadEquipment = async () => {
      try {
        const { fetchAPI } = await import('../../../utils/api');
        const data = await fetchAPI('/equipment');
        const mappedData = data.map(eq => ({
          ...eq,
          deviceType: eq.device_type,
          cityName: eq.city_name,
          junction: eq.junction_name,
          light: 'RED', // Fallback for signals
        }));
        setMasterEquipmentList(mappedData);
      } catch (err) {
        console.error("Failed to load equipment", err);
      }
    };
    loadEquipment();
    const int = setInterval(loadEquipment, 10000); // refresh every 10s
    return () => clearInterval(int);
  }, []);

  const filteredEquipment = useMemo(() => {
    return masterEquipmentList.filter((item) => {
      const idParam = searchParams.get('id');
      if (idParam && item.device_id !== idParam && item.id !== idParam) return false;
      
      if (activeTabMode === 'CAMERAS' && item.deviceType !== 'CAMERA') return false;
      if (activeTabMode === 'SIGNALS' && item.deviceType !== 'SIGNAL') return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        if (!item.name.toLowerCase().includes(q) && !(item.device_id || '').toLowerCase().includes(q) && !item.junction.toLowerCase().includes(q) && !item.cityName.toLowerCase().includes(q)) return false;
      }
      if (selectedJunctionFilter !== 'ALL' && item.junction !== selectedJunctionFilter) return false;
      if (signalColorFilter !== 'ALL' && item.deviceType === 'SIGNAL' && item.light !== signalColorFilter) return false;
      return true;
    });
  }, [masterEquipmentList, activeTabMode, searchQuery, selectedJunctionFilter, signalColorFilter, searchParams]);

  const totalPages = Math.max(1, Math.ceil(filteredEquipment.length / ITEMS_PER_PAGE));
  const validPage  = Math.min(currentPage, totalPages);

  const paginatedEquipment = useMemo(() => {
    const start = (validPage - 1) * ITEMS_PER_PAGE;
    return filteredEquipment.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredEquipment, validPage]);

  const handlePageChange = (newPage) => {
    setSearchParams((prev) => { const p = new URLSearchParams(prev); p.set('page', newPage.toString()); return p; });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const junctionOptions = useMemo(() => {
    const juncs = Array.from(new Set(masterEquipmentList.map((e) => e.junction)));
    return [{ value: 'ALL', label: 'All Junctions (Nationwide)' }, ...juncs.map((j) => ({ value: j, label: j }))];
  }, [masterEquipmentList]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newEq, setNewEq] = useState({ device_id: '', device_type: 'CAMERA', name: '', city_name: 'Nagpur', junction_id: '', junction_name: '', approach: 'North Approach', latitude: 0, longitude: 0 });

  const handleAddEquipment = async (e) => {
    e.preventDefault();
    try {
      const { fetchAPI } = await import('../../../utils/api');
      await fetchAPI('/equipment', {
        method: 'POST',
        body: JSON.stringify(newEq)
      });
      alert("Equipment added successfully!");
      setShowAddModal(false);
      // It will auto-refresh via the 10s interval, or we could trigger a fetch here.
    } catch (err) {
      alert("Failed to add equipment: " + err.message);
    }
  };

  const totalCamsCount = masterEquipmentList.filter((e) => e.device_type === 'CAMERA').length;
  const totalSigsCount = masterEquipmentList.filter((e) => e.device_type === 'SIGNAL').length;

  const tabModes = [
    { id: 'BOTH',    label: `All (${totalCamsCount + totalSigsCount})`, icon: Layers },
    { id: 'CAMERAS', label: `Cameras (${totalCamsCount})`,              icon: Camera },
    { id: 'SIGNALS', label: `Signals (${totalSigsCount})`,              icon: Zap }
  ];

  return (
    <div className="space-y-6 relative">
      {searchParams.get('id') && (
        <div className="bg-sky-50 border border-sky-200 text-sky-800 p-3 rounded-sm flex items-center justify-between">
          <div className="text-sm">Viewing specific equipment: <strong>{searchParams.get('id')}</strong></div>
          <button 
            onClick={() => {
              const p = new URLSearchParams(searchParams);
              p.delete('id');
              setSearchParams(p);
            }} 
            className="text-xs bg-white border border-sky-300 px-3 py-1 rounded cursor-pointer hover:bg-sky-100"
          >
            Clear Filter
          </button>
        </div>
      )}
      
      {/* Add Equipment Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-(--color-4) border border-(--color-3) p-6 rounded-md w-[400px]">
            <h3 className="text-lg mb-4">Add New Equipment</h3>
            <form onSubmit={handleAddEquipment} className="space-y-3">
              <input type="text" placeholder="Device ID (e.g. NGP-CAM-99)" required value={newEq.device_id} onChange={e => setNewEq({...newEq, device_id: e.target.value})} className="w-full p-2 bg-(--color-5) border border-(--color-3) rounded text-sm"/>
              <select value={newEq.device_type} onChange={e => setNewEq({...newEq, device_type: e.target.value})} className="w-full p-2 bg-(--color-5) border border-(--color-3) rounded text-sm">
                <option value="CAMERA">Camera</option>
                <option value="SIGNAL">Signal</option>
              </select>
              <input type="text" placeholder="Name (e.g. New North CCTV)" required value={newEq.name} onChange={e => setNewEq({...newEq, name: e.target.value})} className="w-full p-2 bg-(--color-5) border border-(--color-3) rounded text-sm"/>

              <input type="text" placeholder="Junction ID" required value={newEq.junction_id} onChange={e => setNewEq({...newEq, junction_id: e.target.value})} className="w-full p-2 bg-(--color-5) border border-(--color-3) rounded text-sm"/>
              <input type="text" placeholder="Junction Name" required value={newEq.junction_name} onChange={e => setNewEq({...newEq, junction_name: e.target.value})} className="w-full p-2 bg-(--color-5) border border-(--color-3) rounded text-sm"/>
              <input type="number" step="any" placeholder="Latitude" required value={newEq.latitude} onChange={e => setNewEq({...newEq, latitude: parseFloat(e.target.value)})} className="w-full p-2 bg-(--color-5) border border-(--color-3) rounded text-sm"/>
              <input type="number" step="any" placeholder="Longitude" required value={newEq.longitude} onChange={e => setNewEq({...newEq, longitude: parseFloat(e.target.value)})} className="w-full p-2 bg-(--color-5) border border-(--color-3) rounded text-sm"/>
              
              <div className="flex justify-end gap-2 mt-4">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-3 py-1.5 bg-gray-600 hover:bg-gray-500 rounded text-sm">Cancel</button>
                <button type="submit" className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 rounded text-sm">Save Equipment</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Filter bar */}
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
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 py-1.5 px-3 rounded-sm bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer transition-colors text-sm mr-2"
          >
            + Add Equipment
          </button>
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
          <button
            onClick={async () => {
              if (!selectedJunctionId) return alert("Please wait for junctions to load");
              try {
                const { fetchAPI } = await import('../../../utils/api');
                alert("Generating Signal Optimization using AI...");
                const res = await fetchAPI(`/traffic/recommendations/${selectedJunctionId}`, { method: 'POST' });
                alert("AI Recommendation: " + JSON.stringify(res.recommended_timings));
              } catch(e) {
                alert("Failed to optimize: " + e.message);
              }
            }}
            className="flex items-center gap-2 py-1.5 px-3 rounded-sm bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer transition-colors text-sm"
          >
            <Zap size={14} /> Generate AI Signal Optimization
          </button>
        </div>
      </div>

      {/* Equipment list */}
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
            const signalHex = getSignalHex(item.light);
            return (
              <div key={item.id} className="bg-(--color-5) rounded-sm p-3.5 space-y-3">
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
                  <button
                    onClick={() => { setSelectedJunction(item.junction); setActiveMapElementId(item.device_id); navigate('/dashboard?tab=overview'); }}
                    className="text-(--color-6) hover:bg-(--color-6)/10 p-1 rounded-sm transition-colors cursor-pointer flex items-center gap-1 text-xs"
                    title="Show on map"
                  >
                    <MapPin size={14} />
                    <span className="hidden sm:inline text-nowrap">Show on Map</span>
                  </button>
                </div>
                <div>
                  <div className="text-sm font-semibold pr-2">{item.name}</div>
                  <div className="mt-1 text-xs text-(--color-2)">{item.junction} • {item.cityName}</div>
                </div>
                <div className="bg-(--color-4) rounded-sm p-2.5 text-xs space-y-2">
                  {isCam ? (
                    <>
                      <div className="flex justify-between"><span className="text-(--color-2)">Approach:</span><span>{item.approach}</span></div>
                      <div className="flex justify-between"><span className="text-(--color-2)">Resolution / FOV:</span><span>{item.resolution} ({item.fovSector})</span></div>
                      <div className="flex justify-between"><span className="text-(--color-2)">AI Model:</span><span>{item.model}</span></div>
                      <div className="flex justify-between"><span className="text-(--color-2)">Vehicles:</span><span>{item.vehicles} units</span></div>
                      <div className="flex justify-between"><span className="text-(--color-2)">Density Load:</span><span>{item.densityPct}%</span></div>
                    </>
                  ) : (
                    <>
                      <div className="flex justify-between"><span className="text-(--color-2)">Phase:</span><span style={{ color: signalHex }}>{item.light} ({item.greenSec}s)</span></div>
                      <div className="flex justify-between"><span className="text-(--color-2)">Approach:</span><span>{item.approach}</span></div>
                      <div className="flex justify-between"><span className="text-(--color-2)">Queue:</span><span>{item.vehicles} units</span></div>
                      <div className="flex justify-between"><span className="text-(--color-2)">Avg Speed:</span><span>{item.avgSpeed}</span></div>
                      <div className="flex justify-between"><span className="text-(--color-2)">Density Load:</span><span>{item.densityPct}%</span></div>
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
            <div className="text-xs text-(--color-2)">Page {validPage} of {totalPages} ({filteredEquipment.length} items)</div>
            <div className="flex items-center gap-1.5">
              <button
                disabled={validPage <= 1}
                onClick={() => handlePageChange(validPage - 1)}
                className={`py-1 px-2.5 text-xs rounded-sm border flex items-center gap-1 ${validPage <= 1 ? 'border-(--color-3) text-(--color-2) cursor-not-allowed' : 'border-(--color-3) cursor-pointer'}`}
              >
                <ChevronLeft size={13} /> Prev
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
                Next <ChevronRight size={13} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CamerasSignalsView;

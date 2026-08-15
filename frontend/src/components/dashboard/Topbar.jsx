import React, { useState, useRef, useEffect } from 'react';
import { Radio, Search, MapPin, Crosshair, ChevronDown, Check, Sliders } from 'lucide-react';
import { useTraffic } from '../../context/TrafficContext';
import { INDIAN_CITIES } from '../../data/dummyData';
import { Button } from '../common/Button';

export const Topbar = ({
  activeTab = 'dashboard',
  activeSubsection = null,
  hasMultipleSubsections = false,
  onToggleFilters
}) => {
  const {
    activeCity,
    handleSelectCity,
    handleSearchCityQuery,
    detectUserLocation,
    isDetectingLocation,
    userLocationDetected,
    activeCorridors,
    triggerEmergencyCorridor,
    isLiveSimulating,
    setIsLiveSimulating,
    activeFilterCount
  } = useTraffic();

  // City Search & Picker Dropdown State
  const [isCitySearchOpen, setIsCitySearchOpen] = useState(false);
  const [citySearchInput, setCitySearchInput] = useState('');
  const [isSearchingCustom, setIsSearchingCustom] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsCitySearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const emergency = activeCorridors && activeCorridors.length > 0 ? activeCorridors[0] : { active: false };

  // Filtered Cities list based on input query
  const filteredCities = INDIAN_CITIES.filter((c) =>
    c.name.toLowerCase().includes(citySearchInput.toLowerCase()) ||
    c.state.toLowerCase().includes(citySearchInput.toLowerCase())
  );

  const handleSelectCityItem = (cityObj) => {
    handleSelectCity(cityObj);
    setIsCitySearchOpen(false);
    setCitySearchInput('');
  };

  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    if (!citySearchInput.trim()) return;
    setIsSearchingCustom(true);
    await handleSearchCityQuery(citySearchInput);
    setIsSearchingCustom(false);
    setIsCitySearchOpen(false);
    setCitySearchInput('');
  };

  return (
    <header className="bg-(--color-4) w-full h-fit px-3 py-2 flex items-center justify-between sticky top-0 z-10">
      <div className="flex items-center gap-4">
        <div ref={dropdownRef} className="relative w-70">
          <form
            onSubmit={handleSearchSubmit}
            className="flex items-center gap-1.5 px-3 bg-(--color-5) border border-(--color-3) focus-within:border-(--color-2) rounded-sm duration-300 ease-in-out"
          >
            <Search size={15} color="#272727" className="shrink-0" />
            <input
              type="text"
              placeholder="Search City"
              value={citySearchInput}
              onChange={(e) => {
                setCitySearchInput(e.target.value);
                if (!isCitySearchOpen) setIsCitySearchOpen(true);
              }}
              onFocus={() => setIsCitySearchOpen(true)}
              className="p-1.5 w-full text-[13px] outline-none flex grow"
            />
            <button
              type="button"
              onClick={() => setIsCitySearchOpen(!isCitySearchOpen)}
              className="text-(--color-2) hover:text-(--color-1)"
            >
              <ChevronDown size={14} className={`transition-transform duration-200 ${isCitySearchOpen && 'rotate-180'}`} />
            </button>
          </form>
          {isCitySearchOpen && (
            <div className="absolute top-[calc(100%+8px)] left-0 w-90 bg-(--color-5) rounded-md border border-(--color-3) z-100 p-3 animate-[fadeIn_0.18s_ease_forwards]">
              <button
                type="button"
                onClick={() => {
                  detectUserLocation();
                  setIsCitySearchOpen(false);
                }}
                className="flex items-center justify-center gap-2 w-full px-3 py-2.5 bg-(--color-4) text-(--color-1) text-xs rounded-full mb-4 transition-all duration-150 ease-in-out hover:opacity-80 cursor-pointer"
              >
                <Crosshair size={15} color="#272727" className={isDetectingLocation ? 'animate-spin' : ''} />
                <span>{isDetectingLocation ? 'Detecting GPS location...' : 'Auto-Detect My Location'}</span>
              </button>

              <div className="text-xs mb-2">
                Cities ({filteredCities.length})
              </div>

              <div className="max-h-60 overflow-y-auto space-y-1">
                {filteredCities.length > 0 ? (
                  filteredCities.map((city) => {
                    const isSelected = activeCity?.id === city.id;
                    return (
                      <div
                        key={city.id}
                        onClick={() => handleSelectCityItem(city)}
                        className={`flex items-center justify-between px-3 py-2 rounded-md cursor-pointer transition-all duration-120 ease-in-out bg-(--color-4) ${
                          isSelected
                            ? ' border border-(--color-3)'
                            : 'border border-transparent hover:opacity-75'
                        }`}
                      >
                        <div>
                          <div className={`text-sm ${isSelected && 'text-(--color-6)'}`}>
                            {city.name}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {city.state} • {city.junctions.length} Active Nodes
                          </div>
                        </div>

                        {isSelected && <Check size={16} color="#1629d2" />}
                      </div>
                    );
                  })
                ) : (
                  <div className="p-3 text-center text-xs text-slate-500">
                    No matching cities found. Press Enter to search custom location.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <MapPin size={16} color="#0d0d0d" />
          <div className="flex items-center gap-2.5">
            <span className="text-xs">
              {activeCity?.name || 'No location'}
            </span>
            {userLocationDetected && (
              <span className="text-[10px] bg-(--color-3) text-(--color-2) px-2 pt-0.5 pb-px rounded-full">
                GPS
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2.5 shrink-0">
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-sm text-nowrap ${
            emergency.active ? 'bg-red-50' : 'bg-green-50'
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              emergency.active ? 'bg-red-600 animate-pulse-slow' : 'bg-green-600'
            }`}
          />
          <span
            className={`text-xs ${
              emergency.active ? 'text-red-800' : 'text-green-800'
            }`}
          >
            {emergency.active ? `Emergency (${emergency.countdownSeconds}s)` : 'Low Risk'}
          </span>
        </div>
        <Button
          variant="secondary"
          size="sm"
          icon={Radio}
          onClick={() => setIsLiveSimulating(!isLiveSimulating)}
          className="whitespace-nowrap px-3"
        >
          {isLiveSimulating ? 'Live Feeds' : 'Paused'}
        </Button>
      </div>
    </header>
  );
};

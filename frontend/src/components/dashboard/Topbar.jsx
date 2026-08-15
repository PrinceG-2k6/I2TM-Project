import React, { useState, useRef, useEffect } from 'react';
import { Radio, Search, MapPin, Crosshair, ChevronDown, Check, Sliders } from 'lucide-react';
import { useTraffic, INDIAN_CITIES } from '../../context/TrafficContext';
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
    <header
      style={{
        height: '70px',
        minHeight: '70px',
        maxHeight: '70px',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'nowrap',
        borderBottom: '1px solid #E2E8F0',
        backgroundColor: '#FFFFFF',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        boxSizing: 'border-box',
        width: '100%',
        overflow: 'visible'
      }}
    >
      {/* Left: Clean City Location Display + Search Bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexShrink: 0 }}>
        {/* City Location Display */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              backgroundColor: '#FFEBE8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <MapPin size={18} color="#FF5A43" />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '16px', fontWeight: '800', color: '#0F172A', letterSpacing: '-0.01em' }}>
              {activeCity?.name || 'Hyderabad'}
            </span>
            {userLocationDetected && (
              <span style={{ fontSize: '10px', fontWeight: '700', backgroundColor: '#F0FDF4', color: '#16A34A', border: '1px solid #BBF7D0', padding: '1px 6px', borderRadius: '4px' }}>
                GPS
              </span>
            )}
          </div>
        </div>

        {/* Search Bar & City Selector */}
        <div ref={dropdownRef} style={{ position: 'relative', width: '260px', flexShrink: 0 }}>
          <div
            onClick={() => setIsCitySearchOpen(!isCitySearchOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 14px',
              backgroundColor: '#F8FAFC',
              border: '1px solid #CBD5E1',
              borderRadius: '10px',
              cursor: 'pointer',
              boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
              transition: 'all 0.15s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
              <Search size={15} color="#FF5A43" />
              <span style={{ fontSize: '12px', fontWeight: '700', color: '#0F172A', whiteSpace: 'nowrap' }}>
                Search City...
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ fontSize: '10px', fontWeight: '800', backgroundColor: '#FFEBE8', color: '#FF5A43', padding: '2px 6px', borderRadius: '4px' }}>
                INDIA
              </span>
              <ChevronDown size={14} color="#64748B" />
            </div>
          </div>

          {/* Dropdown City Search Modal */}
          {isCitySearchOpen && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                left: 0,
                width: '400px',
                backgroundColor: '#FFFFFF',
                borderRadius: '12px',
                border: '1px solid #E2E8F0',
                boxShadow: '0 12px 36px rgba(15, 23, 42, 0.16)',
                zIndex: 1000,
                padding: '14px',
                animation: 'fadeIn 0.18s ease forwards'
              }}
            >
              {/* Search Input Box */}
              <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <input
                    type="text"
                    placeholder="Search any city in India (e.g. Mumbai, Bengaluru...)"
                    value={citySearchInput}
                    onChange={(e) => setCitySearchInput(e.target.value)}
                    autoFocus
                    style={{
                      width: '100%',
                      padding: '8px 12px 8px 32px',
                      fontSize: '12px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      outline: 'none',
                      backgroundColor: '#F8FAFC'
                    }}
                  />
                  <Search size={14} color="#64748B" style={{ position: 'absolute', left: '10px', top: '10px' }} />
                </div>
                <button
                  type="submit"
                  style={{
                    padding: '8px 14px',
                    backgroundColor: '#FF5A43',
                    color: '#FFFFFF',
                    fontSize: '12px',
                    fontWeight: '700',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    border: 'none',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {isSearchingCustom ? 'Searching...' : 'Search'}
                </button>
              </form>

              {/* Location Detector Button */}
              <button
                onClick={() => {
                  detectUserLocation();
                  setIsCitySearchOpen(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  width: '100%',
                  padding: '9px 12px',
                  backgroundColor: '#F0FDF4',
                  border: '1px solid #86EFAC',
                  color: '#166534',
                  fontSize: '12px',
                  fontWeight: '700',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  marginBottom: '12px',
                  transition: 'all 0.15s ease'
                }}
              >
                <Crosshair size={15} color="#16A34A" className={isDetectingLocation ? 'animate-spin' : ''} />
                <span>{isDetectingLocation ? 'Detecting GPS location...' : 'Auto-Detect My Location (GPS)'}</span>
              </button>

              <div style={{ fontSize: '11px', fontWeight: '800', color: '#64748B', uppercase: true, marginBottom: '8px', letterSpacing: '0.05em' }}>
                MAJOR INDIAN METROS & CITIES ({filteredCities.length})
              </div>

              {/* List of Pre-defined Cities */}
              <div style={{ maxHeight: '220px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {filteredCities.map((city) => {
                  const isSelected = activeCity?.id === city.id;
                  return (
                    <div
                      key={city.id}
                      onClick={() => handleSelectCityItem(city)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        backgroundColor: isSelected ? '#FFEBE8' : '#F8FAFC',
                        cursor: 'pointer',
                        border: isSelected ? '1px solid #FFC9C2' : '1px solid transparent',
                        transition: 'all 0.12s ease'
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: '700', color: isSelected ? '#FF5A43' : '#0F172A' }}>
                          {city.name}
                        </div>
                        <div style={{ fontSize: '11px', color: '#64748B' }}>
                          {city.state} • {city.junctions.length} Active Nodes
                        </div>
                      </div>

                      {isSelected && <Check size={16} color="#FF5A43" />}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Controls: Radar Status + Feeds + Filter Button */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
        {/* Radar Status Badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '5px 12px',
            borderRadius: '9999px',
            backgroundColor: emergency.active ? '#FEF2F2' : '#F0FDF4',
            border: emergency.active ? '1px solid #FCA5A5' : '1px solid #BBF7D0',
            whiteSpace: 'nowrap'
          }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: emergency.active ? '#DC2626' : '#16A34A'
            }}
            className={emergency.active ? 'animate-pulse-slow' : ''}
          />
          <span
            style={{
              fontSize: '11px',
              fontWeight: '800',
              color: emergency.active ? '#991B1B' : '#166534',
              letterSpacing: '0.02em'
            }}
          >
            {emergency.active ? `EMERGENCY (${emergency.countdownSeconds}s)` : 'RADAR: LOW RISK'}
          </span>
        </div>

        {/* Live Simulation Engine Toggle */}
        <Button
          variant="secondary"
          size="sm"
          icon={Radio}
          onClick={() => setIsLiveSimulating(!isLiveSimulating)}
          style={{
            color: isLiveSimulating ? '#16A34A' : '#64748B',
            whiteSpace: 'nowrap',
            padding: '6px 12px'
          }}
        >
          {isLiveSimulating ? 'Live Feeds' : 'Paused'}
        </Button>
      </div>
    </header>
  );
};

import React, { useState, useRef, useEffect } from 'react';
import { Radio, Search, MapPin, Crosshair, ChevronDown, Check } from 'lucide-react';
import { useTraffic } from '../../context/TrafficContext';
import { INDIAN_CITIES } from '../../data/dummyData';
import { getEmergencyFromCorridors } from '../../utils/trafficUtils';
import { Button } from '../common/Button';

export const Topbar = ({
  activeTab = 'dashboard',
  activeSubsection = null,
  hasMultipleSubsections = false,
  onToggleFilters
}) => {
  const {
    activeCity,
    activeCorridors,
    isLiveSimulating,
    setIsLiveSimulating
  } = useTraffic();

  const emergency = getEmergencyFromCorridors(activeCorridors);



  return (
    <header className="bg-(--color-4) w-full h-fit px-3 py-2 flex items-center justify-between sticky top-0 z-10">
      <div className="flex items-center gap-4">
        {/* Active City Display */}
        <div className="flex items-center gap-2">
          <MapPin size={16} color="#0d0d0d" />
          <div className="flex items-center gap-2.5">
            <span className="text-sm font-semibold">{activeCity?.name || 'Nagpur'}</span>
          </div>
        </div>
      </div>

      {/* Right: Emergency status + Live toggle */}
      <div className="flex items-center gap-2.5 shrink-0">
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-sm text-nowrap ${emergency.active ? 'bg-red-50' : 'bg-green-50'}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${emergency.active ? 'bg-red-600 animate-pulse-slow' : 'bg-green-600'}`} />
          <span className={`text-xs ${emergency.active ? 'text-red-800' : 'text-green-800'}`}>
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

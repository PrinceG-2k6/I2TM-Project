import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertOctagon, Siren } from 'lucide-react';
import { useTraffic } from '../../context/TrafficContext';
import { getEmergencyFromCorridors } from '../../utils/trafficUtils';

export const AccidentHazardBanner = ({ onNavigateGuards }) => {
  const navigate = useNavigate();
  const { activeCorridors } = useTraffic();
  const emergency = getEmergencyFromCorridors(activeCorridors);

  const handleInspectGuards = () => {
    if (onNavigateGuards) {
      onNavigateGuards();
    } else {
      navigate('/dashboard/guards');
    }
  };

  return (
    <div className="overflow-hidden rounded-sm px-4 py-3 text-(--color-5) flex items-center justify-between flex-wrap gap-4 bg-[#7F1D1D]">
      <div className="flex items-center gap-3.5 flex-[1_1_500px]">
        {emergency.active ? <Siren size={24} color="#FFFFFF" /> : <AlertOctagon size={24} color="#FFFFFF" />}
        <div>
          <div className="flex items-center gap-2.5 mb-0.5">
            <span className="text-red-600">
              {emergency.active ? 'Green Corridor Active' : 'Accident Risk Interception'}
            </span>
          </div>
          <div className="text-sm">
            {emergency.active
              ? `${emergency.vehicleLabel || 'Emergency Vehicle'} ${emergency.vehicleId || ''} en route to ${emergency.destination || emergency.hospital || ''}.`
              : ''}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3 flex-wrap">
        <button
          onClick={handleInspectGuards}
          className="flex items-center gap-2 py-1.5 px-3 bg-red-200 text-red-800 text-sm rounded-sm cursor-pointer duration-300 ease-in-out"
        >
          <span>View Details</span>
        </button>
      </div>
    </div>
  );
};

export default AccidentHazardBanner;

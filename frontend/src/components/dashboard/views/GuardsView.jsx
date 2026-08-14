import React from 'react';
import { GreenCorridorPanel } from '../GreenCorridorPanel';
import { RoadsideDisplayBoard } from '../RoadsideDisplayBoard';
import { RiskPatternModule } from '../RiskPatternModule';

export const GuardsView = () => {
  return (
    <div className="view-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* 1. Emergency Triage & Green Corridor Panel */}
      <div data-subsection="Emergency Corridor Triage">
        <GreenCorridorPanel />
      </div>

      {/* 2. Roadside LED Billboard Simulator */}
      <div data-subsection="Roadside LED Display Board">
        <RoadsideDisplayBoard />
      </div>

      {/* 3. Lane Cut & Swerve Trajectory Analysis */}
      <div data-subsection="Lane Cut & Swerve Guard">
        <RiskPatternModule />
      </div>
    </div>
  );
};

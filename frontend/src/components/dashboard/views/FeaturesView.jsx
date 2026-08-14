import React, { useState } from 'react';
import { FeaturesHealthBar } from '../FeaturesHealthBar';
import { ToggleLeft, ToggleRight, Flag } from 'lucide-react';
import { Badge } from '../../common/Badge';

export const FeaturesView = () => {
  const [featureToggles, setFeatureToggles] = useState({
    density: true,
    cutMaarna: true,
    greenCorridor: true,
    ledDisplay: true,
    laneCorrection: false,
    speedWatcher: true
  });

  const toggleFeature = (key) => {
    setFeatureToggles((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const detailedFeatures = [
    {
      key: 'greenCorridor',
      name: 'Emergency Green Corridor Dispatch',
      description: 'Auto-preclears approaching junctions based on patient severity triage score.',
      priority: 100,
      status: 'Healthy',
      variant: 'healthy',
      warnings: 0
    },
    {
      key: 'density',
      name: 'Vision-Based 4-Way Traffic Density Allocator',
      description: 'Calculates vehicle density on North, South, East, and West to dynamically balance green times.',
      priority: 100,
      status: 'Healthy',
      variant: 'healthy',
      warnings: 2
    },
    {
      key: 'cutMaarna',
      name: 'Lane Cut & Swerve AI Guard',
      description: 'Analyzes angular deflection and sudden swerving across lanes near signal zones.',
      priority: 95,
      status: 'Overloaded',
      variant: 'overloaded',
      warnings: 4
    },
    {
      key: 'ledDisplay',
      name: 'Roadside LED Countdown Broadcaster (VMS)',
      description: 'Transmits definite countdown wait times to roadside display boards for driver compliance.',
      priority: 80,
      status: 'Degraded',
      variant: 'degraded',
      warnings: 1
    },
    {
      key: 'laneCorrection',
      name: 'Lane Boundary & Turning Obstruction Detector',
      description: 'Monitors vehicles parked or standing across zebra crossings and emergency corridors.',
      priority: 70,
      status: 'Disabled',
      variant: 'disabled',
      warnings: 0
    }
  ];

  return (
    <div className="view-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* 1. Main Features 18 Health Bar */}
      <div data-subsection="Features Health Metrics">
        <FeaturesHealthBar />
      </div>

      {/* 2. Interactive Toggle Management Grid */}
      <div
        data-subsection="Module Toggles & Flags"
        style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-warm)',
          borderRadius: 'var(--radius-lg)',
          padding: '24px',
          boxShadow: 'var(--shadow-card)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-main)' }}>
            Feature Toggles & Priority Controls
          </h3>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Instant hot-reload configuration
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {detailedFeatures.map((f) => {
            const isEnabled = featureToggles[f.key] !== undefined ? featureToggles[f.key] : true;

            return (
              <div
                key={f.key}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px 20px',
                  backgroundColor: 'var(--bg-surface-warm)',
                  border: '1px solid var(--border-warm)',
                  borderRadius: 'var(--radius-md)'
                }}
              >
                <div style={{ maxWidth: '600px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-main)' }}>
                      {f.name}
                    </span>
                    <Badge variant={f.variant} size="sm">
                      {f.status}
                    </Badge>
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                    {f.description}
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', fontWeight: '700', color: 'var(--text-body)' }}>
                    <Flag size={14} color="var(--primary-orange)" />
                    <span>{f.priority}</span>
                  </div>

                  <button
                    onClick={() => toggleFeature(f.key)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      color: isEnabled ? 'var(--status-healthy)' : 'var(--text-muted)',
                      fontWeight: '700',
                      fontSize: '13px',
                      cursor: 'pointer'
                    }}
                  >
                    {isEnabled ? <ToggleRight size={28} color="var(--status-healthy)" /> : <ToggleLeft size={28} color="#94A3B8" />}
                    <span>{isEnabled ? 'Enabled' : 'Disabled'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

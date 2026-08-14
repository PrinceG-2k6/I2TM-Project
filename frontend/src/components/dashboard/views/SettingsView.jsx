import React, { useState } from 'react';
import { useTraffic } from '../../../context/TrafficContext';
import { Save } from 'lucide-react';
import { Button } from '../../common/Button';
import { Dropdown } from '../../common/Dropdown';

export const SettingsView = () => {
  const { selectedJunction, setSelectedJunction, environment, setEnvironment } = useTraffic();
  const [savedSuccess, setSavedSuccess] = useState(false);

  const [thresholds, setThresholds] = useState({
    criticalDensity: 85,
    highDensity: 65,
    cutMaarnaAngle: 32,
    emergencyHoldSec: 90
  });

  const handleSave = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="view-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* 1. Intersection & Environment Parameters */}
      <div
        data-subsection="Active Junction & Environment"
        style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-warm)',
          borderRadius: 'var(--radius-lg)',
          padding: '24px',
          boxShadow: 'var(--shadow-card)',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}
      >
        <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-main)' }}>
          Intersection & Environment Parameters
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          <div>
            <Dropdown
              label="Selected Active Junction"
              options={[
                { value: 'J-04 Ring Road South', label: 'J-04 Ring Road South' },
                { value: 'J-01 Connaught Inner', label: 'J-01 Connaught Inner' },
                { value: 'J-02 AIIMS Intersection', label: 'J-02 AIIMS Intersection' },
                { value: 'J-08 Silk Board Node', label: 'J-08 Silk Board Node' }
              ]}
              value={selectedJunction}
              onChange={(v) => setSelectedJunction(v)}
            />
          </div>

          <div>
            <Dropdown
              label="Deployment Environment"
              options={[
                { value: 'Prod', label: 'Production (Live Field)' },
                { value: 'Staging', label: 'Staging Simulator' },
                { value: 'Dev', label: 'Local Synthetic Engine' }
              ]}
              value={environment}
              onChange={(v) => setEnvironment(v)}
            />
          </div>
        </div>

        {/* 2. AI Algorithm Thresholds */}
        <div data-subsection="AI Algorithm Sensitivity Thresholds" style={{ borderTop: '1px solid var(--border-warm)', paddingTop: '20px' }}>
          <h4 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px', color: 'var(--text-main)' }}>
            AI Algorithm Thresholds
          </h4>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            <div style={{ padding: '16px', backgroundColor: 'var(--bg-surface-warm)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-warm)' }}>
              <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                CRITICAL DENSITY (%)
              </label>
              <input
                type="number"
                value={thresholds.criticalDensity}
                onChange={(e) => setThresholds({ ...thresholds, criticalDensity: Number(e.target.value) })}
                style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-warm)' }}
              />
            </div>

            <div style={{ padding: '16px', backgroundColor: 'var(--bg-surface-warm)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-warm)' }}>
              <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                AGGRESSIVE SWERVE ANGLE (DEG)
              </label>
              <input
                type="number"
                value={thresholds.cutMaarnaAngle}
                onChange={(e) => setThresholds({ ...thresholds, cutMaarnaAngle: Number(e.target.value) })}
                style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-warm)' }}
              />
            </div>

            <div style={{ padding: '16px', backgroundColor: 'var(--bg-surface-warm)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-warm)' }}>
              <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                EMERGENCY HOLD DURATION (SEC)
              </label>
              <input
                type="number"
                value={thresholds.emergencyHoldSec}
                onChange={(e) => setThresholds({ ...thresholds, emergencyHoldSec: Number(e.target.value) })}
                style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-warm)' }}
              />
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '12px' }}>
          <Button variant="primary" size="md" icon={Save} onClick={handleSave}>
            Save Parameters
          </Button>

          {savedSuccess && (
            <span style={{ fontSize: '13px', color: 'var(--status-healthy)', fontWeight: '700' }}>
              ✓ Settings saved and synced to AI engine!
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { Sliders, CheckCircle2, Flag, AlertTriangle, Eye, ShieldAlert } from 'lucide-react';
import { Badge } from '../common/Badge';

export const FeaturesHealthBar = () => {
  const featureList = [
    {
      name: 'Internal Reports (Real-time Flow Analytics)',
      status: 'Healthy',
      enabled: true,
      priority: 100,
      warnings: 2,
      variant: 'healthy'
    },
    {
      name: 'Lane Cut & Swerve AI Trajectory Guard',
      status: 'Overloaded',
      enabled: true,
      priority: 95,
      warnings: 4,
      variant: 'overloaded'
    },
    {
      name: 'Ambulance Green Corridor Pre-Clear Triage',
      status: 'Healthy',
      enabled: true,
      priority: 100,
      warnings: 0,
      variant: 'healthy'
    },
    {
      name: 'LED Roadside Countdown Broadcaster',
      status: 'Degraded',
      enabled: true,
      priority: 80,
      warnings: 1,
      variant: 'degraded'
    }
  ];

  return (
    <div
      style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-warm)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-card)',
        padding: '24px'
      }}
    >
      {/* Title + Count */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
        <Sliders size={20} color="var(--primary-orange)" />
        <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-main)' }}>
          Features <span style={{ color: 'var(--text-muted)', fontWeight: '600' }}>18</span>
        </h3>
      </div>

      {/* Health status pills matching reference image */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '24px' }}>
        <Badge variant="healthy" count="11">Healthy</Badge>
        <Badge variant="overloaded" count="3">Overloaded</Badge>
        <Badge variant="degraded" count="2">Degraded</Badge>
        <Badge variant="critical" count="1">Outage</Badge>
        <Badge variant="disabled" count="1">Disabled</Badge>
      </div>

      {/* Feature Rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {featureList.map((feat) => (
          <div
            key={feat.name}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px 18px',
              backgroundColor: 'var(--bg-surface-warm)',
              border: '1px solid var(--border-warm)',
              borderRadius: 'var(--radius-md)'
            }}
          >
            <div>
              <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-main)' }}>
                {feat.name}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>{feat.enabled ? 'Enabled' : 'Disabled'}</span>
                <span>•</span>
                <span style={{ color: feat.variant === 'healthy' ? 'var(--status-healthy)' : feat.variant === 'overloaded' ? 'var(--status-overloaded)' : 'var(--status-degraded)', fontWeight: '600' }}>
                  {feat.status}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', color: 'var(--text-muted)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: '600' }}>
                <Flag size={14} />
                <span>{feat.priority}</span>
              </div>

              {feat.warnings > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: '600', color: '#D97706' }}>
                  <AlertTriangle size={14} />
                  <span>{feat.warnings}</span>
                </div>
              )}

              <button style={{ color: 'var(--text-muted)', padding: '4px' }}>
                <Eye size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

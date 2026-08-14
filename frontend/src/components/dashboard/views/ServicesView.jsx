import React from 'react';
import { DensityModule } from '../DensityModule';
import { SignalControlPreview } from '../SignalControlPreview';
import { Cpu } from 'lucide-react';
import { Badge } from '../../common/Badge';

export const ServicesView = () => {
  const services = [
    {
      name: 'Vision Density Detector (OpenCV / YOLO)',
      status: 'Active',
      latency: '24ms',
      throughput: '30 FPS',
      uptime: '99.98%'
    },
    {
      name: 'Ambulance Triage Engine (FastAPI Microservice)',
      status: 'Active',
      latency: '12ms',
      throughput: '120 req/min',
      uptime: '100.0%'
    },
    {
      name: 'Dynamic Signal Optimizer (Phase Allocation Engine)',
      status: 'Active',
      latency: '8ms',
      throughput: '60 cycle calcs/min',
      uptime: '99.95%'
    },
    {
      name: 'VMS LED Roadside Broadcaster (WebSocket Hub)',
      status: 'Active',
      latency: '15ms',
      throughput: '1000ms heartbeat',
      uptime: '99.99%'
    }
  ];

  return (
    <div className="view-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* 1. Services Grid */}
      <div
        data-subsection="AI Microservices & Pipeline Telemetry"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '16px'
        }}
      >
        {services.map((s) => (
          <div
            key={s.name}
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-warm)',
              borderRadius: 'var(--radius-lg)',
              padding: '20px',
              boxShadow: 'var(--shadow-subtle)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Cpu size={18} color="var(--primary-orange)" />
                <span style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-main)' }}>
                  {s.name.split('(')[0]}
                </span>
              </div>
              <Badge variant="healthy" size="sm">
                {s.status}
              </Badge>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '12px', color: 'var(--text-muted)' }}>
              <div>Latency: <strong style={{ color: 'var(--text-main)' }}>{s.latency}</strong></div>
              <div>Throughput: <strong style={{ color: 'var(--text-main)' }}>{s.throughput}</strong></div>
              <div>Uptime: <strong style={{ color: 'var(--status-healthy)' }}>{s.uptime}</strong></div>
              <div>Mode: <strong style={{ color: 'var(--text-main)' }}>Real-time</strong></div>
            </div>
          </div>
        ))}
      </div>

      {/* 2. Traffic Density Gauges */}
      <div data-subsection="4-Approach Vehicle Density">
        <DensityModule />
      </div>

      {/* 3. Signal Controls */}
      <div data-subsection="Adaptive Phase Allocator">
        <SignalControlPreview />
      </div>
    </div>
  );
};

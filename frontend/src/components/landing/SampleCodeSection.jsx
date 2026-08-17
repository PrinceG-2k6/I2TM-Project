import React, { useEffect, useRef, useState } from 'react';
import { ArrowDown, ArrowRight, Video, MapPin, Cpu, Server, Activity } from 'lucide-react';

const useScrollReveal = (threshold = 0.15) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold]);
  return [ref, visible];
};

export const SampleCodeSection = () => {
  const [headerRef, headerVisible] = useScrollReveal();
  const [flowRef, flowVisible] = useScrollReveal(0.1);

  return (
    <section
      id="architecture"
      style={{
        padding: '100px 60px',
        maxWidth: '1040px',
        margin: '0 auto',
        textAlign: 'center',
      }}
    >
      {/* Header */}
      <div
        ref={headerRef}
        style={{
          marginBottom: '48px',
          opacity: headerVisible ? 1 : 0,
          transform: headerVisible ? 'translateY(0)' : 'translateY(30px)',
          transition: 'all 0.75s ease',
        }}
      >
        <span
          style={{
            fontSize: '10px',
            color: 'var(--color-6)',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            display: 'block',
            marginBottom: '14px',
          }}
        >
          Architecture & Integration
        </span>
        <h2
          style={{
            fontSize: 'clamp(28px, 3.5vw, 44px)',
            color: 'var(--color-4)',
            marginBottom: '14px',
          }}
        >
          System Data Flow
        </h2>
        <p
          style={{
            fontSize: '15px',
            color: 'var(--color-3)',
            maxWidth: '520px',
            margin: '0 auto',
            lineHeight: 1.65,
          }}
        >
          End-to-end architecture from edge processing at the junction level to global orchestration in the central command center.
        </p>
      </div>

      {/* Flowchart */}
      <div
        ref={flowRef}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          opacity: flowVisible ? 1 : 0,
          transform: flowVisible ? 'translateY(0)' : 'translateY(20px)',
          transition: 'all 0.85s ease 0.1s',
          fontFamily: 'monospace',
          color: 'var(--color-4)',
          maxWidth: '800px',
          margin: '0 auto',
          textAlign: 'left'
        }}
      >
        {/* Top Section: Edge Node */}
        <div style={{
          width: '100%',
          border: '1px dashed var(--color-3)',
          borderRadius: '4px',
          padding: '24px',
          backgroundColor: 'var(--color-2)',
          position: 'relative'
        }}>
          <div style={{ fontSize: '14px', color: 'var(--color-6)', marginBottom: '24px' }}>
            EDGE CAMERA NODE / SIMULATOR (Junction Level)
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '20px' }}>
            {/* Left side inputs */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Video size={18} color="var(--color-4)" />
                <span style={{ fontSize: '13px' }}>1. Capture Video Frame</span>
                <ArrowRight size={16} color="var(--color-3)" style={{ marginLeft: 'auto' }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <MapPin size={18} color="var(--color-4)" />
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '13px' }}>2. External GPS/Sensors</span>
                  <span style={{ fontSize: '11px', color: 'var(--color-3)' }}>(e.g., Ambulance Lat/Lng)</span>
                </div>
                <ArrowRight size={16} color="var(--color-3)" style={{ marginLeft: 'auto' }} />
              </div>
            </div>

            {/* Right side processing */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{
                border: '1px solid var(--color-6)',
                backgroundColor: 'var(--color-1)',
                padding: '10px 16px',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '13px',
                color: 'var(--color-6)'
              }}>
                <Cpu size={16} /> [ Local YOLO Processing ]
              </div>
              
              <div style={{ height: '24px', borderLeft: '1px solid var(--color-3)', margin: '8px 0' }} />
              
              <div style={{
                backgroundColor: 'var(--color-1)',
                border: '1px solid var(--color-3)',
                padding: '12px',
                borderRadius: '4px',
                width: '100%',
                fontSize: '12px',
                lineHeight: 1.6
              }}>
                <div style={{ color: 'var(--color-6)', marginBottom: '8px' }}>3. Extract Metrics:</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>• Vehicle Counts & Density</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>• Violations (Challans)</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>• Distance to GPS Ambulance</div>
              </div>
            </div>
          </div>
        </div>

        {/* Middle Connector */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '16px 0' }}>
          <div style={{ height: '30px', borderLeft: '1px dashed var(--color-6)' }} />
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '12px',
            color: 'var(--color-6)',
            backgroundColor: 'var(--color-1)',
            padding: '6px 16px',
            border: '1px solid var(--color-3)',
            borderRadius: '16px',
            marginTop: '-10px',
            zIndex: 1
          }}>
            <ArrowDown size={14} /> Lightweight JSON via WebSocket/MQTT
          </div>
          <div style={{ height: '30px', borderLeft: '1px dashed var(--color-6)', marginTop: '-10px' }} />
        </div>

        {/* Bottom Section: Server */}
        <div style={{
          width: '100%',
          border: '1px dashed var(--color-3)',
          borderRadius: '4px',
          padding: '24px',
          backgroundColor: 'var(--color-2)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: 'var(--color-6)', marginBottom: '16px' }}>
            <Server size={18} /> CENTRAL BACKEND SERVER (Orchestrator)
          </div>
          <ul style={{ fontSize: '13px', color: 'var(--color-3)', lineHeight: 1.8, margin: 0, paddingLeft: '20px' }}>
            <li>Receives JSON packets from all junction edge nodes</li>
            <li>Updates Global Traffic State (City Grid Heatmap)</li>
            <li>Pushes live alerts & streams to <strong>CONTROL PANEL DASHBOARD</strong></li>
          </ul>
        </div>
      </div>
    </section>
  );
};

export default SampleCodeSection;

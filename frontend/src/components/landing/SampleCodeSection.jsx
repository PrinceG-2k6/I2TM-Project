import React from 'react';

export const SampleCodeSection = () => {
  const codeSnippet = `// Adaptive Signal Intelligence - Emergency Corridor Dispatch
async function handleEmergencyTriage(ambulance) {
  const { patientSeverity, location, targetHospital } = ambulance;
  
  // 1. Predict multi-junction route congestion
  const route = await MLService.predictRouteCongestion(location, targetHospital);
  
  // 2. Evaluate triage priority (Critical -> RED, Serious -> YELLOW)
  const triage = await MLService.evaluateTriage({
    severity: patientSeverity,
    etaSeconds: route.estimatedSeconds
  });

  // 3. Trigger green corridor signal override & roadside LED countdown
  if (triage.corridorActive) {
    await SignalGrid.preClearJunctions(route.upcomingJunctions);
    await RoadsideDisplay.broadcast({
      message: "Ambulance approaching. Keep left lane clear.",
      countdownSeconds: triage.suggestedWaitTime
    });
  }

  return { status: "CORRIDOR_ACTIVE", eta: route.estimatedSeconds };
}`;

  return (
    <section id="architecture" style={{ padding: '60px 40px', maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
      <h2 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '24px', color: 'var(--text-main)' }}>
        Sample code & Integration
      </h2>

      <div
        style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid var(--border-warm)',
          borderRadius: 'var(--radius-lg)',
          padding: '28px',
          textAlign: 'left',
          boxShadow: 'var(--shadow-card)',
          overflowX: 'auto'
        }}
      >
        <pre
          style={{
            fontFamily: 'monospace',
            fontSize: '13px',
            lineHeight: 1.6,
            color: '#1E293B'
          }}
        >
          <code>{codeSnippet}</code>
        </pre>
      </div>
    </section>
  );
};

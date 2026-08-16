import React, { useEffect, useRef, useState } from 'react';

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
  const [codeRef, codeVisible] = useScrollReveal(0.1);
  const [copied, setCopied] = useState(false);

  const codeSnippet = `// Adaptive Signal Intelligence - Emergency Corridor Dispatch
async function handleEmergencyTriage(ambulance) {
  const { patientSeverity, location, targetHospital } = ambulance;
  
  // 1. Predict multi-junction route congestion
  const route = await MLService.predictRouteCongestion(
    location, targetHospital
  );
  
  // 2. Evaluate triage priority (Critical → RED, Serious → YELLOW)
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

  // Syntax highlighting helper
  const highlightCode = (code) => {
    return code
      .replace(/(\/\/[^\n]*)/g, '<span style="color:#6A9955">$1</span>')
      .replace(/\b(async|function|const|await|if|return)\b/g, '<span style="color:#569CD6">$1</span>')
      .replace(/("([^"]*)")/g, '<span style="color:#CE9178">$1</span>')
      .replace(/\b([A-Z][a-zA-Z]+)\./g, '<span style="color:#4EC9B0">$1</span>.')
      .replace(/\b(true|false|null)\b/g, '<span style="color:#569CD6">$1</span>');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(codeSnippet).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

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
          transition: 'all 0.75s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        <span
          style={{
            fontSize: '10px',
            fontWeight: '800',
            color: '#F97316',
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
            fontWeight: '900',
            color: '#FFFFFF',
            letterSpacing: '-0.03em',
            marginBottom: '14px',
            fontFamily: 'var(--font-heading)',
          }}
        >
          Sample Code & Integration
        </h2>
        <p
          style={{
            fontSize: '15px',
            color: 'rgba(148, 163, 184, 0.8)',
            maxWidth: '480px',
            margin: '0 auto',
            lineHeight: 1.65,
          }}
        >
          Clean, developer-friendly APIs. Integrate ASI modules into any traffic management system.
        </p>
      </div>

      {/* Code block */}
      <div
        ref={codeRef}
        style={{
          position: 'relative',
          backgroundColor: '#0d1117',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '16px',
          overflow: 'hidden',
          textAlign: 'left',
          boxShadow: '0 25px 80px rgba(0,0,0,0.6)',
          opacity: codeVisible ? 1 : 0,
          transform: codeVisible ? 'translateY(0) scale(1)' : 'translateY(40px) scale(0.98)',
          transition: 'all 0.85s cubic-bezier(0.16, 1, 0.3, 1) 0.1s',
        }}
      >
        {/* Editor chrome bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 18px',
            backgroundColor: '#161b22',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {['#FF5F57', '#FEBC2E', '#28C840'].map((c) => (
              <span
                key={c}
                style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: c, display: 'inline-block' }}
              />
            ))}
            <span
              style={{
                marginLeft: '10px',
                fontSize: '12px',
                color: 'rgba(255,255,255,0.3)',
                fontFamily: 'monospace',
              }}
            >
              emergencyTriage.js
            </span>
          </div>

          <button
            onClick={handleCopy}
            style={{
              fontSize: '11px',
              fontWeight: '600',
              color: copied ? '#4ADE80' : 'rgba(255,255,255,0.4)',
              background: 'none',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '6px',
              padding: '4px 12px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              letterSpacing: '0.04em',
            }}
            onMouseEnter={(e) => {
              if (!copied) e.currentTarget.style.color = 'rgba(255,255,255,0.7)';
            }}
            onMouseLeave={(e) => {
              if (!copied) e.currentTarget.style.color = 'rgba(255,255,255,0.4)';
            }}
          >
            {copied ? '✓ Copied!' : 'Copy'}
          </button>
        </div>

        {/* Code content */}
        <div style={{ padding: '24px 28px', overflowX: 'auto' }}>
          <pre
            style={{
              fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', Consolas, monospace",
              fontSize: '13px',
              lineHeight: 1.75,
              color: '#D4D4D4',
              margin: 0,
            }}
            dangerouslySetInnerHTML={{ __html: highlightCode(codeSnippet) }}
          />
        </div>

        {/* Bottom glow line */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '1px',
            background: 'linear-gradient(90deg, transparent, rgba(249, 115, 22, 0.4), transparent)',
          }}
        />
      </div>
    </section>
  );
};

export default SampleCodeSection;

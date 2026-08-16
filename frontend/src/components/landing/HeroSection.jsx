import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, Play, ChevronDown, Activity, Shield, Zap } from 'lucide-react';

export const HeroSection = ({ onOpenDashboard, onSimulateCorridor }) => {
  const videoRef = useRef(null);
  const sectionRef = useRef(null);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const animFrameRef = useRef(null);
  const lastScrollY = useRef(0);
  const videoDuration = useRef(0);

  useEffect(() => {
    // Trigger entrance animation
    const t = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;
    video.playsInline = true;
    video.preload = 'auto';

    const onLoaded = () => {
      videoDuration.current = video.duration;
      setVideoLoaded(true);
      // Pause - we control it via scroll
      video.pause();
    };

    video.addEventListener('loadedmetadata', onLoaded);
    video.addEventListener('canplay', onLoaded);
    video.load();

    return () => {
      video.removeEventListener('loadedmetadata', onLoaded);
      video.removeEventListener('canplay', onLoaded);
    };
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    const section = sectionRef.current;
    if (!video || !section || !videoLoaded) return;

    let ticking = false;

    const updateVideo = () => {
      const rect = section.getBoundingClientRect();
      const sectionHeight = section.offsetHeight;
      const windowH = window.innerHeight;

      // Progress: 0 when section top is at viewport bottom, 1 when section bottom is at viewport top
      const scrolled = -rect.top; // how many pixels we've scrolled past the section top
      const totalScrollable = sectionHeight - windowH;
      const rawProgress = Math.max(0, Math.min(1, scrolled / Math.max(1, totalScrollable)));

      if (videoDuration.current > 0) {
        const targetTime = rawProgress * videoDuration.current;
        // Smooth seek
        if (Math.abs(video.currentTime - targetTime) > 0.04) {
          video.currentTime = targetTime;
        }
      }
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        animFrameRef.current = requestAnimationFrame(updateVideo);
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    updateVideo(); // initial
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [videoLoaded]);

  const scrollToFeatures = () => {
    const el = document.getElementById('features');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      ref={sectionRef}
      style={{
        position: 'relative',
        width: '100%',
        minHeight: '200vh', // tall section for scroll scrubbing
        backgroundColor: '#0d0d0d',
      }}
    >
      {/* Sticky video container */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          height: '100vh',
          width: '100%',
          overflow: 'hidden',
          zIndex: 1,
        }}
      >
        {/* Background video */}
        <video
          ref={videoRef}
          muted
          playsInline
          preload="auto"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: videoLoaded ? 1 : 0,
            transition: 'opacity 0.8s ease',
          }}
        >
          <source src="/video.mp4" type="video/mp4" />
        </video>

        {/* Dark gradient overlays for readability */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, rgba(13,13,13,0.75) 0%, rgba(13,13,13,0.35) 50%, rgba(13,13,13,0.80) 100%)',
            zIndex: 2,
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(90deg, rgba(13,13,13,0.88) 0%, rgba(13,13,13,0.45) 55%, rgba(13,13,13,0.10) 100%)',
            zIndex: 2,
            pointerEvents: 'none',
          }}
        />

        {/* Noise/grain texture overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E")`,
            zIndex: 3,
            pointerEvents: 'none',
            opacity: 0.4,
          }}
        />

        {/* Content */}
        <div
          style={{
            position: 'relative',
            zIndex: 10,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '0 60px',
            maxWidth: '1280px',
            margin: '0 auto',
          }}
        >
          {/* Animated entrance */}
          <div
            style={{
              maxWidth: '700px',
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? 'translateY(0)' : 'translateY(40px)',
              transition: 'all 0.9s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            {/* Badge pill */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 16px 6px 10px',
                borderRadius: '9999px',
                backgroundColor: 'rgba(249, 115, 22, 0.12)',
                border: '1px solid rgba(249, 115, 22, 0.35)',
                backdropFilter: 'blur(10px)',
                marginBottom: '28px',
              }}
            >
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  backgroundColor: '#F97316',
                  boxShadow: '0 0 8px rgba(249, 115, 22, 0.8)',
                  display: 'inline-block',
                  animation: 'pulseSlow 2s ease-in-out infinite',
                }}
              />
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: '700',
                  color: '#FDBA74',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                }}
              >
                🇮🇳 Govt. Smart City Initiative · Zero-Accident Vision Command
              </span>
            </div>

            {/* Main headline */}
            <h1
              style={{
                fontSize: 'clamp(44px, 6vw, 76px)',
                fontWeight: '900',
                lineHeight: 1.04,
                letterSpacing: '-0.04em',
                color: '#FFFFFF',
                marginBottom: '8px',
                fontFamily: 'var(--font-heading)',
                textShadow: '0 4px 40px rgba(0,0,0,0.5)',
              }}
            >
              SARATHI
            </h1>
            <h2
              style={{
                fontSize: 'clamp(18px, 2.8vw, 30px)',
                fontWeight: '700',
                background: 'linear-gradient(90deg, #F97316 0%, #FBBF24 50%, #FDE68A 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                marginBottom: '24px',
                letterSpacing: '-0.02em',
                lineHeight: 1.3,
                opacity: isVisible ? 1 : 0,
                transition: 'opacity 1.1s cubic-bezier(0.16, 1, 0.3, 1) 0.15s',
              }}
            >
              Real-Time Accident Prevention &amp; Emergency Corridor Intelligence
            </h2>

            {/* Subtitle */}
            <p
              style={{
                fontSize: '16px',
                color: 'rgba(226, 232, 240, 0.85)',
                lineHeight: 1.7,
                marginBottom: '40px',
                maxWidth: '560px',
                opacity: isVisible ? 1 : 0,
                transition: 'opacity 1.1s cubic-bezier(0.16, 1, 0.3, 1) 0.25s',
              }}
            >
              Engineered for national traffic safety — eliminating intersection collisions,
              intercepting risky swerving trajectories, dynamically clearing ambulance corridors,
              and guiding driver compliance in real time.
            </p>

            {/* Action buttons */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                flexWrap: 'wrap',
                marginBottom: '48px',
                opacity: isVisible ? 1 : 0,
                transition: 'opacity 1.1s cubic-bezier(0.16, 1, 0.3, 1) 0.35s',
              }}
            >
              <button
                onClick={() => onOpenDashboard && onOpenDashboard('dashboard')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '14px 26px',
                  fontSize: '15px',
                  fontWeight: '700',
                  color: '#FFFFFF',
                  background: 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)',
                  border: 'none',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  boxShadow: '0 8px 30px rgba(249, 115, 22, 0.45)',
                  transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                  letterSpacing: '0.01em',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
                  e.currentTarget.style.boxShadow = '0 14px 40px rgba(249, 115, 22, 0.6)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.boxShadow = '0 8px 30px rgba(249, 115, 22, 0.45)';
                }}
              >
                Open Safety Dashboard
                <ArrowRight size={16} />
              </button>

              <button
                onClick={onSimulateCorridor || (() => onOpenDashboard && onOpenDashboard('green-corridors'))}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '13px 24px',
                  fontSize: '15px',
                  fontWeight: '600',
                  color: '#FFFFFF',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  backdropFilter: 'blur(12px)',
                  transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.background = 'rgba(255,255,255,0.14)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.35)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
                }}
              >
                <Play size={15} fill="currentColor" />
                Simulate Green Corridor
              </button>
            </div>

            {/* Quick metrics */}
            <div
              style={{
                display: 'flex',
                gap: '12px',
                flexWrap: 'wrap',
                opacity: isVisible ? 1 : 0,
                transition: 'opacity 1.1s cubic-bezier(0.16, 1, 0.3, 1) 0.45s',
              }}
            >
              {[
                { icon: Shield, label: 'COLLISION PREVENTION', value: '-42% Signal Crashes', color: '#F87171', bg: 'rgba(239, 68, 68, 0.1)', border: 'rgba(248, 113, 113, 0.25)' },
                { icon: Activity, label: 'AMBULANCE TRIAGE', value: '90s Pre-Clear', color: '#4ADE80', bg: 'rgba(74, 222, 128, 0.08)', border: 'rgba(74, 222, 128, 0.2)' },
                { icon: Zap, label: 'RISK INTERCEPTION', value: 'Vision AI · Live', color: '#FDE047', bg: 'rgba(253, 224, 71, 0.08)', border: 'rgba(253, 224, 71, 0.2)' },
              ].map((m) => {
                const Icon = m.icon;
                return (
                  <div
                    key={m.label}
                    style={{
                      padding: '10px 16px',
                      backgroundColor: m.bg,
                      borderRadius: '10px',
                      border: `1px solid ${m.border}`,
                      backdropFilter: 'blur(10px)',
                      transition: 'transform 0.2s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
                    onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
                      <Icon size={11} color={m.color} />
                      <div style={{ fontSize: '10px', color: m.color, fontWeight: '700', letterSpacing: '0.08em' }}>
                        {m.label}
                      </div>
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: '800', color: m.color }}>{m.value}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Scroll prompt */}
        <button
          onClick={scrollToFeatures}
          style={{
            position: 'absolute',
            bottom: '32px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 10,
            background: 'none',
            border: 'none',
            color: 'rgba(255,255,255,0.45)',
            fontSize: '11px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '6px',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            transition: 'color 0.2s ease',
            opacity: isVisible ? 1 : 0,
            animation: isVisible ? 'scrollBounce 2.5s ease-in-out infinite 1.5s' : 'none',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#F97316')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.45)')}
        >
          Scroll to explore
          <ChevronDown size={18} style={{ animation: 'scrollBounce 2s ease-in-out infinite' }} />
        </button>

        {/* Video scrub hint */}
        {videoLoaded && (
          <div
            style={{
              position: 'absolute',
              bottom: '32px',
              right: '32px',
              zIndex: 10,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 12px',
              borderRadius: '9999px',
              backgroundColor: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              backdropFilter: 'blur(12px)',
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#F97316', display: 'inline-block', animation: 'pulseSlow 2s ease-in-out infinite' }} />
            <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', fontWeight: '600', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Scroll to play
            </span>
          </div>
        )}
      </div>

      <style>{`
        @keyframes scrollBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(6px); }
        }
      `}</style>
    </section>
  );
};

export default HeroSection;

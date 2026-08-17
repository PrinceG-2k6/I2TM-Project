import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTraffic } from '../context/TrafficContext';
import { Navbar } from '../components/landing/Navbar';
import { HeroSection } from '../components/landing/HeroSection';
import { FeaturePillars } from '../components/landing/FeaturePillars';
import { SampleCodeSection } from '../components/landing/SampleCodeSection';
import { WhyChooseUs } from '../components/landing/WhyChooseUs';
import { Footer } from '../components/landing/Footer';

export const LandingPage = () => {
  const navigate = useNavigate();
  const { triggerEmergencyCorridor } = useTraffic();
  const [videoLoaded, setVideoLoaded] = useState(false);

  const handleOpenDashboard = (tab = 'dashboard') => {
    const targetPath = tab === 'dashboard' ? '/dashboard' : `/dashboard/${tab}`;
    navigate(targetPath);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSimulateGreenCorridor = () => {
    triggerEmergencyCorridor('CRITICAL');
    navigate('/dashboard/green-corridors');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div
      key="landing-page"
      className="view-fade-in"
      style={{
        backgroundColor: 'var(--color-1)',
        minHeight: '100vh',
        color: 'var(--color-4)',
        fontFamily: 'var(--font-body)',
        position: 'relative',
      }}
    >
      {/* Fixed Background Video */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100vh',
          zIndex: 0,
          pointerEvents: 'none',
        }}
      >
        <video
          autoPlay
          muted
          loop
          playsInline
          onCanPlay={() => setVideoLoaded(true)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: videoLoaded ? 1 : 0,
            transition: 'opacity 0.8s ease',
          }}
        >
          <source src="/video.mp4" type="video/mp4" />
        </video>
        
        {/* Dark gradient overlay so text remains readable */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, rgba(13,13,13,0.85) 0%, rgba(13,13,13,0.7) 50%, rgba(13,13,13,0.95) 100%)',
          }}
        />
      </div>

      {/* Content wrapper */}
      <div style={{ position: 'relative', zIndex: 10 }}>
        <Navbar onOpenDashboard={handleOpenDashboard} />
        <HeroSection
          onOpenDashboard={handleOpenDashboard}
          onSimulateCorridor={handleSimulateGreenCorridor}
        />
        <div style={{ backgroundColor: 'var(--color-1)' }}>
          <FeaturePillars onOpenDashboard={handleOpenDashboard} />
        </div>
        <div style={{ backgroundColor: 'var(--color-1)' }}>
          <SampleCodeSection />
        </div>
        <div style={{ backgroundColor: 'var(--color-1)' }}>
          <WhyChooseUs />
        </div>
        <Footer onOpenDashboard={handleOpenDashboard} />
      </div>
    </div>
  );
};

export default LandingPage;

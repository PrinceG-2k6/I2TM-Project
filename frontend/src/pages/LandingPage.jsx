import React from 'react';
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
        backgroundColor: '#0d0d0d',
        minHeight: '100vh',
        color: '#FFFFFF',
        fontFamily: 'var(--font-body)',
      }}
    >
      <Navbar onOpenDashboard={handleOpenDashboard} />
      <HeroSection
        onOpenDashboard={handleOpenDashboard}
        onSimulateCorridor={handleSimulateGreenCorridor}
      />
      {/* Features section wrapper with dark bg */}
      <div style={{ backgroundColor: '#0d0d0d' }}>
        <FeaturePillars onOpenDashboard={handleOpenDashboard} />
      </div>
      <div style={{ backgroundColor: '#0a0a0a' }}>
        <SampleCodeSection />
      </div>
      <WhyChooseUs />
      <Footer onOpenDashboard={handleOpenDashboard} />
    </div>
  );
};

export default LandingPage;

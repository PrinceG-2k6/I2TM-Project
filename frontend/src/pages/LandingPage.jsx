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
    navigate('/dashboard/guards');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div key="landing-page" className="view-fade-in">
      <Navbar onOpenDashboard={handleOpenDashboard} />
      <HeroSection
        onOpenDashboard={handleOpenDashboard}
        onSimulateCorridor={handleSimulateGreenCorridor}
      />
      <FeaturePillars onOpenDashboard={handleOpenDashboard} />
      <SampleCodeSection />
      <WhyChooseUs />
      <Footer onOpenDashboard={handleOpenDashboard} />
    </div>
  );
};

export default LandingPage;

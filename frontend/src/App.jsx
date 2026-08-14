import React, { useState } from 'react';
import { TrafficProvider, useTraffic } from './context/TrafficContext';
import { Navbar } from './components/landing/Navbar';
import { HeroSection } from './components/landing/HeroSection';
import { FeaturePillars } from './components/landing/FeaturePillars';
import { SampleCodeSection } from './components/landing/SampleCodeSection';
import { WhyChooseUs } from './components/landing/WhyChooseUs';
import { Footer } from './components/landing/Footer';
import { DashboardLayout } from './components/dashboard/DashboardLayout';

function MainShell() {
  const [currentView, setCurrentView] = useState('landing'); // 'landing' | 'dashboard'
  const [dashboardTab, setDashboardTab] = useState('dashboard');
  const { triggerEmergencyCorridor } = useTraffic();

  const handleOpenDashboard = (tab = 'dashboard') => {
    setDashboardTab(tab);
    setCurrentView('dashboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSimulateGreenCorridor = () => {
    triggerEmergencyCorridor('CRITICAL');
    setDashboardTab('guards');
    setCurrentView('dashboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToLanding = () => {
    setCurrentView('landing');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="bg-warm-pattern" style={{ minHeight: '100vh', transition: 'all 0.3s ease' }}>
      {currentView === 'landing' ? (
        <div key="landing-view" className="view-fade-in">
          <Navbar onOpenDashboard={() => handleOpenDashboard('dashboard')} />
          <HeroSection
            onOpenDashboard={handleOpenDashboard}
            onSimulateCorridor={handleSimulateGreenCorridor}
          />
          <FeaturePillars onOpenDashboard={handleOpenDashboard} />
          <SampleCodeSection />
          <WhyChooseUs />
          <Footer onOpenDashboard={() => handleOpenDashboard('dashboard')} />
        </div>
      ) : (
        <div key="dashboard-view" className="view-fade-in">
          <DashboardLayout
            initialTab={dashboardTab}
            onNavigateLanding={handleBackToLanding}
          />
        </div>
      )}
    </div>
  );
}

export function App() {
  return (
    <TrafficProvider>
      <MainShell />
    </TrafficProvider>
  );
}

export default App;

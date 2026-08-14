import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

// Section Views
import { OverviewView } from './views/OverviewView';
import { JunctionsView } from './views/JunctionsView';
import { FYIsView } from './views/FYIsView';
import { CamerasSignalsView } from './views/CamerasSignalsView';
import { FeaturesView } from './views/FeaturesView';
import { GuardsView } from './views/GuardsView';
import { ServicesView } from './views/ServicesView';
import { TimelineView } from './views/TimelineView';
import { SettingsView } from './views/SettingsView';

const VALID_TABS = ['dashboard', 'junctions', 'cameras', 'fyis', 'features', 'guards', 'services', 'timeline', 'settings'];

export const DashboardLayout = () => {
  const { tab } = useParams();
  const navigate = useNavigate();

  // Active tab derived from URL param (defaults to 'dashboard' if absent or invalid)
  const activeTab = tab && VALID_TABS.includes(tab) ? tab : 'dashboard';

  const [activeSubsection, setActiveSubsection] = useState(null);
  const [hasMultipleSubsections, setHasMultipleSubsections] = useState(false);
  const scrollContainerRef = useRef(null);

  // When tab changes via URL navigation
  useEffect(() => {
    setActiveSubsection(null);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(() => {
        if (scrollContainerRef.current) {
          const subElements = scrollContainerRef.current.querySelectorAll('[data-subsection]');
          setHasMultipleSubsections(subElements.length > 1);
        }
      }, 50);
    }
  }, [activeTab]);

  // Tab navigation handler
  const handleSelectTab = (tabId) => {
    const targetPath = tabId === 'dashboard' ? '/dashboard' : `/dashboard/${tabId}`;
    navigate(targetPath);
  };

  // Back to Landing page handler
  const handleNavigateLanding = () => {
    navigate('/');
  };

  // Dynamic Subsection Scroll Spy
  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    const scrollTop = container.scrollTop;

    const subElements = container.querySelectorAll('[data-subsection]');
    if (subElements.length <= 1) {
      setActiveSubsection(null);
      return;
    }

    if (scrollTop < 30) {
      setActiveSubsection(null);
      return;
    }

    let currentSub = null;
    subElements.forEach((el) => {
      const rect = el.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      if (rect.top <= containerRect.top + 160 && rect.bottom > containerRect.top + 60) {
        currentSub = el.getAttribute('data-subsection');
      }
    });

    if (currentSub) {
      setActiveSubsection(currentSub);
    }
  };

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <OverviewView onNavigateTab={(t) => handleSelectTab(t)} />;
      case 'junctions':
        return <JunctionsView onNavigateTab={(t) => handleSelectTab(t)} />;
      case 'cameras':
        return <CamerasSignalsView />;
      case 'fyis':
        return <FYIsView />;
      case 'features':
        return <FeaturesView />;
      case 'guards':
        return <GuardsView />;
      case 'services':
        return <ServicesView />;
      case 'timeline':
        return <TimelineView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <OverviewView onNavigateTab={(t) => handleSelectTab(t)} />;
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        backgroundColor: '#F8FAFC'
      }}
    >
      {/* 1. Left Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        onNavigateLanding={handleNavigateLanding}
      />

      {/* 2. Main Content Canvas with Scroll Spy */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          height: '100%',
          overflowY: 'auto',
          backgroundColor: '#F8FAFC'
        }}
      >
        <Topbar
          activeTab={activeTab}
          activeSubsection={activeSubsection}
          hasMultipleSubsections={hasMultipleSubsections}
        />

        <main style={{ width: '100%', maxWidth: '1520px', margin: '0 auto', padding: '24px 32px 60px' }}>
          {renderActiveView()}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;

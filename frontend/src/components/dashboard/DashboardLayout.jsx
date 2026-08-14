import React, { useState, useEffect, useRef } from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { FilterDrawer } from './FilterDrawer';

// Section Views
import { OverviewView } from './views/OverviewView';
import { FYIsView } from './views/FYIsView';
import { MapView } from './views/MapView';
import { FeaturesView } from './views/FeaturesView';
import { GuardsView } from './views/GuardsView';
import { ServicesView } from './views/ServicesView';
import { TimelineView } from './views/TimelineView';
import { SettingsView } from './views/SettingsView';

export const DashboardLayout = ({ initialTab = 'dashboard', onNavigateLanding }) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [activeSubsection, setActiveSubsection] = useState(null);
  const [hasMultipleSubsections, setHasMultipleSubsections] = useState(false);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
      setActiveSubsection(null);
    }
  }, [initialTab]);

  // Check subsections count when tab changes
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

    // If at the very top, clear subsection
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
        return <OverviewView onNavigateTab={(tab) => setActiveTab(tab)} />;
      case 'fyis':
        return <FYIsView />;
      case 'map':
        return <MapView />;
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
        return <OverviewView onNavigateTab={(tab) => setActiveTab(tab)} />;
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-warm)' }}>
      {/* 1. Left Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={(tabId) => setActiveTab(tabId)}
        onNavigateLanding={onNavigateLanding}
      />

      {/* 2. Main Content Canvas with Scroll Spy */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, height: '100vh', overflowY: 'auto' }}
      >
        <Topbar
          activeTab={activeTab}
          activeSubsection={activeSubsection}
          hasMultipleSubsections={hasMultipleSubsections}
          onToggleFilters={() => setIsFilterDrawerOpen(!isFilterDrawerOpen)}
        />

        <main style={{ padding: '24px 28px 60px', maxWidth: '1400px', width: '100%', margin: '0 auto' }}>
          {renderActiveView()}
        </main>
      </div>

      {/* 3. Right Filter Drawer */}
      <FilterDrawer
        isOpen={isFilterDrawerOpen}
        onClose={() => setIsFilterDrawerOpen(false)}
      />
    </div>
  );
};

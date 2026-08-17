import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import Infobar from './Infobar';
import { AdminDebugPanel } from './AdminDebugPanel';
// Section Views
import { OverviewView } from './views/OverviewView';
import { JunctionsView } from './views/JunctionsView';
import { IncidentsView } from './views/IncidentsView';
import { CamerasSignalsView } from './views/CamerasSignalsView';
import { GreenCorridorsView } from './views/GreenCorridorsView';
import { AiInsightsView } from './views/AiInsightsView';

const VALID_TABS = ['dashboard', 'junctions', 'cameras', 'incidents', 'green-corridors', 'ai-insights'];

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
        return <OverviewView />;
      case 'junctions':
        return <JunctionsView onNavigateTab={(t) => handleSelectTab(t)} />;
      case 'cameras':
        return <CamerasSignalsView />;
      case 'incidents':
        return <IncidentsView />;
      case 'green-corridors':
        return <GreenCorridorsView />;
      case 'ai-insights':
        return <AiInsightsView />;
      default:
        return <OverviewView />;
    }
  };

  return (
    <div className='bg-(--color-1)'>
      <Infobar />
      <div className="flex w-full h-[calc(100vh-28px)] overflow-hidden">
        <Sidebar
          activeTab={activeTab}
          onSelectTab={handleSelectTab}
          onNavigateLanding={handleNavigateLanding}
        />
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex-1 flex flex-col h-full overflow-y-auto bg-(--color-5) text-(--color-1) rounded-tl-sm"
        >
          <Topbar
            activeTab={activeTab}
            activeSubsection={activeSubsection}
            hasMultipleSubsections={hasMultipleSubsections}
          />
          <main className="w-full mx-auto p-6">
            {renderActiveView()}
          </main>
        </div>
      </div>
      <AdminDebugPanel />
    </div>
  );
};

export default DashboardLayout;

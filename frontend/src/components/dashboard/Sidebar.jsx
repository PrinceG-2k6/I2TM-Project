import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GitFork, LayoutDashboard, Camera, Clock, ArrowLeft, ChevronUp, Radio, Siren } from 'lucide-react';
import { BrandLogo } from '../common/Icons';
import { useTraffic } from '../../context/TrafficContext';

export const Sidebar = ({ activeTab = 'dashboard', onSelectTab, onNavigateLanding }) => {
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { activeCorridors } = useTraffic();

  const handleSelectTab = (tabId) => {
    if (onSelectTab) {
      onSelectTab(tabId);
    } else {
      navigate(tabId === 'dashboard' ? '/dashboard' : `/dashboard/${tabId}`);
    }
  };

  const handleLanding = () => {
    if (onNavigateLanding) {
      onNavigateLanding();
    } else {
      navigate('/');
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'junctions', label: 'Junctions', icon: GitFork },
    { id: 'cameras', label: 'Cameras & Signals', icon: Camera },
    { id: 'incidents', label: 'Live Feed', icon: Radio },
    { id: 'green-corridors', label: 'Green Corridors', icon: Siren }
  ];

  return (
    <aside className="pb-3 px-2.5 w-60 min-w-50 max-w-70 shrink-0 h-full bg-(--color-1) text-(--color-5)">
      <div
        onClick={handleLanding}
        className="flex items-center gap-2.5"
        title="Click to return to Landing Page"
      >
        <BrandLogo size={32} color="#FF5A43" />
        <div>
          <div>
            SARATHI
          </div>
          <div className="text-xs mt-1">
            सारथी · Traffic Intel
          </div>
        </div>
      </div>

      <hr className='w-full opacity-20 my-7' />

      <nav className="space-y-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => handleSelectTab(item.id)}
              className={`text-sm flex items-center gap-3 w-full px-3 py-2.5 duration-300 ease-in-out rounded-sm text-(--color-4) ${ activeTab === item.id ? 'bg-(--color-2)' : 'opacity-70' }`}
            >
              <Icon size={18} color='#f2efe9' />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;

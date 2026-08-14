import React from 'react';
import { X, Filter, RotateCcw, Check } from 'lucide-react';
import { useTraffic } from '../../context/TrafficContext';
import { Dropdown } from '../common/Dropdown';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';

export const FilterDrawer = ({ isOpen, onClose }) => {
  const {
    filters,
    setFilters,
    selectedJunction,
    setSelectedJunction,
    clearAllFilters,
    activeFilterCount
  } = useTraffic();

  if (!isOpen) return null;

  const junctionOptions = [
    { value: 'J-04 Ring Road South', label: 'J-04 Ring Road South (New Delhi)' },
    { value: 'J-01 Connaught Inner', label: 'J-01 Connaught Inner (Central Delhi)' },
    { value: 'J-02 AIIMS Intersection', label: 'J-02 AIIMS Intersection (Emergency Hub)' },
    { value: 'J-08 Silk Board Node', label: 'J-08 Silk Board Node (Bengaluru)' }
  ];

  const userOptions = [
    { value: 'All users', label: 'All users' },
    { value: 'Rob Ocel', label: 'Rob Ocel (Operator)' },
    { value: 'Toby', label: 'Toby (Vision ML)' },
    { value: 'System', label: 'System (AI Optimizer)' }
  ];

  const featureOptions = [
    { value: 'All features', label: 'All features' },
    { value: 'Internal Reports', label: 'Internal Reports' },
    { value: 'Lane Cut AI', label: 'Lane Cut Guard (Swerve AI)' },
    { value: 'Green Corridor Dispatch', label: 'Green Corridor Dispatch' },
    { value: 'Support tools UI', label: 'Support tools UI' }
  ];

  const serviceOptions = [
    { value: 'All service', label: 'All service' },
    { value: 'Vision Density Detector', label: 'Vision Density Detector' },
    { value: 'Emergency Triage Engine', label: 'Emergency Triage Engine' },
    { value: 'Dynamic Signal Optimizer', label: 'Dynamic Signal Optimizer' }
  ];

  const tagOptions = [
    { value: 'System', label: 'System' },
    { value: 'Feature', label: 'Feature' },
    { value: 'Emergency', label: 'Emergency' },
    { value: 'Ecommerce', label: 'Ecommerce' },
    { value: 'Admin Dashboard', label: 'Admin Dashboard' }
  ];

  return (
    <aside
      style={{
        width: '300px',
        backgroundColor: 'var(--bg-surface)',
        borderLeft: '1px solid var(--border-warm)',
        height: '100vh',
        padding: '24px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        overflowY: 'auto',
        position: 'sticky',
        top: 0,
        zIndex: 40,
        boxShadow: '-4px 0 20px rgba(78, 45, 20, 0.04)',
        flexShrink: 0
      }}
    >
      {/* Drawer Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-warm)', paddingBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Filter size={18} color="var(--primary-orange)" />
          <h2 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-main)' }}>
            Filters
          </h2>
          {activeFilterCount > 0 && (
            <Badge variant="orange" size="sm">
              {activeFilterCount} active
            </Badge>
          )}
        </div>

        <button
          onClick={onClose}
          style={{ padding: '6px', color: 'var(--text-muted)', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}
        >
          <X size={18} />
        </button>
      </div>

      {/* 1. Junction Node Selector (Saved Filters) */}
      <div>
        <Dropdown
          label="Active Junction (Saved filter)"
          options={junctionOptions}
          value={selectedJunction}
          onChange={(val) => setSelectedJunction(val)}
        />
      </div>

      {/* 2. User / Author Filter */}
      <div>
        <Dropdown
          label="Users (Author / Role)"
          options={userOptions}
          value={filters.userRole}
          onChange={(val) => setFilters({ ...filters, userRole: val })}
        />
      </div>

      {/* 3. Features Filter */}
      <div>
        <Dropdown
          label="Features"
          options={featureOptions}
          value={filters.featureStatus}
          onChange={(val) => setFilters({ ...filters, featureStatus: val })}
        />
      </div>

      {/* 4. Services Filter */}
      <div>
        <Dropdown
          label="AI Services"
          options={serviceOptions}
          value={filters.serviceStatus}
          onChange={(val) => setFilters({ ...filters, serviceStatus: val })}
        />
      </div>

      {/* 5. Multi-Select Tags */}
      <div>
        <Dropdown
          label="Filter by Tags"
          options={tagOptions}
          value={filters.tags}
          isMulti
          placeholder="Select tags to filter"
          onChange={(tagsList) => setFilters({ ...filters, tags: tagsList })}
        />
      </div>

      {/* Active Filter Summary Feedback */}
      {activeFilterCount > 0 && (
        <div style={{ padding: '12px', backgroundColor: 'var(--bg-surface-warm)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-warm)' }}>
          <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--primary-orange-dark)', marginBottom: '4px' }}>
            ACTIVE FILTER APPLIED
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-body)' }}>
            Alerts and feeds are dynamically filtered across the dashboard.
          </div>
        </div>
      )}

      {/* Reset Button */}
      <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--border-warm)' }}>
        <Button
          variant="secondary"
          size="sm"
          icon={RotateCcw}
          style={{ width: '100%' }}
          onClick={clearAllFilters}
        >
          Reset all filters
        </Button>
      </div>
    </aside>
  );
};

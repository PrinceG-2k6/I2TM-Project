import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { TrafficProvider } from './context/TrafficContext';
import { LandingPage } from './pages/LandingPage';
import { DashboardLayout } from './components/dashboard/DashboardLayout';

export function App() {
  return (
    <TrafficProvider>
      <BrowserRouter>
        <div className="bg-warm-pattern" style={{ minHeight: '100vh', transition: 'all 0.3s ease' }}>
          <Routes>
            {/* Landing Page */}
            <Route path="/" element={<LandingPage />} />

            {/* Main Dashboard & Dynamic Tab Routes */}
            <Route path="/dashboard" element={<DashboardLayout />} />
            <Route path="/dashboard/:tab" element={<DashboardLayout />} />

            {/* Direct Alias Routes */}
            <Route path="/junctions" element={<Navigate to="/dashboard/junctions" replace />} />
            <Route path="/fyis" element={<Navigate to="/dashboard/fyis" replace />} />
            <Route path="/map" element={<Navigate to="/dashboard/map" replace />} />
            <Route path="/features" element={<Navigate to="/dashboard/features" replace />} />
            <Route path="/services" element={<Navigate to="/dashboard/services" replace />} />
            <Route path="/guards" element={<Navigate to="/dashboard/guards" replace />} />
            <Route path="/timeline" element={<Navigate to="/dashboard/timeline" replace />} />
            <Route path="/settings" element={<Navigate to="/dashboard/settings" replace />} />

            {/* Catch-all Wildcard Route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </BrowserRouter>
    </TrafficProvider>
  );
}

export default App;

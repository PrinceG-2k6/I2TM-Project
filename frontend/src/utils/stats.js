export const generateOverviewStats = (approaches, emergency, alerts) => {
  const appArr = Object.values(approaches || {});
  const avgDensity = appArr.length
    ? Math.round(appArr.reduce((s, a) => s + (a.densityPct || 0), 0) / appArr.length)
    : 0;
  const networkRisk     = Math.min(100, Math.round(avgDensity * 0.68 + (emergency?.active ? 12 : 0)));
  const highRiskCount   = appArr.filter((a) => (a.densityPct || 0) >= 75).length;
  const activeIncidents = alerts?.length || 0;
  const emergencyUnits  = emergency?.active ? 3 : 0;
  const ambulancesEnRoute = emergency?.active ? 1 : 0;
  const coveragePct     = 0;

  return [
    {
      id: 'network-risk',
      label: 'Network Risk',
      value: networkRisk,
      max: 100,
      unit: '/100',
      sub: 'Weighted across active junctions',
      color:  networkRisk >= 70 ? '#DC2626' : networkRisk >= 50 ? '#F59E0B' : '#16A34A',
      bg:     networkRisk >= 70 ? '#FEF2F2' : networkRisk >= 50 ? '#FFFBEB' : '#F0FDF4',
      border: networkRisk >= 70 ? '#FCA5A5' : networkRisk >= 50 ? '#FCD34D' : '#86EFAC',
      isScore: true
    },
    {
      id: 'avg-congestion',
      label: 'Avg Congestion',
      value: avgDensity,
      max: 100,
      unit: '/100',
      sub: 'Across active approaches',
      color:  avgDensity >= 80 ? '#DC2626' : avgDensity >= 60 ? '#F59E0B' : '#16A34A',
      bg:     avgDensity >= 80 ? '#FEF2F2' : avgDensity >= 60 ? '#FFFBEB' : '#F0FDF4',
      border: avgDensity >= 80 ? '#FCA5A5' : avgDensity >= 60 ? '#FCD34D' : '#86EFAC',
      isScore: true
    },
    {
      id: 'high-risk-junctions',
      label: 'High-Risk Junctions',
      value: highRiskCount,
      unit: '',
      sub: 'Density ≥ 75% threshold',
      color: '#EA580C', bg: '#FFF7ED', border: '#FDBA74',
      isScore: false
    },
    {
      id: 'active-incidents',
      label: 'Active Incidents',
      value: activeIncidents,
      unit: '',
      sub: 'Open in alert stream',
      color: '#7C3AED', bg: '#F5F3FF', border: '#C4B5FD',
      isScore: false
    },
    {
      id: 'emergency-units',
      label: 'Emergency Units',
      value: emergencyUnits,
      unit: '',
      sub: emergency?.active ? 'Corridor active' : 'On standby',
      color: '#DC2626',
      bg:    emergency?.active ? '#FEF2F2' : '#F8FAFC',
      border: emergency?.active ? '#F87171' : '#E2E8F0',
      isScore: false,
      pulse: emergency?.active
    },
    {
      id: 'ambulances-en-route',
      label: 'Ambulances En Route',
      value: ambulancesEnRoute,
      unit: '',
      sub: emergency?.active ? (emergency.vehicleId || '') : 'No dispatch active',
      color: '#0284C7', bg: '#F0F9FF', border: '#7DD3FC',
      isScore: false
    },
    {
      id: 'junction-coverage',
      label: 'Junction Coverage',
      value: coveragePct,
      max: 100,
      unit: '%',
      sub: 'Active nodes monitored',
      color: '#16A34A', bg: '#F0FDF4', border: '#86EFAC',
      isScore: true
    }
  ];
};

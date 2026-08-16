/**
 * trafficUtils.js
 * Shared utility functions for the I2TM traffic dashboard.
 * Import from here instead of duplicating logic across components.
 */

/**
 * Derives the primary emergency corridor object from the activeCorridors array.
 * Returns a stable fallback shape when no corridor is active so callers never
 * need to null-check individual properties.
 *
 * @param {Array} activeCorridors - Array from TrafficContext
 * @returns {{ active: boolean, [key: string]: any }}
 */
export const getEmergencyFromCorridors = (activeCorridors) => {
  if (activeCorridors && activeCorridors.length > 0) {
    return { ...activeCorridors[0], active: true };
  }
  return { active: false };
};

/**
 * Returns the hex color for a traffic signal light state.
 *
 * @param {'GREEN' | 'AMBER' | 'RED' | string} light
 * @returns {string} hex color
 */
export const getSignalHex = (light) => {
  switch (light) {
    case 'GREEN': return '#22C55E';
    case 'AMBER': return '#F59E0B';
    case 'RED':   return '#EF4444';
    default:      return '#EF4444';
  }
};

/**
 * Derives a status label and bar color from a density percentage.
 *
 * @param {number} densityPct
 * @returns {{ label: string, color: string, badgeVariant: string }}
 */
export const getDensityStatus = (densityPct) => {
  if (densityPct >= 85) {
    return { label: 'CRITICAL', color: '#DC2626', badgeVariant: 'critical' };
  }
  if (densityPct >= 65) {
    return { label: 'HIGH', color: '#EA580C', badgeVariant: 'orange' };
  }
  if (densityPct >= 40) {
    return { label: 'MED', color: '#F59E0B', badgeVariant: 'degraded' };
  }
  return { label: 'LOW', color: '#16A34A', badgeVariant: 'healthy' };
};

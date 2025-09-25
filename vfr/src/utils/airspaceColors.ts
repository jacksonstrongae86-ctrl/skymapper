import { Airspace } from './types';

/**
 * Airspace color mapping based on ICAO classification and type
 * Colors follow international aviation standards where possible
 */

export interface AirspaceColorConfig {
  color: string;
  fillColor: string;
  fillOpacity: number;
  weight: number;
  name: string;
}

// ICAO Airspace Classes (icaoClass field)
export const ICAO_CLASS_COLORS: Record<number, AirspaceColorConfig> = {
  1: { // Class A
    color: '#FF0000',
    fillColor: '#FF0000',
    fillOpacity: 0.15,
    weight: 2,
    name: 'Class A'
  },
  2: { // Class B
    color: '#0000FF',
    fillColor: '#0000FF',
    fillOpacity: 0.15,
    weight: 2,
    name: 'Class B'
  },
  3: { // Class C
    color: '#FF00FF',
    fillColor: '#FF00FF',
    fillOpacity: 0.15,
    weight: 2,
    name: 'Class C'
  },
  4: { // Class D
    color: '#0080FF',
    fillColor: '#0080FF',
    fillOpacity: 0.15,
    weight: 2,
    name: 'Class D'
  },
  5: { // Class E
    color: '#FF8000',
    fillColor: '#FF8000',
    fillOpacity: 0.1,
    weight: 1,
    name: 'Class E'
  },
  6: { // Class F
    color: '#808080',
    fillColor: '#808080',
    fillOpacity: 0.1,
    weight: 1,
    name: 'Class F'
  },
  7: { // Class G
    color: '#00FF00',
    fillColor: '#00FF00',
    fillOpacity: 0.05,
    weight: 1,
    name: 'Class G'
  }
};

// Airspace Types (type field) - Common OpenAIP/aviation data types
export const AIRSPACE_TYPE_COLORS: Record<number, AirspaceColorConfig> = {
  1: { // Restricted
    color: '#FF0000',
    fillColor: '#FF0000',
    fillOpacity: 0.2,
    weight: 3,
    name: 'Restricted'
  },
  2: { // Prohibited
    color: '#800000',
    fillColor: '#800000',
    fillOpacity: 0.25,
    weight: 3,
    name: 'Prohibited'
  },
  3: { // Danger
    color: '#FF4500',
    fillColor: '#FF4500',
    fillOpacity: 0.2,
    weight: 2,
    name: 'Danger'
  },
  4: { // CTR (Control Zone)
    color: '#0000FF',
    fillColor: '#0000FF',
    fillOpacity: 0.15,
    weight: 2,
    name: 'Control Zone'
  },
  5: { // TMA (Terminal Maneuvering Area)
    color: '#8A2BE2',
    fillColor: '#8A2BE2',
    fillOpacity: 0.15,
    weight: 2,
    name: 'TMA'
  },
  6: { // CTA (Control Area)
    color: '#4B0082',
    fillColor: '#4B0082',
    fillOpacity: 0.12,
    weight: 2,
    name: 'Control Area'
  },
  7: { // Military Training Area
    color: '#800080',
    fillColor: '#800080',
    fillOpacity: 0.15,
    weight: 2,
    name: 'Military Training'
  },
  8: { // Alert Area
    color: '#FFD700',
    fillColor: '#FFD700',
    fillOpacity: 0.15,
    weight: 2,
    name: 'Alert Area'
  },
  9: { // Warning Area
    color: '#FF6347',
    fillColor: '#FF6347',
    fillOpacity: 0.15,
    weight: 2,
    name: 'Warning Area'
  },
  10: { // MOA (Military Operations Area)
    color: '#9932CC',
    fillColor: '#9932CC',
    fillOpacity: 0.12,
    weight: 2,
    name: 'Military Operations'
  },
  11: { // National Park/Wildlife Reserve
    color: '#228B22',
    fillColor: '#228B22',
    fillOpacity: 0.1,
    weight: 1,
    name: 'Protected Area'
  },
  12: { // ADIZ (Air Defense Identification Zone)
    color: '#DC143C',
    fillColor: '#DC143C',
    fillOpacity: 0.12,
    weight: 2,
    name: 'ADIZ'
  },
  13: { // AWY (Airways)
    color: '#00CED1',
    fillColor: '#00CED1',
    fillOpacity: 0.08,
    weight: 1,
    name: 'Airway'
  },
  14: { // Gliding/Soaring Area
    color: '#32CD32',
    fillColor: '#32CD32',
    fillOpacity: 0.1,
    weight: 1,
    name: 'Gliding Area'
  },
  15: { // Parachute Jumping Area
    color: '#FF1493',
    fillColor: '#FF1493',
    fillOpacity: 0.12,
    weight: 2,
    name: 'Parachute Area'
  }
};

// Default color for unknown types
export const DEFAULT_AIRSPACE_COLOR: AirspaceColorConfig = {
  color: '#666666',
  fillColor: '#666666',
  fillOpacity: 0.1,
  weight: 1,
  name: 'Unknown'
};

/**
 * Get color configuration for an airspace based on its type and ICAO class
 * Priority: type > icaoClass > default
 */
export function getAirspaceColor(airspace: Airspace): AirspaceColorConfig {
  // First try to get color by airspace type (more specific)
  if (airspace.type && AIRSPACE_TYPE_COLORS[airspace.type]) {
    return AIRSPACE_TYPE_COLORS[airspace.type];
  }

  // Fallback to ICAO class
  if (airspace.icaoClass && ICAO_CLASS_COLORS[airspace.icaoClass]) {
    return ICAO_CLASS_COLORS[airspace.icaoClass];
  }

  // Default fallback
  return DEFAULT_AIRSPACE_COLOR;
}

/**
 * Get a legend of all airspace types with their colors
 */
export function getAirspaceLegend(): Array<{ type: string; config: AirspaceColorConfig }> {
  const legend: Array<{ type: string; config: AirspaceColorConfig }> = [];

  // Add ICAO classes
  Object.entries(ICAO_CLASS_COLORS).forEach(([, config]) => {
    legend.push({
      type: `ICAO ${config.name}`,
      config
    });
  });

  // Add specific airspace types
  Object.entries(AIRSPACE_TYPE_COLORS).forEach(([, config]) => {
    legend.push({
      type: config.name,
      config
    });
  });

  return legend.sort((a, b) => a.type.localeCompare(b.type));
}
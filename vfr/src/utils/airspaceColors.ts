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

// ICAO Airspace Classes - Ultra vivid colors for maximum visibility and differentiation
export const ICAO_CLASS_COLORS: Record<number, AirspaceColorConfig> = {
  1: { // Class A - Critical controlled airspace (vivid red)
    color: '#FF0000',
    fillColor: '#FF3333',
    fillOpacity: 0.4,
    weight: 5,
    name: 'Class A (Controlled)'
  },
  2: { // Class B - Major airports (electric blue)
    color: '#0044FF',
    fillColor: '#2266FF',
    fillOpacity: 0.35,
    weight: 5,
    name: 'Class B (Major Airport)'
  },
  3: { // Class C - Medium airports (vivid magenta)
    color: '#FF00AA',
    fillColor: '#FF44CC',
    fillOpacity: 0.32,
    weight: 4,
    name: 'Class C (Medium Airport)'
  },
  4: { // Class D - Small airports (bright cyan)
    color: '#00AAFF',
    fillColor: '#33CCFF',
    fillOpacity: 0.3,
    weight: 4,
    name: 'Class D (Small Airport)'
  },
  5: { // Class E - Controlled (vivid orange)
    color: '#FF4400',
    fillColor: '#FF6622',
    fillOpacity: 0.25,
    weight: 3,
    name: 'Class E (Controlled)'
  },
  6: { // Class F - Advisory (bright purple)
    color: '#8844FF',
    fillColor: '#AA66FF',
    fillOpacity: 0.22,
    weight: 3,
    name: 'Class F (Advisory)'
  },
  7: { // Class G - Uncontrolled (vivid lime)
    color: '#44FF44',
    fillColor: '#66FF66',
    fillOpacity: 0.18,
    weight: 2,
    name: 'Class G (Uncontrolled)'
  }
};

// Airspace Types - Ultra vivid colors that stand out with maximum differentiation
export const AIRSPACE_TYPE_COLORS: Record<number, AirspaceColorConfig> = {
  1: { // Restricted - Ultra bright red for maximum danger visibility
    color: '#FF0000',
    fillColor: '#FF2222',
    fillOpacity: 0.45,
    weight: 6,
    name: '🚫 Restricted'
  },
  2: { // Prohibited - Dark crimson for absolute no entry
    color: '#AA0000',
    fillColor: '#DD0000',
    fillOpacity: 0.5,
    weight: 6,
    name: '⛔ Prohibited'
  },
  3: { // Danger - Vivid orange for high visibility
    color: '#FF3300',
    fillColor: '#FF5522',
    fillOpacity: 0.4,
    weight: 5,
    name: '⚠️ Danger'
  },
  4: { // CTR (Control Zone) - Electric blue for controlled
    color: '#0022FF',
    fillColor: '#2244FF',
    fillOpacity: 0.35,
    weight: 5,
    name: '🏢 Control Zone (CTR)'
  },
  5: { // TMA (Terminal Maneuvering Area) - Vivid purple for terminal
    color: '#7700DD',
    fillColor: '#9922FF',
    fillOpacity: 0.35,
    weight: 5,
    name: '✈️ Terminal Area (TMA)'
  },
  6: { // CTA (Control Area) - Deep violet for control
    color: '#5500CC',
    fillColor: '#7722EE',
    fillOpacity: 0.32,
    weight: 4,
    name: '🎯 Control Area (CTA)'
  },
  7: { // Military Training Area - Vivid olive/army green
    color: '#558800',
    fillColor: '#77AA22',
    fillOpacity: 0.35,
    weight: 5,
    name: '🪖 Military Training'
  },
  8: { // Alert Area - Bright gold for attention
    color: '#FFAA00',
    fillColor: '#FFCC22',
    fillOpacity: 0.32,
    weight: 4,
    name: '🔔 Alert Area'
  },
  9: { // Warning Area - Vivid orange-red for warning
    color: '#FF1100',
    fillColor: '#FF4422',
    fillOpacity: 0.35,
    weight: 4,
    name: '⚠️ Warning Area'
  },
  10: { // MOA (Military Operations Area) - Bright forest green
    color: '#007744',
    fillColor: '#22AA55',
    fillOpacity: 0.28,
    weight: 4,
    name: '🚁 Military Operations'
  },
  11: { // National Park/Wildlife Reserve - Vivid emerald green
    color: '#00CC33',
    fillColor: '#22DD55',
    fillOpacity: 0.25,
    weight: 3,
    name: '🌲 Protected Area'
  },
  12: { // ADIZ (Air Defense Identification Zone) - Vivid maroon for defense
    color: '#CC0033',
    fillColor: '#EE2255',
    fillOpacity: 0.3,
    weight: 5,
    name: '🛡️ Air Defense Zone'
  },
  13: { // AWY (Airways) - Vivid cyan for routes
    color: '#00CCDD',
    fillColor: '#22DDEE',
    fillOpacity: 0.22,
    weight: 4,
    name: '🛤️ Airway'
  },
  14: { // Gliding/Soaring Area - Bright lime for recreation
    color: '#55CC44',
    fillColor: '#77DD66',
    fillOpacity: 0.2,
    weight: 3,
    name: '🪂 Gliding Area'
  },
  15: { // Parachute Jumping Area - Vivid hot pink for jumping
    color: '#DD0077',
    fillColor: '#FF2299',
    fillOpacity: 0.3,
    weight: 4,
    name: '🪂 Parachute Area'
  }
};

// Default color for unknown types - Ultra vivid visibility
export const DEFAULT_AIRSPACE_COLOR: AirspaceColorConfig = {
  color: '#BB00BB',
  fillColor: '#DD22DD',
  fillOpacity: 0.3,
  weight: 3,
  name: '❓ Unknown Airspace'
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
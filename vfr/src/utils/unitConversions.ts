import { Elevation } from './types';

export type AltitudeUnit = 'ft' | 'm' | 'fl';

/**
 * Convert elevation to feet
 */
export function elevationToFeet(elevation: Elevation): number {
  switch (elevation.unit) {
    case 0: // feet
      return elevation.value;
    case 1: // meters
      return elevation.value * 3.28084;
    case 2: // flight level (hundreds of feet)
      return elevation.value * 100;
    default:
      return elevation.value; // assume feet if unknown
  }
}

/**
 * Convert elevation to meters
 */
export function elevationToMeters(elevation: Elevation): number {
  switch (elevation.unit) {
    case 0: // feet
      return elevation.value * 0.3048;
    case 1: // meters
      return elevation.value;
    case 2: // flight level (hundreds of feet)
      return elevation.value * 100 * 0.3048; // FL to feet, then to meters
    default:
      return elevation.value * 0.3048; // assume feet if unknown
  }
}

/**
 * Get elevation in the preferred unit
 */
export function elevationToUnit(elevation: Elevation, preferredUnit: AltitudeUnit): {
  value: number;
  unit: string;
  originalUnit: number;
} {
  // Handle flight levels specially - they should always display as FL
  if (elevation.unit === 2) {
    return {
      value: elevation.value,
      unit: 'FL',
      originalUnit: elevation.unit
    };
  }

  switch (preferredUnit) {
    case 'ft':
      return {
        value: Math.round(elevationToFeet(elevation)),
        unit: 'ft',
        originalUnit: elevation.unit
      };
    case 'm':
      return {
        value: Math.round(elevationToMeters(elevation)),
        unit: 'm',
        originalUnit: elevation.unit
      };
    case 'fl':
      // Convert to flight level (divide feet by 100)
      return {
        value: Math.round(elevationToFeet(elevation) / 100),
        unit: 'FL',
        originalUnit: elevation.unit
      };
    default:
      return {
        value: elevation.value,
        unit: elevation.unit === 0 ? 'ft' : elevation.unit === 1 ? 'm' : 'FL',
        originalUnit: elevation.unit
      };
  }
}

/**
 * Format elevation for display
 */
export function formatElevation(elevation: Elevation, preferredUnit: AltitudeUnit): string {
  const converted = elevationToUnit(elevation, preferredUnit);

  // Add thousands separator for large numbers
  const formattedValue = converted.value.toLocaleString();

  return `${formattedValue}${converted.unit}`;
}

/**
 * Get the unit label for display
 */
export function getUnitLabel(unit: AltitudeUnit): string {
  switch (unit) {
    case 'ft':
      return 'Feet (ft)';
    case 'm':
      return 'Meters (m)';
    case 'fl':
      return 'Flight Level (FL)';
    default:
      return 'Unknown';
  }
}
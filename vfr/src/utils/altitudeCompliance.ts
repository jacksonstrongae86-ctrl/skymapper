import { LatLng, Airspace, AviationGeometry } from './types';
import { elevationToFeet } from './unitConversions';

/**
 * Utility functions for aerospace altitude compliance in flight planning
 */

/**
 * Validate and correct airspace altitude limits
 * Ensures upper limit >= lower limit, swaps if necessary
 */
export function validateAirspaceLimits(airspace: Airspace): Airspace {
  const upperFeet = elevationToFeet(airspace.upperLimit);
  const lowerFeet = elevationToFeet(airspace.lowerLimit);

  // If upper limit is lower than lower limit, swap them
  if (upperFeet < lowerFeet) {
    console.warn(`Airspace ${airspace.name || airspace._id} has inverted limits: upper=${upperFeet}ft, lower=${lowerFeet}ft. Swapping them.`);

    return {
      ...airspace,
      upperLimit: airspace.lowerLimit, // Swap: assign original lower to upper
      lowerLimit: airspace.upperLimit  // Swap: assign original upper to lower
    };
  }

  return airspace; // Return as-is if limits are correct
}

/**
 * Validate and correct an array of airspaces
 */
export function validateAirspacesLimits(airspaces: Airspace[]): Airspace[] {
  return airspaces.map(validateAirspaceLimits);
}

/**
 * Check if a point is inside a polygon using ray casting algorithm
 */
export function isPointInPolygon(point: LatLng, polygon: number[][]): boolean {
  const { lat, lng } = point;
  let inside = false;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [lng_i, lat_i] = polygon[i];
    const [lng_j, lat_j] = polygon[j];

    if (((lat_i > lat) !== (lat_j > lat)) &&
        (lng < (lng_j - lng_i) * (lat - lat_i) / (lat_j - lat_i) + lng_i)) {
      inside = !inside;
    }
  }

  return inside;
}

/**
 * Check if a point is inside any geometry (Point, Polygon, or MultiPolygon)
 */
export function isPointInGeometry(point: LatLng, geometry: AviationGeometry): boolean {
  switch (geometry.type) {
    case 'Point':
      // For points, check if within small radius (e.g., 1 nautical mile)
      const [pointLng, pointLat] = geometry.coordinates;
      const distance = Math.sqrt(
        Math.pow(point.lat - pointLat, 2) + Math.pow(point.lng - pointLng, 2)
      );
      return distance < 0.016; // approximately 1 nautical mile in degrees

    case 'Polygon':
      return isPointInPolygon(point, geometry.coordinates[0]);

    case 'MultiPolygon':
      return geometry.coordinates.some(polygon =>
        isPointInPolygon(point, polygon[0])
      );

    case 'LineString':
    case 'MultiLineString':
      // Line geometries don't define enclosed areas
      return false;

    default:
      return false;
  }
}

/**
 * Get all airspaces that contain a given point
 */
export function getAirspacesAtPoint(point: LatLng, airspaces: Airspace[]): Airspace[] {
  return airspaces.filter(airspace => isPointInGeometry(point, airspace.geometry));
}

/**
 * Get the most restrictive altitude limits at a given point
 * Returns the tightest (lowest upper limit and highest lower limit)
 */
export function getAltitudeLimitsAtPoint(point: LatLng, airspaces: Airspace[]): {
  lowerLimit: number | null;
  upperLimit: number | null;
  restrictiveAirspaces: Airspace[];
} {
  const applicableAirspaces = getAirspacesAtPoint(point, airspaces);

  if (applicableAirspaces.length === 0) {
    return {
      lowerLimit: null,
      upperLimit: null,
      restrictiveAirspaces: []
    };
  }

  let lowestUpperLimit = Infinity;
  let highestLowerLimit = -Infinity;
  const restrictiveAirspaces: Airspace[] = [];

  for (const airspace of applicableAirspaces) {
    const upperFeet = elevationToFeet(airspace.upperLimit);
    const lowerFeet = elevationToFeet(airspace.lowerLimit);

    if (upperFeet < lowestUpperLimit) {
      lowestUpperLimit = upperFeet;
    }
    if (lowerFeet > highestLowerLimit) {
      highestLowerLimit = lowerFeet;
    }

    restrictiveAirspaces.push(airspace);
  }

  return {
    lowerLimit: highestLowerLimit === -Infinity ? null : highestLowerLimit,
    upperLimit: lowestUpperLimit === Infinity ? null : lowestUpperLimit,
    restrictiveAirspaces
  };
}

/**
 * Check if an altitude is compliant at a given point and get warning information
 */
export function checkAltitudeCompliance(
  altitude: number,
  point: LatLng,
  airspaces: Airspace[]
): {
  isInRestrictedAirspace: boolean;
  hasViolation: boolean;
  warning: {
    type: 'above_upper_limit' | 'below_lower_limit' | 'in_restricted_airspace' | null;
    message: string;
    limit: number | null;
    suggestedAltitude: number | null;
    airspaces: Airspace[];
  };
} {
  const limits = getAltitudeLimitsAtPoint(point, airspaces);
  const applicableAirspaces = getAirspacesAtPoint(point, airspaces);

  // No airspace restrictions
  if (limits.lowerLimit === null && limits.upperLimit === null && applicableAirspaces.length === 0) {
    return {
      isInRestrictedAirspace: false,
      hasViolation: false,
      warning: { type: null, message: '', limit: null, suggestedAltitude: null, airspaces: [] }
    };
  }

  // In airspace but no altitude restrictions (informational)
  if (limits.lowerLimit === null && limits.upperLimit === null && applicableAirspaces.length > 0) {
    const airspaceNames = applicableAirspaces.map(a => a.name || 'Unnamed').join(', ');
    return {
      isInRestrictedAirspace: true,
      hasViolation: false,
      warning: {
        type: 'in_restricted_airspace',
        message: `Waypoint is in airspace: ${airspaceNames}. Please verify operational status and restrictions.`,
        limit: null,
        suggestedAltitude: null,
        airspaces: applicableAirspaces
      }
    };
  }

  // Check upper limit violation
  if (limits.upperLimit !== null && altitude > limits.upperLimit) {
    const airspaceNames = limits.restrictiveAirspaces.map(a => a.name || 'Unnamed').join(', ');
    return {
      isInRestrictedAirspace: true,
      hasViolation: true,
      warning: {
        type: 'above_upper_limit',
        message: `Altitude ${altitude}ft exceeds upper limit of ${limits.upperLimit}ft in airspace: ${airspaceNames}. Consider flying below ${limits.upperLimit}ft.`,
        limit: limits.upperLimit,
        suggestedAltitude: limits.upperLimit,
        airspaces: limits.restrictiveAirspaces
      }
    };
  }

  // Check lower limit violation
  if (limits.lowerLimit !== null && altitude < limits.lowerLimit) {
    const airspaceNames = limits.restrictiveAirspaces.map(a => a.name || 'Unnamed').join(', ');
    return {
      isInRestrictedAirspace: true,
      hasViolation: true,
      warning: {
        type: 'below_lower_limit',
        message: `Altitude ${altitude}ft is below minimum limit of ${limits.lowerLimit}ft in airspace: ${airspaceNames}. Consider flying above ${limits.lowerLimit}ft.`,
        limit: limits.lowerLimit,
        suggestedAltitude: limits.lowerLimit,
        airspaces: limits.restrictiveAirspaces
      }
    };
  }

  // In restricted airspace but compliant
  const airspaceNames = limits.restrictiveAirspaces.map(a => a.name || 'Unnamed').join(', ');
  return {
    isInRestrictedAirspace: true,
    hasViolation: false,
    warning: {
      type: 'in_restricted_airspace',
      message: `Waypoint is in airspace: ${airspaceNames}. Altitude ${altitude}ft is within limits (${limits.lowerLimit || 0}ft - ${limits.upperLimit || '∞'}ft). Please verify operational status.`,
      limit: null,
      suggestedAltitude: null,
      airspaces: limits.restrictiveAirspaces
    }
  };
}

/**
 * Legacy function for backward compatibility - now just calls checkAltitudeCompliance
 * @deprecated Use checkAltitudeCompliance instead
 */
export function isAltitudeCompliant(
  altitude: number,
  point: LatLng,
  airspaces: Airspace[]
): {
  compliant: boolean;
  adjustedAltitude: number | null;
  violation: {
    type: 'above_upper_limit' | 'below_lower_limit' | null;
    limit: number | null;
    airspaces: Airspace[];
  };
} {
  const compliance = checkAltitudeCompliance(altitude, point, airspaces);
  return {
    compliant: !compliance.hasViolation,
    adjustedAltitude: compliance.warning.suggestedAltitude,
    violation: {
      type: compliance.warning.type === 'in_restricted_airspace' ? null : compliance.warning.type,
      limit: compliance.warning.limit,
      airspaces: compliance.warning.airspaces
    }
  };
}

/**
 * Analyze route for airspace warnings without automatic adjustments
 */
export function analyzeRouteForWarnings(
  waypoints: Array<{ position: [number, number]; altitude: number }>,
  airspaces: Airspace[]
): Array<{
  waypointIndex: number;
  position: [number, number];
  altitude: number;
  isInRestrictedAirspace: boolean;
  hasViolation: boolean;
  warning: {
    type: 'above_upper_limit' | 'below_lower_limit' | 'in_restricted_airspace' | null;
    message: string;
    limit: number | null;
    suggestedAltitude: number | null;
    airspaces: Airspace[];
  };
}> {
  const warnings: Array<{
    waypointIndex: number;
    position: [number, number];
    altitude: number;
    isInRestrictedAirspace: boolean;
    hasViolation: boolean;
    warning: {
      type: 'above_upper_limit' | 'below_lower_limit' | 'in_restricted_airspace' | null;
      message: string;
      limit: number | null;
      suggestedAltitude: number | null;
      airspaces: Airspace[];
    };
  }> = [];

  waypoints.forEach((waypoint, index) => {
    const point: LatLng = { lat: waypoint.position[0], lng: waypoint.position[1] };
    const compliance = checkAltitudeCompliance(waypoint.altitude, point, airspaces);

    if (compliance.isInRestrictedAirspace) {
      warnings.push({
        waypointIndex: index,
        position: waypoint.position,
        altitude: waypoint.altitude,
        isInRestrictedAirspace: compliance.isInRestrictedAirspace,
        hasViolation: compliance.hasViolation,
        warning: compliance.warning
      });
    }
  });

  return warnings;
}

/**
 * Find intersection points where a flight leg crosses airspace boundaries
 * This is a simplified implementation - in practice, you'd need more sophisticated
 * geometric algorithms for precise intersection calculation
 */
export function findAirspaceCrossings(
  from: LatLng,
  to: LatLng,
  airspaces: Airspace[]
): Array<{
  point: LatLng;
  distance: number; // distance from start point (0-1)
  airspace: Airspace;
  entering: boolean; // true if entering airspace, false if exiting
}> {
  const crossings: Array<{
    point: LatLng;
    distance: number;
    airspace: Airspace;
    entering: boolean;
  }> = [];

  // Simple implementation: sample points along the route
  const sampleCount = 20;
  let previousAirspaces = getAirspacesAtPoint(from, airspaces);

  for (let i = 1; i <= sampleCount; i++) {
    const ratio = i / sampleCount;
    const samplePoint: LatLng = {
      lat: from.lat + (to.lat - from.lat) * ratio,
      lng: from.lng + (to.lng - from.lng) * ratio
    };

    const currentAirspaces = getAirspacesAtPoint(samplePoint, airspaces);

    // Find newly entered airspaces
    for (const airspace of currentAirspaces) {
      if (!previousAirspaces.some(prev => prev._id === airspace._id)) {
        crossings.push({
          point: samplePoint,
          distance: ratio,
          airspace,
          entering: true
        });
      }
    }

    // Find exited airspaces
    for (const airspace of previousAirspaces) {
      if (!currentAirspaces.some(curr => curr._id === airspace._id)) {
        crossings.push({
          point: samplePoint,
          distance: ratio,
          airspace,
          entering: false
        });
      }
    }

    previousAirspaces = currentAirspaces;
  }

  return crossings.sort((a, b) => a.distance - b.distance);
}

/**
 * Calculate required transition waypoints for a flight leg to maintain altitude compliance
 */
export function calculateComplianceTransitions(
  fromWaypoint: { position: [number, number]; altitude: number },
  toWaypoint: { position: [number, number]; altitude: number },
  airspaces: Airspace[]
): Array<{
  position: [number, number];
  altitude: number;
  reason: string;
  restrictiveAirspaces: Airspace[];
}> {
  const from: LatLng = { lat: fromWaypoint.position[0], lng: fromWaypoint.position[1] };
  const to: LatLng = { lat: toWaypoint.position[0], lng: toWaypoint.position[1] };

  const crossings = findAirspaceCrossings(from, to, airspaces);
  const transitions: Array<{
    position: [number, number];
    altitude: number;
    reason: string;
    restrictiveAirspaces: Airspace[];
  }> = [];

  for (const crossing of crossings) {
    const limits = getAltitudeLimitsAtPoint(crossing.point, airspaces);

    // Calculate altitude at this point along the route
    const routeAltitude = fromWaypoint.altitude +
      (toWaypoint.altitude - fromWaypoint.altitude) * crossing.distance;

    const compliance = isAltitudeCompliant(routeAltitude, crossing.point, airspaces);

    if (!compliance.compliant && compliance.adjustedAltitude !== null) {
      transitions.push({
        position: [crossing.point.lat, crossing.point.lng],
        altitude: compliance.adjustedAltitude,
        reason: `Airspace compliance: ${compliance.violation.type}`,
        restrictiveAirspaces: limits.restrictiveAirspaces
      });
    }
  }

  return transitions;
}
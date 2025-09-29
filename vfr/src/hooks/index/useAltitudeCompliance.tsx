import { useState, useCallback } from 'react';
import { Waypoint, Airspace, LatLng } from '@/src/utils/types';
import {
  checkAltitudeCompliance,
  analyzeRouteForWarnings,
  getAltitudeLimitsAtPoint
} from '@/src/utils/altitudeCompliance';

export interface WaypointWarningInfo {
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
}

export interface RouteWarningAnalysis {
  warnings: WaypointWarningInfo[];
  hasViolations: boolean;
  hasRestrictedAirspaceIntersections: boolean;
  totalWarnings: number;
}

export function useAltitudeCompliance(airspaces: Airspace[] = []) {
  const [showWarnings, setShowWarnings] = useState(true);
  const [warningAlerts, setWarningAlerts] = useState<string[]>([]);

  /**
   * Analyze route for airspace warnings (non-intrusive)
   */
  const analyzeRouteWarnings = useCallback(
    (waypoints: Waypoint[]): RouteWarningAnalysis => {
      if (waypoints.length === 0) {
        return {
          warnings: [],
          hasViolations: false,
          hasRestrictedAirspaceIntersections: false,
          totalWarnings: 0
        };
      }

      const waypointsForAnalysis = waypoints.map(wp => ({
        position: wp.position,
        altitude: wp.altitude
      }));

      const warnings = analyzeRouteForWarnings(waypointsForAnalysis, airspaces);

      const hasViolations = warnings.some(w => w.hasViolation);
      const hasRestrictedAirspaceIntersections = warnings.some(w => w.isInRestrictedAirspace);

      return {
        warnings,
        hasViolations,
        hasRestrictedAirspaceIntersections,
        totalWarnings: warnings.length
      };
    },
    [airspaces]
  );

  /**
   * Check if a specific waypoint is in restricted airspace
   */
  const checkWaypointWarning = useCallback(
    (waypoint: Waypoint): WaypointWarningInfo | null => {
      const point: LatLng = {
        lat: waypoint.position[0],
        lng: waypoint.position[1]
      };

      console.log('Checking waypoint warning for:', waypoint.position, 'altitude:', waypoint.altitude, 'airspaces available:', airspaces.length);

      const compliance = checkAltitudeCompliance(waypoint.altitude, point, airspaces);

      console.log('Compliance check result:', compliance);

      if (compliance.isInRestrictedAirspace) {
        console.log('Waypoint is in restricted airspace, returning warning');
        return {
          waypointIndex: -1, // Will be set by caller
          position: waypoint.position,
          altitude: waypoint.altitude,
          isInRestrictedAirspace: compliance.isInRestrictedAirspace,
          hasViolation: compliance.hasViolation,
          warning: compliance.warning
        };
      }

      console.log('Waypoint is not in restricted airspace');
      return null;
    },
    [airspaces]
  );

  /**
   * Get altitude limits at a specific position
   */
  const getAltitudeLimits = useCallback(
    (position: [number, number]) => {
      const point: LatLng = { lat: position[0], lng: position[1] };
      return getAltitudeLimitsAtPoint(point, airspaces);
    },
    [airspaces]
  );

  /**
   * Add warning alert
   */
  const addWarningAlert = useCallback((message: string) => {
    setWarningAlerts(prev => [...prev, message]);
  }, []);

  /**
   * Clear warning alerts
   */
  const clearWarningAlerts = useCallback(() => {
    setWarningAlerts([]);
  }, []);

  return {
    // State
    showWarnings,
    warningAlerts,

    // Actions
    setShowWarnings,
    addWarningAlert,
    clearWarningAlerts,

    // Analysis functions
    analyzeRouteWarnings,
    checkWaypointWarning,

    // Utility functions
    getAltitudeLimits
  };
}
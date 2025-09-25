import { useState, useCallback } from 'react';
import { Waypoint, Airspace, LatLng } from '@/src/utils/types';
import {
  isAltitudeCompliant,
  getAltitudeLimitsAtPoint,
  calculateComplianceTransitions,
  getAirspacesAtPoint
} from '@/src/utils/altitudeCompliance';

export interface WaypointComplianceInfo {
  index: number;
  compliant: boolean;
  adjustedAltitude: number | null;
  violation: {
    type: 'above_upper_limit' | 'below_lower_limit' | null;
    limit: number | null;
    airspaces: Airspace[];
  };
  restrictiveAirspaces: Airspace[];
}

export interface LegComplianceInfo {
  fromIndex: number;
  toIndex: number;
  needsTransitions: boolean;
  transitions: Array<{
    position: [number, number];
    altitude: number;
    reason: string;
    restrictiveAirspaces: Airspace[];
  }>;
}

export interface ComplianceState {
  waypointCompliance: WaypointComplianceInfo[];
  legCompliance: LegComplianceInfo[];
  overallCompliant: boolean;
  autoAdjustEnabled: boolean;
}

export function useAltitudeCompliance(airspaces: Airspace[] = []) {
  const [autoAdjustEnabled, setAutoAdjustEnabled] = useState(true);
  const [complianceAlerts, setComplianceAlerts] = useState<string[]>([]);

  /**
   * Check compliance for all waypoints in a route
   */
  const checkWaypointCompliance = useCallback(
    (waypoints: Waypoint[]): WaypointComplianceInfo[] => {
      return waypoints.map((waypoint, index) => {
        const point: LatLng = {
          lat: waypoint.position[0],
          lng: waypoint.position[1]
        };

        const compliance = isAltitudeCompliant(waypoint.altitude, point, airspaces);
        const restrictiveAirspaces = getAirspacesAtPoint(point, airspaces);

        return {
          index,
          compliant: compliance.compliant,
          adjustedAltitude: compliance.adjustedAltitude,
          violation: compliance.violation,
          restrictiveAirspaces
        };
      });
    },
    [airspaces]
  );

  /**
   * Check compliance for all legs in a route
   */
  const checkLegCompliance = useCallback(
    (waypoints: Waypoint[]): LegComplianceInfo[] => {
      const legCompliance: LegComplianceInfo[] = [];

      for (let i = 0; i < waypoints.length - 1; i++) {
        const fromWaypoint = waypoints[i];
        const toWaypoint = waypoints[i + 1];

        const transitions = calculateComplianceTransitions(
          {
            position: fromWaypoint.position,
            altitude: fromWaypoint.altitude
          },
          {
            position: toWaypoint.position,
            altitude: toWaypoint.altitude
          },
          airspaces
        );

        legCompliance.push({
          fromIndex: i,
          toIndex: i + 1,
          needsTransitions: transitions.length > 0,
          transitions
        });
      }

      return legCompliance;
    },
    [airspaces]
  );

  /**
   * Get complete compliance analysis for a route
   */
  const analyzeRouteCompliance = useCallback(
    (waypoints: Waypoint[]): ComplianceState => {
      if (waypoints.length === 0) {
        return {
          waypointCompliance: [],
          legCompliance: [],
          overallCompliant: true,
          autoAdjustEnabled
        };
      }

      const waypointCompliance = checkWaypointCompliance(waypoints);
      const legCompliance = checkLegCompliance(waypoints);

      const overallCompliant = waypointCompliance.every(wc => wc.compliant) &&
        legCompliance.every(lc => !lc.needsTransitions);

      return {
        waypointCompliance,
        legCompliance,
        overallCompliant,
        autoAdjustEnabled
      };
    },
    [checkWaypointCompliance, checkLegCompliance, autoAdjustEnabled]
  );

  /**
   * Auto-adjust waypoint altitudes to be compliant
   */
  const adjustWaypointForCompliance = useCallback(
    (waypoint: Waypoint): Waypoint => {
      const point: LatLng = {
        lat: waypoint.position[0],
        lng: waypoint.position[1]
      };

      const compliance = isAltitudeCompliant(waypoint.altitude, point, airspaces);

      if (!compliance.compliant && compliance.adjustedAltitude !== null) {
        return {
          ...waypoint,
          altitude: compliance.adjustedAltitude,
          // Store original altitude for reference
          originalAltitude: waypoint.originalAltitude ?? waypoint.altitude
        };
      }

      return waypoint;
    },
    [airspaces]
  );

  /**
   * Auto-adjust all waypoints in a route for compliance
   */
  const adjustRouteForCompliance = useCallback(
    (waypoints: Waypoint[]): {
      adjustedWaypoints: Waypoint[];
      adjustmentsMade: Array<{
        index: number;
        originalAltitude: number;
        adjustedAltitude: number;
        reason: string;
      }>;
    } => {
      const adjustmentsMade: Array<{
        index: number;
        originalAltitude: number;
        adjustedAltitude: number;
        reason: string;
      }> = [];

      const adjustedWaypoints = waypoints.map((waypoint, index) => {
        const adjusted = adjustWaypointForCompliance(waypoint);

        if (adjusted.altitude !== waypoint.altitude) {
          adjustmentsMade.push({
            index,
            originalAltitude: waypoint.altitude,
            adjustedAltitude: adjusted.altitude,
            reason: 'Airspace compliance'
          });
        }

        return adjusted;
      });

      return { adjustedWaypoints, adjustmentsMade };
    },
    [adjustWaypointForCompliance]
  );

  /**
   * Generate transition waypoints for the entire route
   */
  const generateTransitionWaypoints = useCallback(
    (waypoints: Waypoint[]): Waypoint[] => {
      const result: Waypoint[] = [];

      for (let i = 0; i < waypoints.length; i++) {
        result.push(waypoints[i]);

        // Add transition waypoints for the leg to the next waypoint
        if (i < waypoints.length - 1) {
          const transitions = calculateComplianceTransitions(
            {
              position: waypoints[i].position,
              altitude: waypoints[i].altitude
            },
            {
              position: waypoints[i + 1].position,
              altitude: waypoints[i + 1].altitude
            },
            airspaces
          );

          for (const transition of transitions) {
            result.push({
              position: transition.position,
              type: 'waypoint',
              altitude: transition.altitude,
              ias: waypoints[i].ias, // Inherit IAS from source waypoint
              visible: false, // Hidden transition waypoint
              name: `Compliance Transition`,
              isTransition: true,
              altitudeChange: 0,
              rocRod: 500,
              iasClimbDescent: waypoints[i].ias
            });
          }
        }
      }

      return result;
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
   * Add compliance alert
   */
  const addComplianceAlert = useCallback((message: string) => {
    setComplianceAlerts(prev => [...prev, message]);
  }, []);

  /**
   * Clear compliance alerts
   */
  const clearComplianceAlerts = useCallback(() => {
    setComplianceAlerts([]);
  }, []);

  return {
    // State
    autoAdjustEnabled,
    complianceAlerts,

    // Actions
    setAutoAdjustEnabled,
    addComplianceAlert,
    clearComplianceAlerts,

    // Analysis functions
    analyzeRouteCompliance,
    checkWaypointCompliance,
    checkLegCompliance,

    // Adjustment functions
    adjustWaypointForCompliance,
    adjustRouteForCompliance,
    generateTransitionWaypoints,

    // Utility functions
    getAltitudeLimits
  };
}
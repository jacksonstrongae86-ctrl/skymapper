import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { Waypoint, Airspace } from '@/src/utils/types';

interface RouteWarningAnalysis {
  warnings: Array<{
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
  }>;
  hasViolations: boolean;
  hasRestrictedAirspaceIntersections: boolean;
  totalWarnings: number;
}

interface AirspaceAlertProps {
  waypoints: Waypoint[];
  analyzeRouteWarnings: (waypoints: Waypoint[]) => RouteWarningAnalysis;
  onDismiss?: () => void;
}

const AirspaceAlert: React.FC<AirspaceAlertProps> = ({
  waypoints,
  analyzeRouteWarnings,
  onDismiss,
}) => {
  const warningAnalysis = analyzeRouteWarnings(waypoints);

  if (!warningAnalysis.hasViolations && !warningAnalysis.hasRestrictedAirspaceIntersections) {
    return null;
  }

  const violationWarnings = warningAnalysis.warnings.filter(w => w.hasViolation);
  const informationalWarnings = warningAnalysis.warnings.filter(w => !w.hasViolation);

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md px-4">
      <div className={`
        rounded-lg shadow-lg border-2 p-4
        ${warningAnalysis.hasViolations
          ? 'bg-red-50 border-red-300 dark:bg-red-900/20 dark:border-red-700'
          : 'bg-yellow-50 border-yellow-300 dark:bg-yellow-900/20 dark:border-yellow-700'
        }
        animate-pulse
      `}>
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            <AlertTriangle
              className={`w-5 h-5 ${
                warningAnalysis.hasViolations
                  ? 'text-red-600 dark:text-red-400'
                  : 'text-yellow-600 dark:text-yellow-400'
              }`}
            />
            <div>
              <h3 className={`font-semibold text-sm ${
                warningAnalysis.hasViolations
                  ? 'text-red-800 dark:text-red-200'
                  : 'text-yellow-800 dark:text-yellow-200'
              }`}>
                {warningAnalysis.hasViolations ? 'Altitude Violations!' : 'Airspace Caution'}
              </h3>
              <p className={`text-xs mt-1 ${
                warningAnalysis.hasViolations
                  ? 'text-red-700 dark:text-red-300'
                  : 'text-yellow-700 dark:text-yellow-300'
              }`}>
                {violationWarnings.length > 0 && (
                  <>
                    {violationWarnings.length} violation{violationWarnings.length !== 1 ? 's' : ''} detected
                    {informationalWarnings.length > 0 && `, ${informationalWarnings.length} intersection${informationalWarnings.length !== 1 ? 's' : ''}`}
                  </>
                )}
                {violationWarnings.length === 0 && informationalWarnings.length > 0 && (
                  `${informationalWarnings.length} airspace intersection${informationalWarnings.length !== 1 ? 's' : ''} detected`
                )}
              </p>
              <p className={`text-xs mt-1 ${
                warningAnalysis.hasViolations
                  ? 'text-red-600 dark:text-red-400'
                  : 'text-yellow-600 dark:text-yellow-400'
              }`}>
                Check the sidebar for details
              </p>
            </div>
          </div>
          {onDismiss && (
            <button
              onClick={onDismiss}
              className={`p-1 rounded-full hover:bg-opacity-20 ${
                warningAnalysis.hasViolations
                  ? 'hover:bg-red-600 text-red-600 dark:text-red-400'
                  : 'hover:bg-yellow-600 text-yellow-600 dark:text-yellow-400'
              }`}
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AirspaceAlert;
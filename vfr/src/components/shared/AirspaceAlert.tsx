import React, { useState, useEffect } from 'react';
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
  const [isDismissed, setIsDismissed] = useState(false);
  const warningAnalysis = analyzeRouteWarnings(waypoints);

  // Reset dismissed state when new warnings appear
  useEffect(() => {
    if (warningAnalysis.hasViolations || warningAnalysis.hasRestrictedAirspaceIntersections) {
      setIsDismissed(false);
    }
  }, [warningAnalysis.hasViolations, warningAnalysis.hasRestrictedAirspaceIntersections]);

  if (!warningAnalysis.hasViolations && !warningAnalysis.hasRestrictedAirspaceIntersections) {
    return null;
  }

  if (isDismissed) {
    return null;
  }

  const violationWarnings = warningAnalysis.warnings.filter(w => w.hasViolation);
  const informationalWarnings = warningAnalysis.warnings.filter(w => !w.hasViolation);

  const handleDismiss = () => {
    setIsDismissed(true);
    onDismiss?.();
  };

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[100] w-full max-w-lg px-4 sm:px-6">
      <div className={`
        rounded-xl shadow-2xl border-2 p-4 sm:p-5
        ${warningAnalysis.hasViolations
          ? 'bg-gradient-to-r from-red-600 to-red-700 border-red-800 text-white shadow-red-500/60'
          : 'bg-gradient-to-r from-yellow-500 to-yellow-600 border-yellow-700 text-white shadow-yellow-500/60'
        }
        backdrop-blur-sm
        ring-4 ring-white/20
        relative
        opacity-100
        transform transition-all duration-300 hover:scale-[1.02]
      `}>
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            <AlertTriangle
              className="w-6 h-6 text-white"
            />
            <div className="flex-1">
              <h3 className="font-bold text-base sm:text-lg text-white">
                {warningAnalysis.hasViolations ? '⚠️ ALTITUDE VIOLATIONS!' : '⚠️ AIRSPACE CAUTION'}
              </h3>
              <p className="text-xs sm:text-sm mt-1 text-white font-medium">
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
              <p className="text-xs sm:text-sm mt-2 text-white/90 font-medium">
                📋 Check the sidebar for details
              </p>
            </div>
          </div>
          {onDismiss && (
            <button
              onClick={handleDismiss}
              className="p-1 sm:p-2 rounded-full hover:bg-white/20 text-white transition-colors duration-200 ml-2 flex-shrink-0"
              title="Dismiss alert"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AirspaceAlert;
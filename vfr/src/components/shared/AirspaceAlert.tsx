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
  const [isVisible, setIsVisible] = useState(false);
  const warningAnalysis = analyzeRouteWarnings(waypoints);

  useEffect(() => {
    if (warningAnalysis.hasViolations || warningAnalysis.hasRestrictedAirspaceIntersections) {
      setIsVisible(true);
    }
  }, [warningAnalysis.hasViolations, warningAnalysis.hasRestrictedAirspaceIntersections]);

  if (!warningAnalysis.hasViolations && !warningAnalysis.hasRestrictedAirspaceIntersections) {
    return null;
  }

  const violationWarnings = warningAnalysis.warnings.filter(w => w.hasViolation);
  const informationalWarnings = warningAnalysis.warnings.filter(w => !w.hasViolation);

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(() => onDismiss?.(), 300);
  };

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[100] w-full max-w-lg px-4 sm:px-6">
      <div className={`
        rounded-xl shadow-2xl border-2 p-4 sm:p-5
        ${warningAnalysis.hasViolations
          ? 'bg-gradient-to-r from-red-600 to-red-700 border-red-800 text-white shadow-red-500/60'
          : 'bg-gradient-to-r from-yellow-500 to-yellow-600 border-yellow-700 text-white shadow-yellow-500/60'
        }
        ${isVisible ? 'animate-bounce' : 'opacity-0 translate-y-[-20px]'}
        backdrop-blur-sm
        transform transition-all duration-500 hover:scale-105
        ring-4 ring-white/20
        relative
        before:absolute before:inset-0 before:rounded-xl before:bg-white/10 before:animate-pulse
      `}>
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            <AlertTriangle
              className="w-6 h-6 text-white animate-pulse"
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
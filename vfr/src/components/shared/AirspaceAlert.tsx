import React, { useState, useEffect, useRef } from 'react';
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
  const [isVisible, setIsVisible] = useState(true);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const warningAnalysis = analyzeRouteWarnings(waypoints);

  // Reset dismissed state and auto-dismiss timer when new warnings appear
  useEffect(() => {
    if (warningAnalysis.hasViolations || warningAnalysis.hasRestrictedAirspaceIntersections) {
      // Only reset if currently dismissed
      if (isDismissed) {
        setIsDismissed(false);
        setIsVisible(true);
      }

      // Clear existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Auto-dismiss after 2 seconds
      timeoutRef.current = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => {
          setIsDismissed(true);
          onDismiss?.();
        }, 300); // Wait for fade-out animation
      }, 2000);
    } else {
      // No warnings, dismiss immediately
      setIsDismissed(true);
      setIsVisible(false);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [warningAnalysis.hasViolations, warningAnalysis.hasRestrictedAirspaceIntersections, onDismiss, isDismissed]);

  if (!warningAnalysis.hasViolations && !warningAnalysis.hasRestrictedAirspaceIntersections) {
    return null;
  }

  if (isDismissed) {
    return null;
  }

  const violationWarnings = warningAnalysis.warnings.filter(w => w.hasViolation);
  const informationalWarnings = warningAnalysis.warnings.filter(w => !w.hasViolation);

  const handleDismiss = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
    setTimeout(() => {
      setIsDismissed(true);
      onDismiss?.();
    }, 300); // Wait for fade-out animation
  };

  return (
    <div
      className={`
        fixed top-4 left-1/2 transform -translate-x-1/2 z-[100] w-full max-w-lg px-4 sm:px-6
        transition-all duration-300
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}
      `}
    >
      <div className={`
        rounded-xl shadow-2xl border p-4 sm:p-5
        ${warningAnalysis.hasViolations
          ? 'bg-[var(--sidebar-bg)] border-red-600/30'
          : 'bg-[var(--sidebar-bg)] border-orange-600/30'
        }
        backdrop-blur-md
        relative
        transform transition-all duration-200 hover:scale-[1.02]
      `}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className={`
              p-2 rounded-lg flex-shrink-0
              ${warningAnalysis.hasViolations
                ? 'bg-red-600/20 border border-red-600/30'
                : 'bg-orange-600/20 border border-orange-600/30'
              }
            `}>
              <AlertTriangle className={`w-5 h-5 sm:w-6 sm:h-6 ${
                warningAnalysis.hasViolations ? 'text-red-400' : 'text-orange-400'
              }`} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className={`font-bold text-sm sm:text-base mb-1 ${
                warningAnalysis.hasViolations ? 'text-red-300' : 'text-orange-300'
              }`}>
                {warningAnalysis.hasViolations ? 'Altitude Violations' : 'Airspace Caution'}
              </h3>
              <p className="text-xs sm:text-sm text-[var(--sidebar-text)] font-medium">
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
              <p className="text-xs text-[var(--sidebar-text-muted)] mt-1.5">
                Check the sidebar for details
              </p>
            </div>
          </div>
          {onDismiss && (
            <button
              onClick={handleDismiss}
              className="p-1.5 sm:p-2 rounded-lg flex-shrink-0 hover:bg-[var(--button-hover)] text-[var(--sidebar-text)] transition-all duration-200"
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
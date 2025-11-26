import React, { useState, useEffect, useRef } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Waypoint, Airspace } from '@/src/utils/types';
import { useTheme } from '@/src/utils/ThemeContext';

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
  const { theme } = useTheme();
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const warningAnalysis = analyzeRouteWarnings(waypoints);

  useEffect(() => {
    const hasWarnings = warningAnalysis.hasViolations || warningAnalysis.hasRestrictedAirspaceIntersections;

    if (hasWarnings) {
      // Show alert
      setIsVisible(true);

      // Auto-dismiss after 2.5 seconds
      timeoutRef.current = setTimeout(() => {
        setIsVisible(false);
        onDismiss?.();
      }, 2500);
    } else {
      // No warnings, hide immediately
      setIsVisible(false);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [warningAnalysis.hasViolations, warningAnalysis.hasRestrictedAirspaceIntersections, onDismiss]);

  if (!warningAnalysis.hasViolations && !warningAnalysis.hasRestrictedAirspaceIntersections) {
    return null;
  }

  const isViolation = warningAnalysis.hasViolations;

  return (
    <div
      className={`
        fixed bottom-6 right-4 md:bottom-auto md:top-20 md:right-8 md:left-auto z-[100]
        transition-all duration-500 ease-out
        ${isVisible
          ? 'opacity-100 scale-100'
          : 'opacity-0 scale-75 pointer-events-none'
        }
      `}
    >
      <div className={`
        relative w-16 h-16 rounded-full flex items-center justify-center
        shadow-2xl border-2 border-[var(--sidebar-border)]
        ${`button-gradient-${theme}`}
      `}>
        {/* Pulse animation ring */}
        <div className={`
          absolute inset-0 rounded-full
          ${`button-gradient-${theme}`}
          ${isVisible ? 'animate-ping-slow' : ''}
        `} />

        {/* Icon */}
        <AlertTriangle className="w-8 h-8 text-[var(--button-text)] relative z-10" strokeWidth={2.5} />

        {/* Badge count */}
        <div className={`
          absolute -top-1 -right-1
          w-6 h-6 rounded-full flex items-center justify-center
          text-white font-bold text-xs
          shadow-lg
          ${isViolation ? 'bg-red-600' : 'bg-blue-600'}
          border-2 border-white
        `}>
          {warningAnalysis.totalWarnings}
        </div>
      </div>
    </div>
  );
};

export default AirspaceAlert;

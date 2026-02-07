import React from "react";
import { useTheme } from "@/src/utils/ThemeContext";
import { AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";
import AirspaceWarningPanel from "../../../../shared/AirspaceWarningPanel";
import { Waypoint, Airspace } from "@/src/utils/types";
import { FEATURES } from "@/src/utils/featureFlags";

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

interface AirspaceWarningsProps {
  isWarningsVisible: boolean;
  setIsWarningsVisible: (visible: boolean) => void;
  waypoints: Waypoint[];
  airspaces: Airspace[];
  warningAlerts: string[];
  onClearAlerts: () => void;
  analyzeRouteWarnings: (waypoints: Waypoint[]) => RouteWarningAnalysis;
  initialTab?: 'violations' | 'intersections' | 'stats';
}

export const AirspaceWarnings: React.FC<AirspaceWarningsProps> = ({
  isWarningsVisible,
  setIsWarningsVisible,
  waypoints,
  airspaces,
  warningAlerts,
  onClearAlerts,
  analyzeRouteWarnings,
  initialTab,
}) => {
  const { theme } = useTheme();

  if (!FEATURES.AIRSPACE_WARNINGS) {
    return (
      <div id="airspace-warnings" className="px-4 mb-4">
        <div className="border border-[var(--sidebar-border)] rounded-xl overflow-hidden shadow-lg p-4 text-sm text-[var(--text-secondary)] opacity-60">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} />
            <span>Sistema de avisos deshabilitado temporalmente. Los datos de espacio aéreo no están verificados oficialmente.</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div id="airspace-warnings" className="px-4 mb-4">
      <div className="border border-[var(--sidebar-border)] rounded-xl overflow-hidden shadow-lg">
        <button
          onClick={() => setIsWarningsVisible(!isWarningsVisible)}
          className={`
            w-full px-4 py-3
            ${`button-gradient-${theme}`}
            text-[var(--button-text)]
            hover:opacity-90
            transition-all duration-200
            font-semibold
            flex items-center justify-between
          `}
        >
          <span className="flex items-center gap-2">
            <AlertTriangle size={18} className="text-[var(--button-text)]" />
            <span>Airspace Warnings</span>
          </span>
          {isWarningsVisible ? (
            <ChevronUp size={18} className="text-[var(--button-text)]" />
          ) : (
            <ChevronDown size={18} className="text-[var(--button-text)]" />
          )}
        </button>

        <div
          className={`
            transition-all duration-300 ease-in-out
            ${isWarningsVisible ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"}
            ${`gradient-${theme}`}
            overflow-hidden
          `}
        >
          <AirspaceWarningPanel
            waypoints={waypoints}
            airspaces={airspaces}
            warningAlerts={warningAlerts}
            onClearAlerts={onClearAlerts}
            analyzeRouteWarnings={analyzeRouteWarnings}
            initialTab={initialTab}
          />
        </div>
      </div>
    </div>
  );
};

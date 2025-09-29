import React from 'react';
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

interface AirspaceWarningPanelProps {
  waypoints: Waypoint[];
  airspaces: Airspace[];
  warningAlerts: string[];
  onClearAlerts: () => void;
  analyzeRouteWarnings: (waypoints: Waypoint[]) => RouteWarningAnalysis;
}

const AirspaceWarningPanel: React.FC<AirspaceWarningPanelProps> = ({
  waypoints,
  airspaces,
  warningAlerts,
  onClearAlerts,
  analyzeRouteWarnings,
}) => {
  const warningAnalysis = analyzeRouteWarnings(waypoints);

  const violationWarnings = warningAnalysis.warnings.filter(w => w.hasViolation);
  const informationalWarnings = warningAnalysis.warnings.filter(w => !w.hasViolation);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          Airspace Warnings
        </h3>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
          !warningAnalysis.hasViolations
            ? warningAnalysis.hasRestrictedAirspaceIntersections
              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
              : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
        }`}>
          {!warningAnalysis.hasViolations
            ? warningAnalysis.hasRestrictedAirspaceIntersections
              ? 'Caution Required'
              : 'Clear Route'
            : 'Violations Found'}
        </div>
      </div>

      {/* Controls */}
      <div className="flex justify-center mb-4">
        <button
          onClick={onClearAlerts}
          className="px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 rounded-lg transition-colors duration-200 shadow-sm"
        >
          Clear All Alerts
        </button>
      </div>

      {/* Violation Warnings */}
      {violationWarnings.length > 0 && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <h4 className="text-sm font-semibold text-red-800 dark:text-red-200 mb-3 flex items-center">
            <span className="text-base mr-2">⚠️</span>
            Altitude Violations ({violationWarnings.length})
          </h4>
          <div className="space-y-3 max-h-40 overflow-y-auto scrollbar-thin scrollbar-thumb-red-400 scrollbar-track-red-100 dark:scrollbar-track-red-900">
            {violationWarnings.map((warning) => (
              <div key={`${warning.waypointIndex}-violation`} className="p-3 bg-white dark:bg-red-900/40 rounded-md border-l-4 border-red-500 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-red-800 dark:text-red-200 text-sm">
                    Waypoint {warning.waypointIndex + 1}
                  </span>
                  <span className="text-xs px-2 py-1 bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-200 rounded-full font-medium">
                    {warning.altitude}ft
                  </span>
                </div>
                <div className="text-sm text-red-700 dark:text-red-300 leading-relaxed">
                  {warning.warning.message}
                </div>
                {warning.warning.suggestedAltitude && (
                  <div className="mt-2 p-2 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded text-sm">
                    <span className="text-green-700 dark:text-green-300 font-medium">
                      💡 Suggested altitude: {warning.warning.suggestedAltitude}ft
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Informational Warnings */}
      {informationalWarnings.length > 0 && (
        <div className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <h4 className="text-sm font-semibold text-yellow-800 dark:text-yellow-200 mb-3 flex items-center">
            <span className="text-base mr-2">ℹ️</span>
            Airspace Intersections ({informationalWarnings.length})
          </h4>
          <div className="space-y-3 max-h-40 overflow-y-auto scrollbar-thin scrollbar-thumb-yellow-400 scrollbar-track-yellow-100 dark:scrollbar-track-yellow-900">
            {informationalWarnings.map((warning) => (
              <div key={`${warning.waypointIndex}-info`} className="p-3 bg-white dark:bg-yellow-900/40 rounded-md border-l-4 border-yellow-500 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-yellow-800 dark:text-yellow-200 text-sm">
                    Waypoint {warning.waypointIndex + 1}
                  </span>
                  <span className="text-xs px-2 py-1 bg-yellow-100 dark:bg-yellow-800 text-yellow-700 dark:text-yellow-200 rounded-full font-medium">
                    {warning.altitude}ft
                  </span>
                </div>
                <div className="text-sm text-yellow-700 dark:text-yellow-300 leading-relaxed">
                  {warning.warning.message}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Alerts */}
      {warningAlerts.length > 0 && (
        <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
            <span className="text-base mr-2">📋</span>
            Recent Alerts
          </h4>
          <div className="max-h-32 overflow-y-auto space-y-2 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 dark:scrollbar-track-gray-700">
            {warningAlerts.slice(-5).map((alert, index) => (
              <div
                key={index}
                className="p-3 bg-white dark:bg-gray-700 rounded-md border-l-4 border-blue-400 shadow-sm"
              >
                <div className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  {alert}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Important Notice */}
      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md mb-4">
        <div className="flex items-start space-x-2">
          <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <div className="text-sm text-blue-800 dark:text-blue-200">
            <div className="font-medium mb-1">Important Notice</div>
            <div className="text-xs">
              Airspaces are not active 24/7. Always verify current NOTAM and operational status before flight.
              These warnings are advisory only and do not replace official flight planning procedures.
            </div>
          </div>
        </div>
      </div>

      {/* Route Statistics */}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-600">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              {waypoints.length}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Total Waypoints</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              {airspaces.length}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Airspaces</div>
          </div>
          <div>
            <div className={`text-lg font-semibold ${
              violationWarnings.length === 0
                ? 'text-green-600 dark:text-green-400'
                : 'text-red-600 dark:text-red-400'
            }`}>
              {violationWarnings.length}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Violations</div>
          </div>
          <div>
            <div className={`text-lg font-semibold ${
              informationalWarnings.length === 0
                ? 'text-green-600 dark:text-green-400'
                : 'text-yellow-600 dark:text-yellow-400'
            }`}>
              {informationalWarnings.length}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Intersections</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AirspaceWarningPanel;
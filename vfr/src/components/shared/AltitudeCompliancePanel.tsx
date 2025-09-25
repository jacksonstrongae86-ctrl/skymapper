import React from 'react';
import { Waypoint, Airspace, AnalyzeRouteCompliance } from '@/src/utils/types';

interface AltitudeCompliancePanelProps {
  waypoints: Waypoint[];
  airspaces: Airspace[];
  complianceAlerts: string[];
  autoAdjustEnabled: boolean;
  onAutoAdjustToggle: (enabled: boolean) => void;
  onInsertTransitions: () => void;
  onRemoveTransitions: () => void;
  onClearAlerts: () => void;
  analyzeRouteCompliance: (waypoints: Waypoint[]) => AnalyzeRouteCompliance;
}

const AltitudeCompliancePanel: React.FC<AltitudeCompliancePanelProps> = ({
  waypoints,
  airspaces,
  complianceAlerts,
  autoAdjustEnabled,
  onAutoAdjustToggle,
  onInsertTransitions,
  onRemoveTransitions,
  onClearAlerts,
  analyzeRouteCompliance,
}) => {
  const complianceAnalysis = analyzeRouteCompliance(waypoints);

  const violatingWaypoints = complianceAnalysis.waypointCompliance.filter(
    wc => !wc.compliant
  );

  const hasTransitions = waypoints.some(wp => wp.isTransition && wp.name === 'Compliance Transition');

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Altitude Compliance
        </h3>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
          complianceAnalysis.overallCompliant
            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
        }`}>
          {complianceAnalysis.overallCompliant ? 'Compliant' : 'Violations Found'}
        </div>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="space-y-3">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={autoAdjustEnabled}
              onChange={(e) => onAutoAdjustToggle(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Auto-adjust altitudes for compliance
            </span>
          </label>

          <button
            onClick={onInsertTransitions}
            disabled={waypoints.length < 2}
            className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed rounded-md transition-colors duration-200"
          >
            Insert Transition Waypoints
          </button>
        </div>

        <div className="space-y-3">
          <button
            onClick={onRemoveTransitions}
            disabled={!hasTransitions}
            className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500 dark:disabled:bg-gray-700 rounded-md transition-colors duration-200"
          >
            Remove Transitions
          </button>

          <button
            onClick={onClearAlerts}
            disabled={complianceAlerts.length === 0}
            className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500 dark:disabled:bg-gray-700 rounded-md transition-colors duration-200"
          >
            Clear Alerts
          </button>
        </div>
      </div>

      {/* Violation Summary */}
      {violatingWaypoints.length > 0 && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
          <h4 className="text-sm font-medium text-red-800 dark:text-red-200 mb-2">
            Altitude Violations ({violatingWaypoints.length})
          </h4>
          <div className="space-y-1">
            {violatingWaypoints.map((wc) => (
              <div key={wc.index} className="text-xs text-red-700 dark:text-red-300">
                Waypoint {wc.index + 1}: {wc.violation.type === 'above_upper_limit' ? 'Above' : 'Below'} limit
                ({wc.violation.limit}ft)
                {wc.adjustedAltitude && (
                  <span className="ml-2 font-medium">
                    → Suggested: {wc.adjustedAltitude}ft
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Alerts */}
      {complianceAlerts.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white">Recent Alerts</h4>
          <div className="max-h-32 overflow-y-auto space-y-1">
            {complianceAlerts.slice(-5).map((alert, index) => (
              <div
                key={index}
                className="text-xs text-gray-600 dark:text-gray-400 p-2 bg-gray-50 dark:bg-gray-700/50 rounded border-l-2 border-blue-400"
              >
                {alert}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Route Statistics */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              {waypoints.length}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Total Waypoints</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              {waypoints.filter(wp => wp.isTransition).length}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Transitions</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              {airspaces.length}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Airspaces</div>
          </div>
          <div>
            <div className={`text-lg font-semibold ${
              violatingWaypoints.length === 0
                ? 'text-green-600 dark:text-green-400'
                : 'text-red-600 dark:text-red-400'
            }`}>
              {violatingWaypoints.length}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Violations</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AltitudeCompliancePanel;
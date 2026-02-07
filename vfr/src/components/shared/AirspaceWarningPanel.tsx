import React, { useState } from 'react';
import { Waypoint, Airspace } from '@/src/utils/types';
import { useTheme } from '@/src/utils/ThemeContext';
import { AlertTriangle, Info, CheckCircle, BarChart3, XCircle } from 'lucide-react';
import { FEATURES } from '@/src/utils/featureFlags';

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
  initialTab?: 'violations' | 'intersections' | 'stats';
}

const AirspaceWarningPanel: React.FC<AirspaceWarningPanelProps> = ({
  waypoints,
  airspaces,
  onClearAlerts,
  analyzeRouteWarnings,
  initialTab,
}) => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<'violations' | 'intersections' | 'stats'>('violations');
  const warningAnalysis = analyzeRouteWarnings(waypoints);

  // Switch to the requested tab when initialTab changes
  React.useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const violationWarnings = warningAnalysis.warnings.filter(w => w.hasViolation);
  const informationalWarnings = warningAnalysis.warnings.filter(w => !w.hasViolation);

  // Check if feature is disabled
  if (!FEATURES.AIRSPACE_WARNINGS) {
    return (
      <div className="p-6">
        <div className="text-center py-8">
          <XCircle className="w-16 h-16 text-orange-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-[var(--sidebar-text)] mb-2">
            Sistema Temporalmente Deshabilitado
          </h3>
          <p className="text-sm text-[var(--sidebar-text-muted)] max-w-md mx-auto leading-relaxed">
            Sistema de avisos deshabilitado temporalmente. Los datos de espacio aéreo no están verificados oficialmente.
          </p>
          <div className="mt-6 p-4 bg-blue-600/10 rounded-lg border border-blue-600/30">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-left text-[var(--sidebar-text-muted)]">
                <div className="font-semibold mb-1 text-[var(--sidebar-text)]">Próximamente</div>
                <div>
                  El sistema de alertas de espacio aéreo estará disponible próximamente con datos oficiales 
                  verificados de ENAIRE AIS/AIP. Mientras tanto, consulte siempre el AIP oficial antes de volar.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Tabs */}
      <div className="flex justify-center items-center gap-2 py-1.5 border-b border-[var(--sidebar-border)]">
        <button
          onClick={() => setActiveTab('violations')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-200 flex items-center justify-center gap-1.5 ${
            activeTab === 'violations'
              ? `button-gradient-${theme} text-[var(--button-text)]`
              : 'text-[var(--sidebar-text)] hover:bg-[var(--button-hover)]'
          }`}
        >
          <AlertTriangle size={14} />
          Violations
          {violationWarnings.length > 0 && (
            <span className={`px-1.5 py-0.5 rounded text-xs font-semibold ${
              activeTab === 'violations' ? 'bg-white/20' : 'bg-red-600/20 text-red-300'
            }`}>
              {violationWarnings.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('intersections')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-200 flex items-center justify-center gap-1.5 ${
            activeTab === 'intersections'
              ? `button-gradient-${theme} text-[var(--button-text)]`
              : 'text-[var(--sidebar-text)] hover:bg-[var(--button-hover)]'
          }`}
        >
          <Info size={14} />
          Intersections
          {informationalWarnings.length > 0 && (
            <span className={`px-1.5 py-0.5 rounded text-xs font-semibold ${
              activeTab === 'intersections' ? 'bg-white/20' : 'bg-orange-600/20 text-orange-300'
            }`}>
              {informationalWarnings.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('stats')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-200 flex items-center justify-center gap-1.5 ${
            activeTab === 'stats'
              ? `button-gradient-${theme} text-[var(--button-text)]`
              : 'text-[var(--sidebar-text)] hover:bg-[var(--button-hover)]'
          }`}
        >
          <BarChart3 size={14} />
          Stats
        </button>
      </div>

      {/* Tab Content */}
      <div className="p-4">
        {/* Violations Tab */}
        {activeTab === 'violations' && (
          <div>
            {violationWarnings.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
                <p className="text-sm text-[var(--sidebar-text-muted)]">No altitude violations detected</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[380px] overflow-y-auto custom-scrollbar">
                {violationWarnings.map((warning) => {
                  const waypoint = waypoints[warning.waypointIndex];
                  const waypointName = waypoint?.name || `WP ${warning.waypointIndex + 1}`;

                  return (
                    <div
                      key={`${warning.waypointIndex}-violation`}
                      id={`warning-${warning.waypointIndex}`}
                      className="p-3 bg-red-600/10 rounded-lg border-l-2 border-red-500"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-semibold text-[var(--sidebar-text)]">
                          {waypointName}
                        </span>
                        <span className="text-xs px-2 py-0.5 bg-red-600/20 text-red-300 rounded">
                          {warning.altitude.toFixed(2)}ft
                        </span>
                      </div>
                      <p className="text-xs text-[var(--sidebar-text-muted)] leading-relaxed">
                        {warning.warning.message}
                      </p>
                      {warning.warning.suggestedAltitude && (
                        <div className="mt-2 p-2 bg-green-600/10 rounded text-xs">
                          <span className="text-green-300 flex items-center gap-1">
                            <Info className="w-3 h-3" />
                            Suggested: {warning.warning.suggestedAltitude.toFixed(2)}ft
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Intersections Tab */}
        {activeTab === 'intersections' && (
          <div>
            {informationalWarnings.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
                <p className="text-sm text-[var(--sidebar-text-muted)]">No airspace intersections</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[380px] overflow-y-auto custom-scrollbar">
                {informationalWarnings.map((warning) => {
                  const waypoint = waypoints[warning.waypointIndex];
                  const waypointName = waypoint?.name || `WP ${warning.waypointIndex + 1}`;

                  return (
                    <div
                      key={`${warning.waypointIndex}-info`}
                      id={`warning-${warning.waypointIndex}`}
                      className="p-3 bg-orange-600/10 rounded-lg border-l-2 border-orange-500"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-semibold text-[var(--sidebar-text)]">
                          {waypointName}
                        </span>
                        <span className="text-xs px-2 py-0.5 bg-orange-600/20 text-orange-300 rounded">
                          {warning.altitude.toFixed(2)}ft
                        </span>
                      </div>
                      <p className="text-xs text-[var(--sidebar-text-muted)] leading-relaxed">
                        {warning.warning.message}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Stats Tab */}
        {activeTab === 'stats' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-[var(--sidebar-bg)]/50 rounded-lg border border-[var(--sidebar-border)] text-center">
                <div className="text-xl font-bold text-[var(--sidebar-text)]">{waypoints.length}</div>
                <div className="text-xs text-[var(--sidebar-text-muted)] mt-1">Waypoints</div>
              </div>
              <div className="p-3 bg-[var(--sidebar-bg)]/50 rounded-lg border border-[var(--sidebar-border)] text-center">
                <div className="text-xl font-bold text-[var(--sidebar-text)]">{airspaces.length}</div>
                <div className="text-xs text-[var(--sidebar-text-muted)] mt-1">Airspaces</div>
              </div>
              <div className="p-3 bg-[var(--sidebar-bg)]/50 rounded-lg border border-[var(--sidebar-border)] text-center">
                <div className={`text-xl font-bold ${
                  violationWarnings.length === 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {violationWarnings.length}
                </div>
                <div className="text-xs text-[var(--sidebar-text-muted)] mt-1">Violations</div>
              </div>
              <div className="p-3 bg-[var(--sidebar-bg)]/50 rounded-lg border border-[var(--sidebar-border)] text-center">
                <div className={`text-xl font-bold ${
                  informationalWarnings.length === 0 ? 'text-green-400' : 'text-orange-400'
                }`}>
                  {informationalWarnings.length}
                </div>
                <div className="text-xs text-[var(--sidebar-text-muted)] mt-1">Intersections</div>
              </div>
            </div>

            {/* Important Notice */}
            <div className="p-3 bg-blue-600/10 rounded-lg border border-blue-600/30">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-[var(--sidebar-text-muted)]">
                  <div className="font-semibold mb-1 text-[var(--sidebar-text)]">Notice</div>
                  <div>
                    Airspaces are not active 24/7. Always verify current NOTAM before flight.
                  </div>
                </div>
              </div>
            </div>

            {/* Clear Button */}
            <button
              onClick={onClearAlerts}
              className={`w-full px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${`button-gradient-${theme}`} text-[var(--button-text)] hover:opacity-90`}
            >
              Clear All Alerts
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AirspaceWarningPanel;

import React from 'react';
import { MapControlsProps } from '../../utils/types';
import { useTheme, Theme, themeColours} from '../../utils/ThemeContext';

const MapControls: React.FC<MapControlsProps> = ({
  mapType,
  setMapType,
  onDeleteLastWaypoint,
  onClearWaypoints,
}) => {
  const { theme, setTheme } = useTheme();

  return (
    <div className="fixed right-4 flex flex-col gap-2">
      {/* Map Type Selector */}
      <div className="bg-[var(--button-bg)] backdrop-blur-md p-2 rounded-2xl shadow-lg border border-[var(--sidebar-border)]">
        <select
          className="w-28 px-2.5 py-2.5 text-sm font-bold bg-[var(--button-bg)] hover:bg-[var(--button-hover)] text-[var(--sidebar-text)] border border-[var(--sidebar-border)] rounded-xl focus:ring-2 focus:ring-blue-500/30 focus:outline-none appearance-none cursor-pointer"
          value={mapType}
          onChange={(e) => setMapType(e.target.value)}
        >
          <option value="street">🗺️ Street</option>
          <option value="sat">🛰️ Satellite</option>
          <option value="hybrid">🌍 Hybrid</option>
          <option value="terrain">⛰️ Terrain</option>
        </select>
      </div>

      {/* Theme Selector using circular buttons */}
      <div className="bg-[var(--button-bg)] backdrop-blur-md p-2 rounded-2xl shadow-lg border border-[var(--sidebar-border)] flex gap-2 items-center justify-center">
        {(Object.keys(themeColours) as Theme[]).map((t) => (
          <button
            key={t}
            onClick={() => setTheme(t)}
            title={t.charAt(0).toUpperCase() + t.slice(1)}
            className={`w-6 h-6 rounded-full focus:outline-none flex items-center justify-center border-2 ${
              theme === t ? "border-blue-500" : "border-transparent"
            }`}
            style={{ backgroundColor: themeColours[t] }}
          >
            {theme === t && (
              <span className="text-white font-bold">✓</span>
            )}
          </button>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          className="w-15 h-15 bg-yellow-600/90 hover:bg-yellow-700/90 text-white rounded-2xl shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105 border border-[var(--sidebar-border)]"
          onClick={onDeleteLastWaypoint}
          title="Delete Last Waypoint"
        >
          🗑️
        </button>
        <button
          className="w-15 h-15 bg-red-600/90 hover:bg-red-700/90 text-white rounded-2xl shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105 border border-[var(--sidebar-border)]"
          onClick={onClearWaypoints}
          title="Clear All Waypoints"
        >
          🧹
        </button>
      </div>
    </div>
  );
};

export default MapControls;
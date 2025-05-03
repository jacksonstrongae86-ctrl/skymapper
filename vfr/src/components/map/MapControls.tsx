import React, { useState, useEffect, useRef } from 'react';
import { MapControlsProps } from '../../utils/types';
import { useTheme, Theme, themeColours} from '../../utils/ThemeContext';

const MapControls: React.FC<MapControlsProps> = ({
  mapType,
  setMapType,
  onDeleteLastWaypoint,
  onClearWaypoints,
}) => {
  const { theme, setTheme } = useTheme();
  const [isThemeSelectorOpen, setIsThemeSelectorOpen] = useState(false);
  const themeSelectorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (themeSelectorRef.current && !themeSelectorRef.current.contains(event.target as Node)) {
        setIsThemeSelectorOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleThemeSelector = () => {
    setIsThemeSelectorOpen(!isThemeSelectorOpen);
  };

  return (
    <div className="fixed right-4 top-4 flex flex-col gap-2">
      {/* Theme Selector with toggle - Now in a fixed position */}
      <div className="absolute top-0 right-35" ref={themeSelectorRef}>
        <button
          onClick={toggleThemeSelector}
          className={`w-15 h-15 bg-[var(--button-bg)] backdrop-blur-md rounded-2xl shadow-lg border border-[var(--sidebar-border)] focus:outline-none flex items-center justify-center hover:bg-[var(--button-hover)] transition-colors ${
            isThemeSelectorOpen ? 'bg-[var(--button-hover)]' : ''
          }`}
          title={isThemeSelectorOpen ? "Close Theme Settings" : "Open Theme Settings"}
        >
          🎨
        </button>
        
        {isThemeSelectorOpen && (
          <div className="absolute top-1.5 right-15 bg-[var(--button-bg)] backdrop-blur-md p-2 rounded-2xl shadow-lg border border-[var(--sidebar-border)] flex gap-2">
            {(Object.keys(themeColours) as Theme[]).map((t) => (
              <button
                key={t}
                onClick={() => {
                  setTheme(t);
                  setIsThemeSelectorOpen(false);
                }}
                title={t.charAt(0).toUpperCase() + t.slice(1)}
                className={`w-8 h-8 rounded-full focus:outline-none flex items-center justify-center border-2 ${
                  theme === t ? "border-blue-500" : "border-transparent"
                }`}
                style={{ backgroundColor: themeColours[t] }}
              >
                {theme === t && (
                  <span className="text-white font-bold text-sm">✓</span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

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
      
      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          className="w-15 h-15 bg-yellow-500/90 hover:bg-yellow-700/90 text-white rounded-4xl shadow-lg transition-colors border border-[var(--sidebar-border)] flex items-center justify-center"
          onClick={onDeleteLastWaypoint}
          title="Delete Last Waypoint"
        >
          🗑️
        </button>
        <button
          className="w-15 h-15 bg-red-600/90 hover:bg-red-700/90 text-white rounded-4xl shadow-lg transition-colors border border-[var(--sidebar-border)] flex items-center justify-center"
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
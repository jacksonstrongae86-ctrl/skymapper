import React, { useState, useEffect, useRef } from 'react';
import { MapControlsProps } from '../../utils/types';
import { useTheme, Theme, themeColours} from '../../utils/ThemeContext';
import {
  Palette,
  Layers,
  Trash2,
  XCircle,
  Check,
  Map,
  Satellite,
  Globe,
  Mountain,
} from 'lucide-react';

const MapControls: React.FC<MapControlsProps> = ({
  mapType,
  setMapType,
  onDeleteLastWaypoint,
  onClearWaypoints,
}) => {
  const { theme, setTheme } = useTheme();
  const [isThemeSelectorOpen, setIsThemeSelectorOpen] = useState(false);
  const [isMapSelectorOpen, setIsMapSelectorOpen] = useState(false);
  const themeSelectorRef = useRef<HTMLDivElement>(null);
  const mapSelectorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        (!themeSelectorRef.current?.contains(event.target as Node) && isThemeSelectorOpen) ||
        (!mapSelectorRef.current?.contains(event.target as Node) && isMapSelectorOpen)
      ) {
        setIsThemeSelectorOpen(false);
        setIsMapSelectorOpen(false);
      }
    };

    if (isThemeSelectorOpen || isMapSelectorOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isThemeSelectorOpen, isMapSelectorOpen]);

  const ButtonClass = `
    w-10 h-10
    ${`button-gradient-${theme}`}
    backdrop-blur-md
    rounded-xl
    shadow-lg
    border border-[var(--sidebar-border)]
    focus:outline-none
    flex items-center justify-center
    hover:opacity-90
    transition-all duration-200
  `;

  const MAP_TYPES = [
    { value: 'street', label: 'Street', icon: Map },
    { value: 'sat', label: 'Satellite', icon: Satellite },
    { value: 'hybrid', label: 'Hybrid', icon: Globe },
    { value: 'terrain', label: 'Terrain', icon: Mountain },
  ] as const;

  return (
    <div className="fixed right-4 top-4 z-50">
      <div className="grid grid-cols-2 gap-3">
        {/* Theme Selector */}
        <div className="relative" ref={themeSelectorRef}>
          <button
            onClick={() => {
              setIsThemeSelectorOpen(prev => !prev);
              setIsMapSelectorOpen(false);
            }}
            className={`${ButtonClass} ${isThemeSelectorOpen ? 'opacity-75' : ''}`}
            title="Theme Settings"
          >
            <Palette size={18} className="text-[var(--button-text)]" />
          </button>

          {isThemeSelectorOpen && (
            <div className={`
              absolute top-12 right-0
              ${`gradient-${theme}`}
              backdrop-blur-md p-3
              rounded-xl shadow-lg
              border border-[var(--sidebar-border)]
              grid grid-cols-3 gap-2
              min-w-[120px]
              z-50  
            `}>
              {(Object.keys(themeColours) as Theme[]).map((t) => (
                <button
                  key={t}
                  onClick={() => {
                    setTheme(t);
                    setIsThemeSelectorOpen(false);
                  }}
                  title={t.charAt(0).toUpperCase() + t.slice(1)}
                  className={`
                    w-8 h-8 rounded-lg
                    focus:outline-none
                    flex items-center justify-center
                    border-2 transition-all duration-200
                    ${theme === t ? "scale-110 shadow-md" : "opacity-70 hover:opacity-100"}
                  `}
                  style={{ backgroundColor: themeColours[t] }}
                >
                  {theme === t && <Check size={14} className="text-white" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Map Type Selector */}
        <div className="relative" ref={mapSelectorRef}>
          <button
            onClick={() => {
              setIsMapSelectorOpen(prev => !prev);
              setIsThemeSelectorOpen(false);
            }}
            className={`${ButtonClass} ${isMapSelectorOpen ? 'opacity-75' : ''}`}
            title="Map Type"
          >
            <Layers size={18} className="text-[var(--button-text)]" />
          </button>

          {isMapSelectorOpen && (
            <div className={`
              absolute top-12 right-0
              ${`gradient-${theme}`}
              backdrop-blur-md p-2
              rounded-xl shadow-lg
              border border-[var(--sidebar-border)]
              min-w-[140px]
              z-50
            `}>
              {MAP_TYPES.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => {
                    setMapType(value);
                    setIsMapSelectorOpen(false);
                  }}
                  className={`
                    w-full px-3 py-2
                    flex items-center gap-2
                    rounded-lg
                    transition-all duration-200
                    ${mapType === value
                      ? `${`button-gradient-${theme}`} text-[var(--button-text)]`
                      : 'hover:bg-[var(--button-hover)] text-[var(--sidebar-text)]'
                    }
                  `}
                  title={label}
                >
                  <Icon size={16} />
                  <span className="text-sm font-medium">{label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Delete Last Waypoint Button */}
        <button
          className={ButtonClass}
          onClick={onDeleteLastWaypoint}
          title="Delete Last Waypoint"
        >
          <Trash2 size={18} className="text-[var(--button-text)]" />
        </button>

        {/* Clear All Waypoints Button */}
        <button
          className={ButtonClass}
          onClick={onClearWaypoints}
          title="Clear All Waypoints"
        >
          <XCircle size={18} className="text-[var(--button-text)]" />
        </button>
      </div>
    </div>
  );
};

export default MapControls;

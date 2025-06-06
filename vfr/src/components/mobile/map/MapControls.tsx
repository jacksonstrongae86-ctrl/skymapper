import React, { useState, useEffect, useRef } from 'react';
import { MapControlsProps } from '../../../utils/types';
import { useTheme } from '../../../utils/ThemeContext';
import {
  Settings,
  Map,
  Satellite,
  Globe,
  Mountain,
  Trash2,
  XCircle,
} from 'lucide-react';

const MapControls: React.FC<MapControlsProps> = ({
  mapType,
  setMapType,
  onDeleteLastWaypoint,
  onClearWaypoints,
}) => {
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!dropdownRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const MAP_TYPES = [
    { value: 'street', label: 'Street', icon: Map },
    { value: 'sat', label: 'Satellite', icon: Satellite },
    { value: 'hybrid', label: 'Hybrid', icon: Globe },
    { value: 'terrain', label: 'Terrain', icon: Mountain },
  ] as const;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-8 h-8 rounded-lg
          ${`button-gradient-${theme}`}
          text-[var(--button-text)]
          hover:opacity-90
          transition-all duration-200
          flex items-center justify-center
        `}
      >
        <Settings size={14} />
      </button>

      {isOpen && (
        <div className={`
          absolute top-full right-0 mt-2
          ${`gradient-${theme}`}
          backdrop-blur-md
          rounded-lg shadow-lg
          border border-[var(--sidebar-border)]
          min-w-[180px]
          z-50
          overflow-hidden
        `}>
          {/* Map Types Section */}
          <div className="p-2 space-y-1">
            <div className="text-xs text-[var(--text-muted)] px-2 pb-1">Map Type</div>
            {MAP_TYPES.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                onClick={() => {
                  setMapType(value);
                }}
                className={`
                  w-full px-3 py-2
                  flex items-center gap-2
                  rounded-lg text-left
                  transition-all duration-200
                  ${mapType === value
                    ? `${`button-gradient-${theme}`} text-[var(--button-text)]`
                    : 'hover:bg-[var(--button-hover)] text-[var(--sidebar-text)]'
                  }
                `}
              >
                <Icon size={14} />
                <span className="text-sm">{label}</span>
              </button>
            ))}
          </div>

          {/* Actions Section */}
          <div className="border-t border-[var(--sidebar-border)] p-2 space-y-1">
            <div className="text-xs text-[var(--text-muted)] px-2 pb-1">Actions</div>
            <button
              onClick={() => {
                onDeleteLastWaypoint();
                setIsOpen(false);
              }}
              className="w-full px-3 py-2 flex items-center gap-2 rounded-lg hover:bg-[var(--button-hover)] text-[var(--sidebar-text)]"
            >
              <Trash2 size={14} />
              <span className="text-sm">Delete Last Waypoint</span>
            </button>
            <button
              onClick={() => {
                onClearWaypoints();
                setIsOpen(false);
              }}
              className="w-full px-3 py-2 flex items-center gap-2 rounded-lg hover:bg-[var(--button-hover)] text-[var(--sidebar-text)]"
            >
              <XCircle size={14} />
              <span className="text-sm">Clear All Waypoints</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapControls;

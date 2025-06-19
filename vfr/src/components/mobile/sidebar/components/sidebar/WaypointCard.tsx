import React, { useState, useEffect } from "react";
import { Waypoint, WaypointCardProps } from "@/src/utils/types";
import { useTheme } from "@/src/utils/ThemeContext";
import {
  MapPin,
  Plane,
  Gauge,
  Mountain,
  TrendingDown,
  Zap,
  Navigation,
  PlaneTakeoff,
  MoveUp,
  MoveDown,
  PlaneLanding,
} from "lucide-react";

export const WaypointCard: React.FC<WaypointCardProps> = ({
  waypoint,
  absoluteIndex,
  visibleIndex,
  onWaypointUpdate,
}) => {
  const { theme } = useTheme();
  const isSpecial = waypoint.type !== "waypoint";

  // Local state for input display values
  const [displayValues, setDisplayValues] = useState({
    altitude: waypoint.altitude === 0 ? '' : waypoint.altitude.toString(),
    ias: waypoint.ias === 0 ? '' : waypoint.ias.toString(),
    altitudeChange: waypoint.altitudeChange === 0 ? '' : waypoint.altitudeChange?.toString() || '',
    rocRod: waypoint.rocRod === 0 ? '' : waypoint.rocRod?.toString() || '',
    iasClimbDescent: waypoint.iasClimbDescent === 0 ? '' : waypoint.iasClimbDescent?.toString() || '',
  });

  // Update display values when waypoint changes from external source
  useEffect(() => {
    setDisplayValues({
      altitude: waypoint.altitude === 0 ? '' : waypoint.altitude.toString(),
      ias: waypoint.ias === 0 ? '' : waypoint.ias.toString(),
      altitudeChange: waypoint.altitudeChange === 0 ? '' : waypoint.altitudeChange?.toString() || '',
      rocRod: waypoint.rocRod === 0 ? '' : waypoint.rocRod?.toString() || '',
      iasClimbDescent: waypoint.iasClimbDescent === 0 ? '' : waypoint.iasClimbDescent?.toString() || '',
    });
  }, [waypoint]);

  // Enhanced input handler that manages display state
  const handleInputChange = (
    field: keyof typeof displayValues,
    value: string,
    waypointField: keyof Waypoint
  ) => {
    // Update display value immediately
    setDisplayValues(prev => ({ ...prev, [field]: value }));

    // Handle the actual waypoint update
    if (value === '') {
      onWaypointUpdate(absoluteIndex, waypointField, 0);
    } else {
      const num = parseFloat(value);
      if (!isNaN(num)) {
        onWaypointUpdate(absoluteIndex, waypointField, num);
      }
    }
  };

  const inputClassName = `
    w-full mt-1 p-2
    border border-[var(--sidebar-border)]
    rounded-lg
    bg-[var(--sidebar-bg)]
    text-[var(--sidebar-text)]
    focus:ring-2 focus:ring-[var(--button-bg)]
    focus:outline-none
    transition-all duration-200
  `;

  const labelClassName =
    "block mb-3 text-sm font-medium text-[var(--sidebar-text)]";

  const iconClassName = "text-[var(--sidebar-text)] opacity-70";

  const typeOptions = [
    { value: "waypoint", label: "Normal Waypoint", icon: Navigation },
    { value: "BOC", label: "BOC (Bottom of Climb)", icon: PlaneTakeoff },
    { value: "TOC", label: "TOC (Top of Climb)", icon: MoveUp },
    { value: "TOD", label: "TOD (Top of Descent)", icon: MoveDown },
    { value: "BOD", label: "BOD (Bottom of Descent)", icon: PlaneLanding },
  ] as const;

  return (
    <div
      className={`
      ${`gradient-${theme}`}
      p-4 rounded-xl
      shadow-lg
      border border-[var(--sidebar-border)]
      transition-all duration-200
    `}
    >
      <h3 className="text-base font-bold text-[var(--sidebar-text)] mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin size={16} className={iconClassName} />
          <span>Waypoint {visibleIndex + 1}</span>
        </div>
        <span
          className={`
          text-xs px-2 py-1 rounded-full
          ${`button-gradient-${theme}`}
          text-[var(--button-text)]
        `}
        >
          {waypoint.type === "waypoint" ? "Normal" : waypoint.type}
        </span>
      </h3>

      {/* Altitude Input */}
      <label className={labelClassName}>
        <div className="flex items-center gap-2 mb-1">
          <Mountain size={16} className={iconClassName} />
          <span>Altitude (ft):</span>
        </div>
        <input
          type="number"
          className={inputClassName}
          value={displayValues.altitude}
          onChange={(e) =>
            handleInputChange('altitude', e.target.value, 'altitude')
          }
          placeholder="Enter altitude..."
        />
      </label>

      {/* Type Select */}
      <label className={labelClassName}>
        <div className="flex items-center gap-2 mb-1">
          <Plane size={16} className={iconClassName} />
          <span>Type:</span>
        </div>
        <select
          className={inputClassName}
          value={waypoint.type}
          onChange={(e) =>
            onWaypointUpdate(
              absoluteIndex,
              "type",
              e.target.value as Waypoint["type"]
            )
          }
        >
          {typeOptions.map(({ value, label, icon: Icon }) => (
            <option
              key={value}
              value={value}
              className="flex items-center gap-2"
            >
              <Icon size={14} className="inline-block mr-2" /> {label}
            </option>
          ))}
        </select>
      </label>

      {/* IAS Input */}
      <label className={labelClassName}>
        <div className="flex items-center gap-2 mb-1">
          <Gauge size={16} className={iconClassName} />
          <span>IAS (kt):</span>
        </div>
        <input
          type="number"
          className={inputClassName}
          value={displayValues.ias}
          onChange={(e) =>
            handleInputChange('ias', e.target.value, 'ias')
          }
          placeholder="Enter IAS..."
        />
      </label>

      {/* Special Fields */}
      {isSpecial && (
        <div
          className={`
          mt-4 pt-4
          border-t border-[var(--sidebar-border)]
          space-y-3
        `}
        >
          {/* Altitude Change */}
          <label className={labelClassName}>
            <div className="flex items-center gap-2 mb-1">
              <TrendingDown size={16} className={iconClassName} />
              <span>Altitude Change (ft):</span>
            </div>
            <input
              type="number"
              className={inputClassName}
              value={displayValues.altitudeChange}
              onChange={(e) =>
                handleInputChange('altitudeChange', e.target.value, 'altitudeChange')
              }
              placeholder="Enter altitude change..."
            />
          </label>

          {/* ROC/ROD Input */}
          <label className={labelClassName}>
            <div className="flex items-center gap-2 mb-1">
              <TrendingDown size={16} className={iconClassName} />
              <span>ROC/ROD (ft/min):</span>
            </div>
            <input
              type="number"
              className={inputClassName}
              value={displayValues.rocRod}
              onChange={(e) =>
                handleInputChange('rocRod', e.target.value, 'rocRod')
              }
              placeholder="Enter rate..."
            />
          </label>

          {/* IAS in Climb/Descent */}
          <label className={labelClassName}>
            <div className="flex items-center gap-2 mb-1">
              <Zap size={16} className={iconClassName} />
              <span>IAS in Climb/Descent:</span>
            </div>
            <input
              type="number"
              className={inputClassName}
              value={displayValues.iasClimbDescent}
              onChange={(e) =>
                handleInputChange('iasClimbDescent', e.target.value, 'iasClimbDescent')
              }
              placeholder="Enter IAS..."
            />
          </label>
        </div>
      )}
    </div>
  );
};

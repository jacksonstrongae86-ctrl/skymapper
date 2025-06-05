import React from 'react';
import { Waypoint, WaypointCardProps } from '@/src/utils/types';
import { useTheme } from '@/src/utils/ThemeContext';

export const WaypointCard: React.FC<WaypointCardProps> = ({
  waypoint,
  absoluteIndex,
  visibleIndex,
  onWaypointUpdate,
  handleNumericInput,
}) => {
  const { theme } = useTheme();
  const isSpecial = waypoint.type !== "waypoint";

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

  const labelClassName = "block mb-3 text-sm font-medium text-[var(--sidebar-text)]";

  return (
    <div className={`
      ${`gradient-${theme}`}
      p-4 rounded-xl
      shadow-lg
      border border-[var(--sidebar-border)]
      transition-all duration-200
    `}>
      <h3 className="text-base font-bold text-[var(--sidebar-text)] mb-4 flex items-center justify-between">
        <span>Waypoint {visibleIndex + 1}</span>
        <span className={`
          text-xs px-2 py-1 rounded-full
          ${`button-gradient-${theme}`}
          text-[var(--button-text)]
        `}>
          {waypoint.type === "waypoint" ? "Normal" : waypoint.type}
        </span>
      </h3>

      {/* Altitude Input */}
      <label className={labelClassName}>
        🎯 Altitude (ft):
        <input
          type="number"
          className={inputClassName}
          value={waypoint.altitude}
          onChange={(e) =>
            handleNumericInput(e.target.value, (num) =>
              onWaypointUpdate(absoluteIndex, "altitude", num)
            )
          }
          placeholder="Enter altitude..."
        />
      </label>

      {/* Type Select */}
      <label className={labelClassName}>
        ✈️ Type:
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
          <option value="waypoint">🛩️ Normal Waypoint</option>
          <option value="BOC">🚀 BOC (Bottom of Climb)</option>
          <option value="TOC">⬆️ TOC (Top of Climb)</option>
          <option value="TOD">⬇️ TOD (Top of Descent)</option>
          <option value="BOD">🛬 BOD (Bottom of Descent)</option>
        </select>
      </label>

      {/* IAS Input */}
      <label className={labelClassName}>
        💨 IAS (kt):
        <input
          type="number"
          className={inputClassName}
          value={waypoint.ias}
          onChange={(e) =>
            handleNumericInput(e.target.value, (num) =>
              onWaypointUpdate(absoluteIndex, "ias", num)
            )
          }
          placeholder="Enter IAS..."
        />
      </label>

      {/* Special Fields */}
      {isSpecial && (
        <div className={`
          mt-4 pt-4
          border-t border-[var(--sidebar-border)]
          space-y-3
        `}>
          {/* Altitude Change */}
          <label className={labelClassName}>
            🗻 Altitude Change (ft):
            <input
              type="number"
              className={inputClassName}
              value={waypoint.altitudeChange}
              onChange={(e) =>
                handleNumericInput(e.target.value, (num) =>
                  onWaypointUpdate(absoluteIndex, "altitudeChange", num)
                )
              }
              placeholder="Enter altitude change..."
            />
          </label>

          {/* ROC/ROD Input */}
          <label className={labelClassName}>
            📉 ROC/ROD (ft/min):
            <input
              type="number"
              className={inputClassName}
              value={waypoint.rocRod}
              onChange={(e) =>
                handleNumericInput(e.target.value, (num) =>
                  onWaypointUpdate(absoluteIndex, "rocRod", num)
                )
              }
              placeholder="Enter rate..."
            />
          </label>

          {/* IAS in Climb/Descent */}
          <label className={labelClassName}>
            ⚡ IAS in Climb/Descent:
            <input
              type="number"
              className={inputClassName}
              value={waypoint.iasClimbDescent}
              onChange={(e) =>
                handleNumericInput(e.target.value, (num) =>
                  onWaypointUpdate(absoluteIndex, "iasClimbDescent", num)
                )
              }
              placeholder="Enter IAS..."
            />
          </label>
        </div>
      )}
    </div>
  );
};

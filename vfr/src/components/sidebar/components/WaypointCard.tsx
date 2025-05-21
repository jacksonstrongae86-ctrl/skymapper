import React from 'react';
import { Waypoint, WaypointCardProps } from '@/src/utils/types';

export const WaypointCard: React.FC<WaypointCardProps> = ({
  waypoint,
  absoluteIndex,
  visibleIndex,
  onWaypointUpdate,
  handleNumericInput,
}) => {
  const isSpecial = waypoint.type !== "waypoint";

  return (
    <div className="bg-gray-100 p-4 rounded-xl shadow-md">
      <h3 className="text-base font-semibold text-gray-700 mb-2">
        Waypoint {visibleIndex + 1}
      </h3>

      {/* Altitude Input */}
      <label className="block mb-2 text-sm font-medium text-gray-600">
        Altitude (ft) (Optional):
        <input
          type="number"
          className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-300 focus:outline-none"
          value={waypoint.altitude}
          onChange={(e) =>
            handleNumericInput(e.target.value, (num) =>
              onWaypointUpdate(absoluteIndex, "altitude", num)
            )
          }
        />
      </label>

      {/* Type Select */}
      <label className="block mb-2 text-sm font-medium text-gray-600">
        ✈️ Type:
        <select
          className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-300 focus:outline-none"
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
      <label className="block mb-2 text-sm font-medium text-gray-600">
        💨 IAS (kt):
        <input
          type="number"
          className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-300 focus:outline-none"
          value={waypoint.ias}
          onChange={(e) =>
            handleNumericInput(e.target.value, (num) =>
              onWaypointUpdate(absoluteIndex, "ias", num)
            )
          }
        />
      </label>

      {/* Special Fields */}
      {isSpecial && (
        <>
          {/* Altitude Change */}
          <label className="block mb-2 text-sm font-medium text-gray-600">
            🗻 Altitude Change (ft):
            <input
              type="number"
              className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-300 focus:outline-none"
              value={waypoint.altitudeChange}
              onChange={(e) =>
                handleNumericInput(e.target.value, (num) =>
                  onWaypointUpdate(absoluteIndex, "altitudeChange", num)
                )
              }
            />
          </label>

          {/* ROC/ROD Input */}
          <label className="block mb-2 text-sm font-medium text-gray-600">
            📉 ROC/ROD (ft/min):
            <input
              type="number"
              className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-300 focus:outline-none"
              value={waypoint.rocRod}
              onChange={(e) =>
                handleNumericInput(e.target.value, (num) =>
                  onWaypointUpdate(absoluteIndex, "rocRod", num)
                )
              }
            />
          </label>

          {/* IAS in Climb/Descent */}
          <label className="block mb-2 text-sm font-medium text-gray-600">
            ⚡ IAS in Climb/Descent:
            <input
              type="number"
              className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-300 focus:outline-none"
              value={waypoint.iasClimbDescent}
              onChange={(e) =>
                handleNumericInput(e.target.value, (num) =>
                  onWaypointUpdate(absoluteIndex, "iasClimbDescent", num)
                )
              }
            />
          </label>
        </>
      )}
    </div>
  );
};

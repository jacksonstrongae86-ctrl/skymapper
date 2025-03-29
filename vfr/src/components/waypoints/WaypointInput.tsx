import React from 'react';
import { WaypointInputProps } from '../../utils/types';

const WaypointInput: React.FC<WaypointInputProps> = ({
  index,
  type,
  altitude,
  ias,
  altitudeChange,
  rocRod,
  iasClimbDescent,
  onTypeChange,
  onAltitudeChange,
  onIasChange,
  onAltitudeChangeChange,
  onRocRodChange,
  onIasClimbDescentChange,
}) => {
  const isSpecial = type !== 'waypoint';

  return (
    <div className="bg-gray-100 p-4 rounded-lg shadow-md mb-4">
      <h3 className="text-lg font-semibold text-gray-700 mb-2">Waypoint {index}</h3>

      <label className="block mb-2 text-sm font-medium text-gray-600">
        Altitude (ft) (Optional):
        <input
          type="number"
          className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-300 focus:outline-none"
          value={altitude}
          onChange={(e) => onAltitudeChange(e.target.value)}
        />
      </label>

      <label className="block mb-2 text-sm font-medium text-gray-600">
        ✈️ Type:
        <select
          className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-300 focus:outline-none"
          value={type}
          onChange={(e) => onTypeChange(e.target.value as WaypointInputProps['type'])}
        >
          <option value="waypoint">🛩️ Normal Waypoint</option>
          <option value="BOC">🚀 BOC (Bottom of Climb)</option>
          <option value="TOC">⬆️ TOC (Top of Climb)</option>
          <option value="TOD">⬇️ TOD (Top of Descent)</option>
          <option value="BOD">🛬 BOD (Bottom of Descent)</option>
        </select>
      </label>

      <label className="block mb-2 text-sm font-medium text-gray-600">
        💨 IAS (kt):
        <input
          type="number"
          className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-300 focus:outline-none"
          value={ias}
          onChange={(e) => onIasChange(e.target.value)}
        />
      </label>

      {isSpecial && (
        <>
          <label className="block mb-2 text-sm font-medium text-gray-600">
            🗻 Altitude Change (ft):
            <input
              type="number"
              className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-300 focus:outline-none"
              value={altitudeChange}
              onChange={(e) => onAltitudeChangeChange(e.target.value)}
            />
          </label>

          <label className="block mb-2 text-sm font-medium text-gray-600">
            📉 ROC/ROD (ft/min):
            <input
              type="number"
              className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-300 focus:outline-none"
              value={rocRod}
              onChange={(e) => onRocRodChange(e.target.value)}
            />
          </label>

          <label className="block mb-2 text-sm font-medium text-gray-600">
            ⚡ IAS in Climb/Descent:
            <input
              type="number"
              className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-300 focus:outline-none"
              value={iasClimbDescent}
              onChange={(e) => onIasClimbDescentChange(e.target.value)}
            />
          </label>
        </>
      )}
    </div>
  );
};

export default WaypointInput;

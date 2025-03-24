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
  onIasClimbDescentChange
}) => {
  const isSpecial = type !== "waypoint";

  return (
    <div className="waypoint-input-container">
      <label>Altitude (ft) (Optional):
        <input
          type="number"
          id={`waypoint-altitude-${index}`}
          placeholder="Enter altitude"
          className="styled-input"
          value={altitude}
          onChange={(e) => onAltitudeChange(e.target.value)}
        />
      </label>

      <label>✈️ Waypoint {index} Type:
        <select
          id={`waypoint-type-${index}`}
          className="styled-select"
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

      <label>💨 IAS (kt):
        <input
          type="number"
          id={`waypoint-ias-${index}`}
          placeholder="Enter IAS"
          className="styled-input"
          value={ias}
          onChange={(e) => onIasChange(e.target.value)}
        />
      </label>

      {isSpecial && (
        <>
          <label>🗻 Altitude Change (ft):
            <input
              type="number"
              id={`waypoint-altchange-${index}`}
              placeholder="Enter altitude change"
              className="styled-input"
              value={altitudeChange}
              onChange={(e) => onAltitudeChangeChange(e.target.value)}
            />
          </label>

          <label>📉 ROC/ROD (ft/min):
            <input
              type="number"
              id={`waypoint-rocrod-${index}`}
              placeholder="Enter ROC/ROD"
              className="styled-input"
              value={rocRod}
              onChange={(e) => onRocRodChange(e.target.value)}
            />
          </label>

          <label>⚡ IAS in Climb/Descent:
            <input
              type="number"
              id={`ias-climb-descent-${index}`}
              placeholder="Enter IAS for Climb/Descent"
              className="styled-input"
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

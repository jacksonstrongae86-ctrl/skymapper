import React from 'react';
import { MapControlsProps } from '../../utils/types';

const MapControls: React.FC<MapControlsProps> = ({
  mapType,
  setMapType,
  onDeleteLastWaypoint,
  onClearWaypoints,
}) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-md space-y-4">
      <select
        className="w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-300 focus:outline-none"
        value={mapType}
        onChange={(e) => setMapType(e.target.value)}
      >
        <option value="street">🗺️ Street</option>
        <option value="sat">🛰️ Satellite</option>
        <option value="hybrid">🛰️🗺️ Hybrid</option>
        <option value="terrain">⛰️ Terrain</option>
      </select>

      <button
        className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-md"
        onClick={onDeleteLastWaypoint}
      >
        🗑️ Delete Last
      </button>

      <button
        className="w-full bg-yellow-600 hover:bg-yellow-700 text-white py-2 rounded-md"
        onClick={onClearWaypoints}
      >
        🧹 Clear Waypoints
      </button>
    </div>
  );
};

export default MapControls;

import React from 'react';
import { MapControlsProps } from '../../utils/types';

const MapControls: React.FC<MapControlsProps> = ({
  sidebarActive,
  setSidebarActive,
  mapType,
  setMapType,
  onDeleteLastWaypoint,
  onClearWaypoints
}) => {
  return (
    <>
      <select
        id="mapType"
        className="map-control map-select"
        value={mapType}
        onChange={(e) => setMapType(e.target.value)}
      >
        <option value="street">🗺️ Street</option>
        <option value="sat">🛰️ Satellite</option>
        <option value="hybrid">🗺️ Hybrid</option>
        <option value="terrain">⛰️ Terrain</option>
      </select>

      <button
        id="deleteWaypoint"
        className="map-control delete-waypoint"
        onClick={onDeleteLastWaypoint}
      >
        🗑️ Delete Last
      </button>

      <button
        id="clearWaypoints"
        className="map-control clear-waypoints"
        onClick={onClearWaypoints}
      >
        🧹Clear Waypoints
      </button>

      <button
        id="openSidebar"
        className={`map-control open-sidebar ${!sidebarActive ? 'hidden' : ''}`}
        onClick={() => setSidebarActive(false)}
      >
        📂 Open Sidebar
      </button>
    </>
  );
};

export default MapControls;

import React from 'react';
import { MapControlsProps } from '../../utils/types';

const MapControls: React.FC<MapControlsProps> = ({
  mapType,
  setMapType,
  onDeleteLastWaypoint,
  onClearWaypoints,
}) => {
  return (
    <div className="fixed right-4 flex flex-col gap-2">
      {/* Map Type Selector - Floating style */}
      <div className="bg-slate-800/90 backdrop-blur-md p-2 rounded-2xl shadow-lg 
        hover:shadow-xl transition-all duration-300 border border-slate-700/50">
        <select
          className="w-28 px-2.5 py-2.5 text-sm font-bold items-center justify-center bg-slate-700/50 text-white 
          border border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500/30 
          focus:outline-none hover:bg-slate-600/50 transition-all appearance-none cursor-pointer"
          value={mapType}
          onChange={(e) => setMapType(e.target.value)}
        >
          <option value="street">🗺️ Street</option>
          <option value="sat">🛰️ Satellite</option>
          <option value="hybrid">🌍 Hybrid</option>
          <option value="terrain">⛰️ Terrain</option>
        </select>
      </div>

      {/* Action Buttons - Floating style */}
      <div className="flex gap-2">
        <button
          className="w-15 h-15 bg-slate-800/90 text-white rounded-2xl shadow-lg
          transition-all duration-300 hover:shadow-xl hover:scale-105 
          hover:bg-rose-900/90 active:bg-rose-800/90 
          flex items-center justify-center border border-slate-700/50"
          onClick={onDeleteLastWaypoint}
          title="Delete Last Waypoint"
        >
          🗑️
        </button>

        <button
          className="w-15 h-15 bg-slate-800/90 text-white rounded-2xl shadow-lg
          transition-all duration-300 hover:shadow-xl hover:scale-105 
          hover:bg-amber-900/90 active:bg-amber-800/90
          flex items-center justify-center border border-slate-700/50"
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

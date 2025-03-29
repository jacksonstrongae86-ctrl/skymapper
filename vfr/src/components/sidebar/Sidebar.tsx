import React from 'react';
import { SidebarProps } from '../../utils/types';

const Sidebar: React.FC<SidebarProps> = ({
  sidebarActive,
  setSidebarActive,
  fuelConsumption,
  setFuelConsumption,
  selectedDateTime,
  setSelectedDateTime,
  fetchWindData,
  updateCalculations,
  results,
}) => {
  return (
    <div className={`bg-gray-800 text-white p-6 h-full ${sidebarActive ? 'block' : 'hidden'} md:block`}>
      <button
        className="text-sm text-gray-300 hover:text-white mb-4"
        onClick={() => setSidebarActive(false)}
      >
        ❌ Close
      </button>
      <h1 className="text-2xl font-bold mb-4">VFR Flight Planner</h1>
      <p className="text-sm text-gray-300 mb-6">
        Click on the map to add waypoints. Drag markers to adjust positions. Set a TAS for each leg.
      </p>

      <form className="space-y-4">
        <label className="block text-sm font-medium">
          Fuel Consumption (Gal/hr):
          <input
            type="number"
            className="w-full mt-1 p-2 border border-gray-600 rounded-md bg-gray-700 text-white focus:ring focus:ring-blue-300 focus:outline-none"
            value={fuelConsumption}
            onChange={(e) => setFuelConsumption(parseFloat(e.target.value))}
          />
        </label>

        <label className="block text-sm font-medium">
          Select Date and Time:
          <input
            type="datetime-local"
            className="w-full mt-1 p-2 border border-gray-600 rounded-md bg-gray-700 text-white focus:ring focus:ring-blue-300 focus:outline-none"
            value={selectedDateTime}
            onChange={(e) => setSelectedDateTime(e.target.value)}
          />
        </label>

        <button
          type="button"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md"
          onClick={fetchWindData}
        >
          Fetch Wind Data
        </button>
      </form>

      <button
        type="button"
        className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-md mt-4"
        onClick={updateCalculations}
      >
        Update Info 🔄
      </button>

      <div className="mt-6">
        <h2 className="text-lg font-semibold mb-2">Results</h2>
        <table className="w-full text-sm text-left text-gray-300">
          <thead className="text-gray-400 uppercase bg-gray-700">
            <tr>
              <th>#</th>
              <th>Distance (NM)</th>
              <th>Track (°)</th>
              <th>Heading (°)</th>
              <th>GS (knots)</th>
              <th>Time (min)</th>
              <th>TAS (knots)</th>
              <th>Fuel</th>
              <th>Wind</th>
            </tr>
          </thead>
          <tbody>{results}</tbody>
        </table>
      </div>

      <button
        className="w-full bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-md mt-4"
        onClick={() => window.print()}
      >
        Print Results 🖨️
      </button>
    </div>
  );
};

export default Sidebar;

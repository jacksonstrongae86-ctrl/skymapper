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
  results
}) => {
  return (
    <div id="sidebar" className={`sidebar ${sidebarActive ? 'active' : ''}`}>
      <button id="closeButton" onClick={() => setSidebarActive(true)}>❌ Close</button>
      <h1>VFR Flight Planner</h1>
      <p>Click on the map to add waypoints. Drag markers to adjust positions. Set a TAS for each leg. This tool is completely free for everyone but if you want to give a token of appreciation to its creator you count with a donation button on the lower right side of your screen. Thank you all!</p>

      <form id="flightForm">
        <label>Fuel Consumption (Gal/hr)
          <input
            type="number"
            id="fuelConsumption"
            value={fuelConsumption}
            onChange={(e) => setFuelConsumption(parseFloat(e.target.value))}
          />
        </label>
        <div id="date-time-container">
          <label htmlFor="datetime" className="styled-label">Select Date and Time:</label>
          <input
            type="datetime-local"
            id="datetime"
            className="styled-input"
            value={selectedDateTime}
            onChange={(e) => setSelectedDateTime(e.target.value)}
          />
        </div>
        <button type="button" id="fetchWind" onClick={fetchWindData}>Fetch Wind Data</button>
      </form>

      <button type="button" id="updateInfo" onClick={updateCalculations}>Update Info 🔄</button>

      <div id="results">
        <h2>Results</h2>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Distance (NM)</th>
              <th>Track (°)</th>
              <th>Heading (°)</th>
              <th>GS (knots)</th>
              <th>Time (min)</th>
              <th>TAS (knots)</th>
              <th>Fuel Consumption</th>
              <th>Wind</th>
            </tr>
          </thead>
          <tbody id="output">
            {results}
          </tbody>
        </table>
      </div>
      <button id="printOutput" onClick={() => window.print()}>Print Results 🖨️</button>
    </div>
  );
};

export default Sidebar;

import React, { useState, useEffect, JSX } from 'react';
import {
  IAStoTAS,
  getDistance,
  getBearing,
  getHeading,
  getGroundSpeed,
} from "../../utils/logic";
import { Waypoint, WindDataArray } from "../../utils/types";

interface BottomSidebarProps {
  waypoints: Waypoint[];
  storedWindData: WindDataArray | null;
  fuelConsumption: number;
  sidebarWidth: number;
  isMinimized: boolean;
  isFullScreen: boolean;
  onHeightChange?: (height: number) => void;
}

const BottomSidebar: React.FC<BottomSidebarProps> = ({
  waypoints,
  storedWindData,
  fuelConsumption,
  sidebarWidth,
  isMinimized,
  isFullScreen,
  onHeightChange
}) => {
  const [isBottomMinimized, setIsBottomMinimized] = React.useState(false);
  const [height, setHeight] = React.useState(25);
  const [isResizing, setIsResizing] = React.useState(false);
  const [results, setResults] = useState<JSX.Element[]>([]);

  useEffect(() => {
    if (waypoints.length < 2 || !storedWindData) {
      setResults([]);
      return;
    }

    const newResults = waypoints.slice(0, -1).map((wp, i) => {
      const nextWp = waypoints[i + 1];
      const distance = getDistance(
        { lat: wp.position[0], lng: wp.position[1] },
        { lat: nextWp.position[0], lng: nextWp.position[1] }
      );
      const track = getBearing(
        { lat: wp.position[0], lng: wp.position[1] },
        { lat: nextWp.position[0], lng: nextWp.position[1] }
      );

      const windInfo = storedWindData[i] || { speed: 0, direction: 0 };
      const tas = IAStoTAS(wp.ias, wp.altitude / 100);
      const heading = getHeading(
        track,
        tas,
        windInfo.direction,
        windInfo.speed
      );
      const gs = getGroundSpeed(track, tas, windInfo.direction, windInfo.speed);
      const time = (distance / gs) * 60;
      const fuelBurn = (time / 60) * fuelConsumption;

      return (
        <tr
          key={i}
          className={`
            transition-colors duration-150 
            ${i % 2 === 0 ? 'bg-[var(--results-bg2)]' : 'bg-[var(--results-bg1)]'} 
            hover:bg-[var(--results-hover)]
          `}
        >
          <td className="py-3 px-4 border-b border-slate-700/50 font-semibold text-[var(--results-text)]">
            {`WP${i + 1} → WP${i + 2}`}
          </td>
          <td className="py-3 px-4 border-b border-slate-700/50">{distance.toFixed(1)}</td>
          <td className="py-3 px-4 border-b border-slate-700/50">{track.toFixed(0)}</td>
          <td className="py-3 px-4 border-b border-slate-700/50">{heading.toFixed(0)}</td>
          <td className="py-3 px-4 border-b border-slate-700/50">{gs.toFixed(0)}</td>
          <td className="py-3 px-4 border-b border-slate-700/50">{time.toFixed(1)}</td>
          <td className="py-3 px-4 border-b border-slate-700/50">{tas.toFixed(0)}</td>
          <td className="py-3 px-4 border-b border-slate-700/50">{fuelBurn.toFixed(1)}</td>
          <td className="py-3 px-4 border-b border-slate-700/50">
            {`${windInfo.speed.toFixed(1)} kt @ ${windInfo.direction.toFixed(0)}°`}
          </td>
        </tr>
      );
    });

    setResults(newResults);
  }, [waypoints, storedWindData, fuelConsumption]);

  const handleMinimizeMaximize = () => {
    const newHeight = isBottomMinimized ? 25 : 7;
    setHeight(newHeight);
    onHeightChange?.(newHeight);
    setIsBottomMinimized(!isBottomMinimized);
  };

  const handleFullScreen = () => {
    const newHeight = height >= 90 ? 25 : 100;
    setHeight(newHeight);
    onHeightChange?.(newHeight);
  };

  const handleMouseDown = () => {
    setIsResizing(true);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isResizing) {
      const windowHeight = window.innerHeight;
      const fromBottom = windowHeight - e.clientY;
      const percentage = (fromBottom / windowHeight) * 100;
      // Limit height between 10% and 75%
      const newHeight = Math.min(75, Math.max(10, percentage));
      setHeight(newHeight);
      onHeightChange?.(newHeight);
    }
  };

  const handleMouseUp = () => {
    setIsResizing(false);
  };

  React.useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  const handlePrint = () => {
    // Store current scroll position
    const scrollPos = window.scrollY;
  
    // Calculate totals
    const totalDistance = results.reduce((acc, result) => 
      acc + parseFloat(result.props.children[1].props.children), 0);
    const totalTime = results.reduce((acc, result) => 
      acc + parseFloat(result.props.children[5].props.children), 0);
    const totalFuel = results.reduce((acc, result) => 
      acc + parseFloat(result.props.children[7].props.children), 0);
  
    // Create print container
    const printContent = document.createElement('div');
    printContent.className = 'print-content';
  
    // Create map page
    const mapElement = document.querySelector('.leaflet-container');
    if (mapElement) {
      const mapContainer = document.createElement('div');
      mapContainer.className = 'print-map';
      mapContainer.innerHTML = `
        <div class="print-header">Flight Plan Map</div>
        <div class="print-map-container">
          ${mapElement.outerHTML}
        </div>
      `;
      printContent.appendChild(mapContainer);
    }
  
    // Create results section
    const resultsSection = document.createElement('div');
    resultsSection.className = 'print-results';
    resultsSection.innerHTML = `
      <div class="print-header">Flight Plan Details</div>
      <div class="print-info">
        <div class="print-info-grid">
          <p><strong>Total Waypoints:</strong> ${waypoints.length}</p>
          <p><strong>Total Distance:</strong> ${totalDistance.toFixed(1)} NM</p>
          <p><strong>Total Time:</strong> ${totalTime.toFixed(1)} min</p>
          <p><strong>Total Fuel:</strong> ${totalFuel.toFixed(1)} gal</p>
          <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
          <p><strong>Fuel Consumption:</strong> ${fuelConsumption} gal/hr</p>
        </div>
      </div>
      <table class="print-table">
        <thead>
          <tr>
            <th>Leg</th>
            <th>Distance (NM)</th>
            <th>Track (°)</th>
            <th>Heading (°)</th>
            <th>Ground Speed (kt)</th>
            <th>Time (min)</th>
            <th>True Airspeed (kt)</th>
            <th>Fuel (gal)</th>
            <th>Wind</th>
          </tr>
        </thead>
        <tbody>
          ${results.map(result => 
            `<tr>
              ${result.props.children.map((child: { props: { children: any; }; }) => 
                `<td>${child.props.children}</td>`
              ).join('')}
            </tr>`
          ).join('\n')}
        </tbody>
      </table>
    `;
    printContent.appendChild(resultsSection);
  
    // Add to document temporarily
    document.body.appendChild(printContent);
  
    // Trigger print
    window.print();
  
    // Cleanup
    document.body.removeChild(printContent);
    window.scrollTo(0, scrollPos);
  };

  return (
    <div
      className="fixed bottom-0 text-[var(--results-text)] shadow-lg z-40 transition-all duration-300"
      style={{
        backgroundColor: "var(--background)", color: "var(--foreground)",
        left: isFullScreen ? '0' : (isMinimized ? '48px' : `${sidebarWidth}px`),
        width: isFullScreen ? '100%' : `calc(100% - ${sidebarWidth}px)`,
        height: `${height}%`
      }}
    >
      {!isBottomMinimized && (
        <div
          className="absolute top-0 left-0 right-0 h-2 z-40 group cursor-ns-resize flex items-center justify-center"
          onMouseDown={handleMouseDown}
        >
          <div className="w-full h-full bg-[var(--button-bg)] group-hover:bg-[var(--button-hover)] transition-colors duration-200"></div>
          <div className="absolute flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <div className="w-1 h-1 rounded-full bg-gray-400"></div>
            <div className="w-1 h-1 rounded-full bg-gray-400"></div>
            <div className="w-1 h-1 rounded-full bg-gray-400"></div>
          </div>
        </div>
      )}

      <div className="h-full overflow-auto custom-scrollbar">
        <div className="sticky top-0 z-10 bg-[var(--background)] p-4 border-b border-[var(--sidebar-border)]">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-[var(--foreground)]">Flight Results</h2>
              <span className="px-2 py-1 bg-[var(--background)] rounded-full text-sm font-medium">
                {waypoints.length > 1 ? waypoints.length - 1 : 0} legs
              </span>
            </div>
            <div className="flex items-center gap-2">
              {!isBottomMinimized && (
                <button
                  className="w-6 h-6 rounded-full bg-green-500 hover:bg-green-400 flex items-center justify-center text-gray-800 text-xs"
                  onClick={handleFullScreen}
                  title={height >= 90 ? "Exit Full Screen" : "Full Screen"}
                >
                  {height >= 90 ? "-" : "⌞ ⌝"}
                </button>
              )}
              {(height < 90) && (
                <button
                  className="w-6 h-6 rounded-full bg-yellow-500 hover:bg-yellow-400 flex items-center justify-center text-gray-800 text-xs"
                  onClick={handleMinimizeMaximize}
                  title={isBottomMinimized ? "Maximize" : "Minimize"}
                >
                  {isBottomMinimized ? "+" : "-"}
                </button>
              )}
              <button
                className="bg-[var(--button-bg)] hover:bg-[var(--button-hover)] text-[var(--sidebar-text)] py-2 px-4 rounded-md 
                transition-colors duration-200 flex items-center gap-2 hover:shadow-lg ml-2"
                onClick={handlePrint}
              >
                <span>Print</span>
                <span>🖨️</span>
              </button>
            </div>
          </div>
        </div>

        {!isBottomMinimized && (
          <div className="p-4">
            <table className="w-full">
              <thead className="bg-[var(--button-bg)] sticky top-18.5 z-10">
                <tr>
                  {[
                    ['#', '', '🔢'],
                    ['Distance', 'NM', '📏'],
                    ['Track', '°', '🧭'],
                    ['Heading', '°', '➡️'],
                    ['GS', 'knots', '⚡'],
                    ['Time', 'min', '⏱️'],
                    ['TAS', 'knots', '✈️'],
                    ['Fuel', 'gal', '⛽'],
                    ['Wind', '', '💨']
                  ].map(([label, unit, icon]) => (
                    <th
                      key={label}
                      className="py-3 px-4 text-left font-semibold first:rounded-tl-lg last:rounded-tr-lg whitespace-nowrap border-b border-[var(--sidebar-border)] text-[var(--results-text)]"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400">{icon}</span>
                        <div className="flex flex-col">
                          <span className="text-[var(--button-text)]">{label}</span>
                          {unit && <span className="text-xs text-slate-400">({unit})</span>}
                        </div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="text-[var(--results-text)]">
                {results}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default BottomSidebar;
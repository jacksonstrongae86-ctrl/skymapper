import React, { useState } from 'react';
import { SidebarProps } from '../../utils/types';

const Sidebar: React.FC<SidebarProps> = ({
  fuelConsumption,
  setFuelConsumption,
  selectedDateTime,
  setSelectedDateTime,
  fetchWindData,
  updateCalculations,
  results,
  waypoints,
  onWaypointUpdate,
}) => {
  const [sidebarWidth, setSidebarWidth] = useState(256); // Default width in pixels
  const [isResizing, setIsResizing] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);

  const handleMouseDown = () => {
    setIsResizing(true);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isResizing) {
      // Get the maximum width (50% of window width)
      const maxWidth = window.innerWidth * 0.5;
      // Set minimum width to 256px and maximum to 50% of screen width
      const newWidth = Math.min(maxWidth, Math.max(256, e.clientX));
      setSidebarWidth(newWidth);
    }
  };

  const handleMouseUp = () => {
    setIsResizing(false);
  };

  // Add handler for minimize/maximize
  const handleMinimizeMaximize = () => {
    if (isMinimized) {
      setSidebarWidth(256); // Return to default width
    } else {
      setSidebarWidth(48); // Minimize to show only icons
    }
    setIsMinimized(!isMinimized);
  };

  // Add handler for full screen toggle
  const handleFullScreen = () => {
    if (isFullScreen) {
      setSidebarWidth(256); // Return to default width
    } else {
      setSidebarWidth(window.innerWidth); // Set to full window width
    }
    setIsFullScreen(!isFullScreen);
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

  const handleNumericInput = (value: string, callback: (num: number) => void) => {
    const num = parseFloat(value);
    if (!isNaN(num)) {
      callback(num);
    }
  };

  return (
    <div
      className={`bg-slate-900 text-white transition-all duration-300 md:translate-x-0 md:block fixed ${
        isFullScreen ? 'inset-0' : 'top-0 left-0 h-full'
      } z-50 flex`}
      style={{ 
        width: `${sidebarWidth}px`,
        minWidth: isMinimized ? '48px' : '256px'
      }}
    >
      {isMinimized ? (
        // Minimized tab view
        <div className="flex flex-col h-full w-12 bg-slate-800 border-r border-slate-700">
          <div className="p-2 mb-2 border-b border-slate-700">
            <button
              className="w-8 h-8 rounded-full bg-yellow-500 hover:bg-yellow-400 flex items-center justify-center text-gray-800 text-xs"
              onClick={handleMinimizeMaximize}
              title="Maximize"
            >
              +
            </button>
          </div>
          <div className="flex flex-col items-center gap-4 p-2">
            <button
              className="w-8 h-8 rounded-lg bg-slate-700 hover:bg-slate-600 flex items-center justify-center text-white"
              title="Fuel Settings"
            >
              ⛽
            </button>
            <button
              className="w-8 h-8 rounded-lg bg-slate-700 hover:bg-slate-600 flex items-center justify-center text-white"
              title="Wind Data"
              onClick={fetchWindData}
            >
              💨
            </button>
            <button
              className="w-8 h-8 rounded-lg bg-slate-700 hover:bg-slate-600 flex items-center justify-center text-white"
              title="Update Calculations"
              onClick={updateCalculations}
            >
              🔄
            </button>
          </div>
        </div>
      ) : (
        // Regular sidebar content - Fix the height and overflow
        <div className="flex flex-col h-full">  {/* Add flex-col and h-full */}
          <div className="p-6 flex-none"> {/* Keep flex-none for header */}
            {/* Control buttons container */}
            <div className="absolute top-4 right-4 flex gap-2">
              <button
                className="w-6 h-6 rounded-full bg-green-500 hover:bg-green-400 flex items-center justify-center text-gray-800 text-xs"
                onClick={handleFullScreen}
                title={isFullScreen ? "Exit Full Screen" : "Full Screen"}
              >
                {isFullScreen ? "−" : "⌞ ⌝"}
              </button>
              {!isFullScreen && (
              <button
                className="w-6 h-6 rounded-full bg-yellow-500 hover:bg-yellow-400 flex items-center justify-center text-gray-800 text-xs"
                onClick={handleMinimizeMaximize}
                title="Minimize"
              >
                −
              </button>
              )}
            </div>

            {/* Only show content if not minimized */}
            {!isMinimized && (
              <>
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
                    className="w-full bg-cyan-700 hover:bg-cyan-800 text-white py-2 rounded-md"
                    onClick={fetchWindData}
                  >
                    Fetch Wind Data
                  </button>
                </form>

                <button
                  type="button"
                  className="w-full bg-green-700 hover:bg-green-800 text-white py-2 rounded-md mt-4"
                  onClick={updateCalculations}
                >
                  Update Info 🔄
                </button>
              </>
            )}
          </div>

          {/* Scrollable content area - Add grid layout and custom scrollbar */}
          <div className="flex-1 overflow-y-auto px-6 pr-8 custom-scrollbar"> {/* Added pr-8 for scrollbar spacing */}
            <div className={`${isFullScreen ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-4'}`}>
              <h2 className="text-xl font-bold mb-4 sticky top-0 bg-slate-900 py-2 z-10 col-span-full">
                Waypoints
              </h2>
              {waypoints.map((waypoint, index) => {
                const isSpecial = waypoint.type !== 'waypoint';
                return (
                  <div key={index} className="bg-gray-100 p-4 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Waypoint {index + 1}</h3>

                    <label className="block mb-2 text-sm font-medium text-gray-600">
                      Altitude (ft) (Optional):
                      <input
                        type="number"
                        className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-300 focus:outline-none"
                        value={waypoint.altitude}
                        onChange={(e) =>
                          handleNumericInput(e.target.value, (num) =>
                            onWaypointUpdate(index, 'altitude', num)
                          )
                        }
                      />
                    </label>

                    <label className="block mb-2 text-sm font-medium text-gray-600">
                      ✈️ Type:
                      <select
                        className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-300 focus:outline-none"
                        value={waypoint.type}
                        onChange={(e) => onWaypointUpdate(index, 'type', e.target.value)}
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
                        value={waypoint.ias}
                        onChange={(e) =>
                          handleNumericInput(e.target.value, (num) =>
                            onWaypointUpdate(index, 'ias', num)
                          )
                        }
                      />
                    </label>

                    {isSpecial && (
                      <>
                        <label className="block mb-2 text-sm font-medium text-gray-600">
                          🗻 Altitude Change (ft):
                          <input
                            type="number"
                            className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-300 focus:outline-none"
                            value={waypoint.altitudeChange}
                            onChange={(e) =>
                              handleNumericInput(e.target.value, (num) =>
                                onWaypointUpdate(index, 'altitudeChange', num)
                              )
                            }
                          />
                        </label>

                        <label className="block mb-2 text-sm font-medium text-gray-600">
                          📉 ROC/ROD (ft/min):
                          <input
                            type="number"
                            className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-300 focus:outline-none"
                            value={waypoint.rocRod}
                            onChange={(e) =>
                              handleNumericInput(e.target.value, (num) =>
                                onWaypointUpdate(index, 'rocRod', num)
                              )
                            }
                          />
                        </label>

                        <label className="block mb-2 text-sm font-medium text-gray-600">
                          ⚡ IAS in Climb/Descent:
                          <input
                            type="number"
                            className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-300 focus:outline-none"
                            value={waypoint.iasClimbDescent}
                            onChange={(e) =>
                              handleNumericInput(e.target.value, (num) =>
                                onWaypointUpdate(index, 'iasClimbDescent', num)
                              )
                            }
                          />
                        </label>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Only show resize handle when not minimized */}
      {!isMinimized && !isFullScreen && (
        <div
          className="absolute top-0 right-0 h-full w-2 group cursor-ew-resize flex items-center justify-center"
          onMouseDown={handleMouseDown}
        >
          {/* Vertical line with hover effect */}
          <div className="h-full w-full bg-gray-700 group-hover:bg-gray-500 transition-colors duration-200"></div>
          
          {/* Resize indicator dots */}
          <div className="absolute flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <div className="w-1 h-1 rounded-full bg-gray-400"></div>
            <div className="w-1 h-1 rounded-full bg-gray-400"></div>
            <div className="w-1 h-1 rounded-full bg-gray-400"></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;

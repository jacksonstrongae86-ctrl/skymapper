import React, { useState } from 'react';
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
  waypoints,
  onWaypointUpdate,
}) => {
  const [sidebarWidth, setSidebarWidth] = useState(256); // Default width in pixels
  const [isResizing, setIsResizing] = useState(false);

  const handleMouseDown = () => {
    setIsResizing(true);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isResizing) {
      const newWidth = Math.max(10, e.clientX); // Minimum width of 200px
      setSidebarWidth(newWidth);
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

  const handleNumericInput = (value: string, callback: (num: number) => void) => {
    const num = parseFloat(value);
    if (!isNaN(num)) {
      callback(num);
    }
  };

  return (
    <div
      className={`bg-slate-900 text-white h-full transition-transform duration-300 ${
        sidebarActive ? 'translate-x-0' : '-translate-x-full'
      } md:translate-x-0 md:block fixed top-0 left-0 z-50 flex`}
      style={{ width: `${sidebarWidth}px` }}
    >
      {/* Contenido desplazable */}
      <div className="flex-1 overflow-auto h-full relative">
        {/* Sección superior */}
        <div className="p-6 flex-none">
          <button
            className="absolute top-4 right-4 text-gray-300 hover:text-white"
            onClick={(e) => {
              e.stopPropagation();
              console.log("❌ Close button clicked");
              setSidebarActive(false);
            }}
          >
            ❌
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
        </div>

        {/* Sección de Waypoints */}
        <div className="p-6 space-y-4">
          <h2 className="text-xl font-bold mb-4 sticky top-0 bg-slate-900 py-2 z-10">
            Waypoints
          </h2>
          {waypoints.map((waypoint, index) => {
            const isSpecial = waypoint.type !== 'waypoint';
            return (
              <div key={index} className="bg-gray-100 p-4 rounded-lg shadow-md mb-4">
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

      {/* Resizable Edge */}
      <div
        className="absolute top-0 right-0 h-full w-2 cursor-ew-resize bg-gray-700 hover:bg-gray-600"
        onMouseDown={handleMouseDown}
      ></div>
    </div>
  );
};

export default Sidebar;

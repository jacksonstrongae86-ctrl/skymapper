import React, { useState } from "react";
import { SidebarProps } from "../../utils/types";
import Image from "next/image";
import logo from './skymapperlogo-removebg-preview.png';
import { Prompt } from "next/font/google";

const prompt = Prompt({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});


const Sidebar: React.FC<SidebarProps> = ({
  fuelConsumption,
  setFuelConsumption,
  selectedDateTime,
  setSelectedDateTime,
  fetchWindData,
  updateCalculations,
  waypoints,
  onWaypointUpdate,
  sidebarWidth,
  setSidebarWidth,
  isMinimized,
  setIsMinimized,
  isFullScreen,
  setIsFullScreen,
}) => {
  const [isResizing, setIsResizing] = useState(false);
  const [isSettingsVisible, setIsSettingsVisible] = useState(true);
  const [isWaypointsVisible, setIsWaypointsVisible] = useState(true);

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
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    } else {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing]);

  const handleNumericInput = (
    value: string,
    callback: (num: number) => void
  ) => {
    const num = parseFloat(value);
    if (!isNaN(num)) {
      callback(num);
    }
  };

  return (
    <div
      className={`bg-[var(--button-bg)] text-[var(--sidebar-text)] transition-all duration-300 md:translate-x-0 md:block fixed ${
        isFullScreen ? "inset-0" : "top-0 left-0 h-full"
      } z-50 flex`}
      style={{
        backgroundColor: "var(--background)",
        color: "var(--foreground)",
        width: `${sidebarWidth}px`,
        minWidth: isMinimized ? "48px" : "256px",
      }}
    >
      {isMinimized ? (
        // Minimized tab view
        <div className="flex flex-col h-full w-12 bg-[var(--background)] border-r border-[var(--sidebar-border)]">
          <div className="p-2 mb-2 border-b border-[var(--sidebar-border)] ">
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
              className="w-8 h-8 rounded-lg bg-[var(--button-bg)] hover:bg-[var(--button-hover)] flex items-center justify-center text-white"
              title="Wind Data"
              onClick={fetchWindData}
            >
              💨
            </button>
          </div>
        </div>
      ) : (
        // Regular sidebar content - Fix the height and overflow
        <div className="flex flex-col h-full">
          {" "}
          {/* Add flex-col and h-full */}
          <div className="px-6 flex-none">
            {" "}
            {/* Keep flex-none for header */}
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
                <div className="flex items-center space-x-2 mb-4 mt-10">
                  <Image
                    src={logo}
                    alt="Logo"
                    width={64}
                    height={64}
                    className="mb-0"
                  />
                  <span className={`{${prompt.className} text-2xl font-semibold`}>SkyMapper</span>
                </div>

                <p className="text-sm text-[var(--sidebar-text)] mb-6">
                  Click on the map to add waypoints. Drag markers to adjust
                  positions. Set a TAS for each leg.
                </p>

                {/* Settings Section with Toggle */}
                <div className="mb-6 border border-[var(--sidebar-border)] rounded-lg overflow-hidden">
                  <button
                    onClick={() => setIsSettingsVisible(!isSettingsVisible)}
                    className={`w-full px-4 py-2 bg-[var(--button-bg)] hover:bg-[var(--button-hover)]
                    flex items-center justify-between text-sm font-medium border-b border-[var(--sidebar-border)] flex-none rounded-t-lg`}
                  >
                    <span className="flex items-center gap-2 font-semibold text-base text-[var(--button-text)]">
                      <span>⚙️</span>
                      <span>Flight Settings</span>
                    </span>
                    <span>{isSettingsVisible ? "−" : "+"}</span>
                  </button>

                  <div
                    className={`transition-all duration-300 ease-in-out
                    ${
                      isSettingsVisible
                        ? "max-h-96 opacity-100"
                        : "max-h-0 opacity-0"
                    }`}
                  >
                    <div className="p-4 space-y-4">
                      <label className="block text-sm font-medium">
                        Fuel Consumption (Gal/hr):
                        <input
                          type="number"
                          className="w-full mt-1 p-2 border border-[var(--sidebar-border)] rounded-md bg-[var(--input-bg)]
                          text-[var(--input-text)] focus:ring focus:ring-blue-300 focus:outline-none"
                          value={fuelConsumption}
                          onChange={(e) =>
                            setFuelConsumption(parseFloat(e.target.value))
                          }
                        />
                      </label>

                      <label className="block text-sm font-medium">
                        Select Date and Time:
                        <input
                          type="datetime-local"
                          className="w-full mt-1 p-2 border border-[var(--sidebar-border)] rounded-md bg-[var(--input-bg)]
                          text-[var(--input-text)] focus:ring focus:ring-blue-300 focus:outline-none"
                          value={selectedDateTime}
                          onChange={(e) => setSelectedDateTime(e.target.value)}
                        />
                      </label>

                      <button
                        type="button"
                        className="w-full bg-cyan-600/80 hover:bg-cyan-800 text-white py-2 rounded-md"
                        onClick={fetchWindData}
                      >
                        Fetch Wind Data
                      </button>

                      <button
                        type="button"
                        className="w-full bg-green-600/80 hover:bg-green-800 text-white py-2 rounded-md"
                        onClick={updateCalculations}
                      >
                        Update Info 🔄
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
          {/* Scrollable content area */}
          <div className="flex-1 px-6 pb-6 overflow-hidden">
            {/* Waypoints Section with Toggle */}
            <div className="border border-[var(--sidebar-border)] rounded-lg h-full flex flex-col">
              {" "}
              {/* Added h-full and flex flex-col */}
              <button
                onClick={() => setIsWaypointsVisible(!isWaypointsVisible)}
                className="w-full px-4 py-2 bg-[var(--button-bg)] hover:bg-[var(--button-hover)]
                flex items-center justify-between text-sm font-medium border-b border-[var(--sidebar-border)] flex-none rounded-t-lg"
              >
                <span className="flex items-center gap-2 font-bold text-base text-[var(--button-text)]">
                  <span>📍</span>
                  <span>Waypoints</span>
                </span>
                <span>{isWaypointsVisible ? "−" : "+"}</span>
              </button>
              <div
                className={`transition-all duration-300 ease-in-out overflow-hidden flex-1`}
              >
                <div className="h-full overflow-y-auto custom-scrollbar p-4">
                  {" "}
                  {/* Changed to h-full */}
                  <div
                    className={`${
                      isFullScreen
                        ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                        : "space-y-4"
                    }`}
                  >
                    {waypoints.map((waypoint, absoluteIndex) => {
                      if (waypoint.visible === false) return null;

                      // Calculate visible index (count only visible waypoints before this one)
                      const visibleIndex = waypoints
                        .slice(0, absoluteIndex)
                        .filter((wp) => wp.visible !== false).length;
                      const isSpecial = waypoint.type !== "waypoint";
                      return (
                        <div
                          key={absoluteIndex}
                          className="bg-gray-100 p-4 rounded-xl shadow-md"
                        >
                          <h3 className="text-base font-semibold text-gray-700 mb-2">
                            Waypoint {visibleIndex + 1}
                          </h3>

                          <label className="block mb-2 text-sm font-medium text-gray-600">
                            Altitude (ft) (Optional):
                            <input
                              type="number"
                              className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-300 focus:outline-none"
                              value={waypoint.altitude}
                              onChange={(e) =>
                                handleNumericInput(e.target.value, (num) =>
                                  onWaypointUpdate(absoluteIndex, "altitude", num)
                                )
                              }
                            />
                          </label>

                          <label className="block mb-2 text-sm font-medium text-gray-600">
                            ✈️ Type:
                            <select
                              className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-300 focus:outline-none"
                              value={waypoint.type}
                              onChange={(e) =>
                                onWaypointUpdate(
                                  absoluteIndex,
                                  "type",
                                  e.target.value as
                                    | "waypoint"
                                    | "BOC"
                                    | "TOC"
                                    | "TOD"
                                    | "BOD"
                                )
                              }
                            >
                              <option value="waypoint">
                                🛩️ Normal Waypoint
                              </option>
                              <option value="BOC">
                                🚀 BOC (Bottom of Climb)
                              </option>
                              <option value="TOC">⬆️ TOC (Top of Climb)</option>
                              <option value="TOD">
                                ⬇️ TOD (Top of Descent)
                              </option>
                              <option value="BOD">
                                🛬 BOD (Bottom of Descent)
                              </option>
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
                                  onWaypointUpdate(absoluteIndex, "ias", num)
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
                                      onWaypointUpdate(
                                        absoluteIndex,
                                        "altitudeChange",
                                        num
                                      )
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
                                      onWaypointUpdate(absoluteIndex, "rocRod", num)
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
                                      onWaypointUpdate(
                                        absoluteIndex,
                                        "iasClimbDescent",
                                        num
                                      )
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
          <div className="h-full w-full bg-[var(--button-bg)] group-hover:bg-[var(--button-hover)] transition-colors duration-200"></div>

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

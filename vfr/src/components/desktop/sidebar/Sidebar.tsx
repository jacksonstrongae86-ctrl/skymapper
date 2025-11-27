import React, { useState, useEffect } from "react";
import { SidebarProps } from "../../../utils/types";
import { Header } from "./components/sidebar/Header";
import { MinimizedSidebar } from "./components/sidebar/MinimizeSidebar";
import { FlightSettings } from "./components/sidebar/FlightSettings";
import { ScrollableContent } from "./components/sidebar/ScrollableContent";
import { AirspaceWarnings } from "./components/sidebar/AirspaceWarnings";
import AirspaceLegend from "../../shared/AirspaceLegend";
import { useSidebarResize } from "../../../hooks/sidebar/useSidebarResize";
import { useSidebarVisibility } from "../../../hooks/sidebar/useSidebarVisibility";
import { useInputHandlers } from "../../../hooks/sidebar/useInputHandlers";
import { ResizeHandle } from "./components/sidebar/ResizeHandle";

const Sidebar: React.FC<SidebarProps> = ({
  fuelConsumption,
  setFuelConsumption,
  selectedDateTime,
  setSelectedDateTime,
  waypoints,
  onWaypointUpdate,
  onDeleteWaypoint,
  sidebarWidth,
  setSidebarWidth,
  isMinimized,
  setIsMinimized,
  isFullScreen,
  setIsFullScreen,
  gal_liter,
  set_gal_liter,
  // Airspace warning props
  airspaces = [],
  showWarnings,
  setShowWarnings,
  analyzeRouteWarnings,
  warningAlerts = [],
  clearWarningAlerts,
  aviationLayers,
}) => {
  const [isSettingsVisible, setIsSettingsVisible] = useState(true);
  const [isWaypointsVisible, setIsWaypointsVisible] = useState(true);
  const [localWarningsVisible, setLocalWarningsVisible] = useState(true);

  // Use external state if provided, otherwise use local state
  const isWarningsVisible = showWarnings ?? localWarningsVisible;
  const setIsWarningsVisible = setShowWarnings ?? setLocalWarningsVisible;

  // Open and scroll to airspace warnings when triggered from outside
  useEffect(() => {
    if (showWarnings && !isMinimized) {
      // Open the warnings section if it's not already open
      setLocalWarningsVisible(true);

      const warningsElement = document.getElementById('airspace-warnings');
      if (warningsElement) {
        setTimeout(() => {
          warningsElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 300);
      }

      // Reset the flag after processing
      if (setShowWarnings) {
        setTimeout(() => setShowWarnings(false), 100);
      }
    }
  }, [showWarnings, isMinimized, setShowWarnings]);

  const { handleMouseDown, handleTouchStart } = useSidebarResize({
    setSidebarWidth,
    minWidth: 472,
    maxWidth: typeof window !== "undefined" ? window.innerWidth * 0.8 : 800,
  });

  const { handleMinimizeMaximize, handleFullScreen } = useSidebarVisibility({
    setSidebarWidth,
    setIsMinimized,
    setIsFullScreen,
    isMinimized,
    isFullScreen,
  });

  const { handleNumericInput } = useInputHandlers();

  return (
    <div
    id="main-sidebar"
      className={`bg-[var(--button-bg)] text-[var(--sidebar-text)] transition-all duration-300 md:translate-x-0 md:block fixed ${
        isFullScreen ? "inset-0" : "top-0 left-0 h-full"
      } z-50 flex`}
      style={{
        backgroundColor: "var(--background)",
        color: "var(--foreground)",
        width: `${sidebarWidth}px`,
        minWidth: isMinimized ? "48px" : "472px",
      }}
    >
      {isMinimized ? (
        <MinimizedSidebar
          handleMinimizeMaximize={handleMinimizeMaximize}
        />
      ) : (
        <div className="flex flex-col h-full w-full">
          <Header
            handleFullScreen={handleFullScreen}
            handleMinimizeMaximize={handleMinimizeMaximize}
            isFullScreen={isFullScreen}
          />

          <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
            <FlightSettings
              isSettingsVisible={isSettingsVisible}
              setIsSettingsVisible={setIsSettingsVisible}
              fuelConsumption={fuelConsumption}
              setFuelConsumption={setFuelConsumption}
              selectedDateTime={selectedDateTime}
              setSelectedDateTime={setSelectedDateTime}
              gal_liter={gal_liter}
              set_gal_liter={set_gal_liter}
            />

            <ScrollableContent
              isWaypointsVisible={isWaypointsVisible}
              setIsWaypointsVisible={setIsWaypointsVisible}
              waypoints={waypoints}
              onWaypointUpdate={onWaypointUpdate}
              isFullScreen={isFullScreen}
              handleNumericInput={handleNumericInput}
              onDeleteWaypoint={onDeleteWaypoint}
              gal_liter={gal_liter}
            />

            {/* Airspace Warnings */}
            {analyzeRouteWarnings && (
              <AirspaceWarnings
                isWarningsVisible={isWarningsVisible}
                setIsWarningsVisible={setIsWarningsVisible}
                waypoints={waypoints}
                airspaces={airspaces}
                warningAlerts={warningAlerts}
                onClearAlerts={clearWarningAlerts || (() => {})}
                analyzeRouteWarnings={analyzeRouteWarnings}
              />
            )}

            {/* Airspace Legend - Only show when airspaces are active */}
            {aviationLayers?.airspaces && (
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <AirspaceLegend />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Resize Handle */}
      <ResizeHandle
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        isVisible={!isMinimized && !isFullScreen}
      />
    </div>
  );
};

export default Sidebar;

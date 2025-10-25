import React, { useState } from "react";
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
  analyzeRouteWarnings,
  warningAlerts = [],
  clearWarningAlerts,
  aviationLayers,
}) => {
  const [isSettingsVisible, setIsSettingsVisible] = useState(true);
  const [isWaypointsVisible, setIsWaypointsVisible] = useState(true);
  const [isWarningsVisible, setIsWarningsVisible] = useState(true);

  const { handleMouseDown, handleTouchStart } = useSidebarResize({
    setSidebarWidth,
    minWidth: 378,
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
        minWidth: isMinimized ? "48px" : "378px",
      }}
    >
      {isMinimized ? (
        <MinimizedSidebar
          handleMinimizeMaximize={handleMinimizeMaximize}
        />
      ) : (
        <div className="flex flex-col h-full">
          <Header
            handleFullScreen={handleFullScreen}
            handleMinimizeMaximize={handleMinimizeMaximize}
            isFullScreen={isFullScreen}
          />

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

import React, { useState, useEffect } from "react";
import { SidebarProps } from "../../../utils/types";
import { Header } from "./components/sidebar/Header";
import { MinimizedSidebar } from "./components/sidebar/MinimizeSidebar";
import { FlightSettings } from "./components/sidebar/FlightSettings";
import { ScrollableContent } from "./components/sidebar/ScrollableContent";
// import { AirspaceWarnings } from "./components/sidebar/AirspaceWarnings";
// import AirspaceLegend from "../../shared/AirspaceLegend";
import { useSidebarResize } from "../../../hooks/sidebar/useSidebarResize";
import { useSidebarVisibility } from "../../../hooks/sidebar/useSidebarVisibility";
import { useInputHandlers } from "../../../hooks/sidebar/useInputHandlers";
import { ResizeHandle } from "./components/sidebar/ResizeHandle";

interface ExtendedSidebarProps extends SidebarProps {
  setIsSidebarResizing?: (isResizing: boolean) => void;
  isFlightActive?: boolean;
  onStartFlight?: () => void;
  onEndFlight?: () => void;
}

const Sidebar: React.FC<ExtendedSidebarProps> = ({
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
  // Airspace warning props — disabled
  isFlightActive = false,
  onStartFlight,
  onEndFlight,
  setIsSidebarResizing,
}) => {
  const [isSettingsVisible, setIsSettingsVisible] = useState(true);
  const [isWaypointsVisible, setIsWaypointsVisible] = useState(true);
  // Airspace warnings disabled

  const { handleMouseDown, handleTouchStart, isResizing } = useSidebarResize({
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

  // Sync isResizing state with parent so BottomSidebar can disable transitions too
  useEffect(() => {
    setIsSidebarResizing?.(isResizing);
  }, [isResizing, setIsSidebarResizing]);

  return (
    <div
    id="main-sidebar"
      className={`bg-[var(--button-bg)] text-[var(--sidebar-text)] ${!isResizing ? 'transition-all duration-300' : ''} md:translate-x-0 md:block fixed ${
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

          <div className="flex-1 overflow-y-auto overflow-x-hidden hide-scrollbar">
            <FlightSettings
              isSettingsVisible={isSettingsVisible}
              setIsSettingsVisible={setIsSettingsVisible}
              fuelConsumption={fuelConsumption}
              setFuelConsumption={setFuelConsumption}
              selectedDateTime={selectedDateTime}
              setSelectedDateTime={setSelectedDateTime}
              gal_liter={gal_liter}
              set_gal_liter={set_gal_liter}
              waypoints={waypoints}
              isFlightActive={isFlightActive}
              onStartFlight={onStartFlight}
              onEndFlight={onEndFlight}
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

            {/* Airspace Warnings & Legend — hidden until ENAIRE data */}
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

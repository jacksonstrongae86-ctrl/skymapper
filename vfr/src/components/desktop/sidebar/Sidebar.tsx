import React, { useState } from "react";
import { SidebarProps } from "../../../utils/types";
import { Header } from "./components/sidebar/Header";
import { MinimizedSidebar } from "./components/sidebar/MinimizeSidebar";
import { FlightSettings } from "./components/sidebar/FlightSettings";
import { ScrollableContent } from "./components/sidebar/ScrollableContent";
import { useSidebarResize } from "../../../hooks/sidebar/useSidebarResize";
import { useSidebarVisibility } from "../../../hooks/sidebar/useSidebarVisibility";
import { useInputHandlers } from "../../../hooks/sidebar/useInputHandlers";
import { ResizeHandle } from "./components/sidebar/ResizeHandle";

const Sidebar: React.FC<SidebarProps> = ({
  fuelConsumption,
  setFuelConsumption,
  selectedDateTime,
  setSelectedDateTime,
  fetchWindData,
  updateCalculations,
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
}) => {
  const [isSettingsVisible, setIsSettingsVisible] = useState(true);
  const [isWaypointsVisible, setIsWaypointsVisible] = useState(true);

  const { handleMouseDown, handleTouchStart } = useSidebarResize({
    setSidebarWidth,
    minWidth: 300,
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
      className={`bg-[var(--button-bg)] text-[var(--sidebar-text)] transition-all duration-300 md:translate-x-0 md:block fixed ${
        isFullScreen ? "inset-0" : "top-0 left-0 h-full"
      } z-50 flex`}
      style={{
        backgroundColor: "var(--background)",
        color: "var(--foreground)",
        width: `${sidebarWidth}px`,
        minWidth: isMinimized ? "48px" : "300px",
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
            fetchWindData={fetchWindData}
            updateCalculations={updateCalculations}
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

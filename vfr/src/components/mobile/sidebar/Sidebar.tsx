import React, { useState } from "react";
import { SidebarProps } from "../../../utils/types";
import { Header } from "./components/sidebar/Header";
import { FlightSettings } from "./components/sidebar/FlightSettings";
import { ResizeHandle } from "./components/sidebar/ResizeHandle";
import { useSidebarResize } from "@/src/hooksMobile/sidebar/useSidebarResize";
import { useBottomSidebarVisibility } from "@/src/hooks/bottomSidebar/useBottomSidebarVisibility";
import { ScrollableContent } from "./components/sidebar/ScrollableContent";
import { useSidebarVisibility } from "../../../hooksMobile/sidebar/useSidebarVisibility";
import { useInputHandlers } from "../../../hooks/sidebar/useInputHandlers";
import { useTheme } from "@/src/utils/ThemeContext";

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
  setSidebarWidth,
  isMinimized,
  setIsMinimized,
  isFullScreen,
  setIsFullScreen,
  onHeightChange, // Assuming this prop exists or add it to SidebarProps
  bottomSidebarHeight = 0, // Default to 0 if not provided
  gal_liter,
  set_gal_liter,
}) => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<"settings" | "waypoints">(
    "settings"
  );

  // Use the same resize logic as BottomSidebar
  const {
    height,
    getResizeHandlers,
    isResizing } = useSidebarResize({
    onHeightChange: onHeightChange || (() => {}),
    minHeight: 7,
    maxHeight: 90,
    bottomSidebarHeight, // Pass the bottom sidebar height
  });

  const {
    isBottomMinimized,
    isFullScreen: sidebarFullScreen,
    handleFullScreen,
  } = useBottomSidebarVisibility({
    onHeightChange,
    defaultHeight: height,
  });

  const { handleMinimizeMaximize } = useSidebarVisibility({
    setSidebarWidth,
    setIsMinimized,
    setIsFullScreen,
    isMinimized,
    isFullScreen,
  });

  const { handleNumericInput } = useInputHandlers();

  return (
    <div
      className={`
        fixed left-0 top-0
        text-[var(--results-text)]
        shadow-lg
        rounded-b-xl
        transition-all duration-300 ease-in-out
        border-t border-[var(--sidebar-border)]
        ${`gradient-${theme}`}
        w-full
      `}
      style={{
        height: `${isBottomMinimized ? 7 : sidebarFullScreen ? 90 : height}%`,
        zIndex: 40,
      }}
    >
      {/* Resize Handle */}
       <ResizeHandle
        resizeHandlers={getResizeHandlers()}
        isResizing={isResizing}
       />
       <div
        className={`
        h-full
        overflow-y-auto
        custom-scrollbar
        transition-all duration-300
      `}
      >
      {/* Header Section */}
      <Header
        handleFullScreen={handleFullScreen}
        handleMinimizeMaximize={handleMinimizeMaximize}
        isFullScreen={sidebarFullScreen}
      />
      {/* Tabs and Content - Only show when expanded */}
      <div
        className={`
          flex-1 flex flex-col
          transition-all duration-300
        `}
      >
        {/* Tab Buttons */}
        <div className="flex border-b border-[var(--sidebar-border)]">
          <button
            onClick={() => setActiveTab("settings")}
            className={`flex-1 text-sm py-2 transition-all ${
              activeTab === "settings"
                ? "bg-[var(--sidebar-bg)] font-semibold"
                : "bg-transparent text-[var(--text-muted)]"
            }`}
          >
            Flight Settings
          </button>
          <button
            onClick={() => setActiveTab("waypoints")}
            className={`flex-1 text-sm py-2 transition-all ${
              activeTab === "waypoints"
                ? "bg-[var(--sidebar-bg)] font-semibold"
                : "bg-transparent text-[var(--text-muted)]"
            }`}
          >
            Waypoints
          </button>
        </div>

        <div className="flex-1 flex flex-col">
          {activeTab === "settings" ? (
            <FlightSettings
              isSettingsVisible={true}
              setIsSettingsVisible={() => {}}
              fuelConsumption={fuelConsumption}
              setFuelConsumption={setFuelConsumption}
              selectedDateTime={selectedDateTime}
              setSelectedDateTime={setSelectedDateTime}
              fetchWindData={fetchWindData}
              updateCalculations={updateCalculations}
              gal_liter={gal_liter}
              set_gal_liter={set_gal_liter}
            />
          ) : (
            <ScrollableContent
              isWaypointsVisible={true}
              setIsWaypointsVisible={() => {}}
              waypoints={waypoints}
              onWaypointUpdate={onWaypointUpdate}
              onDeleteWaypoint={onDeleteWaypoint}
              isFullScreen={sidebarFullScreen}
              handleNumericInput={handleNumericInput}
              gal_liter={gal_liter}
            />
          )}
        </div>
      </div>
      </div>
    </div>
  );
};

export default Sidebar;

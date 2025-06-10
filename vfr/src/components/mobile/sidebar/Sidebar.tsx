import React, { useState } from "react";
import { SidebarProps } from "../../../utils/types";
import { Header } from "./components/sidebar/Header";
import { FlightSettings } from "./components/sidebar/FlightSettings";
import { ResizeHandle } from "./components/bottomSidebar/ResizeHandle";
import { useSidebarResize } from "@/src/hooksMobile/sidebar/useSidebarResize";
import { useBottomSidebarVisibility } from "@/src/hooks/bottomSidebar/useBottomSidebarVisibility";
import { ScrollableContent } from "./components/sidebar/ScrollableContent";
import { useSidebarVisibility } from "../../../hooksMobile/sidebar/useSidebarVisibility";
import { useInputHandlers } from "../../../hooksMobile/sidebar/useInputHandlers";
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
  setSidebarWidth,
  isMinimized,
  setIsMinimized,
  isFullScreen,
  setIsFullScreen,
  onHeightChange, // Assuming this prop exists or add it to SidebarProps
}) => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<"settings" | "waypoints">(
    "settings"
  );

  // Use the same resize logic as BottomSidebar
  const { height, handleMouseDown } = useSidebarResize({
    onHeightChange: onHeightChange || (() => {}),
    minHeight: 7,
    maxHeight: 90,
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
        w-full
        z-50
        bg-[var(--button-bg)]
        text-[var(--sidebar-text)]
        transition-all duration-300
        flex flex-col
        touch-none
        rounded-b-xl
        shadow-lg
        ${`gradient-${theme}`}
        overflow-hidden
      `}
      style={{
        height: `${isBottomMinimized ? 7 : sidebarFullScreen ? 90 : height}%`,
      }}
    >
      {/* Resize Handle */}
      <div
        className={`
          absolute -bottom-1.5 left-0 right-0
          h-6 z-40
          group cursor-ns-resize
          flex items-center justify-center
        `}
      >
        <ResizeHandle handleMouseDown={handleMouseDown} />
      </div>
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
          ${isBottomMinimized ? "opacity-0 pointer-events-none" : "opacity-100"}
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

        <div className="flex-1 flex flex-col min-h-0">
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
            />
          ) : (
            <ScrollableContent
              isWaypointsVisible={true}
              setIsWaypointsVisible={() => {}}
              waypoints={waypoints}
              onWaypointUpdate={onWaypointUpdate}
              isFullScreen={sidebarFullScreen}
              handleNumericInput={handleNumericInput}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;

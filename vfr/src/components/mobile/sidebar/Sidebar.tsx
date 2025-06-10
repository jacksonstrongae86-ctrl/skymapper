import React, { useState } from "react";
import { SidebarProps } from "../../../utils/types";
import { Header } from "./components/sidebar/Header";
import { FlightSettings } from "./components/sidebar/FlightSettings";
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
}) => {
  const { handleMinimizeMaximize, handleFullScreen } = useSidebarVisibility({
    setSidebarWidth,
    setIsMinimized,
    setIsFullScreen,
    isMinimized,
    isFullScreen,
  });

  const { handleNumericInput } = useInputHandlers();
  const [activeTab, setActiveTab] = useState<"settings" | "waypoints">(
    "settings"
  );
  const [isCollapsed, setIsCollapsed] = useState(true);
  const { theme } = useTheme();
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
      ${isCollapsed ? "h-[80px]" : "h-[75vh]"}
      overflow-hidden
    `}
    style={{
      backgroundColor: "var(--background)",
      color: "var(--foreground)",
    }}
  >
      {/* Collapse/Expand Handle styled like ResizeHandle */}
      <div
        className={`
          absolute -bottom-1.5 left-0 right-0
          h-6 z-40
          group cursor-ns-resize
          flex items-center justify-center
        `}
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <div className="absolute flex gap-1">
          <div
            className={`w-20 h-1.5 rounded-full ${`button-gradient-${theme}`}`}
          />
        </div>
      </div>
      {/* Header Section */}
      <Header
        handleFullScreen={handleFullScreen}
        handleMinimizeMaximize={handleMinimizeMaximize}
        isFullScreen={isFullScreen}
      />
      {/* Tabs and Content - Only show when expanded */}
      <div
        className={`
        flex-1 flex flex-col
        transition-all duration-300
        ${isCollapsed ? "opacity-0 pointer-events-none" : "opacity-100"}
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
              isFullScreen={isFullScreen}
              handleNumericInput={handleNumericInput}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;

import React, { useState, useEffect } from "react";
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
import AirspaceWarningPanel from "../../shared/AirspaceWarningPanel";
import { ToolsPanel } from "../../shared/ToolsPanel";
import { Settings2, MapPin, Plane, Wrench } from "lucide-react";

const Sidebar: React.FC<SidebarProps & { isFlightActive?: boolean; onStartFlight?: () => void; onEndFlight?: () => void }> = ({
  fuelConsumption,
  setFuelConsumption,
  selectedDateTime,
  setSelectedDateTime,
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
  // Airspace warning props
  airspaces = [],
  showWarnings,
  setShowWarnings,
  warningsInitialTab,
  analyzeRouteWarnings,
  warningAlerts = [],
  clearWarningAlerts,
  isFlightActive = false,
  onStartFlight,
  onEndFlight,
}) => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<"settings" | "waypoints" | "warnings" | "flight" | "tools">(
    "settings"
  );

  // Switch to warnings tab when showWarnings becomes true
  useEffect(() => {
    if (showWarnings) {
      setActiveTab("warnings");
      // Reset the flag after switching
      if (setShowWarnings) {
        setTimeout(() => setShowWarnings(false), 100);
      }
    }
  }, [showWarnings, setShowWarnings]);

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
        ${!isResizing ? 'transition-all duration-300 ease-in-out' : ''}
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
          flex-1 flex flex-col overflow-hidden
          transition-all duration-300
        `}
      >
        {/* Tab Buttons */}
        <div className="flex justify-center items-center gap-2 py-1.5 border-b border-[var(--sidebar-border)] flex-shrink-0">
          <button
            onClick={() => setActiveTab("settings")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-200 flex items-center justify-center gap-1.5 ${
              activeTab === "settings"
                ? `button-gradient-${theme} text-[var(--button-text)]`
                : "text-[var(--sidebar-text)] hover:bg-[var(--button-hover)]"
            }`}
          >
            <Settings2 size={14} />
            Settings
          </button>
          <button
            onClick={() => setActiveTab("waypoints")}
            id="waypoints-tab"
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-200 flex items-center justify-center gap-1.5 ${
              activeTab === "waypoints"
                ? `button-gradient-${theme} text-[var(--button-text)]`
                : "text-[var(--sidebar-text)] hover:bg-[var(--button-hover)]"
            }`}
          >
            <MapPin size={14} />
            Waypoints
            {waypoints.length > 0 && (
              <span className={`px-1.5 py-.5 rounded text-xs font-semibold ${
                activeTab === "waypoints" ? "bg-white/20" : "bg-blue-600/20 text-blue-300"
              }`}>
                {waypoints.length}
              </span>
            )}
          </button>
          {/* Warnings tab hidden — no authoritative data yet */}
          <button
            onClick={() => setActiveTab("flight")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-200 flex items-center justify-center gap-1.5 ${
              activeTab === "flight"
                ? `button-gradient-${theme} text-[var(--button-text)]`
                : "text-[var(--sidebar-text)] hover:bg-[var(--button-hover)]"
            }`}
          >
            <Plane size={14} />
            Vuelo
          </button>
          <button
            onClick={() => setActiveTab("tools")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-200 flex items-center justify-center gap-1.5 ${
              activeTab === "tools"
                ? `button-gradient-${theme} text-[var(--button-text)]`
                : "text-[var(--sidebar-text)] hover:bg-[var(--button-hover)]"
            }`}
          >
            <Wrench size={14} />
            Tools
          </button>
        </div>

        <div className="flex-1 flex flex-col overflow-hidden">
          {activeTab === "settings" ? (
            <div className="flex-1 flex flex-col">
              <FlightSettings
                isSettingsVisible={true}
                setIsSettingsVisible={() => {}}
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
            </div>
          ) : activeTab === "waypoints" ? (
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
          ) : activeTab === "warnings" ? (
            <div className="flex-1 flex flex-col overflow-hidden">
              {analyzeRouteWarnings && (
                <AirspaceWarningPanel
                  waypoints={waypoints}
                  airspaces={airspaces}
                  warningAlerts={warningAlerts}
                  onClearAlerts={clearWarningAlerts || (() => {})}
                  analyzeRouteWarnings={analyzeRouteWarnings}
                  initialTab={warningsInitialTab}
                />
              )}
            </div>
          ) : activeTab === "flight" ? (
            <div className="flex-1 flex flex-col overflow-y-auto p-4 space-y-4">
              <div className="text-sm font-medium text-[var(--sidebar-text)]">Control de Vuelo</div>
              {isFlightActive ? (
                <button
                  onClick={() => onEndFlight?.()}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold 
                             py-4 rounded-xl shadow-lg flex items-center justify-center gap-2 text-lg"
                >
                  ⏹️ Finalizar Vuelo
                </button>
              ) : (
                <button
                  onClick={() => onStartFlight?.()}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold 
                             py-4 rounded-xl shadow-lg flex items-center justify-center gap-2 text-lg"
                >
                  ▶️ Iniciar Vuelo
                </button>
              )}
              {isFlightActive && (
                <div className="text-xs text-[var(--sidebar-text)] opacity-70 text-center">
                  GPS activo — seguimiento en tiempo real
                </div>
              )}
              {!isFlightActive && (
                <div className="text-xs text-[var(--sidebar-text)] opacity-70 text-center">
                  Pulsa para iniciar el seguimiento GPS
                </div>
              )}
            </div>
          ) : activeTab === "tools" ? (
            <div className="flex-1 flex flex-col overflow-y-auto">
              <ToolsPanel 
                waypoints={waypoints} 
                fuelConsumption={fuelConsumption}
                gal_liter={gal_liter}
                flightRules={'VFR'}
                airports={[]}
                mode="inline"
              />
            </div>
          ) : null}
        </div>
      </div>
      </div>
    </div>
  );
};

export default Sidebar;

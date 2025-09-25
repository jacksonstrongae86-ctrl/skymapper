import React, { useState } from "react";
import { SidebarProps } from "../../../utils/types";
import { Header } from "./components/sidebar/Header";
import { MinimizedSidebar } from "./components/sidebar/MinimizeSidebar";
import { FlightSettings } from "./components/sidebar/FlightSettings";
import { ScrollableContent } from "./components/sidebar/ScrollableContent";
import AltitudeCompliancePanel from "../../shared/AltitudeCompliancePanel";
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
  // Altitude compliance props
  airspaces = [],
  autoAdjustEnabled = true,
  setAutoAdjustEnabled,
  analyzeRouteCompliance,
  complianceAlerts = [],
  clearComplianceAlerts,
  insertComplianceTransitions,
  removeComplianceTransitions,
}) => {
  const [isSettingsVisible, setIsSettingsVisible] = useState(true);
  const [isWaypointsVisible, setIsWaypointsVisible] = useState(true);
  const [showCompliancePanel, setShowCompliancePanel] = useState(false);

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
    id="main-sidebar"
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

          {/* Altitude Compliance Toggle */}
          <div className="border-b border-gray-200 dark:border-gray-700 p-4">
            <button
              onClick={() => setShowCompliancePanel(!showCompliancePanel)}
              className="flex items-center justify-between w-full text-left text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            >
              <span>Altitude Compliance</span>
              <svg
                className={`w-4 h-4 transform transition-transform ${
                  showCompliancePanel ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          {/* Altitude Compliance Panel */}
          {showCompliancePanel && analyzeRouteCompliance && (
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 max-h-96 overflow-y-auto">
              <AltitudeCompliancePanel
                waypoints={waypoints}
                airspaces={airspaces}
                complianceAlerts={complianceAlerts}
                autoAdjustEnabled={autoAdjustEnabled}
                onAutoAdjustToggle={setAutoAdjustEnabled || (() => {})}
                onInsertTransitions={insertComplianceTransitions || (() => {})}
                onRemoveTransitions={removeComplianceTransitions || (() => {})}
                onClearAlerts={clearComplianceAlerts || (() => {})}
                analyzeRouteCompliance={analyzeRouteCompliance}
              />
            </div>
          )}

          {/* Airspace Legend */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <AirspaceLegend />
          </div>

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

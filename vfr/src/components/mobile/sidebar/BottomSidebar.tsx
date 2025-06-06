import React from "react";
import { useTheme } from "@/src/utils/ThemeContext";
import { Header } from "./components/bottomSidebar/Header";
import { ResultsTable } from "./components/bottomSidebar/ResultsTable";
import { ResizeHandle } from "./components/bottomSidebar/ResizeHandle";
import { useBottomSidebarResize } from "@/src/hooksMobile/bottomSidebar/useBottomSidebarResize";
import { useBottomSidebarVisibility } from "@/src/hooksMobile/bottomSidebar/useBottomSidebarVisibility";
import { useResultsCalculation } from "@/src/hooksMobile/bottomSidebar/useResultCalculation";
import { usePrintHandler } from "@/src/hooksMobile/bottomSidebar/usePrintHandler";
import { BottomSidebarProps } from "@/src/utils/types";

const BottomSidebar: React.FC<BottomSidebarProps> = ({
  waypoints,
  storedWindData,
  fuelConsumption,
  sidebarWidth,
  isMinimized,
  isFullScreen: isParentFullScreen,
  onHeightChange,
}) => {
  const { theme } = useTheme();

  const {
    height,
    handleMouseDown,
  } = useBottomSidebarResize({
    onHeightChange,
    minHeight: 7, // Reduced minimum height
    maxHeight: 90,
  });

  const {
    isBottomMinimized,
    isFullScreen,
    handleMinimizeMaximize,
    handleFullScreen,
  } = useBottomSidebarVisibility({
    onHeightChange,
    defaultHeight: height,
  });

  // Custom hooksMobile for data and actions
  const results = useResultsCalculation({
    waypoints,
    storedWindData,
    fuelConsumption,
  });

  const handlePrint = usePrintHandler({
    results,
    waypoints,
    fuelConsumption,
  });

  return (
    <div
      className={`
        fixed bottom-0 left-0
        text-[var(--results-text)]
        shadow-lg
        transition-all duration-300 ease-in-out
        border-t border-[var(--sidebar-border)]
        ${`gradient-${theme}`}
      `}
      style={{
        height: `${isBottomMinimized ? 7 : isFullScreen ? 90 : height}%`,
        left: isParentFullScreen ? "0" : isMinimized ? "48px" : `${sidebarWidth}px`,
        width: isParentFullScreen ? "100%" : `calc(100% - ${isMinimized ? '48px' : sidebarWidth}px)`,
        zIndex: 40,
      }}
    >
      {/* Resize Handle Component */}
      {!isBottomMinimized && !isFullScreen && (
        <ResizeHandle
          handleMouseDown={handleMouseDown}
        />
      )}

      {/* Main Content Container */}
      <div
        className={`
          h-full
          overflow-y-auto
          custom-scrollbar
          hide-scrollbar
          ${isBottomMinimized ? 'opacity-50' : 'opacity-100'}
          transition-opacity duration-200
        `}
      >
        {/* Header Component */}
        <Header
          waypoints={waypoints}
          isBottomMinimized={isBottomMinimized}
          isFullScreen={isFullScreen}
          handleFullScreen={handleFullScreen}
          handleMinimizeMaximize={handleMinimizeMaximize}
          handlePrint={handlePrint}
        />

        {/* Results Table Component */}
        {!isBottomMinimized && (
          <ResultsTable
            results={results}
          />
        )}
      </div>
    </div>
  );
};

export default BottomSidebar;

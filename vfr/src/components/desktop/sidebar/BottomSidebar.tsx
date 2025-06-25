import React from "react";
import { useTheme } from "@/src/utils/ThemeContext";
import { Header } from "./components/bottomSidebar/Header";
import { ResultsTable } from "./components/bottomSidebar/ResultsTable";
import { ResizeHandle } from "./components/bottomSidebar/ResizeHandle";
import { useBottomSidebarResize } from "@/src/hooks/bottomSidebar/useBottomSidebarResize";
import { useBottomSidebarVisibility } from "@/src/hooks/bottomSidebar/useBottomSidebarVisibility";
import { useResultsCalculation } from "@/src/hooks/bottomSidebar/useResultCalculation";
import { usePrintHandler } from "@/src/hooks/bottomSidebar/usePrintHandler";
import { BottomSidebarProps } from "@/src/utils/types";

const BottomSidebar: React.FC<BottomSidebarProps> = ({
  waypoints,
  storedWindData,
  fuelConsumption,
  sidebarWidth,
  isMinimized,
  isFullScreen: isParentFullScreen,
  onHeightChange,
  gal_liter,
}) => {
  const { theme } = useTheme();

  const {
    height,
    handleMouseDown,
  } = useBottomSidebarResize({
    onHeightChange: onHeightChange || (() => {}),
    minHeight: 7, // Reduced minimum height
    maxHeight: 90,
  });

  const {
    isBottomMinimized,
    isFullScreen,
    handleFullScreen,
  } = useBottomSidebarVisibility({
    onHeightChange,
    defaultHeight: height,
  });

  // Custom hooks for data and actions
  const results = useResultsCalculation({
    waypoints,
    storedWindData,
    fuelConsumption,
  });

  const handlePrint = usePrintHandler({
    results,
    waypoints,
    fuelConsumption,
    gal_liter,
  });

  return (
    <div
      className={`
        fixed bottom-0
        text-[var(--results-text)]
        shadow-lg
        transition-all duration-300 ease-in-out
        border-t border-[var(--sidebar-border)]
        ${`gradient-${theme}`}
      `}
      style={{
        height: `${isBottomMinimized ? 7 : isFullScreen ? 90 : height}%`,
        left: isParentFullScreen ? 0 : isMinimized ? "48px" : `${sidebarWidth}px`,
        width: isParentFullScreen
          ? "100%"
          : isMinimized
            ? "calc(100vw - 48px)"
            : `calc(100vw - ${sidebarWidth}px)`,
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

          handlePrint={handlePrint}
        />

        {/* Results Table Component */}
        {!isBottomMinimized && (
          <ResultsTable
            results={results}
            gal_liter={gal_liter}
          />
        )}
      </div>
    </div>
  );
};

export default BottomSidebar;

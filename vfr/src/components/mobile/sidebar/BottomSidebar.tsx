import React from "react";
import { useTheme } from "@/src/utils/ThemeContext";
import { Header } from "./components/bottomSidebar/Header";
import { ResultsTable } from "./components/bottomSidebar/ResultsTable";
import { ResizeHandle } from "./components/bottomSidebar/ResizeHandle";
import { useBottomSidebarResize } from "@/src/hooks/bottomSidebar/useBottomSidebarResize";
import { useBottomSidebarVisibility } from "@/src/hooks/bottomSidebar/useBottomSidebarVisibility";
import { useResultsCalculation } from "@/src/hooksMobile/bottomSidebar/useResultCalculation";
import { usePrintHandler } from "@/src/hooksMobile/bottomSidebar/usePrintHandler";
import { BottomSidebarProps } from "@/src/utils/types";

const BottomSidebar: React.FC<BottomSidebarProps> = ({
  waypoints,
  storedWindData,
  fuelConsumption,
  onHeightChange,
}) => {
  const { theme } = useTheme();

  const { height, handleMouseDown } = useBottomSidebarResize({
    onHeightChange: onHeightChange || (() => {}),
    minHeight: 7, // Reduced minimum height
    maxHeight: 90,
  });

  const { isBottomMinimized, isFullScreen, handleFullScreen } =
    useBottomSidebarVisibility({
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
        rounded-t-xl
        transition-all duration-300 ease-in-out
        border-t border-[var(--sidebar-border)]
        ${`gradient-${theme}`}
        w-full
      `}
      style={{
        height: `${isBottomMinimized ? 7 : isFullScreen ? 90 : height}%`,
        zIndex: 40,
      }}
    >
      {/* Resize Handle */}
      <ResizeHandle handleMouseDown={handleMouseDown} />

      {/* Main Content Container */}
      <div
        className={`
        h-full
        overflow-y-auto
        custom-scrollbar
        transition-all duration-300
      `}
      >
        {/* Header Component */}
        <Header
          waypoints={waypoints}
          isFullScreen={isFullScreen}
          handleFullScreen={handleFullScreen}
          handlePrint={handlePrint}
        />

        {/* Results Table Component */}
        <div
          className={`
          transition-all duration-300
        `}
        >
          <ResultsTable results={results} />
        </div>
      </div>
    </div>
  );
};

export default BottomSidebar;

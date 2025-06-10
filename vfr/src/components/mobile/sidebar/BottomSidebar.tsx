import React, {useState} from "react";
import { useTheme } from "@/src/utils/ThemeContext";
import { Header } from "./components/bottomSidebar/Header";
import { ResultsTable } from "./components/bottomSidebar/ResultsTable";
import { useBottomSidebarResize } from "@/src/hooksMobile/bottomSidebar/useBottomSidebarResize";
import { useBottomSidebarVisibility } from "@/src/hooksMobile/bottomSidebar/useBottomSidebarVisibility";
import { useResultsCalculation } from "@/src/hooksMobile/bottomSidebar/useResultCalculation";
import { usePrintHandler } from "@/src/hooksMobile/bottomSidebar/usePrintHandler";
import { BottomSidebarProps } from "@/src/utils/types";

const BottomSidebar: React.FC<BottomSidebarProps> = ({
  waypoints,
  storedWindData,
  fuelConsumption,
  onHeightChange,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const { theme } = useTheme();
  const { height } = useBottomSidebarResize({
    onHeightChange,
    minHeight: 7, // Reduced minimum height
    maxHeight: 90,
  });

  const {
    isFullScreen,
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
        rounded-t-xl
        transition-all duration-300 ease-in-out
        border-t border-[var(--sidebar-border)]
        ${`gradient-${theme}`}
        w-full
        ${isCollapsed ? 'h-[80px]' : 'h-[50vh]'}
      `}
      style={{
        zIndex: 40,
      }}
    >
      {/* Collapse/Expand Handle */}
      <div
        className={`
          absolute -top-3 left-0 right-0
          h-10 z-50
          group cursor-ns-resize
          flex items-center justify-center
        `}
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <div className="absolute flex gap-1">
          <div className={`w-20 h-1.5 rounded-full ${`button-gradient-${theme}`}`} />
        </div>
      </div>

      {/* Main Content Container */}
      <div className={`
        h-full
        overflow-y-auto
        custom-scrollbar
        transition-all duration-300
        ${isCollapsed ? 'opacity-50' : 'opacity-100'}
      `}>
        {/* Header Component */}
        <Header
          waypoints={waypoints}
          isBottomMinimized={isCollapsed}
          isFullScreen={isFullScreen}
          handleFullScreen={handleFullScreen}
          handleMinimizeMaximize={() => setIsCollapsed(!isCollapsed)}
          handlePrint={handlePrint}
        />

        {/* Results Table Component */}
        <div className={`
          transition-all duration-300
          ${isCollapsed ? 'opacity-0 pointer-events-none' : 'opacity-100'}
        `}>
          <ResultsTable results={results} />
        </div>
      </div>
    </div>
  );
};

export default BottomSidebar;

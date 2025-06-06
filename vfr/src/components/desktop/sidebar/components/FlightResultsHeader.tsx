import React from 'react';

interface FlightResultsHeaderProps {
  waypointsLength: number;
  height: number;
  isBottomMinimized: boolean;
  handleFullScreen: () => void;
  handleMinimizeMaximize: () => void;
  handlePrint: () => void;
}

export const FlightResultsHeader: React.FC<FlightResultsHeaderProps> = ({
  waypointsLength,
  height,
  isBottomMinimized,
  handleFullScreen,
  handleMinimizeMaximize,
  handlePrint,
}) => {
  return (
    <div className="sticky top-0 z-10 bg-[var(--background)] p-4 border-b border-[var(--sidebar-border)]">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-[var(--foreground)]">
            Flight Results
          </h2>
          <span className="px-2 py-1 bg-[var(--background)] rounded-full text-sm font-medium">
            {waypointsLength > 1 ? waypointsLength - 1 : 0} legs
          </span>
        </div>
        <div className="flex items-center gap-2">
          {!isBottomMinimized && (
            <button
              className="w-6 h-6 rounded-full bg-green-500 hover:bg-green-400 flex items-center justify-center text-gray-800 text-xs"
              onClick={handleFullScreen}
              title={height >= 90 ? "Exit Full Screen" : "Full Screen"}
            >
              {height >= 90 ? "-" : "⌞ ⌝"}
            </button>
          )}
          {height < 90 && (
            <button
              className="w-6 h-6 rounded-full bg-yellow-500 hover:bg-yellow-400 flex items-center justify-center text-gray-800 text-xs"
              onClick={handleMinimizeMaximize}
              title={isBottomMinimized ? "Maximize" : "Minimize"}
            >
              {isBottomMinimized ? "+" : "-"}
            </button>
          )}
          <button
            className="bg-[var(--button-bg)] hover:bg-[var(--button-hover)] text-[var(--sidebar-text)] py-2 px-4 rounded-md
            transition-colors duration-200 flex items-center gap-2 hover:shadow-lg ml-2"
            onClick={handlePrint}
          >
            <span>Print</span>
            <span>🖨️</span>
          </button>
        </div>
      </div>
    </div>
  );
};

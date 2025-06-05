import React from 'react';
import { ScrollableContentProps } from '@/src/utils/types';
import { WaypointCard } from './WaypointCard';
import { useTheme } from '@/src/utils/ThemeContext';

export const ScrollableContent: React.FC<ScrollableContentProps> = ({
  isWaypointsVisible,
  setIsWaypointsVisible,
  waypoints,
  onWaypointUpdate,
  isFullScreen,
  handleNumericInput,
}) => {
  const { theme } = useTheme();
  return (
    <div className="flex-1 px-4 pb-6 overflow-hidden">
      <div className="border border-[var(--sidebar-border)] rounded-xl h-full flex flex-col shadow-lg">
        <button
          onClick={() => setIsWaypointsVisible(!isWaypointsVisible)}
          className={`
            w-full px-4 py-3
            ${`button-gradient-${theme}`}
            text-[var(--button-text)]
            hover:opacity-90
            transition-all duration-200
            font-semibold
            flex items-center justify-between
            rounded-t-xl
          `}
        >
          <span className="flex items-center gap-2">
            <span>📍</span>
            <span>Waypoints</span>
          </span>
          <span>{isWaypointsVisible ? "−" : "+"}</span>
        </button>

        <div className={`
          transition-all duration-300
          ease-in-out overflow-hidden flex-1
          ${`gradient-${theme}`}
        `}>
          <div className="h-full overflow-y-auto custom-scrollbar p-4">
            <div className={`
              ${isFullScreen ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-4"}
            `}>
              {waypoints.map((waypoint, absoluteIndex) => {
                if (!waypoint.visible) return null;
                const visibleIndex = waypoints.slice(0, absoluteIndex).filter((wp) => wp.visible).length;

                return (
                  <WaypointCard
                    key={absoluteIndex}
                    waypoint={waypoint}
                    absoluteIndex={absoluteIndex}
                    visibleIndex={visibleIndex}
                    onWaypointUpdate={onWaypointUpdate}
                    handleNumericInput={handleNumericInput}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

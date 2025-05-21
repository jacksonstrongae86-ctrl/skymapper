import React from 'react';
import { ScrollableContentProps } from '@/src/utils/types';
import { WaypointCard } from './WaypointCard';

export const ScrollableContent: React.FC<ScrollableContentProps> = ({
  isWaypointsVisible,
  setIsWaypointsVisible,
  waypoints,
  onWaypointUpdate,
  isFullScreen,
  handleNumericInput,
}) => {
  return (
    <div className="flex-1 px-6 pb-6 overflow-hidden">
      <div className="border border-[var(--sidebar-border)] rounded-lg h-full flex flex-col">
        {/* Header */}
        <button
          onClick={() => setIsWaypointsVisible(!isWaypointsVisible)}
          className="w-full px-4 py-2 bg-[var(--button-bg)] hover:bg-[var(--button-hover)]
            flex items-center justify-between text-sm font-medium border-b border-[var(--sidebar-border)] flex-none rounded-t-lg"
        >
          <span className="flex items-center gap-2 font-bold text-base text-[var(--button-text)]">
            <span>📍</span>
            <span>Waypoints</span>
          </span>
          <span>{isWaypointsVisible ? "−" : "+"}</span>
        </button>

        {/* Content */}
        <div className="transition-all duration-300 ease-in-out overflow-hidden flex-1">
          <div className="h-full overflow-y-auto custom-scrollbar p-4">
            <div
              className={`${
                isFullScreen
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                  : "space-y-4"
              }`}
            >
              {waypoints.map((waypoint, absoluteIndex) => {
                if (waypoint.visible === false) return null;

                // Calculate visible index
                const visibleIndex = waypoints
                  .slice(0, absoluteIndex)
                  .filter((wp) => wp.visible !== false).length;

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

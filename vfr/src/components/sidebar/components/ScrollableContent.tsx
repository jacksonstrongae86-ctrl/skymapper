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
    <div className="flex-1 px-4 pb-6 overflow-hidden">
      <div className="border border-[var(--sidebar-border)] rounded-2xl h-full flex flex-col shadow-md">
        <button
          onClick={() => setIsWaypointsVisible(!isWaypointsVisible)}
          className="w-full px-4 py-3 bg-gradient-to-r from-indigo-700 to-indigo-600 text-white hover:opacity-90 transition font-semibold flex items-center justify-between rounded-t-2xl"
        >
          <span className="flex items-center gap-2">
            <span>📍</span>
            <span>Waypoints</span>
          </span>
          <span>{isWaypointsVisible ? "−" : "+"}</span>
        </button>

        <div className={`transition-all duration-300 ease-in-out overflow-hidden flex-1`}>
          <div className="h-full overflow-y-auto custom-scrollbar p-4">
            <div className={`${isFullScreen ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-4"}`}>
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

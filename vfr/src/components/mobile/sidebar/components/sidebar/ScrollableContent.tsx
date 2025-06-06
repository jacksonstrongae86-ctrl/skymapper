import React from "react";
import { ScrollableContentProps } from "@/src/utils/types";
import { WaypointCard } from "./WaypointCard";

export const ScrollableContent: React.FC<ScrollableContentProps> = ({
  waypoints,
  onWaypointUpdate,
  isFullScreen,
  handleNumericInput,
}) => {

  return (
    <div className="flex-1 p-4 overflow-y-auto">
      <div className={`
        ${isFullScreen ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-4"}
      `}>
        {waypoints.map((waypoint, absoluteIndex) => {
          if (!waypoint.visible) return null;
          const visibleIndex = waypoints
            .slice(0, absoluteIndex)
            .filter((wp) => wp.visible).length;

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
  );
};

import React from "react";
import { ScrollableContentProps } from "@/src/utils/types";
import { WaypointCard } from "./WaypointCard";

export const ScrollableContent: React.FC<ScrollableContentProps> = ({
  waypoints,
  onWaypointUpdate,
  handleNumericInput,
}) => {
  return (
    <div className="flex flex-col">
      {/* Header opcional si necesitas título */}
      <div className="flex-shrink-0 px-4 pt-4 pb-2">
        <h3 className="text-sm font-medium text-[var(--foreground)] opacity-70">
          Waypoints ({waypoints.filter(wp => wp.visible).length})
        </h3>
      </div>

      {/* Contenedor scrolleable */}

        <div className={`
          flex flex-col gap-4
          overflow-y-auto
          custom-scrollbar
        `}>
          {waypoints.map((waypoint, absoluteIndex) => {
            if (!waypoint.visible) return null;
            const visibleIndex = waypoints
              .slice(0, absoluteIndex)
              .filter((wp) => wp.visible).length;

            return (
              <div
                key={absoluteIndex}
              >
                <WaypointCard
                  waypoint={waypoint}
                  absoluteIndex={absoluteIndex}
                  visibleIndex={visibleIndex}
                  onWaypointUpdate={onWaypointUpdate}
                  handleNumericInput={handleNumericInput}
                />
              </div>
            );
          })}
        </div>
      </div>
  );
};

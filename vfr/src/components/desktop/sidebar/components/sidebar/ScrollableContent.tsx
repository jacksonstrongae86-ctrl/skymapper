import React from "react";
import { ScrollableContentProps } from "@/src/utils/types";
import { WaypointCard } from "./WaypointCard";
import { useTheme } from "@/src/utils/ThemeContext";
import { MapPin, ChevronDown, ChevronUp } from "lucide-react";

export const ScrollableContent: React.FC<ScrollableContentProps> = ({
  isWaypointsVisible,
  setIsWaypointsVisible,
  waypoints,
  onWaypointUpdate,
  isFullScreen,
  handleNumericInput,
  onDeleteWaypoint,
  gal_liter,
}) => {
  const { theme } = useTheme();
  return (
    <div className="px-4 mb-4">
      <div className="border border-[var(--sidebar-border)] rounded-xl overflow-hidden shadow-lg">
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
          `}
        >
          <span className="flex items-center gap-2">
            <MapPin size={18} className="text-[var(--button-text)]" />
            <span>Waypoints</span>
          </span>
          {isWaypointsVisible ? (
            <ChevronUp size={18} className="text-[var(--button-text)]" />
          ) : (
            <ChevronDown size={18} className="text-[var(--button-text)]" />
          )}
        </button>

        <div
          id="waypoints-section"
          className={`
            transition-all duration-300 ease-in-out
            ${isWaypointsVisible ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"}
            ${`gradient-${theme}`}
            ${isWaypointsVisible ? "overflow-y-auto" : "overflow-hidden"}
            custom-scrollbar
          `}
        >
          {isWaypointsVisible && (
            <div className="p-4">
              <div
                className={`
                ${
                  isFullScreen
                    ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                    : "space-y-4"
                }
              `}
              >
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
                      onDeleteWaypoint={onDeleteWaypoint}
                      gal_liter={gal_liter}
                    />
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

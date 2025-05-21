import { useState, useCallback } from 'react';
import { LeafletMouseEvent } from 'leaflet';
import { Waypoint } from '../utils/types';
import { calculateTransitionWaypoint } from '../utils/logic';

export function useWaypoints(defaultTAS: number = 100) {
  const [waypoints, setWaypoints] = useState<Waypoint[]>([]);

  const handleWaypointUpdate = useCallback(
      (index: number, field: keyof Waypoint, value: Waypoint[keyof Waypoint]) => {
        setWaypoints((prev) => {
          const updated = [...prev];

          // Update the current waypoint
          updated[index] = {
            ...updated[index],
            [field]: value,
          };

          // Handle special waypoint types
          if (field === "type") {
            // If changing to a normal waypoint, remove any following transition waypoint
            if (value === "waypoint") {
              return updated.filter((wp, i) => {
                if (i === index + 1 && wp.visible === false) {
                  return false; // Remove the transition waypoint
                }
                return true;
              });
            }

            // If changing to a special type, handle transition waypoint creation
            if (["BOC", "TOC", "TOD", "BOD"].includes(value as string)) {
              // Remove any existing transition waypoints
              const filtered = updated.filter((wp, i) => {
                if (i > index && i < index + 2) {
                  return wp.visible !== false;
                }
                return true;
              });

              const currentWaypoint = filtered[index];
              const nextWaypoint = filtered[index + 1];

              if (nextWaypoint) {
                // Try to calculate transition waypoint
                const transitionWaypoint = calculateTransitionWaypoint(
                  currentWaypoint,
                  nextWaypoint,
                  value as "BOC" | "TOC" | "TOD" | "BOD"
                );

                if (transitionWaypoint) {
                  // Insert the transition waypoint after the current waypoint
                  filtered.splice(index + 1, 0, transitionWaypoint);
                  console.log("Added transition waypoint:", transitionWaypoint);
                  return filtered;
                }
              }

              return filtered;
            }
          }

          // Handle updates to parameters that affect transition waypoints
          if (
            ["altitudeChange", "rocRod", "iasClimbDescent"].includes(field) &&
            ["BOC", "TOC", "TOD", "BOD"].includes(updated[index].type)
          ) {
            // Remove existing transition waypoint
            const filtered = updated.filter((wp, i) => {
              if (i > index && i < index + 2) {
                return wp.visible !== false;
              }
              return true;
            });

            const currentWaypoint = filtered[index];
            const nextWaypoint = filtered[index + 1];

            if (nextWaypoint) {
              // Recalculate transition waypoint with new parameters
              const transitionWaypoint = calculateTransitionWaypoint(
                currentWaypoint,
                nextWaypoint,
                currentWaypoint.type as "BOC" | "TOC" | "TOD" | "BOD"
              );

              if (transitionWaypoint) {
                filtered.splice(index + 1, 0, transitionWaypoint);
                console.log("Updated transition waypoint:", transitionWaypoint);
                return filtered;
              }
            }

            return filtered;
          }

          return updated;
        });
      },
      []
    );

  const handleMapClick = useCallback(
      (e: LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;
        setWaypoints((prev) => [
          ...prev,
          {
            position: [lat, lng],
            type: "waypoint",
            altitude: 5000,
            ias: defaultTAS,
            altitudeChange: 100,
            rocRod: 500,
            iasClimbDescent: defaultTAS,
            visible: true,
          },
        ]);
      },
      [defaultTAS]
    );

    const handleDeleteLastWaypoint = () => {
      setWaypoints((prev) => prev.slice(0, -1));
    };

    const handleClearWaypoints = () => {
      setWaypoints([]);
    };

  return {
    waypoints,
    setWaypoints,
    handleWaypointUpdate,
    handleMapClick,
    handleDeleteLastWaypoint,
    handleClearWaypoints
  };
}

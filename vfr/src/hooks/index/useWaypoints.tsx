import { useState, useCallback } from "react";
import { LeafletMouseEvent } from "leaflet";
import { Waypoint } from "@/src/utils/types";
import { calculateTransitionWaypoint } from "@/src/utils/logic";

export function useWaypoints(defaultTAS: number = 100) {
  const [waypoints, setWaypoints] = useState<Waypoint[]>([]);

  const removeTransitionWaypointAfterIndex = (arr: Waypoint[], idx: number) => {
    if (arr.length > idx + 1 && arr[idx + 1].visible === false) {
      return [...arr.slice(0, idx + 1), ...arr.slice(idx + 2)];
    }
    return arr;
  };

  const handleWaypointUpdate = useCallback(
    (index: number, field: keyof Waypoint, value: Waypoint[keyof Waypoint]) => {
      setWaypoints((prev) => {
        const updated = [...prev];
        // Update selected waypoint
        updated[index] = { ...updated[index], [field]: value };

        // Remove transition waypoint after given index
        const clean = removeTransitionWaypointAfterIndex(updated, index);

        // When changing type to normal, remove invisible transition waypoint
        if (field === "type") {
          if (value === "waypoint") {
            // Reset to original altitude if it was a BOC/TOD
            if (clean[index].originalAltitude !== undefined) {
              clean[index] = {
                ...clean[index],
                altitude: clean[index].originalAltitude,
                originalAltitude: undefined
              };
            }
            return clean;
          }

          if (["BOC", "TOC", "TOD", "BOD"].includes(value as string)) {
            const currentWaypoint = clean[index];
            const nextWaypoint = clean[index + 1];
            if (!nextWaypoint) return clean;

            // Store original altitude before any modifications
            const originalAltitude = currentWaypoint.originalAltitude || currentWaypoint.altitude!;

            // Calculate transition waypoint
            const transitionWaypoint = calculateTransitionWaypoint(
              { ...currentWaypoint, originalAltitude },
              nextWaypoint,
              value as "BOC" | "TOC" | "TOD" | "BOD"
            );

            if (!transitionWaypoint) return clean;

            // Update current waypoint based on type
            const updatedClean = [...clean];
            if (value === "BOC" || value === "TOD") {
              // For BOC/TOD: current waypoint shows final altitude after climb/descent
              updatedClean[index] = {
                ...updatedClean[index],
                altitude: originalAltitude + updatedClean[index].altitudeChange!,
                originalAltitude: originalAltitude
              };
            } else {
              // For BOD/TOC: current waypoint keeps original altitude
              updatedClean[index] = {
                ...updatedClean[index],
                altitude: originalAltitude,
                originalAltitude: originalAltitude
              };
            }

            // Insert transition waypoint
            const newWaypoints = [
              ...updatedClean.slice(0, index + 1),
              transitionWaypoint,
              ...updatedClean.slice(index + 1),
            ];
            return newWaypoints;
          }
        }

        // Handle parameter changes that affect transition calculations
        if (
          ["altitudeChange", "rocRod", "iasClimbDescent"].includes(field) &&
          ["BOC", "TOC", "TOD", "BOD"].includes(updated[index].type)
        ) {
          const originWaypoint = updated[index];
          const nextWaypoint = updated[index + 1];
          if (!nextWaypoint) return updated;

          // Remove existing transition waypoint
          const cleaned = removeTransitionWaypointAfterIndex(updated, index);

          // Use original altitude for calculations
          const originalAltitude = originWaypoint.originalAltitude || originWaypoint.altitude!;
          const updatedAltitudeChange = field === "altitudeChange" ? (value as number) : originWaypoint.altitudeChange!;

          // Create waypoint with updated parameters for calculation
          const waypointForCalculation = {
            ...originWaypoint,
            altitudeChange: updatedAltitudeChange,
            originalAltitude: originalAltitude
          };

          // Recalculate transition waypoint
          const newTransitionWaypoint = calculateTransitionWaypoint(
            waypointForCalculation,
            nextWaypoint,
            originWaypoint.type as "BOC" | "TOC" | "TOD" | "BOD"
          );

          if (!newTransitionWaypoint) return cleaned;

          // Update current waypoint altitude based on type
          const finalCleaned = [...cleaned];
          if (originWaypoint.type === "BOC" || originWaypoint.type === "TOD") {
            // For BOC/TOD: show final altitude after climb/descent
            finalCleaned[index] = {
              ...finalCleaned[index],
              altitude: originalAltitude + updatedAltitudeChange,
              originalAltitude: originalAltitude
            };
          } else {
            // For BOD/TOC: keep original altitude in current waypoint
            finalCleaned[index] = {
              ...finalCleaned[index],
              altitude: originalAltitude,
              originalAltitude: originalAltitude
            };
          }

          // Insert new transition waypoint
          const finalWaypoints = [
            ...finalCleaned.slice(0, index + 1),
            newTransitionWaypoint,
            ...finalCleaned.slice(index + 1),
          ];

          return finalWaypoints;
        }

        // For all other cases return updated array
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
    handleClearWaypoints,
  };
}

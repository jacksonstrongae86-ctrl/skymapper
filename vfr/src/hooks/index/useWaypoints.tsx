import { useState, useCallback } from "react";
import { LeafletMouseEvent } from "leaflet";
import { Waypoint } from "@/src/utils/types";
import {
  IAStoTAS,
  getBearing,
  getGroundSpeed,
  calculateTransitionWaypoint
} from "@/src/utils/logic";

export function useWaypoints(defaultTAS: number = 100) {
  const [waypoints, setWaypoints] = useState<Waypoint[]>([]);

  const calculateSpecialSegment = (
    waypoint: Waypoint,
    nextWaypoint: Waypoint,
    type: "before" | "after",
    windInfo = { speed: 0, direction: 0 }
  ) => {
    const altChange = waypoint.altitudeChange || 0;
    const rocRod = waypoint.rocRod || 500;
    const ias = waypoint.iasClimbDescent || waypoint.ias;
    const altitude = waypoint.altitude || 5000;

    // Calculate time and distance
    const time = Math.abs(altChange) / rocRod; // minutes
    const tas = IAStoTAS(ias, altitude);
    const distance = (tas * time) / 60; // Convert to hours for distance

    // Calculate track and ground speed
    const from = type === "before" ? nextWaypoint : waypoint;
    const to = type === "before" ? waypoint : nextWaypoint;
    const track = getBearing(
      { lat: from.position[0], lng: from.position[1] },
      { lat: to.position[0], lng: to.position[1] }
    );
    const gs = getGroundSpeed(track, tas, windInfo.direction, windInfo.speed);

    return {
      distance,
      time,
      groundSpeed: gs,
      tas,
    };
  };

  const handleWaypointUpdate = useCallback(
    (index: number, field: keyof Waypoint, value: Waypoint[keyof Waypoint]) => {
      setWaypoints((prev) => {
        const updated = [...prev];
        updated[index] = { ...updated[index], [field]: value };

        // Handle type changes
        if (field === "type") {
          const currentWp = updated[index];
          const nextWp = updated[index + 1];
          if (!nextWp) return updated;

          // Reset special segments when changing to normal waypoint
          if (value === "waypoint") {
            if (currentWp.originalAltitude !== undefined) {
              currentWp.altitude = currentWp.originalAltitude;
              delete currentWp.originalAltitude;
            }
            // Remove transition waypoint if exists
            if (currentWp.transitionWaypointIndex !== undefined) {
              updated.splice(currentWp.transitionWaypointIndex, 1);
              delete currentWp.transitionWaypointIndex;
            }
            return updated;
          }

          // Handle special waypoint types
          if (["BOC", "TOC", "TOD", "BOD"].includes(value as string)) {
            // Store original altitude
            if (currentWp.originalAltitude === undefined) {
              currentWp.originalAltitude = currentWp.altitude;
            }

            // Calculate transition waypoint
            const transitionWp = calculateTransitionWaypoint(
              currentWp,
              nextWp,
              value as "BOC" | "TOC" | "TOD" | "BOD"
            );

            if (transitionWp) {
              // Insert transition waypoint after current waypoint
              const insertIndex = index + 1;
              updated.splice(insertIndex, 0, {
                ...transitionWp,
                type: "waypoint", // Transition waypoint is a normal waypoint
                visible: false, // Transition waypoint is not visible
                ias: currentWp.ias, // Inherit IAS from current waypoint
                isTransition: true, // Mark as transition waypoint
              });

              // Store transition waypoint index for future reference
              currentWp.transitionWaypointIndex = insertIndex;

              // Recalculate segments with transition waypoint
              const segmentBefore = calculateSpecialSegment(
                currentWp,
                updated[insertIndex],
                "before"
              );

              const segmentAfter = calculateSpecialSegment(
                updated[insertIndex],
                nextWp,
                "after"
              );

              // Update distances
              currentWp.normalDistance = segmentBefore.distance;
              currentWp.specialDistance = segmentAfter.distance;
            }
          }
        }

        // Handle parameter changes that affect calculations
        if (["altitudeChange", "rocRod", "iasClimbDescent"].includes(field)) {
          const currentWp = updated[index];
          if (["BOC", "TOC", "TOD", "BOD"].includes(currentWp.type)) {
            // Recalculate transition waypoint position
            if (currentWp.transitionWaypointIndex !== undefined) {
              const nextWp = updated[currentWp.transitionWaypointIndex + 1];
              if (!nextWp) return updated;

              const newTransitionWp = calculateTransitionWaypoint(
                currentWp,
                nextWp,
                currentWp.type as "BOC" | "TOC" | "TOD" | "BOD"
              );

              if (newTransitionWp) {
                // Update transition waypoint position
                updated[currentWp.transitionWaypointIndex] = {
                  ...updated[currentWp.transitionWaypointIndex],
                  position: newTransitionWp.position,
                  altitude: newTransitionWp.altitude,
                };

                // Recalculate segments
                const segmentBefore = calculateSpecialSegment(
                  currentWp,
                  updated[currentWp.transitionWaypointIndex],
                  "before"
                );

                const segmentAfter = calculateSpecialSegment(
                  updated[currentWp.transitionWaypointIndex],
                  nextWp,
                  "after"
                );

                // Update distances
                currentWp.normalDistance = segmentBefore.distance;
                currentWp.specialDistance = segmentAfter.distance;
              }
            }
          }
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
    handleClearWaypoints,
  };
}

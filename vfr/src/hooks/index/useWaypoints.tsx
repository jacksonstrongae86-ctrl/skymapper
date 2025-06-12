import { useState, useCallback } from "react";
import { LeafletMouseEvent } from "leaflet";
import { Waypoint, WindDataArray } from "@/src/utils/types";
import {
  IAStoTAS,
  getBearing,
  getGroundSpeed,
  calculateTransitionWaypoint
} from "@/src/utils/logic";

export function useWaypoints(defaultTAS: number = 100, storedWindData: WindDataArray = []) {
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

    // Calculate time
    const time = Math.abs(altChange) / rocRod; // minutes
    const tas = IAStoTAS(ias, altitude);

    // Calculate track and ground speed with wind
    const from = type === "before" ? nextWaypoint : waypoint;
    const to = type === "before" ? waypoint : nextWaypoint;
    const track = getBearing(
      { lat: from.position[0], lng: from.position[1] },
      { lat: to.position[0], lng: to.position[1] }
    );

    // Use actual wind data if available
    const gs = getGroundSpeed(track, tas, windInfo.direction, windInfo.speed);
    console.log(
      `Calculating ${type} segment: wind:${windInfo.direction}/${windInfo.speed} TAS: ${tas}, GS: ${gs}`
    );
    // Calculate distance using ground speed instead of TAS
    const distance = (gs * time) / 60; // Convert to hours for distance

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
        const currentWp = updated[index];

        // Handle type changes
        if (field === "type") {
          // First, remove any existing transition waypoint
          if (currentWp.transitionWaypointIndex !== undefined) {
            updated.splice(currentWp.transitionWaypointIndex, 1);
            // Update indices for waypoints after the removed transition
            updated.forEach((wp) => {
              if (wp.transitionWaypointIndex && wp.transitionWaypointIndex > currentWp.transitionWaypointIndex!) {
                wp.transitionWaypointIndex--;
              }
            });
            delete currentWp.transitionWaypointIndex;
          }

          // Update the type
          currentWp[field] = value as typeof currentWp[typeof field];
          const lastWaypoint = updated[index - 1];
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
            // Ensure required waypoints are defined
            const lastWaypoint = updated[index - 1];
            const nextWp = updated[index + 1];

            // Check requirements based on waypoint type
            if ((value === "TOC" || value === "BOD") && !lastWaypoint) {
              console.warn("Missing lastWaypoint for TOC/BOD calculation");
              return updated;
            }

            if ((value === "BOC" || value === "TOD") && !nextWp) {
              console.warn("Missing nextWp for BOC/TOD calculation");
              return updated;
            }

            // Store original altitude
            if (currentWp.originalAltitude === undefined) {
              currentWp.originalAltitude = currentWp.altitude;
            }

            // Calculate transition waypoint
            const transitionWp = calculateTransitionWaypoint(
              lastWaypoint,
              currentWp,
              nextWp,
              value as "BOC" | "TOC" | "TOD" | "BOD"
            );

            if (transitionWp) {
              let insertIndex;

              // For TOC and BOD, insert the transition waypoint **before** the current waypoint
              if (value === "TOC" || value === "BOD") {
                insertIndex = index;
              } else {
                // For BOC and TOD, insert the transition waypoint **after** the current waypoint
                insertIndex = index + 1;
              }

              updated.splice(insertIndex, 0, {
                ...transitionWp,
                type: "waypoint", // Transition waypoint is a normal waypoint
                visible: false, // Transition waypoint is not visible
                ias: currentWp.iasClimbDescent ?? defaultTAS, // Use specific IAS for BOC
                isTransition: true, // Mark as transition waypoint
              });

              // Store transition waypoint index for future reference
              currentWp.transitionWaypointIndex = insertIndex;

              // Recalculate segments with transition waypoint
              const segmentBefore = calculateSpecialSegment(
                updated[insertIndex - 1], // Previous waypoint
                updated[insertIndex],
                "before"
              );

              const segmentAfter = calculateSpecialSegment(
                updated[insertIndex],
                updated[insertIndex + 1],
                "after"
              );

              // Update distances
              currentWp.normalDistance = segmentBefore.distance;
              currentWp.specialDistance = segmentAfter.distance;
            }
          }
        }

        if (currentWp.type === "BOC" || currentWp.type === "TOD") {
          // Handle parameter changes that affect calculations
          if (["altitudeChange", "rocRod", "iasClimbDescent"].includes(field)) {
            const currentWp = updated[index];
            const lastWaypoint = updated[index - 1]; // Get the last waypoint
            if (["BOC", "TOC", "TOD", "BOD"].includes(currentWp.type)) {
              // Recalculate transition waypoint position
              if (currentWp.transitionWaypointIndex !== undefined) {
                const nextWp = updated[currentWp.transitionWaypointIndex + 1];
                if (!nextWp) return updated;

                const newTransitionWp = calculateTransitionWaypoint(
                  lastWaypoint, // Pass the last waypoint for TOC and BOD
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
                    ias: currentWp.iasClimbDescent ?? defaultTAS, // Update IAS for the transition waypoint
                    normalDistance: newTransitionWp.normalDistance,
                    specialDistance: newTransitionWp.specialDistance,
                  };
                }
              }
            }
          }
        }
        else if (currentWp.type === "TOC" || currentWp.type === "BOD") {
          // Handle parameter changes that affect calculations
          if (["altitudeChange", "rocRod", "iasClimbDescent"].includes(field)) {
            const currentWp = updated[index];
            const nextWp = updated[index + 1]; // Get the next waypoint
            if (["BOC", "TOC", "TOD", "BOD"].includes(currentWp.type)) {
              // Recalculate transition waypoint position
              if (currentWp.transitionWaypointIndex !== undefined) {
                const lastWaypoint = updated[currentWp.transitionWaypointIndex - 1];
                if (!lastWaypoint) return updated;
                const newTransitionWp = calculateTransitionWaypoint(
                  lastWaypoint, // Pass the last waypoint for TOC and BOD
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
                    ias: currentWp.iasClimbDescent ?? defaultTAS, // Update IAS for the transition waypoint
                    normalDistance: newTransitionWp.normalDistance,
                    specialDistance: newTransitionWp.specialDistance,
                  };
                }
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
          altitudeChange: 1500,
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

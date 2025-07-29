import { useState, useCallback } from "react";
import { LeafletMouseEvent } from "leaflet";
import { Waypoint, WindDataArray } from "@/src/utils/types";
import {
  IAStoTAS,
  getBearing,
  getGroundSpeed,
  calculateTransitionWaypoint,
} from "@/src/utils/logic";

import { getLocationNameWithRateLimit } from "@/src/utils/geocoding";
import { v4 as uuidv4 } from "uuid";

interface SavedRoute {
  id: string; // Unique ID (e.g. uuid)
  name: string; // User's name for the route
  waypoints: Waypoint[];
  lastModified: string; // ISO date string
}

// Get all saved routes
function getAllRoutesFromStorage(): Record<string, SavedRoute> {
  try {
    const raw = localStorage.getItem("routes");
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

// Save or update a route (by id)
function saveRouteToStorage(id: string, data: SavedRoute) {
  const all = getAllRoutesFromStorage();
  all[id] = data;
  localStorage.setItem("routes", JSON.stringify(all));
}

// Delete a route
function deleteRouteFromStorage(id: string) {
  const all = getAllRoutesFromStorage();
  delete all[id];
  localStorage.setItem("routes", JSON.stringify(all));
}

// Rename a route
function renameRouteInStorage(id: string, newName: string) {
  const all = getAllRoutesFromStorage();
  if (all[id]) {
    all[id].name = newName;
    all[id].lastModified = new Date().toISOString();
    localStorage.setItem("routes", JSON.stringify(all));
  }
}

export function useWaypoints(
  defaultTAS: number = 100,
  fuelConsumption: number = 8,
  storedWindData: WindDataArray = []
) {
  const [waypoints, setWaypoints] = useState<Waypoint[]>([]);
  const [geocodingErrors, setGeocodingErrors] = useState<Map<number, string>>(
    new Map()
  );
  const updateWaypointName = useCallback(
    async (index: number, lat: number, lng: number) => {
      try {
        // Clear any previous error for this waypoint
        setGeocodingErrors((prev) => {
          const newMap = new Map(prev);
          newMap.delete(index);
          return newMap;
        });

        const locationName = await getLocationNameWithRateLimit(lat, lng);

        setWaypoints((current) => {
          const updated = [...current];
          if (updated[index] && !updated[index].name?.includes("(Manual)")) {
            updated[index] = { ...updated[index], name: locationName };
          }
          return updated;
        });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Geocoding failed";

        setGeocodingErrors((prev) => new Map(prev).set(index, errorMessage));

        // Set fallback name
        setWaypoints((current) => {
          const updated = [...current];
          if (updated[index]) {
            updated[index] = {
              ...updated[index],
              name: `${lat.toFixed(3)},${lng.toFixed(3)}`,
            };
          }
          return updated;
        });
      }
    },
    []
  );

  const exitAltitude = useCallback((wp: Waypoint): number => {
    if (wp.isTransition) return wp.altitude;
    if ((wp.type === "BOC" || wp.type === "TOC") && wp.altitudeChange)
      return wp.altitude + wp.altitudeChange;
    if ((wp.type === "BOD" || wp.type === "TOD") && wp.altitudeChange)
      return wp.altitude - wp.altitudeChange;
    return wp.altitude;
  }, []);

  const lastRouteAltitude = useCallback(
    (wps: Waypoint[]): number =>
      wps.length ? exitAltitude(wps[wps.length - 1]) : 5000,
    [exitAltitude]
  );

  const calculateSpecialSegment = useCallback(
    (
      waypoint: Waypoint,
      nextWaypoint: Waypoint,
      type: "before" | "after",
      index: number // New parameter to receive the index of the waypoint
    ) => {
      const altChange = waypoint.altitudeChange || 0;
      const rocRod = waypoint.rocRod || 500;
      const ias = waypoint.iasClimbDescent || waypoint.ias;
      const altitude = waypoint.altitude || 5000;

      // Calculate time
      const time = Math.abs(altChange) / rocRod; // minutes
      const tas = IAStoTAS(ias, altitude);

      // Correctly assign 'from' and 'to' based on the segment type
      const from = type === "before" ? nextWaypoint : waypoint;
      const to = type === "before" ? waypoint : nextWaypoint;

      const track = getBearing(
        { lat: from.position[0], lng: from.position[1] },
        { lat: to.position[0], lng: to.position[1] }
      );

      // Use wind data based on the index, fallback to default values if unavailable
      const windDirection = storedWindData[index]?.direction || 0; // Default to 0° if no wind data
      const windSpeed = storedWindData[index]?.speed || 0; // Default to 0 knots if no wind data
      const gs = getGroundSpeed(track, tas, windDirection, windSpeed);

      // console.log(
      //   `Calculating ${type} segment: wind:${windDirection}/${windSpeed} TAS: ${tas}, GS: ${gs}, time: ${time} min`
      // );

      // Calculate distance using ground speed instead of TAS
      const distance = (gs * time) / 60; // Convert to hours for distance
      // console.log(
      //   `Distance for ${type} segment: ${distance} NM, Time: ${time} min, Ground Speed: ${gs}, TAS: ${tas}`
      // );

      return {
        distance,
        time,
        groundSpeed: gs,
        tas,
      };
    },
    [storedWindData]
  );

  const handleWaypointUpdate = useCallback(
    (index: number, field: keyof Waypoint, value: Waypoint[keyof Waypoint]) => {
      setWaypoints((prev) => {
        const updated = [...prev];

        /* ───────────────────────────────────────────────────────────────
           0.  POSITION CHANGE  →  update location name
        ──────────────────────────────────────────────────────────────── */
        if (field === "name") {
          const trimmedName = (value as string).trim();
          updated[index] = {
            ...updated[index],
            name: trimmedName,
            isManualName: true, // Mark as manually set
          };
          return updated;
        }
        if (field === "position") {
          const newPosition = value as [number, number];
          if (
            newPosition &&
            Array.isArray(newPosition) &&
            newPosition.length === 2
          ) {
            updated[index] = { ...updated[index], position: newPosition };

            // Only auto-update if name wasn't manually set
            if (!updated[index].isManualName) {
              updateWaypointName(index, newPosition[0], newPosition[1]);
            }
          }
          return updated;
        }

        /* ───────────────────────────────────────────────────────────────
         1.  ALTITUDE/ALTITUDE-CHANGE EDIT  →  cascade through route
      ──────────────────────────────────────────────────────────────── */
        if (field === "altitude" || field === "altitudeChange") {
          // update the edited waypoint first …
          updated[index] = { ...updated[index], [field]: value };

          // … then copy its exit altitude into every following waypoint
          for (let i = index + 1; i < updated.length; i++) {
            updated[i] = {
              ...updated[i],
              altitude: exitAltitude(updated[i - 1]),
            };
          }
        } else {
          // any other field: simple patch
          updated[index] = { ...updated[index], [field]: value };
        }

        const currentWp = updated[index];

        /* ───────────────────────────────────────────────────────────────
         2.  TYPE CHANGES  (BOC / TOC / TOD / BOD logic)
      ──────────────────────────────────────────────────────────────── */
        if (field === "type") {
          /* ---- 2 · 1  remove obsolete transition waypoint ------------ */
          if (currentWp.transitionWaypointIndex !== undefined) {
            updated.splice(currentWp.transitionWaypointIndex, 1);
            updated.forEach((wp) => {
              if (
                wp.transitionWaypointIndex &&
                wp.transitionWaypointIndex > currentWp.transitionWaypointIndex!
              ) {
                wp.transitionWaypointIndex--;
              }
            });
            delete currentWp.transitionWaypointIndex;
          }

          /* ---- 2 · 2  normal waypoint → restore & cascade ------------ */
          if (value === "waypoint") {
            if (currentWp.originalAltitude !== undefined) {
              currentWp.altitude = currentWp.originalAltitude;
              delete currentWp.originalAltitude;

              // CASCADE: propagate the restored altitude to following waypoints
              for (let i = index + 1; i < updated.length; i++) {
                updated[i] = {
                  ...updated[i],
                  altitude: exitAltitude(updated[i - 1]),
                };
              }
            }
            return updated;
          }

          /* ---- 2 · 3  special waypoint handling ---------------------- */
          if (["BOC", "TOC", "TOD", "BOD"].includes(value as string)) {
            const lastWp = updated[index - 1];
            const nextWp = updated[index + 1];
            if ((value === "TOC" || value === "BOD") && !lastWp) return updated;
            if ((value === "BOC" || value === "TOD") && !nextWp) return updated;

            if (currentWp.originalAltitude === undefined) {
              currentWp.originalAltitude = currentWp.altitude;
            }

            const transitionWp = calculateTransitionWaypoint(
              lastWp,
              currentWp,
              nextWp,
              value as "BOC" | "TOC" | "TOD" | "BOD"
            );
            if (!transitionWp) return updated;

            const insertIndex =
              value === "TOC" || value === "BOD" ? index : index + 1;

            updated.splice(insertIndex, 0, {
              ...transitionWp,
              type: "waypoint",
              visible: false,
              ias: currentWp.iasClimbDescent ?? defaultTAS,
              isTransition: true,
            });
            currentWp.transitionWaypointIndex = insertIndex;

            const segBefore = calculateSpecialSegment(
              updated[insertIndex - 1],
              updated[insertIndex],
              "before",
              insertIndex - 1
            );
            const segAfter = calculateSpecialSegment(
              updated[insertIndex],
              updated[insertIndex + 1],
              "after",
              insertIndex
            );

            currentWp.normalDistance = segBefore.distance;
            currentWp.specialDistance = segAfter.distance;

            // ✅ ADD THIS: CASCADE the new exit altitude to following waypoints
            if (value === "BOC" || value === "TOD") {
              for (let i = index + 1; i < updated.length; i++) {
                updated[i] = {
                  ...updated[i],
                  altitude: exitAltitude(updated[i - 1]),
                };
              }
            }
          }
        }

        /* ───────────────────────────────────────────────────────────────
         3.  PARAMETER CHANGES THAT AFFECT A SPECIAL WAYPOINT
      ──────────────────────────────────────────────────────────────── */
        const mustRecalc = [
          "altitudeChange",
          "rocRod",
          "iasClimbDescent",
          "specialFuel",
        ].includes(field);

        if (mustRecalc && ["BOC", "TOD"].includes(currentWp.type)) {
          const lastWp = updated[index - 1];
          if (
            currentWp.transitionWaypointIndex !== undefined &&
            lastWp &&
            updated[currentWp.transitionWaypointIndex + 1]
          ) {
            const nextWp = updated[currentWp.transitionWaypointIndex + 1];
            const newTransition = calculateTransitionWaypoint(
              lastWp,
              currentWp,
              nextWp,
              currentWp.type as "BOC" | "TOD"
            );
            if (newTransition) {
              updated[currentWp.transitionWaypointIndex] = {
                ...updated[currentWp.transitionWaypointIndex],
                position: newTransition.position,
                altitude: newTransition.altitude,
                ias: currentWp.iasClimbDescent ?? defaultTAS,
                normalDistance: newTransition.normalDistance,
                specialDistance: newTransition.specialDistance,
                specialFuel: newTransition.specialFuel,
              };
            }
          }
        }

        if (mustRecalc && ["TOC", "BOD"].includes(currentWp.type)) {
          const nextWp = updated[index + 1];
          if (
            currentWp.transitionWaypointIndex !== undefined &&
            nextWp &&
            updated[currentWp.transitionWaypointIndex - 1]
          ) {
            const lastWp = updated[currentWp.transitionWaypointIndex - 1];
            const newTransition = calculateTransitionWaypoint(
              lastWp,
              currentWp,
              nextWp,
              currentWp.type as "TOC" | "BOD"
            );
            if (newTransition) {
              updated[currentWp.transitionWaypointIndex] = {
                ...updated[currentWp.transitionWaypointIndex],
                position: newTransition.position,
                altitude: newTransition.altitude,
                ias: currentWp.iasClimbDescent ?? defaultTAS,
                normalDistance: newTransition.normalDistance,
                specialDistance: newTransition.specialDistance,
              };
            }
          }
        }

        return updated;
      });
    },
    [defaultTAS, calculateSpecialSegment, exitAltitude, updateWaypointName]
  );

  const handleMapClick = useCallback(
    (e: LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;

      setWaypoints((prev) => {
        const newIndex = prev.length;
        const newWaypoint = {
          position: [lat, lng] as [number, number],
          type: "waypoint" as const,
          altitude: lastRouteAltitude(prev),
          ias: defaultTAS,
          altitudeChange: 1500,
          rocRod: 500,
          iasClimbDescent: defaultTAS,
          specialFuel: fuelConsumption,
          visible: true,
          name: "Loading...",
        };

        updateWaypointName(newIndex, lat, lng);

        return [...prev, newWaypoint];
      });
    },
    [defaultTAS, fuelConsumption, lastRouteAltitude, updateWaypointName]
  );

  const handleDeleteWaypoint = useCallback(
    (index: number, isSpecial: boolean) => {
      setWaypoints((prev) => {
        const updated = [...prev];
        if (isSpecial) {
          // If the special waypoint has a transitionWaypointIndex, remove both
          const transitionIndex = updated[index].transitionWaypointIndex;
          if (
            typeof transitionIndex === "number" &&
            transitionIndex >= 0 &&
            transitionIndex < updated.length
          ) {
            // Remove the transition waypoint first (higher index first to avoid shifting)
            if (transitionIndex > index) {
              updated.splice(transitionIndex, 1);
              updated.splice(index, 1);
            } else {
              updated.splice(index, 1);
              updated.splice(transitionIndex, 1);
            }
          } else {
            // No transition waypoint, just remove the special waypoint
            updated.splice(index, 1);
          }
        } else {
          // Not special, just remove the waypoint
          updated.splice(index, 1);
        }
        return updated;
      });
    },
    []
  );

  const onAddSearchWaypoint = useCallback(
    (lat: number, lon: number, name: string) => {
      setWaypoints((prev) => {
        return [
          ...prev,
          {
            position: [lat, lon],
            type: "waypoint",
            altitude: lastRouteAltitude(prev),
            ias: defaultTAS,
            altitudeChange: 1500,
            rocRod: 500,
            iasClimbDescent: defaultTAS,
            specialFuel: fuelConsumption,
            visible: true,
            name,
          },
        ];
      });
    },
    [defaultTAS, fuelConsumption, lastRouteAltitude]
  );

  const handleDeleteLastWaypoint = () => {
    setWaypoints((prev) => prev.slice(0, -1));
  };

  const handleClearWaypoints = () => {
    setWaypoints([]);
  };

  const setManualWaypointName = useCallback((index: number, name: string) => {
    setWaypoints((prev) => {
      const updated = [...prev];
      if (updated[index]) {
        updated[index] = {
          ...updated[index],
          name: `${name} (Manual)`, // Mark as manually set
        };
      }
      return updated;
    });
  }, []);

  // List all saved routes
  const listSavedRoutes = useCallback((): SavedRoute[] => {
    return Object.values(getAllRoutesFromStorage());
  }, []);

  // Save current as new route (asks for name)
  const saveNewRoute = useCallback(
    (name: string) => {
      const id = uuidv4();
      saveRouteToStorage(id, {
        id,
        name,
        waypoints,
        lastModified: new Date().toISOString(),
      });
    },
    [waypoints]
  );

  // Overwrite an existing saved route
  const overwriteRoute = useCallback(
    (id: string, name?: string) => {
      const prev = getAllRoutesFromStorage()[id];
      if (!prev) return;
      saveRouteToStorage(id, {
        id,
        name: name ?? prev.name,
        waypoints,
        lastModified: new Date().toISOString(),
      });
    },
    [waypoints]
  );

  // Load a route by id
  const loadRoute = useCallback((id: string) => {
    const all = getAllRoutesFromStorage();
    if (all[id]) {
      setWaypoints(all[id].waypoints);
    }
  }, []);

  // Delete a route
  const deleteRoute = useCallback((id: string) => {
    deleteRouteFromStorage(id);
  }, []);

  // Rename route
  const renameRoute = useCallback((id: string, newName: string) => {
    renameRouteInStorage(id, newName);
  }, []);

  return {
    waypoints,
    setWaypoints,
    handleWaypointUpdate,
    handleMapClick,
    handleDeleteWaypoint,
    onAddSearchWaypoint,
    handleDeleteLastWaypoint,
    handleClearWaypoints,
    setManualWaypointName,
    geocodingErrors,
    listSavedRoutes,
    saveNewRoute,
    overwriteRoute,
    loadRoute,
    deleteRoute,
    renameRoute,
  };
}

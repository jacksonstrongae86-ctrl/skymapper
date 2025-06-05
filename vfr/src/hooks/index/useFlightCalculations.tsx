import { useState, useCallback } from 'react';
import { Waypoint, WindDataArray, LegCalculation } from '@/src/utils/types';
import { IAStoTAS, getDistance, getBearing, getHeading, getGroundSpeed } from '@/src/utils/logic';

export function useFlightCalculations() {
  const [legCalculations, setLegCalculations] = useState<LegCalculation[]>([]);

  const updateCalculations = useCallback(
    (waypoints: Waypoint[], storedWindData: WindDataArray | null, fuelConsumption: number) => {
        if (waypoints.length < 2 || !storedWindData) return;

            const newCalculations = waypoints.slice(0, -1).map((wp, i) => {
              const nextWp = waypoints[i + 1];
              const distance = getDistance(
                { lat: wp.position[0], lng: wp.position[1] },
                { lat: nextWp.position[0], lng: nextWp.position[1] }
              );
              const track = getBearing(
                { lat: wp.position[0], lng: wp.position[1] },
                { lat: nextWp.position[0], lng: nextWp.position[1] }
              );

              const windInfo = storedWindData[i] || { speed: 0, direction: 0 };
              const tas = IAStoTAS(wp.ias, wp.altitude / 100);
              const heading = getHeading(
                track,
                tas,
                windInfo.direction,
                windInfo.speed
              );
              const groundSpeed = getGroundSpeed(
                track,
                tas,
                windInfo.direction,
                windInfo.speed
              );
              const time = (distance / groundSpeed) * 60;
              const fuelBurn = (time / 60) * fuelConsumption;

              return {
                distance,
                track,
                heading,
                groundSpeed,
                time,
                fuelBurn,
              };
            });
            setLegCalculations(newCalculations);
    },
    []
  );

  return {
    legCalculations,
    updateCalculations
  };
}

import { useState, useCallback } from 'react';
import { Waypoint, WindDataArray } from '../utils/types';
import { fetchECMWFWindData } from '../services/windService';

export const useWindData = () => {
  const [storedWindData, setStoredWindData] = useState<WindDataArray | null>(null);
  const [selectedDateTime, setSelectedDateTime] = useState<string>("");

  const fetchWindData = useCallback(async (waypoints: Waypoint[]) => {
    if (waypoints.length === 0) return;

    const altitudesFt = waypoints.map((wp) => wp.altitude);
    const timestamp = selectedDateTime ? new Date(selectedDateTime) : new Date();

    const updatedWindData = await Promise.all(
      waypoints.map(async (wp, index) => {
        const { position } = wp;
        const [lat, lon] = position;

        const windData = await fetchECMWFWindData(
          lat,
          lon,
          [altitudesFt[index]],
          timestamp
        );

        const windInfo = windData.windData[0];
        console.log(`🌬️ Wind Data for Waypoint ${index + 1}:`, windInfo);

        return {
          speed: windInfo.speed || 0,
          direction: windInfo.direction || 0,
        };
      })
    );

    console.log("✅ Updated Wind Data:", updatedWindData);
    setStoredWindData(updatedWindData);
  }, [selectedDateTime]);

  return {
    storedWindData,
    selectedDateTime,
    setSelectedDateTime,
    fetchWindData
  };
};

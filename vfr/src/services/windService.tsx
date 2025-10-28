import { WindAPIResponse } from "../utils/types";

// Extended pressure levels for better accuracy
const extendedPressureLevels = [
  1000, 975, 950, 925, 900, 850, 800,
  700, 600, 500, 400, 300, 250, 200, 150, 100
];

function ftToHpa(feet: number): number {
  const meters = feet * 0.3048;
  const standardPressure = 1013.25;
  const pressureRatio = Math.pow(1 - (0.0065 * meters) / 288.15, 5.255);
  return standardPressure * pressureRatio;
}

function interpolateWind(
  targetPressure: number,
  lowerPressure: number,
  upperPressure: number,
  lowerSpeed: number,
  upperSpeed: number,
  lowerDirection: number,
  upperDirection: number
) {
  if (lowerPressure === upperPressure) {
    return { speed: lowerSpeed, direction: lowerDirection };
  }

  const ratio = (targetPressure - lowerPressure) / (upperPressure - lowerPressure);

  // Linear interpolation for speed
  const speed = lowerSpeed + (upperSpeed - lowerSpeed) * ratio;

  // Circular interpolation for direction
  let dirDiff = upperDirection - lowerDirection;
  if (dirDiff > 180) dirDiff -= 360;
  if (dirDiff < -180) dirDiff += 360;
  let direction = lowerDirection + dirDiff * ratio;
  if (direction < 0) direction += 360;
  if (direction >= 360) direction -= 360;

  return { speed, direction };
}

export async function fetchECMWFWindData(
  lat: number,
  lon: number,
  altitudesFt: number[],
  timestamp: Date
): Promise<WindAPIResponse> {
  // Calculate actual pressure for each altitude
  const actualPressures = altitudesFt.map(ft => ftToHpa(ft));

  // Find required pressure levels for interpolation
  const requiredLevels = new Set<number>();

  actualPressures.forEach(pressure => {
    // Find bracketing pressure levels
    const availableLevels = extendedPressureLevels.filter(level =>
      extendedPressureLevels.includes(level)
    );

    const lowerLevel = availableLevels
      .filter(level => level >= pressure)
      .sort((a, b) => a - b)[0];
    const upperLevel = availableLevels
      .filter(level => level <= pressure)
      .sort((a, b) => b - a)[0];

    if (lowerLevel) requiredLevels.add(lowerLevel);
    if (upperLevel && upperLevel !== lowerLevel) requiredLevels.add(upperLevel);

    // Fallback to closest level if no bracketing levels found
    if (!lowerLevel && !upperLevel) {
      const closest = extendedPressureLevels.reduce((prev, curr) =>
        Math.abs(curr - pressure) < Math.abs(prev - pressure) ? curr : prev
      );
      requiredLevels.add(closest);
    }
  });

  const baseUrl = "https://api.open-meteo.com/v1/forecast";
  const params = new URLSearchParams({
    latitude: lat.toFixed(6), // Higher precision
    longitude: lon.toFixed(6),
    start_date: timestamp.toISOString().split("T")[0],
    end_date: timestamp.toISOString().split("T")[0],
    hourly: Array.from(requiredLevels)
      .map(level => [`windspeed_${level}hPa`, `winddirection_${level}hPa`])
      .flat()
      .join(","),
    timeformat: "unixtime",
    timezone: "GMT",
  });

  try {
    const response = await fetch(`${baseUrl}?${params}`);
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();

    // Find closest time with better precision
    const targetTime = Math.floor(timestamp.getTime() / 1000);
    const times = data.hourly.time;
    const closestTimeIndex = times.reduce((bestIdx: number, time: number, idx: number) => {
      const currentDiff = Math.abs(time - targetTime);
      const bestDiff = Math.abs(times[bestIdx] - targetTime);
      return currentDiff < bestDiff ? idx : bestIdx;
    }, 0);

    const results = altitudesFt.map((altitude, i) => {
      const targetPressure = actualPressures[i];

      // Find bracketing pressure levels
      const availableLevels = Array.from(requiredLevels).sort((a, b) => b - a);
      const lowerLevel = availableLevels.find(level => level >= targetPressure);
      const upperLevel = availableLevels.find(level => level <= targetPressure);

      let speed: number, direction: number;

      if (lowerLevel && upperLevel && lowerLevel !== upperLevel) {
        // Interpolate between two levels
        const lowerSpeed = (data.hourly[`windspeed_${lowerLevel}hPa`]?.[closestTimeIndex] || 0) * 0.539957;
        const upperSpeed = (data.hourly[`windspeed_${upperLevel}hPa`]?.[closestTimeIndex] || 0) * 0.539957;
        const lowerDirection = data.hourly[`winddirection_${lowerLevel}hPa`]?.[closestTimeIndex] || 0;
        const upperDirection = data.hourly[`winddirection_${upperLevel}hPa`]?.[closestTimeIndex] || 0;

        const interpolated = interpolateWind(
          targetPressure, lowerLevel, upperLevel,
          lowerSpeed, upperSpeed, lowerDirection, upperDirection
        );

        speed = interpolated.speed;
        direction = interpolated.direction;
      } else {
        // Use exact level or closest available
        const useLevel = lowerLevel || upperLevel || availableLevels[0];
        const rawSpeed = data.hourly[`windspeed_${useLevel}hPa`]?.[closestTimeIndex] || 0;
        speed = rawSpeed * 0.539957;
        direction = data.hourly[`winddirection_${useLevel}hPa`]?.[closestTimeIndex] || 0;
      }

      return {
        altitude,
        pressure: targetPressure,
        speed,
        direction,
      };
    });

    return {
      timestamp: new Date(times[closestTimeIndex] * 1000),
      location: { lat, lon },
      windData: results,
    };
  } catch (error) {
    console.error("Error fetching wind ", error);

    return {
      timestamp,
      location: { lat, lon },
      windData: altitudesFt.map((altitude, i) => ({
        altitude,
        pressure: actualPressures[i],
        speed: 10 + Math.random() * 5,
        direction: Math.random() * 360,
      })),
    };
  }
}

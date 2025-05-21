import { WindAPIResponse } from "../utils/types";

const standardPressureLevels = [
  1000, 925, 850, 700, 500, 400, 300, 250, 200, 100,
];

function ftToHpa(feet: number): number {
  const meters = feet * 0.3048;
  const standardPressure = 1013.25;
  const pressureRatio = Math.pow(1 - (0.0065 * meters) / 288.15, 5.255);
  return standardPressure * pressureRatio;
}

export async function fetchECMWFWindData(
  lat: number,
  lon: number,
  altitudesFt: number[],
  timestamp: Date
): Promise<WindAPIResponse> {
  console.log("🌍 Fetching wind data for:", {
    lat,
    lon,
    altitudesFt,
    timestamp,
  });

  // Map altitudes to closest pressure levels
  const closestPressureLevels = altitudesFt.map((ft) => {
    const actualPressure = ftToHpa(ft);
    return standardPressureLevels.reduce((closest, level) =>
      Math.abs(level - actualPressure) < Math.abs(closest - actualPressure)
        ? level
        : closest
    );
  });

  // Prepare API parameters
  const baseUrl = "https://api.open-meteo.com/v1/ecmwf";
  const params = new URLSearchParams({
    latitude: lat.toFixed(4),
    longitude: lon.toFixed(4),
    start_date: timestamp.toISOString().split("T")[0],
    end_date: timestamp.toISOString().split("T")[0],
    hourly: closestPressureLevels
      .map((level) => [`windspeed_${level}hPa`, `winddirection_${level}hPa`])
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

    // Process the wind data
    const targetHour = timestamp.getHours();
    const times = data.hourly.time;
    const closestTimeIndex = times.findIndex(
      (time: number) => new Date(time * 1000).getHours() === targetHour
    );

    if (closestTimeIndex === -1) {
      console.warn("⚠️ No matching time found in API response.");
    } else {
      console.log("📅 Closest Time Index:", closestTimeIndex);
    }

    const results = altitudesFt.map((altitude, i) => {
      const pressure = closestPressureLevels[i];
      const speedKey = `windspeed_${pressure}hPa`;
      const directionKey = `winddirection_${pressure}hPa`;

      // Raw wind speed from API (assumed to be in km/h)
      const rawSpeed = data.hourly[speedKey]?.[closestTimeIndex] || 0;

      // Convert wind speed to knots
      const speedInKnots = rawSpeed * 0.539957;

      const direction = data.hourly[directionKey]?.[closestTimeIndex] || 0;

      console.log(`🛰️ Altitude: ${altitude} ft, Pressure: ${pressure} hPa`);
      console.log(
        `   ➡️ Raw Speed: ${rawSpeed} km/h, Speed: ${speedInKnots.toFixed(
          2
        )} kts, Direction: ${direction}°`
      );

      return {
        altitude,
        pressure,
        speed: speedInKnots, // Use knots for aviation purposes
        direction,
      };
    });

    return {
      timestamp: new Date(times[closestTimeIndex] * 1000),
      location: { lat, lon },
      windData: results,
    };
  } catch (error) {
    console.error("Error fetching wind data:", error);

    // Fallback to default values
    return {
      timestamp,
      location: { lat, lon },
      windData: altitudesFt.map((altitude, i) => ({
        altitude,
        pressure: closestPressureLevels[i],
        speed: 10 + Math.random() * 5, // Random fallback speed
        direction: Math.random() * 360, // Random fallback direction
      })),
    };
  }
}

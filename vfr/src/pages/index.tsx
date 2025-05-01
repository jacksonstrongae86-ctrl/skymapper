import React, { useState, useEffect, useCallback, JSX } from "react";
import dynamic from "next/dynamic";
import { LeafletMouseEvent } from "leaflet";
import Sidebar from "../components/sidebar/Sidebar";
import MapControls from "../components/map/MapControls";
import { Waypoint, WindData, WindDataArray } from "../utils/types";
import {
  IAStoTAS,
  getDistance,
  getBearing,
  getHeading,
  getGroundSpeed,
} from "../utils/logic";
// import WaypointInput from "../components/waypoints/WaypointInput";
import BottomSidebar from '../components/sidebar/BottomSidebar';

// Standard pressure levels accepted by Open-Meteo
const standardPressureLevels = [1000, 925, 850, 700, 500, 400, 300, 250, 200, 100];

// Function to convert altitude in feet to hPa
const ftToHpa = (altitudeFt: number): number => {
  // Simplified barometric formula
  return 1013.25 * Math.pow(1 - (altitudeFt / 145366.45), 5.25588);
};

const mapAltitudesToPressureLevels = (altitudesFt: number[]): number[] => {
  return altitudesFt.map((ft) => {
    const actualPressure = ftToHpa(ft);
    return standardPressureLevels.reduce((closest, level) =>
      Math.abs(level - actualPressure) < Math.abs(closest - actualPressure) ? level : closest
    );
  });
};

// Dynamically import MapComponent to avoid SSR issues
const MapComponent = dynamic(() => import("../components/map/MapComponent"), {
  ssr: false,
});

async function fetchECMWFWindData(
  lat: number,
  lon: number,
  altitudesFt: number[],
  timestamp: Date
): Promise<{
  timestamp: Date;
  location: { lat: number; lon: number };
  windData: { altitude: number; pressure: number; speed: number; direction: number }[];
}> {
console.log("🌍 Fetching wind data for:", { lat, lon, altitudesFt, timestamp });

  // Convert altitude in feet to pressure levels
  function ftToHpa(feet: number): number {
    const meters = feet * 0.3048; // Convert feet to meters
    const standardPressure = 1013.25;
    const pressureRatio = Math.pow(1 - (0.0065 * meters) / 288.15, 5.255);
    return standardPressure * pressureRatio;
  }

  // Standard pressure levels supported by Open-Meteo
  const standardPressureLevels = [1000, 925, 850, 700, 500, 400, 300, 250, 200, 100];

  // Map altitudes to closest pressure levels
  const closestPressureLevels = altitudesFt.map((ft) => {
    const actualPressure = ftToHpa(ft);
    return standardPressureLevels.reduce((closest, level) =>
      Math.abs(level - actualPressure) < Math.abs(closest - actualPressure) ? level : closest
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
      console.log(`   ➡️ Raw Speed: ${rawSpeed} km/h, Speed: ${speedInKnots.toFixed(2)} kts, Direction: ${direction}°`);

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

export default function Home() {
  const [waypoints, setWaypoints] = useState<Waypoint[]>([]);
  const [storedWindData, setStoredWindData] = useState<WindDataArray | null>(null);
  const [fuelConsumption, setFuelConsumption] = useState<number>(8);
  const [selectedDateTime, setSelectedDateTime] = useState<string>("");
  const [mapType, setMapType] = useState<string>("street");
  const [results, setResults] = useState<JSX.Element[]>([]);
  const defaultTAS = 100;
  const [sidebarWidth, setSidebarWidth] = useState(256);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [bottomHeight, setBottomHeight] = useState(25);

  const handleWaypointUpdate = useCallback((index: number, field: keyof Waypoint, value: any) => {
    setWaypoints((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        [field]: value,
      };
      return updated;
    });
  }, []);

  const handleMapClick = useCallback((e: LeafletMouseEvent) => {
    const { lat, lng } = e.latlng;
    setWaypoints(prev => [...prev, {
      position: [lat, lng],
      type: "waypoint",
      altitude: 5000,
      ias: defaultTAS,
      altitudeChange: 0,
      rocRod: 500,
      iasClimbDescent: defaultTAS,
    }]);
  }, [defaultTAS]);

  const handleDeleteLastWaypoint = () => {
    setWaypoints((prev) => prev.slice(0, -1));
  };

  const handleClearWaypoints = () => {
    setWaypoints([]);
  };

  const fetchWindData = async () => {
    if (waypoints.length === 0) return;

    // Extract altitudes from waypoints
    const altitudesFt = waypoints.map((wp) => wp.altitude);

    // Get the current timestamp or use the selected date/time
    const timestamp = selectedDateTime ? new Date(selectedDateTime) : new Date();

    // Fetch wind data using the ECMWF API logic
    const updatedWindData = await Promise.all(
      waypoints.map(async (wp, index) => {
        const { position } = wp;
        const [lat, lon] = position;

        const windData = await fetchECMWFWindData(lat, lon, [altitudesFt[index]], timestamp);

        // Extract the wind data for the current waypoint
        const windInfo = windData.windData[0]; // Since we're passing one altitude at a time
console.log(`🌬️ Wind Data for Waypoint ${index + 1}:`, windInfo);
  
        return {
          speed: windInfo.speed || 0,
          direction: windInfo.direction || 0,
        };
      })
    );

console.log("✅ Updated Wind Data:", updatedWindData);
    setStoredWindData(updatedWindData);
  };

  const updateCalculations = useCallback(() => {
    if (waypoints.length < 2 || !storedWindData) return;

    const newResults = waypoints.slice(0, -1).map((wp, i) => {
      const nextWp = waypoints[i + 1];
      const distance = getDistance(
        { lat: wp.position[0], lng: wp.position[1] },
        { lat: nextWp.position[0], lng: nextWp.position[1] }
      );
      const track = getBearing(
        { lat: wp.position[0], lng: wp.position[1] },
        { lat: nextWp.position[0], lng: nextWp.position[1] }
      );

// Use wind data specific to the current waypoint
      const windInfo = storedWindData[i] || { speed: 0, direction: 0 };
      const tas = IAStoTAS(wp.ias, wp.altitude / 100);
      const heading = getHeading(
        track,
        tas,
        windInfo.direction,
        windInfo.speed
      );
      const gs = getGroundSpeed(track, tas, windInfo.direction, windInfo.speed);
      const time = (distance / gs) * 60;
      const fuelBurn = (time / 60) * fuelConsumption;

    });

  }, [waypoints, storedWindData, fuelConsumption]);

  useEffect(() => {
    updateCalculations();
  }, [waypoints, storedWindData, updateCalculations]);

  return (
    <div className="relative h-screen">
      <Sidebar
        fuelConsumption={fuelConsumption}
        setFuelConsumption={setFuelConsumption}
        selectedDateTime={selectedDateTime}
        setSelectedDateTime={setSelectedDateTime}
        fetchWindData={fetchWindData}
        updateCalculations={updateCalculations}
        results={results}
        waypoints={waypoints}
        onWaypointUpdate={handleWaypointUpdate} // Ensure this is passed
        sidebarWidth={sidebarWidth}
        setSidebarWidth={setSidebarWidth}
        isMinimized={isMinimized}
        setIsMinimized={setIsMinimized}
        isFullScreen={isFullScreen}
        setIsFullScreen={setIsFullScreen}
      />
{/* <div className="w-1/4 bg-gray-800 text-white p-4 overflow-y-auto z-20">
        {waypoints.map((waypoint, index) => (
          <WaypointInput
            key={index}
            index={index + 1}
            type={waypoint.type}
            altitude={waypoint.altitude}
            ias={waypoint.ias}
            altitudeChange={waypoint.altitudeChange}
            rocRod={waypoint.rocRod}
            iasClimbDescent={waypoint.iasClimbDescent}
            onTypeChange={(value) => {
              const updatedWaypoints = [...waypoints];
              updatedWaypoints[index] = { ...waypoint, type: value };
              setWaypoints(updatedWaypoints);
            }}
            onAltitudeChange={(value) => {
              const updatedWaypoints = [...waypoints];
              updatedWaypoints[index] = {
                ...waypoint,
                altitude: parseFloat(value) || 0,
              };
              setWaypoints(updatedWaypoints);
            }}
            
            onIasChange={(value) => {
              const updatedWaypoints = [...waypoints];
              updatedWaypoints[index] = {
                ...waypoint,
                ias: parseFloat(value) || defaultTAS,
              };
              setWaypoints(updatedWaypoints);
            }}
            onAltitudeChangeChange={(value) => {
              const updatedWaypoints = [...waypoints];
              updatedWaypoints[index] = {
                ...waypoint,
                altitudeChange: parseFloat(value) || 0,
              };
              setWaypoints(updatedWaypoints);
            }}
            onRocRodChange={(value) => {
              const updatedWaypoints = [...waypoints];
              updatedWaypoints[index] = {
                ...waypoint,
                rocRod: parseFloat(value) || 500,
              };
              setWaypoints(updatedWaypoints);
            }}
            onIasClimbDescentChange={(value) => {
              const updatedWaypoints = [...waypoints];
              updatedWaypoints[index] = {
                ...waypoint,
                iasClimbDescent: parseFloat(value) || defaultTAS,
              };
              setWaypoints(updatedWaypoints);
            }}
          />
        ))}
      </div> */}

      {/* Main Map Area */}
      <div className="relative flex-1">
        <div 
          className="absolute inset-0 z-10"
          style={{ 
            height: `calc(100vh - ${bottomHeight}vh)` // Dynamic height based on BottomSidebar
          }}
        > 
          <MapComponent
            onMapClick={handleMapClick}
            waypoints={waypoints}
            setWaypoints={setWaypoints}
            mapType={mapType}
          />
        </div>
        <div className="absolute top-4 right-4 z-30">
          <MapControls
            mapType={mapType}
            setMapType={setMapType}
            onDeleteLastWaypoint={handleDeleteLastWaypoint}
            onClearWaypoints={handleClearWaypoints}
          />
        </div>
      </div>

      {/* Bottom Results Sidebar */}
      <BottomSidebar 
        waypoints={waypoints}
        storedWindData={storedWindData}
        fuelConsumption={fuelConsumption}
        sidebarWidth={sidebarWidth}
        isMinimized={isMinimized}
        isFullScreen={isFullScreen}
        onHeightChange={setBottomHeight}
      />
    </div>
  );
}

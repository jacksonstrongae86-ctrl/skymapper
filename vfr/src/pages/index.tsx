import React, { useState, useEffect, useCallback, JSX } from "react";
import dynamic from "next/dynamic";
import { LeafletMouseEvent } from "leaflet";
import Sidebar from "../components/sidebar/Sidebar";
import MapControls from "../components/map/MapControls";
import { Waypoint, WindData } from "../utils/types";
import {
  IAStoTAS,
  getDistance,
  getBearing,
  getHeading,
  getGroundSpeed,
} from "../utils/logic";

// Carga dinámica de componentes de react-leaflet para evitar problemas con SSR en Next.js
const MapComponent = dynamic(() => import("../components/map/MapComponent"), {
  ssr: false,
});

export default function Home() {
  const [waypoints, setWaypoints] = useState<Waypoint[]>([]);
  const [storedWindData, setStoredWindData] = useState<WindData | null>(null);
  const [sidebarActive, setSidebarActive] = useState<boolean>(false);
  const [fuelConsumption, setFuelConsumption] = useState<number>(8);
  const [selectedDateTime, setSelectedDateTime] = useState<string>("");
  const [mapType, setMapType] = useState<string>("street");
  const [results, setResults] = useState<JSX.Element[]>([]);
  const defaultTAS = 100;

  // Manejo de clics en el mapa
  const handleMapClick = useCallback((e: LeafletMouseEvent) => {
    const { lat, lng } = e.latlng;
    const newWaypoint: Waypoint = {
      position: [lat, lng],
      type: "waypoint",
      altitude: 5000,
      ias: defaultTAS,
      altitudeChange: 0,
      rocRod: 500,
      iasClimbDescent: defaultTAS,
    };
    setWaypoints((prev) => [...prev, newWaypoint]);
  }, []);

  const handleDeleteLastWaypoint = () => {
    setWaypoints((prev) => prev.slice(0, -1));
  };

  const handleClearWaypoints = () => {
    setWaypoints([]);
  };

  // Obtención de datos del viento
  const fetchWindData = async () => {
    if (waypoints.length < 2) return;

    const midLat =
      waypoints.reduce((sum, wp) => sum + wp.position[0], 0) / waypoints.length;
    const midLon =
      waypoints.reduce((sum, wp) => sum + wp.position[1], 0) / waypoints.length;

    try {
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${midLat}&longitude=${midLon}&hourly=windspeed_180m,winddirection_180m`
      );
      const data = await response.json();
      setStoredWindData({
        speed: data.hourly.windspeed_180m[0],
        direction: data.hourly.winddirection_180m[0],
      });
    } catch (error) {
      console.error("Error fetching wind data:", error);
      setStoredWindData({ speed: 0, direction: 0 });
    }
  };

  const updateCalculations = useCallback(() => {
    if (waypoints.length < 2) return;

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
      const windInfo = storedWindData || { speed: 0, direction: 0 };
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

      return (
        <tr key={i}>
          <td>WP{i + 1}</td>
          <td>{distance.toFixed(1)}</td>
          <td>{track.toFixed(0)}</td>
          <td>{heading.toFixed(0)}</td>
          <td>{gs.toFixed(0)}</td>
          <td>{time.toFixed(1)}</td>
          <td>{tas.toFixed(0)}</td>
          <td>{fuelBurn.toFixed(1)}</td>
          <td>
            💨 {windInfo.speed.toFixed(1)} kt @ {windInfo.direction.toFixed(0)}°
          </td>
        </tr>
      );
    });

    setResults(newResults);
  }, [waypoints, storedWindData, fuelConsumption]);

  useEffect(() => {
    updateCalculations();
  }, [waypoints, storedWindData, updateCalculations]);

  return (
    <div id="container">
      <Sidebar
        sidebarActive={sidebarActive}
        setSidebarActive={setSidebarActive}
        fuelConsumption={fuelConsumption}
        setFuelConsumption={setFuelConsumption}
        selectedDateTime={selectedDateTime}
        setSelectedDateTime={setSelectedDateTime}
        fetchWindData={fetchWindData}
        updateCalculations={updateCalculations}
        waypoints={waypoints}
        results={results}
      />

      <MapComponent
        onMapClick={handleMapClick}
        waypoints={waypoints}
        setWaypoints={setWaypoints}
        mapType={mapType}
      />

      <MapControls
        sidebarActive={sidebarActive}
        setSidebarActive={setSidebarActive}
        mapType={mapType}
        setMapType={setMapType}
        onDeleteLastWaypoint={handleDeleteLastWaypoint}
        onClearWaypoints={handleClearWaypoints}
      />
    </div>
  );
}

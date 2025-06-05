import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useWaypoints } from "../hooks/index/useWaypoints";
import { useFlightCalculations } from "../hooks/index/useFlightCalculations";
import { useUIState } from "../hooks/index/useUIState";
import { useWindData } from "../hooks/index/useWindData";
import Sidebar from "../components/sidebar/Sidebar";
import MapControls from "../components/map/MapControls";
import BottomSidebar from "../components/sidebar/BottomSidebar";

const MapComponent = dynamic(() => import("../components/map/MapComponent"), {
  ssr: false,
});

export default function Home() {
  const defaultTAS = 100;
  const {
    waypoints,
    handleWaypointUpdate,
    handleMapClick,
    handleDeleteLastWaypoint,
    handleClearWaypoints,
  } = useWaypoints(defaultTAS);

  const { legCalculations, updateCalculations } = useFlightCalculations();
  const uiState = useUIState();
  const {
    storedWindData,
    selectedDateTime,
    setSelectedDateTime,
    fetchWindData,
  } = useWindData();
  const [fuelConsumption, setFuelConsumption] = useState<number>(8);
  useEffect(() => {
    if (waypoints.length > 0) {
      fetchWindData(waypoints);
    }
  }, [waypoints, selectedDateTime, fetchWindData]);

  useEffect(() => {
    if (waypoints.length > 0 && storedWindData) {
      updateCalculations(waypoints, storedWindData, fuelConsumption);
    }
  }, [waypoints, storedWindData, fuelConsumption, updateCalculations]);

  return (
    <div className="relative h-screen">
      <Sidebar
        results={undefined}
        {...uiState}
        fuelConsumption={fuelConsumption}
        setFuelConsumption={setFuelConsumption}
        selectedDateTime={selectedDateTime}
        setSelectedDateTime={setSelectedDateTime}
        fetchWindData={() => fetchWindData(waypoints)}
        updateCalculations={() =>
          updateCalculations(waypoints, storedWindData, fuelConsumption)
        }
        waypoints={waypoints}
        onWaypointUpdate={handleWaypointUpdate}
      />

      <div className="relative flex-1">
        <div
          className="absolute inset-0 z-10"
          style={{
            height: `calc(100vh - ${uiState.bottomHeight}vh)`,
          }}
        >
          <MapComponent
            onMapClick={handleMapClick}
            waypoints={waypoints}
            mapType={uiState.mapType}
            onWaypointUpdate={handleWaypointUpdate}
          />
        </div>
        <div className="absolute top-4 right-4 z-30">
          <MapControls
            mapType={uiState.mapType}
            setMapType={uiState.setMapType}
            onDeleteLastWaypoint={handleDeleteLastWaypoint}
            onClearWaypoints={handleClearWaypoints}
          />
        </div>
      </div>

      <BottomSidebar
        waypoints={waypoints}
        storedWindData={storedWindData}
        fuelConsumption={fuelConsumption}
        legCalculations={legCalculations}
        {...uiState}
      />
    </div>
  );
}

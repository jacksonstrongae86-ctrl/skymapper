import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useWaypoints } from "../hooks/index/useWaypoints";
import { useFlightCalculations } from "../hooks/index/useFlightCalculations";
import { useUIState } from "../hooks/index/useUIState";
import { useWindData } from "../hooks/index/useWindData";
import { useIsMobile } from "../hooksMobile/useIsMobile";
import Sidebar from "../components/desktop/sidebar/Sidebar";
import MobileSidebar from "../components/mobile/sidebar/Sidebar";
import MapControls from "../components/desktop/map/MapControls";

import BottomSidebar from "../components/desktop/sidebar/BottomSidebar";
import MobileBottomSidebar from "../components/mobile/sidebar/BottomSidebar";

const MapComponent = dynamic(
  () => import("../components/desktop/map/MapComponent"),
  {
    ssr: false,
  }
);

const MobileMapComponent = dynamic(
  () => import("../components/mobile/map/MapComponent"),
  {
    ssr: false,
  }
);

export default function Home() {
  const defaultTAS = 100;
  const [gal_liter, set_gal_liter] = useState<string>("Gal");
  const [fuelConsumption, setFuelConsumption] = useState<number>(8);
  const { legCalculations, updateCalculations } = useFlightCalculations();
  const uiState = useUIState();
  const {
    storedWindData,
    selectedDateTime,
    setSelectedDateTime,
    fetchWindData,
  } = useWindData();
  const {
    waypoints,
    handleWaypointUpdate,
    handleDeleteWaypoint,
    handleMapClick,
    handleDeleteLastWaypoint,
    onAddSearchWaypoint,
    handleClearWaypoints,
  } = useWaypoints(defaultTAS, fuelConsumption, storedWindData ?? []);

  const isMobile = useIsMobile();
  // Shared state for both sidebar heights
  const [topSidebarHeight, setTopSidebarHeight] = useState(25);
  const [bottomSidebarHeight, setBottomSidebarHeight] = useState(25);

  // Handler for top sidebar height changes
  const handleTopSidebarHeightChange = (height: number) => {
    setTopSidebarHeight(height);
  };

  // Handler for bottom sidebar height changes
  const handleBottomSidebarHeightChange = (height: number) => {
    setBottomSidebarHeight(height);
  };
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

  // OpenAIP
  const [showAviationData, setShowAviationData] = useState(true);
  const [aviationLayers, setAviationLayers] = useState({
    airports: true,
    airspaces: false,
    navigation: false,
    obstacles: false,
    hotspots: false,
  });

  const handleLayerToggle = (
    layer: keyof typeof aviationLayers,
    enabled: boolean
  ) => {
    setAviationLayers((prev) => ({
      ...prev,
      [layer]: enabled,
    }));
  };

  const [selectedCountry, setSelectedCountry] = useState("es");
  return (
    <div className="relative h-screen flex flex-col">
      <title>Skymapper - Plan your VFR flight routes with ease</title>
      <meta></meta>
      {isMobile ? (
        <div className="flex flex-col h-full">
          <div className="flex-none">
            <MobileSidebar
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
              onDeleteWaypoint={handleDeleteWaypoint}
              onHeightChange={handleTopSidebarHeightChange}
              bottomSidebarHeight={bottomSidebarHeight}
              gal_liter={gal_liter}
              set_gal_liter={set_gal_liter}
            />
          </div>
          <div className="flex-1 relative mt-0">
            <MobileMapComponent
              onMapClick={handleMapClick}
              waypoints={waypoints}
              mapType={uiState.mapType}
              onWaypointUpdate={handleWaypointUpdate}
              onDeleteLastWaypoint={handleDeleteLastWaypoint}
              onClearWaypoints={handleClearWaypoints}
              setMapType={uiState.setMapType}
              onAddSearchWaypoint={onAddSearchWaypoint}
              showAviationData={showAviationData}
              onToggleAviationData={setShowAviationData}
              aviationLayers={aviationLayers}
              onLayerToggle={handleLayerToggle}
              selectedCountry={selectedCountry}
              onCountryChange={setSelectedCountry}
            />
          </div>

          <div className="flex-none">
            <MobileBottomSidebar
              waypoints={waypoints}
              storedWindData={storedWindData}
              fuelConsumption={fuelConsumption}
              legCalculations={legCalculations}
              {...uiState}
              onHeightChange={handleBottomSidebarHeightChange}
              topSidebarHeight={topSidebarHeight}
              gal_liter={gal_liter}
              set_gal_liter={set_gal_liter}
            />
          </div>
        </div>
      ) : (
        <>
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
            onDeleteWaypoint={handleDeleteWaypoint}
            gal_liter={gal_liter}
            set_gal_liter={set_gal_liter}
          />

          <div className="relative flex-1 h-full">
            <div className="absolute inset-0 z-20">
              <MapComponent
                onMapClick={handleMapClick}
                waypoints={waypoints}
                mapType={uiState.mapType}
                onWaypointUpdate={handleWaypointUpdate}
                showAviationData={showAviationData}
                aviationLayers={aviationLayers}
                selectedCountry={selectedCountry}
                onCountryChange={setSelectedCountry}
              />
            </div>
            <div className="absolute top-4 right-4 z-30">
              <MapControls
                mapType={uiState.mapType}
                setMapType={uiState.setMapType}
                onDeleteLastWaypoint={handleDeleteLastWaypoint}
                onClearWaypoints={handleClearWaypoints}
                onAddSearchWaypoint={onAddSearchWaypoint}
                showAviationData={showAviationData}
                onToggleAviationData={setShowAviationData}
                aviationLayers={aviationLayers}
                onLayerToggle={handleLayerToggle}
                selectedCountry={selectedCountry}
                onCountryChange={setSelectedCountry}
              />
            </div>
          </div>

          <BottomSidebar
            waypoints={waypoints}
            storedWindData={storedWindData}
            fuelConsumption={fuelConsumption}
            legCalculations={legCalculations}
            {...uiState}
            gal_liter={gal_liter}
            set_gal_liter={set_gal_liter}
          />
        </>
      )}
    </div>
  );
}

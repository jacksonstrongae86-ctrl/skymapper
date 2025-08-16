import React, { useEffect, useMemo, useRef } from "react";
import { Map } from "leaflet";
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  useMapEvents,
  Circle,
  Polygon,
} from "react-leaflet";
import { Airspace, getCountryCenter, Waypoint } from "../../../utils/types";
import { LeafletMouseEvent } from "leaflet";
import "leaflet/dist/leaflet.css";
import { useMapHandlers } from "../../../hooksMobile/index/useMapHandlers";
import { createWaypointIcon } from "../../../components/mobile/map/createWaypointIcon";
import { useTheme } from "@/src/utils/ThemeContext";
import { useState } from "react";
import { X } from "lucide-react";
import MobileMapControls from "@/src/components/mobile/map/MapControls";
import {
  AviationMarker,
  convertAviationDataToMarkers,
  extractPolygonCoordinates,
} from "@/src/utils/aviationUtils";
import { useAviationData } from "@/src/hooks/index/useAviationData";
import ClusteredAviationMarkers from "../../desktop/map/ClusteredAviationMarkers";
import { detectUserCountry } from "../../../utils/countryDetection";

type MapComponentProps = {
  onMapClick: (e: LeafletMouseEvent) => void;
  waypoints: Waypoint[];
  mapType: string;
  onWaypointUpdate: (
    index: number,
    field: keyof Waypoint,
    value: Waypoint[keyof Waypoint]
  ) => void;
  onDeleteLastWaypoint: () => void;
  onClearWaypoints: () => void;
  setMapType: (type: string) => void;
  onAddSearchWaypoint: (lat: number, lon: number, name: string) => void;
};
type AviationLayerKey =
  | "airports"
  | "airspaces"
  | "navigation"
  | "obstacles"
  | "hotspots"
  | "reportingpoints"

interface SavedRoute {
  id: string; // Unique ID (e.g. uuid)
  name: string; // User's name for the route
  waypoints: Waypoint[];
  lastModified: string; // ISO date string
}

interface ExtendedMapComponentProps extends MapComponentProps {
  showAviationData: boolean;
  onToggleAviationData: (enabled: boolean) => void;
  aviationLayers: {
    airports: boolean;
    airspaces: boolean;
    navigation: boolean;
    obstacles: boolean;
    hotspots: boolean;
    reportingpoints: boolean;
  };
  onLayerToggle: (layer: AviationLayerKey, enabled: boolean) => void;
  selectedCountry: string;
  onCountryChange: (country: string) => void;
  listSavedRoutes: () => SavedRoute[];
  saveNewRoute: (name: string) => void;
  overwriteRoute: (id: string, name?: string) => void;
  loadRoute: (id: string) => void;
  deleteRoute: (id: string) => void;
  renameRoute: (id: string, name: string) => void;
}

const MapComponent: React.FC<ExtendedMapComponentProps> = ({
  onMapClick,
  waypoints,
  mapType,
  onWaypointUpdate,
  onDeleteLastWaypoint,
  onClearWaypoints,
  setMapType,
  onAddSearchWaypoint,
  showAviationData,
  onToggleAviationData,
  aviationLayers,
  onLayerToggle,
  selectedCountry,
  onCountryChange,
  listSavedRoutes,
  saveNewRoute,
  overwriteRoute,
  loadRoute,
  deleteRoute,
  renameRoute,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { theme } = useTheme();
  const validMapTypes = ["street", "sat", "hybrid", "terrain"];
  const mapTypeUrl = validMapTypes.includes(mapType) ? mapType : "sat";
  const { onWaypointDrag } = useMapHandlers(onWaypointUpdate);
  const mapRef = useRef<Map | null>(null);
  const [countryDetected, setCountryDetected] = useState(false);
  useEffect(() => {
    const detectAndSetCountry = async () => {
      if (!countryDetected) {
        try {
          const detectedCountry = await detectUserCountry();
          onCountryChange(detectedCountry);
          setCountryDetected(true);
          // console.log('Auto-detected country:', detectedCountry);
        } catch (error) {
          console.error("Failed to detect country:", error);
          setCountryDetected(true);
        }
      }
    };

    detectAndSetCountry();
  }, [countryDetected, onCountryChange]);
  const mapCenter = getCountryCenter(selectedCountry);
  useEffect(() => {
    if (mapRef.current) {
      const newCenter = getCountryCenter(selectedCountry);
      mapRef.current.setView(newCenter, 6);
      // console.log('Desktop map center updated to:', newCenter, 'for country:', selectedCountry);
    }
  }, [selectedCountry]);

  // Load aviation data
  const {
    airports,
    airspaces,
    navigation,
    obstacles,
    hotspots,
    reportingpoints,
    loading,
    error,
  } = useAviationData(selectedCountry);

  // Debug: Log the loaded data
  // console.log("Aviation Data Debug:", {
  //   loading,
  //   error,
  //   airports: airports.length,
  //   airspaces: airspaces.length,
  //   navigation: navigation.length,
  //   obstacles: obstacles.length,
  //   hotspots: hotspots.length,
  //   showAviationData,
  //   aviationLayers,
  // });

  // Convert aviation data to markers
  const aviationMarkers = useMemo(() => {
    // console.log(
    //   "useMemo running - showAviationData:",
    //   showAviationData,
    //   "loading:",
    //   loading
    // );

    if (!showAviationData) return [];

    // Wait for loading to complete
    if (loading) {
      // console.log("Still loading aviation data...");
      return [];
    }

    // Check if we have any data at all
    const hasData =
      airports.length > 0 ||
      airspaces.length > 0 ||
      navigation.length > 0 ||
      obstacles.length > 0 ||
      hotspots.length > 0 ||
      reportingpoints.length > 0;

    if (!hasData) {
      // console.log("No aviation data available yet");
      return [];
    }

    const filteredAirports = aviationLayers.airports ? airports : [];
    const filteredAirspaces = aviationLayers.airspaces ? airspaces : [];
    const filteredNavigation = aviationLayers.navigation ? navigation : [];
    const filteredObstacles = aviationLayers.obstacles ? obstacles : [];
    const filteredHotspots = aviationLayers.hotspots ? hotspots : [];
    const filteredReportingPoints = aviationLayers.reportingpoints ? reportingpoints : [];

    // console.log("Processing aviation data into markers...");
    // console.log("Filtered Aviation Data:", {
    //   airports: filteredAirports.length,
    //   airspaces: filteredAirspaces.length,
    //   navigation: filteredNavigation.length,
    //   obstacles: filteredObstacles.length,
    //   hotspots: filteredHotspots.length,
    // });

    const markers = convertAviationDataToMarkers(
      filteredAirports,
      filteredAirspaces,
      filteredNavigation,
      filteredObstacles,
      filteredHotspots,
      filteredReportingPoints,
    );

    // console.log("Successfully generated markers:", markers.length);
    return markers;
  }, [
    showAviationData,
    aviationLayers,
    airports,
    airspaces,
    navigation,
    obstacles,
    reportingpoints,
    hotspots,
    loading,
  ]);

  // Debug: Show loading state
  if (loading) {
    // console.log("Aviation data is loading...");
  }

  if (error) {
    console.error("Aviation data error:", error);
  }

  return (
    <div
      className={`
    ${
      isExpanded
        ? "fixed top-0 left-0 w-full h-full z-50"
        : "relative h-full z-30"
    }
    transition-all duration-300 ease-in-out
  `}
      onClick={() => {
        if (!isExpanded) setIsExpanded(true);
      }}
    >
      <MapContainer
        ref={mapRef}
        center={mapCenter}
        zoom={10}
        style={{ height: "100%", width: "100%" }}
        zoomControl={isExpanded}
        className="z[9999]"
      >
        <MapEvents onMapClick={onMapClick} isExpanded={isExpanded} />

        <TileLayer
          url={
            mapTypeUrl === "street"
              ? "https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
              : mapTypeUrl === "sat"
              ? "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              : mapTypeUrl === "hybrid"
              ? "https://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}"
              : mapTypeUrl === "terrain"
              ? "https://{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}"
              : "https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
          }
          attribution="&copy; OpenStreetMap contributors"
          subdomains={["mt0", "mt1", "mt2", "mt3"]}
        />

        {waypoints
          .filter((wp) => wp.visible !== false)
          .map((waypoint, absoluteIndex) => {
            return (
              <Marker
                key={absoluteIndex}
                position={waypoint.position}
                draggable={true}
                icon={createWaypointIcon(waypoint.type, theme)}
                eventHandlers={{
                  dragend: (e) => {
                    const newPosition: [number, number] = [
                      e.target.getLatLng().lat,
                      e.target.getLatLng().lng,
                    ];
                    onWaypointDrag(absoluteIndex, newPosition);
                  },
                }}
              />
            );
          })}
        {/* Aviation data with clustering */}
        {showAviationData && (
          <ClusteredAviationMarkers
            markers={aviationMarkers}
            theme={theme}
            airports={airports}
            // onMarkerClick={(marker) =>
            //   console.log(`${marker.type} clicked:`, marker)
            // }
          />
        )}

        {/* Keep the non-clustered elements like circles and polygons */}
        {showAviationData &&
          aviationMarkers.map((marker: AviationMarker) => {
            const { data, type, position } = marker;

            switch (type) {
              case "airport":
                return (
                  <Circle
                    key={`circle-${marker.id}`}
                    center={position}
                    radius={3000}
                    pathOptions={{
                      color: "#1e40af",
                      fillColor: "#1e40af",
                      fillOpacity: 0.08,
                      weight: 1,
                      dashArray: "5, 5",
                    }}
                  />
                );

              case "airspace":
                const airspace = data as Airspace;
                const polygonCoords = extractPolygonCoordinates(
                  airspace.geometry
                );

                if (polygonCoords) {
                  return (
                    <Polygon
                      key={`polygon-${marker.id}`}
                      positions={polygonCoords}
                      pathOptions={{
                        color: "#dc2626",
                        fillColor: "#dc2626",
                        fillOpacity: 0.1,
                        weight: 2,
                      }}
                    />
                  );
                }
                break;

              case "navigation":
                return (
                  <Circle
                    key={`nav-circle-${marker.id}`}
                    center={position}
                    radius={2000}
                    pathOptions={{
                      color: "#059669",
                      fillColor: "#059669",
                      fillOpacity: 0.05,
                      weight: 1,
                      dashArray: "3, 3",
                    }}
                  />
                );

              default:
                return null;
            }
          })}

        {waypoints.filter((wp) => wp.visible !== false).length > 1 && (
          <Polyline
            positions={waypoints
              .filter((wp) => wp.visible !== false)
              .map((wp) => wp.position)}
            color="black"
          />
        )}
      </MapContainer>
      {isExpanded && (
        <div
          className="absolute top-0 left-0 w-full h-ful z-[999]"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(false);
            }}
            className={`fixed top-4 right-4 z-[1000] ${`button-gradient-${theme}`} text-white px-1 py-1 rounded-full`}
          >
            <X size={20} />
          </button>
          <div className="fixed top-0 left-1 z-[1000] text-white">
            <MobileMapControls
              mapType={mapType}
              setMapType={setMapType}
              onDeleteLastWaypoint={onDeleteLastWaypoint}
              onClearWaypoints={onClearWaypoints}
              onAddSearchWaypoint={onAddSearchWaypoint}
              showAviationData={showAviationData}
              onToggleAviationData={onToggleAviationData}
              aviationLayers={aviationLayers}
              onLayerToggle={onLayerToggle}
              selectedCountry={selectedCountry}
              onCountryChange={onCountryChange}
              listSavedRoutes={listSavedRoutes}
              saveNewRoute={saveNewRoute}
              overwriteRoute={overwriteRoute}
              loadRoute={loadRoute}
              deleteRoute={deleteRoute}
              renameRoute={renameRoute}
              waypoints={waypoints}
            />
          </div>
        </div>
      )}
    </div>
  );
};

// Component to handle map click events
const MapEvents: React.FC<{
  onMapClick: (e: LeafletMouseEvent) => void;
  isExpanded: boolean;
}> = ({ onMapClick, isExpanded }) => {
  useMapEvents({
    click: (e) => {
      if (isExpanded) {
        onMapClick(e);
      }
    },
  });

  return null;
};

export default MapComponent;

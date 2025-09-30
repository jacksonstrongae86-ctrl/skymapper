// components/MapComponent.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  useMapEvents,
  Circle,
  Polygon,
  Tooltip,
} from "react-leaflet";
import { useRef } from "react";
import { Map } from "leaflet";
import "leaflet/dist/leaflet.css";
import { getCountryCenter, Waypoint } from "../../../utils/types";
import { LeafletMouseEvent } from "leaflet";
import { useMapHandlers } from "../../../hooks/index/useMapHandlers";
import { createWaypointIcon } from "../../../components/desktop/map/createWaypointIcon";
import { useTheme } from "@/src/utils/ThemeContext";
import { useAviationData } from "../../../hooks/index/useAviationData";
import {
  convertAviationDataToMarkers,
  extractPolygonCoordinates,
} from "../../../utils/aviationUtils";
import { Airspace, Elevation } from "../../../utils/types";
import { getAirspaceColor } from "../../../utils/airspaceColors";
import { formatElevation } from "../../../utils/unitConversions";
import { useAltitudeUnit } from "../../../utils/AltitudeUnitContext";
import ClusteredAviationMarkers from "./ClusteredAviationMarkers";
import { detectUserCountry } from "../../../utils/countryDetection";
import { RouteWarningAnalysis } from "../../../hooks/index/useAltitudeCompliance";

type MapComponentProps = {
  onMapClick: (e: LeafletMouseEvent) => void;
  waypoints: Waypoint[];
  mapType: string;
  onWaypointUpdate: (
    index: number,
    field: keyof Waypoint,
    value: Waypoint[keyof Waypoint]
  ) => void;
  showAviationData?: boolean;
  aviationLayers?: {
    airports: boolean;
    airspaces: boolean;
    navigation: boolean;
    obstacles: boolean;
    hotspots: boolean;
    reportingpoints: boolean;
  };
  selectedCountry: string;
  onCountryChange: (country: string) => void;
  analyzeRouteWarnings?: (waypoints: Waypoint[]) => RouteWarningAnalysis;
};

const MapComponent: React.FC<MapComponentProps> = ({
  onMapClick,
  waypoints,
  mapType,
  onWaypointUpdate,
  showAviationData = false,
  aviationLayers = {
    airports: true,
    airspaces: true,
    navigation: true,
    obstacles: true,
    hotspots: true,
    reportingpoints: true,
  },
  selectedCountry,
  onCountryChange,
  analyzeRouteWarnings,
}) => {
  const { theme } = useTheme();
  const { altitudeUnit } = useAltitudeUnit();
  const validMapTypes = ["street", "sat", "hybrid", "terrain"];
  const mapTypeUrl = validMapTypes.includes(mapType) ? mapType : "sat";
  const { onWaypointDrag } = useMapHandlers(onWaypointUpdate);
  const mapRef = useRef<Map | null>(null);
  const [countryDetected, setCountryDetected] = useState(false);

  // Analyze route warnings to get violation information for waypoints
  const routeWarnings = useMemo(() => {
    if (analyzeRouteWarnings && waypoints.length > 0) {
      return analyzeRouteWarnings(waypoints);
    }
    return { warnings: [] };
  }, [analyzeRouteWarnings, waypoints]);
  useEffect(() => {
    const detectAndSetCountry = async () => {
      if (!countryDetected) {
        try {
          const detectedCountry = await detectUserCountry();
          onCountryChange(detectedCountry);
          setCountryDetected(true);
          // console.log("Auto-detected country:", detectedCountry);
        } catch (error) {
          console.error("Failed to detect country:", error);
        setCountryDetected(false);
        }
      }
    };

    detectAndSetCountry();
  }, [countryDetected, onCountryChange]);

  // const handleCountryChange = (newCountry: string) => {
  //   setSelectedCountry(newCountry);
  //   onCountryChange(newCountry); // Notify parent component
  // };

  const mapCenter = getCountryCenter(selectedCountry);

  useEffect(() => {
    if (mapRef.current) {
      const newCenter = getCountryCenter(selectedCountry);
      mapRef.current.setView(newCenter, 6);
    }
  }, [selectedCountry]);

  // Remove all custom event handling for now
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
      filteredReportingPoints
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
    hotspots,
    reportingpoints,
    loading,
  ]);

  // Debug: Show loading state
  if (loading) {
    // console.log("Aviation data is loading...");
  }

  if (error) {
    // console.error("Aviation data error:", error);
  }

  return (
    <MapContainer
      center={mapCenter}
      zoom={6}
      style={{ height: "100%", width: "100%" }}
      ref={mapRef}
    >
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

      <MapEvents onMapClick={onMapClick} />

      {/* Waypoint markers */}
      {waypoints
        .filter((wp) => wp.visible !== false)
        .map((waypoint, absoluteIndex) => {
          // Find if this waypoint has a violation
          const waypointWarning = routeWarnings.warnings?.find(
            (warning) => warning.waypointIndex === absoluteIndex
          );
          const hasViolation = waypointWarning?.hasViolation || false;

          return (
            <Marker
              key={absoluteIndex}
              position={waypoint.position}
              icon={createWaypointIcon(waypoint.type, theme, hasViolation)}
              draggable={true}
              zIndexOffset={500} // Lower than aviation markers
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
        aviationMarkers.map((marker) => {
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
                const colorConfig = getAirspaceColor(airspace);
                const formatAltitude = (elevation: Elevation | null | undefined) => {
                  if (!elevation) return 'N/A';
                  return formatElevation(elevation, altitudeUnit);
                };

                return (
                  <Polygon
                    key={`polygon-${marker.id}`}
                    positions={polygonCoords}
                    pathOptions={{
                      color: colorConfig.color,
                      fillColor: colorConfig.fillColor,
                      fillOpacity: colorConfig.fillOpacity,
                      weight: colorConfig.weight,
                    }}
                  >
                    <Tooltip
                      direction="top"
                      offset={[0, -5]}
                      opacity={0.9}
                      permanent={false}
                      className="custom-dark-tooltip"
                    >
                      <div className="bg-gray-900 p-3 rounded-lg shadow-lg min-w-[200px]">
                        <div className="flex items-center gap-2 mb-2">
                          <div
                            className="w-3 h-3 rounded-full border"
                            style={{ backgroundColor: colorConfig.fillColor, borderColor: colorConfig.color }}
                          />
                          <h3 className="font-semibold text-white text-sm">
                            {airspace.name || 'Unnamed Airspace'}
                          </h3>
                        </div>
                        <p className="text-xs text-gray-300 mb-2">{colorConfig.name}</p>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-gray-400">Lower: </span>
                            <span className="font-medium text-white">{formatAltitude(airspace.lowerLimit)}</span>
                          </div>
                          <div>
                            <span className="text-gray-400">Upper: </span>
                            <span className="font-medium text-white">{formatAltitude(airspace.upperLimit)}</span>
                          </div>
                        </div>
                      </div>
                    </Tooltip>
                  </Polygon>
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

      {/* Route polyline */}
      {waypoints.filter((wp) => wp.visible !== false).length > 1 && (
        <Polyline
          positions={waypoints
            .filter((wp) => wp.visible !== false)
            .map((wp) => wp.position)}
          color="black"
        />
      )}
    </MapContainer>
  );
};

// Component to handle map click events
const MapEvents: React.FC<{
  onMapClick: (e: LeafletMouseEvent) => void;
}> = ({ onMapClick }) => {
  useMapEvents({
    click: onMapClick,
  });
  return null;
};

export default MapComponent;

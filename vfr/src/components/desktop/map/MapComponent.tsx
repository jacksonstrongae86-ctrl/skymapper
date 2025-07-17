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
import {
  Airspace,

} from "../../../utils/types";
import ClusteredAviationMarkers from "./ClusteredAviationMarkers";
import { detectUserCountry } from '../../../utils/countryDetection';

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
  };
  onCountryChange: (country: string) => void;
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
  },
}) => {
  const { theme } = useTheme();
  const validMapTypes = ["street", "sat", "hybrid", "terrain"];
  const mapTypeUrl = validMapTypes.includes(mapType) ? mapType : "sat";
  const { onWaypointDrag } = useMapHandlers(onWaypointUpdate);
  const mapRef = useRef<Map | null>(null);
  const [selectedCountry, setSelectedCountry] = useState('es');
  const [countryDetected, setCountryDetected] = useState(false);
  useEffect(() => {
    const detectAndSetCountry = async () => {
      if (!countryDetected) {
        try {
          const detectedCountry = await detectUserCountry();
          setSelectedCountry(detectedCountry);
          setCountryDetected(true);
          console.log('Auto-detected country:', detectedCountry);
        } catch (error) {
          console.error('Failed to detect country:', error);
          setCountryDetected(true);
        }
      }
    };

    detectAndSetCountry();
  }, [countryDetected]);

  const mapCenter = getCountryCenter(selectedCountry);
  useEffect(() => {
    if (mapRef.current) {
      const newCenter = getCountryCenter(selectedCountry);
      mapRef.current.setView(newCenter, 6);
      console.log('Desktop map center updated to:', newCenter, 'for country:', selectedCountry);
    }
  }, [selectedCountry]);
  // Load aviation data
  const {
    airports,
    airspaces,
    navigation,
    obstacles,
    hotspots,
    loading,
    error,
  } = useAviationData(selectedCountry);

  // Debug: Log the loaded data
  console.log("Aviation Data Debug:", {
    loading,
    error,
    airports: airports.length,
    airspaces: airspaces.length,
    navigation: navigation.length,
    obstacles: obstacles.length,
    hotspots: hotspots.length,
    showAviationData,
    aviationLayers,
  });

  // Convert aviation data to markers
  const aviationMarkers = useMemo(() => {
    console.log(
      "useMemo running - showAviationData:",
      showAviationData,
      "loading:",
      loading
    );

    if (!showAviationData) return [];

    // Wait for loading to complete
    if (loading) {
      console.log("Still loading aviation data...");
      return [];
    }

    // Check if we have any data at all
    const hasData =
      airports.length > 0 ||
      airspaces.length > 0 ||
      navigation.length > 0 ||
      obstacles.length > 0 ||
      hotspots.length > 0;

    if (!hasData) {
      console.log("No aviation data available yet");
      return [];
    }

    const filteredAirports = aviationLayers.airports ? airports : [];
    const filteredAirspaces = aviationLayers.airspaces ? airspaces : [];
    const filteredNavigation = aviationLayers.navigation ? navigation : [];
    const filteredObstacles = aviationLayers.obstacles ? obstacles : [];
    const filteredHotspots = aviationLayers.hotspots ? hotspots : [];

    console.log("Processing aviation data into markers...");
    console.log("Filtered Aviation Data:", {
      airports: filteredAirports.length,
      airspaces: filteredAirspaces.length,
      navigation: filteredNavigation.length,
      obstacles: filteredObstacles.length,
      hotspots: filteredHotspots.length,
    });

    const markers = convertAviationDataToMarkers(
      filteredAirports,
      filteredAirspaces,
      filteredNavigation,
      filteredObstacles,
      filteredHotspots
    );

    console.log("Successfully generated markers:", markers.length);
    return markers;
  }, [
    showAviationData,
    aviationLayers,
    airports,
    airspaces,
    navigation,
    obstacles,
    hotspots,
    loading,
  ]);

  // Debug: Show loading state
  if (loading) {
    console.log("Aviation data is loading...");
  }

  if (error) {
    console.error("Aviation data error:", error);
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
            ? "http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
            : mapTypeUrl === "sat"
            ? "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            : mapTypeUrl === "hybrid"
            ? "https://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}"
            : mapTypeUrl === "terrain"
            ? "https://{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}"
            : "http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
        }
        attribution="&copy; OpenStreetMap contributors"
        subdomains={["mt0", "mt1", "mt2", "mt3"]}
      />

      <MapEvents onMapClick={onMapClick} />

      {/* Waypoint markers */}
      {waypoints
        .filter((wp) => wp.visible !== false)
        .map((waypoint, absoluteIndex) => (
          <Marker
            key={absoluteIndex}
            position={waypoint.position}
            icon={createWaypointIcon(waypoint.type, theme)}
            draggable={true}
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
        ))}



      {/* Aviation data with clustering */}
      {showAviationData && (
        <ClusteredAviationMarkers
          markers={aviationMarkers}
          theme={theme}
          onMarkerClick={(marker) =>
            console.log(`${marker.type} clicked:`, marker)
          }
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

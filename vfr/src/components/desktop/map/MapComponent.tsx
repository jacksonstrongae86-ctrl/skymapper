// components/MapComponent.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  useMapEvents,
  Circle,
} from "react-leaflet";
import { useRef } from "react";
import { Map } from "leaflet";
import "leaflet/dist/leaflet.css";
import { getCountryCenter, Waypoint } from "../../../utils/types";
import { LeafletMouseEvent } from "leaflet";
import { createWaypointIcon } from "../../../components/desktop/map/createWaypointIcon";
import { useTheme } from "@/src/utils/ThemeContext";
import { useAviationData } from "../../../hooks/index/useAviationData";
import {
  convertAviationDataToMarkers,
} from "../../../utils/aviationUtils";
import ClusteredAviationMarkers from "./ClusteredAviationMarkers";
import { detectUserCountry } from "../../../utils/countryDetection";
import { RouteWarningAnalysis } from "../../../hooks/index/useAltitudeCompliance";
import { WeatherOverlay } from "../../shared/WeatherOverlay";
import AirwayLayer from "../../shared/AirwayLayer";
import { GPSPosition } from "../../../services/gpsService";
import FlightTracker from "../../shared/FlightTracker";
import { RangeRings } from "../../shared/RangeRings";

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
    reportingpoints: boolean;
  };
  selectedCountry: string;
  onCountryChange: (country: string) => void;
  analyzeRouteWarnings?: (waypoints: Waypoint[]) => RouteWarningAnalysis;
  onMoveMapRef?: React.MutableRefObject<((lat: number, lon: number, zoom?: number) => void) | null>;
  flightRules?: 'VFR' | 'IFR';
  showWeather?: boolean;
  currentPosition?: GPSPosition | null;
  flightTrail?: GPSPosition[];
  isFlightActive?: boolean;
  onStartFlight?: () => void;
  showRangeRings?: boolean;
  trackUpMode?: boolean;
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
    reportingpoints: true,
  },
  selectedCountry,
  onCountryChange,
  analyzeRouteWarnings,
  onMoveMapRef,
  flightRules = 'VFR',
  showWeather = false,
  currentPosition = null,
  flightTrail = [],
  isFlightActive = false,
  onStartFlight,
  showRangeRings = false,
  trackUpMode = false, // TODO: Implement track-up mode with map rotation
}) => {
  // Track-up mode placeholder - requires Leaflet setBearing or CSS transform
  const _ = trackUpMode; // Prevent unused warning
  void _; // Mark as intentionally unused
  
  const { theme } = useTheme();
  const validMapTypes = ["street", "sat", "hybrid", "terrain"];
  const mapTypeUrl = validMapTypes.includes(mapType) ? mapType : "sat";
  const mapRef = useRef<Map | null>(null);
  const [countryDetected, setCountryDetected] = useState(false);

  // Expose map movement function via ref
  useEffect(() => {
    if (onMoveMapRef) {
      onMoveMapRef.current = (lat: number, lon: number, zoom: number = 12) => {
        if (mapRef.current) {
          mapRef.current.setView([lat, lon], zoom);
        }
      };
    }
  }, [onMoveMapRef]);

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

  // Invalidate map size on mount and when window resizes to fix tile rendering issues
  useEffect(() => {
    const handleResize = () => {
      if (mapRef.current) {
        mapRef.current.invalidateSize();
      }
    };

    // Invalidate size on mount after a short delay
    const timer = setTimeout(() => {
      if (mapRef.current) {
        mapRef.current.invalidateSize();
      }
    }, 100);

    window.addEventListener('resize', handleResize);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

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
      [], // Empty array for hotspots - not displayed
      filteredReportingPoints
    );

    // console.log("Successfully generated markers:", markers.length);
    return markers;
  }, [showAviationData, loading, airports, airspaces, navigation, obstacles, hotspots.length, reportingpoints, aviationLayers.airports, aviationLayers.airspaces, aviationLayers.navigation, aviationLayers.obstacles, aviationLayers.reportingpoints]);

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

      {/* OpenAIP Tile Layer */}
      <TileLayer
        url="https://api.tiles.openaip.net/api/data/openaip/{z}/{x}/{y}.png?apiKey=5846be4e9efd4349db50e590d1e85a0c"
        attribution='&copy; <a href="https://www.openaip.net/">OpenAIP</a> contributors'
        maxZoom={14}
        opacity={1}
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
                  const marker = e.target;
                  const position = marker.getLatLng();
                  onWaypointUpdate(absoluteIndex, "position", [
                    position.lat,
                    position.lng,
                  ]);
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

      {/* Keep the non-clustered elements like circles (excluding airspace polygons) */}
      {showAviationData &&
        aviationMarkers.map((marker) => {
          const { type, position } = marker;

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

      {/* Weather Overlay */}
      {showWeather && showAviationData && (
        <WeatherOverlay 
          airports={airports.filter(a => {
            return a.icaoCode && 
                   a.geometry?.type === 'Point' && 
                   Array.isArray(a.geometry.coordinates) &&
                   a.geometry.coordinates.length === 2;
          }).map(a => {
            const coords = a.geometry!.coordinates as [number, number];
            return {
              icao: a.icaoCode!,
              lat: coords[1],
              lon: coords[0],
              name: a.name || a.icaoCode!,
            };
          })}
          enabled={true}
        />
      )}

      {/* IFR Airways Layer - to be integrated with airways data */}
      {flightRules === 'IFR' && <AirwayLayer airways={[]} visible={true} />}

      {/* Route polyline */}
      {waypoints.filter((wp) => wp.visible !== false).length > 1 && (
        <Polyline
          positions={waypoints
            .filter((wp) => wp.visible !== false)
            .map((wp) => wp.position)}
          color="black"
        />
      )}

      {/* Flight Tracker - shows aircraft position and trail */}
      <FlightTracker
        currentPosition={currentPosition}
        trail={flightTrail}
        autoCenter={true}
      />

      {/* Range Rings - concentric circles around aircraft */}
      <RangeRings
        currentPosition={currentPosition}
        visible={showRangeRings && isFlightActive}
      />

      {/* Start Flight Button */}
      {!isFlightActive && onStartFlight && (
        <div
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            zIndex: 400,
          }}
        >
          <button
            onClick={onStartFlight}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold 
                       px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 
                       transition-all transform hover:scale-105"
          >
            <span className="text-xl">▶️</span>
            <span>Iniciar Vuelo</span>
          </button>
        </div>
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

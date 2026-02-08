/**
 * Responsive MapComponent
 * Adapts behavior and UI between desktop and mobile viewports
 * Uses useIsMobile() hook to determine which features to display
 */
import React, { useEffect, useMemo, useState, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  useMapEvents,
  Circle,
} from "react-leaflet";
import { Map } from "leaflet";
import "leaflet/dist/leaflet.css";
import { getCountryCenter, Waypoint } from "../../../utils/types";
import { LeafletMouseEvent } from "leaflet";
import { createWaypointIcon } from "./createWaypointIcon";
import { useTheme } from "@/src/utils/ThemeContext";
import { useAviationData } from "../../../hooks/index/useAviationData";
import {
  convertAviationDataToMarkers,
  AviationMarker,
} from "../../../utils/aviationUtils";
import ClusteredAviationMarkers from "../../desktop/map/ClusteredAviationMarkers";
import { detectUserCountry } from "../../../utils/countryDetection";
import { RouteWarningAnalysis } from "../../../hooks/index/useAltitudeCompliance";
import { useIsMobile } from "../../../hooks/useIsMobile";
import { X, Undo2 } from "lucide-react";
import MobileMapControls from "@/src/components/mobile/map/MapControls";

type AviationLayerKey =
  | "airports"
  | "airspaces"
  | "navigation"
  | "obstacles"
  | "reportingpoints";

interface SavedRoute {
  id: string;
  name: string;
  waypoints: Waypoint[];
  lastModified: string;
}

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
  // Mobile-specific props
  onDeleteLastWaypoint?: () => void;
  onClearWaypoints?: () => void;
  setMapType?: (type: string) => void;
  onAddSearchWaypoint?: (lat: number, lon: number, name: string) => void;
  onToggleAviationData?: (enabled: boolean) => void;
  onLayerToggle?: (layer: AviationLayerKey, enabled: boolean) => void;
  listSavedRoutes?: () => SavedRoute[];
  saveNewRoute?: (name: string) => void;
  overwriteRoute?: (id: string, name?: string) => void;
  loadRoute?: (id: string) => void;
  deleteRoute?: (id: string) => void;
  renameRoute?: (id: string, name: string) => void;
};

/**
 * Responsive MapComponent that adapts to mobile/desktop viewports
 */
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
  // Mobile-specific props
  onDeleteLastWaypoint,
  onClearWaypoints,
  setMapType,
  onAddSearchWaypoint,
  onToggleAviationData,
  onLayerToggle,
  listSavedRoutes,
  saveNewRoute,
  overwriteRoute,
  loadRoute,
  deleteRoute,
  renameRoute,
}) => {
  const isMobile = useIsMobile();
  const { theme } = useTheme();
  const validMapTypes = ["street", "sat", "hybrid", "terrain"];
  const mapTypeUrl = validMapTypes.includes(mapType) ? mapType : "sat";
  const mapRef = useRef<Map | null>(null);
  const [countryDetected, setCountryDetected] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Expose map movement function via ref (desktop)
  useEffect(() => {
    if (onMoveMapRef) {
      onMoveMapRef.current = (lat: number, lon: number, zoom: number = 12) => {
        if (mapRef.current) {
          mapRef.current.setView([lat, lon], zoom);
        }
      };
    }
  }, [onMoveMapRef]);

  // Function to move the map (mobile)
  const handleMoveMap = (lat: number, lon: number, zoom: number = 12) => {
    if (mapRef.current) {
      mapRef.current.setView([lat, lon], zoom);
    }
  };

  // Analyze route warnings to get violation information for waypoints
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const routeWarnings = useMemo(() => {
    if (analyzeRouteWarnings && waypoints.length > 0) {
      return analyzeRouteWarnings(waypoints);
    }
    return { warnings: [] };
  }, [analyzeRouteWarnings, waypoints]);

  // Auto-detect country on mount
  useEffect(() => {
    const detectAndSetCountry = async () => {
      if (!countryDetected) {
        try {
          const detectedCountry = await detectUserCountry();
          onCountryChange(detectedCountry);
          setCountryDetected(true);
        } catch (error) {
          console.error("Failed to detect country:", error);
          setCountryDetected(true);
        }
      }
    };

    detectAndSetCountry();
  }, [countryDetected, onCountryChange]);

  const mapCenter = getCountryCenter(selectedCountry);

  // Update map center when country changes
  useEffect(() => {
    if (mapRef.current) {
      const newCenter = getCountryCenter(selectedCountry);
      mapRef.current.setView(newCenter, 6);
    }
  }, [selectedCountry]);

  // Invalidate map size on mount and when window resizes (desktop)
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

  // Invalidate map size when expanded state changes (mobile)
  useEffect(() => {
    if (mapRef.current && isExpanded && isMobile) {
      const timer = setTimeout(() => {
        mapRef.current?.invalidateSize();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isExpanded, isMobile]);

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

  // Convert aviation data to markers
  const aviationMarkers = useMemo(() => {
    if (!showAviationData) return [];
    if (loading) return [];

    const hasData =
      airports.length > 0 ||
      airspaces.length > 0 ||
      navigation.length > 0 ||
      obstacles.length > 0 ||
      hotspots.length > 0 ||
      reportingpoints.length > 0;

    if (!hasData) return [];

    const filteredAirports = aviationLayers.airports ? airports : [];
    const filteredAirspaces = aviationLayers.airspaces ? airspaces : [];
    const filteredNavigation = aviationLayers.navigation ? navigation : [];
    const filteredObstacles = aviationLayers.obstacles ? obstacles : [];
    const filteredReportingPoints = aviationLayers.reportingpoints ? reportingpoints : [];

    const markers = convertAviationDataToMarkers(
      filteredAirports,
      filteredAirspaces,
      filteredNavigation,
      filteredObstacles,
      [],
      filteredReportingPoints
    );

    return markers;
  }, [
    showAviationData,
    loading,
    airports,
    airspaces,
    navigation,
    obstacles,
    hotspots.length,
    reportingpoints,
    aviationLayers.airports,
    aviationLayers.airspaces,
    aviationLayers.navigation,
    aviationLayers.obstacles,
    aviationLayers.reportingpoints
  ]);

  if (error) {
    console.error("Aviation data error:", error);
  }

  // Mobile: wrapper with expand/collapse
  const mapWrapper = isMobile ? (
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
      {renderMapContainer()}
      {isExpanded && renderMobileControls()}
    </div>
  ) : (
    renderMapContainer()
  );

  function renderMapContainer() {
    return (
      <MapContainer
        center={mapCenter}
        zoom={isMobile ? 10 : 6}
        style={{ height: "100%", width: "100%" }}
        ref={mapRef}
        zoomControl={!isMobile || isExpanded}
        className={isMobile ? "z[9999]" : ""}
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

        <MapEvents 
          onMapClick={onMapClick} 
          isExpanded={isMobile ? isExpanded : true} 
        />

        {/* Waypoint markers */}
        {waypoints
          .filter((wp) => wp.visible !== false)
          .map((waypoint, absoluteIndex) => {
            // Airspace warnings disabled
            const hasViolation = false;

            return (
              <Marker
                key={absoluteIndex}
                position={waypoint.position}
                icon={createWaypointIcon(waypoint.type, theme, hasViolation)}
                draggable={true}
                zIndexOffset={500}
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
          />
        )}

        {/* Aviation marker circles */}
        {showAviationData &&
          aviationMarkers.map((marker: AviationMarker) => {
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
  }

  function renderMobileControls() {
    if (!isMobile || !onDeleteLastWaypoint || !setMapType) return null;

    return (
      <div
        className="absolute top-0 left-0 w-full h-full z-[999]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsExpanded(false);
          }}
          id="mobile-map-close-button"
          className={`fixed top-4 right-4 z-[1000] w-14 h-14 rounded-full ${`button-gradient-${theme}`} text-white shadow-2xl border-2 border-white/20 hover:opacity-90 hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center`}
        >
          <X size={30} strokeWidth={3} />
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onDeleteLastWaypoint();
          }}
          id="mobile-map-undo-button"
          className={`fixed top-20 right-4 z-[1000] w-14 h-14 rounded-full ${`button-gradient-${theme}`} text-white shadow-2xl border-2 border-white/20 hover:opacity-90 hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center`}
        >
          <Undo2 size={26} strokeWidth={3} />
        </button>

        {onAddSearchWaypoint && onToggleAviationData && onLayerToggle && (
          <div className="fixed top-0 left-1 z-[999] text-white">
            <MobileMapControls
              mapType={mapType}
              setMapType={setMapType}
              onDeleteLastWaypoint={onDeleteLastWaypoint}
              onClearWaypoints={onClearWaypoints!}
              onAddSearchWaypoint={onAddSearchWaypoint}
              onMoveMap={handleMoveMap}
              showAviationData={showAviationData}
              onToggleAviationData={onToggleAviationData}
              aviationLayers={aviationLayers}
              onLayerToggle={onLayerToggle}
              selectedCountry={selectedCountry}
              onCountryChange={onCountryChange}
              listSavedRoutes={listSavedRoutes!}
              saveNewRoute={saveNewRoute!}
              overwriteRoute={overwriteRoute!}
              loadRoute={loadRoute!}
              deleteRoute={deleteRoute!}
              renameRoute={renameRoute!}
              waypoints={waypoints}
            />
          </div>
        )}
      </div>
    );
  }

  return mapWrapper;
};

/**
 * Component to handle map click events
 */
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

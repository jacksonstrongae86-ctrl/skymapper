import React, { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { useWaypoints } from "../../hooks/index/useWaypoints";
import { useFlightCalculations } from "../../hooks/index/useFlightCalculations";
import { useUIState } from "../../hooks/index/useUIState";
import { useWindData } from "../../hooks/index/useWindData";
import { useAviationData } from "../../hooks/index/useAviationData";
import { useIsMobile } from "../../hooksMobile/useIsMobile";
import Sidebar from "../desktop/sidebar/Sidebar";
import MobileSidebar from "../mobile/sidebar/Sidebar";
import MapControls from "../desktop/map/MapControls";
import BottomSidebar from "../desktop/sidebar/BottomSidebar";
import MobileBottomSidebar from "../mobile/sidebar/BottomSidebar";
// import AirspaceAlert from "../shared/AirspaceAlert";
import TriviaPopup from "../shared/TriviaPopup";
import { ToolsPanel } from "../shared/ToolsPanel";
import { FlightRulesSelector } from "../shared/FlightRulesSelector";
import { FlightControlBar } from "../shared/FlightControlBar";
import { gpsService, GPSPosition } from "../../services/gpsService";
import FlightStatsOverlay from "../shared/FlightStatsOverlay";
import { InstrumentsPanel } from "../shared/InstrumentsPanel";
import { CourseDeviationIndicator } from "../shared/CourseDeviationIndicator";
import { ToolView } from "../shared/ToolsPanel";

const MapComponent = dynamic(
  () => import("../desktop/map/MapComponent"),
  {
    ssr: false,
  }
);

const MobileMapComponent = dynamic(
  () => import("../mobile/map/MapComponent"),
  {
    ssr: false,
  }
);

export default function MainApp() {
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

  const [selectedCountry, setSelectedCountry] = useState("es");

  // Ref to hold the map move function
  const moveMapRef = useRef<((lat: number, lon: number, zoom?: number) => void) | null>(null);

  // Load aviation data for altitude compliance and airport directory
  const { airspaces, airports } = useAviationData(selectedCountry);

  const {
    waypoints,
    handleWaypointUpdate,
    handleDeleteWaypoint,
    handleMapClick,
    handleDeleteLastWaypoint,
    onAddSearchWaypoint,
    handleClearWaypoints,
    listSavedRoutes,
    saveNewRoute,
    overwriteRoute,
    loadRoute,
    deleteRoute,
    renameRoute,
    loadRouteFromSerialized,
    // Airspace warning functions
    showWarnings,
    setShowWarnings,
    analyzeRouteWarnings,
    warningAlerts,
    clearWarningAlerts,
  } = useWaypoints(defaultTAS, fuelConsumption, storedWindData ?? [], airspaces);

  useEffect(() => {
    const serialized = new URLSearchParams(window.location.search).get(
      "importRoute"
    );
    if (serialized) {
      try {
        loadRouteFromSerialized(serialized);
        // Optionally, clear the param to avoid reimport on reload
        const url = new URL(window.location.href);
        url.searchParams.delete("importRoute");
        window.history.replaceState(null, "", url.toString());
      } catch {
        // ignore or show an error
      }
    }
  }, [loadRouteFromSerialized]);

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
  const [showAviationData, setShowAviationData] = useState(false);
  const [aviationLayers, setAviationLayers] = useState({
    airports: false,
    airspaces: false,
    navigation: false,
    obstacles: false,
    hotspots: false,
    reportingpoints: false,
  });

  // Flight rules (VFR/IFR)
  const [flightRules, setFlightRules] = useState<'VFR' | 'IFR'>('VFR');

  // Weather overlay
  const [showWeatherOverlay, setShowWeatherOverlay] = useState(false);

  // Phase 8C: ForeFlight-style features
  const [trackUpMode, setTrackUpMode] = useState(false);
  const [showRangeRings, setShowRangeRings] = useState(false);
  const [showInstruments, setShowInstruments] = useState(false);

  // Phase 8C.4: Split view for desktop tools
  const [activeToolView, setActiveToolView] = useState<ToolView>(null);
  const [showToolsMenu, setShowToolsMenu] = useState(false);
  const [splitViewWidth, setSplitViewWidth] = useState(65); // Default 65% for map

  // GPS Flight Tracking
  const [isFlightActive, setIsFlightActive] = useState(false);
  const [currentPosition, setCurrentPosition] = useState<GPSPosition | null>(null);
  const [flightTrail, setFlightTrail] = useState<GPSPosition[]>([]);
  const [flightStartTime, setFlightStartTime] = useState<number>(0);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [showFlightStats, setShowFlightStats] = useState(false);
  const [maxAltitude, setMaxAltitude] = useState<number>(0);

  // Airspace alert — disabled until ENAIRE data
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [warningsInitialTab, _setWarningsInitialTab] = useState<'violations' | 'intersections' | 'stats' | undefined>(undefined);

  // Trivia popup - only show on first load after tutorial and consent are complete
  const [showTriviaPopup, setShowTriviaPopup] = useState(false);

  useEffect(() => {
    // Check localStorage values
    const tutorialCompleted = localStorage.getItem("skymapper-tutorial-completed") === "true";
    const consentsGiven = localStorage.getItem("skymapper-consents");
    const triviaShown = sessionStorage.getItem("skymapper-trivia-shown");

    // Show popup if:
    // 1. Tutorial is completed (localStorage: skymapper-tutorial-completed = "true") OR tutorial was skipped
    // 2. Consent has been given (localStorage: skymapper-consents exists)
    // 3. Not shown in this session yet (sessionStorage: skymapper-trivia-shown)

    // Check if tutorial was completed OR if consent was given (which means user interacted with the app)
    const tutorialConditionMet = tutorialCompleted || consentsGiven;
    const shouldShow = tutorialConditionMet && consentsGiven && !triviaShown;

    if (shouldShow) {
      const timer = setTimeout(() => {
        setShowTriviaPopup(true);
        sessionStorage.setItem("skymapper-trivia-shown", "true");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  // Airspace alerts disabled — pass-through for compatibility
  const handleClearAllAlerts = () => {
    clearWarningAlerts();
  };

  const handleLayerToggle = (
    layer: keyof typeof aviationLayers,
    enabled: boolean
  ) => {
    setAviationLayers((prev) => ({
      ...prev,
      [layer]: enabled,
    }));
  };

  // Toggle weather overlay
  const toggleWeatherOverlay = () => {
    setShowWeatherOverlay(prev => !prev);
  };

  // GPS Flight Tracking Handlers
  const handleStartFlight = async () => {
    setGpsError(null);
    
    // Check if geolocation is available
    if (!navigator.geolocation) {
      setGpsError('Tu navegador no soporta geolocalización.');
      return;
    }

    // Check if HTTPS (required for geolocation on most browsers)
    if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
      setGpsError('Se requiere HTTPS para acceder al GPS. Usa la versión segura de la app.');
      return;
    }

    try {
      // Request permission first with a single position request
      await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000 });
      });

      // Permission granted — start tracking
      gpsService.start(flightRules);
      setIsFlightActive(true);
      setFlightStartTime(Date.now());
      setFlightTrail([]);
      setMaxAltitude(0);
      setShowFlightStats(false);
      
      const unsubscribe = gpsService.onPosition((position: GPSPosition) => {
        setCurrentPosition(position);
        setFlightTrail(prev => [...prev, position]);
        setMaxAltitude(prev => Math.max(prev, position.altitude));
      });
      
      (window as { __gpsUnsubscribe?: () => void }).__gpsUnsubscribe = unsubscribe;
    } catch (error) {
      const geoError = error as GeolocationPositionError;
      if (geoError?.code === 1) {
        setGpsError('Permiso GPS denegado. Habilita la ubicación en tu navegador.');
      } else if (geoError?.code === 2) {
        setGpsError('Posición GPS no disponible.');
      } else if (geoError?.code === 3) {
        setGpsError('Tiempo de espera GPS agotado.');
      } else {
        setGpsError(error instanceof Error ? error.message : 'Error al iniciar GPS');
      }
      setIsFlightActive(false);
    }
  };

  const handleEndFlight = () => {
    const recording = gpsService.stop();
    setIsFlightActive(false);
    setShowFlightStats(true);
    
    // Unsubscribe from GPS updates
    const w = window as { __gpsUnsubscribe?: () => void };
    if (w.__gpsUnsubscribe) {
      w.__gpsUnsubscribe();
      delete w.__gpsUnsubscribe;
    }
    
    // Log flight summary
    console.log('Flight ended:', {
      duration: Math.round((Date.now() - flightStartTime) / 1000 / 60),
      maxAltitude: Math.round(recording.maxAltitude),
      maxSpeed: Math.round(recording.maxSpeed * 1.94384), // Convert m/s to knots
      totalDistance: Math.round(recording.totalDistance / 1852), // Convert m to nm
      positions: recording.positions.length,
    });
    
    // Don't auto-clear trail - let user dismiss stats overlay first
  };

  const handleDismissFlightStats = () => {
    setShowFlightStats(false);
    setCurrentPosition(null);
    // Clear trail when user dismisses stats
    setTimeout(() => setFlightTrail([]), 1000);
  };

  return (
    <div className="relative h-screen flex flex-col">
      <title>Skymapper - Plan your VFR flight routes with ease</title>
      <meta></meta>
      {/* Airspace Alert - disabled until ENAIRE data available */}

      {/* Trivia Popup - shows once per session after tutorial and consent */}
      {showTriviaPopup && (
        <TriviaPopup
          onClose={() => setShowTriviaPopup(false)}
          autoRotate={true}
          rotateInterval={20000}
        />
      )}

      {/* Flight Control Bar - appears during active flight */}
      {isFlightActive && currentPosition && (
        <FlightControlBar
          currentPosition={currentPosition}
          flightStartTime={flightStartTime}
          onEndFlight={handleEndFlight}
        />
      )}

      {/* Instruments Panel - ForeFlight-style instruments */}
      <InstrumentsPanel
        currentPosition={currentPosition}
        visible={showInstruments && isFlightActive}
      />

      {/* Course Deviation Indicator - CDI */}
      <CourseDeviationIndicator
        currentPosition={currentPosition}
        waypoints={waypoints}
        visible={isFlightActive && waypoints.length >= 2}
      />

      {/* Flight Stats Overlay - appears after flight ends */}
      {showFlightStats && currentPosition && (
        <FlightStatsOverlay
          currentPosition={currentPosition}
          startTime={flightStartTime}
          maxAltitude={maxAltitude}
          onClose={handleDismissFlightStats}
        />
      )}

      {/* GPS Error Message */}
      {gpsError && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-[600] bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg max-w-md">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <div className="font-semibold">Error GPS</div>
              <div className="text-sm">{gpsError}</div>
            </div>
            <button
              onClick={() => setGpsError(null)}
              className="ml-auto text-white hover:text-gray-200"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Tools Panel on mobile moved to sidebar "Tools" tab */}

      {isMobile ? (
        <div className="flex flex-col h-full">
          {/* Flight Rules Selector - Mobile */}
          <div style={{ 
            position: 'fixed', 
            top: '10px', 
            left: '10px', 
            zIndex: 500,
            backgroundColor: 'var(--sidebar-bg)',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            padding: '4px',
          }}>
            <FlightRulesSelector
              currentRule={flightRules}
              onChange={setFlightRules}
            />
          </div>

          <div id="mobile-top-sidebar" className="flex-none">
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
              // Airspace warning props
              airspaces={airspaces}
              showWarnings={showWarnings}
              setShowWarnings={setShowWarnings}
              warningsInitialTab={warningsInitialTab}
              analyzeRouteWarnings={analyzeRouteWarnings}
              warningAlerts={warningAlerts}
              clearWarningAlerts={handleClearAllAlerts}
              isFlightActive={isFlightActive}
              onStartFlight={handleStartFlight}
              onEndFlight={handleEndFlight}
            />
          </div>
          <div id="map-container" className="flex-1 relative mt-0">
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
              listSavedRoutes={listSavedRoutes}
              saveNewRoute={saveNewRoute}
              overwriteRoute={overwriteRoute}
              loadRoute={loadRoute}
              deleteRoute={deleteRoute}
              renameRoute={renameRoute}
              analyzeRouteWarnings={analyzeRouteWarnings}
              flightRules={flightRules}
              showWeather={showWeatherOverlay}
              currentPosition={currentPosition}
              flightTrail={flightTrail}
              isFlightActive={isFlightActive}
              onStartFlight={handleStartFlight}
            />
          </div>

          <div id="mobile-bottom-sidebar" className="flex-none">
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
          {/* Flight Rules Selector - Desktop in Sidebar */}
          <div style={{
            position: 'fixed',
            top: '16px',
            left: '16px',
            zIndex: 500,
            backgroundColor: 'var(--sidebar-bg)',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            padding: '4px',
          }}>
            <FlightRulesSelector
              currentRule={flightRules}
              onChange={setFlightRules}
            />
          </div>

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
            // Airspace warning props
            airspaces={airspaces}
            showWarnings={showWarnings}
            setShowWarnings={setShowWarnings}
            warningsInitialTab={warningsInitialTab}
            analyzeRouteWarnings={analyzeRouteWarnings}
            warningAlerts={warningAlerts}
            clearWarningAlerts={handleClearAllAlerts}
            set_gal_liter={set_gal_liter}
            aviationLayers={aviationLayers}
            isFlightActive={isFlightActive}
            onStartFlight={handleStartFlight}
            onEndFlight={handleEndFlight}
          />

          {/* Desktop: Split view when tool is active, full map otherwise */}
          <div className="relative flex-1 h-full flex">
            {/* Map Container */}
            <div 
              className="relative h-full z-20"
              style={{ 
                width: activeToolView ? `${splitViewWidth}%` : '100%',
                transition: 'width 0.3s ease-in-out',
              }}
            >
              <MapComponent
                onMapClick={handleMapClick}
                waypoints={waypoints}
                mapType={uiState.mapType}
                onWaypointUpdate={handleWaypointUpdate}
                showAviationData={showAviationData}
                aviationLayers={aviationLayers}
                selectedCountry={selectedCountry}
                onCountryChange={setSelectedCountry}
                analyzeRouteWarnings={analyzeRouteWarnings}
                onMoveMapRef={moveMapRef}
                flightRules={flightRules}
                showWeather={showWeatherOverlay}
                currentPosition={currentPosition}
                flightTrail={flightTrail}
                isFlightActive={isFlightActive}
                onStartFlight={handleStartFlight}
                showRangeRings={showRangeRings}
                trackUpMode={trackUpMode}
              />

              {/* Map Controls - positioned inside map container */}
              <div className="absolute top-4 right-4 z-30">
              <MapControls
                mapType={uiState.mapType}
                setMapType={uiState.setMapType}
                onDeleteLastWaypoint={handleDeleteLastWaypoint}
                onClearWaypoints={handleClearWaypoints}
                onAddSearchWaypoint={onAddSearchWaypoint}
                onMoveMap={(lat, lon, zoom) => moveMapRef.current?.(lat, lon, zoom)}
                showAviationData={showAviationData}
                onToggleAviationData={setShowAviationData}
                aviationLayers={aviationLayers}
                onLayerToggle={handleLayerToggle}
                selectedCountry={selectedCountry}
                onCountryChange={setSelectedCountry}
                waypoints={waypoints}
                listSavedRoutes={listSavedRoutes}
                saveNewRoute={saveNewRoute}
                overwriteRoute={overwriteRoute}
                loadRoute={loadRoute}
                deleteRoute={deleteRoute}
                renameRoute={renameRoute}
                showWeatherOverlay={showWeatherOverlay}
                toggleWeatherOverlay={toggleWeatherOverlay}
                trackUpMode={trackUpMode}
                onToggleTrackUp={() => setTrackUpMode(!trackUpMode)}
                showRangeRings={showRangeRings}
                onToggleRangeRings={() => setShowRangeRings(!showRangeRings)}
                showInstruments={showInstruments}
                onToggleInstruments={() => setShowInstruments(!showInstruments)}
              />
              </div>
            </div>

            {/* Draggable Divider - only visible when tool is active */}
            {activeToolView && (
              <div
                style={{
                  width: '4px',
                  cursor: 'col-resize',
                  backgroundColor: 'var(--sidebar-border)',
                  position: 'relative',
                  zIndex: 40,
                }}
                onMouseDown={(e) => {
                  e.preventDefault();
                  const startX = e.clientX;
                  const startWidth = splitViewWidth;

                  const handleMouseMove = (moveEvent: MouseEvent) => {
                    const deltaX = moveEvent.clientX - startX;
                    const containerWidth = window.innerWidth - 300; // Subtract sidebar width
                    const deltaPercent = (deltaX / containerWidth) * 100;
                    const newWidth = Math.max(30, Math.min(80, startWidth + deltaPercent));
                    setSplitViewWidth(newWidth);
                  };

                  const handleMouseUp = () => {
                    document.removeEventListener('mousemove', handleMouseMove);
                    document.removeEventListener('mouseup', handleMouseUp);
                  };

                  document.addEventListener('mousemove', handleMouseMove);
                  document.addEventListener('mouseup', handleMouseUp);
                }}
              >
                {/* Divider handle */}
                <div
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '8px',
                    height: '40px',
                    backgroundColor: 'var(--button-bg)',
                    borderRadius: '4px',
                  }}
                />
              </div>
            )}

            {/* Tool Panel - only visible when a tool is active */}
            {activeToolView && (
              <div
                style={{
                  width: `${100 - splitViewWidth}%`,
                  height: '100%',
                  backgroundColor: 'var(--sidebar-bg)',
                  borderLeft: '1px solid var(--sidebar-border)',
                  zIndex: 30,
                }}
              >
                <ToolsPanel
                  waypoints={waypoints}
                  fuelConsumption={fuelConsumption}
                  gal_liter={gal_liter}
                  flightRules={flightRules}
                  airports={airports}
                  userPosition={waypoints.length > 0 ? { lat: waypoints[0].position[0], lon: waypoints[0].position[1] } : undefined}
                  mode="split"
                  activeView={activeToolView}
                  onActiveViewChange={setActiveToolView}
                />
              </div>
            )}

            {/* Floating FAB for opening tools */}
            {!activeToolView && (
              <div
                style={{
                  position: 'absolute',
                  bottom: '24px',
                  right: '24px',
                  zIndex: 900,
                }}
              >
                <button
                  onClick={() => setShowToolsMenu(prev => !prev)}
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--button-bg)',
                    color: 'var(--button-text)',
                    border: 'none',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                    cursor: 'pointer',
                    fontSize: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  title="Herramientas"
                >
                  🛠️
                </button>

                {showToolsMenu && (
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '70px',
                      right: '0',
                      backgroundColor: 'var(--sidebar-bg)',
                      border: '1px solid var(--sidebar-border)',
                      borderRadius: '12px',
                      padding: '8px',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                      minWidth: '220px',
                    }}
                  >
                    {[
                      { id: 'weather' as ToolView, label: 'Meteorología', icon: '🌤️' },
                      { id: 'fuel' as ToolView, label: 'Combustible', icon: '⛽' },
                      { id: 'notams' as ToolView, label: 'NOTAMs', icon: '📢' },
                      { id: 'flight-plan' as ToolView, label: 'Plan de Vuelo', icon: '📄' },
                      { id: 'weight-balance' as ToolView, label: 'Peso y Centrado', icon: '⚖️' },
                      { id: 'logbook' as ToolView, label: 'Diario de Vuelo', icon: '📋' },
                      { id: 'airport-directory' as ToolView, label: 'Directorio', icon: '🛩️' },
                    ].map((tool) => (
                      <button
                        key={tool.id}
                        onClick={() => {
                          setActiveToolView(tool.id);
                          setShowToolsMenu(false);
                        }}
                        className="flex items-center gap-3 w-full p-3 rounded-lg text-sm
                                   text-[var(--foreground)] hover:bg-[var(--button-hover)] 
                                   transition-all border-none bg-transparent cursor-pointer text-left"
                      >
                        <span className="text-xl">{tool.icon}</span>
                        <span>{tool.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
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

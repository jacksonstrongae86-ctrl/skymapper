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
import AirspaceAlert from "../shared/AirspaceAlert";
import TriviaPopup from "../shared/TriviaPopup";
import { ToolsPanel } from "../shared/ToolsPanel";
import { FlightRulesSelector } from "../shared/FlightRulesSelector";

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

  // Load aviation data for altitude compliance
  const { airspaces } = useAviationData(selectedCountry);

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
  const [showAviationData, setShowAviationData] = useState(true);
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

  // Airspace alert dismissal
  const [alertDismissed, setAlertDismissed] = useState(false);
  const [ , setLastWarningState] = useState<{ hasViolations: boolean; totalWarnings: number } | null>(null);
  const [warningsInitialTab, setWarningsInitialTab] = useState<'violations' | 'intersections' | 'stats' | undefined>(undefined);

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

  // Reset alert dismissal only when new violations appear
  useEffect(() => {
    if (waypoints.length > 0) {
      const analysis = analyzeRouteWarnings(waypoints);
      const currentState = {
        hasViolations: analysis.hasViolations,
        totalWarnings: analysis.totalWarnings
      };

      // Only reset dismissal if there are new violations or more warnings than before
      setLastWarningState((prevState) => {
        if (prevState &&
            ((!prevState.hasViolations && currentState.hasViolations) ||
             (currentState.totalWarnings > prevState.totalWarnings))) {
          setAlertDismissed(false);
        }
        return currentState;
      });
    } else {
      // Reset when no waypoints
      setAlertDismissed(false);
      setLastWarningState(null);
    }
  }, [waypoints, analyzeRouteWarnings]);

  // Enhanced clear alerts function that also dismisses page-level alerts
  const handleClearAllAlerts = () => {
    clearWarningAlerts(); // Clear sidebar alerts
    setAlertDismissed(true); // Dismiss page-level alert
  };

  // Handle airspace alert click - open warnings, scroll to last violation, and dismiss alert
  const handleAirspaceAlertClick = () => {
    if (waypoints.length === 0) return;

    const analysis = analyzeRouteWarnings(waypoints);
    const warningsWithIssues = analysis.warnings.filter(w => w.hasViolation || w.isInRestrictedAirspace);

    if (warningsWithIssues.length > 0) {
      // Get the last warning (highest waypointIndex)
      const lastWarning = warningsWithIssues[warningsWithIssues.length - 1];

      // Determine which tab to open based on whether it's a violation or just an intersection
      const tabToOpen = lastWarning.hasViolation ? 'violations' : 'intersections';
      setWarningsInitialTab(tabToOpen);

      // On mobile, close the map first if it's expanded
      if (isMobile) {
        const closeButton = document.getElementById('mobile-map-close-button');
        if (closeButton) {
          closeButton.click();
          // Wait a bit for the map to close before opening warnings
          setTimeout(() => {
            setShowWarnings(true);
          }, 300);
        } else {
          // Map not expanded, just open warnings
          setShowWarnings(true);
        }
      } else {
        // Desktop - just open the warnings section
        setShowWarnings(true);
      }

      // Scroll to the last warning after a delay to ensure rendering
      setTimeout(() => {
        const warningElement = document.getElementById(`warning-${lastWarning.waypointIndex}`);
        if (warningElement) {
          warningElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          // Add a short pulse effect
          warningElement.style.animation = 'pulse 0.4s ease-in-out 2';
          setTimeout(() => {
            warningElement.style.animation = '';
          }, 800);
        }
      }, isMobile ? 800 : 500); // Longer delay on mobile to account for map closing

      // Reset the tab selection after a delay
      setTimeout(() => setWarningsInitialTab(undefined), 1000);
    }

    setAlertDismissed(true); // Dismiss the alert after clicking
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

  return (
    <div className="relative h-screen flex flex-col">
      <title>Skymapper - Plan your VFR flight routes with ease</title>
      <meta></meta>
      {/* Airspace Alert - appears on both mobile and desktop */}
      {!alertDismissed && waypoints.length > 0 && (
        <AirspaceAlert
          waypoints={waypoints}
          analyzeRouteWarnings={analyzeRouteWarnings}
          onDismiss={() => setAlertDismissed(true)}
          onClick={handleAirspaceAlertClick}
        />
      )}

      {/* Trivia Popup - shows once per session after tutorial and consent */}
      {showTriviaPopup && (
        <TriviaPopup
          onClose={() => setShowTriviaPopup(false)}
          autoRotate={true}
          rotateInterval={20000}
        />
      )}

      {/* Tools Panel - Desktop only (mobile will use bottom sheet) */}
      {!isMobile && (
        <ToolsPanel 
          waypoints={waypoints} 
          fuelConsumption={fuelConsumption}
          gal_liter={gal_liter}
          flightRules={flightRules}
        />
      )}

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
                analyzeRouteWarnings={analyzeRouteWarnings}
                onMoveMapRef={moveMapRef}
                flightRules={flightRules}
                showWeather={showWeatherOverlay}
              />
            </div>
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

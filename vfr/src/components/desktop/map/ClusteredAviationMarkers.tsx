// components/ClusteredAviationMarkers.tsx
import { useMap } from "react-leaflet";
import { useEffect } from "react";
import L from "leaflet";
import "leaflet.markercluster";
import {
  AviationMarker,
  createAviationIcon,
} from "../../../utils/aviationUtils";
import {
  Airport,
  Airspace,
  Hotspot,
  NavigationPoint,
  Obstacle,
  ReportingPoint,
  Runway,
} from "@/src/utils/types";
import { Theme } from "@/src/utils/ThemeContext";

interface ClusteredAviationMarkersProps {
  markers: AviationMarker[];
  theme: Theme;
  onMarkerClick?: (marker: AviationMarker) => void;
  airports?: Airport[];
}

const ClusteredAviationMarkers: React.FC<ClusteredAviationMarkersProps> = ({
  markers,
  theme,
  onMarkerClick,
  airports = [],
}) => {
  const map = useMap();

  useEffect(() => {
    if (!map || markers.length === 0) return;

    // No global handlers needed - using direct event listeners

    // Create cluster group
    const clusterGroup = L.markerClusterGroup({
      chunkedLoading: true,
      maxClusterRadius: 50,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true,
      spiderfyDistanceMultiplier: 1.2,
      disableClusteringAtZoom: 15, // Disable clustering at high zoom levels
      iconCreateFunction: (cluster: L.MarkerCluster) => {
        const count = cluster.getChildCount();
        let className = "marker-cluster-small";

        if (count >= 100) {
          className = "marker-cluster-large";
        } else if (count >= 10) {
          className = "marker-cluster-medium";
        }

        return L.divIcon({
          html: `<div><span>${count}</span></div>`,
          className: `marker-cluster ${className}`,
          iconSize: L.point(40, 40, true),
        });
      },
    });

    // Store runway lines and event cleanup functions
    const runwayLines: L.Polyline[] = [];
    const cleanupFunctions: (() => void)[] = [];

    // Add markers to cluster group and runway visualization
    markers.forEach((marker) => {
      const leafletMarker = L.marker(marker.position, {
        icon: createAviationIcon(marker.type, theme),
        zIndexOffset: marker.type === "airport" ? 1000 : 100, // Higher z-index for airports
        riseOnHover: true,
        riseOffset: 250,
      });

      // Create popup content as HTML string
      const popupContent = createPopupContent(marker, airports);
      const popup = L.popup().setContent(popupContent);
      leafletMarker.bindPopup(popup);

      // No trip button functionality - just show airport information

      // No custom event handling at all - pure Leaflet behavior

      clusterGroup.addLayer(leafletMarker);

      // Add runway visualization for airports
      if (marker.type === "airport") {
        const airport = marker.data as Airport;
        if (airport.runways && airport.runways.length > 0) {
          airport.runways.forEach((runway) => {
            const runwayLine = createRunwayLine(marker.position, runway, theme);
            if (runwayLine) {
              runwayLines.push(runwayLine);
              map.addLayer(runwayLine);
            }
          });
        }
      }
    });

    // Add cluster group to map
    map.addLayer(clusterGroup);

    // Cleanup function
    return () => {
      map.removeLayer(clusterGroup);
      // Remove runway lines
      runwayLines.forEach((line) => {
        map.removeLayer(line);
      });
      // Remove event listeners
      cleanupFunctions.forEach((cleanup) => cleanup());
    };
  }, [map, markers, theme, onMarkerClick, airports]);

  return null;
};

// Helper function to create popup content
function createPopupContent(
  marker: AviationMarker,
  airports: Airport[] = []
): string {
  const { data, type } = marker;

  switch (type) {
    case "airport":
      const airport = data as Airport;

      // Helper function to get surface composition name
      const getSurfaceName = (composition: number) => {
        const surfaces: { [key: number]: string } = {
          0: "Unknown", 1: "Water", 2: "Grass", 3: "Dirt", 4: "Gravel",
          5: "Asphalt", 6: "Concrete", 7: "Sand", 8: "Steel", 9: "Ice"
        };
        return surfaces[composition] || "Unknown";
      };

      // Format runway information
      const runwayDetails = airport.runways?.map(runway => {
        const surface = getSurfaceName(runway.surface?.mainComposite || 0);
        const length = runway.dimension?.length?.value || 0;
        const width = runway.dimension?.width?.value || 0;

        return `
          <div class="runway-item">
            <div class="runway-designator">Runway ${runway.designator}</div>
            <div class="runway-details">
              <div class="runway-dimension">${length}m × ${width}m</div>
              <div class="runway-surface">Surface: ${surface}</div>
              <div class="runway-heading">Heading: ${runway.trueHeading}°</div>
              ${runway.takeOffOnly ? '<div class="runway-restriction">Takeoff Only</div>' : ''}
              ${runway.landingOnly ? '<div class="runway-restriction">Landing Only</div>' : ''}
            </div>
          </div>
        `;
      }).join('') || '<div class="no-data">No runway information available</div>';

      // Format frequencies
      const frequencyDetails = airport.frequencies?.slice(0, 3).map(freq => {
        return `<div>${freq.name}: ${freq.value} MHz</div>`;
      }).join('') || '<div>No frequency information</div>';

      return `
        <div class="aviation-popup themed-popup" style="min-width: 320px; max-width: 400px;">
          <div class="popup-header">
            <h3 class="popup-title">${airport.name || "Unknown Airport"}</h3>
            <div class="popup-subtitle">
              ${airport.icaoCode || "N/A"} ${airport.iataCode ? `• ${airport.iataCode}` : ""} • ${airport.country || ""}
            </div>
          </div>

          <div class="popup-content">
            <div class="info-section">
              <div class="info-item">
                <span class="info-label">Elevation:</span>
                <span class="info-value">${airport.elevation?.value || "N/A"}m</span>
              </div>
              <div class="info-item">
                <span class="info-label">Type:</span>
                <span class="info-value">${airport.private ? 'Private' : 'Public'}</span>
              </div>
              ${airport.ppr ? '<div class="ppr-warning">⚠️ PPR Required</div>' : ''}
            </div>

            <div class="section">
              <h4 class="section-title">Runways (${airport.runways?.length || 0})</h4>
              <div class="runways-container">
                ${runwayDetails}
              </div>
            </div>

            <div class="section">
              <h4 class="section-title">Frequencies</h4>
              <div class="frequencies-container">
                ${frequencyDetails}
              </div>
            </div>

            <!-- Trip buttons removed - waypoints created by map clicks only -->
          </div>
        </div>
      `;

    case "airspace":
      const airspace = data as Airspace;
      return `
        <div class="aviation-popup">
          <h3>${airspace.name || "Unknown Airspace"}</h3>
          <p><strong>Type:</strong> ${airspace.type || "N/A"}</p>
          <p><strong>ICAO Class:</strong> ${airspace.icaoClass || "N/A"}</p>
          <p><strong>Upper Limit:</strong> ${
            airspace.upperLimit?.value || "N/A"
          }m</p>
          <p><strong>Lower Limit:</strong> ${
            airspace.lowerLimit?.value || "N/A"
          }m</p>

        </div>
      `;

    case "navigation":
      const navPoint = data as NavigationPoint;
      return `
        <div class="aviation-popup themed-popup" style="min-width: 280px; max-width: 360px;">
          <div class="popup-header">
            <h3 class="popup-title">${navPoint.name || "Unknown Navigation Point"}</h3>
            <div class="popup-subtitle">
              ${navPoint.identifier || "N/A"} • ${navPoint.type || "Navigation Aid"}
            </div>
          </div>

          <div class="popup-content">
            <div class="info-section">
              <div class="info-item">
                <span class="info-label">Type:</span>
                <span class="info-value">${navPoint.type || "N/A"}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Identifier:</span>
                <span class="info-value">${navPoint.identifier || "N/A"}</span>
              </div>
              ${
                navPoint.frequency?.value
                  ? `<div class="info-item">
                      <span class="info-label">Frequency:</span>
                      <span class="info-value">${navPoint.frequency.value} MHz</span>
                    </div>`
                  : ""
              }
              ${
                navPoint.channel
                  ? `<div class="info-item">
                      <span class="info-label">Channel:</span>
                      <span class="info-value">${navPoint.channel}</span>
                    </div>`
                  : ""
              }
              <div class="info-item">
                <span class="info-label">Elevation:</span>
                <span class="info-value">${navPoint.elevation?.value || "N/A"}m</span>
              </div>
            </div>
          </div>
        </div>
      `;

    case "obstacle":
      const obstacle = data as Obstacle;
      return `
        <div class="aviation-popup themed-popup" style="min-width: 280px; max-width: 360px;">
          <div class="popup-header">
            <h3 class="popup-title">${obstacle.name || "Unknown Obstacle"}</h3>
            <div class="popup-subtitle">
              ${obstacle.type || "Obstacle"}
            </div>
          </div>

          <div class="popup-content">
            <div class="info-section">
              <div class="info-item">
                <span class="info-label">Type:</span>
                <span class="info-value">${obstacle.type || "N/A"}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Elevation:</span>
                <span class="info-value">${obstacle.elevation?.value || "N/A"}m</span>
              </div>
              ${
                obstacle.osmId
                  ? `<div class="info-item">
                      <span class="info-label">OSM ID:</span>
                      <span class="info-value">${obstacle.osmId}</span>
                    </div>`
                  : ""
              }
              ${
                obstacle.osmTags?.power
                  ? `<div class="info-item">
                      <span class="info-label">Power:</span>
                      <span class="info-value">${obstacle.osmTags.power}</span>
                    </div>`
                  : ""
              }
              ${
                obstacle.osmTags?.height
                  ? `<div class="info-item">
                      <span class="info-label">Height:</span>
                      <span class="info-value">${obstacle.osmTags.height}</span>
                    </div>`
                  : ""
              }
            </div>
          </div>
        </div>
      `;

    case "hotspot":
      const hotspot = data as Hotspot;
      return `
        <div class="aviation-popup">
          <h3>${hotspot.name || "Unknown Hotspot"}</h3>
          <p><strong>Type:</strong> ${hotspot.type || "N/A"}</p>
          <p><strong>Country:</strong> ${hotspot.country || "N/A"}</p>
        </div>
      `;

    case "reportingpoint":
      const reportingPoint = data as ReportingPoint;
      const compulsoryText = reportingPoint.compulsory ? "Yes" : "No";

      // Look up airport names instead of showing IDs
      const airportNames: string[] = [];
      if (reportingPoint.airports?.length > 0) {
        reportingPoint.airports.forEach((airportId) => {
          const airport = airports.find((a) => a._id === airportId);
          if (airport) {
            airportNames.push(airport.name);
          }
        });
      }
      // const airportsText =
      //   airportNames.length > 0 ? airportNames.join(", ") : "N/A";

      const createdDate = reportingPoint.createdAt
        ? new Date(reportingPoint.createdAt).toLocaleDateString()
        : "N/A";
      const updatedDate = reportingPoint.updatedAt
        ? new Date(reportingPoint.updatedAt).toLocaleDateString()
        : "N/A";

      return `
        <div class="aviation-popup themed-popup" style="min-width: 280px; max-width: 360px;">
          <div class="popup-header">
            <h3 class="popup-title">${reportingPoint.name || "Unknown Reporting Point"}</h3>
            <div class="popup-subtitle">
              ${reportingPoint.country || "N/A"}${reportingPoint.compulsory ? ' • Compulsory' : ''}
            </div>
          </div>

          <div class="popup-content">
            <div class="info-section">
              <div class="info-item">
                <span class="info-label">Type:</span>
                <span class="info-value">Reporting Point</span>
              </div>
              <div class="info-item">
                <span class="info-label">Compulsory:</span>
                <span class="info-value">${compulsoryText}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Elevation:</span>
                <span class="info-value">${reportingPoint.elevation?.value || "N/A"}m</span>
              </div>
              ${
                reportingPoint.elevationGeoid?.hae
                  ? `<div class="info-item">
                      <span class="info-label">Elevation HAE:</span>
                      <span class="info-value">${Math.round(reportingPoint.elevationGeoid.hae * 100) / 100}m</span>
                    </div>`
                  : ""
              }
            </div>

            ${airportNames.length > 0 ? `
              <div class="section">
                <h4 class="section-title">Linked Airports</h4>
                <div class="frequencies-container">
                  ${airportNames.map(name => `<div>${name}</div>`).join('')}
                </div>
              </div>
            ` : ''}

            <div class="section">
              <h4 class="section-title">Metadata</h4>
              <div class="info-section">
                <div class="info-item">
                  <span class="info-label">Created:</span>
                  <span class="info-value">${createdDate}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Updated:</span>
                  <span class="info-value">${updatedDate}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;

    default:
      return `<div class="aviation-popup"><h3>${type}</h3><p>No detailed information available</p></div>`;
  }
}

// Helper function to create runway lines
function createRunwayLine(
  airportPosition: [number, number],
  runway: Runway,
  theme: Theme
): L.Polyline | null {
  try {
    const [airportLat, airportLon] = airportPosition;
    const runwayLength = runway.dimension?.length?.value || 800; // meters
    const heading = runway.trueHeading || 0; // degrees

    // Convert runway length to approximate degrees (rough approximation)
    const lengthInDegrees = runwayLength / 111000; // roughly 111km per degree

    // Calculate runway endpoints
    const headingRad = (heading * Math.PI) / 180;
    const halfLength = lengthInDegrees / 2;

    const lat1 = airportLat + Math.cos(headingRad) * halfLength;
    const lon1 = airportLon + Math.sin(headingRad) * halfLength;
    const lat2 = airportLat - Math.cos(headingRad) * halfLength;
    const lon2 = airportLon - Math.sin(headingRad) * halfLength;

    // Create runway line
    const runwayLine = L.polyline(
      [
        [lat1, lon1],
        [lat2, lon2],
      ],
      {
        color: getRunwayColor(theme),
        weight: 3,
        opacity: 0.8,
        dashArray: runway.surface?.mainComposite === 2 ? undefined : "5, 5", // solid for grass, dashed for others
      }
    );

    // Add popup with runway info
    runwayLine.bindPopup(`
      <div style="font-size: 12px;">
        <strong>Runway ${runway.designator}</strong><br>
        Length: ${runwayLength}m<br>
        Heading: ${heading}°<br>
        Surface: ${getSurfaceNameForPopup(runway.surface?.mainComposite || 0)}
      </div>
    `);

    return runwayLine;
  } catch (error) {
    console.warn("Error creating runway line:", error);
    return null;
  }
}

// Helper function to get runway color based on theme
function getRunwayColor(theme: Theme): string {
  switch (theme) {
    case "dark":
      return "#60a5fa"; // blue-400
    case "cyber":
      return "#00fff2"; // cyan
    case "aurora":
      return "#6ee7b7"; // emerald-300
    case "quantum":
      return "#bf7af0"; // purple-300
    default:
      return "#3b82f6"; // blue-500
  }
}

// Helper function to get surface name for popup
function getSurfaceNameForPopup(composition: number): string {
  const surfaces: { [key: number]: string } = {
    0: "Unknown",
    1: "Water",
    2: "Grass",
    3: "Dirt",
    4: "Gravel",
    5: "Asphalt",
    6: "Concrete",
    7: "Sand",
    8: "Steel",
    9: "Ice",
  };
  return surfaces[composition] || "Unknown";
}

export default ClusteredAviationMarkers;

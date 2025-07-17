// components/ClusteredAviationMarkers.tsx
import { useMap } from 'react-leaflet';
import { useEffect } from 'react';
import L from 'leaflet';
import 'leaflet.markercluster';
import { AviationMarker, createAviationIcon } from '../../../utils/aviationUtils';
import { Airport, Airspace, Hotspot, NavigationPoint, Obstacle} from '@/src/utils/types';
import { Theme } from '@/src/utils/ThemeContext';

interface ClusteredAviationMarkersProps {
  markers: AviationMarker[];
  theme: Theme;
  onMarkerClick?: (marker: AviationMarker) => void;
}

const ClusteredAviationMarkers: React.FC<ClusteredAviationMarkersProps> = ({
  markers,
  theme,
  onMarkerClick
}) => {
  const map = useMap();

  useEffect(() => {
    if (!map || markers.length === 0) return;

    // Create cluster group
    const clusterGroup = L.markerClusterGroup({
      chunkedLoading: true,
      maxClusterRadius: 50,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true,
      spiderfyDistanceMultiplier: 1.2,
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
      }
    });

    // Add markers to cluster group
    markers.forEach(marker => {
      const leafletMarker = L.marker(marker.position, {
        icon: createAviationIcon(marker.type, theme)
      });

      // Create popup content as HTML string
      const popupContent = createPopupContent(marker);
      leafletMarker.bindPopup(popupContent);

      // Add click handler
      leafletMarker.on('click', () => {
        if (onMarkerClick) {
          onMarkerClick(marker);
        }
      });

      clusterGroup.addLayer(leafletMarker);
    });

    // Add cluster group to map
    map.addLayer(clusterGroup);

    // Cleanup function
    return () => {
      map.removeLayer(clusterGroup);
    };
  }, [map, markers, theme, onMarkerClick]);

  return null;
};

// Helper function to create popup content
function createPopupContent(marker: AviationMarker): string {
  const { data, type } = marker;

  switch (type) {
    case 'airport':
      const airport = data as Airport;
      return `
        <div class="aviation-popup">
          <h3>${airport.name || 'Unknown Airport'}</h3>
          <p><strong>ICAO:</strong> ${airport.icaoCode || 'N/A'}</p>
          ${airport.iataCode ? `<p><strong>IATA:</strong> ${airport.iataCode}</p>` : ''}
          <p><strong>Elevation:</strong> ${airport.elevation?.value || 'N/A'}m</p>
          <p><strong>Runways:</strong> ${airport.runways?.length || 0}</p>
          ${airport.frequencies?.length > 0 ? `<p><strong>Primary Frequency:</strong> ${airport.frequencies[0].value}</p>` : ''}
        </div>
      `;

    case 'airspace':
      const airspace = data as Airspace;
      return `
        <div class="aviation-popup">
          <h3>${airspace.name || 'Unknown Airspace'}</h3>
          <p><strong>Type:</strong> ${airspace.type || 'N/A'}</p>
          <p><strong>ICAO Class:</strong> ${airspace.icaoClass || 'N/A'}</p>
          <p><strong>Upper Limit:</strong> ${airspace.upperLimit?.value || 'N/A'}m</p>
          <p><strong>Lower Limit:</strong> ${airspace.lowerLimit?.value || 'N/A'}m</p>

        </div>
      `;

    case 'navigation':
      const navPoint = data as NavigationPoint;
      return `
        <div class="aviation-popup">
          <h3>${navPoint.name || 'Unknown Navigation Point'}</h3>
          <p><strong>Identifier:</strong> ${navPoint.identifier || 'N/A'}</p>
          <p><strong>Type:</strong> ${navPoint.type || 'N/A'}</p>
          <p><strong>Frequency:</strong> ${navPoint.frequency?.value || 'N/A'}</p>
          <p><strong>Elevation:</strong> ${navPoint.elevation?.value || 'N/A'}m</p>
          ${navPoint.channel ? `<p><strong>Channel:</strong> ${navPoint.channel}</p>` : ''}
        </div>
      `;

    case 'obstacle':
      const obstacle = data as Obstacle;
      return `
        <div class="aviation-popup">
          <h3>${obstacle.name || 'Unknown Obstacle'}</h3>
          <p><strong>Type:</strong> ${obstacle.type || 'N/A'}</p>
          <p><strong>Elevation:</strong> ${obstacle.elevation?.value || 'N/A'}m</p>
          <p><strong>OSM ID:</strong> ${obstacle.osmId || 'N/A'}</p>
          ${obstacle.osmTags?.power ? `<p><strong>Power:</strong> ${obstacle.osmTags.power}</p>` : ''}
        </div>
      `;

    case 'hotspot':
      const hotspot = data as Hotspot;
      return `
        <div class="aviation-popup">
          <h3>${hotspot.name || 'Unknown Hotspot'}</h3>
          <p><strong>Type:</strong> ${hotspot.type || 'N/A'}</p>
          <p><strong>Country:</strong> ${hotspot.country || 'N/A'}</p>
        </div>
      `;

    default:
      return `<div class="aviation-popup"><h3>${type}</h3><p>No detailed information available</p></div>`;
  }
}


export default ClusteredAviationMarkers;

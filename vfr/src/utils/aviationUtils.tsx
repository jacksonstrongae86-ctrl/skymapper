// utils/aviationUtils.ts
import L from 'leaflet';
import {
  Plane,
  Shield,
  Radio,
  AlertTriangle,
  Flame,
} from 'lucide-static';
import { Theme } from './ThemeContext';
import {
  AviationGeometry,
  Airport,
  Airspace,
  NavigationPoint,
  Obstacle,
  Hotspot,
  Runway,
} from './types';
export type AviationItem = Airport | Airspace | NavigationPoint | Obstacle | Hotspot;

export interface AviationMarker {
  id: string;
  name: string;
  type: 'airport' | 'airspace' | 'navigation' | 'obstacle' | 'hotspot';
  position: [number, number];
  data: AviationItem;
}

interface IconConfig {
  icon: string;  // Changed from function to string
  color: string;
}

export function createAviationIcon(
  type: 'airport' | 'airspace' | 'navigation' | 'obstacle' | 'hotspot',
  theme: Theme
): L.DivIcon {
  const iconCfg: Record<typeof type, IconConfig> = {
    airport: { icon: Plane, color: '#ffffff' },
    airspace: { icon: Shield, color: '#ffffff' },
    navigation: { icon: Radio, color: '#ffffff' },
    obstacle: { icon: AlertTriangle, color: '#ffffff' },
    hotspot: { icon: Flame, color: '#ffffff' },
  };

  const config = iconCfg[type] ?? iconCfg.airport;

  // Fix: Use the icon directly as it's already an SVG string
  // Apply stroke color by replacing the default stroke attribute
  const svg = config.icon.replace(
    'stroke="currentColor"',
    `stroke="${config.color}"`
  );

  return L.divIcon({
    html: `
      <div class="
        w-8 h-8
        flex items-center justify-center
        rounded-full
        button-gradient-${theme}
        text-[var(--button-text)]
        border-2 border-[var(--sidebar-border)]
        shadow-lg
      ">
        ${svg}
      </div>
    `,
    className: `aviation-marker aviation-${type}`,
    iconSize: [24, 24] as L.PointTuple,
    iconAnchor: [12, 12] as L.PointTuple,
  });
}

export function createRunwayArrowIcon(runway: Runway): L.DivIcon {
  const heading = runway.trueHeading || 0;

  return L.divIcon({
    html: `
      <div style="
        transform: rotate(${heading}deg);
        transform-origin: center;
      ">
        <svg width="24" height="8" viewBox="0 0 24 8" style="overflow: visible;">
          <defs>
            <marker id="arrowhead-${runway._id}" markerWidth="6" markerHeight="4"
                    refX="6" refY="2" orient="auto">
              <polygon points="0 0, 6 2, 0 4" fill="#1e40af" />
            </marker>
          </defs>
          <line x1="2" y1="4" x2="18" y2="4"
                stroke="#1e40af"
                stroke-width="2"
                marker-end="url(#arrowhead-${runway._id})" />
          <text x="12" y="3"
                font-family="Arial, sans-serif"
                font-size="8"
                font-weight="bold"
                text-anchor="middle"
                fill="#1e40af">
            ${runway.designator}
          </text>
        </svg>
      </div>
    `,
    className: 'runway-arrow-marker',
    iconSize: [24, 8] as L.PointTuple,
    iconAnchor: [12, 4] as L.PointTuple,
  });
}

export function extractCoordinates(geometry: AviationGeometry): [number, number] | null {
  if (!geometry?.coordinates) return null;

  switch (geometry.type) {
    case 'Point':
      const [lng, lat] = geometry.coordinates as [number, number];
      return [lat, lng];

    case 'Polygon':
      const polygonCoords = geometry.coordinates as number[][][];
      if (polygonCoords.length > 0 && polygonCoords[0].length > 0) {
        const centroid = calculatePolygonCentroid(polygonCoords[0]);
        return [centroid.lat, centroid.lng];
      }
      break;

    case 'MultiPolygon':
      const multiPolygonCoords = geometry.coordinates as number[][][][];
      if (multiPolygonCoords.length > 0 && multiPolygonCoords[0].length > 0 && multiPolygonCoords[0][0].length > 0) {
        const centroid = calculatePolygonCentroid(multiPolygonCoords[0][0]);
        return [centroid.lat, centroid.lng];
      }
      break;
  }

  return null;
}

export function extractPolygonCoordinates(geometry: AviationGeometry): [number, number][] | null {
  if (!geometry?.coordinates) return null;

  switch (geometry.type) {
    case 'Polygon':
      const polygonCoords = geometry.coordinates as number[][][];
      if (polygonCoords.length > 0 && polygonCoords[0].length > 0) {
        return polygonCoords[0].map(([lng, lat]) => [lat, lng]);
      }
      break;
    case 'MultiPolygon':
      const multiPolygonCoords = geometry.coordinates as number[][][][];
      if (multiPolygonCoords.length > 0 && multiPolygonCoords[0].length > 0 && multiPolygonCoords[0][0].length > 0) {
        return multiPolygonCoords[0][0].map(([lng, lat]) => [lat, lng]);
      }
      break;
  }
  return null;
}

function calculatePolygonCentroid(ring: number[][]): { lat: number; lng: number } {
  let totalLat = 0;
  let totalLng = 0;
  const pointCount = ring.length;

  for (const [lng, lat] of ring) {
    totalLat += lat;
    totalLng += lng;
  }

  return {
    lat: totalLat / pointCount,
    lng: totalLng / pointCount,
  };
}

export function convertAviationDataToMarkers(
  airports: Airport[],
  airspaces: Airspace[],
  navigation: NavigationPoint[],
  obstacles: Obstacle[],
  hotspots: Hotspot[]
): AviationMarker[] {
  const markers: AviationMarker[] = [];

  // Process airports
  airports.forEach(airport => {
    const position = extractCoordinates(airport.geometry);
    if (position) {
      markers.push({
        id: airport._id,
        name: airport.name,
        type: 'airport',
        position,
        data: airport,
      });
    }
  });

  // Process airspaces
  airspaces.forEach(airspace => {
    const position = extractCoordinates(airspace.geometry);
    if (position) {
      markers.push({
        id: airspace._id,
        name: airspace.name,
        type: 'airspace',
        position,
        data: airspace,
      });
    }
  });

  // Process navigation points
  navigation.forEach(navPoint => {
    const position = extractCoordinates(navPoint.geometry);
    if (position) {
      markers.push({
        id: navPoint._id,
        name: navPoint.name,
        type: 'navigation',
        position,
        data: navPoint,
      });
    }
  });

  // Process obstacles
  obstacles.forEach(obstacle => {
    const position = extractCoordinates(obstacle.geometry);
    if (position) {
      markers.push({
        id: obstacle._id,
        name: obstacle.name,
        type: 'obstacle',
        position,
        data: obstacle,
      });
    }
  });

  // Process hotspots
  hotspots.forEach(hotspot => {
    const position = extractCoordinates(hotspot.geometry);
    if (position) {
      markers.push({
        id: hotspot._id,
        name: hotspot.name,
        type: 'hotspot',
        position,
        data: hotspot,
      });
    }
  });

  return markers;
}

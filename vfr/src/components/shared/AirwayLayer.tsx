'use client';

import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import { Airway } from '@/src/utils/types';

interface AirwayLayerProps {
  airways: Airway[];
  visible: boolean;
}

export default function AirwayLayer({ airways, visible }: AirwayLayerProps) {
  const map = useMap();

  useEffect(() => {
    if (!visible || airways.length === 0) {
      // Remove all airway layers
      map.eachLayer((layer) => {
        if ('_airwayLayer' in layer && layer._airwayLayer) {
          map.removeLayer(layer);
        }
      });
      return;
    }

    // Clear existing airway layers
    map.eachLayer((layer) => {
      if ('_airwayLayer' in layer && layer._airwayLayer) {
        map.removeLayer(layer);
      }
    });

    // Add airway layers
    airways.forEach((airway) => {
      if (airway.fixes.length < 2) return;

      // Create line coordinates from fixes
      const coordinates: L.LatLngExpression[] = airway.fixes.map((fix) => [
        fix.position[0],
        fix.position[1],
      ]);

      // Color based on airway type
      const color = airway.type === 'LOW' ? '#3b82f6' : '#ef4444';
      const weight = airway.type === 'LOW' ? 2 : 3;

      // Create polyline
      const polyline = L.polyline(coordinates, {
        color: color,
        weight: weight,
        opacity: 0.6,
        dashArray: '10, 10',
      });

      // Mark as airway layer for cleanup
      Object.assign(polyline, { _airwayLayer: true });

      // Add tooltip with airway info
      const tooltipContent = `
        <div class="text-xs">
          <div class="font-bold">${airway.name}</div>
          <div class="text-[var(--text-secondary)]">
            ${airway.type === 'LOW' ? 'Aerovía Baja (Victor)' : 'Aerovía Alta (Jet)'}
          </div>
          <div class="text-[var(--text-secondary)]">
            MEA: ${airway.minAltitude} ft
            ${airway.maxAltitude ? ` - ${airway.maxAltitude} ft` : ''}
          </div>
        </div>
      `;

      polyline.bindTooltip(tooltipContent, {
        sticky: true,
        className: 'airway-tooltip',
      });

      polyline.addTo(map);

      // Add fix markers
      airway.fixes.forEach((fix, index) => {
        const icon = L.divIcon({
          className: 'airway-fix-marker',
          html: `
            <div class="
              w-3 h-3 rounded-full border-2
              ${airway.type === 'LOW' ? 'border-blue-500 bg-blue-500/50' : 'border-red-500 bg-red-500/50'}
            "></div>
          `,
          iconSize: [12, 12],
          iconAnchor: [6, 6],
        });

        const marker = L.marker([fix.position[0], fix.position[1]], {
          icon,
        });

        Object.assign(marker, { _airwayLayer: true });

        const fixTooltip = `
          <div class="text-xs">
            <div class="font-bold">${fix.name}</div>
            <div class="text-[var(--text-secondary)]">${fix.type}</div>
            ${index === 0 || index === airway.fixes.length - 1 ? '<div class="text-blue-400">Terminal</div>' : ''}
          </div>
        `;

        marker.bindTooltip(fixTooltip, {
          className: 'airway-fix-tooltip',
        });

        marker.addTo(map);
      });

      // Add airway label at midpoint
      const midIndex = Math.floor(airway.fixes.length / 2);
      const midFix = airway.fixes[midIndex];

      const labelIcon = L.divIcon({
        className: 'airway-label',
        html: `
          <div class="
            px-2 py-1 rounded text-xs font-bold
            ${airway.type === 'LOW' ? 'bg-blue-500/80 text-white' : 'bg-red-500/80 text-white'}
          ">
            ${airway.name}
            <div class="text-[10px] font-normal">MEA ${airway.minAltitude}'</div>
          </div>
        `,
        iconSize: [60, 30],
        iconAnchor: [30, 15],
      });

      const labelMarker = L.marker([midFix.position[0], midFix.position[1]], {
        icon: labelIcon,
      });

      Object.assign(labelMarker, { _airwayLayer: true });
      labelMarker.addTo(map);
    });

    // Cleanup on unmount or when airways change
    return () => {
      map.eachLayer((layer) => {
        if ('_airwayLayer' in layer && layer._airwayLayer) {
          map.removeLayer(layer);
        }
      });
    };
  }, [airways, visible, map]);

  return null;
}

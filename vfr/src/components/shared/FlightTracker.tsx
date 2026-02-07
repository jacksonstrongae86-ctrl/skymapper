'use client';

import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import { GPSPosition } from '@/src/services/gpsService';

interface FlightTrackerProps {
  currentPosition: GPSPosition | null;
  trail: GPSPosition[];
  autoCenter: boolean;
}

export default function FlightTracker({
  currentPosition,
  trail,
  autoCenter,
}: FlightTrackerProps) {
  const map = useMap();
  const aircraftMarkerRef = useRef<L.Marker | null>(null);
  const trailPolylineRef = useRef<L.Polyline | null>(null);

  useEffect(() => {
    if (!currentPosition) {
      // Clear markers when no position
      if (aircraftMarkerRef.current) {
        map.removeLayer(aircraftMarkerRef.current);
        aircraftMarkerRef.current = null;
      }
      if (trailPolylineRef.current) {
        map.removeLayer(trailPolylineRef.current);
        trailPolylineRef.current = null;
      }
      return;
    }

    // Create or update aircraft marker
    if (!aircraftMarkerRef.current) {
      const icon = L.divIcon({
        className: 'aircraft-marker',
        html: `
          <div class="relative">
            <svg
              width="32"
              height="32"
              viewBox="0 0 32 32"
              style="transform: rotate(${currentPosition.heading}deg)"
            >
              <path
                d="M16 2 L14 14 L8 16 L8 18 L14 16 L14 26 L10 28 L10 30 L16 29 L22 30 L22 28 L18 26 L18 16 L24 18 L24 16 L18 14 L16 2 Z"
                fill="#3b82f6"
                stroke="#ffffff"
                stroke-width="1"
              />
            </svg>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      aircraftMarkerRef.current = L.marker(
        [currentPosition.latitude, currentPosition.longitude],
        { icon }
      );
      aircraftMarkerRef.current.addTo(map);
    } else {
      // Update position and rotation
      aircraftMarkerRef.current.setLatLng([
        currentPosition.latitude,
        currentPosition.longitude,
      ]);

      const iconElement = aircraftMarkerRef.current.getElement();
      if (iconElement) {
        const svg = iconElement.querySelector('svg');
        if (svg) {
          svg.style.transform = `rotate(${currentPosition.heading}deg)`;
        }
      }
    }

    // Auto-center map on aircraft
    if (autoCenter) {
      map.setView(
        [currentPosition.latitude, currentPosition.longitude],
        map.getZoom(),
        { animate: true, duration: 0.5 }
      );
    }

    // Update trail
    if (trail.length > 1) {
      const trailCoords: L.LatLngExpression[] = trail.map((pos) => [
        pos.latitude,
        pos.longitude,
      ]);

      if (!trailPolylineRef.current) {
        trailPolylineRef.current = L.polyline(trailCoords, {
          color: '#3b82f6',
          weight: 3,
          opacity: 0.7,
        });
        trailPolylineRef.current.addTo(map);
      } else {
        trailPolylineRef.current.setLatLngs(trailCoords);
      }
    }

    return () => {
      // Cleanup on unmount
      if (aircraftMarkerRef.current) {
        map.removeLayer(aircraftMarkerRef.current);
        aircraftMarkerRef.current = null;
      }
      if (trailPolylineRef.current) {
        map.removeLayer(trailPolylineRef.current);
        trailPolylineRef.current = null;
      }
    };
  }, [currentPosition, autoCenter, map, trail]);

  return null;
}

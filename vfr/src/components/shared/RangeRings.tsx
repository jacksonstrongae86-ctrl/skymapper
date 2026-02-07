// RangeRings.tsx - Concentric circles around aircraft position
import React from 'react';
import { Circle, Popup } from 'react-leaflet';
import { GPSPosition } from '../../services/gpsService';

interface RangeRingsProps {
  currentPosition: GPSPosition | null;
  visible: boolean;
}

const NM_TO_METERS = 1852;

export const RangeRings: React.FC<RangeRingsProps> = ({ currentPosition, visible }) => {
  if (!visible || !currentPosition) return null;

  const rings = [
    { distance: 5, color: '#3B82F6', opacity: 0.3 },
    { distance: 10, color: '#10B981', opacity: 0.25 },
    { distance: 25, color: '#F59E0B', opacity: 0.2 },
  ];

  const center: [number, number] = [currentPosition.latitude, currentPosition.longitude];

  return (
    <>
      {rings.map((ring) => (
        <Circle
          key={`range-ring-${ring.distance}`}
          center={center}
          radius={ring.distance * NM_TO_METERS}
          pathOptions={{
            color: ring.color,
            fillColor: ring.color,
            fillOpacity: ring.opacity,
            weight: 2,
            dashArray: '5, 10',
          }}
        >
          <Popup>
            <div style={{ textAlign: 'center' }}>
              <strong>{ring.distance} nm</strong>
              <br />
              Radio de alcance
            </div>
          </Popup>
        </Circle>
      ))}
    </>
  );
};

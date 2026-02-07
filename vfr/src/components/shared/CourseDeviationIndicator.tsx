// CourseDeviationIndicator.tsx - CDI for lateral deviation from planned track
import React from 'react';
import { GPSPosition } from '../../services/gpsService';
import { Waypoint } from '../../utils/types';

interface CourseDeviationIndicatorProps {
  currentPosition: GPSPosition | null;
  waypoints: Waypoint[];
  visible: boolean;
}

// Calculate great circle distance in meters
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000; // Earth radius in meters
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Calculate cross-track distance (lateral deviation from great circle path)
function crossTrackDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
  lat3: number,
  lon3: number
): number {
  const R = 6371000; // meters
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const d13 = calculateDistance(lat1, lon1, lat3, lon3) / R; // angular distance in radians
  const brng12 = toRad(calculateBearing(lat1, lon1, lat2, lon2));
  const brng13 = toRad(calculateBearing(lat1, lon1, lat3, lon3));

  const dxt = Math.asin(Math.sin(d13) * Math.sin(brng13 - brng12)) * R;
  return dxt;
}

// Calculate bearing between two points
function calculateBearing(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const toDeg = (rad: number) => (rad * 180) / Math.PI;

  const dLon = toRad(lon2 - lon1);
  const y = Math.sin(dLon) * Math.cos(toRad(lat2));
  const x =
    Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) -
    Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(dLon);

  const brng = toDeg(Math.atan2(y, x));
  return (brng + 360) % 360;
}

export const CourseDeviationIndicator: React.FC<CourseDeviationIndicatorProps> = ({
  currentPosition,
  waypoints,
  visible,
}) => {
  if (!visible || !currentPosition || waypoints.length < 2) return null;

  // Find current leg (between which waypoints we are)
  let fromWp: Waypoint | null = null;
  let toWp: Waypoint | null = null;
  let minDistance = Infinity;

  // Find the closest leg
  for (let i = 0; i < waypoints.length - 1; i++) {
    const wp1 = waypoints[i];
    const wp2 = waypoints[i + 1];
    
    const d1 = calculateDistance(
      currentPosition.latitude,
      currentPosition.longitude,
      wp1.position[0],
      wp1.position[1]
    );
    const d2 = calculateDistance(
      currentPosition.latitude,
      currentPosition.longitude,
      wp2.position[0],
      wp2.position[1]
    );
    
    const totalDist = d1 + d2;
    if (totalDist < minDistance) {
      minDistance = totalDist;
      fromWp = wp1;
      toWp = wp2;
    }
  }

  if (!fromWp || !toWp) return null;

  // Calculate cross-track error in meters
  const deviation = crossTrackDistance(
    fromWp.position[0],
    fromWp.position[1],
    toWp.position[0],
    toWp.position[1],
    currentPosition.latitude,
    currentPosition.longitude
  );

  // Convert to nautical miles
  const deviationNM = Math.abs(deviation) / 1852;

  // Determine color based on deviation
  const getColor = () => {
    if (deviationNM <= 1) return '#10B981'; // green
    if (deviationNM <= 3) return '#F59E0B'; // yellow
    return '#EF4444'; // red
  };

  // CDI scale: each dot represents 1nm, max 5 dots on each side
  const dotCount = 5;
  const scale = 5; // nm
  const needlePosition = Math.max(-scale, Math.min(scale, deviation / 1852));
  const needleOffset = (needlePosition / scale) * 100; // -100 to +100

  return (
    <div
      className="fixed top-20 left-1/2 transform -translate-x-1/2 z-[450]
                 bg-gray-900/95 backdrop-blur-sm px-6 py-3 rounded-lg
                 shadow-xl border"
      style={{ borderColor: getColor() }}
    >
      <div className="flex flex-col items-center">
        <div className="text-xs text-gray-400 mb-2 font-semibold">
          DESVIACIÓN DE CURSO
        </div>
        
        <svg width="300" height="60" viewBox="0 0 300 60">
          {/* Scale dots */}
          {Array.from({ length: dotCount * 2 + 1 }).map((_, i) => {
            const x = 50 + (i - dotCount) * 40;
            const isCenter = i === dotCount;
            return (
              <circle
                key={i}
                cx={x}
                cy="30"
                r={isCenter ? 4 : 3}
                fill={isCenter ? '#fff' : '#4B5563'}
                opacity={isCenter ? 1 : 0.6}
              />
            );
          })}
          
          {/* Needle */}
          <g transform={`translate(${150 + needleOffset * 2}, 30)`}>
            <line
              x1="0"
              y1="-15"
              x2="0"
              y2="15"
              stroke={getColor()}
              strokeWidth="3"
            />
            <polygon
              points="0,-18 -5,-12 5,-12"
              fill={getColor()}
            />
            <polygon
              points="0,18 -5,12 5,12"
              fill={getColor()}
            />
          </g>
          
          {/* Scale labels */}
          <text x="10" y="50" fill="#9CA3AF" fontSize="10">-5nm</text>
          <text x="145" y="50" textAnchor="middle" fill="#fff" fontSize="10">0</text>
          <text x="280" y="50" textAnchor="end" fill="#9CA3AF" fontSize="10">+5nm</text>
        </svg>
        
        <div className="text-sm font-mono mt-1" style={{ color: getColor() }}>
          {deviation > 0 ? '←' : '→'} {deviationNM.toFixed(2)} nm
        </div>
      </div>
    </div>
  );
};

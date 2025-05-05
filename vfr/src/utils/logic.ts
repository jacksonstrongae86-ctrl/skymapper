import {LatLng, Waypoint } from '../utils/types';

// Utility functions
export const toRad = (deg: number): number => deg * (Math.PI / 180);
export const toDeg = (rad: number): number => rad * (180 / Math.PI);

export const IAStoTAS = (ias: number, fl: number): number => {
  const altitude = fl * 100;
  const temperatureLapseRate = 0.0019812;
  const seaLevelTemp = 288.15;
  let tempAtAltitude = seaLevelTemp - temperatureLapseRate * altitude;
  if (tempAtAltitude <= 0) tempAtAltitude = 1;
  return ias * Math.sqrt(seaLevelTemp / tempAtAltitude);
};

export const getDistance = (wp1: LatLng, wp2: LatLng): number => {
  const R = 3440;
  const dLat = toRad(wp2.lat - wp1.lat);
  const dLon = toRad(wp2.lng - wp1.lng);
  const lat1 = toRad(wp1.lat);
  const lat2 = toRad(wp2.lat);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
           Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export const getBearing = (wp1: LatLng, wp2: LatLng): number => {
  const dLon = toRad(wp2.lng - wp1.lng);
  const lat1 = toRad(wp1.lat);
  const lat2 = toRad(wp2.lat);
  const y = Math.sin(dLon) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
};

export const getHeading = (track: number, tas: number, windDir: number, windSpeed: number): number => {
  const windAngle = toRad(track - windDir);
  const crosswind = windSpeed * Math.sin(windAngle);
  const headwind = windSpeed * Math.cos(windAngle);
  const groundSpeed = tas - headwind;
  return (track + toDeg(Math.atan2(crosswind, groundSpeed)) + 360) % 360;
};

export const getGroundSpeed = (track: number, tas: number, windDir: number, windSpeed: number): number => {
  const windAngle = toRad(track - windDir);
  return tas - windSpeed * Math.cos(windAngle);
};

// Add this function to your utils/logic.ts or similar file
export const calculateTransitionWaypoint = (
  startWaypoint: Waypoint,
  endWaypoint: Waypoint,
  type: 'BOC' | 'TOC' | 'TOD' | 'BOD'
): Waypoint | null => {
  if (!startWaypoint.altitude || !endWaypoint.altitude || !startWaypoint.altitudeChange) {
    return null;
  }

  const distance = getDistance(
    { lat: startWaypoint.position[0], lng: startWaypoint.position[1] },
    { lat: endWaypoint.position[0], lng: endWaypoint.position[1] }
  );

  // Calculate time to climb/descend based on ROC/ROD
  const timeInMinutes = Math.abs(startWaypoint.altitudeChange!) / startWaypoint.rocRod!;

  // Calculate distance covered during climb/descent using IAS in climb/descent
  const speedInNmPerMinute = startWaypoint.iasClimbDescent! / 60;
  const distanceCovered = speedInNmPerMinute * timeInMinutes;

  // Calculate position ratio based on type
  const ratio = type === 'TOC' || type === 'BOD' ? distanceCovered / distance : 0;

  // Interpolate position
  const newLat = startWaypoint.position[0] + (endWaypoint.position[0] - startWaypoint.position[0]) * ratio;
  const newLng = startWaypoint.position[1] + (endWaypoint.position[1] - startWaypoint.position[1]) * ratio;

  return {
    position: [newLat, newLng],
    altitude: type === 'TOC' || type === 'BOD' ?
      startWaypoint.altitude + startWaypoint.altitudeChange :
      startWaypoint.altitude,
    type,
    ias: startWaypoint.iasClimbDescent!,
    visible: false, // This waypoint won't show on the map or sidebar
    altitudeChange: 0, // No further altitude change at transition point
    rocRod: startWaypoint.rocRod!,
    iasClimbDescent: startWaypoint.iasClimbDescent!
  };
};


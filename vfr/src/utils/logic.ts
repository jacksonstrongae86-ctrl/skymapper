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

export const calculateTransitionWaypoint = (
  currentWaypoint: Waypoint,
  nextWaypoint: Waypoint,
  type: "BOC" | "TOC" | "TOD" | "BOD"
): Waypoint | null => {
  if (!currentWaypoint.altitudeChange || !currentWaypoint.rocRod || !currentWaypoint.iasClimbDescent) {
    console.warn('Missing required parameters for transition calculation');
    return null;
  }

  // 1. Calculate time in minutes and hours
  const timeInMinutes = Math.abs(currentWaypoint.altitudeChange) / currentWaypoint.rocRod;
  const timeInHours = timeInMinutes / 60;

  // 2. Calculate distance in nautical miles
  const distanceNM = currentWaypoint.iasClimbDescent * timeInHours;

  // 3. Get bearing between current and next waypoint
  const bearing = getBearing(
    { lat: currentWaypoint.position[0], lng: currentWaypoint.position[1] },
    { lat: nextWaypoint.position[0], lng: nextWaypoint.position[1] }
  );

  // 4. Convert distance to angular distance (radians)
  const angularDistance = (distanceNM * 1852) / 71000;

  // 5. Convert current position and bearing to radians
  const lat1 = toRadians(currentWaypoint.position[0]);
  const lon1 = toRadians(currentWaypoint.position[1]);
  const bearingRad = toRadians(bearing);

  // 6. Calculate new position
  const newLat = Math.asin(
    Math.sin(lat1) * Math.cos(angularDistance) +
    Math.cos(lat1) * Math.sin(angularDistance) * Math.cos(bearingRad)
  );

  const newLon = lon1 + Math.atan2(
    Math.sin(bearingRad) * Math.sin(angularDistance) * Math.cos(lat1),
    Math.cos(angularDistance) - Math.sin(lat1) * Math.sin(newLat)
  );

  // 7. Convert back to degrees
  const newLatDeg = toDegrees(newLat);
  const newLonDeg = toDegrees(newLon);

  // 8. Calculate new altitude based on type
  const newAltitude = type === "TOC" || type === "BOD"
    ? currentWaypoint.altitude! + currentWaypoint.altitudeChange
    : currentWaypoint.altitude;

  return {
    position: [newLatDeg, newLonDeg],
    type,
    altitude: newAltitude,
    ias: currentWaypoint.iasClimbDescent,
    visible: false,
    altitudeChange: 0,
    rocRod: currentWaypoint.rocRod,
    iasClimbDescent: currentWaypoint.iasClimbDescent
  };
};

// Helper functions for degree/radian conversion
const toRadians = (degrees: number): number => degrees * (Math.PI / 180);
const toDegrees = (radians: number): number => radians * (180 / Math.PI);



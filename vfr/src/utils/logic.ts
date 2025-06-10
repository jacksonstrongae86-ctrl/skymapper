import { LatLng, Waypoint } from '../utils/types';

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

function getPointAtDistanceAndBearing(from: LatLng, bearing: number, distanceNM: number): LatLng {
  const R = 6371000; // Earth radius in meters
  const distance = distanceNM * 1852; // Convert to meters
  const angularDistance = distance / R;

  const lat1 = toRad(from.lat);
  const lon1 = toRad(from.lng);
  const bearingRad = toRad(bearing);

  const lat2 = Math.asin(Math.sin(lat1) * Math.cos(angularDistance) +
                         Math.cos(lat1) * Math.sin(angularDistance) * Math.cos(bearingRad));

  const lon2 = lon1 + Math.atan2(Math.sin(bearingRad) * Math.sin(angularDistance) * Math.cos(lat1),
                                 Math.cos(angularDistance) - Math.sin(lat1) * Math.sin(lat2));

  return { lat: toDeg(lat2), lng: toDeg(lon2) };
}

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

  // 3. Define direction and positions based on type
  // BOC/TOD: transition happens BEFORE the waypoint (like your JS code)
  // TOC/BOD: transition happens AFTER the waypoint (like your JS code)
  let from: LatLng, to: LatLng;

  if (type === "BOC" || type === "TOD") {
    // For BOC/TOD: calculate backwards from the current waypoint
    from = { lat: nextWaypoint.position[0], lng: nextWaypoint.position[1] };
    to = { lat: currentWaypoint.position[0], lng: currentWaypoint.position[1] };
  } else {
    // For TOC/BOD: calculate forwards from the current waypoint
    from = { lat: currentWaypoint.position[0], lng: currentWaypoint.position[1] };
    to = { lat: nextWaypoint.position[0], lng: nextWaypoint.position[1] };
  }

  // 4. Calculate bearing
  const bearing = getBearing(from, to);

  // 5. Calculate position at given distance
  const newPosition = getPointAtDistanceAndBearing(from, bearing, distanceNM);

  // 6. Calculate altitude for the transition waypoint
  // Use the original altitude as the base
  const baseAltitude = currentWaypoint.originalAltitude || currentWaypoint.altitude!;

  let newAltitude: number;
  if (type === "BOC") {
    // BOC: transition waypoint is at original altitude (start of climb)
    newAltitude = baseAltitude;
  } else if (type === "TOD") {
    // TOD: transition waypoint is at original altitude (start of descent)
    newAltitude = baseAltitude;
  } else if (type === "TOC") {
    // TOC: transition waypoint is at final altitude (end of climb)
    newAltitude = baseAltitude + currentWaypoint.altitudeChange;
  } else { // BOD
    // BOD: transition waypoint is at final altitude (end of descent)
    newAltitude = baseAltitude + currentWaypoint.altitudeChange;
  }

  return {
    position: [newPosition.lat, newPosition.lng],
    type,
    altitude: newAltitude,
    ias: currentWaypoint.iasClimbDescent,
    visible: false,
    altitudeChange: 0,
    rocRod: currentWaypoint.rocRod,
    iasClimbDescent: currentWaypoint.iasClimbDescent,
  };
};

import { LatLng, Waypoint } from '../utils/types';

// Utility functions
export const toRad = (deg: number): number => deg * (Math.PI / 180);
export const toDeg = (rad: number): number => rad * (180 / Math.PI);

export const IAStoTAS = (ias: number, fl: number): number => {
  // Physical & ISA constants
  const g   = 9.80665;   // m·s-2
  const R   = 287.05;    // J·kg-1·K-1
  const L   = 0.0065;    // K·m-1   (lapse rate)
  const T0  = 288.15;    // K       (15 °C)
  const P0  = 101325;    // Pa
  const ρ0  = 1.225;     // kg·m-3   (sea-level density)

  // Convert FL (hundreds of feet) → altitude in metres
  const h = fl * 100 * 0.3048;

  // Clamp altitude to troposphere limit (11 km)
  const hClamped = Math.min(h, 11000);

  // Temperature at altitude (ISA troposphere)
  const T = T0 - L * hClamped;

  // Safety check (should not trigger with clamping, but kept for robustness)
  if (T <= 0) {
    console.warn(`Altitude FL${fl} beyond ISA troposphere, using FL360 equivalent`);
    return ias * 2.4; // Approximate TAS ratio at FL360
  }

  // Pressure at altitude:  p = P0 · (T/T0)^(g/(R·L))
  const p = P0 * Math.pow(T / T0, g / (R * L));

  // Density at altitude:   ρ = p / (R·T)
  const ρ = p / (R * T);

  // TAS = IAS · √(ρ0 / ρ)
  return ias * Math.sqrt(ρ0 / ρ);
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
  const windAngle = toRad((windDir + 180) - track);
  const crosswind = windSpeed * Math.sin(windAngle);
  const headwind = windSpeed * Math.cos(windAngle);
  const groundSpeed = tas - headwind;
  const wca = toDeg(Math.atan2(crosswind, groundSpeed));
  return (track - wca + 360) % 360;
};


export const getGroundSpeed = (track: number, tas: number, windDir: number, windSpeed: number): number => {
  const windAngle = toRad((windDir + 180) - track);
  return tas + windSpeed * Math.cos(windAngle);
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
  lastWaypoint: Waypoint,
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

  // 2. Use the fixed time to calculate distance dynamically based on the current speed
  const speed = currentWaypoint.iasClimbDescent || 100; // Default to 100 if speed is not provided
  const distanceNM = speed * timeInHours;

  // 3. Define direction and positions based on type
  let from: LatLng, to: LatLng;

  if (type === "TOC" || type === "BOD") {
    // For TOC/BOD: calculate from current waypoint to last waypoint (reversed direction)
    from = { lat: currentWaypoint.position[0], lng: currentWaypoint.position[1] };
    to = { lat: lastWaypoint.position[0], lng: lastWaypoint.position[1] };
  } else {
    // For BOC/TOD: calculate from next waypoint to current
    from = { lat: nextWaypoint.position[0], lng: nextWaypoint.position[1] };
    to = { lat: currentWaypoint.position[0], lng: currentWaypoint.position[1] };
  }

  // 4. Calculate bearing
  const bearing = getBearing(from, to);

  // 5. Calculate position at given distance
  const newPosition = getPointAtDistanceAndBearing(from, bearing, distanceNM);

  // 6. Calculate altitude for the transition waypoint
  const baseAltitude = currentWaypoint.originalAltitude || currentWaypoint.altitude!;

  let newAltitude: number = baseAltitude;
  if (type === "BOC" || type === "TOD") {
    newAltitude = baseAltitude;
  } else if (type === "TOC" || type === "BOD") {
    newAltitude = baseAltitude + currentWaypoint.altitudeChange;
  }

  return {
    position: [newPosition.lat, newPosition.lng],
    type,
    altitude: newAltitude,
    ias: speed,
    visible: false,
    altitudeChange: 0,
    rocRod: currentWaypoint.rocRod,
    iasClimbDescent: currentWaypoint.iasClimbDescent,
    normalDistance: distanceNM,
    specialDistance: distanceNM,
  };
};

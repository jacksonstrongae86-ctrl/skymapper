// Flight Calculation API
import { NextApiRequest, NextApiResponse } from 'next';
import { withMiddleware, apiResponse } from '@/src/utils/apiMiddleware';

interface Waypoint {
  lat: number;
  lon: number;
  name?: string;
}

interface LegCalculation {
  from: string;
  to: string;
  distance: number; // nm
  heading: number; // degrees
  time: number; // minutes
  fuel: number; // liters
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

function toDegrees(radians: number): number {
  return radians * (180 / Math.PI);
}

// Haversine formula for distance calculation
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3440.065; // Earth's radius in nautical miles
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Calculate initial bearing
function calculateHeading(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const dLon = toRadians(lon2 - lon1);
  const y = Math.sin(dLon) * Math.cos(toRadians(lat2));
  const x =
    Math.cos(toRadians(lat1)) * Math.sin(toRadians(lat2)) -
    Math.sin(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.cos(dLon);
  
  let heading = toDegrees(Math.atan2(y, x));
  heading = (heading + 360) % 360;
  return Math.round(heading);
}

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return apiResponse(res, 405, false, undefined, 'Method not allowed');
  }
  
  const { waypoints: waypointsStr, cruiseSpeed, fuelConsumption } = req.query;
  
  if (!waypointsStr || typeof waypointsStr !== 'string') {
    return apiResponse(res, 400, false, undefined, 'Waypoints parameter is required');
  }
  
  let waypoints: Waypoint[];
  try {
    waypoints = JSON.parse(waypointsStr);
  } catch {
    return apiResponse(res, 400, false, undefined, 'Invalid waypoints JSON');
  }
  
  if (!Array.isArray(waypoints) || waypoints.length < 2) {
    return apiResponse(res, 400, false, undefined, 'At least 2 waypoints required');
  }
  
  const speed = cruiseSpeed ? parseFloat(cruiseSpeed as string) : 120; // kt
  const consumption = fuelConsumption ? parseFloat(fuelConsumption as string) : 35; // L/h
  
  const legs: LegCalculation[] = [];
  let totalDistance = 0;
  let totalTime = 0;
  let totalFuel = 0;
  
  for (let i = 0; i < waypoints.length - 1; i++) {
    const from = waypoints[i];
    const to = waypoints[i + 1];
    
    const distance = calculateDistance(from.lat, from.lon, to.lat, to.lon);
    const heading = calculateHeading(from.lat, from.lon, to.lat, to.lon);
    const time = (distance / speed) * 60; // minutes
    const fuel = (time / 60) * consumption; // liters
    
    legs.push({
      from: from.name || `WP${i + 1}`,
      to: to.name || `WP${i + 2}`,
      distance: Math.round(distance * 10) / 10,
      heading,
      time: Math.round(time),
      fuel: Math.round(fuel * 10) / 10,
    });
    
    totalDistance += distance;
    totalTime += time;
    totalFuel += fuel;
  }
  
  return apiResponse(res, 200, true, {
    legs,
    totals: {
      distance: Math.round(totalDistance * 10) / 10,
      time: Math.round(totalTime),
      fuel: Math.round(totalFuel * 10) / 10,
    },
    cruiseSpeed: speed,
    fuelConsumption: consumption,
  });
}

export default withMiddleware(handler);

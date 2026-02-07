// Aircraft Profiles API
import { NextApiRequest, NextApiResponse } from 'next';
import { withMiddleware, apiResponse } from '@/src/utils/apiMiddleware';

// Sample aircraft profiles
const AIRCRAFT_PROFILES = [
  {
    id: 'c172',
    name: 'Cessna 172 Skyhawk',
    type: 'C172',
    emptyWeight: 757, // kg
    maxWeight: 1111, // kg
    fuelCapacity: 212, // liters
    cruiseSpeed: 122, // kt
    fuelConsumption: 35, // L/h
    stations: [
      { name: 'Piloto', arm: 0.93, maxWeight: 120 },
      { name: 'Copiloto', arm: 0.93, maxWeight: 120 },
      { name: 'Asiento trasero izq.', arm: 1.55, maxWeight: 100 },
      { name: 'Asiento trasero der.', arm: 1.55, maxWeight: 100 },
      { name: 'Equipaje', arm: 2.16, maxWeight: 54 },
    ],
    emptyWeightArm: 1.02,
    limits: {
      forward: 0.91,
      aft: 1.14,
    },
  },
  {
    id: 'pa28',
    name: 'Piper PA-28 Cherokee',
    type: 'PA28',
    emptyWeight: 612, // kg
    maxWeight: 1089, // kg
    fuelCapacity: 189, // liters
    cruiseSpeed: 115, // kt
    fuelConsumption: 32, // L/h
    stations: [
      { name: 'Piloto', arm: 0.85, maxWeight: 120 },
      { name: 'Copiloto', arm: 0.85, maxWeight: 120 },
      { name: 'Asiento trasero', arm: 1.50, maxWeight: 180 },
      { name: 'Equipaje', arm: 2.05, maxWeight: 90 },
    ],
    emptyWeightArm: 0.95,
    limits: {
      forward: 0.85,
      aft: 1.18,
    },
  },
];

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return apiResponse(res, 405, false, undefined, 'Method not allowed');
  }
  
  return apiResponse(res, 200, true, {
    profiles: AIRCRAFT_PROFILES,
    count: AIRCRAFT_PROFILES.length,
  });
}

export default withMiddleware(handler);

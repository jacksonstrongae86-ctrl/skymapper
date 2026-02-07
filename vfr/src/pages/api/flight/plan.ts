// Flight Plan API
import { NextApiRequest, NextApiResponse } from 'next';
import { withMiddleware, apiResponse } from '@/src/utils/apiMiddleware';
import fs from 'fs/promises';

interface FlightPlan {
  id: string;
  waypoints: Array<{
    icao?: string;
    name: string;
    lat: number;
    lon: number;
    altitude?: number;
  }>;
  aircraft?: {
    type: string;
    registration: string;
    cruiseSpeed: number;
    fuelConsumption: number;
  };
  fuelSettings?: {
    minimumFuel: number;
    reserveFuel: number;
    alternateFuel: number;
  };
  createdAt: string;
  updatedAt: string;
}

const PLAN_FILE = '/tmp/skymapper-flight-plan.json';

async function loadPlan(): Promise<FlightPlan | null> {
  try {
    const data = await fs.readFile(PLAN_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return null;
  }
}

async function savePlan(plan: FlightPlan): Promise<void> {
  await fs.writeFile(PLAN_FILE, JSON.stringify(plan, null, 2));
}

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    // Get current flight plan
    const plan = await loadPlan();
    
    if (!plan) {
      return apiResponse(res, 404, false, undefined, 'No flight plan found');
    }
    
    return apiResponse(res, 200, true, plan);
  } else if (req.method === 'POST') {
    // Create or update flight plan
    const { waypoints, aircraft, fuelSettings } = req.body;
    
    if (!waypoints || !Array.isArray(waypoints) || waypoints.length === 0) {
      return apiResponse(res, 400, false, undefined, 'Waypoints are required');
    }
    
    const existingPlan = await loadPlan();
    const now = new Date().toISOString();
    
    const plan: FlightPlan = {
      id: existingPlan?.id || `FP-${Date.now()}`,
      waypoints,
      aircraft,
      fuelSettings,
      createdAt: existingPlan?.createdAt || now,
      updatedAt: now,
    };
    
    await savePlan(plan);
    
    return apiResponse(res, 200, true, plan);
  } else {
    return apiResponse(res, 405, false, undefined, 'Method not allowed');
  }
}

export default withMiddleware(handler);

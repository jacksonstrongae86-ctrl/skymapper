// Fuel Calculation API
import { NextApiRequest, NextApiResponse } from 'next';
import { withMiddleware, apiResponse } from '@/src/utils/apiMiddleware';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return apiResponse(res, 405, false, undefined, 'Method not allowed');
  }
  
  const { distance, consumption, flightRules, alternate } = req.body;
  
  if (!distance || !consumption) {
    return apiResponse(res, 400, false, undefined, 'Distance and consumption are required');
  }
  
  const distanceNm = parseFloat(distance);
  const consumptionLph = parseFloat(consumption);
  const cruiseSpeed = 120; // kt default
  
  // Calculate flight time in hours
  const flightTime = distanceNm / cruiseSpeed;
  
  // Trip fuel
  const tripFuel = flightTime * consumptionLph;
  
  // Reserve fuel (VFR: 30 min, IFR: 45 min)
  const reserveMinutes = flightRules === 'IFR' ? 45 : 30;
  const reserveFuel = (reserveMinutes / 60) * consumptionLph;
  
  // Alternate fuel (if specified)
  let alternateFuel = 0;
  if (alternate && flightRules === 'IFR') {
    const alternateDistance = parseFloat(alternate);
    const alternateTime = alternateDistance / cruiseSpeed;
    alternateFuel = alternateTime * consumptionLph;
  }
  
  // Taxi fuel (10 minutes)
  const taxiFuel = (10 / 60) * consumptionLph;
  
  // Total fuel required
  const totalFuel = tripFuel + reserveFuel + alternateFuel + taxiFuel;
  
  // Add 10% safety margin
  const totalWithMargin = totalFuel * 1.1;
  
  return apiResponse(res, 200, true, {
    distance: distanceNm,
    flightTime: Math.round(flightTime * 60), // minutes
    consumption: consumptionLph,
    breakdown: {
      trip: Math.round(tripFuel * 10) / 10,
      reserve: Math.round(reserveFuel * 10) / 10,
      alternate: Math.round(alternateFuel * 10) / 10,
      taxi: Math.round(taxiFuel * 10) / 10,
    },
    totalRequired: Math.round(totalFuel * 10) / 10,
    recommended: Math.round(totalWithMargin * 10) / 10,
    flightRules: flightRules || 'VFR',
  });
}

export default withMiddleware(handler);

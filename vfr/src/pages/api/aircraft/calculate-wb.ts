// Weight & Balance Calculation API
import { NextApiRequest, NextApiResponse } from 'next';
import { withMiddleware, apiResponse } from '@/src/utils/apiMiddleware';

interface Station {
  name: string;
  weight: number;
  arm: number;
}

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return apiResponse(res, 405, false, undefined, 'Method not allowed');
  }
  
  const { emptyWeight, emptyWeightArm, stations, limits } = req.body;
  
  if (!emptyWeight || !emptyWeightArm || !stations || !Array.isArray(stations)) {
    return apiResponse(res, 400, false, undefined, 'Missing required parameters: emptyWeight, emptyWeightArm, stations');
  }
  
  // Calculate total weight and moment
  let totalWeight = emptyWeight;
  let totalMoment = emptyWeight * emptyWeightArm;
  
  const loadedStations = stations.map((station: Station) => {
    const moment = station.weight * station.arm;
    totalWeight += station.weight;
    totalMoment += moment;
    
    return {
      ...station,
      moment,
    };
  });
  
  // Calculate CG
  const cg = totalWeight > 0 ? totalMoment / totalWeight : 0;
  
  // Check if within limits
  const withinLimits = limits
    ? cg >= limits.forward && cg <= limits.aft
    : true;
  
  return apiResponse(res, 200, true, {
    emptyWeight,
    emptyWeightArm,
    emptyMoment: emptyWeight * emptyWeightArm,
    stations: loadedStations,
    totalWeight: Math.round(totalWeight * 10) / 10,
    totalMoment: Math.round(totalMoment * 10) / 10,
    cg: Math.round(cg * 100) / 100,
    withinLimits,
    limits,
  });
}

export default withMiddleware(handler);

// Weight & Balance Calculation API
import { NextApiRequest, NextApiResponse } from 'next';
import { withMiddleware, apiResponse } from '@/src/utils/apiMiddleware';
import { getAircraftProfile } from '@/src/utils/aircraftProfiles';

interface Station {
  name: string;
  weight: number;
  arm: number;
}

interface ProfileBasedRequest {
  profileId: string;
  loads: {
    [key: string]: number; // e.g., { "pilot": 80, "fuel": 50 }
  };
}

interface RawRequest {
  emptyWeight: number;
  emptyWeightArm: number;
  stations: Station[];
  limits?: {
    forward: number;
    aft: number;
  };
}

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return apiResponse(res, 405, false, undefined, 'Method not allowed');
  }
  
  let emptyWeight: number;
  let emptyWeightArm: number;
  let stations: Station[];
  let limits: { forward: number; aft: number } | undefined;

  // Support both profile-based and raw format
  if ('profileId' in req.body) {
    // Profile-based format
    const { profileId, loads } = req.body as ProfileBasedRequest;
    
    if (!profileId || !loads) {
      return apiResponse(res, 400, false, undefined, 'Missing required parameters: profileId, loads');
    }

    const profile = getAircraftProfile(profileId);
    if (!profile) {
      return apiResponse(res, 404, false, undefined, `Aircraft profile not found: ${profileId}`);
    }

    emptyWeight = profile.emptyWeight;
    emptyWeightArm = profile.emptyCG;
    
    // Build stations array from loads
    stations = [];
    
    // Add fuel if specified
    if (loads.fuel !== undefined) {
      const fuelWeight = loads.fuel * profile.fuelDensity; // liters to kg
      stations.push({
        name: 'Combustible',
        weight: fuelWeight,
        arm: profile.fuelArm,
      });
    }

    // Map common load names to profile stations
    const stationMap: { [key: string]: number } = {
      'pilot': 0, // Front seats
      'copilot': 0,
      'passenger': 1, // Rear seats (if exists)
      'baggage': profile.stations.length > 2 ? 2 : profile.stations.length - 1,
    };

    // Add loads to stations
    for (const [loadName, weight] of Object.entries(loads)) {
      if (loadName === 'fuel') continue; // Already handled

      // Try to find matching station
      let stationIndex = stationMap[loadName.toLowerCase()];
      if (stationIndex === undefined) {
        // Try to match by station name
        stationIndex = profile.stations.findIndex(s => 
          s.name.toLowerCase().includes(loadName.toLowerCase())
        );
      }

      if (stationIndex >= 0 && stationIndex < profile.stations.length) {
        const station = profile.stations[stationIndex];
        stations.push({
          name: station.name,
          weight: weight as number,
          arm: station.arm,
        });
      }
    }

    // Determine limits from CG envelope
    if (profile.cgEnvelope && profile.cgEnvelope.length > 0) {
      const envelope = profile.cgEnvelope;
      const minForward = Math.min(...envelope.map(e => e.fwdCG));
      const maxAft = Math.max(...envelope.map(e => e.aftCG));
      limits = { forward: minForward, aft: maxAft };
    }
  } else {
    // Raw format
    const rawReq = req.body as RawRequest;
    emptyWeight = rawReq.emptyWeight;
    emptyWeightArm = rawReq.emptyWeightArm;
    stations = rawReq.stations;
    limits = rawReq.limits;
    
    if (!emptyWeight || !emptyWeightArm || !stations || !Array.isArray(stations)) {
      return apiResponse(res, 400, false, undefined, 'Missing required parameters: emptyWeight, emptyWeightArm, stations');
    }
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

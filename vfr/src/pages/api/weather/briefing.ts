// Weather Briefing API
import { NextApiRequest, NextApiResponse } from 'next';
import { withMiddleware, apiResponse } from '@/src/utils/apiMiddleware';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return apiResponse(res, 405, false, undefined, 'Method not allowed');
  }
  
  const { departure, destination } = req.query;
  
  if (!departure || !destination || typeof departure !== 'string' || typeof destination !== 'string') {
    return apiResponse(res, 400, false, undefined, 'Both departure and destination ICAOs are required');
  }
  
  try {
    const icaos = `${departure.toUpperCase()},${destination.toUpperCase()}`;
    
    // Fetch METARs for both airports
    const metarUrl = `https://aviationweather.gov/api/data/metar?ids=${icaos}&format=json`;
    const metarResponse = await fetch(metarUrl);
    const metars = metarResponse.ok ? await metarResponse.json() as { icaoId?: string }[] : [];
    
    // Fetch TAFs for both airports
    const tafUrl = `https://aviationweather.gov/api/data/taf?ids=${icaos}&format=json`;
    const tafResponse = await fetch(tafUrl);
    const tafs = tafResponse.ok ? await tafResponse.json() as { icaoId?: string }[] : [];
    
    return apiResponse(res, 200, true, {
      departure: {
        icao: departure.toUpperCase(),
        metar: metars.find((m) => m.icaoId === departure.toUpperCase()),
        taf: tafs.find((t) => t.icaoId === departure.toUpperCase()),
      },
      destination: {
        icao: destination.toUpperCase(),
        metar: metars.find((m) => m.icaoId === destination.toUpperCase()),
        taf: tafs.find((t) => t.icaoId === destination.toUpperCase()),
      },
      retrievedAt: new Date().toISOString(),
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch weather briefing';
    return apiResponse(res, 503, false, undefined, errorMessage);
  }
}

export default withMiddleware(handler);

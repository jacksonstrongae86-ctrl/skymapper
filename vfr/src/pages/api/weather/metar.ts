// METAR API
import { NextApiRequest, NextApiResponse } from 'next';
import { withMiddleware, apiResponse } from '@/src/utils/apiMiddleware';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return apiResponse(res, 405, false, undefined, 'Method not allowed');
  }
  
  const { icao } = req.query;
  
  if (!icao || typeof icao !== 'string') {
    return apiResponse(res, 400, false, undefined, 'ICAO code is required');
  }
  
  try {
    const url = `https://aviationweather.gov/api/data/metar?ids=${icao.toUpperCase()}&format=json`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Weather service returned ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data || data.length === 0) {
      return apiResponse(res, 404, false, undefined, `No METAR found for ${icao.toUpperCase()}`);
    }
    
    return apiResponse(res, 200, true, {
      icao: icao.toUpperCase(),
      metar: data[0],
      retrievedAt: new Date().toISOString(),
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch METAR';
    return apiResponse(res, 503, false, undefined, errorMessage);
  }
}

export default withMiddleware(handler);

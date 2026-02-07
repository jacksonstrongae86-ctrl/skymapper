// Route NOTAMs API
import { NextApiRequest, NextApiResponse } from 'next';
import { withMiddleware, apiResponse } from '@/src/utils/apiMiddleware';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return apiResponse(res, 405, false, undefined, 'Method not allowed');
  }
  
  const { waypoints } = req.query;
  
  if (!waypoints || typeof waypoints !== 'string') {
    return apiResponse(res, 400, false, undefined, 'Waypoints parameter is required (comma-separated ICAOs)');
  }
  
  const icaos = waypoints.split(',').map(w => w.trim().toUpperCase());
  
  if (icaos.length === 0) {
    return apiResponse(res, 400, false, undefined, 'At least one waypoint required');
  }
  
  try {
    const results = await Promise.all(
      icaos.map(async (icao) => {
        try {
          const url = `https://www.notams.faa.gov/dinsQueryWeb/queryRetrievalMapAction.do?reportType=RAW&formatType=ICAO&retrieveLocId=${icao}&actionType=notamRetrievalByICAOs`;
          const response = await fetch(url);
          
          if (!response.ok) {
            return { icao, notams: ['Service unavailable'], error: true };
          }
          
          const text = await response.text();
          const notams = text.split('\n')
            .filter(line => line.trim().length > 0 && !line.startsWith('!'))
            .map(line => line.trim());
          
          return {
            icao,
            notams: notams.length > 0 ? notams : ['No NOTAMs'],
            error: false,
          };
        } catch {
          return { icao, notams: ['Service unavailable'], error: true };
        }
      })
    );
    
    return apiResponse(res, 200, true, {
      waypoints: results,
      retrievedAt: new Date().toISOString(),
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch route NOTAMs';
    return apiResponse(res, 503, false, undefined, errorMessage);
  }
}

export default withMiddleware(handler);

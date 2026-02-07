// NOTAMs API
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
    // Using FAA NOTAM API (public)
    const url = `https://www.notams.faa.gov/dinsQueryWeb/queryRetrievalMapAction.do?reportType=RAW&formatType=ICAO&retrieveLocId=${icao.toUpperCase()}&actionType=notamRetrievalByICAOs`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`NOTAM service returned ${response.status}`);
    }
    
    const text = await response.text();
    
    // Parse NOTAMs from text (simple parser)
    const notams = text.split('\n')
      .filter(line => line.trim().length > 0 && !line.startsWith('!'))
      .map(line => line.trim());
    
    return apiResponse(res, 200, true, {
      icao: icao.toUpperCase(),
      notams: notams.length > 0 ? notams : ['No NOTAMs found'],
      count: notams.length,
      retrievedAt: new Date().toISOString(),
    });
  } catch {
    // NOTAMs service often fails, return gracefully
    return apiResponse(res, 200, true, {
      icao: icao.toUpperCase(),
      notams: ['NOTAM service temporarily unavailable'],
      count: 0,
      retrievedAt: new Date().toISOString(),
    });
  }
}

export default withMiddleware(handler);

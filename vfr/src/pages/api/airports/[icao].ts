// Airport Details API
import { NextApiRequest, NextApiResponse } from 'next';
import { withMiddleware, apiResponse } from '@/src/utils/apiMiddleware';
import fs from 'fs/promises';
import path from 'path';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return apiResponse(res, 405, false, undefined, 'Method not allowed');
  }
  
  const { icao } = req.query;
  
  if (!icao || typeof icao !== 'string') {
    return apiResponse(res, 400, false, undefined, 'ICAO code is required');
  }
  
  try {
    // Search in cached airport data
    const cachePath = process.env.NODE_ENV === 'production'
      ? '/tmp/aviation-cache'
      : path.join(process.cwd(), 'public', 'data', 'cache', 'openaip');
    
    // Try common European countries
    const countries = ['es', 'fr', 'de', 'it', 'pt', 'gb'];
    
    for (const country of countries) {
      const filename = `${country}_apt.json`;
      const filepath = path.join(cachePath, filename);
      
      try {
        const fileContent = await fs.readFile(filepath, 'utf-8');
        const cachedData = JSON.parse(fileContent) as { data?: { features?: unknown[] } };
        
        const airport = cachedData.data?.features?.find((f: unknown) => {
          const feature = f as { properties?: { icaoCode?: string } };
          return feature.properties?.icaoCode?.toUpperCase() === icao.toUpperCase();
        }) as { 
          properties?: { 
            icaoCode?: string; 
            name?: string; 
            type?: string; 
            elevation?: unknown; 
            runways?: unknown[]; 
            frequencies?: unknown[]; 
            country?: string;
          };
          geometry?: { coordinates?: [number, number] };
        } | undefined;
        
        if (airport) {
          return apiResponse(res, 200, true, {
            icao: airport.properties?.icaoCode,
            name: airport.properties?.name,
            type: airport.properties?.type,
            elevation: airport.properties?.elevation,
            coordinates: {
              lat: airport.geometry?.coordinates?.[1],
              lon: airport.geometry?.coordinates?.[0],
            },
            runways: airport.properties?.runways || [],
            frequencies: airport.properties?.frequencies || [],
            country: airport.properties?.country,
          });
        }
      } catch {
        continue;
      }
    }
    
    return apiResponse(res, 404, false, undefined, `Airport ${icao.toUpperCase()} not found`);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch airport details';
    return apiResponse(res, 500, false, undefined, errorMessage);
  }
}

export default withMiddleware(handler);

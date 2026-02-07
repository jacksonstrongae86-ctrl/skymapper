// Airports List API
import { NextApiRequest, NextApiResponse } from 'next';
import { withMiddleware, apiResponse } from '@/src/utils/apiMiddleware';
import fs from 'fs/promises';
import path from 'path';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return apiResponse(res, 405, false, undefined, 'Method not allowed');
  }
  
  const { country, type, search, limit } = req.query;
  
  try {
    // Use cached OpenAIP data
    const cachePath = process.env.NODE_ENV === 'production'
      ? '/tmp/aviation-cache'
      : path.join(process.cwd(), 'public', 'data', 'cache', 'openaip');
    
    const countryCode = (country as string) || 'es';
    const filename = `${countryCode}_apt.json`;
    const filepath = path.join(cachePath, filename);
    
    let fileExists = true;
    try {
      await fs.access(filepath);
    } catch {
      fileExists = false;
    }
    
    if (!fileExists) {
      return apiResponse(res, 404, false, undefined, `No airport data found for country: ${countryCode}`);
    }
    
    const fileContent = await fs.readFile(filepath, 'utf-8');
    const cachedData = JSON.parse(fileContent) as { data?: { features?: unknown[] } };
    
    let airports = cachedData.data?.features || [];
    
    // Filter by type if provided
    if (type) {
      airports = airports.filter((f: unknown) => {
        const feature = f as { properties?: { type?: string } };
        return feature.properties?.type?.toLowerCase().includes((type as string).toLowerCase());
      });
    }
    
    // Filter by search term
    if (search && typeof search === 'string') {
      const searchLower = search.toLowerCase();
      airports = airports.filter((f: unknown) => {
        const feature = f as { properties?: { name?: string; icaoCode?: string } };
        return feature.properties?.name?.toLowerCase().includes(searchLower) ||
          feature.properties?.icaoCode?.toLowerCase().includes(searchLower);
      });
    }
    
    // Limit results
    const maxResults = limit ? parseInt(limit as string) : 100;
    airports = airports.slice(0, maxResults);
    
    const results = airports.map((f: unknown) => {
      const feature = f as { 
        properties?: { icaoCode?: string; name?: string; type?: string; elevation?: { value?: number } };
        geometry?: { coordinates?: [number, number] };
      };
      return {
        icao: feature.properties?.icaoCode,
        name: feature.properties?.name,
        type: feature.properties?.type,
        elevation: feature.properties?.elevation?.value,
        lat: feature.geometry?.coordinates?.[1],
        lon: feature.geometry?.coordinates?.[0],
      };
    });
    
    return apiResponse(res, 200, true, {
      airports: results,
      count: results.length,
      country: countryCode,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch airports';
    return apiResponse(res, 500, false, undefined, errorMessage);
  }
}

export default withMiddleware(handler);

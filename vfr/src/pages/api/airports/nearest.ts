// Nearest Airports API
import { NextApiRequest, NextApiResponse } from 'next';
import { withMiddleware, apiResponse } from '@/src/utils/apiMiddleware';
import fs from 'fs/promises';
import path from 'path';

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3440.065; // Earth's radius in nautical miles
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return apiResponse(res, 405, false, undefined, 'Method not allowed');
  }
  
  const { lat, lon, limit } = req.query;
  
  if (!lat || !lon) {
    return apiResponse(res, 400, false, undefined, 'Latitude and longitude are required');
  }
  
  const userLat = parseFloat(lat as string);
  const userLon = parseFloat(lon as string);
  const maxResults = limit ? parseInt(limit as string) : 10;
  
  if (isNaN(userLat) || isNaN(userLon)) {
    return apiResponse(res, 400, false, undefined, 'Invalid coordinates');
  }
  
  try {
    const cachePath = process.env.NODE_ENV === 'production'
      ? '/tmp/aviation-cache'
      : path.join(process.cwd(), 'public', 'data', 'cache', 'openaip');
    
    // Try common European countries
    const countries = ['es', 'fr', 'de', 'it', 'pt', 'gb'];
    const allAirports: Array<{
      icao?: string;
      name?: string;
      type?: string;
      elevation?: number;
      lat: number;
      lon: number;
      distance: number;
    }> = [];
    
    for (const country of countries) {
      const filename = `${country}_apt.json`;
      const filepath = path.join(cachePath, filename);
      
      try {
        const fileContent = await fs.readFile(filepath, 'utf-8');
        const cachedData = JSON.parse(fileContent) as { data?: { features?: unknown[] } };
        const airports = cachedData.data?.features || [];
        
        airports.forEach((airport: unknown) => {
          const apt = airport as {
            properties?: { icaoCode?: string; name?: string; type?: string; elevation?: { value?: number } };
            geometry?: { coordinates?: [number, number] };
          };
          const aptLat = apt.geometry?.coordinates?.[1];
          const aptLon = apt.geometry?.coordinates?.[0];
          
          if (aptLat && aptLon) {
            const distance = calculateDistance(userLat, userLon, aptLat, aptLon);
            
            allAirports.push({
              icao: apt.properties?.icaoCode,
              name: apt.properties?.name,
              type: apt.properties?.type,
              elevation: apt.properties?.elevation?.value,
              lat: aptLat,
              lon: aptLon,
              distance: Math.round(distance * 10) / 10,
            });
          }
        });
      } catch {
        continue;
      }
    }
    
    // Sort by distance and limit
    allAirports.sort((a, b) => a.distance - b.distance);
    const nearest = allAirports.slice(0, maxResults);
    
    return apiResponse(res, 200, true, {
      airports: nearest,
      count: nearest.length,
      reference: { lat: userLat, lon: userLon },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to find nearest airports';
    return apiResponse(res, 500, false, undefined, errorMessage);
  }
}

export default withMiddleware(handler);

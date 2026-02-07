// Logbook Totals API
import { NextApiRequest, NextApiResponse } from 'next';
import { withMiddleware, apiResponse } from '@/src/utils/apiMiddleware';
import fs from 'fs/promises';

interface LogbookEntry {
  id: string;
  date: string;
  flightTime: number;
  pic: boolean;
  dual: boolean;
  solo: boolean;
  night: boolean;
  ifr: boolean;
  landings: { day: number; night: number };
}

const LOGBOOK_FILE = '/tmp/skymapper-logbook.json';

async function loadLogbook(): Promise<LogbookEntry[]> {
  try {
    const data = await fs.readFile(LOGBOOK_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return apiResponse(res, 405, false, undefined, 'Method not allowed');
  }
  
  const entries = await loadLogbook();
  
  const totals = {
    totalTime: 0,
    picTime: 0,
    dualTime: 0,
    soloTime: 0,
    nightTime: 0,
    ifrTime: 0,
    dayLandings: 0,
    nightLandings: 0,
    totalFlights: entries.length,
  };
  
  entries.forEach(entry => {
    totals.totalTime += entry.flightTime;
    if (entry.pic) totals.picTime += entry.flightTime;
    if (entry.dual) totals.dualTime += entry.flightTime;
    if (entry.solo) totals.soloTime += entry.flightTime;
    if (entry.night) totals.nightTime += entry.flightTime;
    if (entry.ifr) totals.ifrTime += entry.flightTime;
    totals.dayLandings += entry.landings?.day || 0;
    totals.nightLandings += entry.landings?.night || 0;
  });
  
  // Round to 1 decimal
  Object.keys(totals).forEach(key => {
    if (typeof totals[key as keyof typeof totals] === 'number') {
      totals[key as keyof typeof totals] = Math.round(totals[key as keyof typeof totals] * 10) / 10;
    }
  });
  
  return apiResponse(res, 200, true, totals);
}

export default withMiddleware(handler);

// Logbook API
import { NextApiRequest, NextApiResponse } from 'next';
import { withMiddleware, apiResponse } from '@/src/utils/apiMiddleware';
import fs from 'fs/promises';

interface LogbookEntry {
  id: string;
  date: string;
  departure: string;
  destination: string;
  aircraft: string;
  registration: string;
  flightTime: number; // hours
  pic: boolean;
  dual: boolean;
  solo: boolean;
  night: boolean;
  ifr: boolean;
  landings: {
    day: number;
    night: number;
  };
  remarks?: string;
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

async function saveLogbook(entries: LogbookEntry[]): Promise<void> {
  await fs.writeFile(LOGBOOK_FILE, JSON.stringify(entries, null, 2));
}

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    // Get all logbook entries
    const entries = await loadLogbook();
    
    return apiResponse(res, 200, true, {
      entries,
      count: entries.length,
    });
  } else if (req.method === 'POST') {
    // Add new entry
    const entry: LogbookEntry = {
      id: `LOG-${Date.now()}`,
      ...req.body,
    };
    
    if (!entry.date || !entry.departure || !entry.destination || !entry.flightTime) {
      return apiResponse(res, 400, false, undefined, 'Missing required fields: date, departure, destination, flightTime');
    }
    
    const entries = await loadLogbook();
    entries.push(entry);
    await saveLogbook(entries);
    
    return apiResponse(res, 201, true, entry);
  } else {
    return apiResponse(res, 405, false, undefined, 'Method not allowed');
  }
}

export default withMiddleware(handler);

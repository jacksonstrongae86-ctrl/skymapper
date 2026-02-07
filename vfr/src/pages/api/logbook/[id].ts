// Logbook Entry Management API
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
  flightTime: number;
  pic: boolean;
  dual: boolean;
  solo: boolean;
  night: boolean;
  ifr: boolean;
  landings: { day: number; night: number };
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
  const { id } = req.query;
  
  if (!id || typeof id !== 'string') {
    return apiResponse(res, 400, false, undefined, 'Entry ID is required');
  }
  
  const entries = await loadLogbook();
  const index = entries.findIndex(e => e.id === id);
  
  if (index === -1) {
    return apiResponse(res, 404, false, undefined, `Entry ${id} not found`);
  }
  
  if (req.method === 'PUT') {
    // Update entry
    const updatedEntry = {
      ...entries[index],
      ...req.body,
      id, // Preserve ID
    };
    
    entries[index] = updatedEntry;
    await saveLogbook(entries);
    
    return apiResponse(res, 200, true, updatedEntry);
  } else if (req.method === 'DELETE') {
    // Delete entry
    entries.splice(index, 1);
    await saveLogbook(entries);
    
    return apiResponse(res, 200, true, { deleted: true, id });
  } else {
    return apiResponse(res, 405, false, undefined, 'Method not allowed');
  }
}

export default withMiddleware(handler);

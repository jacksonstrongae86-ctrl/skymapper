// Currency Status API
import { NextApiRequest, NextApiResponse } from 'next';
import { withMiddleware, apiResponse } from '@/src/utils/apiMiddleware';
import fs from 'fs/promises';

interface LogbookEntry {
  id: string;
  date: string;
  flightTime: number;
  night: boolean;
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
  const now = new Date();
  
  // Get entries in last 90 days
  const last90Days = entries.filter(e => {
    const entryDate = new Date(e.date);
    const daysDiff = (now.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24);
    return daysDiff <= 90;
  });
  
  // Calculate landings in last 90 days
  let dayLandings = 0;
  let nightLandings = 0;
  
  last90Days.forEach(entry => {
    dayLandings += entry.landings?.day || 0;
    nightLandings += entry.landings?.night || 0;
  });
  
  // Currency status
  const dayCurrent = dayLandings >= 3;
  const nightCurrent = nightLandings >= 3;
  
  return apiResponse(res, 200, true, {
    day: {
      current: dayCurrent,
      landings: dayLandings,
      required: 3,
      expiresIn: dayCurrent ? '90 days from last landing' : 'Expired',
    },
    night: {
      current: nightCurrent,
      landings: nightLandings,
      required: 3,
      expiresIn: nightCurrent ? '90 days from last landing' : 'Expired',
    },
    period: '90 days',
    checkedAt: now.toISOString(),
  });
}

export default withMiddleware(handler);

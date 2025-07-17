// pages/api/sync/manual.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { triggerManualSync, startDailySync } from '../../../services/dailySync';

let syncInitialized = false;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Ensure sync service is initialized
    if (!syncInitialized) {
      await startDailySync();
      syncInitialized = true;
    }

    await triggerManualSync();
    res.status(200).json({
      success: true,
      message: 'Manual sync completed',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Manual sync failed:', error);
    res.status(500).json({
      error: 'Manual sync failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

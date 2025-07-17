// pages/api/sync/initialize.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { startDailySync } from '../../../services/dailySync';

let syncInitialized = false;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (syncInitialized) {
    return res.status(200).json({
      success: true,
      message: 'Sync service already initialized'
    });
  }

  try {
    await startDailySync();
    syncInitialized = true;

    res.status(200).json({
      success: true,
      message: 'Sync service initialized successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Failed to initialize sync service:', error);
    res.status(500).json({
      error: 'Failed to initialize sync service',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

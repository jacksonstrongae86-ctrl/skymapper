/**
 * API endpoint to get current sync status
 * GET /api/sync/status
 */
import type { NextApiRequest, NextApiResponse } from 'next';
import { readSyncHistory } from '@/src/services/syncStatus';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const history = await readSyncHistory();
    
    res.status(200).json({
      success: true,
      ...history,
    });
  } catch (error) {
    console.error('Failed to read sync status:', error);
    res.status(500).json({ 
      error: 'Failed to read sync status',
      success: false,
    });
  }
}

// services/dailySync.tsx - Update to use your service
import { OpenAIPSyncService } from './openAIPSync';
import { createSyncConfig } from './syncConfig';
import cron from 'node-cron';

export const startDailySync = () => {
  // Schedule sync at 2 AM daily
  cron.schedule('0 2 * * *', async () => {
    console.log('Starting scheduled aviation data sync...');

    try {
      const config = createSyncConfig();
      const syncService = new OpenAIPSyncService(config);
      await syncService.syncAllData();
      console.log('Scheduled sync completed successfully');
    } catch (error) {
      console.error('Scheduled sync failed:', error);
    }
  });

  // Run initial sync on startup
  console.log('Running initial aviation data sync...');
  const config = createSyncConfig();
  const syncService = new OpenAIPSyncService(config);
  syncService.syncAllData().catch(console.error);
};

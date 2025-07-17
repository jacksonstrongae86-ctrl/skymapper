// services/dailySync.tsx
import { OpenAIPSyncService } from './openAIPSync';
import { createSyncConfig } from './syncConfig';
import cron from 'node-cron';

let syncService: OpenAIPSyncService | null = null;

export const startDailySync = async () => {
  if (syncService) {
    console.log('Sync service already initialized');
    return;
  }

  console.log('Initializing aviation data sync service...');

  const config = createSyncConfig();
  syncService = new OpenAIPSyncService(config);

  // Check for missing files and download immediately
  try {
    await syncService.checkAndDownloadMissingFiles();
  } catch (error) {
    console.error('Failed to check/download missing files:', error);
  }

  // Schedule daily sync at 14:10 Spanish time
  cron.schedule('10 14 * * *', async () => {
    console.log('Starting scheduled aviation data sync at 14:10 Spanish time...');

    try {
      if (syncService) {
        await syncService.syncAllData();
        console.log('Scheduled sync completed successfully');
      }
    } catch (error) {
      console.error('Scheduled sync failed:', error);
    }
  }, {
    timezone: 'Europe/Madrid'
  });

  console.log('Aviation data sync service started successfully');
};

export const triggerManualSync = async () => {
  if (!syncService) {
    throw new Error('Sync service not initialized');
  }

  console.log('Manual sync triggered...');
  await syncService.syncAllData();
  console.log('Manual sync completed');
};

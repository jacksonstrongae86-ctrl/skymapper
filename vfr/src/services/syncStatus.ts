/**
 * Sync Status Tracking Service
 * Tracks OpenAIP data synchronization status and history
 */
import fs from 'fs/promises';
import path from 'path';

export interface SyncStatus {
  lastSync: string | null;
  lastSyncSuccess: boolean;
  filesDownloaded: number;
  filesFailed: number;
  errors: string[];
  startTime?: string;
  endTime?: string;
  duration?: number; // milliseconds
}

export interface SyncHistory {
  currentStatus: SyncStatus;
  history: SyncStatus[];
}

const STATUS_FILE = path.join(process.cwd(), 'public', 'cache', 'sync-status.json');
const MAX_HISTORY = 10; // Keep last 10 sync attempts

/**
 * Initialize a new sync operation
 */
export async function initSyncStatus(): Promise<void> {
  const status: SyncStatus = {
    lastSync: new Date().toISOString(),
    lastSyncSuccess: false,
    filesDownloaded: 0,
    filesFailed: 0,
    errors: [],
    startTime: new Date().toISOString(),
  };

  await writeSyncStatus(status);
}

/**
 * Update sync status after completion
 */
export async function completeSyncStatus(
  success: boolean,
  filesDownloaded: number,
  filesFailed: number,
  errors: string[]
): Promise<void> {
  const currentStatus = await readSyncStatus();
  const endTime = new Date();
  const startTime = currentStatus.startTime ? new Date(currentStatus.startTime) : endTime;
  const duration = endTime.getTime() - startTime.getTime();

  const status: SyncStatus = {
    lastSync: endTime.toISOString(),
    lastSyncSuccess: success,
    filesDownloaded,
    filesFailed,
    errors,
    startTime: currentStatus.startTime,
    endTime: endTime.toISOString(),
    duration,
  };

  await writeSyncStatus(status);
  console.log(`Sync completed: ${success ? 'SUCCESS' : 'FAILED'} (${filesDownloaded} downloaded, ${filesFailed} failed) in ${(duration / 1000).toFixed(2)}s`);
}

/**
 * Read current sync status
 */
export async function readSyncStatus(): Promise<SyncStatus> {
  try {
    const data = await fs.readFile(STATUS_FILE, 'utf-8');
    const history: SyncHistory = JSON.parse(data);
    return history.currentStatus;
  } catch { // ignore
    // Return default status if file doesn't exist
    return {
      lastSync: null,
      lastSyncSuccess: false,
      filesDownloaded: 0,
      filesFailed: 0,
      errors: [],
    };
  }
}

/**
 * Get full sync history
 */
export async function readSyncHistory(): Promise<SyncHistory> {
  try {
    const data = await fs.readFile(STATUS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch { // ignore
    return {
      currentStatus: {
        lastSync: null,
        lastSyncSuccess: false,
        filesDownloaded: 0,
        filesFailed: 0,
        errors: [],
      },
      history: [],
    };
  }
}

/**
 * Write sync status and update history
 */
async function writeSyncStatus(status: SyncStatus): Promise<void> {
  try {
    // Ensure directory exists
    const dir = path.dirname(STATUS_FILE);
    await fs.mkdir(dir, { recursive: true });

    // Read existing history
    const history = await readSyncHistory();

    // Add current status to history if it's complete (has endTime)
    if (status.endTime && history.currentStatus.lastSync) {
      history.history.unshift(history.currentStatus);
      // Keep only last MAX_HISTORY entries
      history.history = history.history.slice(0, MAX_HISTORY);
    }

    // Update current status
    history.currentStatus = status;

    // Write to file
    await fs.writeFile(STATUS_FILE, JSON.stringify(history, null, 2));
  } catch (e) {
    console.error('Failed to write sync status:', e);
  }
}

/**
 * Check if data is stale (older than 48 hours)
 */
export function isDataStale(lastUpdated: string | null): boolean {
  if (!lastUpdated) return true;
  
  const now = new Date().getTime();
  const updated = new Date(lastUpdated).getTime();
  const hoursSinceUpdate = (now - updated) / (1000 * 60 * 60);
  
  return hoursSinceUpdate > 48;
}

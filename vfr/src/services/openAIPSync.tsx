// services/openAIPSync.ts
import fs from 'fs/promises';
import path from 'path';
import { initSyncStatus, completeSyncStatus } from './syncStatus';

export interface OpenAIPConfig {
  countries: string[];
  dataTypes: ('apt' | 'asp' | 'hot' | 'nav' | 'obs' | 'rpp')[];
  cachePath: string;
}

interface GeoJSONFeatureCollection {
  type: string;
  features: unknown[];
}

/**
 * Validates that the data is a valid GeoJSON FeatureCollection
 */
function isValidGeoJSON(data: unknown): data is GeoJSONFeatureCollection {
  if (!data || typeof data !== 'object') return false;
  const obj = data as Record<string, unknown>;
  return (
    obj.type === 'FeatureCollection' &&
    Array.isArray(obj.features)
  );
}

export class OpenAIPSyncService {
  private config: OpenAIPConfig;

  constructor(config: OpenAIPConfig) {
    this.config = config;
  }

  async syncAllData(): Promise<void> {
    console.log('Starting OpenAIP data synchronization...');
    console.log(`Countries: ${this.config.countries.join(', ')}`);
    console.log(`Data types: ${this.config.dataTypes.join(', ')}`);

    // Initialize sync status
    await initSyncStatus();

    let filesDownloaded = 0;
    let filesFailed = 0;
    const errors: string[] = [];

    for (const country of this.config.countries) {
      for (const dataType of this.config.dataTypes) {
        try {
          await this.syncDataType(country, dataType);
          filesDownloaded++;
          await this.delay(1000);
        } catch (error) {
          const errorMsg = `Failed to sync ${country}_${dataType}: ${error}`;
          console.error(errorMsg);
          errors.push(errorMsg);
          filesFailed++;
        }
      }
    }

    // Complete sync status
    const success = filesFailed === 0;
    await completeSyncStatus(success, filesDownloaded, filesFailed, errors);

    console.log('OpenAIP data synchronization completed');
  }

  async checkAndDownloadMissingFiles(): Promise<void> {
    console.log('Checking for missing aviation data files...');

    const missingFiles: { country: string; dataType: string }[] = [];

    // Ensure cache directory exists
    await fs.mkdir(this.config.cachePath, { recursive: true });
    console.log(`Cache directory: ${this.config.cachePath}`);

    for (const country of this.config.countries) {
      for (const dataType of this.config.dataTypes) {
        const filename = `${country}_${dataType}.json`;
        const filepath = path.join(this.config.cachePath, filename);

        try {
          await fs.access(filepath);
          console.log(`✓ Found ${filename}`);
        } catch {
          console.log(`✗ Missing ${filename}`);
          missingFiles.push({ country, dataType });
        }
      }
    }

    if (missingFiles.length > 0) {
      console.log(`Found ${missingFiles.length} missing files. Downloading immediately...`);

      for (const { country, dataType } of missingFiles) {
        try {
          await this.syncDataType(country, dataType);
          await this.delay(1000);
        } catch (error) {
          console.error(`Failed to download missing ${country}_${dataType}:`, error);
        }
      }
    } else {
      console.log('All aviation data files are present');
    }
  }

  private async syncDataType(country: string, dataType: string): Promise<void> {
    const url = `https://storage.googleapis.com/29f98e10-a489-4c82-ae5e-489dbcd4912f/${country}_${dataType}.geojson`;

    console.log(`Fetching ${country}_${dataType} from ${url}...`);

    const response = await fetch(url);

    if (!response.ok) {
      if (response.status === 404) {
        console.warn(`File not found: ${country}_${dataType}.geojson - may not be available for this country`);
        return;
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    // Get content length for logging
    const contentLength = response.headers.get('content-length');
    const sizeKB = contentLength ? (parseInt(contentLength) / 1024).toFixed(2) : 'unknown';
    console.log(`Download size: ${sizeKB} KB`);

    const data = await response.json();

    // Validate GeoJSON structure
    if (!isValidGeoJSON(data)) {
      console.error(`Invalid GeoJSON data for ${country}_${dataType}: missing type or features array`);
      throw new Error(`Invalid GeoJSON structure for ${country}_${dataType}`);
    }

    const featureCount = data.features.length;
    console.log(`Validated GeoJSON: ${featureCount} features`);

    // Ensure cache directory exists
    await fs.mkdir(this.config.cachePath, { recursive: true });

    const cachedData = {
      data,
      lastUpdated: new Date().toISOString(),
      country,
      dataType,
      version: (data as unknown as Record<string, unknown>).version as string || '1.0',
      featureCount,
    };

    const filename = `${country}_${dataType}.json`;
    const filepath = path.join(this.config.cachePath, filename);

    // Write to a temporary file first, then rename (atomic operation)
    const tempFilepath = `${filepath}.tmp`;
    await fs.writeFile(tempFilepath, JSON.stringify(cachedData, null, 2));
    await fs.rename(tempFilepath, filepath);
    
    console.log(`✓ Downloaded and cached ${filename} (${featureCount} features, ${sizeKB} KB)`);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

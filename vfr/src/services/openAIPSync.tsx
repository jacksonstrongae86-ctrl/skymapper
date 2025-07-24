// services/openAIPSync.ts
import fs from 'fs/promises';
import path from 'path';

export interface OpenAIPConfig {
  countries: string[];
  dataTypes: ('apt' | 'asp' | 'hot' | 'nav' | 'obs')[];
  cachePath: string;
}

export class OpenAIPSyncService {
  private config: OpenAIPConfig;

  constructor(config: OpenAIPConfig) {
    this.config = config;
  }

  async syncAllData(): Promise<void> {
    // console.log('Starting OpenAIP data synchronization...');

    for (const country of this.config.countries) {
      for (const dataType of this.config.dataTypes) {
        try {
          await this.syncDataType(country, dataType);
          await this.delay(1000);
        } catch (error) {
          console.error(`Failed to sync ${country}_${dataType}:`, error);
        }
      }
    }

    // console.log('OpenAIP data synchronization completed');
  }

  async checkAndDownloadMissingFiles(): Promise<void> {
    // console.log('Checking for missing aviation data files...');

    const missingFiles: { country: string; dataType: string }[] = [];

    // Ensure cache directory exists
    await fs.mkdir(this.config.cachePath, { recursive: true });

    for (const country of this.config.countries) {
      for (const dataType of this.config.dataTypes) {
        const filename = `${country}_${dataType}.json`;
        const filepath = path.join(this.config.cachePath, filename);

        try {
          await fs.access(filepath);
          // console.log(`✓ Found ${filename}`);
        } catch {
          // console.log(`✗ Missing ${filename}`);
          missingFiles.push({ country, dataType });
        }
      }
    }

    if (missingFiles.length > 0) {
      // console.log(`Found ${missingFiles.length} missing files. Downloading immediately...`);

      for (const { country, dataType } of missingFiles) {
        try {
          await this.syncDataType(country, dataType);
          await this.delay(1000);
        } catch (error) {
          console.error(`Failed to download missing ${country}_${dataType}:`, error);
        }
      }
    } else {
      // console.log('All aviation data files are present');
    }
  }

  private async syncDataType(country: string, dataType: string): Promise<void> {
    const url = `https://storage.googleapis.com/29f98e10-a489-4c82-ae5e-489dbcd4912f/${country}_${dataType}.geojson`;

    console.log(`Fetching ${country}_${dataType}...`);

    const response = await fetch(url);

    if (!response.ok) {
      if (response.status === 404) {
        console.warn(`File not found: ${country}_${dataType}.geojson - may not be available for this country`);
        return;
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    // Ensure cache directory exists
    await fs.mkdir(this.config.cachePath, { recursive: true });

    const cachedData = {
      data,
      lastUpdated: new Date().toISOString(),
      country,
      dataType,
      version: data.version || '1.0'
    };

    const filename = `${country}_${dataType}.json`;
    const filepath = path.join(this.config.cachePath, filename);

    await fs.writeFile(filepath, JSON.stringify(cachedData, null, 2));
    // console.log(`✓ Downloaded and cached ${filename}`);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

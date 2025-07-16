// services/openAIPSync.ts
import fs from 'fs/promises';
import path from 'path';

export interface OpenAIPConfig {
  countries: string[];
  dataTypes: ('apt' | 'asp' | 'hot' | 'nav' | 'obs')[];
  apiKey: string;
  cachePath: string;
}

export class OpenAIPSyncService {
  private config: OpenAIPConfig;

  constructor(config: OpenAIPConfig) {
    this.config = config;
  }

  async syncAllData(): Promise<void> {
    console.log('Starting OpenAIP data synchronization...');

    for (const country of this.config.countries) {
      for (const dataType of this.config.dataTypes) {
        try {
          await this.syncDataType(country, dataType);
          // Add delay to respect rate limits
          await this.delay(1000);
        } catch (error) {
          console.error(`Failed to sync ${country}_${dataType}:`, error);
        }
      }
    }

    console.log('OpenAIP data synchronization completed');
  }

  private async syncDataType(country: string, dataType: string): Promise<void> {
    const url = `https://storage.googleapis.com/29f98e10-a489-4c82-ae5e-489dbcd4912f/${country}_${dataType}.geojson`;
    const response = await fetch(url, {
      headers: {
        'X-OPENAIP-CLIENT-ID': this.config.apiKey
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    // Add metadata
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
    console.log(`Cached ${filename}`);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

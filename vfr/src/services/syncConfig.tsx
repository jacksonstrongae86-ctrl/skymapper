// services/syncConfig.ts
import { OpenAIPConfig } from './openAIPSync';
import path from 'path';

export const createSyncConfig = (): OpenAIPConfig => {
  return {
    countries: ['es', 'us', 'gb', 'mx', 'it', 'fr', 'de', 'ca', 'nl', 'be', 'ch', 'at', 'pt'],
    dataTypes: ['apt', 'asp', 'hot', 'nav', 'obs', 'rpp'],
    cachePath: path.join(process.cwd(), 'public', 'data', 'cache', 'openaip')
  };
};

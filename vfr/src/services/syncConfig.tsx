// services/syncConfig.ts
import { OpenAIPConfig } from './openAIPSync';
import path from 'path';

export const createSyncConfig = (): OpenAIPConfig => ({
  countries: ['es', 'us', 'uk', 'de', 'fr', 'ca'], // Add countries you want to support
  dataTypes: ['apt', 'asp', 'hot', 'nav', 'obs'],
  apiKey: process.env.OPENAIP_API_KEY || '',
  cachePath: path.join(process.cwd(), 'public', 'data', 'cache', 'openaip')
});

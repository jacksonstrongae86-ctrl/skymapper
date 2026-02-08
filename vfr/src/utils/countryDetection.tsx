// utils/countryDetection.ts

const SUPPORTED_COUNTRIES = ['es', 'us', 'uk', 'mx', 'it', 'fr', 'de', 'ca', 'nl', 'be', 'ch', 'at', 'pt'];
const DEFAULT_COUNTRY = 'es';

export const detectUserCountry = async (): Promise<string> => {
  // Try browser language as quick heuristic
  const lang = navigator.language?.toLowerCase() || '';
  const langCountry = lang.split('-')[1] || lang.split('-')[0];
  if (SUPPORTED_COUNTRIES.includes(langCountry)) {
    return langCountry;
  }

  // Try timezone-based detection (no network needed)
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
  const tzCountryMap: Record<string, string> = {
    'Europe/Madrid': 'es', 'Europe/London': 'uk', 'Europe/Paris': 'fr',
    'Europe/Berlin': 'de', 'Europe/Rome': 'it', 'Europe/Amsterdam': 'nl',
    'Europe/Brussels': 'be', 'Europe/Zurich': 'ch', 'Europe/Vienna': 'at',
    'Europe/Lisbon': 'pt', 'America/Mexico_City': 'mx', 'America/Toronto': 'ca',
    'America/New_York': 'us', 'America/Chicago': 'us', 'America/Denver': 'us',
    'America/Los_Angeles': 'us',
  };
  if (tzCountryMap[tz]) {
    return tzCountryMap[tz];
  }

  return DEFAULT_COUNTRY;
};

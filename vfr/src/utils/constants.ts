/**
 * Application constants
 * Centralized location for hardcoded strings and configuration values
 */

// Map Configuration
export const MAP_CONSTANTS = {
  DEFAULT_ZOOM: 6,
  MOBILE_DEFAULT_ZOOM: 10,
  SEARCH_RESULT_ZOOM: 12,
  MAP_TYPES: {
    STREET: 'street',
    SATELLITE: 'sat',
    HYBRID: 'hybrid',
    TERRAIN: 'terrain',
  },
  TILE_URLS: {
    STREET: 'https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
    SATELLITE: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    HYBRID: 'https://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}',
    TERRAIN: 'https://{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}',
  },
  SUBDOMAINS: ['mt0', 'mt1', 'mt2', 'mt3'],
  OPENAIP_API_KEY: '5846be4e9efd4349db50e590d1e85a0c',
  OPENAIP_TILE_URL: 'https://api.tiles.openaip.net/api/data/openaip/{z}/{x}/{y}.png?apiKey=',
} as const;

// Aviation Data
export const AVIATION_CONSTANTS = {
  DATA_TYPES: ['apt', 'asp', 'hot', 'nav', 'obs', 'rpp'] as const,
  AIRPORT_CIRCLE_RADIUS: 3000,
  NAVIGATION_CIRCLE_RADIUS: 2000,
  DATA_FRESHNESS_HOURS: 48,
} as const;

// Responsive Breakpoints
export const BREAKPOINTS = {
  MOBILE_MAX_WIDTH: 768,
} as const;

// Sidebar
export const SIDEBAR_CONSTANTS = {
  DEFAULT_WIDTH_DESKTOP: 472,
  DEFAULT_WIDTH_MOBILE: 300,
  MIN_WIDTH: 256,
  DEFAULT_HEIGHT: 25,
  MIN_HEIGHT: 10,
  MAX_HEIGHT: 75,
} as const;

// Sync Configuration
export const SYNC_CONSTANTS = {
  CRON_SCHEDULE: '10 18 * * *',
  CRON_TIMEZONE: 'Europe/Madrid',
  DELAY_BETWEEN_REQUESTS_MS: 1000,
  MAX_SYNC_HISTORY: 10,
} as const;

// Messages
export const MESSAGES = {
  AIRSPACE_WARNING_DISABLED: 'Sistema de avisos deshabilitado temporalmente. Los datos de espacio aéreo no están verificados oficialmente.',
  SYNC_ALREADY_INITIALIZED: 'Sync service already initialized',
  SYNC_FAILED: 'Failed to initialize sync service',
  NO_VIOLATIONS: 'No altitude violations detected',
  NO_INTERSECTIONS: 'No airspace intersections',
} as const;

// URLs
export const API_URLS = {
  OPENAIP_STORAGE: 'https://storage.googleapis.com/29f98e10-a489-4c82-ae5e-489dbcd4912f',
  SYNC_INITIALIZE: '/api/sync/initialize',
  SYNC_MANUAL: '/api/sync/manual',
  SYNC_STATUS: '/api/sync/status',
  AVIATION_DATA: '/api/aviation-data',
} as const;

// LocalStorage Keys
export const STORAGE_KEYS = {
  CONSENTS: 'skymapper-consents',
  TUTORIAL_COMPLETED: 'skymapper-tutorial-completed',
  TUTORIAL_CANDIDATE: 'skymapper-tutorial-candidate',
  SAVED_ROUTES: 'skymapper-saved-routes',
} as const;

// Colors & Styles
export const COLORS = {
  AIRPORT: {
    STROKE: '#1e40af',
    FILL: '#1e40af',
    OPACITY: 0.08,
  },
  NAVIGATION: {
    STROKE: '#059669',
    FILL: '#059669',
    OPACITY: 0.05,
  },
  ROUTE_LINE: 'black',
} as const;

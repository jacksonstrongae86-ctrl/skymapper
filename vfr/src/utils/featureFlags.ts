/**
 * Feature flags for SkyMapper Aviation App
 * Controls which features are enabled/disabled across the application
 */

export const FEATURES = {
  /**
   * Airspace warning system
   * Disabled until we have authoritative ENAIRE AIS/AIP data
   * Current implementation uses unverified OpenAIP community data
   */
  AIRSPACE_WARNINGS: false,
  
  /**
   * IFR (Instrument Flight Rules) support
   * Flight planning with airways and procedures for IFR operations
   */
  IFR_SUPPORT: true,
  
  /**
   * Live flight tracking
   * Real-time aircraft position tracking with GPS and device sensors
   */
  LIVE_TRACKING: true,
  
  /**
   * Digital logbook
   * Flight log management and currency tracking
   */
  LOGBOOK: true,
  
  /**
   * Weight & Balance calculator
   * Aircraft loading and CG calculations
   */
  WEIGHT_BALANCE: true,
  
  /**
   * Weather overlays and briefings
   * METAR/TAF display and route weather analysis
   */
  WEATHER: true,
  
  /**
   * Enhanced airport directory
   * Searchable airport database with detailed information
   */
  AIRPORT_DIRECTORY: true,
} as const;

export type FeatureFlag = keyof typeof FEATURES;

/**
 * Check if a feature is enabled
 */
export const isFeatureEnabled = (feature: FeatureFlag): boolean => {
  return FEATURES[feature];
};

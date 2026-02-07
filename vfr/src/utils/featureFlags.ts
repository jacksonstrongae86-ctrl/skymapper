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
   * Coming soon - flight log management and analysis
   */
  LOGBOOK: false,
} as const;

export type FeatureFlag = keyof typeof FEATURES;

/**
 * Check if a feature is enabled
 */
export const isFeatureEnabled = (feature: FeatureFlag): boolean => {
  return FEATURES[feature];
};

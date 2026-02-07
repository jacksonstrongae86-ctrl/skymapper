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
   * Coming soon - flight planning and procedures for IFR operations
   */
  IFR_SUPPORT: false,
  
  /**
   * Live flight tracking
   * Coming soon - real-time aircraft position tracking
   */
  LIVE_TRACKING: false,
  
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

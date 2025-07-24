// src/utils/consentManager.ts
export interface ConsentState {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
  termsAccepted: boolean;
  privacyAccepted: boolean;
  dataProcessingAccepted: boolean;
  timestamp: string;
  version: string;
}

export interface ConsentConfig {
  companyName: string;
  version: string;
  expirationDays: number;
  domain?: string;
}

export class ConsentManager {
  private static readonly STORAGE_KEY = "skymapper-consents";
  private static readonly COOKIE_CONSENT_KEY = "skymapper-cookie-consent";
  private static readonly BANNER_DISMISSED_KEY = "skymapper-banner-dismissed";
  private static readonly CURRENT_VERSION = "1.0";

  private static config: ConsentConfig = {
    companyName: "SkyMapper",
    version: ConsentManager.CURRENT_VERSION,
    expirationDays: 365,
  };

  static configure(config: Partial<ConsentConfig>): void {
    ConsentManager.config = { ...ConsentManager.config, ...config };
  }

  static getDefaultConsents(): ConsentState {
    return {
      necessary: true,
      analytics: false,
      marketing: false,
      preferences: false,
      termsAccepted: false,
      privacyAccepted: false,
      dataProcessingAccepted: false,
      timestamp: new Date().toISOString(),
      version: ConsentManager.config.version,
    };
  }

  static getConsents(): ConsentState | null {
    if (typeof window === "undefined") return null; // ✅ Prevent SSR error

    try {
      const stored = localStorage.getItem(ConsentManager.STORAGE_KEY);
      if (!stored) return null;

      const consents: ConsentState = JSON.parse(stored);
      return consents;
    } catch (error) {
      console.error("Failed to retrieve consents:", error);
      return null;
    }
  }

  static saveConsents(consents: ConsentState): void {
    try {
      const updatedConsents: ConsentState = {
        ...consents,
        timestamp: new Date().toISOString(),
        version: ConsentManager.config.version,
      };

      localStorage.setItem(
        ConsentManager.STORAGE_KEY,
        JSON.stringify(updatedConsents)
      );
      ConsentManager.applyCookieSettings(updatedConsents);

      // Dispatch custom event for other components to listen
      window.dispatchEvent(
        new CustomEvent("consentUpdated", {
          detail: updatedConsents,
        })
      );

      // console.log("Consents saved successfully");
    } catch (error) {
      console.error("Failed to save consents:", error);
    }
  }

  static hasValidConsent(): boolean {
    const consents = ConsentManager.getConsents();
    if (!consents) return false;

    const requiredConsents = [
      "termsAccepted",
      "privacyAccepted",
      "dataProcessingAccepted",
    ] as const;

    return requiredConsents.every((key) => consents[key] === true);
  }

  static needsConsentUpdate(): boolean {
    const consents = ConsentManager.getConsents();
    return !consents || !ConsentManager.hasValidConsent();
  }

  static isBannerDismissed(): boolean {
    try {
      const dismissed = localStorage.getItem(
        ConsentManager.BANNER_DISMISSED_KEY
      );
      if (!dismissed) return false;

      const dismissData = JSON.parse(dismissed);
      return dismissData.version === ConsentManager.config.version;
    } catch {
      return false;
    }
  }

  static dismissBanner(): void {
    try {
      const dismissData = {
        timestamp: new Date().toISOString(),
        version: ConsentManager.config.version,
      };
      localStorage.setItem(
        ConsentManager.BANNER_DISMISSED_KEY,
        JSON.stringify(dismissData)
      );
    } catch (error) {
      console.error("Failed to dismiss banner:", error);
    }
  }

  private static applyCookieSettings(consents: ConsentState): void {
    // Apply analytics cookies
    if (consents.analytics) {
      ConsentManager.enableAnalytics();
    } else {
      ConsentManager.disableAnalytics();
    }

    // Apply marketing cookies
    if (consents.marketing) {
      ConsentManager.enableMarketing();
    } else {
      ConsentManager.disableMarketing();
    }

    // Apply preference cookies
    if (consents.preferences) {
      ConsentManager.enablePreferences();
    } else {
      ConsentManager.disablePreferences();
    }
  }

  private static enableAnalytics(): void {
    // Initialize analytics (e.g., Google Analytics)
    if (
      typeof window !== "undefined" &&
      (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag
    ) {
      (window as unknown as { gtag: (...args: unknown[]) => void }).gtag(
        "consent",
        "update",
        {
          analytics_storage: "granted",
        }
      );
    }

    // Set analytics cookie
    ConsentManager.setCookie(
      "analytics_enabled",
      "true",
      ConsentManager.config.expirationDays
    );
    // console.log("Analytics enabled");
  }

  private static disableAnalytics(): void {
    if (
      typeof window !== "undefined" &&
      (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag
    ) {
      (window as unknown as { gtag: (...args: unknown[]) => void }).gtag(
        "consent",
        "update",
        {
          analytics_storage: "denied",
        }
      );
    }

    ConsentManager.deleteCookie("analytics_enabled");
    // console.log("Analytics disabled");
  }

  private static enableMarketing(): void {
    // Enable marketing cookies
    if (
      typeof window !== "undefined" &&
      (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag
    ) {
      (window as unknown as { gtag: (...args: unknown[]) => void }).gtag(
        "consent",
        "update",
        {
          ad_storage: "granted",
        }
      );
    }

    ConsentManager.setCookie(
      "marketing_enabled",
      "true",
      ConsentManager.config.expirationDays
    );
    // console.log("Marketing enabled");
  }

  private static disableMarketing(): void {
    if (
      typeof window !== "undefined" &&
      (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag
    ) {
      (window as unknown as { gtag: (...args: unknown[]) => void }).gtag(
        "consent",
        "update",
        {
          ad_storage: "denied",
        }
      );
    }

    ConsentManager.deleteCookie("marketing_enabled");
    // console.log("Marketing disabled");
  }

  private static enablePreferences(): void {
    ConsentManager.setCookie(
      "preferences_enabled",
      "true",
      ConsentManager.config.expirationDays
    );
    // console.log("Preferences enabled");
  }

  private static disablePreferences(): void {
    ConsentManager.deleteCookie("preferences_enabled");
    // console.log("Preferences disabled");
  }

  private static setCookie(name: string, value: string, days: number): void {
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);

    const cookieString = `${name}=${value}; expires=${expires.toUTCString()}; path=/; SameSite=Strict${
      ConsentManager.config.domain
        ? `; domain=${ConsentManager.config.domain}`
        : ""
    }`;

    document.cookie = cookieString;
  }

  private static deleteCookie(name: string): void {
    const cookieString = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/${
      ConsentManager.config.domain
        ? `; domain=${ConsentManager.config.domain}`
        : ""
    }`;

    document.cookie = cookieString;
  }

  static clearAllData(): void {
    try {
      // Clear localStorage
      localStorage.removeItem(ConsentManager.STORAGE_KEY);
      localStorage.removeItem(ConsentManager.COOKIE_CONSENT_KEY);
      localStorage.removeItem(ConsentManager.BANNER_DISMISSED_KEY);

      // Clear all cookies related to the app
      const cookiesToClear = [
        "analytics_enabled",
        "marketing_enabled",
        "preferences_enabled",
        "skymapper_session",
        "skymapper_user_prefs",
      ];

      cookiesToClear.forEach((cookieName) => {
        ConsentManager.deleteCookie(cookieName);
      });

      // Disable all tracking
      if (
        typeof window !== "undefined" &&
        (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag
      ) {
        (window as unknown as { gtag: (...args: unknown[]) => void }).gtag(
          "consent",
          "update",
          {
            analytics_storage: "denied",
            ad_storage: "denied",
          }
        );
      }

      // console.log("All consent data cleared");

      // Dispatch event
      window.dispatchEvent(new CustomEvent("consentCleared"));
    } catch (error) {
      console.error("Failed to clear consent data:", error);
    }
  }

  static exportConsents(): string {
    const consents = ConsentManager.getConsents();
    if (!consents) return "";

    return JSON.stringify(consents, null, 2);
  }

  static getConsentSummary(): { [key: string]: boolean } {
    const consents = ConsentManager.getConsents();
    if (!consents) {
      return {
        necessary: true,
        analytics: false,
        marketing: false,
        preferences: false,
        legalAgreements: false,
      };
    }

    return {
      necessary: consents.necessary,
      analytics: consents.analytics,
      marketing: consents.marketing,
      preferences: consents.preferences,
      legalAgreements:
        consents.termsAccepted &&
        consents.privacyAccepted &&
        consents.dataProcessingAccepted,
    };
  }
}

// Initialize with default config
ConsentManager.configure({
  companyName: "SkyMapper",
  version: "1.0",
  expirationDays: 365,
});

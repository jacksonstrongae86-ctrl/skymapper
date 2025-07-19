// src/utils/cookieUtils.ts
export interface CookieOptions {
  expires?: Date | string | number;
  path?: string;
  domain?: string;
  secure?: boolean;
  sameSite?: 'Strict' | 'Lax' | 'None';
  httpOnly?: boolean;
}

export class CookieUtils {
  private static readonly DEFAULT_OPTIONS: CookieOptions = {
    path: '/',
    sameSite: 'Strict',
    secure: typeof window !== 'undefined' && window.location.protocol === 'https:',
  };

  /**
   * Set a cookie with the given name, value, and options
   */
  static setCookie(name: string, value: string, options: CookieOptions = {}): void {
    if (typeof document === 'undefined') return;

    const finalOptions = { ...CookieUtils.DEFAULT_OPTIONS, ...options };
    let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;

    // Handle expiration
    if (finalOptions.expires) {
      let expiresDate: Date;

      if (typeof finalOptions.expires === 'number') {
        expiresDate = new Date();
        expiresDate.setTime(expiresDate.getTime() + (finalOptions.expires * 24 * 60 * 60 * 1000));
      } else if (typeof finalOptions.expires === 'string') {
        expiresDate = new Date(finalOptions.expires);
      } else {
        expiresDate = finalOptions.expires;
      }

      cookieString += `; expires=${expiresDate.toUTCString()}`;
    }

    // Add other options
    if (finalOptions.path) {
      cookieString += `; path=${finalOptions.path}`;
    }

    if (finalOptions.domain) {
      cookieString += `; domain=${finalOptions.domain}`;
    }

    if (finalOptions.secure) {
      cookieString += '; secure';
    }

    if (finalOptions.sameSite) {
      cookieString += `; samesite=${finalOptions.sameSite}`;
    }

    if (finalOptions.httpOnly) {
      cookieString += '; httponly';
    }

    document.cookie = cookieString;
  }

  /**
   * Get a cookie value by name
   */
  static getCookie(name: string): string | null {
    if (typeof document === 'undefined') return null;

    const nameEQ = `${encodeURIComponent(name)}=`;
    const cookies = document.cookie.split(';');

    for (let cookie of cookies) {
      cookie = cookie.trim();
      if (cookie.indexOf(nameEQ) === 0) {
        return decodeURIComponent(cookie.substring(nameEQ.length));
      }
    }

    return null;
  }

  /**
   * Delete a cookie by name
   */
  static deleteCookie(name: string, options: Omit<CookieOptions, 'expires'> = {}): void {
    const deleteOptions = {
      ...options,
      expires: 'Thu, 01 Jan 1970 00:00:00 GMT',
    };

    CookieUtils.setCookie(name, '', deleteOptions);
  }

  /**
   * Check if a cookie exists
   */
  static hasCookie(name: string): boolean {
    return CookieUtils.getCookie(name) !== null;
  }

  /**
   * Get all cookies as an object
   */
  static getAllCookies(): Record<string, string> {
    if (typeof document === 'undefined') return {};

    const cookies: Record<string, string> = {};

    document.cookie.split(';').forEach(cookie => {
      const [name, ...valueParts] = cookie.trim().split('=');
      if (name && valueParts.length > 0) {
        cookies[decodeURIComponent(name)] = decodeURIComponent(valueParts.join('='));
      }
    });

    return cookies;
  }

  /**
   * Clear all cookies for the current domain
   */
  static clearAllCookies(domain?: string): void {
    const cookies = CookieUtils.getAllCookies();
    const options = domain ? { domain } : {};

    Object.keys(cookies).forEach(name => {
      CookieUtils.deleteCookie(name, options);
    });
  }

  /**
   * Clear cookies that match a pattern
   */
  static clearCookiesMatching(pattern: RegExp, domain?: string): void {
    const cookies = CookieUtils.getAllCookies();
    const options = domain ? { domain } : {};

    Object.keys(cookies).forEach(name => {
      if (pattern.test(name)) {
        CookieUtils.deleteCookie(name, options);
      }
    });
  }

  /**
   * Set a JSON object as a cookie
   */
  static setJSONCookie(name: string, value: unknown, options: CookieOptions = {}): void {
    try {
      const jsonString = JSON.stringify(value);
      CookieUtils.setCookie(name, jsonString, options);
    } catch (error) {
      console.error('Failed to set JSON cookie:', error);
    }
  }

  /**
   * Get a JSON object from a cookie
   */
  static getJSONCookie<T = unknown>(name: string): T | null {
    try {
      const cookieValue = CookieUtils.getCookie(name);
      if (!cookieValue) return null;

      return JSON.parse(cookieValue) as T;
    } catch (error) {
      console.error('Failed to parse JSON cookie:', error);
      return null;
    }
  }

  /**
   * Check if cookies are enabled in the browser
   */
  static areCookiesEnabled(): boolean {
    if (typeof document === 'undefined') return false;

    const testCookie = 'test_cookie_enabled';
    CookieUtils.setCookie(testCookie, 'test', { expires: 1 });
    const enabled = CookieUtils.hasCookie(testCookie);
    CookieUtils.deleteCookie(testCookie);

    return enabled;
  }

  /**
   * Get cookie size in bytes
   */
  static getCookieSize(name: string): number {
    const value = CookieUtils.getCookie(name);
    if (!value) return 0;

    return new Blob([`${name}=${value}`]).size;
  }

  /**
   * Get total size of all cookies in bytes
   */
  static getTotalCookieSize(): number {
    if (typeof document === 'undefined') return 0;

    return new Blob([document.cookie]).size;
  }

  /**
   * Check if we're approaching cookie size limits
   */
  static isNearCookieLimit(warningThreshold = 0.8): boolean {
    const maxCookieSize = 4096; // 4KB limit per cookie
    const currentSize = CookieUtils.getTotalCookieSize();

    return currentSize >= (maxCookieSize * warningThreshold);
  }

  /**
   * Get cookies related to SkyMapper application
   */
  static getSkyMapperCookies(): Record<string, string> {
    const allCookies = CookieUtils.getAllCookies();
    const skyMapperCookies: Record<string, string> = {};

    Object.entries(allCookies).forEach(([name, value]) => {
      if (name.toLowerCase().includes('skymapper') ||
          name.includes('analytics_enabled') ||
          name.includes('marketing_enabled') ||
          name.includes('preferences_enabled')) {
        skyMapperCookies[name] = value;
      }
    });

    return skyMapperCookies;
  }

  /**
   * Clear all SkyMapper related cookies
   */
  static clearSkyMapperCookies(domain?: string): void {
    const skyMapperCookies = CookieUtils.getSkyMapperCookies();
    const options = domain ? { domain } : {};

    Object.keys(skyMapperCookies).forEach(name => {
      CookieUtils.deleteCookie(name, options);
    });
  }

  /**
   * Set consent-specific cookies with proper expiration
   */
  static setConsentCookie(
    type: 'necessary' | 'analytics' | 'marketing' | 'preferences',
    enabled: boolean,
    expirationDays = 365
  ): void {
    const cookieName = `skymapper_${type}_consent`;
    const value = enabled ? 'granted' : 'denied';

    CookieUtils.setCookie(cookieName, value, {
      expires: expirationDays,
      path: '/',
      sameSite: 'Strict',
      secure: window.location.protocol === 'https:',
    });
  }

  /**
   * Get consent status for a specific type
   */
  static getConsentStatus(type: 'necessary' | 'analytics' | 'marketing' | 'preferences'): boolean | null {
    const cookieName = `skymapper_${type}_consent`;
    const value = CookieUtils.getCookie(cookieName);

    if (value === null) return null;
    return value === 'granted';
  }

  /**
   * Debug function to log all cookies
   */
  static debugCookies(): void {
    console.group('🍪 Cookie Debug Information');
    console.log('Cookies enabled:', CookieUtils.areCookiesEnabled());
    console.log('Total cookie size:', CookieUtils.getTotalCookieSize(), 'bytes');
    console.log('Near limit:', CookieUtils.isNearCookieLimit());
    console.log('All cookies:', CookieUtils.getAllCookies());
    console.log('SkyMapper cookies:', CookieUtils.getSkyMapperCookies());
    console.groupEnd();
  }
}

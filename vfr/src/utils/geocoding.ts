// src/utils/geocoding.ts

// Remove the unused interface and simplify the function
export const getLocationName = async (lat: number, lng: number): Promise<string> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=12&addressdetails=1`,
      {
        signal: controller.signal,
        headers: {
          'User-Agent': 'FlightPlanner/1.0' // Required by Nominatim
        }
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data || data.error) {
      throw new Error(data?.error || 'No location data found');
    }

    // Extract and format location name with length limit
    const address = data.address || {};
    let locationName =
      address.city ||
      address.town ||
      address.village ||
      address.hamlet ||
      address.county ||
      address.state ||
      data.display_name?.split(',')[0] ||
      'Unknown';

    // Limit name length and clean up
    locationName = locationName
      .trim()
      .substring(0, 25) // Max 25 characters
      .replace(/[^\w\s-]/g, '') // Remove special chars except hyphens
      .replace(/\s+/g, ' '); // Normalize spaces

    return locationName || `${lat.toFixed(3)},${lng.toFixed(3)}`;

  } catch (err) {
    const error = err as unknown as Error;
    console.warn('Geocoding failed:', error);

    // Provide meaningful fallback based on error type
    if (error.name === 'AbortError') {
      return `${lat.toFixed(3)},${lng.toFixed(3)} (Timeout)`;
    }

    return `${lat.toFixed(3)},${lng.toFixed(3)}`;
  }
};

// Rate limiting helper
class RateLimiter {
  private requests: number[] = [];
  private readonly maxRequests = 1; // Nominatim: 1 request per second
  private readonly timeWindow = 1000; // 1 second

  async waitForSlot(): Promise<void> {
    const now = Date.now();
    this.requests = this.requests.filter(time => now - time < this.timeWindow);

    if (this.requests.length >= this.maxRequests) {
      const oldestRequest = Math.min(...this.requests);
      const waitTime = this.timeWindow - (now - oldestRequest);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }

    this.requests.push(now);
  }
}

const rateLimiter = new RateLimiter();

export const getLocationNameWithRateLimit = async (lat: number, lng: number): Promise<string> => {
  await rateLimiter.waitForSlot();
  return getLocationName(lat, lng);
};

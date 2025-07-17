// utils/countryDetection.ts
export const detectUserCountry = async (): Promise<string> => {
  // Try geolocation first
  if (navigator.geolocation) {
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          timeout: 10000,
          enableHighAccuracy: false
        });
      });

      const { latitude, longitude } = position.coords;
      const country = await getCountryFromCoordinates(latitude, longitude);
      return country;
    } catch (error) {
      console.warn('Geolocation failed:', error);
    }
  }

  // Fallback to IP-based detection
  return await getCountryFromIP();
};

// Get country from coordinates using reverse geocoding
const getCountryFromCoordinates = async (lat: number, lng: number): Promise<string> => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=3&addressdetails=1`
    );
    const data = await response.json();
    const countryCode = data.address?.country_code?.toLowerCase();

    // Map to your supported countries
    const supportedCountries = ['es', 'us', 'uk', 'mx', 'it', 'fr', 'de', 'ca', 'nl', 'be', 'ch', 'at', 'pt'];
    return supportedCountries.includes(countryCode) ? countryCode : 'es';
  } catch {
    return 'es';
  }
};

// Fallback: IP-based country detection
const getCountryFromIP = async (): Promise<string> => {
  try {
    const response = await fetch('https://ipapi.co/json/');
    const data = await response.json();
    const countryCode = data.country_code?.toLowerCase();

    // Map to your supported countries
    const supportedCountries = ['es', 'us', 'uk', 'mx', 'it', 'fr', 'de', 'ca', 'nl', 'be', 'ch', 'at', 'pt'];
    return supportedCountries.includes(countryCode) ? countryCode : 'es';
  } catch {
    return 'es'; // Default fallback
  }
};

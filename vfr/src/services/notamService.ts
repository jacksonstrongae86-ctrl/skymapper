/**
 * NOTAM Service for SkyMapper Aviation App
 * Fetches and parses NOTAMs from aviationweather.gov
 */

export interface NOTAM {
  id: string;
  icao: string;
  type: string; // aerodrome, en-route, navigation, obstacle, etc.
  effectiveStart: string; // ISO date string
  effectiveEnd: string; // ISO date string
  text: string;
  raw: string;
  isActive: boolean;
  isExpired: boolean;
  category?: string;
}

/**
 * Fetch NOTAMs for a list of ICAO codes
 */
export const fetchNOTAMs = async (icaoCodes: string | string[]): Promise<NOTAM[]> => {
  try {
    const codesArray = Array.isArray(icaoCodes) ? icaoCodes : [icaoCodes];
    const icaoString = codesArray.join(',');

    const url = `https://aviationweather.gov/api/data/notam?icao=${icaoString}&format=json`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error(`NOTAM fetch failed: ${response.status} ${response.statusText}`);
      return [];
    }

    const data = await response.json();
    
    if (!Array.isArray(data)) {
      console.error('NOTAM response is not an array:', data);
      return [];
    }

    return data.map(parseNOTAM).filter(Boolean) as NOTAM[];
  } catch (error) {
    console.error('Error fetching NOTAMs:', error);
    return [];
  }
};

/**
 * Parse a NOTAM object from aviationweather.gov API
 */
const parseNOTAM = (rawNotam: Record<string, unknown>): NOTAM | null => {
  try {
    if (!rawNotam || !rawNotam.icaoLocation) {
      return null;
    }

    const now = new Date();
    const effectiveStart = rawNotam.effectiveStart ? new Date(rawNotam.effectiveStart as string) : now;
    const effectiveEnd = rawNotam.effectiveEnd ? new Date(rawNotam.effectiveEnd as string) : new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);

    const isActive = now >= effectiveStart && now <= effectiveEnd;
    const isExpired = now > effectiveEnd;

    const type = categorizeNOTAM((rawNotam.notamText as string) || (rawNotam.traditionalMessage as string) || '');

    return {
      id: (rawNotam.notamID as string) || (rawNotam.icaoLocation as string) + '-' + Date.now(),
      icao: rawNotam.icaoLocation as string,
      type,
      effectiveStart: effectiveStart.toISOString(),
      effectiveEnd: effectiveEnd.toISOString(),
      text: (rawNotam.notamText as string) || (rawNotam.traditionalMessage as string) || '',
      raw: (rawNotam.traditionalMessage as string) || (rawNotam.notamText as string) || '',
      isActive,
      isExpired,
      category: (rawNotam.classification as string) || undefined,
    };
  } catch (error) {
    console.error('Error parsing NOTAM:', error, rawNotam);
    return null;
  }
};

/**
 * Categorize NOTAM based on text content
 */
const categorizeNOTAM = (text: string): string => {
  const upper = text.toUpperCase();

  if (upper.includes('RWY') || upper.includes('RUNWAY') || upper.includes('TWY') || upper.includes('TAXIWAY') || upper.includes('APRON')) {
    return 'aerodrome';
  }
  
  if (upper.includes('AIRSPACE') || upper.includes('RESTRICTED') || upper.includes('PROHIBITED') || upper.includes('DANGER AREA')) {
    return 'airspace';
  }
  
  if (upper.includes('NAV') || upper.includes('VOR') || upper.includes('NDB') || upper.includes('ILS') || upper.includes('DME')) {
    return 'navigation';
  }
  
  if (upper.includes('OBST') || upper.includes('OBSTACLE') || upper.includes('CRANE') || upper.includes('TOWER')) {
    return 'obstacle';
  }
  
  if (upper.includes('LIGHTING') || upper.includes('LIGHT') || upper.includes('PAPI') || upper.includes('VASI')) {
    return 'lighting';
  }

  return 'other';
};

/**
 * Get NOTAMs along a route (all waypoints)
 */
export const fetchRouteNOTAMs = async (waypoints: Array<{ icao?: string; name?: string }>): Promise<NOTAM[]> => {
  const icaos = waypoints
    .map(wp => wp.icao)
    .filter(Boolean)
    .filter((icao, index, self) => self.indexOf(icao) === index) as string[];

  if (icaos.length === 0) {
    return [];
  }

  return fetchNOTAMs(icaos);
};

/**
 * Get NOTAM type color for display
 */
export const getNotamTypeColor = (type: string): string => {
  switch (type) {
    case 'aerodrome':
      return '#3b82f6'; // blue
    case 'airspace':
      return '#ef4444'; // red
    case 'navigation':
      return '#10b981'; // green
    case 'obstacle':
      return '#f59e0b'; // orange
    case 'lighting':
      return '#8b5cf6'; // purple
    default:
      return '#6b7280'; // gray
  }
};

/**
 * Get NOTAM type icon
 */
export const getNotamTypeIcon = (type: string): string => {
  switch (type) {
    case 'aerodrome':
      return '🛬';
    case 'airspace':
      return '🚫';
    case 'navigation':
      return '📡';
    case 'obstacle':
      return '⚠️';
    case 'lighting':
      return '💡';
    default:
      return '📋';
  }
};

/**
 * Format NOTAM date for display
 */
export const formatNotamDate = (isoDate: string): string => {
  const date = new Date(isoDate);
  const now = new Date();

  const diffMs = date.getTime() - now.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  if (diffDays < -1) {
    return `${Math.abs(diffDays)} días atrás`;
  } else if (diffDays === -1) {
    return 'Ayer';
  } else if (diffHours < 0) {
    return `${Math.abs(diffHours)} horas atrás`;
  } else if (diffHours === 0) {
    return 'Ahora';
  } else if (diffDays === 0) {
    return 'Hoy';
  } else if (diffDays === 1) {
    return 'Mañana';
  } else if (diffDays < 7) {
    return `En ${diffDays} días`;
  } else {
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
  }
};

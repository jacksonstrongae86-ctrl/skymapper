/**
 * Aviation Weather Service
 * Fetches and parses METAR/TAF from aviationweather.gov
 */

export interface METAR {
  raw: string;
  icao: string;
  observationTime?: string;
  wind?: {
    direction: number | string; // degrees or "VRB"
    speed: number; // knots
    gust?: number;
  };
  visibility?: number; // statute miles
  clouds?: Array<{
    coverage: string; // FEW, SCT, BKN, OVC
    altitude: number; // feet AGL
  }>;
  temperature?: number; // celsius
  dewpoint?: number; // celsius
  altimeter?: number; // inHg
  flightCategory?: 'VFR' | 'MVFR' | 'IFR' | 'LIFR';
  remarks?: string;
}

export interface TAF {
  raw: string;
  icao: string;
  issueTime?: string;
  validFrom?: string;
  validTo?: string;
  forecasts?: string[];
}

const API_BASE = 'https://aviationweather.gov/api/data';

/**
 * Fetch METAR for one or more airports
 */
export const fetchMETAR = async (icaoCodes: string | string[]): Promise<METAR[]> => {
  const ids = Array.isArray(icaoCodes) ? icaoCodes.join(',') : icaoCodes;
  
  try {
    const response = await fetch(`${API_BASE}/metar?ids=${ids}&format=json&taf=false`);
    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!Array.isArray(data)) {
      return [];
    }
    
    return data.map((item: { rawOb?: string; raw?: string }) => parseMETAR(item.rawOb || item.raw || ''));
  } catch (error) {
    console.error('Error fetching METAR:', error);
    return [];
  }
};

/**
 * Fetch TAF for one or more airports
 */
export const fetchTAF = async (icaoCodes: string | string[]): Promise<TAF[]> => {
  const ids = Array.isArray(icaoCodes) ? icaoCodes.join(',') : icaoCodes;
  
  try {
    const response = await fetch(`${API_BASE}/taf?ids=${ids}&format=json`);
    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!Array.isArray(data)) {
      return [];
    }
    
    return data.map((item: { rawTAF?: string; raw?: string }) => parseTAF(item.rawTAF || item.raw || ''));
  } catch (error) {
    console.error('Error fetching TAF:', error);
    return [];
  }
};

/**
 * Parse raw METAR string into structured data
 */
export const parseMETAR = (raw: string): METAR => {
  const metar: METAR = {
    raw: raw.trim(),
    icao: '',
  };
  
  // Extract ICAO (first 4-letter code)
  const icaoMatch = raw.match(/\b([A-Z]{4})\b/);
  if (icaoMatch) {
    metar.icao = icaoMatch[1];
  }
  
  // Wind (e.g., 27015KT, 27015G25KT, VRB03KT)
  const windMatch = raw.match(/(\d{3}|VRB)(\d{2,3})(G(\d{2,3}))?KT/);
  if (windMatch) {
    metar.wind = {
      direction: windMatch[1] === 'VRB' ? 'VRB' : parseInt(windMatch[1]),
      speed: parseInt(windMatch[2]),
      gust: windMatch[4] ? parseInt(windMatch[4]) : undefined,
    };
  }
  
  // Visibility (statute miles, e.g., 10SM, 1/2SM, 3/4SM)
  const visMatch = raw.match(/(\d+)?\/?(\d+)?SM/);
  if (visMatch) {
    if (visMatch[2]) {
      // Fractional (e.g., 1/2SM)
      metar.visibility = parseInt(visMatch[1] || '0') / parseInt(visMatch[2]);
    } else {
      metar.visibility = parseInt(visMatch[1] || '10');
    }
  }
  
  // Clouds (e.g., FEW020, SCT040, BKN080, OVC120)
  const cloudMatches = raw.matchAll(/(FEW|SCT|BKN|OVC)(\d{3})/g);
  metar.clouds = [];
  for (const match of cloudMatches) {
    metar.clouds.push({
      coverage: match[1],
      altitude: parseInt(match[2]) * 100, // Convert to feet
    });
  }
  
  // Temperature/Dewpoint (e.g., 23/18, M05/M08)
  const tempMatch = raw.match(/(M)?(\d{2})\/(M)?(\d{2})/);
  if (tempMatch) {
    metar.temperature = parseInt(tempMatch[2]) * (tempMatch[1] ? -1 : 1);
    metar.dewpoint = parseInt(tempMatch[4]) * (tempMatch[3] ? -1 : 1);
  }
  
  // Altimeter (e.g., A2992)
  const altMatch = raw.match(/A(\d{4})/);
  if (altMatch) {
    metar.altimeter = parseInt(altMatch[1]) / 100;
  }
  
  // Calculate flight category
  metar.flightCategory = calculateFlightCategory(metar.visibility, metar.clouds);
  
  // Remarks (everything after RMK)
  const rmkIndex = raw.indexOf('RMK');
  if (rmkIndex >= 0) {
    metar.remarks = raw.substring(rmkIndex + 3).trim();
  }
  
  return metar;
};

/**
 * Parse raw TAF string
 */
export const parseTAF = (raw: string): TAF => {
  const taf: TAF = {
    raw: raw.trim(),
    icao: '',
  };
  
  // Extract ICAO
  const icaoMatch = raw.match(/TAF\s+([A-Z]{4})/);
  if (icaoMatch) {
    taf.icao = icaoMatch[1];
  }
  
  // Extract issue time (e.g., TAF AMD LEMD 071700Z)
  const issueMatch = raw.match(/(\d{6}Z)/);
  if (issueMatch) {
    taf.issueTime = issueMatch[1];
  }
  
  // Extract valid period (e.g., 0718/0824)
  const validMatch = raw.match(/(\d{4})\/(\d{4})/);
  if (validMatch) {
    taf.validFrom = validMatch[1];
    taf.validTo = validMatch[2];
  }
  
  // Split into forecast groups (FM, TEMPO, BECMG)
  taf.forecasts = raw.split(/\s+(FM|TEMPO|BECMG)\s+/).filter(Boolean);
  
  return taf;
};

/**
 * Calculate flight category from visibility and clouds
 * VFR: >= 5SM visibility, ceiling >= 3000 AGL
 * MVFR: 3-5SM visibility, ceiling 1000-3000 AGL
 * IFR: 1-3SM visibility, ceiling 500-1000 AGL
 * LIFR: < 1SM visibility, ceiling < 500 AGL
 */
export const calculateFlightCategory = (
  visibility?: number,
  clouds?: Array<{ coverage: string; altitude: number }>
): 'VFR' | 'MVFR' | 'IFR' | 'LIFR' => {
  const vis = visibility ?? 10;
  
  // Find ceiling (lowest BKN or OVC layer)
  let ceiling = 30000; // Default high ceiling
  if (clouds && clouds.length > 0) {
    for (const cloud of clouds) {
      if (cloud.coverage === 'BKN' || cloud.coverage === 'OVC') {
        ceiling = Math.min(ceiling, cloud.altitude);
      }
    }
  }
  
  // LIFR
  if (vis < 1 || ceiling < 500) return 'LIFR';
  
  // IFR
  if (vis < 3 || ceiling < 1000) return 'IFR';
  
  // MVFR
  if (vis < 5 || ceiling < 3000) return 'MVFR';
  
  // VFR
  return 'VFR';
};

/**
 * Get color for flight category
 */
export const getFlightCategoryColor = (category: string): string => {
  switch (category) {
    case 'VFR':
      return '#22c55e'; // Green
    case 'MVFR':
      return '#3b82f6'; // Blue
    case 'IFR':
      return '#ef4444'; // Red
    case 'LIFR':
      return '#a855f7'; // Magenta
    default:
      return '#64748b'; // Gray
  }
};

/**
 * Decode wind direction to compass heading
 */
export const decodeWindDirection = (direction: number | string): string => {
  if (direction === 'VRB') return 'Variable';
  if (typeof direction === 'string') direction = parseInt(direction);
  
  const headings = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(direction / 22.5) % 16;
  return headings[index];
};

/**
 * Format visibility for display
 */
export const formatVisibility = (visibility?: number): string => {
  if (!visibility) return 'N/A';
  if (visibility >= 10) return '10+ SM';
  if (visibility < 1) {
    // Show as fraction
    if (visibility === 0.5) return '1/2 SM';
    if (visibility === 0.25) return '1/4 SM';
    if (visibility === 0.75) return '3/4 SM';
    return `${visibility.toFixed(2)} SM`;
  }
  return `${visibility} SM`;
};

/**
 * Format clouds for display
 */
export const formatClouds = (clouds?: Array<{ coverage: string; altitude: number }>): string => {
  if (!clouds || clouds.length === 0) return 'SKC (Clear)';
  
  return clouds
    .map((cloud) => {
      const altFt = cloud.altitude;
      const altHundreds = Math.round(altFt / 100);
      return `${cloud.coverage} ${altHundreds.toString().padStart(3, '0')}`;
    })
    .join(', ');
};

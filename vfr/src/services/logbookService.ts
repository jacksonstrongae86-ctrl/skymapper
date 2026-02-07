/**
 * Pilot Logbook Service
 * Manages flight log entries and currency tracking
 */

export interface LogbookEntry {
  id: string;
  date: string; // ISO date
  departure: string; // ICAO code
  arrival: string; // ICAO code
  aircraftReg: string;
  aircraftType?: string;
  
  // Times (in minutes)
  blockOff?: string; // HH:MM
  blockOn?: string; // HH:MM
  takeoffTime?: string; // HH:MM
  landingTime?: string; // HH:MM
  flightTime: number; // minutes (auto-calculated or manual)
  
  // Time breakdown
  dayTime: number; // minutes
  nightTime: number; // minutes
  
  // Pilot function
  picTime: number; // Pilot in Command
  sicTime: number; // Second in Command
  dualTime: number; // Dual instruction received
  soloTime: number; // Solo
  
  // Instrument time
  instrumentActual: number; // minutes
  instrumentSimulated: number; // minutes
  
  // Landings
  landingsDay: number;
  landingsNight: number;
  
  // Cross-country
  isCrossCountry: boolean;
  distance?: number; // nm
  
  // Remarks
  remarks?: string;
  approaches?: number; // IFR approaches
  holds?: boolean;
}

export interface LogbookTotals {
  totalTime: number;
  picTime: number;
  sicTime: number;
  dualTime: number;
  soloTime: number;
  nightTime: number;
  instrumentActual: number;
  instrumentSimulated: number;
  crossCountryTime: number;
  totalLandingsDay: number;
  totalLandingsNight: number;
  totalApproaches: number;
}

export interface CurrencyStatus {
  passengerCurrent: boolean; // 3 landings in 90 days
  passengerExpiresOn?: string;
  nightCurrent: boolean; // 3 night landings in 90 days
  nightExpiresOn?: string;
  ifrCurrent: boolean; // 6 approaches in 6 months
  ifrExpiresOn?: string;
  lastFlight?: string;
}

const STORAGE_KEY = 'skymapper_logbook';

/**
 * Load all logbook entries from localStorage
 */
export const loadLogbook = (): LogbookEntry[] => {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading logbook:', error);
    return [];
  }
};

/**
 * Save logbook entries to localStorage
 */
export const saveLogbook = (entries: LogbookEntry[]): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch (error) {
    console.error('Error saving logbook:', error);
  }
};

/**
 * Add a new logbook entry
 */
export const addEntry = (entry: Omit<LogbookEntry, 'id'>): LogbookEntry => {
  const entries = loadLogbook();
  const newEntry: LogbookEntry = {
    ...entry,
    id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  };
  entries.push(newEntry);
  saveLogbook(entries);
  return newEntry;
};

/**
 * Update an existing entry
 */
export const updateEntry = (id: string, updates: Partial<LogbookEntry>): void => {
  const entries = loadLogbook();
  const index = entries.findIndex((e) => e.id === id);
  if (index >= 0) {
    entries[index] = { ...entries[index], ...updates };
    saveLogbook(entries);
  }
};

/**
 * Delete an entry
 */
export const deleteEntry = (id: string): void => {
  const entries = loadLogbook();
  const filtered = entries.filter((e) => e.id !== id);
  saveLogbook(filtered);
};

/**
 * Calculate totals from all entries
 */
export const calculateTotals = (): LogbookTotals => {
  const entries = loadLogbook();
  
  const totals: LogbookTotals = {
    totalTime: 0,
    picTime: 0,
    sicTime: 0,
    dualTime: 0,
    soloTime: 0,
    nightTime: 0,
    instrumentActual: 0,
    instrumentSimulated: 0,
    crossCountryTime: 0,
    totalLandingsDay: 0,
    totalLandingsNight: 0,
    totalApproaches: 0,
  };
  
  entries.forEach((entry) => {
    totals.totalTime += entry.flightTime;
    totals.picTime += entry.picTime;
    totals.sicTime += entry.sicTime;
    totals.dualTime += entry.dualTime;
    totals.soloTime += entry.soloTime;
    totals.nightTime += entry.nightTime;
    totals.instrumentActual += entry.instrumentActual;
    totals.instrumentSimulated += entry.instrumentSimulated;
    if (entry.isCrossCountry) {
      totals.crossCountryTime += entry.flightTime;
    }
    totals.totalLandingsDay += entry.landingsDay;
    totals.totalLandingsNight += entry.landingsNight;
    totals.totalApproaches += entry.approaches || 0;
  });
  
  return totals;
};

/**
 * Check currency status
 */
export const checkCurrency = (): CurrencyStatus => {
  const entries = loadLogbook().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  const now = new Date();
  const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
  const sixMonthsAgo = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
  
  // Passenger currency: 3 landings (day or night) in 90 days
  const recentLandings = entries.filter((e) => new Date(e.date) >= ninetyDaysAgo);
  const totalLandings = recentLandings.reduce((sum, e) => sum + e.landingsDay + e.landingsNight, 0);
  const passengerCurrent = totalLandings >= 3;
  
  // Find date of 3rd most recent landing for expiration
  let passengerExpiresOn: string | undefined;
  if (passengerCurrent && recentLandings.length > 0) {
    const landingDates: string[] = [];
    recentLandings.forEach((e) => {
      const count = e.landingsDay + e.landingsNight;
      for (let i = 0; i < count; i++) {
        landingDates.push(e.date);
      }
    });
    landingDates.sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    if (landingDates.length >= 3) {
      const thirdLandingDate = new Date(landingDates[2]);
      const expirationDate = new Date(thirdLandingDate.getTime() + 90 * 24 * 60 * 60 * 1000);
      passengerExpiresOn = expirationDate.toISOString().split('T')[0];
    }
  }
  
  // Night currency: 3 night landings in 90 days
  const nightLandings = recentLandings.reduce((sum, e) => sum + e.landingsNight, 0);
  const nightCurrent = nightLandings >= 3;
  
  let nightExpiresOn: string | undefined;
  if (nightCurrent && recentLandings.length > 0) {
    const nightLandingDates: string[] = [];
    recentLandings.forEach((e) => {
      for (let i = 0; i < e.landingsNight; i++) {
        nightLandingDates.push(e.date);
      }
    });
    nightLandingDates.sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    if (nightLandingDates.length >= 3) {
      const thirdNightLanding = new Date(nightLandingDates[2]);
      const expirationDate = new Date(thirdNightLanding.getTime() + 90 * 24 * 60 * 60 * 1000);
      nightExpiresOn = expirationDate.toISOString().split('T')[0];
    }
  }
  
  // IFR currency: 6 approaches in 6 months
  const recentIFR = entries.filter((e) => new Date(e.date) >= sixMonthsAgo);
  const totalApproaches = recentIFR.reduce((sum, e) => sum + (e.approaches || 0), 0);
  const ifrCurrent = totalApproaches >= 6;
  
  let ifrExpiresOn: string | undefined;
  if (ifrCurrent && recentIFR.length > 0) {
    // Find the 6th most recent approach date
    const approachDates: string[] = [];
    recentIFR.forEach((e) => {
      const count = e.approaches || 0;
      for (let i = 0; i < count; i++) {
        approachDates.push(e.date);
      }
    });
    approachDates.sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    if (approachDates.length >= 6) {
      const sixthApproach = new Date(approachDates[5]);
      const expirationDate = new Date(sixthApproach.getTime() + 180 * 24 * 60 * 60 * 1000);
      ifrExpiresOn = expirationDate.toISOString().split('T')[0];
    }
  }
  
  const lastFlight = entries.length > 0 ? entries[0].date : undefined;
  
  return {
    passengerCurrent,
    passengerExpiresOn,
    nightCurrent,
    nightExpiresOn,
    ifrCurrent,
    ifrExpiresOn,
    lastFlight,
  };
};

/**
 * Calculate flight time from block times (HH:MM format)
 */
export const calculateFlightTime = (blockOff: string, blockOn: string): number => {
  try {
    const [offHours, offMinutes] = blockOff.split(':').map(Number);
    const [onHours, onMinutes] = blockOn.split(':').map(Number);
    
    const offTotal = offHours * 60 + offMinutes;
    const onTotal = onHours * 60 + onMinutes;
    
    let diff = onTotal - offTotal;
    if (diff < 0) diff += 24 * 60; // Handle midnight crossing
    
    return diff;
  } catch {
    return 0;
  }
};

/**
 * Format minutes to HH:MM
 */
export const formatTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
};

/**
 * Export logbook as text summary
 */
export const exportLogbook = (): string => {
  const entries = loadLogbook().sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const totals = calculateTotals();
  const currency = checkCurrency();
  
  let text = 'LOGBOOK DE VUELO - SKYMAPPER\n';
  text += '='.repeat(80) + '\n\n';
  
  text += 'RESUMEN DE TOTALES:\n';
  text += `-${'- '.repeat(40)}\n`;
  text += `Tiempo total de vuelo: ${formatTime(totals.totalTime)}\n`;
  text += `Tiempo PIC: ${formatTime(totals.picTime)}\n`;
  text += `Tiempo SIC: ${formatTime(totals.sicTime)}\n`;
  text += `Tiempo dual: ${formatTime(totals.dualTime)}\n`;
  text += `Tiempo solo: ${formatTime(totals.soloTime)}\n`;
  text += `Tiempo nocturno: ${formatTime(totals.nightTime)}\n`;
  text += `Tiempo instrumental real: ${formatTime(totals.instrumentActual)}\n`;
  text += `Tiempo instrumental simulado: ${formatTime(totals.instrumentSimulated)}\n`;
  text += `Tiempo navegación: ${formatTime(totals.crossCountryTime)}\n`;
  text += `Aterrizajes día: ${totals.totalLandingsDay}\n`;
  text += `Aterrizajes noche: ${totals.totalLandingsNight}\n`;
  text += `Aproximaciones IFR: ${totals.totalApproaches}\n\n`;
  
  text += 'ESTADO DE HABILITACIÓN:\n';
  text += `- Pasajeros: ${currency.passengerCurrent ? '✅ HABILITADO' : '❌ NO HABILITADO'}`;
  if (currency.passengerExpiresOn) text += ` (vence: ${currency.passengerExpiresOn})`;
  text += '\n';
  text += `- Nocturno: ${currency.nightCurrent ? '✅ HABILITADO' : '❌ NO HABILITADO'}`;
  if (currency.nightExpiresOn) text += ` (vence: ${currency.nightExpiresOn})`;
  text += '\n';
  text += `- IFR: ${currency.ifrCurrent ? '✅ HABILITADO' : '❌ NO HABILITADO'}`;
  if (currency.ifrExpiresOn) text += ` (vence: ${currency.ifrExpiresOn})`;
  text += '\n\n';
  
  text += 'ENTRADAS DE VUELO:\n';
  text += '='.repeat(80) + '\n';
  
  entries.forEach((entry, idx) => {
    text += `\n${idx + 1}. ${entry.date} | ${entry.departure} → ${entry.arrival} | ${entry.aircraftReg}\n`;
    text += `   Tiempo: ${formatTime(entry.flightTime)}`;
    if (entry.blockOff && entry.blockOn) {
      text += ` (${entry.blockOff} - ${entry.blockOn})`;
    }
    text += '\n';
    
    const roles: string[] = [];
    if (entry.picTime > 0) roles.push(`PIC ${formatTime(entry.picTime)}`);
    if (entry.sicTime > 0) roles.push(`SIC ${formatTime(entry.sicTime)}`);
    if (entry.dualTime > 0) roles.push(`DUAL ${formatTime(entry.dualTime)}`);
    if (entry.soloTime > 0) roles.push(`SOLO ${formatTime(entry.soloTime)}`);
    if (roles.length > 0) text += `   Función: ${roles.join(', ')}\n`;
    
    if (entry.nightTime > 0) {
      text += `   Nocturno: ${formatTime(entry.nightTime)}\n`;
    }
    
    if (entry.instrumentActual > 0 || entry.instrumentSimulated > 0) {
      text += `   Instrumental: Real ${formatTime(entry.instrumentActual)}, Sim ${formatTime(entry.instrumentSimulated)}\n`;
    }
    
    if (entry.landingsDay > 0 || entry.landingsNight > 0) {
      text += `   Aterrizajes: Día ${entry.landingsDay}, Noche ${entry.landingsNight}\n`;
    }
    
    if (entry.isCrossCountry) {
      text += `   Navegación${entry.distance ? ` (${entry.distance} nm)` : ''}\n`;
    }
    
    if (entry.approaches && entry.approaches > 0) {
      text += `   Aproximaciones: ${entry.approaches}\n`;
    }
    
    if (entry.remarks) {
      text += `   Observaciones: ${entry.remarks}\n`;
    }
  });
  
  return text;
};

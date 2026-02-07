/**
 * Aircraft Weight & Balance Profiles
 * Real-world data for common GA aircraft
 * Units: kg, mm (from datum), liters
 */

export interface AircraftProfile {
  id: string;
  name: string;
  type: 'SEP' | 'MEP' | 'SET'; // Single Engine Piston, Multi Engine Piston, Single Engine Turboprop
  emptyWeight: number; // kg
  emptyCG: number; // mm from datum
  maxTakeoffWeight: number; // kg
  maxLandingWeight: number; // kg
  maxZeroFuelWeight?: number; // kg
  fuelCapacity: number; // liters
  fuelArm: number; // mm from datum
  fuelDensity: number; // kg/liter (0.72 for avgas, 0.8 for jet)
  stations: {
    name: string;
    arm: number; // mm from datum
    maxWeight: number; // kg
  }[];
  cgEnvelope: {
    weight: number; // kg
    fwdCG: number; // mm from datum
    aftCG: number; // mm from datum
  }[];
}

/**
 * Predefined aircraft profiles with real W&B data
 */
export const AIRCRAFT_PROFILES: AircraftProfile[] = [
  {
    id: 'c172s',
    name: 'Cessna 172S Skyhawk',
    type: 'SEP',
    emptyWeight: 767,
    emptyCG: 991,
    maxTakeoffWeight: 1111,
    maxLandingWeight: 1111,
    maxZeroFuelWeight: 1043,
    fuelCapacity: 212, // 56 gal usable
    fuelArm: 1219,
    fuelDensity: 0.72,
    stations: [
      { name: 'Piloto y copiloto', arm: 953, maxWeight: 182 },
      { name: 'Pasajeros traseros', arm: 1207, maxWeight: 182 },
      { name: 'Equipaje (zona 1)', arm: 1397, maxWeight: 54 },
      { name: 'Equipaje (zona 2)', arm: 1727, maxWeight: 54 },
    ],
    cgEnvelope: [
      { weight: 767, fwdCG: 910, aftCG: 1080 },
      { weight: 862, fwdCG: 910, aftCG: 1080 },
      { weight: 1111, fwdCG: 871, aftCG: 1080 },
    ],
  },
  {
    id: 'pa28-161',
    name: 'Piper PA-28-161 Warrior III',
    type: 'SEP',
    emptyWeight: 680,
    emptyCG: 2130,
    maxTakeoffWeight: 1111,
    maxLandingWeight: 1111,
    fuelCapacity: 189, // 50 gal usable
    fuelArm: 2439,
    fuelDensity: 0.72,
    stations: [
      { name: 'Asientos delanteros', arm: 2159, maxWeight: 182 },
      { name: 'Asientos traseros', arm: 2730, maxWeight: 182 },
      { name: 'Equipaje', arm: 3073, maxWeight: 91 },
    ],
    cgEnvelope: [
      { weight: 680, fwdCG: 2083, aftCG: 2438 },
      { weight: 950, fwdCG: 2083, aftCG: 2438 },
      { weight: 1111, fwdCG: 2032, aftCG: 2438 },
    ],
  },
  {
    id: 'c182t',
    name: 'Cessna 182T Skylane',
    type: 'SEP',
    emptyWeight: 877,
    emptyCG: 1016,
    maxTakeoffWeight: 1406,
    maxLandingWeight: 1406,
    maxZeroFuelWeight: 1315,
    fuelCapacity: 334, // 88 gal usable
    fuelArm: 1232,
    fuelDensity: 0.72,
    stations: [
      { name: 'Asientos delanteros', arm: 940, maxWeight: 227 },
      { name: 'Asientos traseros', arm: 1194, maxWeight: 227 },
      { name: 'Equipaje (zona 1)', arm: 1448, maxWeight: 91 },
      { name: 'Equipaje (zona 2)', arm: 1803, maxWeight: 91 },
    ],
    cgEnvelope: [
      { weight: 877, fwdCG: 940, aftCG: 1206 },
      { weight: 1111, fwdCG: 940, aftCG: 1206 },
      { weight: 1406, fwdCG: 940, aftCG: 1194 },
    ],
  },
  {
    id: 'dr400',
    name: 'Robin DR400-180 Regent',
    type: 'SEP',
    emptyWeight: 650,
    emptyCG: 2200,
    maxTakeoffWeight: 1100,
    maxLandingWeight: 1100,
    fuelCapacity: 170,
    fuelArm: 2400,
    fuelDensity: 0.72,
    stations: [
      { name: 'Piloto (delante)', arm: 1900, maxWeight: 100 },
      { name: 'Pasajero delantero (atrás)', arm: 2700, maxWeight: 100 },
      { name: 'Pasajeros traseros', arm: 3100, maxWeight: 180 },
      { name: 'Equipaje', arm: 3500, maxWeight: 40 },
    ],
    cgEnvelope: [
      { weight: 650, fwdCG: 2050, aftCG: 2500 },
      { weight: 900, fwdCG: 2050, aftCG: 2500 },
      { weight: 1100, fwdCG: 2000, aftCG: 2480 },
    ],
  },
  {
    id: 'da40',
    name: 'Diamond DA40 NG',
    type: 'SEP',
    emptyWeight: 850,
    emptyCG: 2250,
    maxTakeoffWeight: 1200,
    maxLandingWeight: 1200,
    maxZeroFuelWeight: 1095,
    fuelCapacity: 155,
    fuelArm: 2450,
    fuelDensity: 0.72,
    stations: [
      { name: 'Asientos delanteros', arm: 2200, maxWeight: 200 },
      { name: 'Asientos traseros', arm: 2800, maxWeight: 200 },
      { name: 'Equipaje', arm: 3300, maxWeight: 50 },
    ],
    cgEnvelope: [
      { weight: 850, fwdCG: 2100, aftCG: 2550 },
      { weight: 1050, fwdCG: 2100, aftCG: 2550 },
      { weight: 1200, fwdCG: 2050, aftCG: 2520 },
    ],
  },
  {
    id: 'pa34',
    name: 'Piper PA-34 Seneca',
    type: 'MEP',
    emptyWeight: 1280,
    emptyCG: 2438,
    maxTakeoffWeight: 2155,
    maxLandingWeight: 2155,
    maxZeroFuelWeight: 1950,
    fuelCapacity: 447, // 118 gal usable
    fuelArm: 2591,
    fuelDensity: 0.72,
    stations: [
      { name: 'Asientos delanteros', arm: 2159, maxWeight: 227 },
      { name: 'Asientos centrales', arm: 2730, maxWeight: 227 },
      { name: 'Asientos traseros', arm: 3327, maxWeight: 227 },
      { name: 'Equipaje delantero', arm: 2070, maxWeight: 45 },
      { name: 'Equipaje trasero', arm: 3835, maxWeight: 91 },
    ],
    cgEnvelope: [
      { weight: 1280, fwdCG: 2159, aftCG: 2743 },
      { weight: 1814, fwdCG: 2159, aftCG: 2743 },
      { weight: 2155, fwdCG: 2070, aftCG: 2743 },
    ],
  },
  {
    id: 'pc12',
    name: 'Pilatus PC-12 NG',
    type: 'SET',
    emptyWeight: 3000,
    emptyCG: 3500,
    maxTakeoffWeight: 4740,
    maxLandingWeight: 4590,
    maxZeroFuelWeight: 4100,
    fuelCapacity: 2600,
    fuelArm: 3800,
    fuelDensity: 0.80, // Jet fuel
    stations: [
      { name: 'Piloto y copiloto', arm: 2900, maxWeight: 200 },
      { name: 'Pasajeros (filas 1-2)', arm: 3700, maxWeight: 400 },
      { name: 'Pasajeros (filas 3-4)', arm: 4300, maxWeight: 400 },
      { name: 'Equipaje delantero', arm: 2500, maxWeight: 140 },
      { name: 'Equipaje trasero', arm: 5200, maxWeight: 300 },
    ],
    cgEnvelope: [
      { weight: 3000, fwdCG: 3200, aftCG: 4200 },
      { weight: 4000, fwdCG: 3200, aftCG: 4200 },
      { weight: 4740, fwdCG: 3100, aftCG: 4150 },
    ],
  },
];

/**
 * Create a custom empty aircraft profile template
 */
export const createEmptyProfile = (): AircraftProfile => ({
  id: `custom-${Date.now()}`,
  name: 'Avión personalizado',
  type: 'SEP',
  emptyWeight: 0,
  emptyCG: 0,
  maxTakeoffWeight: 0,
  maxLandingWeight: 0,
  fuelCapacity: 0,
  fuelArm: 0,
  fuelDensity: 0.72,
  stations: [],
  cgEnvelope: [],
});

/**
 * Get aircraft profile by ID
 */
export const getAircraftProfile = (id: string): AircraftProfile | undefined => {
  return AIRCRAFT_PROFILES.find((profile) => profile.id === id);
};

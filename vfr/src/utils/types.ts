import { JSX, ReactNode, TouchEvent } from "react";
import { LeafletMouseEvent } from "leaflet";

// Sidebar
export interface ScrollableContentProps {
  isWaypointsVisible: boolean;
  setIsWaypointsVisible: (visible: boolean) => void;
  waypoints: Waypoint[];
  onWaypointUpdate: (
    index: number,
    field: keyof Waypoint,
    value: Waypoint[keyof Waypoint]
  ) => void;
  isFullScreen: boolean;
  handleNumericInput: (value: string, callback: (num: number) => void) => void;
  onDeleteWaypoint: (absoluteIndex: number, isSpecial: boolean) => void;
  gal_liter: string;
}

export interface WaypointCardProps {
  waypoint: Waypoint;
  absoluteIndex: number;
  visibleIndex: number;
  onWaypointUpdate: (
    index: number,
    field: keyof Waypoint,
    value: Waypoint[keyof Waypoint]
  ) => void;
  handleNumericInput: (value: string, callback: (num: number) => void) => void;
  onDeleteWaypoint: (absoluteIndex: number, isSpecial: boolean) => void;
  gal_liter: string;
}
export interface UseSidebarVisibilityProps {
  setSidebarWidth: (width: number) => void;
  setIsMinimized: (isMinimized: boolean) => void;
  setIsFullScreen: (isFullScreen: boolean) => void;
  isMinimized: boolean;
  isFullScreen: boolean;
}

export interface ResizeHandleProps {
  onMouseDown: (e: React.MouseEvent) => void;
  onTouchStart: (e: TouchEvent) => void;
  isVisible: boolean;
}

export interface UseSidebarResizeProps {
  setSidebarWidth: (width: number) => void;
  minWidth: number;
  maxWidth: number;
}
// Bottom Sidebar
export interface BottomSidebarProps {
  waypoints: Waypoint[];
  storedWindData: WindDataArray | null;
  fuelConsumption: number;
  sidebarWidth: number;
  isMinimized: boolean;
  isFullScreen: boolean;
  onHeightChange?: (height: number) => void;
  legCalculations: Array<{
    distance: number;
    track: number;
    heading: number;
    groundSpeed: number;
    time: number;
    fuelBurn: number;
  }>;
  topSidebarHeight?: number;
  gal_liter: string;
  set_gal_liter: (g_l: string) => void;
}
export interface FlightResultsTableProps {
  results: JSX.Element[];
}

// Index
export interface Waypoint {
  position: [number, number];
  type: "waypoint" | "BOC" | "TOC" | "TOD" | "BOD";
  altitude: number;
  ias: number;
  visible: boolean;
  name?: string;
  altitudeChange?: number;
  rocRod?: number;
  iasClimbDescent?: number;
  originalAltitude?: number;
  normalDistance?: number;
  specialDistance?: number;
  specialFuel?: number;
  isTransition?: boolean;
  transitionWaypointIndex?: number;
  time?: number; // Optional time for the waypoint
  isManualName?: boolean;
}
export interface LegCalculation {
  distance: number;
  track: number;
  heading: number;
  groundSpeed: number;
  time: number;
  fuelBurn: number;
}

export interface WindAPIResponse {
  timestamp: Date;
  location: { lat: number; lon: number };
  windData: {
    altitude: number;
    pressure: number;
    speed: number;
    direction: number;
  }[];
}
export interface WindData {
  speed: number; // Wind speed in knots
  direction: number; // Wind direction in degrees
}

// Define WindDataArray as an array of WindData
export type WindDataArray = WindData[];

export interface LatLng {
  lat: number;
  lng: number;
}

export interface AnalyzeRouteCompliance  {
    waypointCompliance: Array<{
      index: number;
      compliant: boolean;
      adjustedAltitude: number | null;
      violation: {
        type: 'above_upper_limit' | 'below_lower_limit' | null;
        limit: number | null;
        airspaces: Airspace[];
      };
    }>;
    overallCompliant: boolean;
  }

export interface SidebarProps {
  fuelConsumption: number;
  setFuelConsumption: (consumption: number) => void;
  selectedDateTime: string;
  setSelectedDateTime: (datetime: string) => void;
  fetchWindData: () => Promise<void>;
  updateCalculations: () => void;
  waypoints: Waypoint[];
  results: ReactNode;
  onWaypointUpdate: (
    index: number,
    field: keyof Waypoint,
    value: Waypoint[keyof Waypoint]
  ) => void;
  onDeleteWaypoint: (absoluteIndex: number, isSpecial: boolean) => void;
  sidebarWidth: number;
  setSidebarWidth: (width: number) => void;
  isMinimized: boolean;
  setIsMinimized: (minimized: boolean) => void;
  isFullScreen: boolean;
  setIsFullScreen: (fullScreen: boolean) => void;
  onHeightChange?: (height: number) => void;
  bottomSidebarHeight?: number;
  gal_liter: string;
  set_gal_liter: (g_l: string) => void;
  // Airspace warning properties
  airspaces?: Airspace[];
  showWarnings?: boolean;
  setShowWarnings?: (enabled: boolean) => void;
  warningsInitialTab?: 'violations' | 'intersections' | 'stats';
  analyzeRouteWarnings?: (waypoints: Waypoint[]) => {
    warnings: Array<{
      waypointIndex: number;
      position: [number, number];
      altitude: number;
      isInRestrictedAirspace: boolean;
      hasViolation: boolean;
      warning: {
        type: 'above_upper_limit' | 'below_lower_limit' | 'in_restricted_airspace' | null;
        message: string;
        limit: number | null;
        suggestedAltitude: number | null;
        airspaces: Airspace[];
      };
    }>;
    hasViolations: boolean;
    hasRestrictedAirspaceIntersections: boolean;
    totalWarnings: number;
  };
  warningAlerts?: string[];
  clearWarningAlerts?: () => void;
  aviationLayers?: {
    airports: boolean;
    airspaces: boolean;
    navigation: boolean;
    obstacles: boolean;
    hotspots: boolean;
    reportingpoints: boolean;
  };
}

export interface MapControlsProps {
  mapType: string;
  setMapType: (type: string) => void;
  onDeleteLastWaypoint: () => void;
  onClearWaypoints: () => void;
  onAddSearchWaypoint: (lat: number, lon: number, name: string) => void;
}

export interface MobileMapComponentProps {
  onMapClick: (e: LeafletMouseEvent) => void;
  waypoints: Waypoint[];
  mapType: string;
  onWaypointUpdate: (
    index: number,
    field: keyof Waypoint,
    value: Waypoint[keyof Waypoint]
  ) => void;
  // Add these new props
  onDeleteLastWaypoint: () => void;
  onClearWaypoints: () => void;
  setMapType: (type: string) => void;
}

export interface WaypointInputProps {
  index: number;
  type: Waypoint["type"];
  altitude: number;
  ias: number;
  altitudeChange: number;
  rocRod: number;
  iasClimbDescent: number;
  onTypeChange: (value: Waypoint["type"]) => void;
  onAltitudeChange: (value: string) => void;
  onIasChange: (value: string) => void;
  onAltitudeChangeChange: (value: string) => void;
  onRocRodChange: (value: string) => void;
  onIasClimbDescentChange: (value: string) => void;
}

export interface MapEventHandlerProps {
  onMapClick: (e: LeafletMouseEvent) => void;
}

export interface MapComponentProps {
  onMapClick: (e: LeafletMouseEvent) => void;
  waypoints: Waypoint[];
  setWaypoints: (waypoints: Waypoint[]) => void;
  mapType: string;
}


// OpenAIP

// types/aviation.ts
// Updated GeoJSON-compatible geometry types
export type AviationGeometry =
  | PointGeometry
  | PolygonGeometry
  | MultiPolygonGeometry
  | LineStringGeometry
  | MultiLineStringGeometry;

export interface PointGeometry {
  type: "Point";
  coordinates: [number, number]; // [longitude, latitude]
}

export interface PolygonGeometry {
  type: "Polygon";
  coordinates: number[][][]; // Array of linear rings
}

export interface MultiPolygonGeometry {
  type: "MultiPolygon";
  coordinates: number[][][][]; // Array of polygons
}

export interface LineStringGeometry {
  type: "LineString";
  coordinates: number[][]; // Array of positions
}

export interface MultiLineStringGeometry {
  type: "MultiLineString";
  coordinates: number[][][]; // Array of line strings
}

// Updated data wrapper for GeoJSON FeatureCollection
export interface GeoJsonFeatureCollection<T> {
  type: "FeatureCollection";
  features: GeoJsonFeature<T>[];
}

export interface GeoJsonFeature<T> {
  type: "Feature";
  id?: string | number;
  properties: T;
  geometry: AviationGeometry;
}

// Updated data wrapper interfaces for the new structure
export interface AviationDataWrapper<T> {
  data: GeoJsonFeatureCollection<T>;
  lastUpdated: string;
  country: string;
  dataType: string;
  version: string;
}

export type AirportData = AviationDataWrapper<Airport>;
export type AirspaceData = AviationDataWrapper<Airspace>;
export type NavigationData = AviationDataWrapper<NavigationPoint>;
export type ObstacleData = AviationDataWrapper<Obstacle>;
export type HotspotData = AviationDataWrapper<Hotspot>;
export type ReportingPointData = AviationDataWrapper<ReportingPoint>;
export type AviationData = AirportData | AirspaceData | NavigationData | ObstacleData | HotspotData | ReportingPointData;
export type AviationProperties = Airport | Airspace | NavigationPoint | Obstacle | ReportingPoint;

export interface Elevation {
  value: number;
  unit: number;
  referenceDatum: number;
}

export interface ElevationGeoid {
  geoidHeight: number;
  hae: number;
}

export interface Frequency {
  value: string;
  unit: number;
  type?: number;
  name: string;
  primary: boolean;
  publicUse?: boolean;
  _id: string;
}

export interface OperatingHour {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  byNotam: boolean;
  sunrise: boolean;
  sunset: boolean;
  publicHolidaysExcluded: boolean;
}

export interface HoursOfOperation {
  operatingHours: OperatingHour[];
}

// Airport Types
export interface RunwaySurface {
  composition: number[];
  mainComposite: number;
  condition: number;
  pcn: string;
}

export interface RunwayDimension {
  length: { value: number; unit: number };
  width: { value: number; unit: number };
}

export interface DeclaredDistance {
  tora: { value: number; unit: number };
  lda: { value: number; unit: number };
}

export interface Runway {
  designator: string;
  trueHeading: number;
  alignedTrueNorth: boolean;
  operations: number;
  mainRunway: boolean;
  turnDirection: number;
  takeOffOnly: boolean;
  landingOnly: boolean;
  surface: RunwaySurface;
  dimension: RunwayDimension;
  declaredDistance: DeclaredDistance;
  pilotCtrlLighting: boolean;
  visualApproachAids: number[];
  _id: string;
}

export interface AirspaceFrequency {
  value: string;
  primary: boolean;
  unit: number;
  name: string;
  _id: string;
}
// Update your individual type interfaces to remove geometry (it's now in the GeoJSON structure)
export interface Airport {
  _id: string;
  name: string;
  icaoCode: string;
  iataCode?: string;
  type: number;
  trafficType: number[];
  magneticDeclination: number;
  country: string;
  elevation: Elevation;
  elevationGeoid: ElevationGeoid;
  geometry: AviationGeometry;
  ppr: boolean;
  private: boolean;
  skydiveActivity: boolean;
  winchOnly: boolean;
  frequencies: Frequency[];
  runways: Runway[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  __v?: number;
}

export interface Airspace {
  _id: string;
  createdBy: string;
  createdAt: string;
  updatedBy: string;
  updatedAt: string;
  name: string;
  dataIngestion: boolean;
  geometry: AviationGeometry;
  type: number;
  icaoClass: number;
  activity: number;
  onDemand: boolean;
  onRequest: boolean;
  byNotam: boolean;
  specialAgreement: boolean;
  requestCompliance: boolean;
  // Remove geometry from here - it's now in the GeoJSON feature structure
  country: string;
  upperLimit: Elevation;
  lowerLimit: Elevation;
  frequencies: AirspaceFrequency[];
  hoursOfOperation: HoursOfOperation;
  __v?: number;
  deletable: boolean;
}

export interface NavigationPoint {
  _id: string;
  name: string;
  identifier: string;
  type: number;
  country: string;
  channel: string;
  frequency: {
    value: string;
    unit: number;
  };
  geometry: AviationGeometry;
  elevation: Elevation;
  elevationGeoid: ElevationGeoid;
  magneticDeclination: number;
  alignedTrueNorth: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  __v?: number;
  hoursOfOperation: HoursOfOperation;
}

export interface Obstacle {
  _id: string;
  osmId: string;
  __v?: number;
  country: string;
  createdAt: string;
  createdBy: string;
  elevation: Elevation;
  elevationGeoid: ElevationGeoid;
  geometry: AviationGeometry;
  name: string;
  osmTags: {
    height: unknown;
    key: string;
    value: string;
    name: string;
    power: string;
    ref: string;
  };
  osmUpdatedAt: string;
  type: number;
  updatedAt: string;
  updatedBy: string;
}

export interface Hotspot {
  _id: string;
  name: string;
  type: number;
  country: string;
  geometry: AviationGeometry;
}

export interface ReportingPoint {
  _id: string;
  name: string;
  compulsory: boolean;
  country: string;
  airports: string[]; // Array of airport IDs this reporting point is linked to
  geometry: AviationGeometry;
  elevation: Elevation;
  elevationGeoid: ElevationGeoid;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  __v?: number;
}

// Data wrapper interfaces
export interface AviationDataWrapper<T> {
  data: GeoJsonFeatureCollection<T>;
  lastUpdated: string;
  country: string;
  dataType: string;
  version: string;
}

// Country Centers

export const COUNTRY_CENTERS: Record<string, [number, number]> = {
  es: [40.0, -4.0],    // Spain
  us: [39.8, -98.5],   // United States
  gb: [54.0, -2.0],    // United Kingdom
  mx: [23.0, -102.0],  // Mexico
  it: [42.8, 12.8],    // Italy
  fr: [46.0, 2.0],     // France
  de: [51.0, 9.0],     // Germany
  ca: [60.0, -95.0],   // Canada
  nl: [52.0, 5.0],     // Netherlands
  be: [50.8, 4.0],     // Belgium
  ch: [47.0, 8.0],     // Switzerland
  at: [47.3, 13.3],    // Austria
  pt: [39.5, -8.0],    // Portugal
};

export const getCountryCenter = (countryCode: string): [number, number] => {
  return COUNTRY_CENTERS[countryCode] || COUNTRY_CENTERS.es;
};

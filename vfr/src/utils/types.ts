import { JSX, ReactNode, TouchEvent } from 'react';
import { LeafletMouseEvent } from 'leaflet';



// Sidebar
export interface ScrollableContentProps {
  isWaypointsVisible: boolean;
  setIsWaypointsVisible: (visible: boolean) => void;
  waypoints: Waypoint[];
  onWaypointUpdate: (index: number, field: keyof Waypoint, value: Waypoint[keyof Waypoint]) => void;
  isFullScreen: boolean;
  handleNumericInput: (value: string, callback: (num: number) => void) => void;
}

export interface WaypointCardProps {
  waypoint: Waypoint;
  absoluteIndex: number;
  visibleIndex: number;
  onWaypointUpdate: (index: number, field: keyof Waypoint, value: Waypoint[keyof Waypoint]) => void;
  handleNumericInput: (value: string, callback: (num: number) => void) => void;
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
}
export interface FlightResultsTableProps {
  results: JSX.Element[];
}

// Index
export interface Waypoint {
  position: [number, number];
  type: 'waypoint' | 'BOC' | 'TOC' | 'TOD' | 'BOD';
  altitude: number;
  ias: number;
  originalAltitude?: number;
  altitudeChange: number;
  rocRod: number;
  iasClimbDescent: number;
  visible: boolean;
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

export interface SidebarProps {
  fuelConsumption: number;
  setFuelConsumption: (consumption: number) => void;
  selectedDateTime: string;
  setSelectedDateTime: (datetime: string) => void;
  fetchWindData: () => Promise<void>;
  updateCalculations: () => void;
  waypoints: Waypoint[];
  results: ReactNode;
  onWaypointUpdate: (index: number, field: keyof Waypoint, value: Waypoint[keyof Waypoint]) => void;
  sidebarWidth: number;
  setSidebarWidth: (width: number) => void;
  isMinimized: boolean;
  setIsMinimized: (minimized: boolean) => void;
  isFullScreen: boolean;
  setIsFullScreen: (fullScreen: boolean) => void;
}

export interface MapControlsProps {
  mapType: string;
  setMapType: (type: string) => void;
  onDeleteLastWaypoint: () => void;
  onClearWaypoints: () => void;
}

export interface WaypointInputProps {
  index: number;
  type: Waypoint['type'];
  altitude: number;
  ias: number;
  altitudeChange: number;
  rocRod: number;
  iasClimbDescent: number;
  onTypeChange: (value: Waypoint['type']) => void;
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


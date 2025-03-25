import { ReactNode } from 'react';
import { LeafletMouseEvent } from 'leaflet';

export interface Waypoint {
  position: [number, number];
  type: 'waypoint' | 'BOC' | 'TOC' | 'TOD' | 'BOD';
  altitude: number;
  ias: number;
  altitudeChange: number;
  rocRod: number;
  iasClimbDescent: number;
}

export interface WindData {
  speed: number;
  direction: number;
}
export interface LatLng {
  lat: number;
  lng: number;
}

export interface SidebarProps {
  sidebarActive: boolean;
  setSidebarActive: (active: boolean) => void;
  fuelConsumption: number;
  setFuelConsumption: (consumption: number) => void;
  selectedDateTime: string;
  setSelectedDateTime: (datetime: string) => void;
  fetchWindData: () => Promise<void>;
  updateCalculations: () => void;
  waypoints: Waypoint[];
  results: ReactNode;
}

export interface MapControlsProps {
  sidebarActive: boolean;
  setSidebarActive: (active: boolean) => void;
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

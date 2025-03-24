import React, { useState, useEffect, useCallback, JSX } from 'react';
import dynamic from 'next/dynamic';
import { LeafletMouseEvent } from 'leaflet';
import Sidebar from '../components/sidebar/Sidebar';
import MapControls from '../components/map/MapControls';
import WaypointInput from '../components/waypoints/WaypointInput';
import { Waypoint, WindData, MapEventHandlerProps } from '../utils/types';

// Dynamically import MapContainer and other leaflet components
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false });
const Polyline = dynamic(() => import('react-leaflet').then(mod => mod.Polyline), { ssr: false });
import { useMap } from 'react-leaflet';

// Utility functions
const toRad = (deg: number): number => deg * (Math.PI / 180);
const toDeg = (rad: number): number => rad * (180 / Math.PI);

const IAStoTAS = (ias: number, fl: number): number => {
  const altitude = fl * 100;
  const temperatureLapseRate = 0.0019812;
  const seaLevelTemp = 288.15;
  let tempAtAltitude = seaLevelTemp - temperatureLapseRate * altitude;
  if (tempAtAltitude <= 0) tempAtAltitude = 1;
  return ias * Math.sqrt(seaLevelTemp / tempAtAltitude);
};

interface LatLng {
  lat: number;
  lng: number;
}

const getDistance = (wp1: LatLng, wp2: LatLng): number => {
  const R = 3440;
  const dLat = toRad(wp2.lat - wp1.lat);
  const dLon = toRad(wp2.lng - wp1.lng);
  const lat1 = toRad(wp1.lat);
  const lat2 = toRad(wp2.lat);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
           Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const getBearing = (wp1: LatLng, wp2: LatLng): number => {
  const dLon = toRad(wp2.lng - wp1.lng);
  const lat1 = toRad(wp1.lat);
  const lat2 = toRad(wp2.lat);
  const y = Math.sin(dLon) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
};

const getHeading = (track: number, tas: number, windDir: number, windSpeed: number): number => {
  const windAngle = toRad(track - windDir);
  const crosswind = windSpeed * Math.sin(windAngle);
  const headwind = windSpeed * Math.cos(windAngle);
  const groundSpeed = tas - headwind;
  return (track + toDeg(Math.atan2(crosswind, groundSpeed)) + 360) % 360;
};

const getGroundSpeed = (track: number, tas: number, windDir: number, windSpeed: number): number => {
  const windAngle = toRad(track - windDir);
  return tas - windSpeed * Math.cos(windAngle);
};

// Map event handler component
const MapEventHandler: React.FC<MapEventHandlerProps> = ({ onMapClick }) => {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    map.on('click', onMapClick);
    return () => {
      map.off('click', onMapClick);
    };
  }, [map, onMapClick]);

  return null;
};

export default function Home() {
  const [waypoints, setWaypoints] = useState<Waypoint[]>([]);
  const [storedWindData, setStoredWindData] = useState<WindData | null>(null);
  const [sidebarActive, setSidebarActive] = useState<boolean>(false);
  const [fuelConsumption, setFuelConsumption] = useState<number>(8);
  const [selectedDateTime, setSelectedDateTime] = useState<string>('');
  const [mapType, setMapType] = useState<string>('street');
  const [results, setResults] = useState<JSX.Element[]>([]);
  const defaultTAS = 100;

  // Map click handler
  const handleMapClick = useCallback((e: LeafletMouseEvent) => {
    const { lat, lng } = e.latlng;
    const newWaypoint: Waypoint = {
      position: [lat, lng],
      type: 'waypoint',
      altitude: 5000,
      ias: defaultTAS,
      altitudeChange: 0,
      rocRod: 500,
      iasClimbDescent: defaultTAS
    };
    setWaypoints(prev => [...prev, newWaypoint]);
  }, []);

  // Delete last waypoint
  const handleDeleteLastWaypoint = () => {
    setWaypoints(prev => prev.slice(0, -1));
  };

  // Clear all waypoints
  const handleClearWaypoints = () => {
    setWaypoints([]);
  };

  // Fetch wind data
  const fetchWindData = async () => {
    if (waypoints.length < 2) {
      console.warn("⚠️ Not enough waypoints to fetch wind data.");
      return;
    }

    // Calculate midpoint
    const sumLat = waypoints.reduce((sum, wp) => sum + wp.position[0], 0);
    const sumLon = waypoints.reduce((sum, wp) => sum + wp.position[1], 0);
    const midLat = sumLat / waypoints.length;
    const midLon = sumLon / waypoints.length;

    try {
      const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${midLat}&longitude=${midLon}&hourly=windspeed_180m,winddirection_180m`);
      const data = await response.json();

      setStoredWindData({
        speed: data.hourly.windspeed_180m[0],
        direction: data.hourly.winddirection_180m[0]
      });
    } catch (error) {
      console.error('Error fetching wind data:', error);
      setStoredWindData({ speed: 0, direction: 0 });
    }
  };

  // Update calculations
  const updateCalculations = useCallback(() => {
    if (waypoints.length < 2) return;

    const newResults = [];
    for (let i = 0; i < waypoints.length - 1; i++) {
      const wp = waypoints[i];
      const nextWp = waypoints[i + 1];

      const distance = getDistance(
        { lat: wp.position[0], lng: wp.position[1] },
        { lat: nextWp.position[0], lng: nextWp.position[1] }
      );

      const track = getBearing(
        { lat: wp.position[0], lng: wp.position[1] },
        { lat: nextWp.position[0], lng: nextWp.position[1] }
      );

      const windInfo = storedWindData || { speed: 0, direction: 0 };
      const tas = IAStoTAS(wp.ias, wp.altitude / 100);
      const heading = getHeading(track, tas, windInfo.direction, windInfo.speed);
      const gs = getGroundSpeed(track, tas, windInfo.direction, windInfo.speed);
      const time = (distance / gs) * 60;
      const fuelBurn = (time / 60) * fuelConsumption;

      newResults.push(
        <tr key={i}>
          <td>WP{i + 1}</td>
          <td>{distance.toFixed(1)}</td>
          <td>{track.toFixed(0)}</td>
          <td>{heading.toFixed(0)}</td>
          <td>{gs.toFixed(0)}</td>
          <td>{time.toFixed(1)}</td>
          <td>{tas.toFixed(0)}</td>
          <td>{fuelBurn.toFixed(1)}</td>
          <td>💨 {windInfo.speed.toFixed(1)} kt @ {windInfo.direction.toFixed(0)}°</td>
        </tr>
      );
    }

    setResults(newResults);
  }, [waypoints, storedWindData, fuelConsumption]);

  // Update calculations when waypoints or wind data changes
  useEffect(() => {
    updateCalculations();
  }, [waypoints, storedWindData, updateCalculations]);

  return (
    <div id="container">
      <Sidebar
        sidebarActive={sidebarActive}
        setSidebarActive={setSidebarActive}
        fuelConsumption={fuelConsumption}
        setFuelConsumption={setFuelConsumption}
        selectedDateTime={selectedDateTime}
        setSelectedDateTime={setSelectedDateTime}
        fetchWindData={fetchWindData}
        updateCalculations={updateCalculations}
        waypoints={waypoints}
        results={results}
      />

      <MapContainer
        center={[40.4168, -3.7038]}
        zoom={6}
        style={{ height: "100%", width: "100%" }}
      >
        <MapEventHandler onMapClick={handleMapClick} />

        <TileLayer
          url={
            mapType === 'street' ? 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png' :
            mapType === 'sat' ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}' :
            mapType === 'hybrid' ? 'http://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}' :
            'http://{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}'
          }
          attribution='&copy; OpenStreetMap contributors'
          subdomains={mapType === 'hybrid' || mapType === 'terrain' ? ['mt0', 'mt1', 'mt2', 'mt3'] : undefined}
        />

        {waypoints.map((waypoint, index) => (
          <Marker
            key={index}
            position={waypoint.position}
            draggable={true}
            eventHandlers={{
              dragend: (e) => {
                const updatedWaypoints = [...waypoints];
                updatedWaypoints[index] = {
                  ...waypoint,
                  position: [e.target._latlng.lat, e.target._latlng.lng]
                };
                setWaypoints(updatedWaypoints);
              }
            }}
          />
        ))}

        {waypoints.length > 1 && (
          <Polyline
            positions={waypoints.map(wp => wp.position)}
            color="blue"
          />
        )}

        <MapControls
          sidebarActive={sidebarActive}
          setSidebarActive={setSidebarActive}
          mapType={mapType}
          setMapType={setMapType}
          onDeleteLastWaypoint={handleDeleteLastWaypoint}
          onClearWaypoints={handleClearWaypoints}
        />
      </MapContainer>

      {waypoints.map((waypoint, index) => (
        <WaypointInput
          key={index}
          index={index + 1}
          type={waypoint.type}
          altitude={waypoint.altitude}
          ias={waypoint.ias}
          altitudeChange={waypoint.altitudeChange}
          rocRod={waypoint.rocRod}
          iasClimbDescent={waypoint.iasClimbDescent}
          onTypeChange={(value) => {
            const updatedWaypoints = [...waypoints];
            updatedWaypoints[index] = { ...waypoint, type: value };
            setWaypoints(updatedWaypoints);
          }}
          onAltitudeChange={(value) => {
            const updatedWaypoints = [...waypoints];
            updatedWaypoints[index] = { ...waypoint, altitude: parseFloat(value) || 0 };
            setWaypoints(updatedWaypoints);
          }}
          onIasChange={(value) => {
            const updatedWaypoints = [...waypoints];
            updatedWaypoints[index] = { ...waypoint, ias: parseFloat(value) || defaultTAS };
            setWaypoints(updatedWaypoints);
          }}
          onAltitudeChangeChange={(value) => {
            const updatedWaypoints = [...waypoints];
            updatedWaypoints[index] = { ...waypoint, altitudeChange: parseFloat(value) || 0 };
            setWaypoints(updatedWaypoints);
          }}
          onRocRodChange={(value) => {
            const updatedWaypoints = [...waypoints];
            updatedWaypoints[index] = { ...waypoint, rocRod: parseFloat(value) || 500 };
            setWaypoints(updatedWaypoints);
          }}
          onIasClimbDescentChange={(value) => {
            const updatedWaypoints = [...waypoints];
            updatedWaypoints[index] = { ...waypoint, iasClimbDescent: parseFloat(value) || defaultTAS };
            setWaypoints(updatedWaypoints);
          }}
        />
      ))}
    </div>
  );
};

import React from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  useMapEvents,
} from "react-leaflet";
import { Waypoint } from "../../utils/types";
import   { LeafletMouseEvent } from "leaflet";
import "leaflet/dist/leaflet.css";

type MapComponentProps = {
  onMapClick: (e: LeafletMouseEvent) => void;
  waypoints: Waypoint[];
  setWaypoints: React.Dispatch<React.SetStateAction<Waypoint[]>>;
  mapType: string;
};

const MapComponent: React.FC<MapComponentProps> = ({
  onMapClick,
  waypoints,
  setWaypoints,
  mapType,
}) => {
  // const mapRef = useRef<L.Map | null>(null);

  const validMapTypes = ["street", "sat", "hybrid", "terrain"];
  const mapTypeUrl = validMapTypes.includes(mapType) ? mapType : "sat";

  // Force Leaflet to recalculate the map layout
  // useEffect(() => {
  //   if (mapRef.current) {
  //     mapRef.current.invalidateSize();
  //   }
  // }, [mapRef]);

  return (
    <div className="relative w-full h-full">
      <MapContainer
        center={[51.505, -0.09]}
        zoom={13}
        style={{ height: "100%", width: "100%" }}
        // whenReady={(mapInstance) => {
        //   mapRef.current = mapInstance; // Directly assign the map instance
        // }}
      >
        {/* Handle map click events */}
        <MapEvents
          onMapClick={onMapClick}
          waypoints={waypoints}
          setWaypoints={setWaypoints}
        />

        <TileLayer
          url={
            mapTypeUrl === "street"
              ? "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              : mapTypeUrl === "sat"
              ? "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              : mapTypeUrl === "hybrid"
              ? "https://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}"
              : mapTypeUrl === "terrain"
              ? "https://{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}"
              : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          }
          attribution="&copy; OpenStreetMap contributors"
          subdomains={
            mapTypeUrl === "hybrid" || mapTypeUrl === "terrain"
              ? ["mt0", "mt1", "mt2", "mt3"]
              : ["a", "b", "c"]
          }
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
                  position: [e.target.getLatLng().lat, e.target.getLatLng().lng],
                };
                setWaypoints(updatedWaypoints);
              },
            }}
          />
        ))}

        {waypoints.length > 1 && (
          <Polyline
            positions={waypoints.map((wp) => wp.position)}
            color="blue"
          />
        )}
      </MapContainer>
    </div>
  );
};

// Component to handle map click events
const MapEvents: React.FC<{
  onMapClick: (e: LeafletMouseEvent) => void;
  waypoints: Waypoint[];
  setWaypoints: React.Dispatch<React.SetStateAction<Waypoint[]>>;
}> = ({ onMapClick }) => {
  useMapEvents({
    click: onMapClick,
  });

  return null;
};

export default MapComponent;

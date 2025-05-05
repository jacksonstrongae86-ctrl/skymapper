import React from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  useMapEvents,
} from "react-leaflet";
import { Waypoint } from "../../utils/types";
import L, { LeafletMouseEvent } from "leaflet";
import "leaflet/dist/leaflet.css";

const DefaultIcon = L.icon({
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41], // Size of the icon
  iconAnchor: [12, 41], // Anchor point of the icon
  popupAnchor: [1, -34], // Popup anchor point
  shadowSize: [41, 41], // Size of the shadow
});

// Set the default icon globally
L.Marker.prototype.options.icon = DefaultIcon;

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
        center={[40.4167, -3.7033]}
        zoom={10}
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
              ? "http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
              : mapTypeUrl === "sat"
              ? "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              : mapTypeUrl === "hybrid"
              ? "https://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}"
              : mapTypeUrl === "terrain"
              ? "https://{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}"
              : "http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
          }
          attribution="&copy; OpenStreetMap contributors"
          subdomains={["mt0", "mt1", "mt2", "mt3"]}
        />

        {waypoints
          .filter((wp) => wp.visible !== false)
          .map((waypoint, index) => (
            <Marker
              key={index}
              position={waypoint.position}
              draggable={true}
              eventHandlers={{
                dragend: (e) => {
                  const updatedWaypoints = [...waypoints];
                  updatedWaypoints[index] = {
                    ...waypoint,
                    position: [
                      e.target.getLatLng().lat,
                      e.target.getLatLng().lng,
                    ],
                  };
                  setWaypoints(updatedWaypoints);
                },
              }}
            />
          ))}

        {waypoints.filter((wp) => wp.visible !== false).length > 1 && (
          <Polyline
            positions={waypoints
              .filter((wp) => wp.visible !== false)
              .map((wp) => wp.position)}
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

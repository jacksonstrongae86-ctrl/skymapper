import React from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  useMapEvents,
} from "react-leaflet";
import { Waypoint } from "../../utils/types"; // Ajusta la ruta si es necesario
import L, { LeafletMouseEvent } from "leaflet";
import WaypointInput from "../waypoints/WaypointInput";

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
  const defaultTAS = 100;
  const validMapTypes = ["street", "sat", "hybrid", "terrain"];
  const mapTypeUrl = validMapTypes.includes(mapType) ? mapType : "sat"; // Establecer un valor por defecto si no es válido
  console.log("type", mapTypeUrl);
  return (
    <div className="">
    <MapContainer
      center={[51.505, -0.09]}
      zoom={13}
      style={{ height: "100vh", width: "100%" }}
      crs={L.CRS.EPSG3857}
    >
      {/* Aquí se maneja el clic en el mapa para agregar waypoints */}
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
                position: [e.target._latlng.lat, e.target._latlng.lng],
              };
              setWaypoints(updatedWaypoints);
            },
          }}
        />
      ))}

      {waypoints.length > 1 && (
        <Polyline positions={waypoints.map((wp) => wp.position)} color="blue" />
      )}
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
            updatedWaypoints[index] = {
              ...waypoint,
              altitude: parseFloat(value) || 0,
            };
            setWaypoints(updatedWaypoints);
          }}
          onIasChange={(value) => {
            const updatedWaypoints = [...waypoints];
            updatedWaypoints[index] = {
              ...waypoint,
              ias: parseFloat(value) || defaultTAS,
            };
            setWaypoints(updatedWaypoints);
          }}
          onAltitudeChangeChange={(value) => {
            const updatedWaypoints = [...waypoints];
            updatedWaypoints[index] = {
              ...waypoint,
              altitudeChange: parseFloat(value) || 0,
            };
            setWaypoints(updatedWaypoints);
          }}
          onRocRodChange={(value) => {
            const updatedWaypoints = [...waypoints];
            updatedWaypoints[index] = {
              ...waypoint,
              rocRod: parseFloat(value) || 500,
            };
            setWaypoints(updatedWaypoints);
          }}
          onIasClimbDescentChange={(value) => {
            const updatedWaypoints = [...waypoints];
            updatedWaypoints[index] = {
              ...waypoint,
              iasClimbDescent: parseFloat(value) || defaultTAS,
            };
            setWaypoints(updatedWaypoints);
          }}
        />
      ))}
    </MapContainer>
    </div>
  );
};

// Componente para manejar los eventos de clic
const MapEvents: React.FC<{
  onMapClick: (e: LeafletMouseEvent) => void;
  waypoints: Waypoint[];
  setWaypoints: React.Dispatch<React.SetStateAction<Waypoint[]>>;
}> = ({ onMapClick }) => {
  useMapEvents({
    click: onMapClick, // Usamos el evento de clic para añadir waypoints
  });

  return null; // Este componente no renderiza nada, solo maneja eventos
};

export default MapComponent;

import React from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  useMapEvents,
} from "react-leaflet";
import { Waypoint } from "../../../utils/types";
import { LeafletMouseEvent } from "leaflet";
import "leaflet/dist/leaflet.css";
import { useMapHandlers } from "../../../hooks/index/useMapHandlers";
import { createWaypointIcon } from "../../../components/desktop/map/createWaypointIcon";
import { useTheme } from "@/src/utils/ThemeContext";


type MapComponentProps = {
  onMapClick: (e: LeafletMouseEvent) => void;
  waypoints: Waypoint[];
  mapType: string;
  onWaypointUpdate: (index: number, field: keyof Waypoint, value: Waypoint[keyof Waypoint]) => void;
};

const MapComponent: React.FC<MapComponentProps> = ({
  onMapClick,
  waypoints,
  mapType,
  onWaypointUpdate,
}) => {
  const { theme } = useTheme();
  const validMapTypes = ["street", "sat", "hybrid", "terrain"];
  const mapTypeUrl = validMapTypes.includes(mapType) ? mapType : "sat";
  const { onWaypointDrag } = useMapHandlers(onWaypointUpdate);
  return (
    <div className="absolute w-full h-full">
      <MapContainer
        center={[40.4167, -3.7033]}
        zoom={10}
        style={{ height: "100%", width: "100%" }}
      >
        <MapEvents onMapClick={onMapClick} />

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
          .map((waypoint, absoluteIndex) => {
            return (
              <Marker
                key={absoluteIndex}
                position={waypoint.position}
                draggable={true}
                icon={createWaypointIcon(waypoint.type, theme)}
                eventHandlers={{
                  dragend: (e) => {
                    const newPosition: [number, number] = [
                      e.target.getLatLng().lat,
                      e.target.getLatLng().lng,
                    ];
                    onWaypointDrag(absoluteIndex, newPosition);
                  },
                }}
              />
            );
          })}

        {waypoints.filter((wp) => wp.visible !== false).length > 1 && (
          <Polyline
            positions={waypoints
              .filter((wp) => wp.visible !== false)
              .map((wp) => wp.position)}
            color="black"
          />
        )}
      </MapContainer>
    </div>
  );
};

// Component to handle map click events
const MapEvents: React.FC<{
  onMapClick: (e: LeafletMouseEvent) => void;
}> = ({ onMapClick }) => {
  useMapEvents({
    click: onMapClick,
  });

  return null;
};

export default MapComponent;

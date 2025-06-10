import React, { useRef, useEffect } from "react";
import { Map } from "leaflet";
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
import { useMapHandlers } from "../../../hooksMobile/index/useMapHandlers";
import { createWaypointIcon } from "../../../components/mobile/map/createWaypointIcon";
import { useTheme } from "@/src/utils/ThemeContext";
import { useState } from "react";
import { X } from "lucide-react";

type MapComponentProps = {
  onMapClick: (e: LeafletMouseEvent) => void;
  waypoints: Waypoint[];
  mapType: string;
  onWaypointUpdate: (
    index: number,
    field: keyof Waypoint,
    value: Waypoint[keyof Waypoint]
  ) => void;
};

const MapComponent: React.FC<MapComponentProps> = ({
  onMapClick,
  waypoints,
  mapType,
  onWaypointUpdate,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { theme } = useTheme();
  const validMapTypes = ["street", "sat", "hybrid", "terrain"];
  const mapTypeUrl = validMapTypes.includes(mapType) ? mapType : "sat";
  const { onWaypointDrag } = useMapHandlers(onWaypointUpdate);
  const mapRef = useRef<Map | null>(null);
  useEffect(() => {
    if (mapRef.current) {
      setTimeout(() => {
        mapRef.current?.invalidateSize(); // seguro
      }, 300);
    }
  }, [isExpanded]);

  return (
    <div
      className={`
    ${
      isExpanded
        ? "fixed top-0 left-0 w-full h-full z-50"
        : "relative h-full z-30"
    }
    transition-all duration-300 ease-in-out
  `}
      onClick={() => {
        if (!isExpanded) setIsExpanded(true);
      }}
    >
      <MapContainer
        ref={mapRef}
        center={[40.4167, -3.7033]}
        zoom={10}
        style={{ height: "100%", width: "100%" }}
        zoomControl={isExpanded}
        className="z[9999]"
      >
        <MapEvents onMapClick={onMapClick} isExpanded={isExpanded} />

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
      {isExpanded && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsExpanded(false);
          }}
          className="fixed top-4 right-4 z-[1000] bg-black/60 text-white px-1 py-1 rounded-full"
        >
          <X size={20} />
        </button>
      )}
    </div>
  );
};

// Component to handle map click events
const MapEvents: React.FC<{
  onMapClick: (e: LeafletMouseEvent) => void;
  isExpanded: boolean;
}> = ({ onMapClick, isExpanded }) => {
  useMapEvents({
    click: (e) => {
      if (isExpanded) {
        onMapClick(e);
      }
    },
  });

  return null;
};

export default MapComponent;

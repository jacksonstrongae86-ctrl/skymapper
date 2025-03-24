"use client";
import { useState } from "react";
import { MapContainer, TileLayer, useMapEvents, Marker, Polyline } from "react-leaflet";
import { LatLngExpression } from "leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const DefaultIcon = L.icon({
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

export default function MapComponent() {
  const [waypoints, setWaypoints] = useState<LatLngExpression[]>([]);

  function MapClickHandler() {
    useMapEvents({
      click(e) {
        setWaypoints((prev) => [...prev, [e.latlng.lat, e.latlng.lng]]);
      },
    });
    return null;
  }

  return (
    <div className="relative w-full h-screen z-10">
      <MapContainer
        center={[40.463667, -3.74922] as LatLngExpression}
        zoom={7}
        className="h-full w-full"
        style={{ height: "100vh", width: "100%" }} 
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <MapClickHandler />
        {waypoints.map((pos, idx) => (
          <Marker key={idx} position={pos} />
        ))}
        {waypoints.length > 1 && <Polyline positions={waypoints} pathOptions={{ color: "blue" }} />}
      </MapContainer>
    </div>
  );
}

import { useState, useCallback } from "react";
import { LeafletMouseEvent } from "leaflet";
import { Waypoint } from "../utils/types";
import { calculateTransitionWaypoint } from "../utils/logic";

export function useWaypoints(defaultTAS: number = 100) {
  const [waypoints, setWaypoints] = useState<Waypoint[]>([]);

  const removeTransitionWaypointAfterIndex = (arr: Waypoint[], idx: number) => {
    if (arr.length > idx + 1 && arr[idx + 1].visible === false) {
      return [...arr.slice(0, idx + 1), ...arr.slice(idx + 2)];
    }
    return arr;
  };

  const handleWaypointUpdate = useCallback(
    (index: number, field: keyof Waypoint, value: Waypoint[keyof Waypoint]) => {
      setWaypoints((prev) => {
        const updated = [...prev];
        // Actualizamos waypoint seleccionado
        updated[index] = { ...updated[index], [field]: value };

        // Función para eliminar waypoint transición invisible justo después de índice dado
        const clean = removeTransitionWaypointAfterIndex(updated, index);

        // Cuando cambiamos el tipo a normal, eliminar waypoint transición invisible justo después
        if (field === "type") {
          if (value === "waypoint") {
            return clean;
          }
          if (["BOC", "TOC", "TOD", "BOD"].includes(value as string)) {
            // Insertar nuevo waypoint de transición
            const currentWaypoint = clean[index];
            const nextWaypoint = clean[index + 1];
            if (!nextWaypoint) return clean;

            const transitionWaypoint = calculateTransitionWaypoint(
              currentWaypoint,
              nextWaypoint,
              value as "BOC" | "TOC" | "TOD" | "BOD"
            );

            if (!transitionWaypoint) return clean;

            // Insertamos waypoint transición después del índice correcto
            const newWaypoints = [
              ...clean.slice(0, index + 1),
              transitionWaypoint,
              ...clean.slice(index + 1),
            ];
            return newWaypoints;
          }
        }

        // Para cambios en parámetros que afectan la transición
        if (
          ["altitudeChange", "rocRod", "iasClimbDescent"].includes(field) &&
          ["BOC", "TOC", "TOD", "BOD"].includes(updated[index].type)
        ) {
          // Waypoint origen con los datos para el cálculo
          const originWaypoint = updated[index];

          // Waypoint siguiente (el destino)
          const nextWaypoint = updated[index + 1];
          if (!nextWaypoint) return updated;

          // Eliminar waypoint transición anterior justo después del index
          const cleaned = removeTransitionWaypointAfterIndex(updated, index);

          // Recalcular el waypoint de transición con las variables del originWaypoint y nextWaypoint
          const newTransitionWaypoint = calculateTransitionWaypoint(
            originWaypoint,
            nextWaypoint,
            originWaypoint.type as "BOC" | "TOC" | "TOD" | "BOD"
          );

          if (!newTransitionWaypoint) return cleaned;

          // Insertar waypoint transición justo después del origin waypoint
          const finalWaypoints = [
            ...cleaned.slice(0, index + 1),
            newTransitionWaypoint,
            ...cleaned.slice(index + 1),
          ];

          return finalWaypoints;
        }

        // Para todos los demás casos devolvemos actualizado
        return updated;
      });
    },
    []
  );

  const handleMapClick = useCallback(
    (e: LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      setWaypoints((prev) => [
        ...prev,
        {
          position: [lat, lng],
          type: "waypoint",
          altitude: 5000,
          ias: defaultTAS,
          altitudeChange: 100,
          rocRod: 500,
          iasClimbDescent: defaultTAS,
          visible: true,
        },
      ]);
    },
    [defaultTAS]
  );

  const handleDeleteLastWaypoint = () => {
    setWaypoints((prev) => prev.slice(0, -1));
  };

  const handleClearWaypoints = () => {
    setWaypoints([]);
  };

  return {
    waypoints,
    setWaypoints,
    handleWaypointUpdate,
    handleMapClick,
    handleDeleteLastWaypoint,
    handleClearWaypoints,
  };
}

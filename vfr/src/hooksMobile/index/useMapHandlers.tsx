import { useCallback } from 'react';
import { Waypoint } from '@/src/utils/types';

interface MapHandlers {
  onWaypointDrag: (index: number, newPosition: [number, number]) => void;
}

export const useMapHandlers = (
  handleWaypointUpdate: (index: number, field: keyof Waypoint, value: Waypoint[keyof Waypoint]) => void
): MapHandlers => {
  const onWaypointDrag = useCallback((index: number, newPosition: [number, number]) => {
    handleWaypointUpdate(index, 'position', newPosition);
  }, [handleWaypointUpdate]);

  return {
    onWaypointDrag
  };
};

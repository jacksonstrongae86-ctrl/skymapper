import { useEffect, useCallback } from 'react';
import { useMap } from 'react-leaflet';
import { MapEventHandlerProps } from '../../../utils/types';

const MapEventHandlerComponent = ({ onMapClick }: MapEventHandlerProps) => {
  const map = useMap();

  const handleMapClick = useCallback((event: L.LeafletMouseEvent) => {
    onMapClick(event);
  }, [onMapClick]);

  useEffect(() => {
    if (!map) return;

    map.on('click', handleMapClick);
    return () => {
      map.off('click', handleMapClick);
    };
  }, [map, handleMapClick]);

  return null;
};

export default MapEventHandlerComponent;

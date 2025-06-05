import { useState } from 'react';

export function useUIState() {
  const [sidebarWidth, setSidebarWidth] = useState(256);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [bottomHeight, setBottomHeight] = useState(25);
  const [mapType, setMapType] = useState<string>("street");

  return {
    sidebarWidth,
    setSidebarWidth,
    isMinimized,
    setIsMinimized,
    isFullScreen,
    setIsFullScreen,
    bottomHeight,
    setBottomHeight,
    mapType,
    setMapType
  };
}

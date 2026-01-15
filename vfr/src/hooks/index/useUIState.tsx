import { useState } from "react";

export function useUIState() {
  const [sidebarWidth, setSidebarWidth] = useState(472);
  const [sidebarHeight, setSidebarHeight] = useState(25);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [bottomHeight, setBottomHeight] = useState(25);
  const [mapType, setMapType] = useState<string>("street");
  const [isSidebarResizing, setIsSidebarResizing] = useState(false);

  return {
    sidebarWidth,
    setSidebarWidth,
    sidebarHeight,
    setSidebarHeight,
    isMinimized,
    setIsMinimized,
    isFullScreen,
    setIsFullScreen,
    bottomHeight,
    setBottomHeight,
    mapType,
    setMapType,
    isSidebarResizing,
    setIsSidebarResizing,
  };
}

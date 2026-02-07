import { useState } from "react";
import { useIsMobile } from "../useIsMobile";

/**
 * Responsive UI state hook
 * Uses different default sidebar widths for mobile vs desktop
 */
export function useUIState() {
  const isMobile = useIsMobile();
  const defaultSidebarWidth = isMobile ? 300 : 472;
  
  const [sidebarWidth, setSidebarWidth] = useState(defaultSidebarWidth);
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

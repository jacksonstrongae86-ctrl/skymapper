
import { UseSidebarVisibilityProps } from "@/src/utils/types";

export const useSidebarVisibility = ({
  setSidebarWidth,
  setIsMinimized,
  setIsFullScreen,
  isMinimized,
  isFullScreen,
}: UseSidebarVisibilityProps) => {
  const handleMinimizeMaximize = () => {
    if (isMinimized) {
      setSidebarWidth(300);
    } else {
      setSidebarWidth(48);
    }
    setIsMinimized(!isMinimized);
  };

  const handleFullScreen = () => {
    if (isFullScreen) {
      setSidebarWidth(300);
    } else {
      setSidebarWidth(window.innerWidth);
    }
    setIsFullScreen(!isFullScreen);
  };

  return {
    handleMinimizeMaximize,
    handleFullScreen,
  };
};

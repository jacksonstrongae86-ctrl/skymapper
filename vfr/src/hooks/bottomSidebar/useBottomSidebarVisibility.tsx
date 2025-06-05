import { useState } from 'react';

interface UseBottomSidebarVisibilityProps {
  onHeightChange?: (height: number) => void;
  defaultHeight?: number;
}

export const useBottomSidebarVisibility = ({
  onHeightChange,
  defaultHeight = 25,
}: UseBottomSidebarVisibilityProps) => {
  const [isBottomMinimized, setIsBottomMinimized] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);

  const handleMinimizeMaximize = () => {
    setIsBottomMinimized(prev => !prev);
    onHeightChange?.(isBottomMinimized ? defaultHeight : 7);
  };

  const handleFullScreen = () => {
    setIsFullScreen(prev => !prev);
    onHeightChange?.(isFullScreen ? defaultHeight : 90);
  };

  return {
    isBottomMinimized,
    isFullScreen,
    handleMinimizeMaximize,
    handleFullScreen,
  };
};

import { useState, useCallback, useRef } from 'react';

interface UseBottomSidebarResizeProps {
  onHeightChange?: (height: number) => void;
  minHeight?: number;
  maxHeight?: number;
}

export const useBottomSidebarResize = ({
  onHeightChange,
  minHeight = 10,
  maxHeight = 75,
}: UseBottomSidebarResizeProps) => {
  const [height, setHeight] = useState(25);
  const isResizingRef = useRef(false);

  const startResize = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();

    isResizingRef.current = true;

    const handleMove = (event: MouseEvent | TouchEvent) => {
      if (!isResizingRef.current) return;

      // Get clientY from either mouse or touch event
      const clientY = 'touches' in event
        ? event.touches[0].clientY
        : event.clientY;

      // Calculate height percentage from bottom of screen
      const windowHeight = window.innerHeight;
      const fromBottom = windowHeight - clientY;
      const percentage = Math.max(0, Math.min(100, (fromBottom / windowHeight) * 100));

      // Clamp between min and max heights
      const newHeight = Math.min(maxHeight, Math.max(minHeight, percentage));

      setHeight(newHeight);
      onHeightChange?.(newHeight);
    };

    const handleEnd = () => {
      isResizingRef.current = false;

      // Clean up all event listeners
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', handleEnd);
      document.removeEventListener('touchmove', handleMove);
      document.removeEventListener('touchend', handleEnd);
    };

    // Add event listeners for both mouse and touch
    document.addEventListener('mousemove', handleMove, { passive: false });
    document.addEventListener('mouseup', handleEnd);
    document.addEventListener('touchmove', handleMove, { passive: false });
    document.addEventListener('touchend', handleEnd);
  }, [onHeightChange, minHeight, maxHeight]);

  return {
    height,
    startResize,
  };
};

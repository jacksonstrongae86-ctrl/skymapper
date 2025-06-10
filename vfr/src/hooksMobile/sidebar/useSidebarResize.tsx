import { useState, useCallback, useRef } from 'react';

interface UseSidebarResizeProps {
  onHeightChange?: (height: number) => void;
  minHeight?: number;
  maxHeight?: number;
  bottomSidebarHeight?: number; // Height of bottom sidebar to avoid overlap
}

export const useSidebarResize = ({
  onHeightChange,
  minHeight = 10,
  maxHeight = 75,
  bottomSidebarHeight = 0, // Default to 0 if not provided
}: UseSidebarResizeProps) => {
  const [height, setHeight] = useState(25);
  const isResizingRef = useRef(false);

  const handleMouseDown = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();

    isResizingRef.current = true;

    const handleMove = (event: MouseEvent | TouchEvent) => {
      if (!isResizingRef.current) return;

      // Get clientY from either mouse or touch event
      const clientY = 'touches' in event
        ? event.touches[0].clientY
        : event.clientY;

      // Calculate height percentage from TOP of screen
      const windowHeight = window.innerHeight;
      const fromTop = clientY;
      const percentage = Math.max(0, Math.min(100, (fromTop / windowHeight) * 100));

      // Calculate effective max height considering bottom sidebar
      // Leave some space (5%) between sidebars to prevent overlap
      const effectiveMaxHeight = Math.min(maxHeight, 100 - bottomSidebarHeight - 5);

      // Clamp between min and effective max heights
      const newHeight = Math.min(effectiveMaxHeight, Math.max(minHeight, percentage));

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
  }, [onHeightChange, minHeight, maxHeight, bottomSidebarHeight]);

  return {
    height,
    handleMouseDown,
  };
};

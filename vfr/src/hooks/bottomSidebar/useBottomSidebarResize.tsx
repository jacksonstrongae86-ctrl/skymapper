import { useState, useCallback, useRef } from 'react';

interface UseBottomSidebarResizeProps {
  onHeightChange?: (height: number) => void;
  minHeight?: number;
  maxHeight?: number;
  topSidebarHeight?: number; // Height of top sidebar to avoid overlap
}

export const useBottomSidebarResize = ({
  onHeightChange,
  minHeight = 10,
  maxHeight = 75,
  topSidebarHeight = 0, // Default to 0 if not provided
}: UseBottomSidebarResizeProps) => {
  const [height, setHeight] = useState(25);
  const [isResizing, setIsResizing] = useState(false);
  const rafRef = useRef<number | null>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setIsResizing(true);

    const handleMove = (event: MouseEvent | TouchEvent) => {
      // Get clientY from either mouse or touch event
      const clientY = 'touches' in event
        ? event.touches[0].clientY
        : event.clientY;

      // Use requestAnimationFrame for smoother updates
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }

      rafRef.current = requestAnimationFrame(() => {
        // Calculate height percentage from BOTTOM of screen
        const windowHeight = window.innerHeight;
        const fromBottom = windowHeight - clientY;
        const percentage = Math.max(0, Math.min(100, (fromBottom / windowHeight) * 100));

        // Calculate effective max height considering top sidebar
        // Leave some space (5%) between sidebars to prevent overlap
        const effectiveMaxHeight = Math.min(maxHeight, 100 - topSidebarHeight - 5);

        // Clamp between min and effective max heights
        const newHeight = Math.min(effectiveMaxHeight, Math.max(minHeight, percentage));

        setHeight(newHeight);
        onHeightChange?.(newHeight);
      });
    };

    const handleEnd = () => {
      setIsResizing(false);

      // Cancel any pending animation frame
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }

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
  }, [onHeightChange, minHeight, maxHeight, topSidebarHeight]);

  return {
    height,
    handleMouseDown,
    isResizing,
  };
};

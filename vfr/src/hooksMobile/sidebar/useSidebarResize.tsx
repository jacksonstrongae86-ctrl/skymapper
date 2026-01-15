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
  const [isResizing, setIsResizing] = useState(false);
  const startYRef = useRef(0);
  const startHeightRef = useRef(25);
  const rafRef = useRef<number | null>(null);
  const hasDraggedRef = useRef(false);
  const startTimeRef = useRef(0);

  const calculateNewHeight = useCallback((clientY: number) => {
    const windowHeight = window.innerHeight;
    const fromTop = clientY;
    const percentage = Math.max(0, Math.min(100, (fromTop / windowHeight) * 100));

    // Calculate effective max height considering bottom sidebar
    // Leave some space (5%) between sidebars to prevent overlap
    const effectiveMaxHeight = Math.min(maxHeight, 100 - bottomSidebarHeight - 5);

    // Clamp between min and effective max heights
    return Math.min(effectiveMaxHeight, Math.max(minHeight, percentage));
  }, [minHeight, maxHeight, bottomSidebarHeight]);

  const toggleHeight = useCallback(() => {
    const effectiveMaxHeight = Math.min(maxHeight, 100 - bottomSidebarHeight - 5);
    // Only close if very close to max (within 85% of max height), otherwise always open
    const isNearMax = height >= (effectiveMaxHeight * 0.85);
    const targetHeight = isNearMax ? minHeight : effectiveMaxHeight;
    setHeight(targetHeight);
    onHeightChange?.(targetHeight);
  }, [height, minHeight, maxHeight, bottomSidebarHeight, onHeightChange]);

  const handleStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setIsResizing(true);
    hasDraggedRef.current = false;

    // Get initial Y position from either mouse or touch event
    const clientY = 'touches' in e
      ? e.touches[0].clientY
      : e.clientY;

    startYRef.current = clientY;
    startHeightRef.current = height;

    const handleMove = (event: MouseEvent | TouchEvent) => {
      // Get clientY from either mouse or touch event
      const currentClientY = 'touches' in event
        ? event.touches[0].clientY
        : event.clientY;

      // Check if user has dragged significantly (more than 5 pixels)
      const dragDistance = Math.abs(currentClientY - startYRef.current);
      if (dragDistance > 5) {
        hasDraggedRef.current = true;
      }

      // Use requestAnimationFrame for smoother, more responsive updates
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }

      rafRef.current = requestAnimationFrame(() => {
        const newHeight = calculateNewHeight(currentClientY);
        setHeight(newHeight);
        onHeightChange?.(newHeight);
      });
    };

    const handleEnd = () => {
      setIsResizing(false);

      // If it was a click (not a drag), toggle between min and max
      if (!hasDraggedRef.current) {
        const effectiveMaxHeight = Math.min(maxHeight, 100 - bottomSidebarHeight - 5);
        // Only close if very close to max (within 85% of max height), otherwise always open
        const isNearMax = height >= (effectiveMaxHeight * 0.85);
        const targetHeight = isNearMax ? minHeight : effectiveMaxHeight;
        setHeight(targetHeight);
        onHeightChange?.(targetHeight);
      }

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
      document.removeEventListener('touchcancel', handleEnd);
    };

    // Add event listeners for both mouse and touch
    document.addEventListener('mousemove', handleMove, { passive: false });
    document.addEventListener('mouseup', handleEnd);
    document.addEventListener('touchmove', handleMove, { passive: false });
    document.addEventListener('touchend', handleEnd);
    document.addEventListener('touchcancel', handleEnd);
  }, [height, calculateNewHeight, onHeightChange, minHeight, maxHeight, bottomSidebarHeight]);

  // Handle touch-specific events
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    handleStart(e);
  }, [handleStart]);

  // Handle mouse-specific events
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    handleStart(e);
  }, [handleStart]);

  // Enhanced drag handler for mobile compatibility
  const handleDragStart = useCallback((e: React.DragEvent) => {
    // Prevent default drag behavior
    e.preventDefault();
    e.stopPropagation();

    // For mobile browsers that support drag events
    const img = new Image();
    img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=';
    e.dataTransfer.setDragImage(img, 0, 0);

    setIsResizing(true);
    hasDraggedRef.current = false;
    startYRef.current = e.clientY;
    startHeightRef.current = height;
  }, [height]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isResizing) return;

    // Check if user has dragged significantly
    const dragDistance = Math.abs(e.clientY - startYRef.current);
    if (dragDistance > 5) {
      hasDraggedRef.current = true;
    }

    // Use requestAnimationFrame for smoother updates
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }

    rafRef.current = requestAnimationFrame(() => {
      const newHeight = calculateNewHeight(e.clientY);
      setHeight(newHeight);
      onHeightChange?.(newHeight);
    });
  }, [isResizing, calculateNewHeight, onHeightChange]);

  const handleDragEnd = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(false);

    // If it was a click (not a drag), toggle between min and max
    if (!hasDraggedRef.current) {
      const effectiveMaxHeight = Math.min(maxHeight, 100 - bottomSidebarHeight - 5);
      // Only close if very close to max (within 85% of max height), otherwise always open
      const isNearMax = height >= (effectiveMaxHeight * 0.85);
      const targetHeight = isNearMax ? minHeight : effectiveMaxHeight;
      setHeight(targetHeight);
      onHeightChange?.(targetHeight);
    }

    // Cancel any pending animation frame
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, [height, minHeight, maxHeight, bottomSidebarHeight, onHeightChange]);

  // Unified handler that works for all interaction types
  const getResizeHandlers = useCallback(() => ({
    // Mouse events
    onMouseDown: handleMouseDown,

    // Touch events
    onTouchStart: handleTouchStart,

    // Drag events (for additional mobile support)
    draggable: true,
    onDragStart: handleDragStart,
    onDragOver: handleDragOver,
    onDragEnd: handleDragEnd,

    // Additional mobile-friendly properties
    style: {
      touchAction: 'none', // Prevent default touch behaviors
      userSelect: 'none',  // Prevent text selection
      WebkitUserSelect: 'none',
      MozUserSelect: 'none',
      msUserSelect: 'none',
    } as React.CSSProperties,
  }), [handleMouseDown, handleTouchStart, handleDragStart, handleDragOver, handleDragEnd]);

  return {
    height,
    handleMouseDown,
    handleTouchStart,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    getResizeHandlers, // Convenience method to get all handlers at once
    isResizing,
  };
};

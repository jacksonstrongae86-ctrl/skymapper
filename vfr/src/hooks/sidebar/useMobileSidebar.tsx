import { useState, useEffect, useCallback } from 'react';

interface UseMobileSidebarProps {
  defaultHeight?: number;
  minHeight?: number;
  maxHeight?: number;
  onHeightChange?: (height: number) => void;
}

export const useMobileSidebar = ({
  defaultHeight = 40,
  minHeight = 7,
  maxHeight = 90,
  onHeightChange,
}: UseMobileSidebarProps = {}) => {
  const [height, setHeight] = useState(defaultHeight);
  const [isDragging, setIsDragging] = useState(false);

  const handleTouchStart = () => {
    setIsDragging(true);
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleTouchEnd);
  };

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isDragging) return;

    const touch = e.touches[0];
    const windowHeight = window.innerHeight;
    const newHeight = ((windowHeight - touch.clientY) / windowHeight) * 100;

    if (newHeight >= minHeight && newHeight <= maxHeight) {
      setHeight(newHeight);
      onHeightChange?.(newHeight);
    }
  }, [isDragging, minHeight, maxHeight, onHeightChange]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
    document.removeEventListener('touchmove', handleTouchMove);
    document.removeEventListener('touchend', handleTouchEnd);
  }, [handleTouchMove]);

  useEffect(() => {
    return () => {
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging, handleTouchMove, handleTouchEnd]);

  return {
    height,
    setHeight,
    handleTouchStart,
  };
};

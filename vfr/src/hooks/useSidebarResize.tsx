import { useState, useEffect, TouchEvent} from 'react';
import { UseSidebarResizeProps } from '../utils/types';

export const useSidebarResize = ({
  setSidebarWidth,
  minWidth = 256,
  maxWidth = window.innerWidth * 0.8,
}: UseSidebarResizeProps) => {
  const [isResizing, setIsResizing] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startWidth, setStartWidth] = useState(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsResizing(true);
    setStartX(e.clientX);
    setStartWidth(e.currentTarget.parentElement?.offsetWidth || 0);
  };

  const handleTouchStart = (e: TouchEvent) => {
    setIsResizing(true);
    setStartX(e.touches[0].clientX);
    setStartWidth(e.currentTarget.parentElement?.offsetWidth || 0);
  };

  const handleResize = (clientX: number) => {
    if (!isResizing) return;

    const diff = clientX - startX;
    const newWidth = Math.min(maxWidth, Math.max(minWidth, startWidth + diff));
    setSidebarWidth(newWidth);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => handleResize(e.clientX);
    const handleTouchMove = (e: TouchEvent) => handleResize(e.touches[0].clientX);

    const handleEnd = () => setIsResizing(false);

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleEnd);
    document.addEventListener('touchmove', handleTouchMove as unknown as EventListener);
      document.addEventListener('touchend', handleEnd);
      document.body.style.cursor = 'ew-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleEnd);
      document.removeEventListener('touchmove', handleTouchMove as unknown as EventListener);
      document.removeEventListener('touchend', handleEnd);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing, startX, startWidth, setSidebarWidth, maxWidth, minWidth]);

  return {
    handleMouseDown,
    handleTouchStart,
    isResizing,
  };
};

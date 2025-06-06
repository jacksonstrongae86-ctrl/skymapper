import { useState, useEffect } from 'react';

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
  const [isResizing, setIsResizing] = useState(false);
  const [height, setHeight] = useState(25);

  const handleMouseDown = () => {
    setIsResizing(true);
  };

  const handleMouseUp = () => {
    setIsResizing(false);
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleMouseMove = (e: MouseEvent) => {
      if (isResizing) {
        const windowHeight = window.innerHeight;
        const fromBottom = windowHeight - e.clientY;
        const percentage = (fromBottom / windowHeight) * 100;
        const newHeight = Math.min(maxHeight, Math.max(minHeight, percentage));

        setHeight(newHeight);
        onHeightChange?.(newHeight);
      }
    };

    if (isResizing) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing, onHeightChange, minHeight, maxHeight]);

  return { height, setHeight, handleMouseDown, isResizing };
};

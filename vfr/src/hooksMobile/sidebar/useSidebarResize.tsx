import { useState, useEffect } from "react";

interface UseBottomSidebarResizeProps {
  onHeightChange?: (height: number) => void;
  minHeight?: number;
  maxHeight?: number;
}

export const useSidebarResize = ({
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

        // Calculate height percentage from TOP of screen (inverted from bottom sidebar)
        const windowHeight = window.innerHeight;
        const fromTop = e.clientY; // Distance from top of screen
        const percentage = Math.max(
          0,
          Math.min(100, (fromTop / windowHeight) * 100)
        );

        // Clamp between min and max heights
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

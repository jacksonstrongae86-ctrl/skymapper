import { useState, useRef, useCallback, TouchEvent } from "react";
import { UseSidebarResizeProps } from "@/src/utils/types";

export const useSidebarResize = ({
  setSidebarWidth,
  minWidth = 256,
  maxWidth,
}: UseSidebarResizeProps) => {
  const [isResizing, setIsResizing] = useState(false);
  const startXRef = useRef(0);
  const startWidthRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const effectiveMaxWidth = typeof window !== "undefined" ? maxWidth ?? window.innerWidth * 0.8 : 800;

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsResizing(true);
    startXRef.current = e.clientX;
    startWidthRef.current = e.currentTarget.parentElement?.offsetWidth || 0;

    const handleMove = (event: MouseEvent) => {
      const diff = event.clientX - startXRef.current;

      // Use requestAnimationFrame for smoother updates
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }

      rafRef.current = requestAnimationFrame(() => {
        const newWidth = Math.min(
          effectiveMaxWidth,
          Math.max(minWidth, startWidthRef.current + diff)
        );
        setSidebarWidth(newWidth);
      });
    };

    const handleEnd = () => {
      setIsResizing(false);

      // Cancel any pending animation frame
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }

      // Clean up event listeners
      document.removeEventListener("mousemove", handleMove);
      document.removeEventListener("mouseup", handleEnd);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };

    // Add event listeners
    document.addEventListener("mousemove", handleMove);
    document.addEventListener("mouseup", handleEnd);
    document.body.style.cursor = "ew-resize";
    document.body.style.userSelect = "none";
  }, [setSidebarWidth, effectiveMaxWidth, minWidth]);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    setIsResizing(true);
    startXRef.current = e.touches[0].clientX;
    startWidthRef.current = e.currentTarget.parentElement?.offsetWidth || 0;

    const handleMove = (event: TouchEvent) => {
      const diff = event.touches[0].clientX - startXRef.current;

      // Use requestAnimationFrame for smoother updates
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }

      rafRef.current = requestAnimationFrame(() => {
        const newWidth = Math.min(
          effectiveMaxWidth,
          Math.max(minWidth, startWidthRef.current + diff)
        );
        setSidebarWidth(newWidth);
      });
    };

    const handleEnd = () => {
      setIsResizing(false);

      // Cancel any pending animation frame
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }

      // Clean up event listeners
      document.removeEventListener("touchmove", handleMove as unknown as EventListener);
      document.removeEventListener("touchend", handleEnd);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };

    // Add event listeners
    document.addEventListener("touchmove", handleMove as unknown as EventListener, { passive: false });
    document.addEventListener("touchend", handleEnd);
    document.body.style.cursor = "ew-resize";
    document.body.style.userSelect = "none";
  }, [setSidebarWidth, effectiveMaxWidth, minWidth]);

  return {
    handleMouseDown,
    handleTouchStart,
    isResizing,
  };
};

import React from "react";
import { useTheme } from "@/src/utils/ThemeContext";

interface ResizeHandleProps {
  resizeHandlers: {
    onMouseDown: (e: React.MouseEvent) => void;
    onTouchStart: (e: React.TouchEvent) => void;
    draggable: boolean;
    onDragStart: (e: React.DragEvent) => void;
    onDragOver: (e: React.DragEvent) => void;
    onDragEnd: (e: React.DragEvent) => void;
    style: React.CSSProperties;
  };
  isResizing?: boolean;
}

export const ResizeHandle: React.FC<ResizeHandleProps> = ({
  resizeHandlers,
  isResizing = false,
}) => {
  const { theme } = useTheme();

  return (
    <div
      className={`
        absolute bottom-1.5 left-0 right-0
        h-6 z-50
        group cursor-ns-resize
        flex items-center justify-center
        ${isResizing ? 'opacity-80' : ''}
        hover:opacity-100
        transition-opacity duration-150
      `}
      {...resizeHandlers}
    >
      {/* Visual indicator */}
      <div className="absolute flex gap-1 mt-4">
        <div
          className={`
            w-20 h-1.5 rounded-full
            ${`button-gradient-${theme}`}
            transition-all duration-150
            ${isResizing ? 'scale-110 shadow-md' : ''}
            group-hover:scale-105
          `}
        />
      </div>

      {/* Invisible touch target for better mobile interaction */}
      <div
        className="absolute inset-0 -top-2 -bottom-2"
        aria-label="Resize sidebar"
      />
    </div>
  );
};

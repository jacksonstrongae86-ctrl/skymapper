import React from 'react';
import { useTheme } from '@/src/utils/ThemeContext';

interface ResizeHandleProps {
  handleMouseDown: (e: React.MouseEvent | React.TouchEvent) => void;
}

export const ResizeHandle: React.FC<ResizeHandleProps> = ({
  handleMouseDown,
}) => {
  const { theme } = useTheme();

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault(); // Prevent scrolling while dragging
    handleMouseDown(e);
  };

  return (
    <div
      className={`
        absolute -top-3 left-0 right-0
        h-6 z-50
        group cursor-ns-resize
        flex items-center justify-center
        touch-none select-none
      `}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    >
      <div className="absolute flex gap-1 mt-4">
        <div
          className={`
            w-20 h-1.5 rounded-full
            ${`button-gradient-${theme}`}
            transition-transform duration-200
            group-hover:scale-105
          `}
        />
      </div>
    </div>
  );
};

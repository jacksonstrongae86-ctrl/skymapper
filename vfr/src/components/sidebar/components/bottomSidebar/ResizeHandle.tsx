import React from 'react';
import { useTheme } from '@/src/utils/ThemeContext';

interface ResizeHandleProps {
  handleMouseDown: () => void;
}

export const ResizeHandle: React.FC<ResizeHandleProps> = ({
  handleMouseDown,
}) => {
  const { theme } = useTheme();

  return (
    <div
      className={`
        absolute -top-3 left-0 right-0
        h-6 z-50
        group cursor-ns-resize
        flex items-center justify-center
      `}
      onMouseDown={handleMouseDown}
    >
      <div className="absolute flex gap-1">
        <div className={`w-20 h-1.5 rounded-full ${`button-gradient-${theme}`}`} />
      </div>
    </div>
  );
};

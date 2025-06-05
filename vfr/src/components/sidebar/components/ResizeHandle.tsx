import React from 'react';
import { ResizeHandleProps } from '@/src/utils/types';
import { useTheme } from '@/src/utils/ThemeContext';

export const ResizeHandle: React.FC<ResizeHandleProps> = ({
  onMouseDown,
  onTouchStart,
  isVisible,
}) => {
  const { theme } = useTheme();
  if (!isVisible) return null;
  return (
    <div
      className="absolute top-0 right-0 h-full w-4 flex items-center justify-center touch-none select-none cursor-ew-resize z-50"
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
    >
      {/* Fondo más ancho para mejorar la usabilidad táctil */}
      <div className="absolute h-full w-full bg-transparent active:bg-[var(--button-active)] transition-colors duration-200 rounded-md" />

      {/* Línea visible permanente */}
      {/* <div className="h-full w-[2px] bg-[var(--button-bg)]" /> */}

      {/* Drag dots (siempre visibles) */}
      <div className="absolute flex flex-col items-center gap-1">
        <div className={`w-1.5 h-20.5 rounded-full button-gradient-${theme}`} />
      </div>
    </div>
  );
};

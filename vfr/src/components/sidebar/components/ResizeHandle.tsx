import React from 'react';
import { ResizeHandleProps } from '@/src/utils/types';

export const ResizeHandle: React.FC<ResizeHandleProps> = ({
  onMouseDown,
  onTouchStart,
  isVisible,
}) => {
  if (!isVisible) return null;

  return (
    <div
      className="absolute top-0 right-0 h-full w-4 flex items-center justify-center touch-none select-none cursor-ew-resize z-50"
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
    >
      {/* Fondo más ancho para mejorar la usabilidad táctil */}
      <div className="absolute h-full w-full bg-transparent hover:bg-[var(--button-hover)] active:bg-[var(--button-active)] transition-colors duration-200 rounded-md" />

      {/* Línea visible permanente */}
      <div className="h-full w-[2px] bg-[var(--button-bg)]" />

      {/* Drag dots (siempre visibles) */}
      <div className="absolute flex flex-col items-center gap-1">
        <div className="w-1.5 h-1.5 rounded-full bg-[var(--button-text)]" />
        <div className="w-1.5 h-1.5 rounded-full bg-[var(--button-text)]" />
        <div className="w-1.5 h-1.5 rounded-full bg-[var(--button-text)]" />
      </div>
    </div>
  );
};

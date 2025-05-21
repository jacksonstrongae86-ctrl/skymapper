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
      className="absolute top-0 right-0 h-full w-3 group cursor-ew-resize
        flex items-center justify-center touch-none select-none"
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
    >
      {/* Visual handle indicator */}
      <div className="h-full w-[2px] bg-[var(--button-bg)] group-hover:bg-[var(--button-hover)]
        group-active:bg-[var(--button-active)] transition-colors duration-200"
      />

      {/* Drag dots */}
      <div className="absolute flex flex-col gap-1.5 opacity-0
        group-hover:opacity-100 group-active:opacity-100 transition-opacity duration-200">
        <div className="w-1 h-1 rounded-full bg-[var(--button-text)]" />
        <div className="w-1 h-1 rounded-full bg-[var(--button-text)]" />
        <div className="w-1 h-1 rounded-full bg-[var(--button-text)]" />
      </div>

      {/* Touch indicator for mobile */}
      <div className="absolute inset-x-0 h-full bg-[var(--button-hover)] opacity-0
        group-active:opacity-20 transition-opacity duration-200 md:hidden" />
    </div>
  );
};

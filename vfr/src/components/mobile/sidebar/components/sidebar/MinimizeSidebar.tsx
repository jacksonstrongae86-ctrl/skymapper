import React from 'react';
import { useTheme } from '@/src/utils/ThemeContext';

interface MinimizedSidebarProps {
  handleMinimizeMaximize: () => void;
  fetchWindData: () => void;
}

export const MinimizedSidebar: React.FC<MinimizedSidebarProps> = ({
  handleMinimizeMaximize,
  fetchWindData,
}) => {
  const { theme } = useTheme();

  return (
    <div className={`
      flex flex-col h-full w-12
      ${`sidebar-gradient-${theme}`}
      border-r border-[var(--sidebar-border)]
    `}>
      <div className={`
        p-2 mb-2
        ${`gradient-${theme}`}
        border-b border-[var(--sidebar-border)]
      `}>
        <button
          className={`
            w-8 h-8 rounded-lg
            ${`button-gradient-${theme}`}
            text-[var(--button-text)]
            hover:opacity-90
            transition-all duration-200
            flex items-center justify-center
          `}
          onClick={handleMinimizeMaximize}
          title="Maximize"
        >
          +
        </button>
      </div>
      <div className="flex flex-col items-center gap-4 p-2">
        <button
          className={`
            w-8 h-8 rounded-lg
            ${`button-gradient-${theme}`}
            text-[var(--button-text)]
            hover:opacity-90
            transition-all duration-200
            flex items-center justify-center
          `}
          title="Wind Data"
          onClick={fetchWindData}
        >
          💨
        </button>
      </div>
    </div>
  );
};

import React from 'react';

interface MinimizedSidebarProps {
  handleMinimizeMaximize: () => void;
  fetchWindData: () => void;
}

export const MinimizedSidebar: React.FC<MinimizedSidebarProps> = ({
  handleMinimizeMaximize,
  fetchWindData,
}) => {
  return (
    <div className="flex flex-col h-full w-12 bg-[var(--background)] border-r border-[var(--sidebar-border)]">
      <div className="p-2 mb-2 border-b border-[var(--sidebar-border)]">
        <button
          className="w-8 h-8 rounded-full bg-yellow-500 hover:bg-yellow-400 flex items-center justify-center text-gray-800 text-xs"
          onClick={handleMinimizeMaximize}
          title="Maximize"
        >
          +
        </button>
      </div>
      <div className="flex flex-col items-center gap-4 p-2">
        <button
          className="w-8 h-8 rounded-lg bg-[var(--button-bg)] hover:bg-[var(--button-hover)] flex items-center justify-center text-white"
          title="Wind Data"
          onClick={fetchWindData}
        >
          💨
        </button>
      </div>
    </div>
  );
};

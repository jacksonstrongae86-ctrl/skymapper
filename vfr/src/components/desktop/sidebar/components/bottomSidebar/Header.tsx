import React from 'react';
import { useTheme } from '@/src/utils/ThemeContext';
import { Waypoint } from '@/src/utils/types';
import { Maximize2, Minimize2, Printer } from 'lucide-react';

interface HeaderProps {
  waypoints: Waypoint[];
  isBottomMinimized: boolean;
  isFullScreen: boolean;
  handleFullScreen: () => void;

  handlePrint: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  waypoints,
  isBottomMinimized,
  isFullScreen,
  handleFullScreen,
  handlePrint,
}) => {
  const { theme } = useTheme();

  const ButtonClass = `
    w-8 h-8 rounded-lg
    ${`button-gradient-${theme}`}
    text-[var(--button-text)]
    hover:opacity-90
    transition-all duration-200
    flex items-center justify-center
    shadow-md
  `;

  return (
    <div className="px-4 pt-4">
      <div className={`
        ${`gradient-${theme}`}
        border border-[var(--sidebar-border)]
        rounded-t-xl
        p-4
        w-full
      `}>
        <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-[var(--sidebar-text)]">
            Flight Results
          </h2>
          <span className={`
            px-3 py-1 rounded-full text-sm font-medium
            ${`button-gradient-${theme}`}
            text-[var(--button-text)]
          `}>
            {waypoints.length > 1 ? waypoints.length - 1 : 0} legs
          </span>
        </div>

        <div className="flex items-center gap-2">
            {!isBottomMinimized && (
              <button
                className={ButtonClass}
                onClick={handleFullScreen}
                title={isFullScreen ? "Exit Full Screen" : "Full Screen"}
              >
                {isFullScreen ? (
                  <Minimize2 size={16} />
                ) : (
                  <Maximize2 size={16} />
                )}
              </button>
            )}
            {!isBottomMinimized && (
              <button
                className={ButtonClass}
                onClick={handlePrint}
                title="Print Results"
              >
                <Printer size={16} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

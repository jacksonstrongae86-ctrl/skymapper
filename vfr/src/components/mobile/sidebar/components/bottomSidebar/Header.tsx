import React from "react";
import { useTheme } from "@/src/utils/ThemeContext";
import { Waypoint } from "@/src/utils/types";
import { Printer } from "lucide-react";
import HeaderTrivia from "../../../../shared/HeaderTrivia";

interface HeaderProps {
  waypoints: Waypoint[];
  isFullScreen: boolean;
  handleFullScreen: () => void;
  handlePrint: () => void;
}

export const Header: React.FC<HeaderProps> = ({ waypoints, handlePrint }) => {
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
    <div className="px-2 pt-4">
      <div
        className={`
        ${`gradient-${theme}`}
        border border-[var(--sidebar-border)]
        rounded-t-xl
        p-4
        w-full
      `}
      >
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2 flex-1">
            <h2 className="text-lg font-bold text-[var(--sidebar-text)] whitespace-nowrap">
              Flight Results
            </h2>
            <span
              className={`
            px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap
            ${`button-gradient-${theme}`}
            text-[var(--button-text)]
          `}
            >
              {waypoints.length > 1 ? waypoints.length - 1 : 0} legs
            </span>
            {/* Trivia Section - inline for mobile */}
            <div className="flex-1 min-w-0 ml-2 max-w-[250px]">
              <HeaderTrivia
                autoRotate={true}
                rotateInterval={18000}
                isMobile={true}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              className={ButtonClass}
              onClick={handlePrint}
              title="Print Results"
            >
              <Printer size={16} />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

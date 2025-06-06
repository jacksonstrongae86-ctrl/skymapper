import React from 'react';
import Image from 'next/image';
import logo from '@/src/components/desktop/sidebar/skymapperlogo-removebg-preview.png';
import { Prompt } from "next/font/google";
import { useTheme } from '@/src/utils/ThemeContext';

const prompt = Prompt({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

interface HeaderProps {
  handleFullScreen: () => void;
  handleMinimizeMaximize: () => void;
  isFullScreen: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  handleFullScreen,
  handleMinimizeMaximize,
  isFullScreen,
}) => {
  const { theme } = useTheme();

  return (
    <div className={`
      px-4 py-3 mb-4
      ${`gradient-${theme}`}
      border-b border-[var(--sidebar-border)]
      flex items-center justify-between
    `}>
      <div className="flex items-center gap-3">
        <Image
          src={logo}
          alt="Logo"
          width={40}
          height={40}
          className="rounded-xl shadow-lg"
        />
        <span className={`
          ${prompt.className}
          text-xl
          font-bold
          text-[var(--sidebar-text)]
        `}>
          SkyMapper
        </span>
      </div>
      <div className="flex gap-2">
        <button
          className={`
            w-8 h-8 rounded-lg
            ${`button-gradient-${theme}`}
            text-[var(--button-text)]
            hover:opacity-90
            transition-all duration-200
            flex items-center justify-center
          `}
          onClick={handleFullScreen}
          title={isFullScreen ? "Exit Full Screen" : "Full Screen"}
        >
          {isFullScreen ? "−" : "⛶"}
        </button>
        {!isFullScreen && (
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
            title="Minimize"
          >
            −
          </button>
        )}
      </div>
    </div>
  );
};

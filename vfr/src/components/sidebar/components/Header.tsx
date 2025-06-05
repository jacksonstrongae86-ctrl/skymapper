import React from 'react';
import Image from 'next/image';
import logo from '../skymapperlogo-removebg-preview.png';
import { Prompt } from "next/font/google";

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
  return (
    <div className="px-4 py-2 flex items-center justify-between border-b border-[var(--sidebar-border)]">
      <div className="flex items-center space-x-2">
        <Image src={logo} alt="Logo" width={48} height={48} className="rounded-xl shadow-md" />
        <span className={`${prompt.className} text-xl font-semibold text-[var(--sidebar-text)]`}>
          SkyMapper
        </span>
      </div>
      <div className="flex gap-2">
        <button
          className="w-7 h-7 rounded-xl bg-green-500 hover:bg-green-400 text-white text-sm flex items-center justify-center"
          onClick={handleFullScreen}
          title={isFullScreen ? "Exit Full Screen" : "Full Screen"}
        >
          {isFullScreen ? "−" : "⛶"}
        </button>
        {!isFullScreen && (
          <button
            className="w-7 h-7 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-white text-sm flex items-center justify-center"
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

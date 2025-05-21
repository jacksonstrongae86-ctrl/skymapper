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
    <div className="px-6 flex-none">
      <div className="absolute top-4 right-4 flex gap-2">
        <button
          className="w-6 h-6 rounded-full bg-green-500 hover:bg-green-400 flex items-center justify-center text-gray-800 text-xs"
          onClick={handleFullScreen}
          title={isFullScreen ? "Exit Full Screen" : "Full Screen"}
        >
          {isFullScreen ? "−" : "⌞ ⌝"}
        </button>
        {!isFullScreen && (
          <button
            className="w-6 h-6 rounded-full bg-yellow-500 hover:bg-yellow-400 flex items-center justify-center text-gray-800 text-xs"
            onClick={handleMinimizeMaximize}
            title="Minimize"
          >
            −
          </button>
        )}
      </div>
      <div className="flex items-center space-x-2 mb-4 mt-10">
        <Image src={logo} alt="Logo" width={64} height={64} className="mb-0" />
        <span className={`{${prompt.className} text-2xl font-semibold`}>
          SkyMapper
        </span>
      </div>
    </div>
  );
};

import React from "react";
import Image from "next/image";
import logo from "@/src/components/mobile/sidebar/skymapperlogo-removebg-preview.png";
import { Prompt } from "next/font/google";
import { useTheme } from "@/src/utils/ThemeContext";


const prompt = Prompt({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

interface HeaderProps {
  handleFullScreen: () => void;
  handleMinimizeMaximize: () => void;
  isFullScreen: boolean;
}

export const Header: React.FC<HeaderProps> = ({}) => {
  const { theme } = useTheme();

  return (
    <div
      className={`
      px-4 py-3 mb-4
      ${`gradient-${theme}`}
      border-b border-[var(--sidebar-border)]
      flex items-center justify-between
    `}
    >
      <div className="flex items-center gap-3">
        <Image
          src={logo}
          alt="Logo"
          width={40}
          height={40}
          className=""
        />
        <span
          className={`
          ${prompt.className}
          text-xl
          font-bold
          text-[var(--sidebar-text)]
        `}
        >
          Skymapper
        </span>
      </div>

    </div>
  );
};

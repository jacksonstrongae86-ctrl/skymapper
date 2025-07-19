// src/components/legal/ToggleSwitch.tsx
import React from "react";
import { useTheme } from "@/src/utils/ThemeContext";

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
  label?: string;
}

export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  checked,
  onChange,
  disabled = false,
  size = "md",
  label,
}) => {
  const { theme } = useTheme();

  const sizeClasses = {
    sm: {
      container: "h-5 w-9",
      thumb: "h-3 w-3",
      translate: checked ? "translate-x-5" : "translate-x-1",
    },
    md: {
      container: "h-6 w-11",
      thumb: "h-4 w-4",
      translate: checked ? "translate-x-6" : "translate-x-1",
    },
    lg: {
      container: "h-7 w-13",
      thumb: "h-5 w-5",
      translate: checked ? "translate-x-7" : "translate-x-1",
    },
  };

  const currentSize = sizeClasses[size];

  const handleClick = () => {
    if (!disabled) {
      onChange(!checked);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === " " || event.key === "Enter") {
      event.preventDefault();
      handleClick();
    }
  };

  return (
    <div className="flex items-center gap-3">
      {label && (
        <label
          className="text-sm font-medium text-[var(--sidebar-text)] cursor-pointer select-none"
          onClick={handleClick}
        >
          {label}
        </label>
      )}

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        className={`
          relative inline-flex items-center rounded-full transition-all duration-200 ease-in-out
          focus:outline-none focus:ring-2 focus:ring-[var(--button-bg)] focus:ring-opacity-50
          ${currentSize.container}
          ${disabled
            ? 'opacity-50 cursor-not-allowed'
            : 'cursor-pointer hover:shadow-md'
          }
          ${checked
            ? `${`button-gradient-${theme}`} shadow-inner`
            : 'bg-gray-300 dark:bg-gray-600 border border-[var(--sidebar-border)]'
          }
        `}
      >
        <span
          className={`
            inline-block rounded-full bg-white transition-all duration-200 ease-in-out
            shadow-lg border border-gray-200 dark:border-gray-400
            ${currentSize.thumb}
            ${currentSize.translate}
            ${disabled ? '' : 'hover:scale-110'}
          `}
        />

        {/* Screen reader only text */}
        <span className="sr-only">
          {checked ? 'Enabled' : 'Disabled'}
        </span>
      </button>
    </div>
  );
};

import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useTheme } from "@/src/utils/ThemeContext";
import {
  Calendar,
  ChevronDown,
} from "lucide-react";

interface CustomDatePickerProps {
  selected: Date | null;
  onChange: (date: Date | null) => void;
  showTimeSelect?: boolean;
  placeholder?: string;
  className?: string;
}

interface WheelPickerProps {
  value: number;
  onChange: (value: number) => void;
  options: { value: number; label: string }[];
  label: string;
}

const WheelPicker: React.FC<WheelPickerProps> = ({ value, onChange, options, label }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      const selectedIndex = options.findIndex(opt => opt.value === value);
      if (selectedIndex !== -1) {
        const itemHeight = 36;
        // No offset needed - the padding div naturally shifts everything
        const scrollTop = selectedIndex * itemHeight;
        scrollRef.current.scrollTop = scrollTop;
      }
    }

    // Cleanup timeout on unmount
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [value, options]);

  const handleScroll = () => {
    if (scrollRef.current) {
      // Clear any existing timeout
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      // Debounce the onChange call
      scrollTimeoutRef.current = setTimeout(() => {
        if (scrollRef.current) {
          const itemHeight = 36;
          const scrollTop = scrollRef.current.scrollTop;
          const centerIndex = Math.round(scrollTop / itemHeight);
          const selectedOption = options[centerIndex];
          // Use explicit comparison to handle 0 values correctly
          if (selectedOption !== undefined && selectedOption.value !== value) {
            onChange(selectedOption.value);
          }
        }
      }, 50);
    }
  };

  return (
    <div className="flex flex-col items-center flex-1">
      <div className="text-xs font-medium text-white opacity-50 mb-2">
        {label}
      </div>
      <div className="relative w-full">
        {/* Selection highlight */}
        <div className="absolute inset-x-0 top-[36px] h-[36px] bg-[var(--button-bg)] bg-opacity-10 rounded pointer-events-none z-10 border-y border-[var(--button-bg)] border-opacity-30" />

        {/* Scrollable list */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="h-[108px] overflow-y-auto hide-scrollbar"
          style={{
            scrollSnapType: 'y mandatory',
          }}
        >
          <div style={{ height: '36px', scrollSnapAlign: 'start' }} />
          {options.map((option) => {
            const isSelected = option.value === value;
            return (
              <div
                key={option.value}
                onClick={() => onChange(option.value)}
                className={`
                  h-[36px] flex items-center justify-center cursor-pointer
                  transition-all duration-200 select-none
                  ${isSelected
                    ? 'font-semibold text-base text-white'
                    : 'text-sm text-white opacity-30'}
                `}
                style={{ scrollSnapAlign: 'start' }}
              >
                {option.label}
              </div>
            );
          })}
          <div style={{ height: '36px', scrollSnapAlign: 'start' }} />
        </div>
      </div>
    </div>
  );
};

export const CustomDatePicker: React.FC<CustomDatePickerProps> = ({
  selected,
  onChange,
  showTimeSelect = false,
  placeholder = "Select date and time",
  className = "",
}) => {
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [tempDate, setTempDate] = useState(selected || new Date());

  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Generate options
  const monthOptions = Array.from({ length: 12 }, (_, i) => ({
    value: i,
    label: new Date(2000, i, 1).toLocaleDateString("en-US", { month: "short" })
  }));

  const yearOptions = Array.from({ length: 21 }, (_, i) => ({
    value: new Date().getFullYear() - 10 + i,
    label: (new Date().getFullYear() - 10 + i).toString()
  }));

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const dayOptions = Array.from({ length: getDaysInMonth(tempDate.getFullYear(), tempDate.getMonth()) }, (_, i) => ({
    value: i + 1,
    label: (i + 1).toString()
  }));

  const hourOptions = Array.from({ length: 24 }, (_, i) => ({
    value: i,
    label: i.toString().padStart(2, '0')
  }));

  const minuteOptions = Array.from({ length: 60 }, (_, i) => ({
    value: i,
    label: i.toString().padStart(2, '0')
  }));

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (containerRef.current && containerRef.current.contains(target)) {
        return;
      }
      setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const formatDisplayDate = (date: Date | null) => {
    if (!date) return "";
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "short",
      day: "numeric",
    };
    if (showTimeSelect) {
      options.hour = "2-digit";
      options.minute = "2-digit";
    }
    return date.toLocaleDateString("en-US", options);
  };

  const handleMonthChange = (month: number) => {
    const newDate = new Date(tempDate);
    newDate.setMonth(month);
    const maxDay = getDaysInMonth(newDate.getFullYear(), month);
    if (newDate.getDate() > maxDay) {
      newDate.setDate(maxDay);
    }
    setTempDate(newDate);
  };

  const handleDayChange = (day: number) => {
    const newDate = new Date(tempDate);
    newDate.setDate(day);
    setTempDate(newDate);
  };

  const handleYearChange = (year: number) => {
    const newDate = new Date(tempDate);
    newDate.setFullYear(year);
    setTempDate(newDate);
  };

  const handleHourChange = (hour: number) => {
    const newDate = new Date(tempDate);
    newDate.setHours(hour);
    setTempDate(newDate);
  };

  const handleMinuteChange = (minute: number) => {
    const newDate = new Date(tempDate);
    newDate.setMinutes(minute);
    setTempDate(newDate);
  };

  const handleDone = () => {
    onChange(tempDate);
    setIsOpen(false);
  };

  const handleToday = () => {
    const today = new Date();
    if (!showTimeSelect) {
      today.setHours(0, 0, 0, 0);
    }
    setTempDate(today);
    onChange(today);
    setIsOpen(false);
  };

  const handleClear = () => {
    onChange(null);
    setIsOpen(false);
  };

  const renderDropdown = () => {
    if (!isOpen) return null;

    return createPortal(
      <div
        ref={containerRef}
        className={`
          fixed z-[99999]
          ${`gradient-${theme}`}
          border border-[var(--sidebar-border)]
          rounded-lg shadow-lg
          w-[320px]
          top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
        `}
      >
        {/* Header */}
        <div className="border-b border-[var(--sidebar-border)] px-4 py-3">
          <h3 className="font-semibold text-white text-sm text-center">
            {showTimeSelect ? "Date & Time" : "Date"}
          </h3>
        </div>

        {/* Wheel Pickers */}
        <div className="p-4">
          {/* Date Pickers */}
          <div className="flex gap-2">
            <WheelPicker
              value={tempDate.getMonth()}
              onChange={handleMonthChange}
              options={monthOptions}
              label="Month"
            />
            <WheelPicker
              value={tempDate.getDate()}
              onChange={handleDayChange}
              options={dayOptions}
              label="Day"
            />
            <WheelPicker
              value={tempDate.getFullYear()}
              onChange={handleYearChange}
              options={yearOptions}
              label="Year"
            />
          </div>

          {/* Time Pickers */}
          {showTimeSelect && (
            <div className="flex gap-2 mt-4 pt-4 border-t border-[var(--sidebar-border)]">
              <WheelPicker
                value={tempDate.getHours()}
                onChange={handleHourChange}
                options={hourOptions}
                label="Hour"
              />
              <div className="flex items-center justify-center text-lg font-bold text-white opacity-30 pt-6">:</div>
              <WheelPicker
                value={tempDate.getMinutes()}
                onChange={handleMinuteChange}
                options={minuteOptions}
                label="Min"
              />
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="border-t border-[var(--sidebar-border)] p-3 flex gap-2">
          <button
            onClick={handleToday}
            className={`
              rounded-lg
              ${`button-gradient-${theme}`}
              text-[var(--button-text)]
              hover:opacity-90
              transition-opacity duration-200
              flex-1 px-3 py-2 text-xs font-medium
            `}
          >
            Today
          </button>

          <button
            onClick={handleClear}
            className={`
              rounded-lg
              border border-[var(--sidebar-border)]
              bg-transparent
              text-white
              hover:bg-[var(--sidebar-border)] hover:bg-opacity-20
              transition-all duration-200
              flex-1 px-3 py-2 text-xs font-medium
            `}
          >
            Clear
          </button>

          <button
            onClick={handleDone}
            className={`
              rounded-lg
              ${`button-gradient-${theme}`}
              text-[var(--button-text)]
              hover:opacity-90
              transition-opacity duration-200
              flex-1 px-3 py-2 text-xs font-medium
            `}
          >
            Done
          </button>
        </div>
      </div>,
      document.body
    );
  };

  return (
    <div className={`relative ${className}`}>
      {/* Input Field */}
      <button
        ref={buttonRef}
        onClick={() => {
          setTempDate(selected || new Date());
          setIsOpen(!isOpen);
        }}
        className={`
          w-full p-2 rounded-lg border border-[var(--sidebar-border)]
          bg-[var(--sidebar-bg)] text-[var(--sidebar-text)]
          focus:ring-2 focus:ring-[var(--button-bg)] focus:outline-none
          transition-all duration-200
          flex items-center justify-between
          hover:border-[var(--button-bg)]
          ${isOpen ? 'ring-2 ring-[var(--button-bg)]' : ''}
        `}
      >
        <div className="flex items-center gap-2">
          <Calendar size={16} className="text-[var(--sidebar-text)] opacity-70" />
          <span className={selected ? 'text-[var(--sidebar-text)]' : 'text-[var(--sidebar-text)] opacity-50'}>
            {selected ? formatDisplayDate(selected) : placeholder}
          </span>
        </div>
        <ChevronDown
          size={16}
          className={`text-[var(--sidebar-text)] opacity-70 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown Picker */}
      {renderDropdown()}
    </div>
  );
};

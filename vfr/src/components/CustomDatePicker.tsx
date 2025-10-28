import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useTheme } from "@/src/utils/ThemeContext";
import {
  Calendar,
  Clock,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
} from "lucide-react";

interface CustomDatePickerProps {
  selected: Date | null;
  onChange: (date: Date | null) => void;
  showTimeSelect?: boolean;
  placeholder?: string;
  className?: string;
}

interface CustomSelectProps {
  value: number;
  onChange: (value: number) => void;
  options: { value: number; label: string }[];
  theme: string;
}

const CustomSelect: React.FC<CustomSelectProps> = ({ value, onChange, options, theme }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const selectRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const updateDropdownPosition = () => {
    if (selectRef.current) {
      const rect = selectRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        selectRef.current &&
        !selectRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleScroll = () => {
      if (isOpen) {
        updateDropdownPosition();
      }
    };

    if (isOpen) {
      updateDropdownPosition();
      document.addEventListener("mousedown", handleClickOutside);
      window.addEventListener("scroll", handleScroll, true);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [isOpen]);

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <>
      <button
        ref={selectRef}
        onClick={() => setIsOpen(!isOpen)}
        className={`
          px-3 py-2 rounded-lg border border-white
          bg-[var(--sidebar-bg)] text-white
          focus:ring-2 focus:ring-[var(--button-bg)] focus:outline-none
          hover:border-[var(--button-bg)]
          transition-all duration-200
          text-sm font-medium
          cursor-pointer
          min-w-[60px]
          flex items-center justify-between
          ${isOpen ? 'ring-2 ring-[var(--button-bg)]' : ''}
        `}
      >
        <span>{selectedOption?.label || value.toString().padStart(2, '0')}</span>
        <ChevronDown
          size={12}
          className={`ml-1 text-white opacity-70 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && createPortal(
        <div
          ref={dropdownRef}
          className={`
            fixed z-[99999]
            ${`gradient-${theme}`}
            border border-white
            rounded-lg shadow-2xl
            max-h-48 overflow-y-auto
            custom-scrollbar
          `}
          style={{
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
            width: `${dropdownPosition.width}px`,
          }}
        >
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={`
                w-full px-3 py-2 text-left text-sm
                text-white hover:bg-[var(--button-bg)]
                transition-colors duration-200
                first:rounded-t-lg last:rounded-b-lg
                ${option.value === value ? 'bg-[var(--button-bg)]' : ''}
              `}
            >
              {option.label}
            </button>
          ))}
        </div>,
        document.body
      )}
    </>
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
  const [currentMonth, setCurrentMonth] = useState(
    selected ? new Date(selected.getFullYear(), selected.getMonth(), 1) : new Date()
  );
  const [selectedTime, setSelectedTime] = useState({
    hours: selected ? selected.getHours() : 12,
    minutes: selected ? selected.getMinutes() : 0,
  });
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0, maxWidth: 0 });

  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Generate options for hours and minutes
  const hourOptions = Array.from({ length: 24 }, (_, i) => ({
    value: i,
    label: i.toString().padStart(2, '0')
  }));

  const minuteOptions = Array.from({ length: 60 }, (_, i) => ({
    value: i,
    label: i.toString().padStart(2, '0')
  }));

  // Calculate dropdown position with sidebar width constraint
  const updateDropdownPosition = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();

      // Find the sidebar element (assuming it has a specific class or data attribute)
      // You may need to adjust this selector based on your actual sidebar implementation
      const sidebar = buttonRef.current.closest('[class*="sidebar"]') ||
                    buttonRef.current.closest('[data-sidebar]') ||
                    buttonRef.current.closest('.sidebar');

      let maxWidth = window.innerWidth - rect.left - 20; // Default fallback with some padding

      if (sidebar) {
        const sidebarRect = sidebar.getBoundingClientRect();
        maxWidth = sidebarRect.right - rect.left - 20; // 20px padding from sidebar edge
      }

      setDropdownPosition({
        top: rect.bottom + window.scrollY + 8,
        left: rect.left + window.scrollX,
        width: rect.width,
        maxWidth: Math.max(maxWidth, 320), // Ensure minimum width of 320px
      });
    }
  };

  // Close picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      // Check if click is inside the main container
      if (containerRef.current && containerRef.current.contains(target)) {
        return;
      }

      // Check if click is inside any CustomSelect dropdown (they use portals)
      const selectDropdowns = document.querySelectorAll('[class*="fixed z-[99999]"]');
      for (const dropdown of selectDropdowns) {
        if (dropdown.contains(target)) {
          return; // Don't close if clicking inside a select dropdown
        }
      }

      // If we get here, the click was truly outside
      setIsOpen(false);
    };

    const handleScroll = () => {
      if (isOpen) {
        updateDropdownPosition();
      }
    };

    const handleResize = () => {
      if (isOpen) {
        updateDropdownPosition();
      }
    };

    if (isOpen) {
      updateDropdownPosition();
      document.addEventListener("mousedown", handleClickOutside);
      window.addEventListener("scroll", handleScroll, true);
      window.addEventListener("resize", handleResize);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", handleResize);
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

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const handleDateClick = (day: number) => {
    const newDate = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day,
      selectedTime.hours,
      selectedTime.minutes
    );
    onChange(newDate);
    // Only close if time selection is not enabled, or if it is enabled but user clicked "Done"
    if (!showTimeSelect) {
      setIsOpen(false);
    }
  };

  // Updated to only update internal state, not call onChange immediately
  const handleTimeChange = (hours: number, minutes: number) => {
    setSelectedTime({ hours, minutes });

    // Only update the date if we already have a selected date
    if (selected) {
      const newDate = new Date(selected);
      newDate.setHours(hours, minutes);
      onChange(newDate);
    }
  };

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      if (direction === "prev") {
        newMonth.setMonth(prev.getMonth() - 1);
      } else {
        newMonth.setMonth(prev.getMonth() + 1);
      }
      return newMonth;
    });
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const days = [];
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    // Day headers
    const dayHeaders = dayNames.map(day => (
      <div
        key={day}
        className="p-2 text-xs font-medium text-white opacity-70 text-center"
      >
        {day}
      </div>
    ));

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="p-2"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const isSelected = selected &&
        selected.getDate() === day &&
        selected.getMonth() === currentMonth.getMonth() &&
        selected.getFullYear() === currentMonth.getFullYear();

      const isToday = new Date().toDateString() ===
        new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day).toDateString();

      days.push(
        <button
          key={day}
          onClick={() => handleDateClick(day)}
          className={`
            p-2 text-sm rounded-lg transition-all duration-200
            hover:bg-[var(--button-bg)] hover:text-white
            ${isSelected
              ? `${`button-gradient-${theme}`} text-white shadow-md`
              : 'text-white'
            }
            ${isToday && !isSelected ? 'ring-2 ring-[var(--button-bg)] ring-opacity-50' : ''}
          `}
        >
          {day}
        </button>
      );
    }

    return (
      <div className="grid grid-cols-7 gap-1">
        {dayHeaders}
        {days}
      </div>
    );
  };

  const renderTimePicker = () => {
    if (!showTimeSelect) return null;

    return (
      <div className="border-t border-white p-4">
        <div className="flex items-center justify-center gap-4">
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-white opacity-70" />
            <span className="text-sm font-medium text-white">Time:</span>
          </div>

          <div className="flex items-center gap-2">
            <CustomSelect
              value={selectedTime.hours}
              onChange={(hours) => handleTimeChange(hours, selectedTime.minutes)}
              options={hourOptions}
              theme={theme}
            />

            <span className="text-white font-medium">:</span>

            <CustomSelect
              value={selectedTime.minutes}
              onChange={(minutes) => handleTimeChange(selectedTime.hours, minutes)}
              options={minuteOptions}
              theme={theme}
            />
          </div>
        </div>
      </div>
    );
  };

  const isMobile = typeof window !== "undefined" && window.innerWidth <= 768;

  const renderDropdown = () => {
    if (!isOpen) return null;

    // Center on mobile
    const mobileStyle = isMobile
    ? {
        top: `50%`,
        left: `50%`,
        transform: `translate(-50%, -50%)`,
        minWidth: `320px`,
        maxWidth: `95vw`,
        width: `90vw`,
        position: "fixed" as const,
        zIndex: 99999,
      }
    : {
        top: `${dropdownPosition.top}px`,
        left: `${dropdownPosition.left}px`,
        minWidth: `280px`,
        maxWidth: `360px`,
        position: "fixed" as const,
        zIndex: 99999,
      };

    return createPortal(
      <div
        ref={containerRef}
        className={`
          fixed z-[99999]
          ${`gradient-${theme}`}
          border border-white
          rounded-xl shadow-2xl
          transform transition-all duration-200
          ${isMobile ? 'min-w-[320px] max-w-[600px]' : 'min-w-[280px] max-w-[360px]'}
        `}
        style={mobileStyle}
      >
        {/* Header */}
        <div className={`border-b border-white ${isMobile ? 'p-4' : 'p-2'}`}>
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigateMonth("prev")}
              className="p-2 rounded-lg hover:bg-[var(--button-bg)] hover:text-white
                transition-colors duration-200"
            >
              <ChevronLeft size={16} />
            </button>

            <h3 className={`font-semibold text-white ${isMobile ? 'text-base' : 'text-sm'}`}>
              {currentMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </h3>

            <button
              onClick={() => navigateMonth("next")}
              className="p-2 rounded-lg hover:bg-[var(--button-bg)] hover:text-white
                transition-colors duration-200"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className={isMobile ? 'p-4' : 'p-2'}>
          {renderCalendar()}
        </div>

        {/* Time Picker */}
        {renderTimePicker()}

        {/* Footer Actions */}
        <div className={`border-t border-white flex gap-2 ${isMobile ? 'p-4' : 'p-2'}`}>
          <button
            onClick={() => {
              const todayDate = new Date();
              if (showTimeSelect) {
                todayDate.setHours(selectedTime.hours, selectedTime.minutes);
              }
              onChange(todayDate);
              setIsOpen(false);
            }}
            className={`
              rounded-lg
              ${`button-gradient-${theme}`}
              text-white
              hover:opacity-90 transition-opacity duration-200
              flex-1
              ${isMobile ? 'px-3 py-2 text-sm' : 'px-2 py-1 text-xs'}
            `}
          >
            Today
          </button>

          <button
            onClick={() => {
              onChange(null);
              setIsOpen(false);
            }}
            className={`
              rounded-lg
              border border-white
              text-white
              hover:bg-[var(--sidebar-border)] transition-colors duration-200
              flex-1
              ${isMobile ? 'px-3 py-2 text-sm' : 'px-2 py-1 text-xs'}
            `}
          >
            Clear
          </button>

          {showTimeSelect && (
            <button
              onClick={() => setIsOpen(false)}
              className={`
                rounded-lg
                ${`button-gradient-${theme}`}
                text-white
                hover:opacity-90 transition-opacity duration-200
                flex-1
                ${isMobile ? 'px-3 py-2 text-sm' : 'px-2 py-1 text-xs'}
              `}
            >
              Done
            </button>
          )}
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
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-full p-2 rounded-lg border border-white
          bg-[var(--sidebar-bg)] text-white
          focus:ring-2 focus:ring-[var(--button-bg)] focus:outline-none
          transition-all duration-200
          flex items-center justify-between
          hover:border-[var(--button-bg)]
          ${isOpen ? 'ring-2 ring-[var(--button-bg)]' : ''}
        `}
      >
        <div className="flex items-center gap-2">
          <Calendar size={16} className="text-white opacity-70" />
          <span className={selected ? 'text-white' : 'text-white opacity-50'}>
            {selected ? formatDisplayDate(selected) : placeholder}
          </span>
        </div>
        <ChevronDown
          size={16}
          className={`text-white opacity-70 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown Calendar - Now rendered as portal */}
      {renderDropdown()}
    </div>
  );
};

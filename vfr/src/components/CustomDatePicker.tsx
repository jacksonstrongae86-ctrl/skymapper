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
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
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
    // Always close the picker when a date is selected
    setIsOpen(false);
  };

  const handleTimeChange = (hours: number, minutes: number) => {
    setSelectedTime({ hours, minutes });
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
        className="p-2 text-xs font-medium text-[var(--sidebar-text)] opacity-70 text-center"
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
              : 'text-[var(--sidebar-text)]'
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
      <div className="border-t border-[var(--sidebar-border)] p-4">
        <div className="flex items-center justify-center gap-4">
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-[var(--sidebar-text)] opacity-70" />
            <span className="text-sm font-medium text-[var(--sidebar-text)]">Time:</span>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedTime.hours}
              onChange={(e) => handleTimeChange(parseInt(e.target.value), selectedTime.minutes)}
              className="px-2 py-1 rounded-md border border-[var(--sidebar-border)]
                bg-[var(--sidebar-bg)] text-[var(--sidebar-text)]
                focus:ring-2 focus:ring-[var(--button-bg)] focus:outline-none
                text-sm"
            >
              {Array.from({ length: 24 }, (_, i) => (
                <option key={i} value={i}>
                  {i.toString().padStart(2, '0')}
                </option>
              ))}
            </select>

            <span className="text-[var(--sidebar-text)]">:</span>

            <select
              value={selectedTime.minutes}
              onChange={(e) => handleTimeChange(selectedTime.hours, parseInt(e.target.value))}
              className="px-2 py-1 rounded-md border border-[var(--sidebar-border)]
                bg-[var(--sidebar-bg)] text-[var(--sidebar-text)]
                focus:ring-2 focus:ring-[var(--button-bg)] focus:outline-none
                text-sm"
            >
              {Array.from({ length: 60 }, (_, i) => (
                <option key={i} value={i}>
                  {i.toString().padStart(2, '0')}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    );
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
          rounded-xl shadow-2xl
          min-w-[320px]
          max-w-[600px]
          transform transition-all duration-200
        `}
        style={{
          top: `${dropdownPosition.top}px`,
          left: `${dropdownPosition.left}px`,
          minWidth: `320px`,
          maxWidth: `600px`
        }}
      >
        {/* Header */}
        <div className="p-4 border-b border-[var(--sidebar-border)]">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigateMonth("prev")}
              className="p-2 rounded-lg hover:bg-[var(--button-bg)] hover:text-white
                transition-colors duration-200"
            >
              <ChevronLeft size={16} />
            </button>

            <h3 className="font-semibold text-[var(--sidebar-text)]">
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
        <div className="p-4">
          {renderCalendar()}
        </div>

        {/* Time Picker */}
        {renderTimePicker()}

        {/* Footer Actions */}
        <div className="p-4 border-t border-[var(--sidebar-border)] flex gap-2">
          <button
            onClick={() => {
              onChange(new Date());
              setIsOpen(false);
            }}
            className={`
              px-3 py-2 rounded-lg text-sm
              ${`button-gradient-${theme}`}
              text-white
              hover:opacity-90 transition-opacity duration-200
              flex-1
            `}
          >
            Today
          </button>

          <button
            onClick={() => {
              onChange(null);
              setIsOpen(false);
            }}
            className="px-3 py-2 rounded-lg text-sm
              border border-[var(--sidebar-border)]
              text-[var(--sidebar-text)]
              hover:bg-[var(--sidebar-border)] transition-colors duration-200
              flex-1"
          >
            Clear
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
        onClick={() => setIsOpen(!isOpen)}
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

      {/* Dropdown Calendar - Now rendered as portal */}
      {renderDropdown()}
    </div>
  );
};

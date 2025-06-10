import React from "react";
import { useTheme } from "@/src/utils/ThemeContext";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  Settings,
  ChevronDown,
  ChevronUp,
  Fuel,
  Clock,
  Wind,
  RefreshCw,
} from "lucide-react";

interface FlightSettingsProps {
  isSettingsVisible: boolean;
  setIsSettingsVisible: (visible: boolean) => void;
  fuelConsumption: number;
  setFuelConsumption: (value: number) => void;
  selectedDateTime: string;
  setSelectedDateTime: (value: string) => void;
  fetchWindData: () => void;
  updateCalculations: () => void;
}

export const FlightSettings: React.FC<FlightSettingsProps> = ({
  isSettingsVisible,
  setIsSettingsVisible,
  fuelConsumption,
  setFuelConsumption,
  selectedDateTime,
  setSelectedDateTime,
  fetchWindData,
  updateCalculations,
}) => {
  const { theme } = useTheme();
  return (
    <div className="px-4 mb-4">
      <div className="border border-[var(--sidebar-border)] rounded-xl overflow-hidden shadow-lg">
        <button
          onClick={() => setIsSettingsVisible(!isSettingsVisible)}
          className={`
            w-full px-4 py-3
            ${`button-gradient-${theme}`}
            text-[var(--button-text)]
            hover:opacity-90
            transition-all duration-200
            font-semibold
            flex items-center justify-between
          `}
        >
          <span className="flex items-center gap-2">
            <Settings size={18} className="text-[var(--button-text)]" />
            <span>Flight Settings</span>
          </span>
          {isSettingsVisible ? (
            <ChevronUp size={18} className="text-[var(--button-text)]" />
          ) : (
            <ChevronDown size={18} className="text-[var(--button-text)]" />
          )}
        </button>

        <div
          className={`
            transition-all duration-300 ease-in-out
            ${isSettingsVisible ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}
            ${`gradient-${theme}`}
          `}
        >
          <div className="p-4 space-y-4">
            {/* Inputs with consistent styling */}
            <div className="space-y-4">
              <label className="block">
                <span className="text-sm font-medium text-[var(--sidebar-text)]">
                  <Fuel size={16} className="text-[var(--sidebar-text)]" />
                  Fuel Consumption (Gal/hr):
                </span>
                <input
                  type="number"
                  className="w-full mt-1 p-2 rounded-lg border border-[var(--sidebar-border)]
                    bg-[var(--sidebar-bg)] text-[var(--sidebar-text)]
                    focus:ring-2 focus:ring-[var(--button-bg)] focus:outline-none
                    transition-all duration-200"
                  value={fuelConsumption}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value);
                    if (!isNaN(value)) setFuelConsumption(value);
                  }}
                  min="0"
                  step="0.1"
                />
              </label>

              <label className="block grid grid-cols-1 gap-2">
                <span className="text-sm font-medium text-[var(--sidebar-text)]">
                  <Clock size={16} className="text-[var(--sidebar-text)]" />
                  Select Date and Time:
                </span>
                <DatePicker
                  selected={
                    selectedDateTime ? new Date(selectedDateTime) : null
                  }
                  onChange={(date) =>
                    setSelectedDateTime(date?.toISOString() || "")
                  }
                  showTimeSelect
                  dateFormat="Pp"
                  className="w-full mt-1 p-2 rounded-lg border border-[var(--sidebar-border)]
                    bg-[var(--sidebar-bg)] text-[var(--sidebar-text)]
                    focus:ring-2 focus:ring-[var(--button-bg)] focus:outline-none
                    transition-all duration-200"
                />
              </label>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2">
              <button
                type="button"
                className={`
                  w-full py-2 px-4 rounded-lg
                  ${`button-gradient-${theme}`}
                  text-[var(--button-text)]
                  transition-all duration-200
                  flex items-center justify-center gap-2
                  hover:opacity-90
                `}
                onClick={fetchWindData}
              >
                <Wind size={18} className="text-[var(--button-text)]" />
                <span>Fetch Wind Data</span>
              </button>

              <button
                type="button"
                className={`
                  w-full py-2 px-4 rounded-lg
                  ${`button-gradient-${theme}`}
                  text-[var(--button-text)]
                  transition-all duration-200
                  flex items-center justify-center gap-2
                  hover:opacity-90
                `}
                onClick={updateCalculations}
              >
                <RefreshCw size={18} className="text-[var(--button-text)]" />
                <span>Update Info</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { useTheme } from '@/src/utils/ThemeContext';
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
            <span>⚙️</span>
            <span>Flight Settings</span>
          </span>
          <span>{isSettingsVisible ? "−" : "+"}</span>
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

              <label className="block">
                <span className="text-sm font-medium text-[var(--sidebar-text)]">
                  Select Date and Time:
                </span>
                <input
                  type="datetime-local"
                  className="w-full mt-1 p-2 rounded-lg border border-[var(--sidebar-border)]
                    bg-[var(--sidebar-bg)] text-[var(--sidebar-text)]
                    focus:ring-2 focus:ring-[var(--button-bg)] focus:outline-none
                    transition-all duration-200"
                  value={selectedDateTime}
                  onChange={(e) => setSelectedDateTime(e.target.value)}
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
                <span>💨</span>
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
                <span>🔄</span>
                <span>Update Info</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

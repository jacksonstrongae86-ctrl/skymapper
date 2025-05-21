import React from 'react';

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
  return (
    <div className="mb-6 border border-[var(--sidebar-border)] rounded-lg overflow-hidden">
      <button
        onClick={() => setIsSettingsVisible(!isSettingsVisible)}
        className="w-full px-4 py-2 bg-[var(--button-bg)] hover:bg-[var(--button-hover)]
          flex items-center justify-between text-sm font-medium border-b border-[var(--sidebar-border)] flex-none rounded-t-lg"
      >
        <span className="flex items-center gap-2 font-semibold text-base text-[var(--button-text)]">
          <span>⚙️</span>
          <span>Flight Settings</span>
        </span>
        <span>{isSettingsVisible ? "−" : "+"}</span>
      </button>

      <div
        className={`transition-all duration-300 ease-in-out
          ${isSettingsVisible ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}
      >
        <div className="p-4 space-y-4">
          {/* Fuel Consumption Input */}
          <label className="block text-sm font-medium text-[var(--sidebar-text)]">
            Fuel Consumption (Gal/hr):
            <input
              type="number"
              className="w-full mt-1 p-2 border border-[var(--sidebar-border)] rounded-md
                bg-[var(--input-bg)] text-[var(--input-text)]
                focus:ring focus:ring-blue-300 focus:outline-none"
              value={fuelConsumption}
              onChange={(e) => {
                const value = parseFloat(e.target.value);
                if (!isNaN(value)) {
                  setFuelConsumption(value);
                }
              }}
              min="0"
              step="0.1"
              placeholder="Enter fuel consumption"
            />
          </label>

          {/* Date Time Input */}
          <label className="block text-sm font-medium text-[var(--sidebar-text)]">
            Select Date and Time:
            <input
              type="datetime-local"
              className="w-full mt-1 p-2 border border-[var(--sidebar-border)] rounded-md
                bg-[var(--input-bg)] text-[var(--input-text)]
                focus:ring focus:ring-blue-300 focus:outline-none"
              value={selectedDateTime}
              onChange={(e) => setSelectedDateTime(e.target.value)}
            />
          </label>

          {/* Wind Data Button */}
          <button
            type="button"
            className="w-full bg-cyan-600/80 hover:bg-cyan-800 text-white py-2 px-4 rounded-md
              transition-colors duration-200 flex items-center justify-center gap-2"
            onClick={fetchWindData}
          >
            <span>💨</span>
            <span>Fetch Wind Data</span>
          </button>

          {/* Update Info Button */}
          <button
            type="button"
            className="w-full bg-green-600/80 hover:bg-green-800 text-white py-2 px-4 rounded-md
              transition-colors duration-200 flex items-center justify-center gap-2"
            onClick={updateCalculations}
          >
            <span>🔄</span>
            <span>Update Info</span>
          </button>
        </div>
      </div>
    </div>
  );
};

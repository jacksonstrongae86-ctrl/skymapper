import React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
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
  fuelConsumption,
  setFuelConsumption,
  selectedDateTime,
  setSelectedDateTime,
  fetchWindData,
  updateCalculations,
}) => {
  return (
    <div className="p-4 space-y-4">
      {/* Fuel Consumption Input */}
      <div className="space-y-2">
        <label className="block text-sm font-medium">
          <Fuel size={16} className="inline mr-2" />
          Fuel Consumption (Gal/hr)
        </label>
        <input
          type="number"
          className="w-full p-2 rounded-lg border border-[var(--sidebar-border)]"
          value={fuelConsumption}
          onChange={(e) => {
            const value = parseFloat(e.target.value);
            if (!isNaN(value)) setFuelConsumption(value);
          }}
        />
      </div>

      {/* DateTime Picker */}
      <div className="space-y-2">
        <label className="block text-sm font-medium">
          <Clock size={16} className="inline mr-2" />
          Date and Time
        </label>
        <DatePicker
          selected={selectedDateTime ? new Date(selectedDateTime) : null}
          onChange={(date) => setSelectedDateTime(date?.toISOString() || "")}
          showTimeSelect
          dateFormat="Pp"
          className="w-full p-2 rounded-lg border border-[var(--sidebar-border)]"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={fetchWindData}
          className="flex-1 p-2 rounded-lg bg-[var(--button-bg)] text-sm"
        >
          <Wind size={16} className="inline mr-2" />
          Update Wind
        </button>
        <button
          onClick={updateCalculations}
          className="flex-1 p-2 rounded-lg bg-[var(--button-bg)] text-sm"
        >
          <RefreshCw size={16} className="inline mr-2" />
          Recalculate
        </button>
      </div>
    </div>
  );
};

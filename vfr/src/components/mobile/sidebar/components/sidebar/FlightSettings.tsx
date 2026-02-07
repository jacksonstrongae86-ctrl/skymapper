import React, { useState, useEffect } from "react";
import { useTheme } from "@/src/utils/ThemeContext";
import { CustomDatePicker } from "../../../../CustomDatePicker";
import { Settings, ChevronDown, ChevronUp, Fuel, Clock, Ruler } from "lucide-react";
import { useAltitudeUnit } from "@/src/utils/AltitudeUnitContext";
import { AltitudeUnit } from "@/src/utils/unitConversions";
import { FlightRules } from "@/src/utils/types";
import { FEATURES } from "@/src/utils/featureFlags";
import { FlightRulesSelector } from "@/src/components/shared/FlightRulesSelector";
import IFRRoutePanel from "@/src/components/shared/IFRRoutePanel";
import LiveFlight from "@/src/components/shared/LiveFlight";

interface FlightSettingsProps {
  isSettingsVisible: boolean;
  setIsSettingsVisible: (visible: boolean) => void;
  fuelConsumption: number;
  setFuelConsumption: (value: number) => void;
  selectedDateTime: string;
  setSelectedDateTime: (value: string) => void;
  gal_liter: string;
  set_gal_liter: (g_l: string) => void;
}

export const FlightSettings: React.FC<FlightSettingsProps> = ({
  isSettingsVisible,
  setIsSettingsVisible,
  fuelConsumption,
  setFuelConsumption,
  selectedDateTime,
  setSelectedDateTime,
  gal_liter,
  set_gal_liter,
}) => {
  const { theme } = useTheme();
  const { altitudeUnit, setAltitudeUnit } = useAltitudeUnit();
  const units: AltitudeUnit[] = ['ft', 'm', 'fl'];

  // IFR Support state
  const [flightRules, setFlightRules] = useState<FlightRules>('VFR');

  // Local state for fuel consumption display value
  const [fuelDisplayValue, setFuelDisplayValue] = useState(
    fuelConsumption === 0 ? "" : fuelConsumption.toString()
  );

  // Update display value when fuelConsumption changes from external source
  useEffect(() => {
    setFuelDisplayValue(
      fuelConsumption === 0 ? "" : fuelConsumption.toString()
    );
  }, [fuelConsumption]);

  // Enhanced input handler for fuel consumption
  const handleFuelInputChange = (value: string) => {
    // Update display value immediately
    setFuelDisplayValue(value);

    // Handle the actual fuel consumption update
    if (value === "") {
      setFuelConsumption(0);
    } else {
      const num = parseFloat(value);
      if (!isNaN(num) && num >= 0) {
        setFuelConsumption(num);
      }
    }
  };

  return (
    <div className="px-4 mb-4 mt-4">
      <div className="border border-[var(--sidebar-border)] rounded-xl overflow-hidden shadow-lg">
        <button
          onClick={() => setIsSettingsVisible(!isSettingsVisible)}
          className={`
            w-full px-4 py-3
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
            ${isSettingsVisible ? "max-h-[800px] opacity-100" : "max-h-0 opacity-0"}
            ${`gradient-${theme}`}
            overflow-y-auto
          `}
        >
          <div className="p-4 space-y-4">
            {/* Flight Rules Selector - IFR Support */}
            {FEATURES.IFR_SUPPORT && (
              <FlightRulesSelector
                currentRule={flightRules as 'VFR' | 'IFR'}
                onChange={(rule) => setFlightRules(rule as FlightRules)}
              />
            )}

            {/* IFR Route Panel - Only show when IFR is selected */}
            {FEATURES.IFR_SUPPORT && flightRules === 'IFR' && (
              <IFRRoutePanel />
            )}

            {/* Live Flight Tracking */}
            {FEATURES.LIVE_TRACKING && (
              <div className="border-t border-[var(--sidebar-border)] pt-4">
                <LiveFlight flightRules={flightRules} />
              </div>
            )}

            {/* Divider between new features and existing settings */}
            {(FEATURES.IFR_SUPPORT || FEATURES.LIVE_TRACKING) && (
              <div className="border-t border-[var(--sidebar-border)] pt-4" />
            )}

            {/* Inputs with consistent styling */}
            <div className="space-y-4">
              <label className="block">
                <span className="flex items-center gap-2 text-sm font-medium text-[var(--sidebar-text)] mb-1">
                  <Fuel size={16} className="text-[var(--sidebar-text)]" />
                  Fuel Consumption:
                </span>
                <div className="flex gap-2 items-center">
                  <input
                    type="number"
                    className="mt-1 p-2 rounded-lg border border-[var(--sidebar-border)]
                      bg-[var(--sidebar-bg)] text-[var(--sidebar-text)]
                      focus:ring-2 focus:ring-[var(--button-bg)] focus:outline-none
                      transition-all duration-200 max-w-[60%]"
                    value={fuelDisplayValue}
                    onChange={(e) => handleFuelInputChange(e.target.value)}
                    min="0"
                    step="0.1"
                    placeholder="Enter..."
                  />
                  <button
                    type="button"
                    className={`
                      mt-1 px-3 py-2 rounded-lg border border-[var(--sidebar-border)]
                      bg-[var(--sidebar-bg)] text-[var(--sidebar-text)]
                      hover:bg-[var(--button-bg)] hover:text-[var(--button-text)]
                      transition-all duration-200
                      text-sm font-medium whitespace-nowrap
                      flex-shrink-0
                    `}
                    onClick={() =>
                      set_gal_liter(
                        gal_liter === "Gal" ? "Liter" : "Gal"
                      )
                    }
                    title={`Switch to ${
                      gal_liter === "Gal" ? "Liter/hr" : "Gal/hr"
                    }`}
                  >
                    {gal_liter}/hr
                  </button>
                </div>
              </label>

              <label className="grid grid-cols-1 gap-2">
                <span className="flex items-center gap-2 text-sm font-medium text-[var(--sidebar-text)]">
                  <Clock size={16} className="text-[var(--sidebar-text)]" />
                  Select Date and Time:
                </span>
                <CustomDatePicker
                  selected={
                    selectedDateTime ? new Date(selectedDateTime) : null
                  }
                  onChange={(date) =>
                    setSelectedDateTime(date?.toISOString() || "")
                  }
                  showTimeSelect={true}
                  placeholder="Select flight date and time"
                />
              </label>

              {/* Altitude Unit Selector */}
              <label className="block">
                <span className="flex items-center gap-2 text-sm font-medium text-[var(--sidebar-text)] mb-2">
                  <Ruler size={16} className="text-[var(--sidebar-text)]" />
                  Altitude Display Units:
                </span>
                <div className="flex gap-1 bg-[var(--sidebar-bg)] rounded-lg p-1 border border-[var(--sidebar-border)]">
                  {units.map((unit) => (
                    <button
                      key={unit}
                      type="button"
                      onClick={() => setAltitudeUnit(unit)}
                      className={`
                        flex-1 px-3 py-2 text-xs font-medium rounded-md transition-all duration-200
                        ${
                          altitudeUnit === unit
                            ? `${`button-gradient-${theme}`} text-[var(--button-text)]`
                            : 'text-[var(--sidebar-text)] hover:bg-[var(--button-hover)]'
                        }
                      `}
                    >
                      {unit.toUpperCase()}
                    </button>
                  ))}
                </div>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

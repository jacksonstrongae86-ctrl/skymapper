import React, {JSX} from 'react';
import { useTheme } from '@/src/utils/ThemeContext';
import { Hash, Ruler, Compass, ArrowRight, Zap, Timer, Plane, Fuel, Wind } from 'lucide-react';

interface ResultsTableProps {
  results: JSX.Element[];
}

const TABLE_HEADERS = [
  { label: "#", unit: "", icon: Hash },
  { label: "Distance", unit: "NM", icon: Ruler },
  { label: "Track", unit: "°", icon: Compass },
  { label: "Heading", unit: "°", icon: ArrowRight },
  { label: "GS", unit: "knots", icon: Zap },
  { label: "Time", unit: "min", icon: Timer },
  { label: "TAS", unit: "knots", icon: Plane },
  { label: "Fuel", unit: "gal", icon: Fuel },
  { label: "Wind", unit: "", icon: Wind },
] as const;

export const ResultsTable: React.FC<ResultsTableProps> = ({
  results,
}) => {
  const { theme } = useTheme();
  return (
    <div className="px-4 pb-4">
      <div className={`
        border border-[var(--sidebar-border)]
        rounded-b-xl
        rouunded-t-none
        w-full
        overflow-hidden
      `}>
        <table className="w-full">
          <thead className={`
            top-[74px] z-10
            ${`gradient-${theme}`}
            border-b border-[var(--sidebar-border)]
          `}>
            <tr>
              {TABLE_HEADERS.map(({ label, unit, icon: Icon }) => (
                <th
                  key={label}
                  className={`
                    py-3 px-4
                    text-left font-semibold
                    whitespace-nowrap
                    text-[var(--results-text)]
                  `}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-[var(--button-bg)] bg-opacity-20 flex items-center justify-center">
                      <Icon size={14} className="text-[var(--sidebar-text)]" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[var(--button-text)]">
                        {label}
                      </span>
                      {unit && (
                        <span className="text-xs text-[var(--results-units)] opacity-70">
                          ({unit})
                        </span>
                      )}
                    </div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="text-[var(--results-text)]">
            {results}
          </tbody>
        </table>
      </div>
    </div>
  );
};

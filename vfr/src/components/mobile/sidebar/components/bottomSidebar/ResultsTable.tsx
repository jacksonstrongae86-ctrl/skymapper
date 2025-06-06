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
    <div className="px-2 pb-4">
      <div className={`
        border border-[var(--sidebar-border)]
        rounded-xl
        rounded-t-none
        border-t-0
        w-full
        overflow-x-auto
      `}>
        <table className="w-full">
          <thead className={`
            sticky top-0 z-10
            ${`gradient-${theme}`}
            border-b border-[var(--sidebar-border)]
          `}>
            <tr>
              {TABLE_HEADERS.map(({ label, unit, icon: Icon }) => (
                <th
                  key={label}
                  className={`
                    py-2 px-2
                    text-left font-semibold
                    whitespace-nowrap
                    text-[var(--results-text)]
                  `}
                >
                  <div className="flex items-center gap-1">
                    <div className="w-5 h-5 rounded-lg bg-[var(--button-bg)] bg-opacity-20 flex items-center justify-center">
                      <Icon size={12} className="text-[var(--sidebar-text)]" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-medium text-[var(--button-text)]">
                        {label}
                      </span>
                      {unit && (
                        <span className="text-[10px] text-[var(--results-units)] opacity-70">
                          ({unit})
                        </span>
                      )}
                    </div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="text-[var(--results-text)] text-sm">
            {results}
          </tbody>
        </table>
      </div>
    </div>
  );
};

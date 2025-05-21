import React from 'react';
import { FlightResultsTableProps } from "@/src/utils/types";

const TABLE_HEADERS = [
  ["#", "", "🔢"],
  ["Distance", "NM", "📏"],
  ["Track", "°", "🧭"],
  ["Heading", "°", "➡️"],
  ["GS", "knots", "⚡"],
  ["Time", "min", "⏱️"],
  ["TAS", "knots", "✈️"],
  ["Fuel", "gal", "⛽"],
  ["Wind", "", "💨"],
] as const;

export const FlightResultsTable: React.FC<FlightResultsTableProps> = ({ results }) => {
  return (
    <div className="p-4">
      <table className="w-full">
        <thead className="bg-[var(--button-bg)] sticky top-18.5 z-10">
          <tr>
            {TABLE_HEADERS.map(([label, unit, icon]) => (
              <th
                key={label}
                className="py-3 px-4 text-left font-semibold first:rounded-tl-lg last:rounded-tr-lg whitespace-nowrap border-b border-[var(--sidebar-border)] text-[var(--results-text)]"
              >
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">{icon}</span>
                  <div className="flex flex-col">
                    <span className="text-[var(--button-text)]">
                      {label}
                    </span>
                    {unit && (
                      <span className="text-xs text-[var(--results-units)]">
                        ({unit})
                      </span>
                    )}
                  </div>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="text-[var(--results-text)]">{results}</tbody>
      </table>
    </div>
  );
};

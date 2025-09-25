import React, { useState } from 'react';
import { getAirspaceLegend } from '@/src/utils/airspaceColors';
import { ChevronDown, ChevronUp, Map } from 'lucide-react';

const AirspaceLegend: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const legend = getAirspaceLegend();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 mb-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-3 text-left font-medium text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
      >
        <div className="flex items-center space-x-2">
          <Map className="w-4 h-4" />
          <span>Airspace Legend</span>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4" />
        ) : (
          <ChevronDown className="w-4 h-4" />
        )}
      </button>

      {isExpanded && (
        <div className="px-3 pb-3">
          <div className="max-h-64 overflow-y-auto">
            <div className="grid grid-cols-1 gap-2 text-sm">
              {legend.map((item, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    {/* Color square */}
                    <div
                      className="w-4 h-4 rounded border border-gray-300 dark:border-gray-600 flex-shrink-0"
                      style={{
                        backgroundColor: item.config.fillColor,
                        opacity: item.config.fillOpacity,
                        borderColor: item.config.color,
                        borderWidth: `${item.config.weight}px`,
                      }}
                    />
                    {/* Color line */}
                    <div
                      className="w-6 h-0 flex-shrink-0"
                      style={{
                        borderTopColor: item.config.color,
                        borderTopWidth: `${item.config.weight}px`,
                        borderTopStyle: 'solid',
                      }}
                    />
                  </div>
                  <span className="text-gray-700 dark:text-gray-300 truncate">
                    {item.type}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Colors are based on ICAO airspace classifications and specific airspace types.
              Different countries may use different classification systems.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AirspaceLegend;
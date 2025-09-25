import React from 'react';
import { AltitudeUnit, getUnitLabel } from '@/src/utils/unitConversions';
import { useAltitudeUnit } from '@/src/utils/AltitudeUnitContext';

interface AltitudeUnitSelectorProps {
  className?: string;
}

const AltitudeUnitSelector: React.FC<AltitudeUnitSelectorProps> = ({
  className = '',
}) => {
  const { altitudeUnit, setAltitudeUnit } = useAltitudeUnit();
  const units: AltitudeUnit[] = ['ft', 'm', 'fl'];

  return (
    <div className={`flex flex-col space-y-2 ${className}`}>
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
        Altitude Display Units
      </label>
      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
        {units.map((unit) => (
          <button
            key={unit}
            onClick={() => setAltitudeUnit(unit)}
            className={`
              flex-1 px-3 py-2 text-xs font-medium rounded-md transition-all duration-200
              ${
                altitudeUnit === unit
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-gray-600/50'
              }
            `}
            type="button"
          >
            {unit.toUpperCase()}
          </button>
        ))}
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400">
        Current: {getUnitLabel(altitudeUnit)}
      </p>
    </div>
  );
};

export default AltitudeUnitSelector;
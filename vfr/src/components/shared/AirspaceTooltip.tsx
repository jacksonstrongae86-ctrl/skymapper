import React from 'react';
import { Airspace, Elevation } from '@/src/utils/types';
import { AirspaceColorConfig } from '@/src/utils/airspaceColors';
import { formatElevation, AltitudeUnit } from '@/src/utils/unitConversions';

interface AirspaceTooltipProps {
  airspace: Airspace;
  colorConfig: AirspaceColorConfig;
  altitudeUnit: AltitudeUnit;
}

const AirspaceTooltip: React.FC<AirspaceTooltipProps> = ({
  airspace,
  colorConfig,
  altitudeUnit,
}) => {
  const formatAltitude = (elevation: Elevation | undefined | null): string => {
    if (elevation === undefined || elevation === null) return 'N/A';
    return formatElevation(elevation, altitudeUnit);
  };

  const getActivityStatus = () => {
    // This could be enhanced with actual activity data if available
    if (airspace.name?.toLowerCase().includes('restricted') ||
        airspace.name?.toLowerCase().includes('prohibited')) {
      return { status: '🔴 Active', color: 'text-red-600' };
    }
    if (airspace.name?.toLowerCase().includes('military')) {
      return { status: '🟡 Variable', color: 'text-yellow-600' };
    }
    return { status: '🟢 Standard', color: 'text-green-600' };
  };

  const activity = getActivityStatus();

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-xl p-4 min-w-[280px] max-w-[320px]">
      {/* Header with airspace name and type indicator */}
      <div className="flex items-center space-x-2 mb-3">
        <div
          className="w-4 h-4 rounded-full border-2"
          style={{
            backgroundColor: colorConfig.fillColor,
            borderColor: colorConfig.color,
          }}
        />
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm leading-tight">
            {airspace.name || 'Unnamed Airspace'}
          </h3>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            {colorConfig.name}
          </p>
        </div>
      </div>

      {/* Altitude Information */}
      <div className="space-y-2 mb-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-50 dark:bg-gray-700 rounded-md p-2">
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Lower Limit</p>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">
              {formatAltitude(airspace.lowerLimit)}
            </p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-md p-2">
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Upper Limit</p>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">
              {formatAltitude(airspace.upperLimit)}
            </p>
          </div>
        </div>
      </div>

      {/* Activity Status */}
      <div className="flex items-center justify-between py-2 border-t border-gray-200 dark:border-gray-600">
        <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Status:</span>
        <span className={`text-xs font-semibold ${activity.color}`}>
          {activity.status}
        </span>
      </div>

      {/* Additional Information if available */}
      {(airspace.icaoClass || airspace.type) && (
        <div className="pt-2 border-t border-gray-100 dark:border-gray-700 mt-2">
          <div className="flex flex-wrap gap-2">
            {airspace.icaoClass && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                ICAO Class {airspace.icaoClass}
              </span>
            )}
            {airspace.type && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                Type {airspace.type}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Warning for restricted airspaces */}
      {(colorConfig.name.includes('Restricted') ||
        colorConfig.name.includes('Prohibited') ||
        colorConfig.name.includes('Danger')) && (
        <div className="mt-3 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
          <p className="text-xs text-red-700 dark:text-red-300 font-medium">
            ⚠️ Entry restrictions apply - Check NOTAMs
          </p>
        </div>
      )}
    </div>
  );
};

export default AirspaceTooltip;
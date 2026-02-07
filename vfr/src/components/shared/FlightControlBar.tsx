// Flight Control Bar - Active flight status display
import React, { useState, useEffect } from 'react';
import { GPSPosition } from '../../services/gpsService';

interface FlightControlBarProps {
  currentPosition: GPSPosition;
  flightStartTime: number;
  onEndFlight: () => void;
}

export function FlightControlBar({
  currentPosition,
  flightStartTime,
  onEndFlight,
}: FlightControlBarProps) {
  const [flightTime, setFlightTime] = useState('00:00:00');

  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = Date.now() - flightStartTime;
      const hours = Math.floor(elapsed / (1000 * 60 * 60));
      const minutes = Math.floor((elapsed % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((elapsed % (1000 * 60)) / 1000);

      setFlightTime(
        `${hours.toString().padStart(2, '0')}:${minutes
          .toString()
          .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [flightStartTime]);

  // Convert m/s to knots
  const groundSpeed = Math.round(currentPosition.speed * 1.94384);

  // Convert meters to feet
  const altitude = Math.round(currentPosition.altitude * 3.28084);

  // Round heading
  const heading = Math.round(currentPosition.heading);

  return (
    <div
      className="fixed top-16 left-1/2 transform -translate-x-1/2 z-[500] 
                 bg-gray-900/95 backdrop-blur-sm text-white px-6 py-3 rounded-lg 
                 shadow-2xl border border-green-500/50"
      style={{ minWidth: '600px' }}
    >
      <div className="flex items-center gap-6">
        {/* Status Indicator */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <div className="absolute inset-0 w-3 h-3 bg-green-500 rounded-full animate-ping"></div>
          </div>
          <span className="text-lg font-bold text-green-400">✈️ VUELO ACTIVO</span>
        </div>

        {/* Divider */}
        <div className="h-8 w-px bg-gray-600"></div>

        {/* Flight Data */}
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1.5">
            <span className="text-gray-400">GS:</span>
            <span className="font-mono font-bold text-cyan-400">{groundSpeed} kt</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-gray-400">ALT:</span>
            <span className="font-mono font-bold text-blue-400">{altitude} ft</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-gray-400">HDG:</span>
            <span className="font-mono font-bold text-purple-400">{heading}°</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-gray-400">⏱</span>
            <span className="font-mono font-bold text-yellow-400">{flightTime}</span>
          </div>
        </div>

        {/* Divider */}
        <div className="h-8 w-px bg-gray-600"></div>

        {/* End Flight Button */}
        <button
          onClick={onEndFlight}
          className="bg-red-600 hover:bg-red-700 text-white font-semibold 
                     px-4 py-1.5 rounded transition-colors"
        >
          Finalizar Vuelo
        </button>
      </div>

      {/* GPS Accuracy Indicator */}
      {currentPosition.accuracy > 50 && (
        <div className="mt-2 text-xs text-yellow-400 text-center">
          ⚠️ Precisión GPS baja ({Math.round(currentPosition.accuracy)}m)
        </div>
      )}
    </div>
  );
}

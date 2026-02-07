// InstrumentsPanel.tsx - ForeFlight-style flight instruments
import React, { useRef, useEffect } from 'react';
import { GPSPosition } from '../../services/gpsService';

interface InstrumentsPanelProps {
  currentPosition: GPSPosition | null;
  targetAltitude?: number;
  visible: boolean;
}

interface AltitudeReading {
  altitude: number; // in feet
  timestamp: number;
}

export const InstrumentsPanel: React.FC<InstrumentsPanelProps> = ({
  currentPosition,
  targetAltitude,
  visible,
}) => {
  const altitudeHistoryRef = useRef<AltitudeReading[]>([]);
  const vsiRef = useRef<number>(0);

  useEffect(() => {
    if (!currentPosition) return;

    const currentAltitudeFt = currentPosition.altitude * 3.28084; // meters to feet
    const now = Date.now();

    // Add current reading to history
    altitudeHistoryRef.current.push({
      altitude: currentAltitudeFt,
      timestamp: now,
    });

    // Keep only last 5 readings (for smoothing)
    if (altitudeHistoryRef.current.length > 5) {
      altitudeHistoryRef.current.shift();
    }

    // Calculate VSI if we have at least 2 readings
    if (altitudeHistoryRef.current.length >= 2) {
      const readings = altitudeHistoryRef.current;
      let totalVSI = 0;
      let count = 0;

      // Calculate VSI for each pair and average them
      for (let i = 1; i < readings.length; i++) {
        const prevReading = readings[i - 1];
        const currReading = readings[i];
        const timeDeltaMin = (currReading.timestamp - prevReading.timestamp) / 1000 / 60;
        
        if (timeDeltaMin > 0) {
          const vsi = (currReading.altitude - prevReading.altitude) / timeDeltaMin;
          totalVSI += vsi;
          count++;
        }
      }

      if (count > 0) {
        vsiRef.current = Math.round(totalVSI / count);
      }
    }
  }, [currentPosition]);

  if (!visible || !currentPosition) return null;

  const groundSpeed = Math.round(currentPosition.speed * 1.94384); // m/s to knots
  const altitude = Math.round(currentPosition.altitude * 3.28084); // meters to feet
  const heading = Math.round(currentPosition.heading);
  const verticalSpeed = vsiRef.current;

  return (
    <div
      className="fixed bottom-24 left-1/2 transform -translate-x-1/2 z-[450]
                 bg-gray-900/95 backdrop-blur-sm px-6 py-4 rounded-lg
                 shadow-2xl border border-blue-500/30"
      style={{ minWidth: '800px' }}
    >
      <div className="flex items-center justify-around gap-6">
        {/* Heading Indicator */}
        <div className="flex flex-col items-center">
          <div className="text-xs text-gray-400 mb-2 font-semibold">RUMBO</div>
          <svg width="120" height="120" viewBox="0 0 120 120">
            {/* Outer circle */}
            <circle cx="60" cy="60" r="55" fill="none" stroke="#374151" strokeWidth="2" />
            
            {/* Cardinal directions */}
            <text x="60" y="20" textAnchor="middle" fill="#fff" fontSize="14" fontWeight="bold">N</text>
            <text x="105" y="65" textAnchor="middle" fill="#fff" fontSize="14" fontWeight="bold">E</text>
            <text x="60" y="108" textAnchor="middle" fill="#fff" fontSize="14" fontWeight="bold">S</text>
            <text x="15" y="65" textAnchor="middle" fill="#fff" fontSize="14" fontWeight="bold">O</text>
            
            {/* Heading markers every 30 degrees */}
            {Array.from({ length: 12 }).map((_, i) => {
              const angle = (i * 30 - 90) * Math.PI / 180;
              const x1 = 60 + 48 * Math.cos(angle);
              const y1 = 60 + 48 * Math.sin(angle);
              const x2 = 60 + 52 * Math.cos(angle);
              const y2 = 60 + 52 * Math.sin(angle);
              return (
                <line
                  key={i}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="#9CA3AF"
                  strokeWidth="2"
                />
              );
            })}
            
            {/* Heading arrow (rotates) */}
            <g transform={`rotate(${heading} 60 60)`}>
              <path
                d="M 60 25 L 65 40 L 60 35 L 55 40 Z"
                fill="#EF4444"
                stroke="#DC2626"
                strokeWidth="1"
              />
              <line x1="60" y1="35" x2="60" y2="60" stroke="#EF4444" strokeWidth="2" />
            </g>
            
            {/* Center dot */}
            <circle cx="60" cy="60" r="3" fill="#fff" />
          </svg>
          <div className="text-2xl font-mono font-bold text-purple-400 mt-2">
            {heading}°
          </div>
        </div>

        {/* Altitude Tape */}
        <div className="flex flex-col items-center">
          <div className="text-xs text-gray-400 mb-2 font-semibold">ALTITUD</div>
          <svg width="80" height="140" viewBox="0 0 80 140">
            {/* Background */}
            <rect x="0" y="0" width="80" height="140" fill="#1F2937" rx="4" />
            
            {/* Altitude scale */}
            {Array.from({ length: 7 }).map((_, i) => {
              const alt = altitude + (3 - i) * 500;
              const y = 20 + i * 20;
              return (
                <g key={i}>
                  <line x1="0" y1={y} x2="15" y2={y} stroke="#4B5563" strokeWidth="1" />
                  <text
                    x="20"
                    y={y + 4}
                    fill={i === 3 ? '#60A5FA' : '#9CA3AF'}
                    fontSize="10"
                    fontWeight={i === 3 ? 'bold' : 'normal'}
                  >
                    {Math.round(alt / 100) * 100}
                  </text>
                </g>
              );
            })}
            
            {/* Current altitude indicator */}
            <rect x="0" y="66" width="80" height="28" fill="#1E40AF" rx="2" />
            <text x="40" y="84" textAnchor="middle" fill="#fff" fontSize="16" fontWeight="bold">
              {altitude}
            </text>
            
            {/* Target altitude bug (if set) */}
            {targetAltitude && (
              <g>
                <path
                  d={`M 75 ${70 + (altitude - targetAltitude) / 25} L 80 ${72 + (altitude - targetAltitude) / 25} L 80 ${68 + (altitude - targetAltitude) / 25} Z`}
                  fill="#10B981"
                />
              </g>
            )}
          </svg>
          <div className="text-sm text-gray-400 mt-1">ft MSL</div>
        </div>

        {/* Speed Tape */}
        <div className="flex flex-col items-center">
          <div className="text-xs text-gray-400 mb-2 font-semibold">VELOCIDAD</div>
          <svg width="80" height="140" viewBox="0 0 80 140">
            {/* Background */}
            <rect x="0" y="0" width="80" height="140" fill="#1F2937" rx="4" />
            
            {/* Speed scale */}
            {Array.from({ length: 7 }).map((_, i) => {
              const spd = groundSpeed + (3 - i) * 20;
              const y = 20 + i * 20;
              return (
                <g key={i}>
                  <line x1="65" y1={y} x2="80" y2={y} stroke="#4B5563" strokeWidth="1" />
                  <text
                    x="55"
                    y={y + 4}
                    textAnchor="end"
                    fill={i === 3 ? '#34D399' : '#9CA3AF'}
                    fontSize="10"
                    fontWeight={i === 3 ? 'bold' : 'normal'}
                  >
                    {Math.max(0, Math.round(spd / 10) * 10)}
                  </text>
                </g>
              );
            })}
            
            {/* Current speed indicator */}
            <rect x="0" y="66" width="80" height="28" fill="#059669" rx="2" />
            <text x="40" y="84" textAnchor="middle" fill="#fff" fontSize="16" fontWeight="bold">
              {groundSpeed}
            </text>
          </svg>
          <div className="text-sm text-gray-400 mt-1">kt GS</div>
        </div>

        {/* Vertical Speed Indicator */}
        <div className="flex flex-col items-center">
          <div className="text-xs text-gray-400 mb-2 font-semibold">VSI</div>
          <svg width="100" height="140" viewBox="0 0 100 140">
            {/* Background */}
            <rect x="0" y="0" width="100" height="140" fill="#1F2937" rx="4" />
            
            {/* Scale lines */}
            <line x1="50" y1="70" x2="90" y2="30" stroke="#4B5563" strokeWidth="1" />
            <line x1="50" y1="70" x2="90" y2="50" stroke="#4B5563" strokeWidth="1" />
            <line x1="50" y1="70" x2="95" y2="70" stroke="#4B5563" strokeWidth="2" />
            <line x1="50" y1="70" x2="90" y2="90" stroke="#4B5563" strokeWidth="1" />
            <line x1="50" y1="70" x2="90" y2="110" stroke="#4B5563" strokeWidth="1" />
            
            {/* Scale labels */}
            <text x="92" y="28" fill="#9CA3AF" fontSize="8">2000</text>
            <text x="92" y="48" fill="#9CA3AF" fontSize="8">1000</text>
            <text x="97" y="72" fill="#fff" fontSize="10" fontWeight="bold">0</text>
            <text x="92" y="92" fill="#9CA3AF" fontSize="8">1000</text>
            <text x="92" y="112" fill="#9CA3AF" fontSize="8">2000</text>
            
            {/* VSI arrow */}
            {(() => {
              const clampedVS = Math.max(-2000, Math.min(2000, verticalSpeed));
              const angle = (clampedVS / 2000) * 40; // -40 to +40 degrees
              const color = verticalSpeed > 100 ? '#10B981' : verticalSpeed < -100 ? '#EF4444' : '#9CA3AF';
              return (
                <g transform={`rotate(${angle} 50 70)`}>
                  <line x1="50" y1="70" x2="85" y2="70" stroke={color} strokeWidth="3" />
                  <polygon points="85,70 78,66 78,74" fill={color} />
                </g>
              );
            })()}
            
            {/* Center dot */}
            <circle cx="50" cy="70" r="4" fill="#374151" stroke="#fff" strokeWidth="1" />
          </svg>
          <div className="text-lg font-mono font-bold text-yellow-400 mt-1">
            {verticalSpeed > 0 ? '+' : ''}{verticalSpeed}
          </div>
          <div className="text-sm text-gray-400">ft/min</div>
        </div>
      </div>
    </div>
  );
};

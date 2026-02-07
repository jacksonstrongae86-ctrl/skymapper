'use client';

import { useState } from 'react';
import { GPSPosition } from '@/src/services/gpsService';
import { Gauge, Minimize2, Maximize2 } from 'lucide-react';

interface FlightStatsOverlayProps {
  currentPosition: GPSPosition | null;
  startTime: number;
  maxAltitude: number;
}

export default function FlightStatsOverlay({
  currentPosition,
  startTime,
  maxAltitude,
}: FlightStatsOverlayProps) {
  const [isMinimized, setIsMinimized] = useState(false);

  if (!currentPosition) return null;

  // Calculate elapsed time
  const elapsedMs = Date.now() - startTime;
  const elapsedMin = Math.floor(elapsedMs / 60000);
  const elapsedSec = Math.floor((elapsedMs % 60000) / 1000);

  // Convert speed from m/s to knots
  const groundSpeed = Math.round(currentPosition.speed * 1.94384);

  // Convert altitude from meters to feet
  const altitude = Math.round(currentPosition.altitude * 3.28084);

  // Calculate vertical speed (simple approximation)
  // This would need a more sophisticated implementation with position history
  const verticalSpeed = 0; // Placeholder

  // Format heading
  const heading = Math.round(currentPosition.heading);

  if (isMinimized) {
    return (
      <div className="fixed top-20 right-4 z-[1000]">
        <button
          onClick={() => setIsMinimized(false)}
          className="
            px-3 py-2 rounded-lg
            bg-[var(--sidebar-bg)]/90 backdrop-blur-sm
            border border-[var(--sidebar-border)]
            shadow-lg
            hover:bg-[var(--sidebar-bg)]
            transition-all
          "
        >
          <div className="flex items-center gap-2 text-[var(--text-primary)]">
            <Gauge size={16} />
            <span className="text-sm font-mono font-bold">{groundSpeed} kt</span>
            <span className="text-xs">•</span>
            <span className="text-sm font-mono">{altitude} ft</span>
            <Maximize2 size={14} className="ml-1 text-[var(--text-secondary)]" />
          </div>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed top-20 right-4 z-[1000]">
      <div
        className="
        w-64 p-4 rounded-lg
        bg-[var(--sidebar-bg)]/90 backdrop-blur-sm
        border border-[var(--sidebar-border)]
        shadow-lg
      "
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Gauge size={16} className="text-[var(--text-secondary)]" />
            <span className="text-sm font-medium text-[var(--text-primary)]">
              Instrumentos
            </span>
          </div>
          <button
            onClick={() => setIsMinimized(true)}
            className="
              p-1 rounded hover:bg-[var(--results-hover)]
              transition-colors
            "
          >
            <Minimize2 size={14} className="text-[var(--text-secondary)]" />
          </button>
        </div>

        <div className="space-y-3">
          {/* Ground Speed */}
          <div className="stat-item">
            <div className="text-xs text-[var(--text-secondary)] mb-1">
              Velocidad (GS)
            </div>
            <div className="text-2xl font-mono font-bold text-[var(--text-primary)]">
              {groundSpeed}
              <span className="text-sm ml-1 text-[var(--text-secondary)]">kt</span>
            </div>
          </div>

          {/* Altitude */}
          <div className="stat-item">
            <div className="text-xs text-[var(--text-secondary)] mb-1">
              Altitud
            </div>
            <div className="flex items-baseline gap-2">
              <div className="text-2xl font-mono font-bold text-[var(--text-primary)]">
                {altitude}
                <span className="text-sm ml-1 text-[var(--text-secondary)]">ft</span>
              </div>
              <div className="text-xs text-blue-400">
                Máx: {Math.round(maxAltitude * 3.28084)} ft
              </div>
            </div>
          </div>

          {/* Heading */}
          <div className="stat-item">
            <div className="text-xs text-[var(--text-secondary)] mb-1">
              Rumbo (HDG)
            </div>
            <div className="text-2xl font-mono font-bold text-[var(--text-primary)]">
              {heading.toString().padStart(3, '0')}
              <span className="text-sm ml-1 text-[var(--text-secondary)]">°</span>
            </div>
          </div>

          {/* Vertical Speed */}
          <div className="stat-item">
            <div className="text-xs text-[var(--text-secondary)] mb-1">
              Velocidad Vertical (VS)
            </div>
            <div className="text-xl font-mono font-bold text-[var(--text-primary)]">
              {verticalSpeed >= 0 ? '+' : ''}
              {verticalSpeed}
              <span className="text-sm ml-1 text-[var(--text-secondary)]">ft/min</span>
            </div>
          </div>

          {/* Time Elapsed */}
          <div className="stat-item pt-2 border-t border-[var(--sidebar-border)]">
            <div className="text-xs text-[var(--text-secondary)] mb-1">
              Tiempo Transcurrido
            </div>
            <div className="text-xl font-mono font-bold text-[var(--text-primary)]">
              {elapsedMin.toString().padStart(2, '0')}:
              {elapsedSec.toString().padStart(2, '0')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

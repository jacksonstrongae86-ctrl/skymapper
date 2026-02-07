'use client';

import { useState, useEffect } from 'react';
import { Plane, Square, Navigation, MapPin } from 'lucide-react';
import { gpsService, GPSPosition, FlightRecording } from '@/src/services/gpsService';
import { motionService } from '@/src/services/motionService';
import { FlightRules } from '@/src/utils/types';

interface LiveFlightProps {
  flightRules?: FlightRules;
  onPositionUpdate?: (position: GPSPosition) => void;
  onFlightEnd?: (recording: FlightRecording) => void;
}

export default function LiveFlight({
  flightRules = 'VFR',
  onPositionUpdate,
  onFlightEnd,
}: LiveFlightProps) {
  const [isFlying, setIsFlying] = useState(false);
  const [currentPosition, setCurrentPosition] = useState<GPSPosition | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [autoCenter, setAutoCenter] = useState(true);

  useEffect(() => {
    if (!isFlying) return;

    // Subscribe to GPS updates
    const unsubscribeGPS = gpsService.onPosition((position) => {
      setCurrentPosition(position);
      onPositionUpdate?.(position);
    });

    // Subscribe to motion updates for better heading
    const unsubscribeMotion = motionService.onMotion(() => {
      // Motion data is used internally by the services
    });

    return () => {
      unsubscribeGPS();
      unsubscribeMotion();
    };
  }, [isFlying, onPositionUpdate]);

  const handleStartFlight = async () => {
    try {
      setError(null);
      
      // Request permission and start GPS
      gpsService.start(flightRules);
      motionService.start();
      
      setIsFlying(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar seguimiento GPS');
      console.error('Error starting flight:', err);
    }
  };

  const handleEndFlight = () => {
    const recording = gpsService.stop();
    motionService.stop();
    
    setIsFlying(false);
    setCurrentPosition(null);
    
    onFlightEnd?.(recording);
    
    // Show summary
    showFlightSummary(recording);
  };

  const showFlightSummary = (recording: FlightRecording) => {
    const durationMin = Math.round((Date.now() - recording.startTime) / 60000);
    const distanceKm = (recording.totalDistance / 1000).toFixed(2);
    const maxAltFt = Math.round(recording.maxAltitude * 3.28084);
    const maxSpeedKt = Math.round(recording.maxSpeed * 1.94384);

    // This would ideally be a modal, but for now we'll use alert
    // You can replace this with a proper modal component later
    alert(`
Resumen del Vuelo

Duración: ${durationMin} min
Distancia: ${distanceKm} km
Altitud Máxima: ${maxAltFt} ft
Velocidad Máxima: ${maxSpeedKt} kt
Posiciones Registradas: ${recording.positions.length}
Reglas de Vuelo: ${recording.flightRules}
    `);
  };

  if (!isFlying) {
    return (
      <div className="live-flight-start">
        <button
          onClick={handleStartFlight}
          className="
            w-full px-4 py-3 rounded-lg
            bg-green-600 hover:bg-green-700
            text-white font-medium
            transition-all duration-200
            flex items-center justify-center gap-2
            shadow-md
          "
        >
          <Plane size={20} />
          Iniciar Vuelo
        </button>

        {error && (
          <div className="mt-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
            <p className="text-xs text-red-400">{error}</p>
            <p className="text-xs text-red-400 mt-1">
              Asegúrate de permitir el acceso a la ubicación en tu navegador.
            </p>
          </div>
        )}

        <div className="mt-3 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <p className="text-xs text-blue-400">
            El seguimiento en vivo requiere GPS y permisos de ubicación.
            Se registrará tu trayectoria de vuelo completa.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="live-flight-active space-y-3">
      {/* Active Flight Status */}
      <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-sm font-medium text-green-400">
            Vuelo en Progreso
          </span>
        </div>

        {currentPosition && (
          <div className="text-xs text-[var(--text-secondary)] space-y-1">
            <div className="flex items-center gap-2">
              <MapPin size={12} />
              <span>
                {currentPosition.latitude.toFixed(6)}, {currentPosition.longitude.toFixed(6)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Navigation size={12} />
              <span>
                {Math.round(currentPosition.speed * 1.94384)} kt • {Math.round(currentPosition.altitude * 3.28084)} ft
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Auto-Center Toggle */}
      <div className="flex items-center justify-between">
        <label className="text-xs text-[var(--text-secondary)]">
          Auto-centrar mapa
        </label>
        <button
          onClick={() => setAutoCenter(!autoCenter)}
          className={`
            px-3 py-1 rounded text-xs font-medium transition-all
            ${
              autoCenter
                ? 'bg-[var(--button-bg)] text-[var(--button-text)]'
                : 'bg-[var(--results-bg1)] text-[var(--text-secondary)]'
            }
          `}
        >
          {autoCenter ? 'ON' : 'OFF'}
        </button>
      </div>

      {/* End Flight Button */}
      <button
        onClick={handleEndFlight}
        className="
          w-full px-4 py-3 rounded-lg
          bg-red-600 hover:bg-red-700
          text-white font-medium
          transition-all duration-200
          flex items-center justify-center gap-2
        "
      >
        <Square size={16} />
        Finalizar Vuelo
      </button>
    </div>
  );
}

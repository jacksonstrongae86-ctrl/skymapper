'use client';

import { useMemo } from 'react';
import { Route, Navigation, MapPin } from 'lucide-react';
import { Waypoint } from '@/src/utils/types';

interface IFRRoutePanelProps {
  waypoints: Waypoint[];
}

export default function IFRRoutePanel({ waypoints }: IFRRoutePanelProps) {
  const routeInfo = useMemo(() => {
    if (waypoints.length < 2) return null;

    const fixes = waypoints.map((wp, i) => {
      const name = wp.name && wp.name.match(/^[A-Z]{3,5}$/) 
        ? wp.name 
        : wp.name && wp.name.match(/^[A-Z]{4}$/)
          ? wp.name
          : null;
      
      const lat = wp.position[0];
      const lon = wp.position[1];
      const coordStr = `${Math.abs(lat).toFixed(2)}°${lat >= 0 ? 'N' : 'S'} ${Math.abs(lon).toFixed(2)}°${lon >= 0 ? 'E' : 'W'}`;

      return {
        index: i,
        name: name || `WPT${i + 1}`,
        displayName: wp.name || coordStr,
        coord: coordStr,
        isICAO: !!name && name.length === 4,
        isNamedFix: !!name,
        lat,
        lon,
        altitude: wp.altitude || 0,
      };
    });

    // Build route string from waypoints
    const routeString = fixes.map(f => f.name).join(' DCT ');
    const departure = fixes[0];
    const destination = fixes[fixes.length - 1];

    return { fixes, routeString, departure, destination };
  }, [waypoints]);

  if (!routeInfo || waypoints.length < 2) {
    return (
      <div className="ifr-route-panel space-y-3">
        <div className="flex items-center gap-2 mb-2">
          <Route size={16} className="text-[var(--text-secondary)]" />
          <span className="text-sm font-medium text-[var(--text-primary)]">
            Ruta IFR
          </span>
        </div>
        <div className="text-xs text-[var(--text-secondary)] p-3 rounded-lg border border-[var(--results-border)] bg-[var(--results-bg1)]">
          <MapPin size={14} className="inline mr-1" />
          Añade al menos 2 waypoints en el mapa para generar la ruta IFR.
        </div>
      </div>
    );
  }

  return (
    <div className="ifr-route-panel space-y-3">
      <div className="flex items-center gap-2 mb-2">
        <Route size={16} className="text-[var(--text-secondary)]" />
        <span className="text-sm font-medium text-[var(--text-primary)]">
          Ruta IFR
        </span>
      </div>

      {/* Route String */}
      <div className="p-3 rounded-lg border border-[var(--results-border)] bg-[var(--results-bg1)]">
        <div className="text-xs text-[var(--text-secondary)] mb-1">Cadena de ruta:</div>
        <div className="text-sm font-mono text-[var(--text-primary)] break-all">
          {routeInfo.routeString}
        </div>
      </div>

      {/* Waypoint List */}
      <div className="space-y-1">
        {routeInfo.fixes.map((fix, i) => (
          <div key={fix.index} className="flex items-center gap-2 text-xs">
            {/* Connector */}
            <div className="flex flex-col items-center w-4">
              <div className={`w-2.5 h-2.5 rounded-full ${
                i === 0 ? 'bg-green-500' : 
                i === routeInfo.fixes.length - 1 ? 'bg-red-500' : 
                'bg-blue-400'
              }`} />
              {i < routeInfo.fixes.length - 1 && (
                <div className="w-px h-4 bg-[var(--sidebar-border)]" />
              )}
            </div>

            {/* Fix Info */}
            <div className="flex-1 flex items-center justify-between">
              <div>
                <span className={`font-mono font-medium ${
                  fix.isICAO ? 'text-green-400' : 
                  fix.isNamedFix ? 'text-blue-400' : 
                  'text-[var(--text-primary)]'
                }`}>
                  {fix.name}
                </span>
                {fix.displayName !== fix.name && (
                  <span className="text-[var(--text-secondary)] ml-2">
                    {fix.displayName}
                  </span>
                )}
              </div>
              <div className="text-[var(--text-secondary)]">
                {fix.coord}
              </div>
            </div>

            {/* DCT label between fixes */}
            {i < routeInfo.fixes.length - 1 && (
              <div className="absolute left-6 text-[10px] text-[var(--text-secondary)] font-mono" style={{ display: 'none' }}>
                DCT
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Route Summary */}
      <div className="flex items-center gap-2 p-2 rounded-lg bg-[var(--results-bg1)] border border-[var(--results-border)]">
        <Navigation size={14} className="text-[var(--text-secondary)]" />
        <span className="text-xs text-[var(--text-secondary)]">
          {routeInfo.fixes.length} puntos • {routeInfo.departure.name} → {routeInfo.destination.name} • DCT
        </span>
      </div>

      <div className="text-[10px] text-[var(--text-secondary)]">
        Los puntos se toman directamente de los waypoints del mapa.
      </div>
    </div>
  );
}

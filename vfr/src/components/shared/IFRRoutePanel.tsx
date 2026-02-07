'use client';

import { useState } from 'react';
import { Route, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Airway, Procedure } from '@/src/utils/types';

interface IFRRoutePanelProps {
  onRouteChange?: (airways: Airway[], procedures: Procedure[]) => void;
}

export default function IFRRoutePanel({ }: IFRRoutePanelProps) {
  const [routeString, setRouteString] = useState('');
  const [parsedRoute, setParsedRoute] = useState<{
    valid: boolean;
    airways: string[];
    procedures: string[];
    fixes: string[];
  } | null>(null);

  const parseRouteString = (route: string) => {
    // Simple parser for IFR route strings
    // Example: "LEMD SID BELEN T19 COSTA STAR LEBL"
    
    const parts = route.toUpperCase().trim().split(/\s+/);
    
    const airways: string[] = [];
    const procedures: string[] = [];
    const fixes: string[] = [];
    
    parts.forEach((part) => {
      if (part === 'SID' || part === 'STAR' || part === 'APPROACH') {
        procedures.push(part);
      } else if (part.match(/^[A-Z]\d+$/) || part.match(/^[A-Z]{2,3}\d+$/)) {
        // Airway pattern (T19, UN725, etc.)
        airways.push(part);
      } else if (part.match(/^[A-Z]{4}$/)) {
        // ICAO code (4 letters)
        fixes.push(part);
      } else if (part.match(/^[A-Z]{2,5}$/)) {
        // Fix/waypoint (2-5 letters)
        fixes.push(part);
      }
    });

    const valid = parts.length >= 2 && (airways.length > 0 || fixes.length > 0);

    setParsedRoute({
      valid,
      airways,
      procedures,
      fixes,
    });

    return valid;
  };

  const handleRouteInput = (value: string) => {
    setRouteString(value);
    if (value.trim()) {
      parseRouteString(value);
    } else {
      setParsedRoute(null);
    }
  };

  return (
    <div className="ifr-route-panel space-y-3">
      <div className="flex items-center gap-2 mb-2">
        <Route size={16} className="text-[var(--text-secondary)]" />
        <span className="text-sm font-medium text-[var(--text-primary)]">
          Ruta IFR
        </span>
      </div>

      <div className="space-y-2">
        <textarea
          value={routeString}
          onChange={(e) => handleRouteInput(e.target.value)}
          placeholder="Ej: LEMD SID BELEN T19 COSTA STAR LEBL"
          className="
            w-full px-3 py-2 rounded-lg
            bg-[var(--results-bg1)]
            text-[var(--text-primary)]
            border border-[var(--results-border)]
            focus:outline-none focus:ring-2 focus:ring-[var(--button-bg)]
            placeholder-[var(--text-secondary)]
            text-sm
            resize-none
          "
          rows={3}
        />

        {parsedRoute && (
          <div
            className={`
            p-3 rounded-lg border
            ${
              parsedRoute.valid
                ? 'bg-green-500/10 border-green-500/30'
                : 'bg-red-500/10 border-red-500/30'
            }
          `}
          >
            <div className="flex items-start gap-2">
              {parsedRoute.valid ? (
                <CheckCircle2 size={16} className="text-green-400 mt-0.5" />
              ) : (
                <AlertCircle size={16} className="text-red-400 mt-0.5" />
              )}
              <div className="flex-1 space-y-2">
                <div className="text-xs font-medium">
                  {parsedRoute.valid ? 'Ruta válida' : 'Ruta inválida'}
                </div>

                {parsedRoute.airways.length > 0 && (
                  <div className="text-xs">
                    <span className="text-[var(--text-secondary)]">Aerovías: </span>
                    <span className="text-blue-400 font-mono">
                      {parsedRoute.airways.join(', ')}
                    </span>
                  </div>
                )}

                {parsedRoute.procedures.length > 0 && (
                  <div className="text-xs">
                    <span className="text-[var(--text-secondary)]">Procedimientos: </span>
                    <span className="text-purple-400 font-mono">
                      {parsedRoute.procedures.join(', ')}
                    </span>
                  </div>
                )}

                {parsedRoute.fixes.length > 0 && (
                  <div className="text-xs">
                    <span className="text-[var(--text-secondary)]">Puntos: </span>
                    <span className="text-[var(--text-primary)] font-mono">
                      {parsedRoute.fixes.join(' → ')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="text-xs text-[var(--text-secondary)] space-y-1">
        <div>• Formato: ORIGEN [SID nombre] aerovía punto [STAR nombre] DESTINO</div>
        <div>• Aerovías: T19, UN725, etc.</div>
        <div>• Puntos: BELEN, COSTA, etc.</div>
      </div>
    </div>
  );
}

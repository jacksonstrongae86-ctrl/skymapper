'use client';

import { FlightRules } from '@/src/utils/types';
import { Plane, Navigation } from 'lucide-react';

interface FlightRulesSelectorProps {
  selected: FlightRules;
  onChange: (rules: FlightRules) => void;
}

export default function FlightRulesSelector({
  selected,
  onChange,
}: FlightRulesSelectorProps) {
  const rules: FlightRules[] = ['VFR', 'IFR', 'SVFR'];

  return (
    <div className="flight-rules-selector">
      <div className="flex items-center gap-2 mb-2">
        <Navigation size={16} className="text-[var(--text-secondary)]" />
        <span className="text-sm font-medium text-[var(--text-primary)]">
          Reglas de Vuelo
        </span>
      </div>
      
      <div className="flex gap-2">
        {rules.map((rule) => (
          <button
            key={rule}
            onClick={() => onChange(rule)}
            className={`
              flex-1 px-3 py-2 rounded-lg text-sm font-medium
              transition-all duration-200
              ${
                selected === rule
                  ? 'bg-[var(--button-bg)] text-[var(--button-text)] shadow-md'
                  : 'bg-[var(--results-bg1)] text-[var(--text-secondary)] hover:bg-[var(--results-hover)]'
              }
            `}
          >
            <div className="flex items-center justify-center gap-1">
              {rule === 'IFR' && <Plane size={14} />}
              {rule}
            </div>
          </button>
        ))}
      </div>

      {selected === 'IFR' && (
        <div className="mt-2 p-2 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <p className="text-xs text-blue-400">
            Modo IFR activado. Ahora puedes planificar rutas con aerovías y procedimientos.
          </p>
        </div>
      )}
      
      {selected === 'SVFR' && (
        <div className="mt-2 p-2 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
          <p className="text-xs text-yellow-400">
            SVFR: Requiere autorización ATC especial.
          </p>
        </div>
      )}
    </div>
  );
}

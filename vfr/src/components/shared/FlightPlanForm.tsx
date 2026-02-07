import React, { useState, useEffect } from 'react';
import { Waypoint } from '../../utils/types';

interface FlightPlan {
  flightRules: 'V' | 'I' | 'Y' | 'Z'; // VFR, IFR, Y (IFR then VFR), Z (VFR then IFR)
  aircraftType: string;
  wakeTurbulence: 'L' | 'M' | 'H' | 'J'; // Light, Medium, Heavy, Super (A380)
  equipment: string; // ICAO equipment codes
  surveillance: string; // Surveillance codes
  departureIcao: string;
  departureTime: string; // HHMM format
  cruisingSpeed: string; // Knots or Mach
  cruisingLevel: string; // Altitude/FL
  route: string;
  destinationIcao: string;
  eet: string; // Estimated Enroute Time (HHMM)
  alternateIcao: string;
  alternate2Icao: string;
  otherInfo: string; // PBN/, DOF/, etc.
  endurance: string; // HHMM
  personsOnBoard: string;
  emergencyRadio: string[];
  survivalEquipment: string[];
  lifeJackets: string[];
  dinghies: string;
  aircraftColor: string;
  pilotName: string;
  pilotContact: string;
}

interface FlightPlanFormProps {
  waypoints?: Waypoint[];
  flightRules?: 'VFR' | 'IFR';
  onSave?: (plan: FlightPlan) => void;
}

const defaultFlightPlan: FlightPlan = {
  flightRules: 'V',
  aircraftType: '',
  wakeTurbulence: 'L',
  equipment: 'S',
  surveillance: 'N',
  departureIcao: '',
  departureTime: '',
  cruisingSpeed: 'N0100',
  cruisingLevel: 'A055',
  route: 'DCT',
  destinationIcao: '',
  eet: '0100',
  alternateIcao: '',
  alternate2Icao: '',
  otherInfo: '',
  endurance: '0300',
  personsOnBoard: '1',
  emergencyRadio: ['VHF'],
  survivalEquipment: [],
  lifeJackets: [],
  dinghies: '',
  aircraftColor: '',
  pilotName: '',
  pilotContact: '',
};

export const FlightPlanForm: React.FC<FlightPlanFormProps> = ({ waypoints, flightRules, onSave }) => {
  const [plan, setPlan] = useState<FlightPlan>(defaultFlightPlan);
  const [showIcaoFormat, setShowIcaoFormat] = useState(false);

  // Auto-populate from waypoints
  useEffect(() => {
    if (waypoints && waypoints.length >= 2) {
      const departure = waypoints[0];
      const destination = waypoints[waypoints.length - 1];

      // Build route string (waypoints don't have ICAO codes, only names/positions)
      const routeWaypoints = waypoints.slice(1, -1).map(wp => wp.name || 'DCT').join(' ');

      setPlan(prev => ({
        ...prev,
        departureIcao: departure.name || '',
        destinationIcao: destination.name || '',
        route: routeWaypoints || 'DCT',
      }));
    }
  }, [waypoints]);

  // Auto-set flight rules
  useEffect(() => {
    if (flightRules) {
      setPlan(prev => ({
        ...prev,
        flightRules: flightRules === 'IFR' ? 'I' : 'V',
      }));
    }
  }, [flightRules]);

  const handleChange = (field: keyof FlightPlan, value: string | string[]) => {
    setPlan(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    // Save to localStorage
    const savedPlans = JSON.parse(localStorage.getItem('skymapper-flight-plans') || '[]');
    const newPlan = {
      ...plan,
      id: Date.now(),
      savedAt: new Date().toISOString(),
    };
    savedPlans.push(newPlan);
    localStorage.setItem('skymapper-flight-plans', JSON.stringify(savedPlans));

    if (onSave) {
      onSave(plan);
    }

    alert('Plan de vuelo guardado correctamente');
  };

  const generateICAOFormat = (): string => {
    return `(FPL-${plan.aircraftType}-${plan.flightRules}${plan.wakeTurbulence}
-1${plan.aircraftType}/${plan.equipment}/${plan.surveillance}
-${plan.departureIcao}${plan.departureTime}
-${plan.cruisingSpeed}${plan.cruisingLevel} ${plan.route}
-${plan.destinationIcao}${plan.eet} ${plan.alternateIcao ? plan.alternateIcao : ''}${plan.alternate2Icao ? ' ' + plan.alternate2Icao : ''}
-${plan.otherInfo}
-E/${plan.endurance} P/${plan.personsOnBoard} R/${plan.emergencyRadio.join('')} S/${plan.survivalEquipment.join('')}
J/${plan.lifeJackets.join('')} D/${plan.dinghies} A/${plan.aircraftColor} C/${plan.pilotContact})`;
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '8px',
    fontSize: '14px',
    border: '1px solid var(--sidebar-border)',
    borderRadius: '4px',
    backgroundColor: 'var(--sidebar-bg)',
    color: 'var(--foreground)',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    marginBottom: '4px',
    fontSize: '13px',
    fontWeight: '600',
    color: 'var(--foreground)',
  };

  const sectionStyle: React.CSSProperties = {
    marginBottom: '24px',
    padding: '16px',
    backgroundColor: 'var(--sidebar-bg)',
    border: '1px solid var(--sidebar-border)',
    borderRadius: '8px',
  };

  return (
    <div style={{ fontFamily: 'sans-serif', fontSize: '14px', color: 'var(--foreground)' }}>
      <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: '#fef3c7', border: '1px solid #fbbf24', borderRadius: '4px' }}>
        <strong>⚠️ Nota importante:</strong> Este formulario genera el formato ICAO del plan de vuelo, pero NO lo presenta automáticamente. 
        Debes presentar tu plan de vuelo a través de los canales oficiales (AIS, EUROCONTROL, etc.).
      </div>

      {/* Section 1: Flight Identification */}
      <div style={sectionStyle}>
        <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: '700' }}>
          1. Identificación del Vuelo
        </h3>

        <div style={{ marginBottom: '12px' }}>
          <label style={labelStyle}>Reglas de Vuelo</label>
          <select
            value={plan.flightRules}
            onChange={(e) => handleChange('flightRules', e.target.value)}
            style={inputStyle}
          >
            <option value="V">VFR</option>
            <option value="I">IFR</option>
            <option value="Y">IFR → VFR</option>
            <option value="Z">VFR → IFR</option>
          </select>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px', marginBottom: '12px' }}>
          <div>
            <label style={labelStyle}>Tipo de Aeronave (ICAO)</label>
            <input
              type="text"
              value={plan.aircraftType}
              onChange={(e) => handleChange('aircraftType', e.target.value.toUpperCase())}
              placeholder="ej: C172"
              maxLength={4}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Estela Turbulenta</label>
            <select
              value={plan.wakeTurbulence}
              onChange={(e) => handleChange('wakeTurbulence', e.target.value)}
              style={inputStyle}
            >
              <option value="L">Ligera</option>
              <option value="M">Media</option>
              <option value="H">Pesada</option>
              <option value="J">Super (A380)</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <label style={labelStyle}>Equipamiento</label>
            <input
              type="text"
              value={plan.equipment}
              onChange={(e) => handleChange('equipment', e.target.value.toUpperCase())}
              placeholder="S, G, etc."
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Vigilancia</label>
            <input
              type="text"
              value={plan.surveillance}
              onChange={(e) => handleChange('surveillance', e.target.value.toUpperCase())}
              placeholder="N, C, S, etc."
              style={inputStyle}
            />
          </div>
        </div>
      </div>

      {/* Section 2: Route */}
      <div style={sectionStyle}>
        <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: '700' }}>
          2. Ruta
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px', marginBottom: '12px' }}>
          <div>
            <label style={labelStyle}>Aeródromo de Salida (ICAO)</label>
            <input
              type="text"
              value={plan.departureIcao}
              onChange={(e) => handleChange('departureIcao', e.target.value.toUpperCase())}
              placeholder="LEMD"
              maxLength={4}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Hora de Salida (UTC)</label>
            <input
              type="text"
              value={plan.departureTime}
              onChange={(e) => handleChange('departureTime', e.target.value)}
              placeholder="1430"
              maxLength={4}
              style={inputStyle}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
          <div>
            <label style={labelStyle}>Velocidad de Crucero</label>
            <input
              type="text"
              value={plan.cruisingSpeed}
              onChange={(e) => handleChange('cruisingSpeed', e.target.value.toUpperCase())}
              placeholder="N0100"
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Nivel de Crucero</label>
            <input
              type="text"
              value={plan.cruisingLevel}
              onChange={(e) => handleChange('cruisingLevel', e.target.value.toUpperCase())}
              placeholder="A055"
              style={inputStyle}
            />
          </div>
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label style={labelStyle}>Ruta</label>
          <textarea
            value={plan.route}
            onChange={(e) => handleChange('route', e.target.value.toUpperCase())}
            placeholder="DCT o VOR1 UM123 VOR2 DCT"
            rows={3}
            style={{ ...inputStyle, resize: 'vertical' }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
          <div>
            <label style={labelStyle}>Aeródromo de Destino (ICAO)</label>
            <input
              type="text"
              value={plan.destinationIcao}
              onChange={(e) => handleChange('destinationIcao', e.target.value.toUpperCase())}
              placeholder="LEZL"
              maxLength={4}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>EET (HHMM)</label>
            <input
              type="text"
              value={plan.eet}
              onChange={(e) => handleChange('eet', e.target.value)}
              placeholder="0130"
              maxLength={4}
              style={inputStyle}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '12px' }}>
          <div>
            <label style={labelStyle}>Aeródromo Alternativo 1</label>
            <input
              type="text"
              value={plan.alternateIcao}
              onChange={(e) => handleChange('alternateIcao', e.target.value.toUpperCase())}
              placeholder="OPCIONAL"
              maxLength={4}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Aeródromo Alternativo 2</label>
            <input
              type="text"
              value={plan.alternate2Icao}
              onChange={(e) => handleChange('alternate2Icao', e.target.value.toUpperCase())}
              placeholder="OPCIONAL"
              maxLength={4}
              style={inputStyle}
            />
          </div>
        </div>
      </div>

      {/* Section 3: Other Information */}
      <div style={sectionStyle}>
        <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: '700' }}>
          3. Otra Información
        </h3>

        <div style={{ marginBottom: '12px' }}>
          <label style={labelStyle}>Información Adicional (PBN/, DOF/, etc.)</label>
          <textarea
            value={plan.otherInfo}
            onChange={(e) => handleChange('otherInfo', e.target.value.toUpperCase())}
            placeholder="PBN/A1 DOF/240208"
            rows={2}
            style={{ ...inputStyle, resize: 'vertical' }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <label style={labelStyle}>Autonomía (HHMM)</label>
            <input
              type="text"
              value={plan.endurance}
              onChange={(e) => handleChange('endurance', e.target.value)}
              placeholder="0300"
              maxLength={4}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Personas a Bordo</label>
            <input
              type="text"
              value={plan.personsOnBoard}
              onChange={(e) => handleChange('personsOnBoard', e.target.value)}
              placeholder="1"
              maxLength={3}
              style={inputStyle}
            />
          </div>
        </div>
      </div>

      {/* Section 4: Emergency Equipment */}
      <div style={sectionStyle}>
        <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: '700' }}>
          4. Equipo de Emergencia
        </h3>

        <div style={{ marginBottom: '12px' }}>
          <label style={labelStyle}>Piloto al Mando</label>
          <input
            type="text"
            value={plan.pilotName}
            onChange={(e) => handleChange('pilotName', e.target.value)}
            placeholder="Nombre completo"
            style={inputStyle}
          />
        </div>

        <div>
          <label style={labelStyle}>Contacto</label>
          <input
            type="text"
            value={plan.pilotContact}
            onChange={(e) => handleChange('pilotContact', e.target.value)}
            placeholder="Teléfono o email"
            style={inputStyle}
          />
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
        <button
          onClick={handleSave}
          style={{
            flex: 1,
            padding: '12px',
            fontSize: '14px',
            fontWeight: '600',
            backgroundColor: 'var(--button-bg)',
            color: 'var(--button-text)',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          💾 Guardar Plan
        </button>

        <button
          onClick={() => setShowIcaoFormat(!showIcaoFormat)}
          style={{
            flex: 1,
            padding: '12px',
            fontSize: '14px',
            fontWeight: '600',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          📋 {showIcaoFormat ? 'Ocultar' : 'Ver'} Formato ICAO
        </button>
      </div>

      {/* ICAO Format Output */}
      {showIcaoFormat && (
        <div style={{ marginTop: '16px', padding: '16px', backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '700' }}>Formato ICAO del Plan de Vuelo</h4>
            <button
              onClick={() => {
                navigator.clipboard.writeText(generateICAOFormat());
                alert('Plan de vuelo copiado al portapapeles');
              }}
              style={{
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: '600',
                backgroundColor: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              📋 Copiar
            </button>
          </div>
          <pre
            style={{
              fontFamily: 'monospace',
              fontSize: '12px',
              color: '#1e293b',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              margin: 0,
              padding: '12px',
              backgroundColor: 'white',
              border: '1px solid #cbd5e1',
              borderRadius: '4px',
            }}
          >
            {generateICAOFormat()}
          </pre>
        </div>
      )}
    </div>
  );
};

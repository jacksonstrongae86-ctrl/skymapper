import React, { useEffect, useState } from 'react';
import { METAR, fetchMETAR, getFlightCategoryColor } from '../../services/weatherService';

interface AirportPopupProps {
  icao: string;
  name: string;
  elevation: number;
  type: string;
  frequencies?: Array<{ type: string; frequency: string }>;
  runways?: Array<{ name: string; length: number; surface: string }>;
  onViewDetails?: () => void;
}

export const AirportPopup: React.FC<AirportPopupProps> = ({
  icao,
  name,
  elevation,
  type,
  frequencies,
  runways,
  onViewDetails,
}) => {
  const [metar, setMetar] = useState<METAR | null>(null);

  useEffect(() => {
    const fetchWeather = async () => {
      const metarData = await fetchMETAR(icao);
      if (metarData.length > 0) {
        setMetar(metarData[0]);
      }
    };

    fetchWeather();
  }, [icao]);

  const mainFrequency = frequencies && frequencies.length > 0 ? frequencies[0] : null;
  const mainRunway = runways && runways.length > 0 ? runways[0] : null;

  return (
    <div style={{ minWidth: '280px', fontFamily: 'sans-serif', fontSize: '14px', color: '#1e293b' }}>
      <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>
        {icao} - {name}
      </div>

      <div style={{ display: 'grid', gap: '6px', marginBottom: '10px' }}>
        <div>
          <strong>Tipo:</strong> {type}
        </div>
        <div>
          <strong>Elevación:</strong> {elevation} ft
        </div>
        {mainFrequency && (
          <div>
            <strong>{mainFrequency.type}:</strong> {mainFrequency.frequency} MHz
          </div>
        )}
        {mainRunway && (
          <div>
            <strong>Pista principal:</strong> {mainRunway.name} ({mainRunway.length}m, {mainRunway.surface})
          </div>
        )}
      </div>

      {metar && (
        <div
          style={{
            padding: '8px',
            backgroundColor: getFlightCategoryColor(metar.flightCategory || 'VFR') + '22',
            border: `2px solid ${getFlightCategoryColor(metar.flightCategory || 'VFR')}`,
            borderRadius: '4px',
            marginBottom: '10px',
          }}
        >
          <div
            style={{
              display: 'inline-block',
              padding: '3px 8px',
              backgroundColor: getFlightCategoryColor(metar.flightCategory || 'VFR'),
              color: 'white',
              borderRadius: '3px',
              fontWeight: 'bold',
              fontSize: '12px',
              marginBottom: '6px',
            }}
          >
            {metar.flightCategory || 'UNKNOWN'}
          </div>
          <div style={{ fontSize: '12px', fontFamily: 'monospace', wordWrap: 'break-word' }}>
            {metar.raw.length > 80 ? metar.raw.substring(0, 80) + '...' : metar.raw}
          </div>
        </div>
      )}

      {onViewDetails && (
        <button
          onClick={onViewDetails}
          style={{
            padding: '8px 16px',
            fontSize: '13px',
            fontWeight: '600',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            width: '100%',
          }}
        >
          Ver Detalles Completos
        </button>
      )}
    </div>
  );
};

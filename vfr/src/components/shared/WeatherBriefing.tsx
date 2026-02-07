import React, { useState, useEffect } from 'react';
import {
  METAR,
  TAF,
  fetchMETAR,
  fetchTAF,
  getFlightCategoryColor,
  formatVisibility,
  formatClouds,
  decodeWindDirection,
} from '../../services/weatherService';

interface WeatherBriefingProps {
  departure?: string;
  destination?: string;
  enroute?: string[];
}

export const WeatherBriefing: React.FC<WeatherBriefingProps> = ({ departure, destination, enroute = [] }) => {
  const [metars, setMetars] = useState<Map<string, METAR>>(new Map());
  const [tafs, setTafs] = useState<Map<string, TAF>>(new Map());
  const [loading, setLoading] = useState(false);
  const [goNoGo, setGoNoGo] = useState<'GO' | 'NO-GO' | 'CAUTION' | null>(null);

  useEffect(() => {
    if (!departure && !destination) return;

    const fetchWeather = async () => {
      setLoading(true);

      const allIcaos = [departure, destination, ...enroute].filter(Boolean) as string[];
      if (allIcaos.length === 0) {
        setLoading(false);
        return;
      }

      try {
        // Fetch METAR and TAF for all airports
        const [metarData, tafData] = await Promise.all([fetchMETAR(allIcaos), fetchTAF(allIcaos)]);

        const metarMap = new Map<string, METAR>();
        metarData.forEach((m) => {
          if (m.icao) metarMap.set(m.icao, m);
        });

        const tafMap = new Map<string, TAF>();
        tafData.forEach((t) => {
          if (t.icao) tafMap.set(t.icao, t);
        });

        setMetars(metarMap);
        setTafs(tafMap);

        // Calculate go/no-go recommendation
        const recommendation = calculateRecommendation(metarMap, allIcaos);
        setGoNoGo(recommendation);
      } catch (error) {
        console.error('Error fetching weather briefing:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, [departure, destination, enroute]);

  const calculateRecommendation = (metarMap: Map<string, METAR>, icaos: string[]): 'GO' | 'NO-GO' | 'CAUTION' => {
    let hasIFR = false;
    let hasLIFR = false;
    let hasMVFR = false;

    icaos.forEach((icao) => {
      const metar = metarMap.get(icao);
      if (!metar) return;

      if (metar.flightCategory === 'LIFR') hasLIFR = true;
      if (metar.flightCategory === 'IFR') hasIFR = true;
      if (metar.flightCategory === 'MVFR') hasMVFR = true;
    });

    if (hasLIFR) return 'NO-GO';
    if (hasIFR) return 'NO-GO';
    if (hasMVFR) return 'CAUTION';
    return 'GO';
  };

  const renderAirportWeather = (icao: string, label: string) => {
    const metar = metars.get(icao);
    const taf = tafs.get(icao);

    if (!metar) {
      return (
        <div
          key={icao}
          style={{
            padding: '15px',
            backgroundColor: 'var(--sidebar-bg)',
            borderRadius: '8px',
            border: '1px solid var(--sidebar-border)',
          }}
        >
          <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '5px' }}>
            {label}: {icao}
          </div>
          <div style={{ opacity: 0.6 }}>METAR no disponible</div>
        </div>
      );
    }

    const categoryColor = getFlightCategoryColor(metar.flightCategory || 'VFR');

    return (
      <div
        key={icao}
        style={{
          padding: '15px',
          backgroundColor: 'var(--sidebar-bg)',
          borderRadius: '8px',
          border: `2px solid ${categoryColor}`,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <div style={{ fontSize: '16px', fontWeight: '600' }}>
            {label}: {icao}
          </div>
          <div
            style={{
              padding: '4px 12px',
              backgroundColor: categoryColor,
              color: 'white',
              borderRadius: '4px',
              fontWeight: 'bold',
              fontSize: '14px',
            }}
          >
            {metar.flightCategory || 'UNKNOWN'}
          </div>
        </div>

        <div
          style={{
            padding: '10px',
            backgroundColor: 'var(--background)',
            borderRadius: '4px',
            fontFamily: 'monospace',
            fontSize: '13px',
            marginBottom: '10px',
            wordWrap: 'break-word',
          }}
        >
          {metar.raw}
        </div>

        <div style={{ display: 'grid', gap: '6px', fontSize: '14px' }}>
          {metar.wind && (
            <div>
              <strong>Viento:</strong> {metar.wind.direction}° (
              {decodeWindDirection(metar.wind.direction)}) a {metar.wind.speed} kt
              {metar.wind.gust && ` con rachas de ${metar.wind.gust} kt`}
            </div>
          )}
          {metar.visibility !== undefined && (
            <div>
              <strong>Visibilidad:</strong> {formatVisibility(metar.visibility)}
            </div>
          )}
          {metar.clouds && metar.clouds.length > 0 && (
            <div>
              <strong>Nubes:</strong> {formatClouds(metar.clouds)}
            </div>
          )}
          {metar.temperature !== undefined && metar.dewpoint !== undefined && (
            <div>
              <strong>Temperatura/Punto rocío:</strong> {metar.temperature}°C / {metar.dewpoint}°C
            </div>
          )}
          {metar.altimeter && (
            <div>
              <strong>QNH:</strong> {metar.altimeter.toFixed(2)}&quot; ({Math.round(metar.altimeter * 33.8639)} hPa)
            </div>
          )}
        </div>

        {taf && (
          <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--sidebar-border)' }}>
            <div style={{ fontWeight: '600', marginBottom: '6px' }}>TAF:</div>
            <div
              style={{
                padding: '10px',
                backgroundColor: 'var(--background)',
                borderRadius: '4px',
                fontFamily: 'monospace',
                fontSize: '12px',
                wordWrap: 'break-word',
              }}
            >
              {taf.raw}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ padding: '20px', color: 'var(--foreground)', maxWidth: '1000px', margin: '0 auto' }}>
      <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>🌤️ Briefing Meteorológico</h2>

      {loading && (
        <div style={{ textAlign: 'center', padding: '40px', opacity: 0.6 }}>Cargando datos meteorológicos...</div>
      )}

      {!loading && (!departure && !destination) && (
        <div style={{ textAlign: 'center', padding: '40px', opacity: 0.6 }}>
          Selecciona aeródromos de salida y destino para ver el briefing meteorológico
        </div>
      )}

      {!loading && (departure || destination) && (
        <>
          {/* Go/No-Go recommendation */}
          {goNoGo && (
            <div
              style={{
                padding: '20px',
                backgroundColor:
                  goNoGo === 'GO'
                    ? '#22c55e22'
                    : goNoGo === 'NO-GO'
                    ? '#ef444422'
                    : '#eab30822',
                border: `3px solid ${
                  goNoGo === 'GO'
                    ? '#22c55e'
                    : goNoGo === 'NO-GO'
                    ? '#ef4444'
                    : '#eab308'
                }`,
                borderRadius: '8px',
                marginBottom: '30px',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>
                {goNoGo === 'GO' && '✅ CONDICIONES VFR'}
                {goNoGo === 'NO-GO' && '⛔ NO VOLAR VFR'}
                {goNoGo === 'CAUTION' && '⚠️ PRECAUCIÓN - MVFR'}
              </div>
              <div style={{ fontSize: '14px', opacity: 0.8 }}>
                {goNoGo === 'GO' &&
                  'Todas las estaciones reportan condiciones VFR. Vuelo seguro.'}
                {goNoGo === 'NO-GO' &&
                  'Una o más estaciones reportan condiciones IFR o LIFR. No recomendado para VFR.'}
                {goNoGo === 'CAUTION' &&
                  'Una o más estaciones reportan condiciones MVFR. Evaluar experiencia y equipamiento.'}
              </div>
            </div>
          )}

          {/* Weather for each airport */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {departure && renderAirportWeather(departure, 'Salida')}
            {enroute.map((icao, idx) => renderAirportWeather(icao, `En ruta ${idx + 1}`))}
            {destination && renderAirportWeather(destination, 'Destino')}
          </div>

          <div
            style={{
              marginTop: '30px',
              padding: '15px',
              backgroundColor: 'var(--sidebar-bg)',
              borderRadius: '8px',
              fontSize: '13px',
              opacity: 0.7,
              textAlign: 'center',
            }}
          >
            Datos obtenidos de aviationweather.gov • Actualizar cada 10 minutos • Solo para planificación
          </div>
        </>
      )}
    </div>
  );
};

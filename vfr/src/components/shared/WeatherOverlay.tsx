import React, { useEffect, useState } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import { METAR, fetchMETAR, getFlightCategoryColor, formatVisibility, formatClouds, decodeWindDirection } from '../../services/weatherService';

interface WeatherOverlayProps {
  airports: Array<{ icao: string; lat: number; lon: number; name: string }>;
  enabled: boolean;
}

export const WeatherOverlay: React.FC<WeatherOverlayProps> = ({ airports, enabled }) => {
  const map = useMap();
  const [metars, setMetars] = useState<Map<string, METAR>>(new Map());
  const [markers, setMarkers] = useState<Map<string, L.CircleMarker>>(new Map());

  // Fetch weather every 10 minutes
  useEffect(() => {
    const clearAllMarkers = () => {
      markers.forEach((marker) => marker.remove());
      setMarkers(new Map());
    };

    if (!enabled) {
      clearAllMarkers();
      return;
    }

    const fetchWeather = async () => {
      if (airports.length === 0) return;

      // Fetch METAR for all visible airports
      const icaos = airports.map((a) => a.icao).filter(Boolean);
      if (icaos.length === 0) return;

      const metarData = await fetchMETAR(icaos);
      const metarMap = new Map<string, METAR>();
      metarData.forEach((metar) => {
        if (metar.icao) {
          metarMap.set(metar.icao, metar);
        }
      });

      setMetars(metarMap);
    };

    fetchWeather();

    // Auto-refresh every 10 minutes
    const interval = setInterval(fetchWeather, 10 * 60 * 1000);

    return () => {
      clearInterval(interval);
      clearAllMarkers();
    };
  }, [airports, enabled, markers]);

  // Update markers when METAR data changes
  useEffect(() => {
    const clearAllMarkers = () => {
      markers.forEach((marker) => marker.remove());
      setMarkers(new Map());
    };

    if (!enabled) {
      clearAllMarkers();
      return;
    }

    // Clear existing markers
    clearAllMarkers();

    const newMarkers = new Map<string, L.CircleMarker>();

    airports.forEach((airport) => {
      const metar = metars.get(airport.icao);
      if (!metar) return;

      const color = getFlightCategoryColor(metar.flightCategory || 'VFR');

      const marker = L.circleMarker([airport.lat, airport.lon], {
        radius: 8,
        fillColor: color,
        fillOpacity: 0.8,
        color: '#ffffff',
        weight: 2,
      });

      // Popup content
      const popupContent = createPopupContent(airport, metar);
      marker.bindPopup(popupContent, { maxWidth: 400 });

      marker.addTo(map);
      newMarkers.set(airport.icao, marker);
    });

    setMarkers(newMarkers);

    return () => {
      clearAllMarkers();
    };
  }, [map, airports, metars, enabled, markers]);

  const createPopupContent = (airport: { icao: string; name: string }, metar: METAR): string => {
    const category = metar.flightCategory || 'UNKNOWN';
    const categoryColor = getFlightCategoryColor(category);

    let html = `
      <div style="font-family: monospace; font-size: 13px; min-width: 300px;">
        <div style="font-size: 16px; font-weight: bold; margin-bottom: 8px;">
          ${airport.icao} - ${airport.name}
        </div>
        
        <div style="
          display: inline-block;
          padding: 4px 12px;
          background-color: ${categoryColor};
          color: white;
          border-radius: 4px;
          font-weight: bold;
          margin-bottom: 10px;
        ">
          ${category}
        </div>
        
        <div style="margin-top: 10px; padding: 8px; background: #f1f5f9; border-radius: 4px;">
          <div style="font-weight: bold; margin-bottom: 4px; color: #1e293b;">RAW METAR:</div>
          <div style="color: #334155; word-wrap: break-word;">${metar.raw}</div>
        </div>
        
        <div style="margin-top: 10px; display: grid; gap: 6px;">
    `;

    if (metar.wind) {
      const windDir = typeof metar.wind.direction === 'number' ? metar.wind.direction : metar.wind.direction;
      const compass = decodeWindDirection(windDir);
      html += `
        <div><strong>Viento:</strong> ${windDir}° (${compass}) a ${metar.wind.speed} kt${
        metar.wind.gust ? ` con rachas de ${metar.wind.gust} kt` : ''
      }</div>
      `;
    }

    if (metar.visibility !== undefined) {
      html += `<div><strong>Visibilidad:</strong> ${formatVisibility(metar.visibility)}</div>`;
    }

    if (metar.clouds && metar.clouds.length > 0) {
      html += `<div><strong>Nubes:</strong> ${formatClouds(metar.clouds)}</div>`;
    }

    if (metar.temperature !== undefined && metar.dewpoint !== undefined) {
      html += `<div><strong>Temperatura/Punto de rocío:</strong> ${metar.temperature}°C / ${metar.dewpoint}°C</div>`;
    }

    if (metar.altimeter) {
      const qnh = Math.round(metar.altimeter * 33.8639); // Convert inHg to hPa
      html += `<div><strong>QNH:</strong> ${metar.altimeter.toFixed(2)}" (${qnh} hPa)</div>`;
    }

    if (metar.remarks) {
      html += `
        <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #cbd5e1;">
          <strong>Observaciones:</strong> ${metar.remarks}
        </div>
      `;
    }

    html += `
        </div>
      </div>
    `;

    return html;
  };

  return null; // This component only manages markers, no UI
};

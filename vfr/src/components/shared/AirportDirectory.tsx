import React, { useState, useEffect } from 'react';
import { METAR, fetchMETAR, getFlightCategoryColor } from '../../services/weatherService';
import { Airport } from '../../utils/types';

interface AirportDirectoryProps {
  airports: Airport[];
  userPosition?: { lat: number; lon: number };
  onSelectAirport?: (airport: Airport) => void;
}

export const AirportDirectory: React.FC<AirportDirectoryProps> = ({ airports, userPosition, onSelectAirport }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAirport, setSelectedAirport] = useState<Airport | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterSurface, setFilterSurface] = useState<string>('all');
  const [minRunwayLength, setMinRunwayLength] = useState<number>(0);
  const [sortBy, setSortBy] = useState<'name' | 'distance'>('name');
  const [metar, setMetar] = useState<METAR | null>(null);

  // Helper to get coordinates from geometry
  const getCoords = (airport: Airport): { lat: number; lon: number } | null => {
    if (airport.geometry?.type === 'Point' && airport.geometry.coordinates) {
      return { lat: airport.geometry.coordinates[1], lon: airport.geometry.coordinates[0] };
    }
    return null;
  };

  // Fetch METAR when airport is selected
  useEffect(() => {
    if (!selectedAirport || !selectedAirport.icaoCode) {
      setMetar(null);
      return;
    }

    const fetchWeather = async () => {
      const metarData = await fetchMETAR(selectedAirport.icaoCode);
      if (metarData.length > 0) {
        setMetar(metarData[0]);
      } else {
        setMetar(null);
      }
    };

    fetchWeather();
  }, [selectedAirport]);

  // Calculate distance from user position
  const calculateDistance = (airport: Airport): number => {
    if (!userPosition) return 0;

    const coords = getCoords(airport);
    if (!coords) return 0;

    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const R = 6371; // Earth radius in km

    const dLat = toRad(coords.lat - userPosition.lat);
    const dLon = toRad(coords.lon - userPosition.lon);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(userPosition.lat)) *
        Math.cos(toRad(coords.lat)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  };

  // Filter and sort airports
  const filteredAirports = airports
    .filter((airport) => {
      // Search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const icao = airport.icaoCode || '';
        const name = airport.name || '';
        if (
          !icao.toLowerCase().includes(query) &&
          !name.toLowerCase().includes(query)
        ) {
          return false;
        }
      }

      // Type filter
      if (filterType !== 'all') {
        // Map type numbers to names (simplified)
        const typeMap: Record<number, string> = {
          1: 'large_airport',
          2: 'medium_airport',
          3: 'small_airport',
          4: 'heliport',
        };
        const airportType = typeMap[airport.type] || 'small_airport';
        if (airportType !== filterType) {
          return false;
        }
      }

      // Surface filter (skip for now - would need runway data)
      // Runway length filter (skip for now - would need runway data)

      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'distance' && userPosition) {
        return calculateDistance(a) - calculateDistance(b);
      }
      return (a.name || '').localeCompare(b.name || '');
    });

  const handleSelectAirport = (airport: Airport) => {
    setSelectedAirport(airport);
    if (onSelectAirport) {
      onSelectAirport(airport);
    }
  };

  const inputStyle: React.CSSProperties = {
    padding: '8px',
    fontSize: '14px',
    backgroundColor: 'var(--sidebar-bg)',
    color: 'var(--foreground)',
    border: '1px solid var(--sidebar-border)',
    borderRadius: '4px',
    width: '100%',
  };

  return (
    <div style={{ padding: '20px', color: 'var(--foreground)', maxWidth: '1400px', margin: '0 auto' }}>
      <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>🛫 Directorio de Aeródromos</h2>

      {/* Filters */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '15px',
          marginBottom: '20px',
          padding: '20px',
          backgroundColor: 'var(--sidebar-bg)',
          borderRadius: '8px',
        }}
      >
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>Buscar:</label>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ICAO o nombre..."
            style={inputStyle}
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>Tipo:</label>
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)} style={inputStyle}>
            <option value="all">Todos</option>
            <option value="large_airport">Aeropuerto grande</option>
            <option value="medium_airport">Aeropuerto mediano</option>
            <option value="small_airport">Aeropuerto pequeño</option>
            <option value="heliport">Helipuerto</option>
          </select>
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>Superficie:</label>
          <select value={filterSurface} onChange={(e) => setFilterSurface(e.target.value)} style={inputStyle}>
            <option value="all">Todas</option>
            <option value="asphalt">Asfalto</option>
            <option value="concrete">Hormigón</option>
            <option value="grass">Hierba</option>
          </select>
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>Long. pista mín. (m):</label>
          <input
            type="number"
            value={minRunwayLength}
            onChange={(e) => setMinRunwayLength(parseInt(e.target.value) || 0)}
            style={inputStyle}
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>Ordenar por:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'name' | 'distance')}
            style={inputStyle}
          >
            <option value="name">Nombre</option>
            {userPosition && <option value="distance">Distancia</option>}
          </select>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selectedAirport ? '1fr 2fr' : '1fr', gap: '20px' }}>
        {/* Airport list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '70vh', overflowY: 'auto' }}>
          {filteredAirports.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px', opacity: 0.6 }}>
              No se encontraron aeródromos con los filtros seleccionados
            </div>
          )}
          {filteredAirports.map((airport) => {
            const distance = userPosition ? calculateDistance(airport) : null;
            const icao = airport.icaoCode || airport._id;
            const elevation = airport.elevation?.value || 0;
            return (
              <div
                key={airport._id}
                onClick={() => handleSelectAirport(airport)}
                style={{
                  padding: '12px',
                  backgroundColor:
                    selectedAirport?._id === airport._id ? 'var(--button-hover)' : 'var(--sidebar-bg)',
                  borderRadius: '6px',
                  border: '1px solid var(--sidebar-border)',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                }}
                onMouseEnter={(e) => {
                  if (selectedAirport?._id !== airport._id) {
                    e.currentTarget.style.backgroundColor = 'var(--button-bg)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedAirport?._id !== airport._id) {
                    e.currentTarget.style.backgroundColor = 'var(--sidebar-bg)';
                  }
                }}
              >
                <div style={{ fontWeight: '600', fontSize: '15px', marginBottom: '3px' }}>
                  {icao} - {airport.name}
                </div>
                <div style={{ fontSize: '13px', opacity: 0.8 }}>
                  Elevación: {elevation} ft
                  {distance && ` • ${distance.toFixed(1)} km`}
                </div>
              </div>
            );
          })}
        </div>

        {/* Airport details */}
        {selectedAirport && (() => {
          const icao = selectedAirport.icaoCode || selectedAirport._id;
          const elevation = selectedAirport.elevation?.value || 0;
          const coords = getCoords(selectedAirport);
          const typeMap: Record<number, string> = {
            1: 'Aeropuerto grande',
            2: 'Aeropuerto mediano',
            3: 'Aeropuerto pequeño',
            4: 'Helipuerto',
          };
          const typeLabel = typeMap[selectedAirport.type] || 'Desconocido';

          return (
            <div
              style={{
                padding: '20px',
                backgroundColor: 'var(--sidebar-bg)',
                borderRadius: '8px',
                border: '1px solid var(--sidebar-border)',
                maxHeight: '70vh',
                overflowY: 'auto',
              }}
            >
              <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '15px' }}>
                {icao} - {selectedAirport.name}
              </h3>

              <div style={{ display: 'grid', gap: '15px' }}>
                <div>
                  <div style={{ fontWeight: '600', marginBottom: '5px' }}>Información General:</div>
                  <div style={{ fontSize: '14px', display: 'grid', gap: '3px' }}>
                    <div>Tipo: {typeLabel}</div>
                    <div>Elevación: {elevation} ft</div>
                    {coords && (
                      <div>
                        Coordenadas: {coords.lat.toFixed(4)}°, {coords.lon.toFixed(4)}°
                      </div>
                    )}
                    {userPosition && <div>Distancia: {calculateDistance(selectedAirport).toFixed(1)} km</div>}
                  </div>
                </div>

                {/* Frequencies and runways not available in OpenAIP airport data */}
                {/* Would need to load from separate data source */}

                {metar && (
                  <div>
                    <div style={{ fontWeight: '600', marginBottom: '5px' }}>Meteorología Actual:</div>
                    <div
                      style={{
                        padding: '10px',
                        backgroundColor: getFlightCategoryColor(metar.flightCategory || 'VFR') + '22',
                        border: `2px solid ${getFlightCategoryColor(metar.flightCategory || 'VFR')}`,
                        borderRadius: '4px',
                      }}
                    >
                      <div
                        style={{
                          display: 'inline-block',
                          padding: '4px 10px',
                          backgroundColor: getFlightCategoryColor(metar.flightCategory || 'VFR'),
                          color: 'white',
                          borderRadius: '4px',
                          fontWeight: 'bold',
                          marginBottom: '8px',
                        }}
                      >
                        {metar.flightCategory || 'UNKNOWN'}
                      </div>
                      <div style={{ fontFamily: 'monospace', fontSize: '13px', wordWrap: 'break-word' }}>
                        {metar.raw}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { METAR, fetchMETAR, getFlightCategoryColor } from '../../services/weatherService';
import { Airport } from '../../utils/types';

interface AirportDirectoryProps {
  airports: Airport[];
  userPosition?: { lat: number; lon: number };
  onSelectAirport?: (airport: Airport) => void;
}

interface TAFData {
  raw: string;
  icao: string;
}

interface NOTAMData {
  id: string;
  icao: string;
  message: string;
  effective: string;
  expires?: string;
}

type TabType = 'info' | 'weather' | 'notams' | 'runways';

export const AirportDirectory: React.FC<AirportDirectoryProps> = ({ airports, userPosition, onSelectAirport }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAirport, setSelectedAirport] = useState<Airport | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'distance'>('name');
  const [searchResults, setSearchResults] = useState<Airport[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [metar, setMetar] = useState<METAR | null>(null);
  const [taf, setTaf] = useState<TAFData | null>(null);
  const [notams, setNotams] = useState<NOTAMData[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('info');
  const [loadingWeather, setLoadingWeather] = useState(false);
  const [loadingNotams, setLoadingNotams] = useState(false);

  // Helper to get coordinates from geometry
  const getCoords = (airport: Airport): { lat: number; lon: number } | null => {
    if (airport.geometry?.type === 'Point' && airport.geometry.coordinates) {
      return { lat: airport.geometry.coordinates[1], lon: airport.geometry.coordinates[0] };
    }
    return null;
  };

  // Search airports via API when search query changes
  useEffect(() => {
    const searchAirports = async () => {
      if (!searchQuery || searchQuery.length < 2) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const response = await fetch(`/api/airports?search=${encodeURIComponent(searchQuery)}`);
        if (response.ok) {
          const data = await response.json();
          setSearchResults(data.airports || []);
        } else {
          setSearchResults([]);
        }
      } catch (error) {
        console.error('Error searching airports:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    const debounceTimeout = setTimeout(searchAirports, 300);
    return () => clearTimeout(debounceTimeout);
  }, [searchQuery]);

  // Fetch METAR and TAF when airport is selected and weather tab is opened
  useEffect(() => {
    if (!selectedAirport || !selectedAirport.icaoCode || activeTab !== 'weather') {
      return;
    }

    const fetchWeather = async () => {
      setLoadingWeather(true);
      try {
        // Fetch METAR
        const metarData = await fetchMETAR(selectedAirport.icaoCode!);
        if (metarData.length > 0) {
          setMetar(metarData[0]);
        } else {
          setMetar(null);
        }

        // Fetch TAF
        try {
          const tafResponse = await fetch(`/api/weather/taf?icao=${selectedAirport.icaoCode}`);
          if (tafResponse.ok) {
            const tafData = await tafResponse.json();
            if (tafData && tafData.raw) {
              setTaf(tafData);
            } else {
              setTaf(null);
            }
          }
        } catch (err) {
          console.error('Error fetching TAF:', err);
          setTaf(null);
        }
      } catch (err) {
        console.error('Error fetching weather:', err);
      } finally {
        setLoadingWeather(false);
      }
    };

    fetchWeather();
  }, [selectedAirport, activeTab]);

  // Fetch NOTAMs when airport is selected and notams tab is opened
  useEffect(() => {
    if (!selectedAirport || !selectedAirport.icaoCode || activeTab !== 'notams') {
      return;
    }

    const fetchNotams = async () => {
      setLoadingNotams(true);
      try {
        const response = await fetch(`/api/notams?icao=${selectedAirport.icaoCode}`);
        if (response.ok) {
          const data = await response.json();
          setNotams(data.notams || []);
        } else {
          setNotams([]);
        }
      } catch (err) {
        console.error('Error fetching NOTAMs:', err);
        setNotams([]);
      } finally {
        setLoadingNotams(false);
      }
    };

    fetchNotams();
  }, [selectedAirport, activeTab]);

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

  // Use search results if searching, otherwise use provided airports
  const airportList = searchQuery && searchQuery.length >= 2 ? searchResults : airports;

  // Filter and sort airports
  const filteredAirports = airportList
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
    setActiveTab('info');
    setMetar(null);
    setTaf(null);
    setNotams([]);
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

  const tabButtonStyle = (isActive: boolean): React.CSSProperties => ({
    padding: '10px 20px',
    fontSize: '14px',
    fontWeight: isActive ? '600' : '500',
    backgroundColor: isActive ? 'var(--button-bg)' : 'transparent',
    color: isActive ? 'var(--accent-color)' : 'var(--foreground)',
    border: 'none',
    borderBottom: isActive ? '3px solid var(--accent-color)' : '3px solid transparent',
    cursor: 'pointer',
    transition: 'all 0.2s',
  });

  // Simple runway diagram (SVG)
  const renderRunwayDiagram = () => {
    if (!selectedAirport?.runways || selectedAirport.runways.length === 0) {
      return (
        <div style={{ textAlign: 'center', padding: '40px', opacity: 0.6 }}>
          <p>Información de pistas no disponible</p>
        </div>
      );
    }

    const surfaceTypeMap: Record<number, string> = {
      1: 'Asfalto',
      2: 'Hormigón',
      3: 'Hierba',
      4: 'Grava',
      5: 'Tierra',
      6: 'Arena',
      7: 'Nieve',
      8: 'Agua',
    };

    return (
      <div style={{ display: 'grid', gap: '30px' }}>
        {selectedAirport.runways.map((runway, idx) => {
          const heading = runway.trueHeading || 0;
          const length = runway.dimension?.length?.value || 0;
          const width = runway.dimension?.width?.value || 0;
          const surfaceType = runway.surface?.mainComposite 
            ? surfaceTypeMap[runway.surface.mainComposite] || 'Desconocido'
            : 'Desconocido';
          
          // Get opposite runway designator (e.g., 14 -> 32)
          const designator = runway.designator || '??';
          const heading1 = parseInt(designator.replace(/[LRC]/g, ''));
          const heading2 = ((heading1 + 18) % 36) || 36;
          const opposite = heading2.toString().padStart(2, '0');

          return (
            <div
              key={runway._id || idx}
              style={{
                padding: '20px',
                backgroundColor: 'var(--input-bg)',
                border: '1px solid var(--sidebar-border)',
                borderRadius: '8px',
              }}
            >
              <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '15px' }}>
                Pista {designator}/{opposite}
              </h4>
              
              {/* Runway diagram SVG */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                marginBottom: '15px',
                minHeight: '200px',
              }}>
                <svg width="300" height="200" viewBox="0 0 300 200">
                  {/* Background */}
                  <rect x="0" y="0" width="300" height="200" fill="transparent" />
                  
                  {/* Runway rectangle - oriented by heading */}
                  <g transform={`translate(150, 100) rotate(${heading}) translate(-75, -40)`}>
                    {/* Runway surface */}
                    <rect
                      x="0"
                      y="0"
                      width="150"
                      height="80"
                      fill="#4B5563"
                      stroke="#1F2937"
                      strokeWidth="2"
                      rx="2"
                    />
                    
                    {/* Center line dashes */}
                    {Array.from({ length: 10 }).map((_, i) => (
                      <rect
                        key={i}
                        x={10 + i * 14}
                        y="36"
                        width="8"
                        height="8"
                        fill="white"
                        opacity="0.9"
                      />
                    ))}
                    
                    {/* Runway numbers (counter-rotated to stay upright) */}
                    <g transform={`translate(15, 40) rotate(-${heading})`}>
                      <text
                        x="0"
                        y="0"
                        textAnchor="middle"
                        fill="white"
                        fontSize="24"
                        fontWeight="bold"
                      >
                        {designator}
                      </text>
                    </g>
                    
                    <g transform={`translate(135, 40) rotate(-${heading})`}>
                      <text
                        x="0"
                        y="0"
                        textAnchor="middle"
                        fill="white"
                        fontSize="24"
                        fontWeight="bold"
                      >
                        {opposite}
                      </text>
                    </g>
                  </g>
                  
                  {/* Compass heading indicator */}
                  <g transform="translate(270, 20)">
                    <circle cx="0" cy="0" r="15" fill="none" stroke="#9CA3AF" strokeWidth="1" />
                    <line x1="0" y1="-12" x2="0" y2="-8" stroke="#EF4444" strokeWidth="2" />
                    <text x="0" y="-18" textAnchor="middle" fill="#9CA3AF" fontSize="10">N</text>
                    <text x="0" y="6" textAnchor="middle" fill="#9CA3AF" fontSize="9" fontWeight="bold">
                      {heading.toString().padStart(3, '0')}°
                    </text>
                  </g>
                </svg>
              </div>

              {/* Runway details */}
              <div style={{ display: 'grid', gap: '8px', fontSize: '14px' }}>
                <div>
                  <strong>Rumbo verdadero:</strong> {heading.toString().padStart(3, '0')}°
                </div>
                <div>
                  <strong>Dimensiones:</strong> {length > 0 ? `${length}m × ${width}m` : 'Desconocido'}
                </div>
                <div>
                  <strong>Superficie:</strong> {surfaceType}
                </div>
                {runway.operations && (
                  <div>
                    <strong>Operaciones:</strong>{' '}
                    {runway.takeOffOnly ? 'Solo despegue' : runway.landingOnly ? 'Solo aterrizaje' : 'Despegue y aterrizaje'}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
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
          {isSearching && (
            <div style={{ textAlign: 'center', padding: '40px', opacity: 0.6 }}>
              Buscando aeródromos...
            </div>
          )}
          {!isSearching && filteredAirports.length === 0 && airportList.length === 0 && !searchQuery && (
            <div style={{ 
              textAlign: 'center', 
              padding: '40px',
              backgroundColor: 'var(--sidebar-bg)',
              borderRadius: '8px',
              border: '2px dashed var(--sidebar-border)',
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🛩️</div>
              <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>
                Busca aeródromos por código ICAO o nombre
              </div>
              <div style={{ fontSize: '14px', opacity: 0.7 }}>
                Escribe en el campo de búsqueda para encontrar aeropuertos
              </div>
            </div>
          )}
          {!isSearching && filteredAirports.length === 0 && (airportList.length > 0 || searchQuery) && (
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

        {/* Airport details with tabs */}
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
                backgroundColor: 'var(--sidebar-bg)',
                borderRadius: '8px',
                border: '1px solid var(--sidebar-border)',
                maxHeight: '70vh',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div style={{ padding: '20px', borderBottom: '1px solid var(--sidebar-border)' }}>
                <h3 style={{ fontSize: '20px', fontWeight: 'bold' }}>
                  {icao} - {selectedAirport.name}
                </h3>
              </div>

              {/* Tabs */}
              <div style={{ display: 'flex', borderBottom: '1px solid var(--sidebar-border)' }}>
                <button
                  onClick={() => setActiveTab('info')}
                  style={tabButtonStyle(activeTab === 'info')}
                >
                  📋 Info
                </button>
                <button
                  onClick={() => setActiveTab('weather')}
                  style={tabButtonStyle(activeTab === 'weather')}
                >
                  🌤️ Meteorología
                </button>
                <button
                  onClick={() => setActiveTab('notams')}
                  style={tabButtonStyle(activeTab === 'notams')}
                >
                  ⚠️ NOTAMs
                </button>
                <button
                  onClick={() => setActiveTab('runways')}
                  style={tabButtonStyle(activeTab === 'runways')}
                >
                  🛬 Pistas
                </button>
              </div>

              {/* Tab Content */}
              <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
                {activeTab === 'info' && (
                  <div style={{ display: 'grid', gap: '15px' }}>
                    <div>
                      <div style={{ fontWeight: '600', marginBottom: '5px' }}>Información General:</div>
                      <div style={{ fontSize: '14px', display: 'grid', gap: '5px' }}>
                        <div>ICAO: <strong>{icao}</strong></div>
                        <div>Tipo: {typeLabel}</div>
                        <div>Elevación: <strong>{elevation} ft MSL</strong></div>
                        {coords && (
                          <div>
                            Coordenadas: {coords.lat.toFixed(4)}°, {coords.lon.toFixed(4)}°
                          </div>
                        )}
                        {userPosition && <div>Distancia: {calculateDistance(selectedAirport).toFixed(1)} km</div>}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'weather' && (
                  <div>
                    {loadingWeather ? (
                      <div style={{ textAlign: 'center', padding: '40px' }}>Cargando meteorología...</div>
                    ) : (
                      <div style={{ display: 'grid', gap: '20px' }}>
                        {metar ? (
                          <div>
                            <div style={{ fontWeight: '600', marginBottom: '10px', fontSize: '16px' }}>
                              METAR:
                            </div>
                            <div
                              style={{
                                padding: '15px',
                                backgroundColor: getFlightCategoryColor(metar.flightCategory || 'VFR') + '22',
                                border: `2px solid ${getFlightCategoryColor(metar.flightCategory || 'VFR')}`,
                                borderRadius: '6px',
                              }}
                            >
                              <div
                                style={{
                                  display: 'inline-block',
                                  padding: '6px 12px',
                                  backgroundColor: getFlightCategoryColor(metar.flightCategory || 'VFR'),
                                  color: 'white',
                                  borderRadius: '4px',
                                  fontWeight: 'bold',
                                  marginBottom: '10px',
                                  fontSize: '14px',
                                }}
                              >
                                {metar.flightCategory || 'UNKNOWN'}
                              </div>
                              <div style={{ fontFamily: 'monospace', fontSize: '13px', wordWrap: 'break-word' }}>
                                {metar.raw}
                              </div>
                              {metar.temperature && (
                                <div style={{ marginTop: '10px', fontSize: '13px' }}>
                                  🌡️ Temperatura: <strong>{metar.temperature}°C</strong>
                                  {metar.dewpoint && <> | Punto de rocío: {metar.dewpoint}°C</>}
                                </div>
                              )}
                              {metar.wind && (
                                <div style={{ fontSize: '13px' }}>
                                  💨 Viento: <strong>{metar.wind.direction}° a {metar.wind.speed} kt</strong>
                                  {metar.wind.gust && <> (ráfagas {metar.wind.gust} kt)</>}
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div style={{ opacity: 0.6, textAlign: 'center', padding: '20px' }}>
                            METAR no disponible
                          </div>
                        )}

                        {taf ? (
                          <div>
                            <div style={{ fontWeight: '600', marginBottom: '10px', fontSize: '16px' }}>
                              TAF:
                            </div>
                            <div
                              style={{
                                padding: '15px',
                                backgroundColor: 'var(--input-bg)',
                                border: '1px solid var(--sidebar-border)',
                                borderRadius: '6px',
                                fontFamily: 'monospace',
                                fontSize: '13px',
                                whiteSpace: 'pre-wrap',
                                wordWrap: 'break-word',
                              }}
                            >
                              {taf.raw}
                            </div>
                          </div>
                        ) : (
                          <div style={{ opacity: 0.6, textAlign: 'center', padding: '20px' }}>
                            TAF no disponible
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'notams' && (
                  <div>
                    {loadingNotams ? (
                      <div style={{ textAlign: 'center', padding: '40px' }}>Cargando NOTAMs...</div>
                    ) : notams.length > 0 ? (
                      <div style={{ display: 'grid', gap: '15px' }}>
                        {notams.map((notam) => (
                          <div
                            key={notam.id}
                            style={{
                              padding: '15px',
                              backgroundColor: 'var(--input-bg)',
                              border: '2px solid #F59E0B',
                              borderRadius: '6px',
                            }}
                          >
                            <div style={{ fontWeight: '600', marginBottom: '8px', color: '#F59E0B' }}>
                              {notam.id}
                            </div>
                            <div style={{ fontSize: '13px', marginBottom: '8px', whiteSpace: 'pre-wrap' }}>
                              {notam.message}
                            </div>
                            <div style={{ fontSize: '12px', opacity: 0.7 }}>
                              Efectivo: {new Date(notam.effective).toLocaleString()}
                              {notam.expires && <> | Expira: {new Date(notam.expires).toLocaleString()}</>}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{ textAlign: 'center', padding: '40px', opacity: 0.6 }}>
                        No hay NOTAMs activos para este aeródromo
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'runways' && renderRunwayDiagram()}
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
};

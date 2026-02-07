import React, { useState } from 'react';
import Link from 'next/link';
import { NavigationTabs, TabView } from '../components/shared/NavigationTabs';
import { WeightBalance } from '../components/shared/WeightBalance';
import { Logbook } from '../components/shared/Logbook';
import { WeatherBriefing } from '../components/shared/WeatherBriefing';
import { AirportDirectory } from '../components/shared/AirportDirectory';
import { ThemeProvider } from '../utils/ThemeContext';

// This is a standalone page for the new ForeFlight-style tools
export default function ToolsPage() {
  const [activeTab, setActiveTab] = useState<TabView>('logbook');

  return (
    <ThemeProvider>
      <div style={{ minHeight: '100vh', backgroundColor: 'var(--background)', color: 'var(--foreground)' }}>
        <NavigationTabs activeTab={activeTab} onTabChange={setActiveTab} />
        
        <div style={{ padding: '20px' }}>
          {activeTab === 'map' && (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <h2 style={{ fontSize: '24px', marginBottom: '10px' }}>Mapa de Vuelo</h2>
              <p style={{ opacity: 0.7 }}>
                Para planificación de rutas, usa la aplicación principal en{' '}
                <Link href="/app" style={{ color: 'var(--button-bg)', textDecoration: 'underline' }}>
                  /app
                </Link>
              </p>
            </div>
          )}
          
          {activeTab === 'flight' && (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <h2 style={{ fontSize: '24px', marginBottom: '10px' }}>Seguimiento de Vuelo</h2>
              <p style={{ opacity: 0.7 }}>
                Para vuelo en vivo, usa la aplicación principal en{' '}
                <Link href="/app" style={{ color: 'var(--button-bg)', textDecoration: 'underline' }}>
                  /app
                </Link>
              </p>
            </div>
          )}
          
          {activeTab === 'logbook' && <Logbook />}
          
          {activeTab === 'weight-balance' && <WeightBalance />}
          
          {activeTab === 'weather' && (
            <div>
              <WeatherBriefing 
                departure="LEMD"
                destination="LEBL"
                enroute={['LEZL']}
              />
              <div style={{ marginTop: '40px' }}>
                <AirportDirectory
                  airports={[
                    {
                      icao: 'LEMD',
                      name: 'Madrid-Barajas Adolfo Suárez',
                      type: 'large_airport',
                      elevation: 1998,
                      lat: 40.4936,
                      lon: -3.5668,
                      frequencies: [
                        { type: 'TWR', frequency: '118.100' },
                        { type: 'GND', frequency: '121.700' },
                        { type: 'ATIS', frequency: '128.600' },
                      ],
                      runways: [
                        { name: '32L/14R', length: 4349, width: 60, surface: 'asphalt', heading: 320 },
                        { name: '32R/14L', length: 3500, width: 45, surface: 'asphalt', heading: 320 },
                      ],
                    },
                    {
                      icao: 'LEBL',
                      name: 'Barcelona-El Prat Josep Tarradellas',
                      type: 'large_airport',
                      elevation: 12,
                      lat: 41.2971,
                      lon: 2.0785,
                      frequencies: [
                        { type: 'TWR', frequency: '118.300' },
                        { type: 'GND', frequency: '121.900' },
                        { type: 'ATIS', frequency: '127.500' },
                      ],
                      runways: [
                        { name: '07L/25R', length: 3352, width: 45, surface: 'asphalt', heading: 70 },
                        { name: '07R/25L', length: 2660, width: 45, surface: 'asphalt', heading: 70 },
                      ],
                    },
                    {
                      icao: 'LEZL',
                      name: 'Zaragoza',
                      type: 'medium_airport',
                      elevation: 863,
                      lat: 41.6662,
                      lon: -1.0416,
                      frequencies: [
                        { type: 'TWR', frequency: '120.050' },
                        { type: 'ATIS', frequency: '119.275' },
                      ],
                      runways: [
                        { name: '12/30', length: 3400, width: 45, surface: 'asphalt', heading: 120 },
                      ],
                    },
                  ]}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </ThemeProvider>
  );
}

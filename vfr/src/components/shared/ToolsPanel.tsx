import React, { useState } from 'react';
import { FEATURES } from '../../utils/featureFlags';
import { WeatherBriefing } from './WeatherBriefing';
import { WeightBalance } from './WeightBalance';
import { Logbook } from './Logbook';
import { AirportDirectory } from './AirportDirectory';
import { NOTAMPanel } from './NOTAMPanel';
import { FlightPlanForm } from './FlightPlanForm';
import { FuelPlanner } from './FuelPlanner';
import { Waypoint, Airport } from '../../utils/types';

type ToolView = 'weather' | 'weight-balance' | 'logbook' | 'airport-directory' | 'notams' | 'flight-plan' | 'fuel' | null;

interface ToolsPanelProps {
  waypoints: Waypoint[];
  fuelConsumption: number;
  gal_liter: string;
  flightRules?: 'VFR' | 'IFR';
  airports?: Airport[];
  userPosition?: { lat: number; lon: number };
}

export const ToolsPanel: React.FC<ToolsPanelProps> = ({ waypoints, fuelConsumption, gal_liter, flightRules = 'VFR', airports = [], userPosition }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeView, setActiveView] = useState<ToolView>(null);

  const tools = [
    {
      id: 'weather' as ToolView,
      label: 'Meteorología',
      icon: '🌤️',
      feature: 'WEATHER' as keyof typeof FEATURES,
    },
    {
      id: 'fuel' as ToolView,
      label: 'Planificador de Combustible',
      icon: '⛽',
      feature: 'FUEL_PLANNER' as keyof typeof FEATURES,
    },
    {
      id: 'notams' as ToolView,
      label: 'NOTAMs',
      icon: '📢',
      feature: 'NOTAMS' as keyof typeof FEATURES,
    },
    {
      id: 'flight-plan' as ToolView,
      label: 'Plan de Vuelo',
      icon: '📄',
      feature: 'FLIGHT_PLAN' as keyof typeof FEATURES,
    },
    {
      id: 'weight-balance' as ToolView,
      label: 'Peso y Centrado',
      icon: '⚖️',
      feature: 'WEIGHT_BALANCE' as keyof typeof FEATURES,
    },
    {
      id: 'logbook' as ToolView,
      label: 'Diario de Vuelo',
      icon: '📋',
      feature: 'LOGBOOK' as keyof typeof FEATURES,
    },
    {
      id: 'airport-directory' as ToolView,
      label: 'Directorio Aeropuertos',
      icon: '🛩️',
      feature: 'AIRPORT_DIRECTORY' as keyof typeof FEATURES,
    },
  ].filter(tool => FEATURES[tool.feature]);

  const handleToolClick = (toolId: ToolView) => {
    if (activeView === toolId && isOpen) {
      setIsOpen(false);
      setActiveView(null);
    } else {
      setActiveView(toolId);
      setIsOpen(true);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setTimeout(() => setActiveView(null), 300); // Delay clearing view until animation completes
  };

  const handleBack = () => {
    setActiveView(null);
  };

  return (
    <>
      {/* FAB Button */}
      <div
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 900,
        }}
      >
        <button
          onClick={() => {
            if (isOpen) {
              handleClose();
            } else {
              setIsOpen(true);
            }
          }}
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            backgroundColor: 'var(--button-bg)',
            color: 'var(--button-text)',
            border: 'none',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            cursor: 'pointer',
            fontSize: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'transform 0.2s, background-color 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.1)';
            e.currentTarget.style.backgroundColor = 'var(--button-hover)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.backgroundColor = 'var(--button-bg)';
          }}
          title="Herramientas"
        >
          {isOpen ? '✕' : '🛠️'}
        </button>

        {/* Quick tools menu when FAB is open but no tool selected */}
        {isOpen && !activeView && (
          <div
            style={{
              position: 'absolute',
              bottom: '70px',
              right: '0',
              backgroundColor: 'var(--sidebar-bg)',
              border: '1px solid var(--sidebar-border)',
              borderRadius: '8px',
              padding: '8px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
              minWidth: '200px',
            }}
          >
            {tools.map((tool) => (
              <button
                key={tool.id}
                onClick={() => handleToolClick(tool.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  width: '100%',
                  padding: '12px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  color: 'var(--foreground)',
                  textAlign: 'left',
                  transition: 'background-color 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--button-hover)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <span style={{ fontSize: '20px' }}>{tool.icon}</span>
                <span>{tool.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Slide-in Panel */}
      {isOpen && activeView && (
        <>
          {/* Backdrop */}
          <div
            onClick={handleClose}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.3)',
              zIndex: 999,
              animation: 'fadeIn 0.3s ease-in-out',
            }}
          />

          {/* Panel */}
          <div
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              bottom: 0,
              width: window.innerWidth < 768 ? '100%' : '90%',
              maxWidth: '600px',
              backgroundColor: 'var(--sidebar-bg)',
              borderLeft: '1px solid var(--sidebar-border)',
              zIndex: 1000,
              boxShadow: '-4px 0 12px rgba(0,0,0,0.2)',
              animation: isOpen ? 'slideInFromRight 0.3s ease-in-out' : 'slideOutToRight 0.3s ease-in-out',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            {/* Header */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '16px',
                borderBottom: '1px solid var(--sidebar-border)',
                backgroundColor: 'var(--button-bg)',
                color: 'var(--button-text)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {activeView && (
                  <button
                    onClick={handleBack}
                    style={{
                      backgroundColor: 'transparent',
                      border: 'none',
                      color: 'var(--button-text)',
                      fontSize: '20px',
                      cursor: 'pointer',
                      padding: '4px 8px',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                    title="Volver"
                  >
                    ←
                  </button>
                )}
                <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>
                  {activeView ? tools.find(t => t.id === activeView)?.label : 'Herramientas'}
                </h2>
              </div>
              <button
                onClick={handleClose}
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: 'var(--button-text)',
                  fontSize: '24px',
                  cursor: 'pointer',
                  padding: '4px 8px',
                }}
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div
              style={{
                flex: 1,
                overflow: 'auto',
                padding: '16px',
              }}
            >
              {activeView === 'weather' && waypoints.length >= 2 && (
                <WeatherBriefing 
                  departure={waypoints[0].name || `${waypoints[0].position[0].toFixed(4)}, ${waypoints[0].position[1].toFixed(4)}`}
                  destination={waypoints[waypoints.length - 1].name || `${waypoints[waypoints.length - 1].position[0].toFixed(4)}, ${waypoints[waypoints.length - 1].position[1].toFixed(4)}`}
                  enroute={waypoints.slice(1, -1).map(wp => wp.name || `${wp.position[0].toFixed(4)}, ${wp.position[1].toFixed(4)}`)}
                />
              )}
              {activeView === 'weather' && waypoints.length < 2 && (
                <div style={{ textAlign: 'center', padding: '32px', color: 'var(--foreground)', opacity: 0.7 }}>
                  Planifica una ruta con al menos dos puntos para ver la meteorología
                </div>
              )}
              {activeView === 'fuel' && (
                <FuelPlanner 
                  waypoints={waypoints} 
                  fuelConsumption={fuelConsumption} 
                  flightRules={flightRules}
                  gal_liter={gal_liter}
                />
              )}
              {activeView === 'notams' && (
                <NOTAMPanel waypoints={waypoints} mode="route" />
              )}
              {activeView === 'flight-plan' && (
                <FlightPlanForm waypoints={waypoints} flightRules={flightRules} />
              )}
              {activeView === 'weight-balance' && (
                <WeightBalance />
              )}
              {activeView === 'logbook' && (
                <Logbook />
              )}
              {activeView === 'airport-directory' && (
                <AirportDirectory airports={airports} userPosition={userPosition} />
              )}
            </div>
          </div>

          <style jsx global>{`
            @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }

            @keyframes slideInFromRight {
              from {
                transform: translateX(100%);
              }
              to {
                transform: translateX(0);
              }
            }

            @keyframes slideOutToRight {
              from {
                transform: translateX(0);
              }
              to {
                transform: translateX(100%);
              }
            }
          `}</style>
        </>
      )}
    </>
  );
};

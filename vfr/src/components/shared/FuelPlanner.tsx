import React, { useState, useEffect, useCallback } from 'react';
import { Waypoint } from '../../utils/types';

interface FuelPlannerProps {
  waypoints: Waypoint[];
  fuelConsumption: number; // Gallons or liters per hour
  flightRules?: 'VFR' | 'IFR';
  gal_liter?: string;
  aircraftCapacity?: number;
  onFuelUpdate?: (totalFuel: number) => void;
}

interface FuelCalculation {
  tripFuel: number;
  reserveFuel: number;
  alternateFuel: number;
  taxiFuel: number;
  extraFuel: number;
  totalFuel: number;
  tripTime: number; // minutes
}

export const FuelPlanner: React.FC<FuelPlannerProps> = ({
  waypoints,
  fuelConsumption,
  flightRules = 'VFR',
  gal_liter = 'Gal',
  aircraftCapacity = 50,
  onFuelUpdate,
}) => {
  const [customCapacity, setCustomCapacity] = useState(aircraftCapacity);
  const [customTaxiFuel, setCustomTaxiFuel] = useState(2);
  const [customExtraFuel, setCustomExtraFuel] = useState(0);
  const [hasAlternate, setHasAlternate] = useState(false);
  const [alternateDistance, setAlternateDistance] = useState(30); // nm
  const [alternateGroundSpeed, setAlternateGroundSpeed] = useState(100); // knots
  const [calculation, setCalculation] = useState<FuelCalculation | null>(null);

  const calculateFuel = useCallback(() => {
    if (waypoints.length < 2) {
      setCalculation(null);
      return;
    }

    // Calculate total distance and time based on waypoint positions
    let totalDistance = 0;
    let totalTime = 0;

    // Calculate distance between waypoints and estimate time
    for (let i = 0; i < waypoints.length - 1; i++) {
      const wp1 = waypoints[i];
      const wp2 = waypoints[i + 1];
      
      // Calculate great circle distance (Haversine formula)
      const R = 6371; // Earth's radius in km
      const dLat = (wp2.position[0] - wp1.position[0]) * Math.PI / 180;
      const dLon = (wp2.position[1] - wp1.position[1]) * Math.PI / 180;
      const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(wp1.position[0] * Math.PI / 180) * Math.cos(wp2.position[0] * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distanceKm = R * c;
      const distanceNm = distanceKm * 0.539957; // Convert km to nautical miles
      
      totalDistance += distanceNm;
      
      // Estimate time based on IAS (assuming average ground speed equals IAS)
      const avgSpeed = (wp1.ias + wp2.ias) / 2;
      if (avgSpeed > 0) {
        totalTime += (distanceNm / avgSpeed) * 60; // Convert hours to minutes
      }
    }

    if (totalTime === 0 || totalDistance === 0) {
      setCalculation(null);
      return;
    }

    const totalHours = totalTime / 60;

    // Trip fuel
    const tripFuel = fuelConsumption * totalHours;

    // Reserve fuel
    // VFR: 45 minutes, IFR: 30 minutes
    const reserveMinutes = flightRules === 'VFR' ? 45 : 30;
    const reserveFuel = fuelConsumption * (reserveMinutes / 60);

    // Alternate fuel
    let alternateFuel = 0;
    if (hasAlternate) {
      const alternateTime = (alternateDistance / alternateGroundSpeed) * 60; // minutes
      alternateFuel = fuelConsumption * (alternateTime / 60);
    }

    // Taxi fuel
    const taxiFuel = customTaxiFuel;

    // Extra fuel (user-defined margin)
    const extraFuel = customExtraFuel;

    // Total
    const totalFuel = tripFuel + reserveFuel + alternateFuel + taxiFuel + extraFuel;

    setCalculation({
      tripFuel,
      reserveFuel,
      alternateFuel,
      taxiFuel,
      extraFuel,
      totalFuel,
      tripTime: totalTime,
    });

    // Notify parent
    if (onFuelUpdate) {
      onFuelUpdate(totalFuel);
    }
  }, [waypoints, fuelConsumption, flightRules, customTaxiFuel, customExtraFuel, hasAlternate, alternateDistance, alternateGroundSpeed, onFuelUpdate]);

  useEffect(() => {
    calculateFuel();
  }, [calculateFuel]);

  if (!calculation || waypoints.length < 2) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '40px',
        backgroundColor: 'var(--sidebar-bg)',
        borderRadius: '8px',
        border: '2px dashed var(--sidebar-border)',
        color: 'var(--foreground)',
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>⛽</div>
        <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>
          Planifica una ruta para calcular el combustible
        </div>
        <div style={{ fontSize: '14px', opacity: 0.7 }}>
          Agrega al menos dos waypoints con velocidad indicada (IAS) para calcular consumo y autonomía
        </div>
      </div>
    );
  }

  const fuelPercentage = (calculation.totalFuel / customCapacity) * 100;
  const isOverCapacity = calculation.totalFuel > customCapacity;

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

  return (
    <div style={{ fontFamily: 'sans-serif', fontSize: '14px', color: 'var(--foreground)' }}>
      {/* Configuration */}
      <div
        style={{
          padding: '16px',
          backgroundColor: 'var(--sidebar-bg)',
          border: '1px solid var(--sidebar-border)',
          borderRadius: '8px',
          marginBottom: '16px',
        }}
      >
        <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: '700' }}>
          Configuración
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
          <div>
            <label style={labelStyle}>Capacidad de Combustible ({gal_liter})</label>
            <input
              type="number"
              value={customCapacity}
              onChange={(e) => setCustomCapacity(parseFloat(e.target.value) || 0)}
              min={0}
              step={1}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Consumo ({gal_liter}/h)</label>
            <input
              type="number"
              value={fuelConsumption}
              disabled
              style={{ ...inputStyle, opacity: 0.6 }}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <label style={labelStyle}>Taxi ({gal_liter})</label>
            <input
              type="number"
              value={customTaxiFuel}
              onChange={(e) => setCustomTaxiFuel(parseFloat(e.target.value) || 0)}
              min={0}
              step={0.5}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Margen Extra ({gal_liter})</label>
            <input
              type="number"
              value={customExtraFuel}
              onChange={(e) => setCustomExtraFuel(parseFloat(e.target.value) || 0)}
              min={0}
              step={1}
              style={inputStyle}
            />
          </div>
        </div>

        <div style={{ marginTop: '12px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={hasAlternate}
              onChange={(e) => setHasAlternate(e.target.checked)}
              style={{ width: '16px', height: '16px' }}
            />
            <span style={{ fontWeight: '600', fontSize: '13px' }}>Incluir Aeródromo Alternativo</span>
          </label>

          {hasAlternate && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '8px', paddingLeft: '24px' }}>
              <div>
                <label style={labelStyle}>Distancia al Alternativo (nm)</label>
                <input
                  type="number"
                  value={alternateDistance}
                  onChange={(e) => setAlternateDistance(parseFloat(e.target.value) || 0)}
                  min={0}
                  step={5}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>GS al Alternativo (kt)</label>
                <input
                  type="number"
                  value={alternateGroundSpeed}
                  onChange={(e) => setAlternateGroundSpeed(parseFloat(e.target.value) || 0)}
                  min={0}
                  step={10}
                  style={inputStyle}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Fuel Breakdown */}
      <div
        style={{
          padding: '16px',
          backgroundColor: 'var(--sidebar-bg)',
          border: '1px solid var(--sidebar-border)',
          borderRadius: '8px',
          marginBottom: '16px',
        }}
      >
        <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: '700' }}>
          Desglose de Combustible
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <FuelRow label="Combustible de Viaje" value={calculation.tripFuel} unit={gal_liter} color="#3b82f6" />
          <FuelRow
            label={`Reserva (${flightRules === 'VFR' ? '45' : '30'} min)`}
            value={calculation.reserveFuel}
            unit={gal_liter}
            color="#10b981"
          />
          {hasAlternate && (
            <FuelRow label="Combustible Alternativo" value={calculation.alternateFuel} unit={gal_liter} color="#f59e0b" />
          )}
          <FuelRow label="Taxi" value={calculation.taxiFuel} unit={gal_liter} color="#6b7280" />
          {customExtraFuel > 0 && (
            <FuelRow label="Margen Extra" value={calculation.extraFuel} unit={gal_liter} color="#8b5cf6" />
          )}
        </div>

        <div
          style={{
            marginTop: '16px',
            paddingTop: '12px',
            borderTop: '2px solid var(--sidebar-border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span style={{ fontSize: '16px', fontWeight: '700' }}>Total Requerido:</span>
          <span style={{ fontSize: '18px', fontWeight: '700', color: isOverCapacity ? '#ef4444' : 'var(--foreground)' }}>
            {calculation.totalFuel.toFixed(1)} {gal_liter}
          </span>
        </div>
      </div>

      {/* Visual Fuel Bar */}
      <div
        style={{
          padding: '16px',
          backgroundColor: 'var(--sidebar-bg)',
          border: '1px solid var(--sidebar-border)',
          borderRadius: '8px',
          marginBottom: '16px',
        }}
      >
        <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: '700' }}>
          Indicador de Capacidad
        </h3>

        <div
          style={{
            width: '100%',
            height: '40px',
            backgroundColor: '#e5e7eb',
            borderRadius: '8px',
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          <div
            style={{
              width: `${Math.min(fuelPercentage, 100)}%`,
              height: '100%',
              backgroundColor: isOverCapacity ? '#ef4444' : fuelPercentage > 85 ? '#f59e0b' : '#10b981',
              transition: 'width 0.3s ease',
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              color: fuelPercentage > 50 ? 'white' : '#1e293b',
              fontWeight: '700',
              fontSize: '14px',
            }}
          >
            {fuelPercentage.toFixed(0)}% de capacidad
          </div>
        </div>

        <div style={{ marginTop: '8px', fontSize: '12px', color: 'var(--foreground)', opacity: 0.8 }}>
          Capacidad: {customCapacity} {gal_liter} | Usado: {calculation.totalFuel.toFixed(1)} {gal_liter} | Libre:{' '}
          {(customCapacity - calculation.totalFuel).toFixed(1)} {gal_liter}
        </div>

        {isOverCapacity && (
          <div
            style={{
              marginTop: '12px',
              padding: '12px',
              backgroundColor: '#fee2e2',
              border: '1px solid #ef4444',
              borderRadius: '4px',
              color: '#991b1b',
              fontWeight: '600',
              fontSize: '13px',
            }}
          >
            ⚠️ El combustible requerido excede la capacidad de la aeronave. Reduce la carga o considera paradas intermedias.
          </div>
        )}
      </div>

      {/* Trip Summary */}
      <div
        style={{
          padding: '16px',
          backgroundColor: '#f1f5f9',
          border: '1px solid #cbd5e1',
          borderRadius: '8px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ fontWeight: '600' }}>Tiempo de Vuelo:</span>
          <span>{Math.floor(calculation.tripTime / 60)}h {Math.round(calculation.tripTime % 60)}min</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ fontWeight: '600' }}>Reglas de Vuelo:</span>
          <span>{flightRules}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontWeight: '600' }}>Consumo Medio:</span>
          <span>{fuelConsumption.toFixed(1)} {gal_liter}/h</span>
        </div>
      </div>
    </div>
  );
};

// Helper component for fuel rows
const FuelRow: React.FC<{ label: string; value: number; unit: string; color: string }> = ({ label, value, unit, color }) => (
  <div
    style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '8px',
      backgroundColor: 'rgba(0,0,0,0.02)',
      borderLeft: `4px solid ${color}`,
      borderRadius: '4px',
    }}
  >
    <span style={{ fontWeight: '600', fontSize: '13px' }}>{label}</span>
    <span style={{ fontWeight: '700', fontSize: '14px', color }}>
      {value.toFixed(1)} {unit}
    </span>
  </div>
);

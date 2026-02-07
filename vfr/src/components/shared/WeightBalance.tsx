import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../../utils/ThemeContext';
import { AIRCRAFT_PROFILES, AircraftProfile, getAircraftProfile } from '../../utils/aircraftProfiles';

interface CGCalculation {
  totalWeight: number;
  totalMoment: number;
  cg: number;
  withinLimits: boolean;
  zeroFuelWeight: number;
  zeroFuelCG: number;
  maxWeightPercent: number;
}

export const WeightBalance: React.FC = () => {
  const { theme } = useTheme();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [selectedAircraft, setSelectedAircraft] = useState<AircraftProfile>(AIRCRAFT_PROFILES[0]);
  const [fuel, setFuel] = useState(selectedAircraft.fuelCapacity * 0.5); // 50% fuel
  const [stationWeights, setStationWeights] = useState<number[]>([]);
  const [calculation, setCalculation] = useState<CGCalculation | null>(null);

  // Initialize station weights when aircraft changes
  useEffect(() => {
    setStationWeights(new Array(selectedAircraft.stations.length).fill(0));
    setFuel(selectedAircraft.fuelCapacity * 0.5);
  }, [selectedAircraft]);

  // Calculate W&B whenever inputs change
  useEffect(() => {
    calculateWeightBalance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAircraft, fuel, stationWeights]);

  const calculateWeightBalance = () => {
    let totalWeight = selectedAircraft.emptyWeight;
    let totalMoment = selectedAircraft.emptyWeight * selectedAircraft.emptyCG;

    // Add fuel
    const fuelWeight = fuel * selectedAircraft.fuelDensity;
    totalWeight += fuelWeight;
    totalMoment += fuelWeight * selectedAircraft.fuelArm;

    // Zero fuel weight calculation (before adding fuel)
    let zeroFuelWeight = selectedAircraft.emptyWeight;
    let zeroFuelMoment = selectedAircraft.emptyWeight * selectedAircraft.emptyCG;

    // Add station weights
    selectedAircraft.stations.forEach((station, idx) => {
      const weight = stationWeights[idx] || 0;
      totalWeight += weight;
      totalMoment += weight * station.arm;
      zeroFuelWeight += weight;
      zeroFuelMoment += weight * station.arm;
    });

    const cg = totalWeight > 0 ? totalMoment / totalWeight : 0;
    const zeroFuelCG = zeroFuelWeight > 0 ? zeroFuelMoment / zeroFuelWeight : 0;

    // Check if within envelope
    const withinLimits = isWithinEnvelope(totalWeight, cg);
    const maxWeightPercent = (totalWeight / selectedAircraft.maxTakeoffWeight) * 100;

    setCalculation({
      totalWeight,
      totalMoment,
      cg,
      withinLimits,
      zeroFuelWeight,
      zeroFuelCG,
      maxWeightPercent,
    });

    drawCGChart(totalWeight, cg, zeroFuelWeight, zeroFuelCG);
  };

  const isWithinEnvelope = (weight: number, cg: number): boolean => {
    if (weight > selectedAircraft.maxTakeoffWeight) return false;

    // Find the two envelope points that bracket this weight
    const envelope = selectedAircraft.cgEnvelope;
    if (envelope.length === 0) return true;

    // Sort by weight
    const sorted = [...envelope].sort((a, b) => a.weight - b.weight);

    if (weight <= sorted[0].weight) {
      return cg >= sorted[0].fwdCG && cg <= sorted[0].aftCG;
    }

    if (weight >= sorted[sorted.length - 1].weight) {
      const last = sorted[sorted.length - 1];
      return cg >= last.fwdCG && cg <= last.aftCG;
    }

    // Interpolate between two points
    for (let i = 0; i < sorted.length - 1; i++) {
      if (weight >= sorted[i].weight && weight <= sorted[i + 1].weight) {
        const ratio = (weight - sorted[i].weight) / (sorted[i + 1].weight - sorted[i].weight);
        const fwdLimit = sorted[i].fwdCG + ratio * (sorted[i + 1].fwdCG - sorted[i].fwdCG);
        const aftLimit = sorted[i].aftCG + ratio * (sorted[i + 1].aftCG - sorted[i].aftCG);
        return cg >= fwdLimit && cg <= aftLimit;
      }
    }

    return false;
  };

  const drawCGChart = (weight: number, cg: number, zfWeight: number, zfCG: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const padding = 60;

    ctx.clearRect(0, 0, width, height);

    // Get envelope and determine scales
    const envelope = [...selectedAircraft.cgEnvelope].sort((a, b) => a.weight - b.weight);
    if (envelope.length === 0) return;

    const minWeight = Math.min(...envelope.map((e) => e.weight)) * 0.9;
    const maxWeight = selectedAircraft.maxTakeoffWeight * 1.1;
    const minCG = Math.min(...envelope.map((e) => e.fwdCG)) * 0.95;
    const maxCG = Math.max(...envelope.map((e) => e.aftCG)) * 1.05;

    const xScale = (cg: number) => padding + ((cg - minCG) / (maxCG - minCG)) * (width - 2 * padding);
    const yScale = (w: number) => height - padding - ((w - minWeight) / (maxWeight - minWeight)) * (height - 2 * padding);

    // Draw axes
    ctx.strokeStyle = theme === 'dark' ? '#64748b' : '#94a3b8';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, height - padding);
    ctx.lineTo(width - padding, height - padding);
    ctx.stroke();

    // Axis labels
    ctx.fillStyle = theme === 'dark' ? '#e2e8f0' : '#1e293b';
    ctx.font = '12px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('CG (mm)', width / 2, height - 10);
    ctx.save();
    ctx.translate(15, height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Peso (kg)', 0, 0);
    ctx.restore();

    // Draw envelope (green zone)
    ctx.fillStyle = 'rgba(34, 197, 94, 0.2)';
    ctx.strokeStyle = 'rgba(34, 197, 94, 0.8)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    envelope.forEach((point, idx) => {
      const x1 = xScale(point.fwdCG);
      const y = yScale(point.weight);
      if (idx === 0) ctx.moveTo(x1, y);
      else ctx.lineTo(x1, y);
    });
    for (let i = envelope.length - 1; i >= 0; i--) {
      const x2 = xScale(envelope[i].aftCG);
      const y = yScale(envelope[i].weight);
      ctx.lineTo(x2, y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Draw max weight line
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.5)';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    const maxWeightY = yScale(selectedAircraft.maxTakeoffWeight);
    ctx.beginPath();
    ctx.moveTo(padding, maxWeightY);
    ctx.lineTo(width - padding, maxWeightY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw zero fuel weight point (blue)
    if (zfWeight > 0) {
      ctx.fillStyle = '#3b82f6';
      ctx.beginPath();
      ctx.arc(xScale(zfCG), yScale(zfWeight), 6, 0, 2 * Math.PI);
      ctx.fill();
      ctx.strokeStyle = '#1e40af';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Draw current weight point (red if out of limits, yellow otherwise)
    if (weight > 0) {
      const withinLimits = isWithinEnvelope(weight, cg);
      ctx.fillStyle = withinLimits ? '#eab308' : '#ef4444';
      ctx.beginPath();
      ctx.arc(xScale(cg), yScale(weight), 8, 0, 2 * Math.PI);
      ctx.fill();
      ctx.strokeStyle = withinLimits ? '#a16207' : '#991b1b';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Legend
    ctx.font = '11px monospace';
    ctx.textAlign = 'left';
    ctx.fillStyle = '#3b82f6';
    ctx.fillText('● Zero Fuel', width - 150, padding + 10);
    ctx.fillStyle = '#eab308';
    ctx.fillText('● Despegue', width - 150, padding + 25);
  };

  const handleAircraftChange = (id: string) => {
    const profile = getAircraftProfile(id);
    if (profile) setSelectedAircraft(profile);
  };

  const handleStationWeightChange = (index: number, value: string) => {
    const newWeights = [...stationWeights];
    newWeights[index] = parseFloat(value) || 0;
    setStationWeights(newWeights);
  };

  return (
    <div style={{ padding: '20px', color: 'var(--foreground)', maxWidth: '1200px', margin: '0 auto' }}>
      <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>⚖️ Peso y Centrado</h2>

      {/* Aircraft selector */}
      <div style={{ marginBottom: '30px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Seleccionar aeronave:</label>
        <select
          value={selectedAircraft.id}
          onChange={(e) => handleAircraftChange(e.target.value)}
          style={{
            padding: '10px',
            fontSize: '14px',
            backgroundColor: 'var(--sidebar-bg)',
            color: 'var(--foreground)',
            border: '1px solid var(--sidebar-border)',
            borderRadius: '4px',
            width: '100%',
            maxWidth: '400px',
          }}
        >
          {AIRCRAFT_PROFILES.map((profile) => (
            <option key={profile.id} value={profile.id}>
              {profile.name} ({profile.type})
            </option>
          ))}
        </select>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
        {/* Left column: Loading form */}
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '15px' }}>Carga</h3>

          {/* Fuel */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>
              Combustible: {fuel.toFixed(1)} L ({(fuel * selectedAircraft.fuelDensity).toFixed(1)} kg)
            </label>
            <input
              type="range"
              min="0"
              max={selectedAircraft.fuelCapacity}
              step="1"
              value={fuel}
              onChange={(e) => setFuel(parseFloat(e.target.value))}
              style={{ width: '100%' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginTop: '5px' }}>
              <span>0 L</span>
              <span>{selectedAircraft.fuelCapacity} L</span>
            </div>
          </div>

          {/* Station weights */}
          {selectedAircraft.stations.map((station, idx) => (
            <div key={idx} style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>
                {station.name} (máx: {station.maxWeight} kg)
              </label>
              <input
                type="number"
                min="0"
                max={station.maxWeight}
                value={stationWeights[idx] || 0}
                onChange={(e) => handleStationWeightChange(idx, e.target.value)}
                style={{
                  padding: '8px',
                  fontSize: '14px',
                  backgroundColor: 'var(--sidebar-bg)',
                  color: 'var(--foreground)',
                  border: '1px solid var(--sidebar-border)',
                  borderRadius: '4px',
                  width: '100%',
                }}
              />
              {stationWeights[idx] > station.maxWeight && (
                <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '3px' }}>⚠️ Excede peso máximo</div>
              )}
            </div>
          ))}

          {/* Summary */}
          {calculation && (
            <div
              style={{
                marginTop: '30px',
                padding: '15px',
                backgroundColor: 'var(--sidebar-bg)',
                borderRadius: '8px',
                border: `2px solid ${calculation.withinLimits ? '#22c55e' : '#ef4444'}`,
              }}
            >
              <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '10px' }}>Resumen</h4>
              <div style={{ display: 'grid', gap: '8px', fontSize: '14px' }}>
                <div>
                  <strong>Peso total:</strong> {calculation.totalWeight.toFixed(1)} kg (
                  {calculation.maxWeightPercent.toFixed(1)}%)
                </div>
                <div>
                  <strong>Centro de gravedad:</strong> {calculation.cg.toFixed(1)} mm
                </div>
                <div>
                  <strong>Peso sin combustible:</strong> {calculation.zeroFuelWeight.toFixed(1)} kg
                </div>
                <div>
                  <strong>Estado:</strong>{' '}
                  <span style={{ color: calculation.withinLimits ? '#22c55e' : '#ef4444', fontWeight: 'bold' }}>
                    {calculation.withinLimits ? '✅ DENTRO DE LÍMITES' : '⛔ FUERA DE LÍMITES'}
                  </span>
                </div>
                {calculation.totalWeight > selectedAircraft.maxTakeoffWeight && (
                  <div style={{ color: '#ef4444', fontWeight: 'bold' }}>⚠️ Excede peso máximo de despegue</div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right column: CG chart */}
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '15px' }}>Gráfico de Centrado</h3>
          <canvas
            ref={canvasRef}
            width={500}
            height={500}
            style={{
              border: '1px solid var(--sidebar-border)',
              borderRadius: '8px',
              backgroundColor: 'var(--sidebar-bg)',
              width: '100%',
              height: 'auto',
            }}
          />
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import {
  LogbookEntry,
  loadLogbook,
  addEntry,
  updateEntry,
  deleteEntry,
  calculateTotals,
  checkCurrency,
  calculateFlightTime,
  formatTime,
  exportLogbook,
} from '../../services/logbookService';

type ViewMode = 'list' | 'add' | 'currency';

export const Logbook: React.FC = () => {
  const [entries, setEntries] = useState<LogbookEntry[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState<Partial<LogbookEntry>>({
    date: new Date().toISOString().split('T')[0],
    departure: '',
    arrival: '',
    aircraftReg: '',
    blockOff: '',
    blockOn: '',
    flightTime: 0,
    dayTime: 0,
    nightTime: 0,
    picTime: 0,
    sicTime: 0,
    dualTime: 0,
    soloTime: 0,
    instrumentActual: 0,
    instrumentSimulated: 0,
    landingsDay: 0,
    landingsNight: 0,
    isCrossCountry: false,
    remarks: '',
    approaches: 0,
  });

  useEffect(() => {
    refreshEntries();
  }, []);

  const refreshEntries = () => {
    const loaded = loadLogbook().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setEntries(loaded);
  };

  const handleSubmit = () => {
    if (!formData.departure || !formData.arrival || !formData.aircraftReg) {
      alert('Por favor completa los campos obligatorios: aeródromo salida, llegada y matrícula');
      return;
    }

    // Auto-calculate flight time if block times provided
    let flightTime = formData.flightTime || 0;
    if (formData.blockOff && formData.blockOn) {
      flightTime = calculateFlightTime(formData.blockOff, formData.blockOn);
    }

    const entryData = {
      ...formData,
      flightTime,
      dayTime: formData.dayTime || 0,
      nightTime: formData.nightTime || 0,
      picTime: formData.picTime || 0,
      sicTime: formData.sicTime || 0,
      dualTime: formData.dualTime || 0,
      soloTime: formData.soloTime || 0,
      instrumentActual: formData.instrumentActual || 0,
      instrumentSimulated: formData.instrumentSimulated || 0,
      landingsDay: formData.landingsDay || 0,
      landingsNight: formData.landingsNight || 0,
      isCrossCountry: formData.isCrossCountry || false,
      approaches: formData.approaches || 0,
    } as Omit<LogbookEntry, 'id'>;

    if (editingId) {
      updateEntry(editingId, entryData);
      setEditingId(null);
    } else {
      addEntry(entryData);
    }

    resetForm();
    setViewMode('list');
    refreshEntries();
  };

  const handleEdit = (entry: LogbookEntry) => {
    setFormData(entry);
    setEditingId(entry.id);
    setViewMode('add');
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Estás seguro de eliminar esta entrada?')) {
      deleteEntry(id);
      refreshEntries();
    }
  };

  const resetForm = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      departure: '',
      arrival: '',
      aircraftReg: '',
      blockOff: '',
      blockOn: '',
      flightTime: 0,
      dayTime: 0,
      nightTime: 0,
      picTime: 0,
      sicTime: 0,
      dualTime: 0,
      soloTime: 0,
      instrumentActual: 0,
      instrumentSimulated: 0,
      landingsDay: 0,
      landingsNight: 0,
      isCrossCountry: false,
      remarks: '',
      approaches: 0,
    });
    setEditingId(null);
  };

  const handleExport = () => {
    const text = exportLogbook();
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `logbook-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const totals = calculateTotals();
  const currency = checkCurrency();

  const inputStyle: React.CSSProperties = {
    padding: '8px',
    fontSize: '14px',
    backgroundColor: 'var(--sidebar-bg)',
    color: 'var(--foreground)',
    border: '1px solid var(--sidebar-border)',
    borderRadius: '4px',
    width: '100%',
  };

  const buttonStyle: React.CSSProperties = {
    padding: '10px 20px',
    fontSize: '14px',
    fontWeight: '600',
    backgroundColor: 'var(--button-bg)',
    color: 'var(--button-text)',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
  };

  return (
    <div style={{ padding: '20px', color: 'var(--foreground)', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold' }}>📋 Diario de Vuelo</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button style={buttonStyle} onClick={() => setViewMode('list')}>
            Lista
          </button>
          <button style={buttonStyle} onClick={() => { resetForm(); setViewMode('add'); }}>
            + Añadir Vuelo
          </button>
          <button style={buttonStyle} onClick={() => setViewMode('currency')}>
            Habilitación
          </button>
          <button style={buttonStyle} onClick={handleExport}>
            Exportar
          </button>
        </div>
      </div>

      {/* List view */}
      {viewMode === 'list' && (
        <>
          {/* Totals summary */}
          <div
            style={{
              padding: '20px',
              backgroundColor: 'var(--sidebar-bg)',
              borderRadius: '8px',
              marginBottom: '20px',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '15px',
            }}
          >
            <div>
              <div style={{ fontSize: '12px', opacity: 0.7 }}>Tiempo Total</div>
              <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{formatTime(totals.totalTime)}</div>
            </div>
            <div>
              <div style={{ fontSize: '12px', opacity: 0.7 }}>PIC</div>
              <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{formatTime(totals.picTime)}</div>
            </div>
            <div>
              <div style={{ fontSize: '12px', opacity: 0.7 }}>Nocturno</div>
              <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{formatTime(totals.nightTime)}</div>
            </div>
            <div>
              <div style={{ fontSize: '12px', opacity: 0.7 }}>Navegación</div>
              <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{formatTime(totals.crossCountryTime)}</div>
            </div>
            <div>
              <div style={{ fontSize: '12px', opacity: 0.7 }}>Aterrizajes</div>
              <div style={{ fontSize: '20px', fontWeight: 'bold' }}>
                {totals.totalLandingsDay + totals.totalLandingsNight}
              </div>
            </div>
          </div>

          {/* Entries list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {entries.length === 0 && (
              <div style={{ 
                textAlign: 'center', 
                padding: '40px',
                backgroundColor: 'var(--sidebar-bg)',
                borderRadius: '8px',
                border: '2px dashed var(--sidebar-border)',
              }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
                <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>
                  Tu diario de vuelo está vacío
                </div>
                <div style={{ fontSize: '14px', opacity: 0.7 }}>
                  Haz clic en &quot;Añadir Vuelo&quot; para registrar tu primer vuelo
                </div>
              </div>
            )}
            {entries.map((entry) => (
              <div
                key={entry.id}
                style={{
                  padding: '15px',
                  backgroundColor: 'var(--sidebar-bg)',
                  borderRadius: '8px',
                  border: '1px solid var(--sidebar-border)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '5px' }}>
                      {entry.date} • {entry.departure} → {entry.arrival}
                    </div>
                    <div style={{ fontSize: '14px', opacity: 0.8, marginBottom: '8px' }}>
                      {entry.aircraftReg} {entry.aircraftType && `(${entry.aircraftType})`}
                      {entry.isCrossCountry && ' • Navegación'}
                    </div>
                    <div style={{ display: 'flex', gap: '15px', fontSize: '13px', flexWrap: 'wrap' }}>
                      <span>⏱️ {formatTime(entry.flightTime)}</span>
                      {entry.picTime > 0 && <span>👨‍✈️ PIC {formatTime(entry.picTime)}</span>}
                      {entry.nightTime > 0 && <span>🌙 {formatTime(entry.nightTime)}</span>}
                      {entry.landingsDay > 0 && <span>🛬 Día {entry.landingsDay}</span>}
                      {entry.landingsNight > 0 && <span>🛬 Noche {entry.landingsNight}</span>}
                      {entry.approaches && entry.approaches > 0 && <span>📍 {entry.approaches} aprox.</span>}
                    </div>
                    {entry.remarks && (
                      <div style={{ marginTop: '8px', fontSize: '13px', fontStyle: 'italic', opacity: 0.7 }}>
                        {entry.remarks}
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      onClick={() => handleEdit(entry)}
                      style={{ ...buttonStyle, padding: '6px 12px', fontSize: '12px' }}
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(entry.id)}
                      style={{
                        ...buttonStyle,
                        padding: '6px 12px',
                        fontSize: '12px',
                        backgroundColor: '#ef4444',
                      }}
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Add/Edit form */}
      {viewMode === 'add' && (
        <div style={{ backgroundColor: 'var(--sidebar-bg)', padding: '20px', borderRadius: '8px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px' }}>
            {editingId ? 'Editar Vuelo' : 'Añadir Vuelo'}
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>Fecha *</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>Matrícula *</label>
              <input
                type="text"
                value={formData.aircraftReg}
                onChange={(e) => setFormData({ ...formData, aircraftReg: e.target.value.toUpperCase() })}
                style={inputStyle}
                placeholder="EC-ABC"
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>Salida (ICAO) *</label>
              <input
                type="text"
                value={formData.departure}
                onChange={(e) => setFormData({ ...formData, departure: e.target.value.toUpperCase() })}
                style={inputStyle}
                placeholder="LEMD"
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>Llegada (ICAO) *</label>
              <input
                type="text"
                value={formData.arrival}
                onChange={(e) => setFormData({ ...formData, arrival: e.target.value.toUpperCase() })}
                style={inputStyle}
                placeholder="LEBL"
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>Block Off (HH:MM)</label>
              <input
                type="time"
                value={formData.blockOff}
                onChange={(e) => setFormData({ ...formData, blockOff: e.target.value })}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>Block On (HH:MM)</label>
              <input
                type="time"
                value={formData.blockOn}
                onChange={(e) => setFormData({ ...formData, blockOn: e.target.value })}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>Tiempo de vuelo (min)</label>
              <input
                type="number"
                value={formData.flightTime}
                onChange={(e) => setFormData({ ...formData, flightTime: parseInt(e.target.value) || 0 })}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>Tiempo diurno (min)</label>
              <input
                type="number"
                value={formData.dayTime}
                onChange={(e) => setFormData({ ...formData, dayTime: parseInt(e.target.value) || 0 })}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>Tiempo nocturno (min)</label>
              <input
                type="number"
                value={formData.nightTime}
                onChange={(e) => setFormData({ ...formData, nightTime: parseInt(e.target.value) || 0 })}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>Tiempo PIC (min)</label>
              <input
                type="number"
                value={formData.picTime}
                onChange={(e) => setFormData({ ...formData, picTime: parseInt(e.target.value) || 0 })}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>Tiempo Dual (min)</label>
              <input
                type="number"
                value={formData.dualTime}
                onChange={(e) => setFormData({ ...formData, dualTime: parseInt(e.target.value) || 0 })}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>Tiempo Solo (min)</label>
              <input
                type="number"
                value={formData.soloTime}
                onChange={(e) => setFormData({ ...formData, soloTime: parseInt(e.target.value) || 0 })}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>
                Instrumental real (min)
              </label>
              <input
                type="number"
                value={formData.instrumentActual}
                onChange={(e) => setFormData({ ...formData, instrumentActual: parseInt(e.target.value) || 0 })}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>
                Instrumental simulado (min)
              </label>
              <input
                type="number"
                value={formData.instrumentSimulated}
                onChange={(e) => setFormData({ ...formData, instrumentSimulated: parseInt(e.target.value) || 0 })}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>Aterrizajes día</label>
              <input
                type="number"
                value={formData.landingsDay}
                onChange={(e) => setFormData({ ...formData, landingsDay: parseInt(e.target.value) || 0 })}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>Aterrizajes noche</label>
              <input
                type="number"
                value={formData.landingsNight}
                onChange={(e) => setFormData({ ...formData, landingsNight: parseInt(e.target.value) || 0 })}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>Aproximaciones IFR</label>
              <input
                type="number"
                value={formData.approaches}
                onChange={(e) => setFormData({ ...formData, approaches: parseInt(e.target.value) || 0 })}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                <input
                  type="checkbox"
                  checked={formData.isCrossCountry}
                  onChange={(e) => setFormData({ ...formData, isCrossCountry: e.target.checked })}
                />
                Vuelo de navegación
              </label>
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>Observaciones</label>
              <textarea
                value={formData.remarks}
                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }}
                placeholder="Notas sobre el vuelo..."
              />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <button onClick={handleSubmit} style={buttonStyle}>
              {editingId ? 'Guardar Cambios' : 'Añadir Vuelo'}
            </button>
            <button
              onClick={() => {
                resetForm();
                setViewMode('list');
              }}
              style={{ ...buttonStyle, backgroundColor: '#64748b' }}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Currency view */}
      {viewMode === 'currency' && (
        <div style={{ backgroundColor: 'var(--sidebar-bg)', padding: '20px', borderRadius: '8px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px' }}>Estado de Habilitación</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div
              style={{
                padding: '15px',
                backgroundColor: currency.passengerCurrent ? '#22c55e22' : '#ef444422',
                border: `2px solid ${currency.passengerCurrent ? '#22c55e' : '#ef4444'}`,
                borderRadius: '8px',
              }}
            >
              <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '5px' }}>
                {currency.passengerCurrent ? '✅' : '❌'} Habilitación para pasajeros
              </div>
              <div style={{ fontSize: '14px', opacity: 0.8 }}>
                Requiere 3 aterrizajes en 90 días
                {currency.passengerExpiresOn && ` • Vence: ${currency.passengerExpiresOn}`}
              </div>
            </div>

            <div
              style={{
                padding: '15px',
                backgroundColor: currency.nightCurrent ? '#22c55e22' : '#ef444422',
                border: `2px solid ${currency.nightCurrent ? '#22c55e' : '#ef4444'}`,
                borderRadius: '8px',
              }}
            >
              <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '5px' }}>
                {currency.nightCurrent ? '✅' : '❌'} Habilitación nocturna
              </div>
              <div style={{ fontSize: '14px', opacity: 0.8 }}>
                Requiere 3 aterrizajes nocturnos en 90 días
                {currency.nightExpiresOn && ` • Vence: ${currency.nightExpiresOn}`}
              </div>
            </div>

            <div
              style={{
                padding: '15px',
                backgroundColor: currency.ifrCurrent ? '#22c55e22' : '#ef444422',
                border: `2px solid ${currency.ifrCurrent ? '#22c55e' : '#ef4444'}`,
                borderRadius: '8px',
              }}
            >
              <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '5px' }}>
                {currency.ifrCurrent ? '✅' : '❌'} Habilitación IFR
              </div>
              <div style={{ fontSize: '14px', opacity: 0.8 }}>
                Requiere 6 aproximaciones en 6 meses
                {currency.ifrExpiresOn && ` • Vence: ${currency.ifrExpiresOn}`}
              </div>
            </div>

            {currency.lastFlight && (
              <div style={{ marginTop: '20px', fontSize: '14px', opacity: 0.7 }}>
                Último vuelo: {currency.lastFlight}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

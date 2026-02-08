import React, { useState, useEffect } from 'react';
import {
  fetchNOTAMs,
  fetchRouteNOTAMs,
  NOTAM,
  getNotamTypeColor,
  getNotamTypeIcon,
  formatNotamDate,
} from '../../services/notamService';
import { Waypoint } from '../../utils/types';

interface NOTAMPanelProps {
  icao?: string;
  waypoints?: Waypoint[];
  mode?: 'single' | 'route';
}

export const NOTAMPanel: React.FC<NOTAMPanelProps> = ({ icao, waypoints, mode = 'single' }) => {
  const [notams, setNotams] = useState<NOTAM[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchIcao, setSearchIcao] = useState(icao || '');
  const [filter, setFilter] = useState<'all' | 'active' | 'upcoming' | 'expired'>('active');

  // Load NOTAMs on mount or when props change
  useEffect(() => {
    if (mode === 'single' && icao) {
      loadSingleNOTAMs(icao);
    } else if (mode === 'route' && waypoints && waypoints.length > 0) {
      loadRouteNOTAMs(waypoints);
    }
  }, [icao, waypoints, mode]);

  const loadSingleNOTAMs = async (code: string) => {
    if (!code || code.length < 3) return;

    setLoading(true);
    try {
      const data = await fetchNOTAMs(code.toUpperCase());
      setNotams(data);
    } catch (error) {
      console.error('Error loading NOTAMs:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRouteNOTAMs = async (wps: Waypoint[]) => {
    setLoading(true);
    try {
      const data = await fetchRouteNOTAMs(wps);
      setNotams(data);
    } catch (error) {
      console.error('Error loading route NOTAMs:', error);
      setNotams([]);
    } finally {
      setLoading(false);
    }
  };

  // Helper to check if waypoints have valid ICAO codes
  const hasValidIcaoCodes = (wps: Waypoint[]): boolean => {
    return wps.some(wp => wp.name && /^[A-Z]{4}$/.test(wp.name.trim()));
  };

  const handleSearch = () => {
    if (searchIcao.trim().length >= 3) {
      loadSingleNOTAMs(searchIcao.trim());
    }
  };

  type FilterType = 'all' | 'active' | 'upcoming' | 'expired';

  const filteredNotams = notams.filter((notam) => {
    const now = new Date();
    const start = new Date(notam.effectiveStart);
    const end = new Date(notam.effectiveEnd);

    switch (filter) {
      case 'active':
        return now >= start && now <= end;
      case 'upcoming':
        return now < start;
      case 'expired':
        return now > end;
      default:
        return true;
    }
  });

  // Group by ICAO
  const groupedNotams = filteredNotams.reduce((acc, notam) => {
    if (!acc[notam.icao]) {
      acc[notam.icao] = [];
    }
    acc[notam.icao].push(notam);
    return acc;
  }, {} as Record<string, NOTAM[]>);

  // Check if we should show empty state for route mode
  const showRouteEmptyState = mode === 'route' && (!waypoints || waypoints.length === 0 || !hasValidIcaoCodes(waypoints));

  return (
    <div style={{ fontFamily: 'sans-serif', fontSize: '14px', color: 'var(--foreground)' }}>
      {/* Empty state for route mode */}
      {showRouteEmptyState && !loading && (
        <div style={{ 
          textAlign: 'center', 
          padding: '40px', 
          backgroundColor: 'var(--sidebar-bg)',
          borderRadius: '8px',
          border: '2px dashed var(--sidebar-border)',
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📢</div>
          <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>
            Agrega aeropuertos con códigos ICAO a tu ruta
          </div>
          <div style={{ fontSize: '14px', opacity: 0.7 }}>
            Los NOTAMs se mostrarán automáticamente para todos los aeródromos ICAO en tu ruta
          </div>
        </div>
      )}

      {/* Search bar (only in single mode without predefined ICAO) */}
      {mode === 'single' && !icao && !showRouteEmptyState && (
        <div style={{ marginBottom: '16px', display: 'flex', gap: '8px' }}>
          <input
            type="text"
            value={searchIcao}
            onChange={(e) => setSearchIcao(e.target.value.toUpperCase())}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSearch();
              }
            }}
            placeholder="Código ICAO (ej: LEMD)"
            maxLength={4}
            style={{
              flex: 1,
              padding: '10px',
              fontSize: '14px',
              border: '1px solid var(--sidebar-border)',
              borderRadius: '4px',
              backgroundColor: 'var(--sidebar-bg)',
              color: 'var(--foreground)',
            }}
          />
          <button
            onClick={handleSearch}
            disabled={loading || searchIcao.length < 3}
            style={{
              padding: '10px 20px',
              fontSize: '14px',
              fontWeight: '600',
              backgroundColor: 'var(--button-bg)',
              color: 'var(--button-text)',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'wait' : 'pointer',
              opacity: searchIcao.length < 3 ? 0.5 : 1,
            }}
          >
            {loading ? 'Cargando...' : 'Buscar'}
          </button>
        </div>
      )}

      {/* Filter tabs */}
      {!showRouteEmptyState && (
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
        {[
          { key: 'active', label: 'Activos' },
          { key: 'upcoming', label: 'Próximos' },
          { key: 'expired', label: 'Expirados' },
          { key: 'all', label: 'Todos' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key as FilterType)}
            style={{
              padding: '8px 16px',
              fontSize: '13px',
              fontWeight: '600',
              backgroundColor: filter === tab.key ? 'var(--button-bg)' : 'var(--sidebar-bg)',
              color: filter === tab.key ? 'var(--button-text)' : 'var(--foreground)',
              border: `1px solid ${filter === tab.key ? 'var(--button-bg)' : 'var(--sidebar-border)'}`,
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            {tab.label} ({notams.filter((n) => {
              const now = new Date();
              const start = new Date(n.effectiveStart);
              const end = new Date(n.effectiveEnd);
              if (tab.key === 'active') return now >= start && now <= end;
              if (tab.key === 'upcoming') return now < start;
              if (tab.key === 'expired') return now > end;
              return true;
            }).length})
          </button>
        ))}
      </div>
      )}

      {/* Loading state */}
      {!showRouteEmptyState && (
      <>
      {loading && (
        <div style={{ textAlign: 'center', padding: '32px', color: 'var(--foreground)', opacity: 0.7 }}>
          Cargando NOTAMs...
        </div>
      )}

      {/* Empty state */}
      {!loading && filteredNotams.length === 0 && (
        <div style={{ textAlign: 'center', padding: '32px', color: 'var(--foreground)', opacity: 0.7 }}>
          {notams.length === 0 ? 'No se encontraron NOTAMs' : 'No hay NOTAMs en esta categoría'}
        </div>
      )}

      {/* NOTAMs grouped by ICAO */}
      {!loading && Object.keys(groupedNotams).map((icaoCode) => (
        <div key={icaoCode} style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '12px', color: 'var(--foreground)' }}>
            {icaoCode} ({groupedNotams[icaoCode].length})
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {groupedNotams[icaoCode].map((notam) => (
              <div
                key={notam.id}
                style={{
                  padding: '12px',
                  backgroundColor: 'var(--sidebar-bg)',
                  border: `1px solid ${getNotamTypeColor(notam.type)}`,
                  borderLeft: `4px solid ${getNotamTypeColor(notam.type)}`,
                  borderRadius: '4px',
                }}
              >
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '20px' }}>{getNotamTypeIcon(notam.type)}</span>
                  <span
                    style={{
                      display: 'inline-block',
                      padding: '4px 8px',
                      fontSize: '11px',
                      fontWeight: '700',
                      backgroundColor: getNotamTypeColor(notam.type),
                      color: 'white',
                      borderRadius: '3px',
                      textTransform: 'uppercase',
                    }}
                  >
                    {notam.type}
                  </span>
                  <span
                    style={{
                      display: 'inline-block',
                      padding: '4px 8px',
                      fontSize: '11px',
                      fontWeight: '600',
                      backgroundColor: notam.isActive ? '#10b981' : notam.isExpired ? '#6b7280' : '#3b82f6',
                      color: 'white',
                      borderRadius: '3px',
                    }}
                  >
                    {notam.isActive ? 'ACTIVO' : notam.isExpired ? 'EXPIRADO' : 'PRÓXIMO'}
                  </span>
                </div>

                {/* Dates */}
                <div style={{ fontSize: '12px', color: 'var(--foreground)', opacity: 0.8, marginBottom: '8px' }}>
                  <div>
                    <strong>Inicio:</strong> {formatNotamDate(notam.effectiveStart)}
                  </div>
                  <div>
                    <strong>Fin:</strong> {formatNotamDate(notam.effectiveEnd)}
                  </div>
                </div>

                {/* Text */}
                <div
                  style={{
                    fontSize: '13px',
                    fontFamily: 'monospace',
                    color: 'var(--foreground)',
                    backgroundColor: 'rgba(0,0,0,0.05)',
                    padding: '8px',
                    borderRadius: '4px',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                  }}
                >
                  {notam.text}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
      </>
      )}
    </div>
  );
};

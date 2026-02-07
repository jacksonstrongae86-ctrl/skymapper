import React from 'react';
import { FEATURES } from '../../utils/featureFlags';

export type TabView = 'map' | 'flight' | 'logbook' | 'weight-balance' | 'weather';

interface NavigationTabsProps {
  activeTab: TabView;
  onTabChange: (tab: TabView) => void;
}

export const NavigationTabs: React.FC<NavigationTabsProps> = ({ activeTab, onTabChange }) => {

  const tabs: Array<{ id: TabView; label: string; icon: string; feature?: keyof typeof FEATURES }> = [
    { id: 'map', label: 'Mapa', icon: '🗺️' },
    { id: 'flight', label: 'Vuelo', icon: '✈️', feature: 'LIVE_TRACKING' },
    { id: 'logbook', label: 'Diario', icon: '📋', feature: 'LOGBOOK' },
    { id: 'weight-balance', label: 'Peso y Centrado', icon: '⚖️', feature: 'WEIGHT_BALANCE' },
    { id: 'weather', label: 'Meteorología', icon: '🌤️', feature: 'WEATHER' },
  ];

  // Filter tabs based on feature flags
  const visibleTabs = tabs.filter((tab) => !tab.feature || FEATURES[tab.feature]);

  const tabStyle = (isActive: boolean): React.CSSProperties => ({
    flex: 1,
    padding: '12px',
    textAlign: 'center',
    cursor: 'pointer',
    backgroundColor: isActive ? 'var(--button-bg)' : 'var(--sidebar-bg)',
    color: isActive ? 'var(--button-text)' : 'var(--foreground)',
    border: 'none',
    borderTop: isActive ? '3px solid var(--button-hover)' : '3px solid transparent',
    transition: 'all 0.2s',
    fontSize: '14px',
    fontWeight: isActive ? '600' : '400',
  });

  return (
    <div
      style={{
        display: 'flex',
        backgroundColor: 'var(--sidebar-bg)',
        borderBottom: '1px solid var(--sidebar-border)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}
    >
      {visibleTabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          style={tabStyle(activeTab === tab.id)}
          onMouseEnter={(e) => {
            if (activeTab !== tab.id) {
              e.currentTarget.style.backgroundColor = 'var(--button-hover)';
            }
          }}
          onMouseLeave={(e) => {
            if (activeTab !== tab.id) {
              e.currentTarget.style.backgroundColor = 'var(--sidebar-bg)';
            }
          }}
        >
          <div style={{ fontSize: '20px', marginBottom: '4px' }}>{tab.icon}</div>
          <div style={{ fontSize: '12px' }}>{tab.label}</div>
        </button>
      ))}
    </div>
  );
};

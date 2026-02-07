import React from 'react';

export interface FlightRulesSelectorProps {
  currentRule: 'VFR' | 'IFR';
  onChange: (rule: 'VFR' | 'IFR') => void;
}

export const FlightRulesSelector: React.FC<FlightRulesSelectorProps> = ({ currentRule, onChange }) => {
  return (
    <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
      <button
        onClick={() => onChange('VFR')}
        style={{
          padding: '8px 16px',
          fontSize: '13px',
          fontWeight: '700',
          backgroundColor: currentRule === 'VFR' ? 'var(--button-bg)' : 'transparent',
          color: currentRule === 'VFR' ? 'var(--button-text)' : 'var(--foreground)',
          border: `2px solid ${currentRule === 'VFR' ? 'var(--button-bg)' : 'var(--sidebar-border)'}`,
          borderRadius: '6px',
          cursor: 'pointer',
          transition: 'all 0.2s',
        }}
      >
        ✈️ VFR
      </button>
      <button
        onClick={() => onChange('IFR')}
        style={{
          padding: '8px 16px',
          fontSize: '13px',
          fontWeight: '700',
          backgroundColor: currentRule === 'IFR' ? 'var(--button-bg)' : 'transparent',
          color: currentRule === 'IFR' ? 'var(--button-text)' : 'var(--foreground)',
          border: `2px solid ${currentRule === 'IFR' ? 'var(--button-bg)' : 'var(--sidebar-border)'}`,
          borderRadius: '6px',
          cursor: 'pointer',
          transition: 'all 0.2s',
        }}
      >
        📡 IFR
      </button>
    </div>
  );
};

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AltitudeUnit } from './unitConversions';

interface AltitudeUnitContextType {
  altitudeUnit: AltitudeUnit;
  setAltitudeUnit: (unit: AltitudeUnit) => void;
}

const AltitudeUnitContext = createContext<AltitudeUnitContextType | undefined>(undefined);

interface AltitudeUnitProviderProps {
  children: ReactNode;
}

export const AltitudeUnitProvider: React.FC<AltitudeUnitProviderProps> = ({ children }) => {
  const [altitudeUnit, setAltitudeUnitState] = useState<AltitudeUnit>('ft');

  // Load from localStorage on mount
  useEffect(() => {
    const savedUnit = localStorage.getItem('skymapper-altitude-unit') as AltitudeUnit;
    if (savedUnit && ['ft', 'm', 'fl'].includes(savedUnit)) {
      setAltitudeUnitState(savedUnit);
    }
  }, []);

  // Save to localStorage when changed
  const setAltitudeUnit = (unit: AltitudeUnit) => {
    setAltitudeUnitState(unit);
    localStorage.setItem('skymapper-altitude-unit', unit);
  };

  return (
    <AltitudeUnitContext.Provider value={{ altitudeUnit, setAltitudeUnit }}>
      {children}
    </AltitudeUnitContext.Provider>
  );
};

export const useAltitudeUnit = () => {
  const context = useContext(AltitudeUnitContext);
  if (context === undefined) {
    throw new Error('useAltitudeUnit must be used within an AltitudeUnitProvider');
  }
  return context;
};
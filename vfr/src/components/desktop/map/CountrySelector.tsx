// components/CountrySelector.tsx
import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface CountrySelectorProps {
  selectedCountry: string;
  onCountryChange: (country: string) => void;
}

const AVAILABLE_COUNTRIES = [
  { code: 'es', name: 'Spain', flag: '🇪🇸' },
  { code: 'us', name: 'United States', flag: '🇺🇸' },
  { code: 'gb', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'mx', name: 'Mexico', flag: '🇲🇽' },
  { code: 'it', name: 'Italy', flag: '🇮🇹' },
  { code: 'fr', name: 'France', flag: '🇫🇷' },
  { code: 'de', name: 'Germany', flag: '🇩🇪' },
  { code: 'ca', name: 'Canada', flag: '🇨🇦' },
  { code: 'nl', name: 'Netherlands', flag: '🇳🇱' },
  { code: 'be', name: 'Belgium', flag: '🇧🇪' },
  { code: 'ch', name: 'Switzerland', flag: '🇨🇭' },
  { code: 'at', name: 'Austria', flag: '🇦🇹' },
  { code: 'pt', name: 'Portugal', flag: '🇵🇹' },
];

const CountrySelector: React.FC<CountrySelectorProps> = ({
  selectedCountry,
  onCountryChange
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedCountryData = AVAILABLE_COUNTRIES.find(country => country.code === selectedCountry);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleCountrySelect = (countryCode: string) => {
    onCountryChange(countryCode);
    setIsOpen(false);
  };

  return (
    <div className="country-selector mb-4" ref={dropdownRef}>
      <label className="block text-sm font-medium mb-2 text-[var(--sidebar-text)]">
        Aviation Data Country:
      </label>

      {/* Custom Dropdown Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 rounded-lg bg-[var(--input-bg)] border border-[var(--sidebar-border)] text-[var(--sidebar-text)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] flex items-center justify-between hover:bg-[var(--button-hover)] transition-colors"
      >
        <span className="flex items-center gap-2">
          <span className="text-lg">{selectedCountryData?.flag}</span>
          <span>{selectedCountryData?.name}</span>
        </span>
        <ChevronDown
          size={16}
          className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Scrollable Dropdown */}
      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-[var(--input-bg)] border border-[var(--sidebar-border)] rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {AVAILABLE_COUNTRIES.map(country => (
            <button
              key={country.code}
              onClick={() => handleCountrySelect(country.code)}
              className={`w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-[var(--button-hover)] transition-colors ${
                selectedCountry === country.code
                  ? 'bg-[var(--accent-color)] text-white'
                  : 'text-[var(--sidebar-text)]'
              }`}
            >
              <span className="text-lg">{country.flag}</span>
              <span>{country.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default CountrySelector;

// components/CountrySelector.tsx
import React from 'react';

interface CountrySelectorProps {
  selectedCountry: string;
  onCountryChange: (country: string) => void;
}

const AVAILABLE_COUNTRIES = [
  { code: 'es', name: 'Spain', flag: '🇪🇸' },
  { code: 'us', name: 'United States', flag: '🇺🇸' },
  { code: 'uk', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'de', name: 'Germany', flag: '🇩🇪' },
  { code: 'fr', name: 'France', flag: '🇫🇷' },
  { code: 'ca', name: 'Canada', flag: '🇨🇦' },
];

const CountrySelector: React.FC<CountrySelectorProps> = ({
  selectedCountry,
  onCountryChange
}) => {
  return (
    <div className="country-selector mb-4">
      <label className="block text-sm font-medium mb-2 text-[var(--sidebar-text)]">
        Aviation Data Country:
      </label>
      <select
        value={selectedCountry}
        onChange={(e) => onCountryChange(e.target.value)}
        className="w-full px-3 py-2 rounded-lg bg-[var(--input-bg)] border border-[var(--sidebar-border)] text-[var(--sidebar-text)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)]"
      >
        {AVAILABLE_COUNTRIES.map(country => (
          <option key={country.code} value={country.code}>
            {country.flag} {country.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default CountrySelector;

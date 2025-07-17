import React, { useState, useEffect, useRef } from "react";
import { MapControlsProps } from "../../../utils/types";
import { useTheme } from "../../../utils/ThemeContext";
import {
  Menu,
  Map,
  Satellite,
  Globe,
  Mountain,
  Trash2,
  XCircle,
  Loader2,
  AlertCircle,
  Plane,
  Shield,
  Radio,
  AlertTriangle,
  Flame,
} from "lucide-react";

type AviationLayerKey = "airports" | "airspaces" | "navigation" | "obstacles" | "hotspots";

interface ExtendedMapControlProps extends MapControlsProps {
  showAviationData?: boolean;
  onToggleAviationData?: (enabled: boolean) => void;
  aviationLayers?: {
    airports: boolean;
    airspaces: boolean;
    navigation: boolean;
    obstacles: boolean;
    hotspots: boolean;
  };
  onLayerToggle?: (layer: AviationLayerKey, enabled: boolean) => void;
  selectedCountry?: string;
  onCountryChange?: (country: string) => void;
}

const MapControls: React.FC<ExtendedMapControlProps> = ({
  mapType,
  setMapType,
  onDeleteLastWaypoint,
  onClearWaypoints,
  onAddSearchWaypoint,
  showAviationData = false,
  onToggleAviationData,
  aviationLayers = {
    airports: true,
    airspaces: true,
    navigation: true,
    obstacles: true,
    hotspots: true,
  },
  onLayerToggle,
  selectedCountry = 'es',
  onCountryChange,
}) => {
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  type SearchResult = {
    place_id: number;
    lat: string;
    lon: string;
    display_name: string;
    type?: string;
    class?: string;
  };

  // Available countries
  const AVAILABLE_COUNTRIES = [
    { code: "es", name: "Spain", flag: "🇪🇸" },
    { code: "us", name: "United States", flag: "🇺🇸" },
    { code: "gb", name: "United Kingdom", flag: "🇬🇧" },
    { code: "mx", name: "Mexico", flag: "🇲🇽" },
    { code: "it", name: "Italy", flag: "🇮🇹" },
    { code: "fr", name: "France", flag: "🇫🇷" },
    { code: "de", name: "Germany", flag: "🇩🇪" },
    { code: "ca", name: "Canada", flag: "🇨🇦" },
    { code: "nl", name: "Netherlands", flag: "🇳🇱" },
    { code: "be", name: "Belgium", flag: "🇧🇪" },
    { code: "ch", name: "Switzerland", flag: "🇨🇭" },
    { code: "at", name: "Austria", flag: "🇦🇹" },
    { code: "pt", name: "Portugal", flag: "🇵🇹" },
  ];

  // Fix: Use the same Nominatim approach as desktop
  const searchWithFetch = React.useCallback(
    async (query: string): Promise<SearchResult[]> => {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        query
      )}&limit=5&addressdetails=1`;
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "User-Agent": "Skymapper/1.0",
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.map((item: SearchResult) => ({
        place_id: item.place_id,
        lat: item.lat,
        lon: item.lon,
        display_name: item.display_name,
        type: item.type,
        class: item.class,
      }));
    },
    []
  );

  const performSearch = React.useCallback(
    async (query: string) => {
      if (!query.trim()) return;
      setIsSearching(true);
      setSearchError(null);
      try {
        let results: SearchResult[] = [];
        try {
          // eslint-disable-next-line @typescript-eslint/no-require-imports
          const Nominatim = require("nominatim-browser");
          results = await Nominatim.geocode({
            q: query,
            addressdetails: true,
            limit: 5,
            format: "json",
          });
        } catch {
          // Fallback to direct fetch (like desktop)
          results = await searchWithFetch(query);
        }
        if (results && results.length > 0) {
          setSearchResults(results);
        } else {
          setSearchResults([]);
          setSearchError("No locations found");
        }
      } catch (err) {
        const error = err as unknown as Error;
        setSearchError(`Search failed: ${error.message || "Unknown error"}`);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    },
    [searchWithFetch]
  );

  // Fix: Use the same debounced search pattern as desktop
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    if (searchQuery.trim() && searchQuery.length >= 2) {
      searchTimeoutRef.current = setTimeout(() => {
        performSearch(searchQuery.trim());
      }, 300);
    } else {
      setSearchResults([]);
      setSearchError(null);
    }
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, performSearch]);

  // Fix: Use the same result handling as desktop
  const handleResultClick = (result: SearchResult) => {
    setIsOpen(false);
    setSearchQuery("");
    setSearchResults([]);
    setSearchError(null);
    const lat = parseFloat(result.lat);
    const lon = parseFloat(result.lon);
    if (isNaN(lat) || isNaN(lon)) {
      return;
    }
    const nameParts = result.display_name.split(",");
    let shortenedName;
    if (nameParts.length >= 2) {
      shortenedName = nameParts.slice(0, 2).join(",").trim();
    } else {
      shortenedName = nameParts[0].trim();
    }
    if (shortenedName.length > 50) {
      shortenedName = shortenedName.substring(0, 47) + "...";
    }
    onAddSearchWaypoint(lat, lon, shortenedName);
  };

  const MAP_TYPES = [
    { value: "street", label: "Street", icon: Map },
    { value: "sat", label: "Satellite", icon: Satellite },
    { value: "hybrid", label: "Hybrid", icon: Globe },
    { value: "terrain", label: "Terrain", icon: Mountain },
  ] as const;

  return (
    <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-8 h-8 rounded-lg
          ${`button-gradient-${theme}`}
          text-[var(--button-text)]
          hover:opacity-90
          transition-all duration-200
          flex items-center justify-center
        `}
      >
        <Menu size={16} />
      </button>

      {isOpen && (
        <div
          ref={dropdownRef}
          className="space-y-4 bg-[var(--sidebar-bg)] rounded-lg p-4 border border-[var(--sidebar-border)]"
        >
          {/* Search Section - Fixed to match desktop */}
          <div>
            <h3 className="text-sm font-medium mb-2 text-[var(--sidebar-text)]">
              Search Location
            </h3>
            <div className="flex items-center gap-2 mb-2">
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search location..."
                className={`
                  flex-1 px-3 py-2 rounded-lg text-sm
                  bg-[var(--input-bg)]
                  border border-[var(--sidebar-border)]
                  text-[var(--sidebar-text)]
                  placeholder:text-[var(--sidebar-text-muted)]
                  focus:outline-none
                  focus:ring-2
                  focus:ring-[var(--accent-color)]
                  transition-all duration-200
                  min-w-0
                `}
              />
              {isSearching && (
                <Loader2 className="w-4 h-4 animate-spin text-[var(--sidebar-text-muted)]" />
              )}
            </div>

            {/* Search results - Fixed to match desktop */}
            <div className="max-h-40 overflow-y-auto">
              {searchError && (
                <div className="flex items-center gap-2 p-2 text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span className="truncate">{searchError}</span>
                </div>
              )}

              {searchResults.length > 0 && (
                <div className="space-y-1">
                  {searchResults.map((result) => (
                    <button
                      key={result.place_id}
                      onClick={() => handleResultClick(result)}
                      className="w-full text-left p-2 rounded-lg hover:bg-[var(--button-hover)] transition-colors"
                    >
                      <div className="font-medium text-[var(--sidebar-text)] truncate">
                        {result.display_name.split(",")[0]}
                      </div>
                      <div className="text-sm text-[var(--sidebar-text-muted)] truncate">
                        {result.display_name.split(",").slice(1).join(",").trim()}
                      </div>
                      <div className="text-xs text-[var(--sidebar-text-muted)]">
                        {result.lat}, {result.lon}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Status messages - Fixed to match desktop */}
              {!isSearching && searchResults.length === 0 && !searchError && searchQuery.length >= 2 && (
                <div className="p-2 text-[var(--sidebar-text-muted)] text-sm">
                  No locations found
                </div>
              )}

              {!isSearching && searchResults.length === 0 && !searchError && searchQuery.length < 2 && searchQuery.length > 0 && (
                <div className="p-2 text-[var(--sidebar-text-muted)] text-sm">
                  Type at least 2 characters to search
                </div>
              )}

              {!isSearching && searchResults.length === 0 && !searchError && searchQuery.length === 0 && (
                <div className="p-2 text-[var(--sidebar-text-muted)] text-sm">
                  Start typing to search for locations
                </div>
              )}
            </div>
          </div>

          {/* Rest of the component remains the same */}
          {/* Country Selection */}
          {onCountryChange && (
            <div>
              <h3 className="text-sm font-medium mb-2 text-[var(--sidebar-text)]">
                Country
              </h3>
              <div className="grid grid-cols-2 gap-2 overflow-auto">
                {AVAILABLE_COUNTRIES.map((country) => (
                  <button
                    key={country.code}
                    onClick={() => {
                      onCountryChange(country.code);
                    }}
                    className={`
                      px-3 py-2 rounded-lg text-sm
                      flex items-center gap-2
                      transition-all duration-200
                      ${
                        selectedCountry === country.code
                          ? `${`button-gradient-${theme}`} text-[var(--button-text)]`
                          : "hover:bg-[var(--button-hover)] text-[var(--sidebar-text)]"
                      }
                    `}
                  >
                    <span className="text-xs">{country.flag}</span>
                    <span className="truncate">{country.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Aviation Data */}
          {onToggleAviationData && onLayerToggle && (
            <div>
              <h3 className="text-sm font-medium mb-2 text-[var(--sidebar-text)]">
                Aviation Data
              </h3>

              <button
                onClick={() => onToggleAviationData(!showAviationData)}
                className={`
                  w-full px-3 py-2 rounded-lg text-sm mb-2
                  flex items-center gap-2
                  transition-all duration-200
                  ${
                    showAviationData
                      ? `${`button-gradient-${theme}`} text-[var(--button-text)]`
                      : "hover:bg-[var(--button-hover)] text-[var(--sidebar-text)]"
                  }
                `}
              >
                <Plane size={16} />
                Show Aviation Data
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => onLayerToggle("airports", !aviationLayers.airports)}
                  className={`
                    px-3 py-2 rounded-lg text-sm
                    flex items-center gap-2
                    transition-all duration-200
                    ${
                      aviationLayers.airports
                        ? `${`button-gradient-${theme}`} text-[var(--button-text)]`
                        : "hover:bg-[var(--button-hover)] text-[var(--sidebar-text)]"
                    }
                  `}
                >
                  <Plane size={14} />
                  <span className="truncate">Airports</span>
                </button>

                <button
                  onClick={() => onLayerToggle("airspaces", !aviationLayers.airspaces)}
                  className={`
                    px-3 py-2 rounded-lg text-sm
                    flex items-center gap-2
                    transition-all duration-200
                    ${
                      aviationLayers.airspaces
                        ? `${`button-gradient-${theme}`} text-[var(--button-text)]`
                        : "hover:bg-[var(--button-hover)] text-[var(--sidebar-text)]"
                    }
                  `}
                >
                  <Shield size={14} />
                  <span className="truncate">Airspaces</span>
                </button>

                <button
                  onClick={() => onLayerToggle("navigation", !aviationLayers.navigation)}
                  className={`
                    px-3 py-2 rounded-lg text-sm
                    flex items-center gap-2
                    transition-all duration-200
                    ${
                      aviationLayers.navigation
                        ? `${`button-gradient-${theme}`} text-[var(--button-text)]`
                        : "hover:bg-[var(--button-hover)] text-[var(--sidebar-text)]"
                    }
                  `}
                >
                  <Radio size={14} />
                  <span className="truncate">Navigation</span>
                </button>

                <button
                  onClick={() => onLayerToggle("obstacles", !aviationLayers.obstacles)}
                  className={`
                    px-3 py-2 rounded-lg text-sm
                    flex items-center gap-2
                    transition-all duration-200
                    ${
                      aviationLayers.obstacles
                        ? `${`button-gradient-${theme}`} text-[var(--button-text)]`
                        : "hover:bg-[var(--button-hover)] text-[var(--sidebar-text)]"
                    }
                  `}
                >
                  <AlertTriangle size={14} />
                  <span className="truncate">Obstacles</span>
                </button>

                <button
                  onClick={() => onLayerToggle("hotspots", !aviationLayers.hotspots)}
                  className={`
                    px-3 py-2 rounded-lg text-sm
                    flex items-center gap-2
                    transition-all duration-200
                    ${
                      aviationLayers.hotspots
                        ? `${`button-gradient-${theme}`} text-[var(--button-text)]`
                        : "hover:bg-[var(--button-hover)] text-[var(--sidebar-text)]"
                    }
                  `}
                >
                  <Flame size={14} />
                  <span className="truncate">Hotspots</span>
                </button>
              </div>
            </div>
          )}

          {/* Map Types Section */}
          <div>
            <h3 className="text-sm font-medium mb-2 text-[var(--sidebar-text)]">
              Map Type
            </h3>
            <div className="space-y-1">
              {MAP_TYPES.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => {
                    setMapType(value);
                  }}
                  className={`
                    w-full px-3 py-2
                    flex items-center gap-2
                    rounded-lg text-left
                    transition-all duration-200
                    ${
                      mapType === value
                        ? `${`button-gradient-${theme}`} text-[var(--button-text)]`
                        : "hover:bg-[var(--button-hover)] text-[var(--sidebar-text)]"
                    }
                  `}
                >
                  <Icon size={16} />
                  <span className="text-sm">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Actions Section */}
          <div>
            <h3 className="text-sm font-medium mb-2 text-[var(--sidebar-text)]">
              Actions
            </h3>
            <div className="space-y-1">
              <button
                onClick={() => {
                  onDeleteLastWaypoint();
                  setIsOpen(false);
                }}
                className="w-full px-3 py- flex items-center gap-2 rounded-lg hover:bg-[var(--button-hover)] text-[var(--sidebar-text)]"
              >
                <XCircle size={16} />
                <span className="text-sm">Delete Last Waypoint</span>
              </button>
              <button
                onClick={() => {
                  onClearWaypoints();
                  setIsOpen(false);
                }}
                className="w-full px-3 py-2 flex items-center gap-2 rounded-lg hover:bg-[var(--button-hover)] text-[var(--sidebar-text)]"
              >
                <Trash2 size={16} />
                <span className="text-sm">Clear All Waypoints</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapControls;

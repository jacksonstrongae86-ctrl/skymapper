import React, { useState, useEffect, useRef } from "react";
import { MapControlsProps } from "../../../utils/types";
import { useTheme } from "../../../utils/ThemeContext";
import {
  Layers,
  Trash2,
  XCircle,
  Search,
  Map,
  Satellite,
  Globe,
  Mountain,
  Loader2,
  AlertCircle,
} from "lucide-react";

const MapControls: React.FC<MapControlsProps> = ({
  mapType,
  setMapType,
  onDeleteLastWaypoint,
  onClearWaypoints,
  onAddSearchWaypoint,
}) => {
  const { theme } = useTheme();
  const [isThemeSelectorOpen, setIsThemeSelectorOpen] = useState(false);
  const [isMapSelectorOpen, setIsMapSelectorOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const themeSelectorRef = useRef<HTMLDivElement>(null);
  const mapSelectorRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        (!themeSelectorRef.current?.contains(event.target as Node) &&
          isThemeSelectorOpen) ||
        (!mapSelectorRef.current?.contains(event.target as Node) &&
          isMapSelectorOpen) ||
        (!searchRef.current?.contains(event.target as Node) && isSearchOpen)
      ) {
        setIsThemeSelectorOpen(false);
        setIsMapSelectorOpen(false);
        setIsSearchOpen(false);
      }
    };

    if (isThemeSelectorOpen || isMapSelectorOpen || isSearchOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isThemeSelectorOpen, isMapSelectorOpen, isSearchOpen]);

  // Search function using fetch directly
  const searchWithFetch = React.useCallback(
    async (query: string): Promise<SearchResult[]> => {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        query
      )}&limit=5&addressdetails=1`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "User-Agent": "Skymapper/1.0", // Replace with your app name
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
          // Fallback to direct fetch
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

  const handleResultClick = (result: SearchResult) => {
    setIsSearchOpen(false);
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

  const handleSearchToggle = () => {
    setIsSearchOpen((prev) => !prev);
    setIsMapSelectorOpen(false);
    setIsThemeSelectorOpen(false);
    if (!isSearchOpen) {
      setSearchQuery("");
      setSearchResults([]);
      setSearchError(null);
    }
  };

  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [isSearchOpen]);

  // **Live search useEffect with debounce**
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchQuery.trim() && searchQuery.length >= 2) {
      searchTimeoutRef.current = setTimeout(() => {
        performSearch(searchQuery.trim());
      }, 300); // 300ms debounce
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

  const ButtonClass = `
    w-10 h-10
    ${`button-gradient-${theme}`}
    backdrop-blur-md
    rounded-xl
    shadow-lg
    border border-[var(--sidebar-border)]
    focus:outline-none
    flex items-center justify-center
    hover:opacity-90
    transition-all duration-200
  `;

  const MAP_TYPES = [
    { value: "street", label: "Street", icon: Map },
    { value: "sat", label: "Satellite", icon: Satellite },
    { value: "hybrid", label: "Hybrid", icon: Globe },
    { value: "terrain", label: "Terrain", icon: Mountain },
  ] as const;

  return (
    <div className="fixed right-4 top-4 z-50 grid grid-rows-2 gap-3">
      <div className="grid grid-cols-2 gap-3">
        {/* Search Button */}
        <div className="relative" ref={searchRef}>
          <button
            className={`${ButtonClass} ${isSearchOpen ? "opacity-75" : ""}`}
            onClick={handleSearchToggle}
            title="Search Location"
          >
            <Search size={18} className="text-[var(--button-text)]" />
          </button>

          {isSearchOpen && (
            <div
              className={`
              absolute top-12 right-0
              ${`gradient-${theme}`}
              backdrop-blur-md p-3
              rounded-xl shadow-lg
              border border-[var(--sidebar-border)]
              min-w-[320px]
              z-50
            `}
            >
              <div className="flex gap-2 mb-2">
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search location..."
                  className={`
                    flex-1 px-3 py-2 rounded-lg
                    bg-[var(--input-bg)]
                    border border-[var(--sidebar-border)]
                    text-[var(--sidebar-text)]
                    placeholder:text-[var(--sidebar-text-muted)]
                    focus:outline-none
                    focus:ring-2
                    focus:ring-[var(--accent-color)]
                    transition-all duration-200
                  `}
                />
                {isSearching && (
                  <div className="flex items-center justify-center w-10 h-10">
                    <Loader2
                      size={16}
                      className="animate-spin text-[var(--sidebar-text)]"
                    />
                  </div>
                )}
              </div>

              {/* **Always visible search results area with custom scrollbar** */}
              <div className="max-h-48 overflow-y-auto custom-scrollbar">
                {searchError && (
                  <div className="text-red-400 text-sm py-2 px-2 text-center flex items-center justify-center gap-2">
                    <AlertCircle size={16} />
                    {searchError}
                  </div>
                )}

                {searchResults.length > 0 && (
                  <div className="space-y-1">
                    {searchResults.map((result) => (
                      <button
                        key={result.place_id}
                        className={`
                          block w-full text-left px-3 py-2 rounded-lg
                          text-[var(--sidebar-text)]
                          hover:bg-[var(--button-hover)]
                          transition-all duration-200
                          text-sm
                          border border-transparent
                          hover:border-[var(--accent-color)]
                        `}
                        onClick={() => handleResultClick(result)}
                      >
                        <div className="truncate font-medium">
                          {result.display_name.split(",")[0]}
                        </div>
                        <div className="truncate text-xs opacity-70">
                          {result.display_name
                            .split(",")
                            .slice(1)
                            .join(",")
                            .trim()}
                        </div>
                        <div className="text-xs opacity-50 mt-1">
                          {result.lat}, {result.lon}
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {!isSearching &&
                  searchResults.length === 0 &&
                  !searchError &&
                  searchQuery.length >= 2 && (
                    <div className="text-[var(--sidebar-text-muted)] text-sm py-4 text-center">
                      No locations found
                    </div>
                  )}

                {!isSearching &&
                  searchResults.length === 0 &&
                  !searchError &&
                  searchQuery.length < 2 &&
                  searchQuery.length > 0 && (
                    <div className="text-[var(--sidebar-text-muted)] text-sm py-4 text-center">
                      Type at least 2 characters to search
                    </div>
                  )}

                {!isSearching &&
                  searchResults.length === 0 &&
                  !searchError &&
                  searchQuery.length === 0 && (
                    <div className="text-[var(--sidebar-text-muted)] text-sm py-4 text-center">
                      Start typing to search for locations
                    </div>
                  )}
              </div>
            </div>
          )}
        </div>

        {/* Map Type Selector */}
        <div className="relative" ref={mapSelectorRef}>
          <button
            onClick={() => {
              setIsMapSelectorOpen((prev) => !prev);
              setIsThemeSelectorOpen(false);
              setIsSearchOpen(false);
            }}
            className={`${ButtonClass} ${
              isMapSelectorOpen ? "opacity-75" : ""
            }`}
            title="Map Type"
          >
            <Layers size={18} className="text-[var(--button-text)]" />
          </button>

          {isMapSelectorOpen && (
            <div
              className={`
              absolute top-12 right-0
              ${`gradient-${theme}`}
              backdrop-blur-md p-2
              rounded-xl shadow-lg
              border border-[var(--sidebar-border)]
              min-w-[140px]
              z-50
            `}
            >
              {MAP_TYPES.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => {
                    setMapType(value);
                    setIsMapSelectorOpen(false);
                  }}
                  className={`
                    w-full px-3 py-2
                    flex items-center gap-2
                    rounded-lg
                    transition-all duration-200
                    ${
                      mapType === value
                        ? `${`button-gradient-${theme}`} text-[var(--button-text)]`
                        : "hover:bg-[var(--button-hover)] text-[var(--sidebar-text)]"
                    }
                  `}
                  title={label}
                >
                  <Icon size={16} />
                  <span className="text-sm font-medium">{label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Delete Last Waypoint Button */}
        <button
          className={ButtonClass}
          onClick={onDeleteLastWaypoint}
          title="Delete Last Waypoint"
        >
          <Trash2 size={18} className="text-[var(--button-text)]" />
        </button>

        <button
          className={ButtonClass}
          onClick={onClearWaypoints}
          title="Clear All Waypoints"
        >
          <XCircle size={18} className="text-[var(--button-text)]" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 justify-end">
        <div></div>
        {/* Clear All Waypoint Button */}

      </div>
    </div>
  );
};

export default MapControls;

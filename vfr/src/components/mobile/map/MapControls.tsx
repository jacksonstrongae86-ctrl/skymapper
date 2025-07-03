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
  // Search,
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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!dropdownRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

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

    // **Shorten the waypoint name**
    const nameParts = result.display_name.split(",");
    let shortenedName;

    if (nameParts.length >= 2) {
      // Use first two parts (e.g., "London, England" instead of full address)
      shortenedName = nameParts.slice(0, 2).join(",").trim();
    } else {
      // Use first part only
      shortenedName = nameParts[0].trim();
    }

    // Limit to 50 characters max
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
    <div className="relative" ref={dropdownRef}>
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
        <Menu size={14} />
      </button>

      {isOpen && (
        <div
          className={`
          absolute top-full left-0 mt-2
          ${`gradient-${theme}`}
          backdrop-blur-md
          rounded-lg shadow-lg
          border border-[var(--sidebar-border)]
          min-w-[280px]
          z-50
          overflow-hidden
        `}
        >
          {/* **Search Section with Responsive Sizing** */}
          <div className="p-3 border-b border-[var(--sidebar-border)]">
            {/* **Search Section with Horizontal Overflow Protection** */}
            <div className="p-3 border-b border-[var(--sidebar-border)]">
              <div className="text-xs text-[var(--text-muted)] px-2 pb-2">
                Search Location
              </div>
              <div className="flex gap-2 mb-2">
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search..."
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
                  <div className="flex items-center justify-center w-8 h-8 flex-shrink-0">
                    <Loader2
                      size={14}
                      className="animate-spin text-[var(--sidebar-text)]"
                    />
                  </div>
                )}
              </div>

              {/* **Search results with text truncation** */}
              <div className="max-h-[20vh] min-h-[80px] overflow-y-auto custom-scrollbar">
                {searchError && (
                  <div className="text-red-400 text-xs py-2 px-2 text-center flex items-center justify-center gap-2">
                    <AlertCircle size={12} className="flex-shrink-0" />
                    <span className="truncate">{searchError}</span>
                  </div>
                )}

                {searchResults.length > 0 && (
                  <div className="space-y-1">
                    {searchResults.map((result) => (
                      <button
                        key={result.place_id}
                        className={`
              block w-full text-left px-2 py-2 rounded-lg
              text-[var(--sidebar-text)]
              hover:bg-[var(--button-hover)]
              transition-all duration-200
              text-xs
              border border-transparent
              hover:border-[var(--accent-color)]
              min-w-0
            `}
                        onClick={() => handleResultClick(result)}
                      >
                        <div className="truncate font-medium">
                          {result.display_name.split(",")[0]}
                        </div>
                        <div className="truncate text-xs opacity-70">
                          {result.display_name
                            .split(",")
                            .slice(1, 3)
                            .join(",")
                            .trim()}
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Status messages with truncation */}
                {!isSearching &&
                  searchResults.length === 0 &&
                  !searchError &&
                  searchQuery.length >= 2 && (
                    <div className="text-[var(--sidebar-text-muted)] text-xs py-3 text-center truncate px-2">
                      No locations found
                    </div>
                  )}

                {!isSearching &&
                  searchResults.length === 0 &&
                  !searchError &&
                  searchQuery.length < 2 &&
                  searchQuery.length > 0 && (
                    <div className="text-[var(--sidebar-text-muted)] text-xs py-3 text-center truncate px-2">
                      Type 2+ characters
                    </div>
                  )}

                {!isSearching &&
                  searchResults.length === 0 &&
                  !searchError &&
                  searchQuery.length === 0 && (
                    <div className="text-[var(--sidebar-text-muted)] text-xs py-3 text-center truncate px-2">
                      Start typing to search
                    </div>
                  )}
              </div>
            </div>
          </div>

          {/* Map Types Section */}
          <div className="p-2 space-y-1">
            <div className="text-xs text-[var(--text-muted)] px-2 pb-1">
              Map Type
            </div>
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
                <Icon size={14} />
                <span className="text-sm">{label}</span>
              </button>
            ))}
          </div>

          {/* Actions Section */}
          <div className="border-t border-[var(--sidebar-border)] p-2 space-y-1">
            <div className="text-xs text-[var(--text-muted)] px-2 pb-1">
              Actions
            </div>
            <button
              onClick={() => {
                onDeleteLastWaypoint();
                setIsOpen(false);
              }}
              className="w-full px-3 py-2 flex items-center gap-2 rounded-lg hover:bg-[var(--button-hover)] text-[var(--sidebar-text)]"
            >
              <Trash2 size={14} />
              <span className="text-sm">Delete Last Waypoint</span>
            </button>
            <button
              onClick={() => {
                onClearWaypoints();
                setIsOpen(false);
              }}
              className="w-full px-3 py-2 flex items-center gap-2 rounded-lg hover:bg-[var(--button-hover)] text-[var(--sidebar-text)]"
            >
              <XCircle size={14} />
              <span className="text-sm">Clear All Waypoints</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapControls;

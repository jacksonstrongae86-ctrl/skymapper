import React, { useState, useEffect, useRef } from "react";
import { MapControlsProps, Waypoint } from "../../../utils/types";
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
  Plane,
  Shield,
  Radio,
  AlertTriangle,
  Flame,
  Save,
  FolderOpen,
  Edit,
  Trash2 as Trash,
  Check,
  X,
  Share2,
  MapPin,
} from "lucide-react";
import { serializeRoute } from "@/src/hooks/index/useWaypoints";

type AviationLayerKey =
  | "airports"
  | "airspaces"
  | "navigation"
  | "obstacles"
  | "hotspots"
  | "reportingpoints";

interface SavedRoute {
  id: string; // Unique ID (e.g. uuid)
  name: string; // User's name for the route
  waypoints: Waypoint[];
  lastModified: string; // ISO date string
}
interface ExtendedMapControlsProps extends MapControlsProps {
  showAviationData: boolean;
  onToggleAviationData: (enabled: boolean) => void;
  aviationLayers: {
    airports: boolean;
    airspaces: boolean;
    navigation: boolean;
    obstacles: boolean;
    hotspots: boolean;
    reportingpoints: boolean;
  };
  onLayerToggle: (layer: AviationLayerKey, enabled: boolean) => void;
  selectedCountry: string;
  onCountryChange: (country: string) => void;
  waypoints: Waypoint[];
  listSavedRoutes: () => SavedRoute[];
  saveNewRoute: (name: string) => void;
  overwriteRoute: (id: string, name?: string) => void;
  loadRoute: (id: string) => void;
  deleteRoute: (id: string) => void;
  renameRoute: (id: string, name: string) => void;
}

const MapControls: React.FC<ExtendedMapControlsProps> = ({
  mapType,
  setMapType,
  onDeleteLastWaypoint,
  onClearWaypoints,
  onAddSearchWaypoint,
  showAviationData,
  onToggleAviationData,
  aviationLayers,
  onLayerToggle,
  selectedCountry,
  onCountryChange,
  listSavedRoutes,
  saveNewRoute,
  overwriteRoute,
  loadRoute,
  deleteRoute,
  renameRoute,
  waypoints,
}) => {
  const { theme } = useTheme();
  const [isThemeSelectorOpen, setIsThemeSelectorOpen] = useState(false);
  const [isMapSelectorOpen, setIsMapSelectorOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAviationOpen, setIsAviationOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [isCountryOpen, setIsCountryOpen] = useState(false);
  const [showRouteManager, setShowRouteManager] = useState(false);
  const [isRouteManagerOpen, setIsRouteManagerOpen] = useState(false);
  const [saveName, setSaveName] = useState("");
  const [renameId, setRenameId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const routeManagerRef = useRef<HTMLDivElement>(null);

  const themeSelectorRef = useRef<HTMLDivElement>(null);
  const mapSelectorRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const aviationRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const countryRef = useRef<HTMLDivElement>(null);

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
        (!searchRef.current?.contains(event.target as Node) && isSearchOpen) ||
        (!aviationRef.current?.contains(event.target as Node) &&
          isAviationOpen) ||
        (!routeManagerRef.current?.contains(event.target as Node) &&
          showRouteManager)
      ) {
        setIsThemeSelectorOpen(false);
        setIsMapSelectorOpen(false);
        setIsSearchOpen(false);
        setIsAviationOpen(false);
        setShowRouteManager(false);
        setRenameId(null);
      }
    };

    if (
      isThemeSelectorOpen ||
      isMapSelectorOpen ||
      isSearchOpen ||
      isAviationOpen
    ) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [
    isThemeSelectorOpen,
    isMapSelectorOpen,
    isSearchOpen,
    isAviationOpen,
    showRouteManager,
  ]);

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

  const generateShareableLink = (route: SavedRoute): string => {
    // Use the serializeRoute helper from props or import directly if available here
    // To do that, pass serializeRoute as a prop to MapControls or import it in
    // For demonstration, you can call serializeRoute(route.waypoints)

    const serialized = serializeRoute(route.waypoints);
    return `${window.location.origin}${
      window.location.pathname
    }?importRoute=${encodeURIComponent(serialized)}`;
  };

  const handleCopyLink = (route: SavedRoute) => {
    const link = generateShareableLink(route);
    navigator.clipboard
      .writeText(link)
      .then(() => {
        // optionally notify user, e.g. toast
        alert("Shareable link copied to clipboard!");
      })
      .catch(() => {
        alert("Failed to copy link.");
      });
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

  // Available countries (same as in CountrySelector)
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

  // Update click outside handler to include country selector
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        (!themeSelectorRef.current?.contains(event.target as Node) &&
          isThemeSelectorOpen) ||
        (!mapSelectorRef.current?.contains(event.target as Node) &&
          isMapSelectorOpen) ||
        (!searchRef.current?.contains(event.target as Node) && isSearchOpen) ||
        (!aviationRef.current?.contains(event.target as Node) &&
          isAviationOpen) ||
        (!countryRef.current?.contains(event.target as Node) && isCountryOpen)
      ) {
        setIsThemeSelectorOpen(false);
        setIsMapSelectorOpen(false);
        setIsSearchOpen(false);
        setIsAviationOpen(false);
        setIsCountryOpen(false);
      }
    };

    if (
      isThemeSelectorOpen ||
      isMapSelectorOpen ||
      isSearchOpen ||
      isAviationOpen ||
      isCountryOpen
    ) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [
    isThemeSelectorOpen,
    isMapSelectorOpen,
    isSearchOpen,
    isAviationOpen,
    isCountryOpen,
  ]);

  return (
    <div className="fixed right-4 top-4 z-50 grid grid-rows-2 gap-3">
      <div className="grid grid-cols-2 gap-3">
        {/* Search Button */}
        <div className="relative" ref={searchRef}>
          <button
            id="search-button"
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
            id="map-type-selector"
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
        {/* Country Selector */}
        <div className="relative" ref={countryRef}>
          <button
            id="country-selector"
            onClick={() => {
              setIsCountryOpen((prev) => !prev);
              setIsMapSelectorOpen(false);
              setIsThemeSelectorOpen(false);
              setIsSearchOpen(false);
              setIsAviationOpen(false);
            }}
            className={`${ButtonClass} ${isCountryOpen ? "opacity-75" : ""}`}
            title="Select Country"
          >
            <Globe size={18} className="text-[var(--button-text)]" />
          </button>

          {isCountryOpen && (
            <div
              className={`
              absolute top-12 right-0
              ${`gradient-${theme}`}
              backdrop-blur-md p-2
              rounded-xl shadow-lg
              border border-[var(--sidebar-border)]
              min-w-[200px]
              z-50
            `}
            >
              {AVAILABLE_COUNTRIES.map((country) => (
                <button
                  key={country.code}
                  onClick={() => {
                    onCountryChange(country.code);
                    setIsCountryOpen(false);
                  }}
                  className={`
                  w-full px-3 py-2
                  flex items-center gap-2
                  rounded-lg
                  transition-all duration-200
                  ${
                    selectedCountry === country.code
                      ? `${`button-gradient-${theme}`} text-[var(--button-text)]`
                      : "hover:bg-[var(--button-hover)] text-[var(--sidebar-text)]"
                  }
                `}
                  title={country.name}
                >
                  <span className="text-sm">{country.flag}</span>
                  <span className="text-sm font-medium">{country.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Aviation Layer Control */}
        <div className="relative" ref={aviationRef}>
          <button
            id="aviation-data-toggle"
            onClick={() => {
              setIsAviationOpen((prev) => !prev);
              setIsMapSelectorOpen(false);
              setIsThemeSelectorOpen(false);
              setIsSearchOpen(false);
            }}
            className={`${ButtonClass} ${isAviationOpen ? "opacity-75" : ""}`}
            title="Aviation Data"
          >
            <Plane size={18} className="text-[var(--button-text)]" />
          </button>

          {isAviationOpen && (
            <div
              className={`
        absolute top-12 right-0
        ${`gradient-${theme}`}
        backdrop-blur-md p-2
        rounded-xl shadow-lg
        border border-[var(--sidebar-border)]
        min-w-[200px]
        z-50
      `}
            >
              {/* Main Aviation Data Toggle */}
              <button
                onClick={() => onToggleAviationData(!showAviationData)}
                className={`
          w-full px-3 py-2
          flex items-center gap-2
          rounded-lg
          transition-all duration-200
          ${
            showAviationData
              ? `${`button-gradient-${theme}`} text-[var(--button-text)]`
              : "hover:bg-[var(--button-hover)] text-[var(--sidebar-text)]"
          }
        `}
                title="Toggle Aviation Data"
              >
                <Plane size={16} />
                <span className="text-sm font-medium">Show Aviation Data</span>
              </button>

              {/* Layer Options - Always show when dropdown is open */}
              <div className="mt-2 pt-2 border-t border-[var(--sidebar-border)]">
                <button
                  onClick={() =>
                    onLayerToggle("airports", !aviationLayers.airports)
                  }
                  className={`
            w-full px-3 py-2
            flex items-center gap-2
            rounded-lg
            transition-all duration-200
            ${
              aviationLayers.airports
                ? `${`button-gradient-${theme}`} text-[var(--button-text)]`
                : "hover:bg-[var(--button-hover)] text-[var(--sidebar-text)]"
            }
          `}
                  title="Toggle Airports"
                >
                  <Plane size={16} />
                  <span className="text-sm font-medium">Airports</span>
                </button>

                <button
                  onClick={() =>
                    onLayerToggle("navigation", !aviationLayers.navigation)
                  }
                  className={`
            w-full px-3 py-2
            flex items-center gap-2
            rounded-lg
            transition-all duration-200
            ${
              aviationLayers.navigation
                ? `${`button-gradient-${theme}`} text-[var(--button-text)]`
                : "hover:bg-[var(--button-hover)] text-[var(--sidebar-text)]"
            }
          `}
                  title="Toggle Navigation"
                >
                  <Radio size={16} />
                  <span className="text-sm font-medium">Navigation</span>
                </button>

                <button
                  onClick={() =>
                    onLayerToggle("obstacles", !aviationLayers.obstacles)
                  }
                  className={`
            w-full px-3 py-2
            flex items-center gap-2
            rounded-lg
            transition-all duration-200
            ${
              aviationLayers.obstacles
                ? `${`button-gradient-${theme}`} text-[var(--button-text)]`
                : "hover:bg-[var(--button-hover)] text-[var(--sidebar-text)]"
            }
          `}
                  title="Toggle Obstacles"
                >
                  <AlertTriangle size={16} />
                  <span className="text-sm font-medium">Obstacles</span>
                </button>

                <button
                  onClick={() =>
                    onLayerToggle("hotspots", !aviationLayers.hotspots)
                  }
                  className={`
            w-full px-3 py-2
            flex items-center gap-2
            rounded-lg
            transition-all duration-200
            ${
              aviationLayers.hotspots
                ? `${`button-gradient-${theme}`} text-[var(--button-text)]`
                : "hover:bg-[var(--button-text)]"
            }
          `}
                  title="Toggle Hotspots"
                >
                  <Flame size={16} />
                  <span className="text-sm font-medium">Hotspots</span>
                </button>
                <button
                  onClick={() =>
                    onLayerToggle(
                      "reportingpoints",
                      !aviationLayers.reportingpoints
                    )
                  }
                  className={`
    w-full px-3 py-2
    flex items-center gap-2
    rounded-lg
    transition-all duration-200
    ${
      aviationLayers.reportingpoints
        ? `${`button-gradient-${theme}`} text-[var(--button-text)]`
        : "hover:bg-[var(--button-hover)] text-[var(--sidebar-text)]"
    }
  `}
                  title="Toggle Reporting Points"
                >
                  <MapPin size={16} />
                  Reporting Points
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Delete Last Waypoint Button */}
        <button
          id="delete-last-waypoint"
          className={ButtonClass}
          onClick={onDeleteLastWaypoint}
          title="Delete Last Waypoint"
        >
          <Trash2 size={18} className="text-[var(--button-text)]" />
        </button>

        <button
          id="clear-waypoints"
          className={ButtonClass}
          onClick={onClearWaypoints}
          title="Clear All Waypoints"
        >
          <XCircle size={18} className="text-[var(--button-text)]" />
        </button>
        <div className="grid grid-cols-2 gap-3 justify-end">
          <div></div>
          {/* Clear All Waypoint Button */}
        </div>

        {/* Route Manager Dropdown */}
        <div className="relative" ref={routeManagerRef}>
          <button
            id="route-manager"
            className={`${ButtonClass} ${
              isRouteManagerOpen ? "opacity-75" : ""
            }`}
            title="Manage saved routes"
            onClick={() => {
              setIsRouteManagerOpen((b) => !b);
              // Close others as needed...
              setIsThemeSelectorOpen(false);
              setIsMapSelectorOpen(false);
              setIsSearchOpen(false);
              setIsAviationOpen(false);
            }}
          >
            <Save size={18} className="text-[var(--button-text)]" />
          </button>
          {isRouteManagerOpen && (
            <div
              className={`
        absolute top-12 right-0
        ${`gradient-${theme}`}
        backdrop-blur-md p-4
        rounded-xl shadow-lg
        border border-[var(--sidebar-border)]
        min-w-[320px]
        max-w-[350px]
        z-50
      `}
              style={{ width: 340 }}
            >
              <div className="font-bold text-lg mb-3">Saved Routes</div>
              <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
                {listSavedRoutes().length === 0 && (
                  <div className="text-gray-400 italic px-3 py-2">
                    No routes saved yet.
                  </div>
                )}
                {listSavedRoutes()
                  .sort(
                    (a, b) =>
                      new Date(b.lastModified).getTime() -
                      new Date(a.lastModified).getTime()
                  )
                  .map((route) => (
                    <div
                      key={route.id}
                      className={`
        group relative flex items-center justify-between px-1 py-2 rounded
        transition-all duration-200
        hover:${`button-gradient-${theme}`}
        cursor-pointer
      `}
                    >
                      {renameId === route.id ? (
                        <>
                          <input
                            value={renameValue}
                            onChange={(e) => setRenameValue(e.target.value)}
                            className="rounded px-2 py-1 text-sm border w-32"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                renameRoute(route.id, renameValue.trim());
                                setRenameId(null);
                              }
                              if (e.key === "Escape") setRenameId(null);
                            }}
                          />
                          <button
                            onClick={() => {
                              renameRoute(route.id, renameValue.trim());
                              setRenameId(null);
                            }}
                            className="ml-2 text-green-600"
                            title="Confirm"
                          >
                            <Check size={16} />
                          </button>
                          <button
                            onClick={() => setRenameId(null)}
                            className="ml-1 text-gray-400"
                            title="Cancel"
                          >
                            <X size={16} />
                          </button>
                        </>
                      ) : (
                        <>
                          <span
                            className="font-medium overflow-hidden text-ellipsis whitespace-nowrap max-w-[115px]"
                            title={route.name}
                          >
                            {route.name}
                          </span>
                          <span className="text-xs text-gray-400 ml-2">
                            {new Date(route.lastModified).toLocaleString()}
                          </span>
                          <div className="flex ml-2 gap-1 items-center justify-end">
                            <button
                              onClick={() => {
                                loadRoute(route.id);
                                setIsRouteManagerOpen(false);
                              }}
                              title="Load"
                              className={`
                p-1 relative
                transition-transform duration-150
                transform
                group-hover:scale-110
              `}
                              style={{ transitionProperty: "color, transform" }}
                            >
                              <FolderOpen
                                size={16}
                                className={`
                  transition-colors duration-200
                  text-blue-600
                  group-hover:text-white
                `}
                              />
                            </button>
                            <button
                              onClick={() => {
                                setRenameId(route.id);
                                setRenameValue(route.name);
                              }}
                              title="Rename"
                              className="p-1 transition-transform duration-150 transform group-hover:scale-110"
                            >
                              <Edit size={15} className="text-yellow-700" />
                            </button>
                            <button
                              onClick={() => {
                                if (
                                  window.confirm(
                                    "Overwrite this route with your current waypoints?"
                                  )
                                )
                                  overwriteRoute(route.id);
                              }}
                              title="Overwrite"
                              className="p-1 transition-transform duration-150 transform group-hover:scale-110"
                            >
                              <Save size={15} className="text-orange-700" />
                            </button>
                            <button
                              onClick={() => {
                                if (window.confirm("Delete this route?"))
                                  deleteRoute(route.id);
                              }}
                              title="Delete"
                              className="p-1 transition-transform duration-150 transform group-hover:scale-110"
                            >
                              <Trash size={15} className="text-red-600" />
                            </button>
                            <button
                              onClick={() => handleCopyLink(route)}
                              title="Copy Share Link"
                              className="p-1 transition-transform duration-150 transform group-hover:scale-110"
                            >
                              <Share2
                                size={15}
                                className="text-teal-600 hover:text-teal-400"
                              />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
              </div>
              <div className="mt-4">
                <div className="mb-2 font-medium">
                  Save current route as new:
                </div>
                <div className="flex gap-2">
                  <input
                    value={saveName}
                    onChange={(e) => setSaveName(e.target.value)}
                    placeholder="Route name"
                    className="px-2 py-1 rounded border flex-1 text-sm"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && saveName.trim()) {
                        saveNewRoute(saveName.trim());
                        setSaveName("");
                      }
                    }}
                  />
                  <button
                    disabled={!saveName.trim() || !waypoints.length}
                    onClick={() => {
                      saveNewRoute(saveName.trim());
                      setSaveName("");
                    }}
                    className="bg-blue-600 text-white rounded px-3 py-1 text-sm disabled:opacity-40"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MapControls;

import React, { useState, useEffect, useRef } from "react";
import { MapControlsProps, Waypoint } from "../../../utils/types";
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

interface ExtendedMapControlProps extends MapControlsProps {
  showAviationData?: boolean;
  onToggleAviationData?: (enabled: boolean) => void;
  aviationLayers?: {
    airports: boolean;
    airspaces: boolean;
    navigation: boolean;
    obstacles: boolean;
    hotspots: boolean;
    reportingpoints: boolean;
  };
  onLayerToggle?: (layer: AviationLayerKey, enabled: boolean) => void;
  selectedCountry?: string;
  onCountryChange?: (country: string) => void;
  listSavedRoutes: () => SavedRoute[];
  saveNewRoute: (name: string) => void;
  overwriteRoute: (id: string, name?: string) => void;
  loadRoute: (id: string) => void;
  deleteRoute: (id: string) => void;
  renameRoute: (id: string, name: string) => void;
  waypoints: Waypoint[];
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
    reportingpoints: true,
  },
  onLayerToggle,
  selectedCountry = "es",
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
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [saveName, setSaveName] = useState("");
  const [renameId, setRenameId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");

  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        // Don't close if clicking on the menu button
        const menuButton = document.querySelector("[data-menu-button]");
        if (menuButton && !menuButton.contains(event.target as Node)) {
          setIsOpen(false);
        }
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

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
        data-menu-button
        id = "map-menu-button"
        onClick={() => setIsOpen(!isOpen)}
        className={`
          fixed top-4 left-4 z-[1001]
          w-16 h-16 rounded-xl
          ${`button-gradient-${theme}`}
          text-[var(--button-text)]
          hover:opacity-90 hover:scale-105
          active:scale-95
          transition-all duration-200
          flex items-center justify-center
          shadow-2xl
          border-2 border-white/20
          ${isOpen ? "opacity-75 scale-95" : ""}
        `}
      >
        <Menu size={32} strokeWidth={3} />
      </button>

      {isOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-transparent bg-blur bg-opacity-50 z-[999]"
            onClick={() => setIsOpen(false)}
          />
          <div
            ref={dropdownRef}
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 sm:w-80 max-w-[90vw] max-h-[80vh] bg-[var(--sidebar-bg)] border border-[var(--sidebar-border)] rounded-xl z-[1000] flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b rounded-lg border-[var(--sidebar-border)] bg-[var(--sidebar-bg)]">
              <h3 className="text-lg font-semibold text-[var(--sidebar-text)]">
                Map Controls
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-xl hover:bg-[var(--button-hover)] transition-all duration-200 hover:scale-110 active:scale-95"
              >
                <XCircle size={26} strokeWidth={2.5} className="text-[var(--sidebar-text)]" />
              </button>
            </div>
            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <div className="p-4 space-y-6">
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
                              {result.display_name
                                .split(",")
                                .slice(1)
                                .join(",")
                                .trim()}
                            </div>
                            <div className="text-xs text-[var(--sidebar-text-muted)]">
                              {result.lat}, {result.lon}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Status messages - Fixed to match desktop */}
                    {!isSearching &&
                      searchResults.length === 0 &&
                      !searchError &&
                      searchQuery.length >= 2 && (
                        <div className="p-2 text-[var(--sidebar-text-muted)] text-sm">
                          No locations found
                        </div>
                      )}

                    {!isSearching &&
                      searchResults.length === 0 &&
                      !searchError &&
                      searchQuery.length < 2 &&
                      searchQuery.length > 0 && (
                        <div className="p-2 text-[var(--sidebar-text-muted)] text-sm">
                          Type at least 2 characters to search
                        </div>
                      )}

                    {!isSearching &&
                      searchResults.length === 0 &&
                      !searchError &&
                      searchQuery.length === 0 && (
                        <div className="p-2 text-[var(--sidebar-text-muted)] text-sm">
                          Start typing to search for locations
                        </div>
                      )}
                  </div>
                </div>

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
                        onClick={() =>
                          onLayerToggle("airports", !aviationLayers.airports)
                        }
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
                        onClick={() =>
                          onLayerToggle(
                            "navigation",
                            !aviationLayers.navigation
                          )
                        }
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
                        onClick={() =>
                          onLayerToggle("obstacles", !aviationLayers.obstacles)
                        }
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
                        onClick={() =>
                          onLayerToggle("hotspots", !aviationLayers.hotspots)
                        }
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
                      <button
                        onClick={() =>
                          onLayerToggle(
                            "reportingpoints",
                            !aviationLayers.reportingpoints
                          )
                        }
                        className={`
                    px-3 py-2 rounded-lg text-sm
                    flex items-center gap-2
                    transition-all duration-200
                    ${
                      aviationLayers.reportingpoints
                        ? `${`button-gradient-${theme}`} text-[var(--button-text)]`
                        : "hover:bg-[var(--button-hover)] text-[var(--sidebar-text)]"
                    }
                  `}
                      >
                        <MapPin size={14} />
                        <span className="truncate">Reporting Points</span>
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

                {/* Saved Routes Section */}
                <div>
                  <h3 className="text-sm font-medium mb-2 text-[var(--sidebar-text)]">
                    Saved Routes
                  </h3>
                  <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar rounded">
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
                          {/* Rename logic */}
                          {renameId === route.id ? (
                            <div className="flex items-center w-full gap-2">
                              <input
                                value={renameValue}
                                onChange={(e) => setRenameValue(e.target.value)}
                                className="rounded px-2 py-1 text-sm border flex-1"
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
                                className="text-green-600"
                                title="Save"
                                onClick={() => {
                                  renameRoute(route.id, renameValue.trim());
                                  setRenameId(null);
                                }}
                              >
                                <Check size={16} />
                              </button>
                              <button
                                className="text-gray-400"
                                title="Cancel"
                                onClick={() => setRenameId(null)}
                              >
                                <X size={16} />
                              </button>
                            </div>
                          ) : (
                            <>
                              <div className="min-w-0 flex-1">
                                <span
                                  className="font-medium truncate block"
                                  title={route.name}
                                >
                                  {route.name}
                                </span>
                                <span className="text-xs text-gray-400 ml-1">
                                  {new Date(
                                    route.lastModified
                                  ).toLocaleString()}
                                </span>
                              </div>
                              <div className="flex gap-1 ml-2 items-center justify-end">
                                <button
                                  onClick={() => loadRoute(route.id)}
                                  title="Load"
                                  className={`
                    p-1 relative
                    transition-transform duration-150
                    transform
                    group-hover:scale-110
                  `}
                                  style={{
                                    transitionProperty: "color, transform",
                                  }}
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
                                  className={`
                    p-1 transition-transform duration-150 transform group-hover:scale-110
                  `}
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
                                  className={`
                    p-1 transition-transform duration-150 transform group-hover:scale-110
                  `}
                                >
                                  <Save size={15} className="text-orange-700" />
                                </button>
                                <button
                                  onClick={() => {
                                    if (window.confirm("Delete this route?"))
                                      deleteRoute(route.id);
                                  }}
                                  title="Delete"
                                  className={`
                    p-1 transition-transform duration-150 transform group-hover:scale-110
                  `}
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

                  {/* Save as new route */}
                  <div className="mt-5">
                    <div className="mb-2 font-medium">
                      Save current route as new:
                    </div>
                    <div className="flex gap-2">
                      <input
                        value={saveName}
                        onChange={(e) => setSaveName(e.target.value)}
                        placeholder="Route name"
                        className="flex-1 px-2 py-1 rounded border text-sm"
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
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default MapControls;

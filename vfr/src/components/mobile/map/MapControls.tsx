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
  const [activeTab, setActiveTab] = useState<"waypoints" | "search" | "map" | "aviation" | "routes">("waypoints");
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
    <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
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
            {/* Tab Navigation */}
            <div className="flex gap-1 p-2 border-b border-[var(--sidebar-border)] overflow-x-auto custom-scrollbar">
              <button
                onClick={() => setActiveTab("waypoints")}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 flex items-center gap-2 ${
                  activeTab === "waypoints"
                    ? `${`button-gradient-${theme}`} text-[var(--button-text)]`
                    : "text-[var(--sidebar-text)] hover:bg-[var(--button-hover)]"
                }`}
              >
                <Trash2 size={16} />
                Waypoints
              </button>
              <button
                onClick={() => setActiveTab("search")}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 flex items-center gap-2 ${
                  activeTab === "search"
                    ? `${`button-gradient-${theme}`} text-[var(--button-text)]`
                    : "text-[var(--sidebar-text)] hover:bg-[var(--button-hover)]"
                }`}
              >
                <MapPin size={16} />
                Search
              </button>
              <button
                onClick={() => setActiveTab("routes")}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 flex items-center gap-2 ${
                  activeTab === "routes"
                    ? `${`button-gradient-${theme}`} text-[var(--button-text)]`
                    : "text-[var(--sidebar-text)] hover:bg-[var(--button-hover)]"
                }`}
              >
                <Save size={16} />
                Routes
              </button>
              <button
                onClick={() => setActiveTab("map")}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 flex items-center gap-2 ${
                  activeTab === "map"
                    ? `${`button-gradient-${theme}`} text-[var(--button-text)]`
                    : "text-[var(--sidebar-text)] hover:bg-[var(--button-hover)]"
                }`}
              >
                <Map size={16} />
                Map
              </button>
              <button
                onClick={() => setActiveTab("aviation")}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 flex items-center gap-2 ${
                  activeTab === "aviation"
                    ? `${`button-gradient-${theme}`} text-[var(--button-text)]`
                    : "text-[var(--sidebar-text)] hover:bg-[var(--button-hover)]"
                }`}
              >
                <Plane size={16} />
                Aviation
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <div className="p-4 space-y-4">

                {/* Waypoints Tab */}
                {activeTab === "waypoints" && (
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-[var(--sidebar-text)] mb-4">Manage Waypoints</h3>
                    <button
                      onClick={() => {
                        onDeleteLastWaypoint();
                        setIsOpen(false);
                      }}
                      className="w-full px-4 py-4 flex items-center gap-3 rounded-xl bg-orange-600/20 border border-orange-600 text-orange-200 hover:bg-orange-600/30 transition-all duration-200"
                    >
                      <XCircle size={24} />
                      <div className="text-left">
                        <div className="font-semibold text-base">Delete Last Waypoint</div>
                        <div className="text-sm font-medium opacity-90">Remove the most recent point</div>
                      </div>
                    </button>
                    <button
                      onClick={() => {
                        onClearWaypoints();
                        setIsOpen(false);
                      }}
                      className="w-full px-4 py-4 flex items-center gap-3 rounded-xl bg-red-600/20 border border-red-600 text-red-200 hover:bg-red-600/30 transition-all duration-200"
                    >
                      <Trash2 size={24} />
                      <div className="text-left">
                        <div className="font-semibold text-base">Clear All Waypoints</div>
                        <div className="text-sm font-medium opacity-90">Remove all points from the map</div>
                      </div>
                    </button>
                  </div>
                )}

                {/* Search Tab */}
                {activeTab === "search" && (
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
                  <div className="max-h-40 overflow-y-auto custom-scrollbar">
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
                )}

                {/* Routes Tab */}
                {activeTab === "routes" && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-[var(--sidebar-text)] mb-4">Saved Routes</h3>
                    <div className="space-y-2 max-h-[50vh] overflow-y-auto custom-scrollbar">
                      {listSavedRoutes().length === 0 && (
                        <div className="text-center text-[var(--sidebar-text-muted)] italic py-8">
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
                            className="group relative flex items-center justify-between px-3 py-3 rounded-lg bg-[var(--sidebar-bg)] border border-[var(--sidebar-border)] hover:border-[var(--button-bg)] transition-all duration-200"
                          >
                            {renameId === route.id ? (
                              <div className="flex items-center w-full gap-2">
                                <input
                                  value={renameValue}
                                  onChange={(e) => setRenameValue(e.target.value)}
                                  className="rounded px-2 py-1 text-sm border flex-1 bg-[var(--input-bg)] text-[var(--sidebar-text)]"
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
                                  className="text-green-600 p-1"
                                  title="Save"
                                  onClick={() => {
                                    renameRoute(route.id, renameValue.trim());
                                    setRenameId(null);
                                  }}
                                >
                                  <Check size={18} />
                                </button>
                                <button
                                  className="text-gray-400 p-1"
                                  title="Cancel"
                                  onClick={() => setRenameId(null)}
                                >
                                  <X size={18} />
                                </button>
                              </div>
                            ) : (
                              <>
                                <div className="min-w-0 flex-1">
                                  <span
                                    className="font-medium truncate block text-[var(--sidebar-text)]"
                                    title={route.name}
                                  >
                                    {route.name}
                                  </span>
                                  <span className="text-xs text-[var(--sidebar-text-muted)]">
                                    {new Date(route.lastModified).toLocaleString()}
                                  </span>
                                </div>
                                <div className="flex gap-1 ml-2">
                                  <button
                                    onClick={() => loadRoute(route.id)}
                                    title="Load"
                                    className="p-2 hover:bg-blue-600/20 rounded-lg transition-all"
                                  >
                                    <FolderOpen size={18} className="text-blue-500" />
                                  </button>
                                  <button
                                    onClick={() => handleCopyLink(route)}
                                    title="Share"
                                    className="p-2 hover:bg-teal-600/20 rounded-lg transition-all"
                                  >
                                    <Share2 size={18} className="text-teal-500" />
                                  </button>
                                  <button
                                    onClick={() => {
                                      if (window.confirm("Delete this route?"))
                                        deleteRoute(route.id);
                                    }}
                                    title="Delete"
                                    className="p-2 hover:bg-red-600/20 rounded-lg transition-all"
                                  >
                                    <Trash size={18} className="text-red-500" />
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        ))}
                    </div>

                    <div className="mt-4 pt-4 border-t border-[var(--sidebar-border)]">
                      <h4 className="text-sm font-medium mb-2 text-[var(--sidebar-text)]">
                        Save Current Route
                      </h4>
                      <div className="flex gap-2">
                        <input
                          value={saveName}
                          onChange={(e) => setSaveName(e.target.value)}
                          placeholder="Enter route name..."
                          className="flex-1 px-3 py-2 rounded-lg text-sm bg-[var(--input-bg)] border border-[var(--sidebar-border)] text-[var(--sidebar-text)]"
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
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                            !saveName.trim() || !waypoints.length
                              ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                              : `${`button-gradient-${theme}`} text-[var(--button-text)] hover:opacity-90`
                          }`}
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Map Tab */}
                {activeTab === "map" && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-[var(--sidebar-text)] mb-4">Map Settings</h3>
                    <div>
                      <h4 className="text-sm font-medium mb-2 text-[var(--sidebar-text)]">
                        Map Type
                      </h4>
                      <div className="grid grid-cols-2 gap-2">
                        {MAP_TYPES.map(({ value, label, icon: Icon }) => (
                          <button
                            key={value}
                            onClick={() => {
                              setMapType(value);
                            }}
                            className={`
                              px-4 py-3 rounded-xl text-sm font-medium
                              flex items-center gap-3
                              transition-all duration-200
                              ${
                                mapType === value
                                  ? `${`button-gradient-${theme}`} text-[var(--button-text)] border-2 border-white/20`
                                  : "bg-[var(--sidebar-bg)] text-[var(--sidebar-text)] border border-[var(--sidebar-border)] hover:border-[var(--button-bg)]"
                              }
                            `}
                          >
                            <Icon size={20} />
                            <span>{label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {onCountryChange && (
                      <div>
                        <h4 className="text-sm font-medium mb-2 text-[var(--sidebar-text)]">
                          Country
                        </h4>
                        <div className="grid grid-cols-2 gap-2 max-h-[40vh] overflow-y-auto custom-scrollbar">
                          {AVAILABLE_COUNTRIES.map((country) => (
                            <button
                              key={country.code}
                              onClick={() => onCountryChange(country.code)}
                              className={`
                                px-3 py-2 rounded-lg text-sm
                                flex items-center gap-2
                                transition-all duration-200
                                ${
                                  selectedCountry === country.code
                                    ? `${`button-gradient-${theme}`} text-[var(--button-text)]`
                                    : "bg-[var(--sidebar-bg)] text-[var(--sidebar-text)] border border-[var(--sidebar-border)] hover:border-[var(--button-bg)]"
                                }
                              `}
                            >
                              <span>{country.flag}</span>
                              <span className="truncate">{country.name}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Aviation Tab */}
                {activeTab === "aviation" && onToggleAviationData && onLayerToggle && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-[var(--sidebar-text)] mb-4">Aviation Data</h3>

                    <button
                      onClick={() => onToggleAviationData(!showAviationData)}
                      className={`
                        w-full px-4 py-4 rounded-xl text-base font-semibold
                        flex items-center justify-center gap-3
                        transition-all duration-200
                        ${
                          showAviationData
                            ? `${`button-gradient-${theme}`} text-[var(--button-text)] border-2 border-white/20`
                            : "bg-[var(--sidebar-bg)] text-[var(--sidebar-text)] border-2 border-[var(--sidebar-border)] hover:border-[var(--button-bg)]"
                        }
                      `}
                    >
                      <Plane size={24} />
                      {showAviationData ? "Hide Aviation Data" : "Show Aviation Data"}
                    </button>

                    {showAviationData && (
                      <>
                        <h4 className="text-sm font-medium text-[var(--sidebar-text)] mt-4">Aviation Layers</h4>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => onLayerToggle("airports", !aviationLayers.airports)}
                            className={`
                              px-3 py-3 rounded-lg text-sm
                              flex items-center gap-2
                              transition-all duration-200
                              ${
                                aviationLayers.airports
                                  ? `${`button-gradient-${theme}`} text-[var(--button-text)]`
                                  : "bg-[var(--sidebar-bg)] text-[var(--sidebar-text)] border border-[var(--sidebar-border)] hover:border-[var(--button-bg)]"
                              }
                            `}
                          >
                            <Plane size={16} />
                            <span>Airports</span>
                          </button>

                          <button
                            onClick={() => onLayerToggle("navigation", !aviationLayers.navigation)}
                            className={`
                              px-3 py-3 rounded-lg text-sm
                              flex items-center gap-2
                              transition-all duration-200
                              ${
                                aviationLayers.navigation
                                  ? `${`button-gradient-${theme}`} text-[var(--button-text)]`
                                  : "bg-[var(--sidebar-bg)] text-[var(--sidebar-text)] border border-[var(--sidebar-border)] hover:border-[var(--button-bg)]"
                              }
                            `}
                          >
                            <Radio size={16} />
                            <span>Navigation</span>
                          </button>

                          <button
                            onClick={() => onLayerToggle("obstacles", !aviationLayers.obstacles)}
                            className={`
                              px-3 py-3 rounded-lg text-sm
                              flex items-center gap-2
                              transition-all duration-200
                              ${
                                aviationLayers.obstacles
                                  ? `${`button-gradient-${theme}`} text-[var(--button-text)]`
                                  : "bg-[var(--sidebar-bg)] text-[var(--sidebar-text)] border border-[var(--sidebar-border)] hover:border-[var(--button-bg)]"
                              }
                            `}
                          >
                            <AlertTriangle size={16} />
                            <span>Obstacles</span>
                          </button>

                          <button
                            onClick={() => onLayerToggle("hotspots", !aviationLayers.hotspots)}
                            className={`
                              px-3 py-3 rounded-lg text-sm
                              flex items-center gap-2
                              transition-all duration-200
                              ${
                                aviationLayers.hotspots
                                  ? `${`button-gradient-${theme}`} text-[var(--button-text)]`
                                  : "bg-[var(--sidebar-bg)] text-[var(--sidebar-text)] border border-[var(--sidebar-border)] hover:border-[var(--button-bg)]"
                              }
                            `}
                          >
                            <Flame size={16} />
                            <span>Hotspots</span>
                          </button>

                          <button
                            onClick={() => onLayerToggle("reportingpoints", !aviationLayers.reportingpoints)}
                            className={`
                              px-3 py-3 rounded-lg text-sm
                              flex items-center gap-2
                              transition-all duration-200 col-span-2
                              ${
                                aviationLayers.reportingpoints
                                  ? `${`button-gradient-${theme}`} text-[var(--button-text)]`
                                  : "bg-[var(--sidebar-bg)] text-[var(--sidebar-text)] border border-[var(--sidebar-border)] hover:border-[var(--button-bg)]"
                              }
                            `}
                          >
                            <MapPin size={16} />
                            <span>Reporting Points</span>
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default MapControls;

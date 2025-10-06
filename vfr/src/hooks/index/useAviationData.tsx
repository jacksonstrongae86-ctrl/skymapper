// hooks/index/useAviationData.tsx
import { useState, useEffect } from "react";
import {
  Airport,
  Airspace,
  NavigationPoint,
  Obstacle,
  Hotspot,
  ReportingPoint,
} from "../../utils/types";
import { validateAirspacesLimits } from "../../utils/altitudeCompliance";

export interface AviationDataState {
  airports: Airport[];
  airspaces: Airspace[];
  navigation: NavigationPoint[];
  obstacles: Obstacle[];
  hotspots: Hotspot[];
  reportingpoints: ReportingPoint[];
  loading: boolean;
  error: string | null;
  lastUpdated: string | null;
  country: string;
}

// hooks/index/useAviationData.tsx
export const useAviationData = (country: string = "es") => {
  const [state, setState] = useState<AviationDataState>({
    airports: [],
    airspaces: [],
    navigation: [],
    obstacles: [],
    hotspots: [],
    reportingpoints: [],
    loading: false,
    error: null,
    lastUpdated: null,
    country,
  });

  const loadAviationData = async (selectedCountry: string) => {
    setState((prev) => ({
      ...prev,
      loading: true,
      error: null,
      country: selectedCountry,
    }));

    try {
      const dataTypes = ["apt", "asp", "nav", "obs", "rpp"];

      const promises = dataTypes.map((type) =>
        // Use your API instead of direct file access
        fetch(`/api/aviation-data?country=${selectedCountry}&type=${type}`)
          .then((res) => {
            if (!res.ok) {
              // throw new Error(`Failed to load ${selectedCountry}_${type}`);
            }
            return res.json();
          })
          .then((apiResponse) => {
            // Your API should return the data in the expected format
            return {
              data: { items: apiResponse.data?.items || [] },
              lastUpdated: apiResponse.lastUpdated,
            };
          })
          .catch(() => {
            // console.warn(`Failed to load ${selectedCountry}_${type}:`, err);
            return null;
          })
      );

      const [
        airportData,
        airspaceData,
        navigationData,
        obstacleData,
        hotspotData,
        reportingpointData,
      ] = await Promise.all(promises);

      // Validate airspace limits before storing them
      const rawAirspaces = airspaceData?.data?.items || [];
      const validatedAirspaces = validateAirspacesLimits(rawAirspaces);

      setState((prev) => ({
        ...prev,
        airports: airportData?.data?.items || [],
        airspaces: validatedAirspaces,
        navigation: navigationData?.data?.items || [],
        obstacles: obstacleData?.data?.items || [],
        hotspots: hotspotData?.data?.items || [],
        reportingpoints: reportingpointData?.data?.items || [],
        lastUpdated: airportData?.lastUpdated || new Date().toISOString(),
        loading: false,
      }));

      // console.log("Aviation data loaded successfully:", {
      //   airports: airportData?.data?.items?.length || 0,
      //   airspaces: airspaceData?.data?.items?.length || 0,
      //   navigation: navigationData?.data?.items?.length || 0,
      //   obstacles: obstacleData?.data?.items?.length || 0,
      //   hotspots: hotspotData?.data?.items?.length || 0,
      // });
    } catch (error) {
      console.error("Aviation data loading error:", error);
      setState((prev) => ({
        ...prev,
        loading: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to load aviation data",
      }));
    }
  };

  useEffect(() => {
    loadAviationData(country);
  }, [country]);

  return {
    ...state,
    reload: (newCountry?: string) => loadAviationData(newCountry || country),
  };
};

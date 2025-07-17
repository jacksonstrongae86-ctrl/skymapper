// hooks/index/useAviationData.tsx
import { useState, useEffect } from "react";
import {
  Airport,
  Airspace,
  NavigationPoint,
  Obstacle,
  Hotspot,
  GeoJsonFeature,
  AviationProperties
} from "../../utils/types";

export interface AviationDataState {
  airports: Airport[];
  airspaces: Airspace[];
  navigation: NavigationPoint[];
  obstacles: Obstacle[];
  hotspots: Hotspot[];
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
      const dataTypes = ["apt", "asp", "nav", "obs", "hot"];

      const promises = dataTypes.map((type) =>
        fetch(`/data/cache/openaip/${selectedCountry}_${type}.json`)
          .then((res) => {
            if (!res.ok) {
              throw new Error(`Failed to load ${selectedCountry}_${type}.json`);
            }
            return res.json();
          })
          .then((cachedData) => {
            // Extract features from GeoJSON structure
            const features = cachedData.data?.features || [];

            // Transform GeoJSON features to your expected format
          const items = features.map((feature: GeoJsonFeature<AviationProperties>) => ({
            ...feature.properties,
            geometry: feature.geometry,
          }));

            return {
              data: { items },
              lastUpdated: cachedData.lastUpdated,
            };
          })
          .catch((err) => {
            console.warn(`Failed to load ${selectedCountry}_${type}:`, err);
            return null;
          })
      );

      const [
        airportData,
        airspaceData,
        navigationData,
        obstacleData,
        hotspotData,
      ] = await Promise.all(promises);

      setState((prev) => ({
        ...prev,
        airports: airportData?.data?.items || [],
        airspaces: airspaceData?.data?.items || [],
        navigation: navigationData?.data?.items || [],
        obstacles: obstacleData?.data?.items || [],
        hotspots: hotspotData?.data?.items || [],
        lastUpdated: airportData?.lastUpdated || new Date().toISOString(),
        loading: false,
      }));

      console.log("Aviation data loaded successfully:", {
        airports: airportData?.data?.items?.length || 0,
        airspaces: airspaceData?.data?.items?.length || 0,
        navigation: navigationData?.data?.items?.length || 0,
        obstacles: obstacleData?.data?.items?.length || 0,
        hotspots: hotspotData?.data?.items?.length || 0,
      });
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

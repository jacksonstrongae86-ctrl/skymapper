// hooks/index/useAviationData.tsx
import { useState, useEffect } from 'react';
import { Airport, Airspace, NavigationPoint, Obstacle, Hotspot } from '../../utils/types';

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

export const useAviationData = (country: string = 'es') => {
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
    setState(prev => ({ ...prev, loading: true, error: null, country: selectedCountry }));

    try {
      const dataTypes = ['apt', 'asp', 'nav', 'obs', 'hot'];
      const promises = dataTypes.map(type =>
        fetch(`/data/cache/openaip/${selectedCountry}_${type}.json`)
          .then(res => {
            if (!res.ok) {
              throw new Error(`Cached file ${selectedCountry}_${type}.json not found`);
            }
            return res.json();
          })
          .catch(err => {
            console.warn(`Failed to load cached ${selectedCountry}_${type}.json:`, err);
            return null;
          })
      );

      const [airportData, airspaceData, navigationData, obstacleData, hotspotData] = await Promise.all(promises);

      const updateTimes = [airportData, airspaceData, navigationData, obstacleData, hotspotData]
        .filter(data => data?.lastUpdated)
        .map(data => data.lastUpdated);

      const lastUpdated = updateTimes.length > 0 ?
        updateTimes.reduce((latest, current) =>
          new Date(current) > new Date(latest) ? current : latest
        ) : null;

      setState(prev => ({
        ...prev,
        airports: airportData?.data?.items || [],
        airspaces: airspaceData?.data?.items || [],
        navigation: navigationData?.data?.items || [],
        obstacles: obstacleData?.data?.items || [],
        hotspots: hotspotData?.data?.items || [],
        lastUpdated,
        loading: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load aviation data',
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

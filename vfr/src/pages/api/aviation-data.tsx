// pages/api/aviation-data.tsx
import { NextApiRequest, NextApiResponse } from "next";
import path from "path";
import fs from "fs/promises";
import { AviationGeometry, AviationProperties, GeoJsonFeature, GeoJsonFeatureCollection  } from "@/src/utils/types";


interface CachedData {
  data: GeoJsonFeatureCollection<AviationProperties>; // Add the type parameter
  lastUpdated: string;
  country: string;
  dataType: string;
  version: string;
}

interface Bounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

// Updated coordinate extraction function for GeoJSON
function extractCoordinates(geometry: AviationGeometry): { lat: number; lng: number } | null {
  if (!geometry?.coordinates) return null;

  switch (geometry.type) {
    case "Point":
      const [lng, lat] = geometry.coordinates;
      return { lat, lng };
    case "Polygon":
      const polygonCoords = geometry.coordinates[0];
      if (polygonCoords.length > 0) {
        const centroid = calculatePolygonCentroid(polygonCoords);
        return centroid;
      }
      break;
    case "MultiPolygon":
      const multiPolygonCoords = geometry.coordinates[0][0];
      if (multiPolygonCoords.length > 0) {
        const centroid = calculatePolygonCentroid(multiPolygonCoords);
        return centroid;
      }
      break;
  }
  return null;
}

function calculatePolygonCentroid(ring: number[][]): { lat: number; lng: number } {
  let totalLat = 0;
  let totalLng = 0;
  const pointCount = ring.length;

  for (const [lng, lat] of ring) {
    totalLat += lat;
    totalLng += lng;
  }

  return {
    lat: totalLat / pointCount,
    lng: totalLng / pointCount,
  };
}

function filterByBounds(features: GeoJsonFeature<AviationProperties>[], bounds: Bounds): GeoJsonFeature<AviationProperties>[] {
  return features.filter((feature) => {
    const coords = extractCoordinates(feature.geometry);
    if (!coords) return false;

    const { lat, lng } = coords;
    return (
      lng >= bounds.west &&
      lng <= bounds.east &&
      lat >= bounds.south &&
      lat <= bounds.north
    );
  });
}

async function fetchAndCacheOpenAIPData(
  country: string,
  type: string,
  filepath: string
): Promise<void> {
  // Ensure cache directory exists
  const cacheDir = path.dirname(filepath);
  await fs.mkdir(cacheDir, { recursive: true });

  // Use the same URL pattern as your sync service
  const url = `https://storage.googleapis.com/29f98e10-a489-4c82-ae5e-489dbcd4912f/${country}_${type}.geojson`;

  const headers: Record<string, string> = {};

  const response = await fetch(url, { headers });

  if (!response.ok) {
    if (response.status === 404) {
      console.warn(`File not found: ${country}_${type}.geojson - may not be available for this country`);
      return;
    }
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const data: GeoJsonFeatureCollection<AviationProperties> = await response.json();

  // Create cached data structure
  const cachedData: CachedData = {
    data,
    lastUpdated: new Date().toISOString(),
    country,
    dataType: type,
    version: '1.0'
  };

  // Write to cache file
  await fs.writeFile(filepath, JSON.stringify(cachedData, null, 2));
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  const { country, type, bounds } = req.query as {
    country: string;
    type: string;
    bounds?: string;
  };

  if (!country || !type) {
    return res.status(400).json({
      error: "Missing required parameters",
      message: "Both country and type parameters are required",
    });
  }

  try {
    const filename = `${country}_${type}.json`;

    // Use different cache path based on environment
    const cachePath = process.env.NODE_ENV === 'production'
      ? '/tmp/aviation-cache'
      : path.join(process.cwd(), 'public', 'data', 'cache', 'openaip');

    const filepath = path.join(cachePath, filename);

    // Check if file exists
    let fileExists = true;
    try {
      await fs.access(filepath);
    } catch {
      fileExists = false;
    }

    // If file doesn't exist, fetch and cache it
    if (!fileExists) {
      // console.log(`Cache file not found: ${filename}. Fetching from OpenAIP...`);

      try {
        await fetchAndCacheOpenAIPData(country, type, filepath);
        // console.log(`Successfully cached ${filename}`);
      } catch (fetchError) {
        console.error(`Failed to fetch ${filename}:`, fetchError);
        return res.status(503).json({
          error: "Failed to fetch aviation data",
          message: "Unable to retrieve data from OpenAIP",
          country,
          type,
        });
      }
    }

    // Read the cached file
    const fileContent = await fs.readFile(filepath, "utf-8");
    const cachedData: CachedData = JSON.parse(fileContent);

    // Transform GeoJSON features to your expected format
    let features = cachedData.data.features || [];

    // Apply bounds filtering if provided
    if (bounds) {
      try {
        const parsedBounds = JSON.parse(bounds) as Bounds;
        features = filterByBounds(features, parsedBounds);
      } catch {
        console.warn("Invalid bounds parameter:", bounds);
      }
    }

    // Transform features to the format expected by your hook
    const items = features.map((feature: GeoJsonFeature<AviationProperties>) => ({
      ...feature.properties,
      geometry: feature.geometry,
    }));

    res.status(200).json({
      data: { items },
      lastUpdated: cachedData.lastUpdated,
      cached: true,
      itemsCount: items.length,
      freshlyFetched: !fileExists,
    });
  } catch (error) {
    console.error("Error serving cached data:", error);

    const errorMessage = error instanceof Error ? error.message : "Unknown error";

    res.status(500).json({
      error: "Failed to load aviation data",
      message: errorMessage,
      country,
      type,
    });
  }
}

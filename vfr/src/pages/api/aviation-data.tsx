import { NextApiRequest, NextApiResponse } from "next";
import path from "path";
import fs from "fs/promises";

// Base interface for common properties
interface BaseOpenAIPItem {
  id: string;
  name: string;
  type: string;
  country: string;
}

// Point geometry interface for items with single coordinates
interface PointGeometry {
  type: "Point";
  coordinates: [number, number];
}

// Polygon geometry interface for airspaces
interface PolygonGeometry {
  type: "Polygon" | "MultiPolygon";
  coordinates: number[][][] | number[][][][];
}

// Airport-specific interface (extends base + adds point geometry)
interface AirportItem extends BaseOpenAIPItem {
  geometry: PointGeometry;
  icao?: string;
  iata?: string;
  elevation?: number;
  runways?: Array<{
    designator: string;
    length: number;
    width: number;
    surface: string;
  }>;
  frequencies?: Array<{
    type: string;
    frequency: number;
    description?: string;
  }>;
}

// Airspace-specific interface (extends base + adds polygon geometry)
interface AirspaceItem extends BaseOpenAIPItem {
  geometry: PolygonGeometry;
  category: string;
  class?: string;
  floor?: string;
  ceiling?: string;
}

// Navaid-specific interface (extends base + adds point geometry)
interface NavaidItem extends BaseOpenAIPItem {
  geometry: PointGeometry;
  frequency?: number;
  range?: number;
  declination?: number;
  elevation?: number;
}

// Hotspot-specific interface (extends base + adds point geometry)
interface HotspotItem extends BaseOpenAIPItem {
  geometry: PointGeometry;
  reliability?: number;
  occurrence?: number;
  description?: string;
}

// Obstacle-specific interface (extends base + adds point geometry)
interface ObstacleItem extends BaseOpenAIPItem {
  geometry: PointGeometry;
  elevation: number;
  height?: number;
  lighting?: boolean;
  marking?: boolean;
}

// Union type for all possible OpenAIP items
type OpenAIPItem =
  | AirportItem
  | AirspaceItem
  | NavaidItem
  | HotspotItem
  | ObstacleItem;

interface OpenAIPResponse {
  items: OpenAIPItem[];
  totalCount: number;
}

interface CachedData {
  data: OpenAIPResponse;
  lastUpdated: string;
  country: string;
  dataType: string;
}

interface Bounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

// Updated coordinate extraction function
export function extractCoordinates(
  item: OpenAIPItem
): { lat: number; lng: number } | null {
  // Handle different geometry types
  if (item.geometry?.coordinates) {
    if (item.geometry.type === "Point") {
      const [lng, lat] = item.geometry.coordinates as [number, number];
      return { lat, lng };
    } else if (item.geometry.type === "Polygon") {
      // For polygons, use the centroid of the first ring
      const coordinates = item.geometry.coordinates as number[][][];
      if (coordinates.length > 0 && coordinates[0].length > 0) {
        const ring = coordinates[0];
        const centroid = calculatePolygonCentroid(ring);
        return centroid;
      }
    } else if (item.geometry.type === "MultiPolygon") {
      // For multipolygons, use the centroid of the first polygon's first ring
      const coordinates = item.geometry.coordinates as number[][][][];
      if (
        coordinates.length > 0 &&
        coordinates[0].length > 0 &&
        coordinates[0][0].length > 0
      ) {
        const ring = coordinates[0][0];
        const centroid = calculatePolygonCentroid(ring);
        return centroid;
      }
    }
  }

  return null;
}

// Helper function to calculate polygon centroid
function calculatePolygonCentroid(ring: number[][]): {
  lat: number;
  lng: number;
} {
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

function filterByBounds(
  data: OpenAIPResponse,
  bounds: Bounds
): OpenAIPResponse {
  if (!data?.items) return data;

  const filteredItems = data.items.filter((item: OpenAIPItem) => {
    const coords = extractCoordinates(item);
    if (!coords) return false;

    const { lat, lng } = coords;
    return (
      lng >= bounds.west &&
      lng <= bounds.east &&
      lat >= bounds.south &&
      lat <= bounds.north
    );
  });

  return {
    ...data,
    items: filteredItems,
    totalCount: filteredItems.length,
  };
}

async function fetchAndCacheOpenAIPData(
  country: string,
  type: string,
  filepath: string,
  bounds?: string
): Promise<void> {
  // Ensure cache directory exists
  const cacheDir = path.dirname(filepath);
  await fs.mkdir(cacheDir, { recursive: true });

  // Map your type to OpenAIP endpoint
  const endpointMap: { [key: string]: string } = {
    apt: "airports",
    asp: "airspaces",
    nav: "navaids",
    hot: "hotspots",
    obs: "obstacles",
  };

  const endpoint = endpointMap[type];
  if (!endpoint) {
    throw new Error(`Unknown data type: ${type}`);
  }

  // Build OpenAIP API URL
  const baseUrl = "https://api.core.openaip.net/api";
  const url = new URL(`${baseUrl}/${endpoint}`);

  // Add country filter
  url.searchParams.append("country", country.toUpperCase());

  // Add bounds if provided
  if (bounds) {
    const parsedBounds = JSON.parse(bounds) as Bounds;
    url.searchParams.append(
      "bbox",
      `${parsedBounds.west},${parsedBounds.south},${parsedBounds.east},${parsedBounds.north}`
    );
  }

  // Add pagination parameters
  url.searchParams.append("limit", "1000");
  url.searchParams.append("offset", "0");

  const headers: Record<string, string> = {
    Accept: "application/json",
    "Content-Type": "application/json",
  };

  // Add API key if available
  if (process.env.OPENAIP_API_KEY) {
    headers["x-openaip-api-key"] = process.env.OPENAIP_API_KEY;
  }

  const response = await fetch(url.toString(), { headers });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const data: OpenAIPResponse = await response.json();

  // Create cached data structure
  const cachedData: CachedData = {
    data,
    lastUpdated: new Date().toISOString(),
    country,
    dataType: type,
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

  // Validate required parameters
  if (!country || !type) {
    return res.status(400).json({
      error: "Missing required parameters",
      message: "Both country and type parameters are required",
    });
  }

  try {
    const filename = `${country}_${type}.json`;
    const filepath = path.join(process.cwd(), "/public/data/cache/openaip", filename);

    // Check if file exists
    let fileExists = true;
    try {
      await fs.access(filepath);
    } catch {
      fileExists = false;
    }

    // If file doesn't exist, fetch and cache it
    if (!fileExists) {
      console.log(
        `Cache file not found: ${filename}. Fetching from OpenAIP API...`
      );

      try {
        await fetchAndCacheOpenAIPData(country, type, filepath, bounds);
        console.log(`Successfully cached ${filename}`);
      } catch (fetchError) {
        console.error(`Failed to fetch ${filename}:`, fetchError);
        return res.status(503).json({
          error: "Failed to fetch aviation data",
          message: "Unable to retrieve data from OpenAIP API",
          country,
          type,
        });
      }
    }

    // Read the cached file
    const fileContent = await fs.readFile(filepath, "utf-8");
    const cachedData: CachedData = JSON.parse(fileContent);

    // Apply bounds filtering if provided
    let filteredData = cachedData.data;
    if (bounds) {
      try {
        const parsedBounds = JSON.parse(bounds) as Bounds;
        filteredData = filterByBounds(cachedData.data, parsedBounds);
      } catch {
        console.warn("Invalid bounds parameter:", bounds);
      }
    }

    res.status(200).json({
      data: filteredData,
      lastUpdated: cachedData.lastUpdated,
      cached: true,
      itemsCount: filteredData.items?.length || 0,
      freshlyFetched: !fileExists,
    });
  } catch (error) {
    console.error("Error serving cached data:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    res.status(500).json({
      error: "Failed to load aviation data",
      message: errorMessage,
      country,
      type,
    });
  }
}

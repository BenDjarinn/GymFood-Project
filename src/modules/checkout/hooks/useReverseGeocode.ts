import { useState, useCallback, useRef } from "react";

// ── Types ──────────────────────────────────────────────────
export interface ReverseGeocodeResult {
  /** Human-readable address string */
  address: string;
  /** Whether an API call is currently in-flight */
  loading: boolean;
  /** Error message when the API call fails */
  error: string | null;
}

export interface UseReverseGeocodeReturn extends ReverseGeocodeResult {
  /** Call this with lat/lng to trigger a reverse-geocode lookup */
  lookup: (latitude: number, longitude: number) => void;
}

// Nominatim response shape (only the fields we care about)
interface NominatimResponse {
  display_name?: string;
  address?: {
    road?: string;
    suburb?: string;
    city?: string;
    state?: string;
    country?: string;
    postcode?: string;
    village?: string;
    town?: string;
    county?: string;
    neighbourhood?: string;
  };
  error?: string;
}

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/reverse";

/**
 * Builds a compact, human-readable address from Nominatim address parts.
 * Falls back to `display_name` when parts are insufficient.
 */
function buildAddress(data: NominatimResponse): string {
  const a = data.address;
  if (!a) return data.display_name ?? "Unknown location";

  const parts: string[] = [];

  // Street / neighbourhood
  if (a.road) parts.push(a.road);
  else if (a.neighbourhood) parts.push(a.neighbourhood);

  // Sub-district / suburb
  if (a.suburb) parts.push(a.suburb);
  else if (a.village) parts.push(a.village);

  // City / town / county
  if (a.city) parts.push(a.city);
  else if (a.town) parts.push(a.town);
  else if (a.county) parts.push(a.county);

  // State
  if (a.state) parts.push(a.state);

  if (parts.length === 0) return data.display_name ?? "Unknown location";
  return parts.join(", ");
}

/**
 * Hook that performs reverse geocoding via OpenStreetMap Nominatim.
 *
 * Call `lookup(lat, lng)` only when the user finishes dragging the map
 * (i.e. inside `onRegionChangeComplete`). The hook de-duplicates rapid
 * sequential calls automatically.
 */
export function useReverseGeocode(): UseReverseGeocodeReturn {
  const [address, setAddress] = useState<string>("Drag the map to pick a location");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Abort controller ref so we can cancel stale requests
  const abortRef = useRef<AbortController | null>(null);

  const lookup = useCallback(async (latitude: number, longitude: number) => {
    // Cancel any in-flight request
    if (abortRef.current) {
      abortRef.current.abort();
    }

    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);

    try {
      const url =
        `${NOMINATIM_URL}?lat=${latitude}&lon=${longitude}` +
        `&format=json&addressdetails=1&zoom=18`;

      const response = await fetch(url, {
        headers: {
          "Accept-Language": "en",
          "User-Agent": "GymFood-App/1.0",
        },
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data: NominatimResponse = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setAddress(buildAddress(data));
    } catch (err: unknown) {
      // Don't treat aborted requests as errors
      if (err instanceof Error && err.name === "AbortError") return;

      setError("Could not determine address. Try adjusting the map.");
      setAddress("Could not determine address. Try adjusting the map.");
    } finally {
      // Only clear loading if this controller is still current
      if (abortRef.current === controller) {
        setLoading(false);
      }
    }
  }, []);

  return { address, loading, error, lookup };
}

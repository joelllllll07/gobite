// Server-side helpers for Google Maps Platform via the Lovable connector gateway.

const GATEWAY = "https://connector-gateway.lovable.dev/google_maps";

function authHeaders() {
  const key = process.env.LOVABLE_API_KEY;
  const conn = process.env.GOOGLE_MAPS_API_KEY;
  if (!key || !conn) throw new Error("Google Maps connector not configured");
  return {
    Authorization: `Bearer ${key}`,
    "X-Connection-Api-Key": conn,
    "Content-Type": "application/json",
  };
}

const PLACE_FIELDS = [
  "places.id",
  "places.displayName",
  "places.formattedAddress",
  "places.location",
  "places.rating",
  "places.userRatingCount",
  "places.priceLevel",
  "places.primaryTypeDisplayName",
  "places.types",
  "places.currentOpeningHours.openNow",
  "places.photos",
  "places.googleMapsUri",
].join(",");

const DETAIL_FIELDS = [
  "id",
  "displayName",
  "formattedAddress",
  "location",
  "rating",
  "userRatingCount",
  "priceLevel",
  "primaryTypeDisplayName",
  "types",
  "currentOpeningHours",
  "regularOpeningHours",
  "photos",
  "googleMapsUri",
  "internationalPhoneNumber",
  "nationalPhoneNumber",
  "websiteUri",
  "editorialSummary",
].join(",");

export type PlaceSummary = {
  id: string;
  name: string;
  address?: string;
  location?: { lat: number; lng: number };
  rating?: number;
  userRatingCount?: number;
  priceLevel?: number;
  primaryType?: string;
  types?: string[];
  openNow?: boolean;
  photo?: string; // photo reference name
  mapsUri?: string;
};

function priceLevelToNumber(pl: unknown): number | undefined {
  if (typeof pl === "number") return pl;
  const map: Record<string, number> = {
    PRICE_LEVEL_FREE: 0,
    PRICE_LEVEL_INEXPENSIVE: 1,
    PRICE_LEVEL_MODERATE: 2,
    PRICE_LEVEL_EXPENSIVE: 3,
    PRICE_LEVEL_VERY_EXPENSIVE: 4,
  };
  return typeof pl === "string" ? map[pl] : undefined;
}

function mapPlace(p: Record<string, unknown>): PlaceSummary {
  const loc = p.location as { latitude?: number; longitude?: number } | undefined;
  const photos = p.photos as Array<{ name?: string }> | undefined;
  const openingHours = p.currentOpeningHours as { openNow?: boolean } | undefined;
  return {
    id: p.id as string,
    name: (p.displayName as { text?: string })?.text ?? "",
    address: p.formattedAddress as string | undefined,
    location:
      loc && loc.latitude != null && loc.longitude != null
        ? { lat: loc.latitude, lng: loc.longitude }
        : undefined,
    rating: p.rating as number | undefined,
    userRatingCount: p.userRatingCount as number | undefined,
    priceLevel: priceLevelToNumber(p.priceLevel),
    primaryType: (p.primaryTypeDisplayName as { text?: string })?.text,
    types: p.types as string[] | undefined,
    openNow: openingHours?.openNow,
    photo: photos?.[0]?.name,
    mapsUri: p.googleMapsUri as string | undefined,
  };
}

export async function searchNearby(params: {
  lat: number;
  lng: number;
  radius: number;
  includedTypes?: string[];
  maxResultCount?: number;
  rankPreference?: "DISTANCE" | "POPULARITY";
}): Promise<PlaceSummary[]> {
  const body: Record<string, unknown> = {
    maxResultCount: Math.min(params.maxResultCount ?? 20, 20),
    rankPreference: params.rankPreference ?? "POPULARITY",
    locationRestriction: {
      circle: {
        center: { latitude: params.lat, longitude: params.lng },
        radius: Math.min(Math.max(params.radius, 100), 50000),
      },
    },
  };
  if (params.includedTypes?.length) body.includedTypes = params.includedTypes;

  const res = await fetch(`${GATEWAY}/places/v1/places:searchNearby`, {
    method: "POST",
    headers: { ...authHeaders(), "X-Goog-FieldMask": PLACE_FIELDS },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Nearby search failed [${res.status}]: ${await res.text()}`);
  const data = (await res.json()) as { places?: Array<Record<string, unknown>> };
  return (data.places ?? []).map(mapPlace);
}

export async function searchText(params: {
  query: string;
  lat?: number;
  lng?: number;
  radius?: number;
  openNow?: boolean;
  minRating?: number;
  maxResultCount?: number;
}): Promise<PlaceSummary[]> {
  const body: Record<string, unknown> = {
    textQuery: params.query,
    maxResultCount: Math.min(params.maxResultCount ?? 20, 20),
  };
  if (params.openNow) body.openNow = true;
  if (params.minRating) body.minRating = params.minRating;
  if (params.lat != null && params.lng != null) {
    body.locationBias = {
      circle: {
        center: { latitude: params.lat, longitude: params.lng },
        radius: Math.min(Math.max(params.radius ?? 5000, 100), 50000),
      },
    };
  }

  const res = await fetch(`${GATEWAY}/places/v1/places:searchText`, {
    method: "POST",
    headers: { ...authHeaders(), "X-Goog-FieldMask": PLACE_FIELDS },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Text search failed [${res.status}]: ${await res.text()}`);
  const data = (await res.json()) as { places?: Array<Record<string, unknown>> };
  return (data.places ?? []).map(mapPlace);
}

export type PlaceDetails = PlaceSummary & {
  phone?: string;
  website?: string;
  openingHours?: string[];
  photos?: string[];
  summary?: string;
};

export async function getPlaceDetails(placeId: string): Promise<PlaceDetails> {
  const res = await fetch(`${GATEWAY}/places/v1/places/${encodeURIComponent(placeId)}`, {
    method: "GET",
    headers: { ...authHeaders(), "X-Goog-FieldMask": DETAIL_FIELDS },
  });
  if (!res.ok) throw new Error(`Place details failed [${res.status}]: ${await res.text()}`);
  const p = (await res.json()) as Record<string, unknown>;
  const base = mapPlace({ ...p, id: p.id });
  const opening = p.regularOpeningHours as { weekdayDescriptions?: string[] } | undefined;
  const photos = p.photos as Array<{ name?: string }> | undefined;
  const summary = p.editorialSummary as { text?: string } | undefined;
  return {
    ...base,
    phone: (p.internationalPhoneNumber ?? p.nationalPhoneNumber) as string | undefined,
    website: p.websiteUri as string | undefined,
    openingHours: opening?.weekdayDescriptions,
    photos: (photos ?? []).map((ph) => ph.name).filter((n): n is string => !!n),
    summary: summary?.text,
  };
}

export async function fetchPhoto(name: string, maxWidth = 800): Promise<Response> {
  // name looks like "places/{placeId}/photos/{photoId}"
  const url = `${GATEWAY}/places/v1/${name}/media?maxWidthPx=${maxWidth}&skipHttpRedirect=true`;
  const res = await fetch(url, { headers: authHeaders() });
  return res;
}

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
  searchNearby,
  searchText,
  getPlaceDetails,
  type PlaceSummary,
  type PlaceDetails,
} from "./google-maps.server";

const NearbyInput = z.object({
  lat: z.number(),
  lng: z.number(),
  radius: z.number().min(100).max(50000).default(3000),
  includedTypes: z.array(z.string()).optional(),
  rankPreference: z.enum(["DISTANCE", "POPULARITY"]).optional(),
  maxResultCount: z.number().min(1).max(20).optional(),
});

export const nearbyPlaces = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => NearbyInput.parse(d))
  .handler(async ({ data }): Promise<PlaceSummary[]> => {
    return await searchNearby(data);
  });

const TextInput = z.object({
  query: z.string().min(1),
  lat: z.number().optional(),
  lng: z.number().optional(),
  radius: z.number().optional(),
  openNow: z.boolean().optional(),
  minRating: z.number().optional(),
});

export const textPlaces = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => TextInput.parse(d))
  .handler(async ({ data }): Promise<PlaceSummary[]> => {
    return await searchText(data);
  });

const DetailsInput = z.object({ placeId: z.string().min(1) });

export const placeDetails = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => DetailsInput.parse(d))
  .handler(async ({ data }): Promise<PlaceDetails> => {
    return await getPlaceDetails(data.placeId);
  });

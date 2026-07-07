import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, tool, stepCountIs, type UIMessage } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";
import { searchNearby, searchText } from "@/lib/google-maps.server";

const SYSTEM = `You are GoBite's helpful discovery assistant. You help users find nearby restaurants, cafés, bakeries, hotels and food places using ONLY officially available Google Maps Platform data.

Rules:
- Only reference data returned by tools (name, rating, ratings count, price level, address, categories, open now status).
- NEVER invent reviews, menus, popular dishes, or opinions.
- Never quote or summarize reviews — you do not have access to review text.
- Be concise, warm, and helpful. Format with short markdown lists.
- Always call the appropriate tool when the user asks about places. If you don't know the user's location, ask them or offer to use their current location.
- After a tool returns results, briefly summarize the top 3-5 places with rating, price level and distance if available. Suggest opening details for more.`;

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { messages, location } = (await request.json()) as {
          messages: UIMessage[];
          location?: { lat: number; lng: number } | null;
        };
        const key = process.env.LOVABLE_API_KEY;
        if (!key) return new Response("Missing LOVABLE_API_KEY", { status: 500 });

        const gateway = createLovableAiGatewayProvider(key);

        const searchNearbyTool = tool({
          description:
            "Search for places near a location. Use when the user asks for nearby restaurants, cafés, bakeries, hotels etc.",
          inputSchema: z.object({
            includedTypes: z
              .array(z.string())
              .describe(
                "Google Places types like 'restaurant','cafe','bakery','hotel','coffee_shop','vegetarian_restaurant'.",
              )
              .optional(),
            radiusMeters: z.number().default(3000),
            lat: z.number().optional(),
            lng: z.number().optional(),
            rankBy: z.enum(["DISTANCE", "POPULARITY"]).optional(),
          }),
          execute: async (args) => {
            const lat = args.lat ?? location?.lat;
            const lng = args.lng ?? location?.lng;
            if (lat == null || lng == null) {
              return { error: "No location available. Ask the user to share their location." };
            }
            const results = await searchNearby({
              lat,
              lng,
              radius: args.radiusMeters,
              includedTypes: args.includedTypes,
              rankPreference: args.rankBy ?? "POPULARITY",
              maxResultCount: 10,
            });
            return { count: results.length, places: results.slice(0, 10) };
          },
        });

        const searchTextTool = tool({
          description:
            "Search places by free text query (e.g. 'vegan brunch', 'boutique hotel'). Use when the user names a specific kind of place, cuisine, or neighborhood.",
          inputSchema: z.object({
            query: z.string(),
            openNow: z.boolean().optional(),
            minRating: z.number().min(0).max(5).optional(),
            lat: z.number().optional(),
            lng: z.number().optional(),
            radiusMeters: z.number().default(5000),
          }),
          execute: async (args) => {
            const lat = args.lat ?? location?.lat;
            const lng = args.lng ?? location?.lng;
            const results = await searchText({
              query: args.query,
              lat,
              lng,
              radius: args.radiusMeters,
              openNow: args.openNow,
              minRating: args.minRating,
            });
            return { count: results.length, places: results.slice(0, 10) };
          },
        });

        const result = streamText({
          model: gateway("google/gemini-2.5-flash"),
          system: SYSTEM,
          messages: await convertToModelMessages(messages),
          tools: { searchNearby: searchNearbyTool, searchText: searchTextTool },
          stopWhen: stepCountIs(6),
        });

        return result.toUIMessageStreamResponse({ originalMessages: messages });
      },
    },
  },
});

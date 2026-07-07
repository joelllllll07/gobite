import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const SaveInput = z.object({
  place_id: z.string(),
  name: z.string(),
  address: z.string().optional(),
  photo_url: z.string().optional(),
  rating: z.number().optional(),
  user_ratings_total: z.number().optional(),
  price_level: z.number().optional(),
  types: z.array(z.string()).optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
  list_type: z.enum(["favorite", "wishlist", "visited"]).default("favorite"),
});

export const savePlace = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => SaveInput.parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("saved_places").upsert(
      { ...data, user_id: context.userId },
      { onConflict: "user_id,place_id,list_type" },
    );
    if (error) throw new Error(error.message);
    return { ok: true };
  });

const RemoveInput = z.object({
  place_id: z.string(),
  list_type: z.enum(["favorite", "wishlist", "visited"]),
});

export const unsavePlace = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => RemoveInput.parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("saved_places")
      .delete()
      .eq("user_id", context.userId)
      .eq("place_id", data.place_id)
      .eq("list_type", data.list_type);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const listSaved = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("saved_places")
      .select("*")
      .eq("user_id", context.userId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

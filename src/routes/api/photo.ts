import { createFileRoute } from "@tanstack/react-router";
import { fetchPhoto } from "@/lib/google-maps.server";

export const Route = createFileRoute("/api/photo")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const name = url.searchParams.get("name");
        const w = Number(url.searchParams.get("w") ?? 800);
        if (!name || !/^places\/[^/]+\/photos\/[^/]+$/.test(name)) {
          return new Response("Invalid photo name", { status: 400 });
        }
        try {
          const res = await fetchPhoto(name, Math.min(Math.max(w, 100), 1600));
          if (!res.ok) return new Response("Photo unavailable", { status: 404 });
          const json = (await res.json()) as { photoUri?: string };
          if (!json.photoUri) return new Response("No photo", { status: 404 });
          return Response.redirect(json.photoUri, 302);
        } catch (e) {
          console.error(e);
          return new Response("Error", { status: 500 });
        }
      },
    },
  },
});

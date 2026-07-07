import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { motion } from "framer-motion";
import { Bookmark, Star, MapPin, Trash2 } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { listSaved, unsavePlace } from "@/lib/saved.functions";
import { photoUrl, priceLevelLabel } from "@/lib/gobite";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/saved")({
  component: SavedPage,
  head: () => ({ meta: [{ title: "Saved places · GoBite" }] }),
});

function SavedPage() {
  const list = useServerFn(listSaved);
  const remove = useServerFn(unsavePlace);
  const [tab, setTab] = useState<"favorite" | "wishlist" | "visited">("favorite");

  const { data, refetch, isLoading } = useQuery({
    queryKey: ["saved-places"],
    queryFn: () => list(),
  });

  const filtered = (data ?? []).filter((r) => r.list_type === tab);

  const del = async (place_id: string) => {
    try {
      await remove({ data: { place_id, list_type: tab } });
      toast.success("Removed");
      refetch();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/15 text-primary">
            <Bookmark className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Your places</h1>
            <p className="text-muted-foreground text-sm">Favorites, wishlist, and visited spots.</p>
          </div>
        </div>

        <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
          <TabsList className="rounded-full">
            <TabsTrigger value="favorite" className="rounded-full">Favorites</TabsTrigger>
            <TabsTrigger value="wishlist" className="rounded-full">Wishlist</TabsTrigger>
            <TabsTrigger value="visited" className="rounded-full">Visited</TabsTrigger>
          </TabsList>

          <TabsContent value={tab} className="mt-6">
            {isLoading ? (
              <p className="text-muted-foreground">Loading…</p>
            ) : filtered.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-5xl">📍</p>
                <p className="mt-3 text-muted-foreground">Nothing here yet.</p>
                <Button asChild className="mt-4 rounded-full bg-primary text-primary-foreground hover:bg-[var(--color-primary-hover)]">
                  <Link to="/explore">Discover places</Link>
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filtered.map((p, i) => {
                  const img = photoUrl(p.photo_url ?? undefined, 600);
                  return (
                    <motion.div
                      key={p.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="rounded-3xl border border-border bg-card overflow-hidden card-hover relative"
                    >
                      <Link to="/place/$placeId" params={{ placeId: p.place_id }}>
                        <div className="aspect-[4/3] bg-muted overflow-hidden">
                          {img ? (
                            <img src={img} alt={p.name} className="h-full w-full object-cover" />
                          ) : (
                            <div className="h-full w-full gradient-warm grid place-items-center text-4xl">🍽️</div>
                          )}
                        </div>
                        <div className="p-4">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-semibold line-clamp-1">{p.name}</h3>
                            {p.rating != null && (
                              <div className="flex items-center gap-1 text-sm">
                                <Star className="h-3.5 w-3.5 fill-primary text-primary" />
                                <span className="font-semibold">{Number(p.rating).toFixed(1)}</span>
                              </div>
                            )}
                          </div>
                          {p.address && (
                            <p className="mt-2 text-xs text-muted-foreground flex items-start gap-1 line-clamp-2">
                              <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0" /> {p.address}
                            </p>
                          )}
                          {p.price_level != null && (
                            <p className="mt-1 text-xs text-muted-foreground">{priceLevelLabel(p.price_level)}</p>
                          )}
                        </div>
                      </Link>
                      <button
                        onClick={() => del(p.place_id)}
                        className="absolute top-3 right-3 grid place-items-center h-8 w-8 rounded-full bg-background/90 backdrop-blur border border-border text-destructive hover:bg-destructive hover:text-destructive-foreground transition"
                        aria-label="Remove"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
      <Footer />
    </div>
  );
}

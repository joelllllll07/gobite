import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Loader2, MapPin, Filter, LayoutGrid, Map as MapIcon, Search } from "lucide-react";
import { z } from "zod";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { PlaceCard } from "@/components/place-card";
import { PlaceMap } from "@/components/place-map";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useGeolocation } from "@/hooks/use-geolocation";
import { nearbyPlaces, textPlaces } from "@/lib/places.functions";
import { CATEGORIES, distanceKm as calcDist } from "@/lib/gobite";
import type { PlaceSummary } from "@/lib/google-maps.server";

const searchSchema = z.object({
  q: z.string().optional(),
  category: z.string().optional(),
});

export const Route = createFileRoute("/explore")({
  validateSearch: (s) => searchSchema.parse(s),
  component: Explore,
  head: () => ({
    meta: [
      { title: "Explore nearby places · GoBite" },
      {
        name: "description",
        content: "Discover restaurants, cafés, bakeries and hotels near you with GoBite.",
      },
    ],
  }),
});

type SortKey = "rating" | "distance" | "reviews" | "price";

function Explore() {
  const { q, category } = Route.useSearch();
  const navigate = useNavigate();
  const { coords, request, setManual, loading: geoLoading } = useGeolocation();
  const [radius, setRadius] = useState<number>(3000);
  const [selectedCat, setSelectedCat] = useState<string | undefined>(category);
  const [openNowOnly, setOpenNowOnly] = useState(false);
  const [minRating, setMinRating] = useState<number>(0);
  const [sort, setSort] = useState<SortKey>("rating");
  const [view, setView] = useState<"list" | "map">("list");
  const [query, setQuery] = useState<string>(q ?? "");
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    setSelectedCat(category);
  }, [category]);
  useEffect(() => {
    setQuery(q ?? "");
  }, [q]);

  const nearby = useServerFn(nearbyPlaces);
  const text = useServerFn(textPlaces);

  const includedTypes = useMemo(() => {
    if (!selectedCat) return undefined;
    const cat = CATEGORIES.find((c) => c.type === selectedCat);
    return cat ? [cat.type] : [selectedCat];
  }, [selectedCat]);

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["explore", coords?.lat, coords?.lng, radius, includedTypes, q],
    enabled: !!coords,
    queryFn: async (): Promise<PlaceSummary[]> => {
      if (q && q.trim()) {
        return await text({
          data: {
            query: q.trim(),
            lat: coords!.lat,
            lng: coords!.lng,
            radius,
          },
        });
      }
      return await nearby({
        data: {
          lat: coords!.lat,
          lng: coords!.lng,
          radius,
          includedTypes,
          rankPreference: "POPULARITY",
        },
      });
    },
  });

  const filtered = useMemo(() => {
    let items = data ?? [];
    if (openNowOnly) items = items.filter((p) => p.openNow === true);
    if (minRating > 0) items = items.filter((p) => (p.rating ?? 0) >= minRating);
    const withDist = items.map((p) => ({
      p,
      d: p.location && coords ? calcDist(coords, p.location) : undefined,
    }));
    withDist.sort((a, b) => {
      switch (sort) {
        case "rating":
          return (b.p.rating ?? 0) - (a.p.rating ?? 0);
        case "reviews":
          return (b.p.userRatingCount ?? 0) - (a.p.userRatingCount ?? 0);
        case "price":
          return (a.p.priceLevel ?? 99) - (b.p.priceLevel ?? 99);
        case "distance":
        default:
          return (a.d ?? Infinity) - (b.d ?? Infinity);
      }
    });
    return withDist;
  }, [data, openNowOnly, minRating, sort, coords]);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate({ to: "/explore", search: { q: query.trim() || undefined, category: selectedCat } as never });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      {/* Filters bar */}
      <div className="border-b border-border bg-surface/60 sticky top-16 z-30 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-3 flex flex-wrap items-center gap-2">
          <form onSubmit={submitSearch} className="flex-1 min-w-[220px]">
            <label className="flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search a place or dish type…"
                className="w-full bg-transparent text-sm outline-none"
              />
            </label>
          </form>

          <Select value={selectedCat ?? "all"} onValueChange={(v) => {
            const val = v === "all" ? undefined : v;
            setSelectedCat(val);
            navigate({ to: "/explore", search: { q, category: val } as never });
          }}>
            <SelectTrigger className="w-[170px] rounded-full">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {CATEGORIES.map((c) => (
                <SelectItem key={c.id} value={c.type}>{c.icon} {c.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={String(radius)} onValueChange={(v) => setRadius(Number(v))}>
            <SelectTrigger className="w-[130px] rounded-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1000">1 km</SelectItem>
              <SelectItem value="3000">3 km</SelectItem>
              <SelectItem value="5000">5 km</SelectItem>
              <SelectItem value="10000">10 km</SelectItem>
              <SelectItem value="25000">25 km</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
            <SelectTrigger className="w-[160px] rounded-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rating">Highest rated</SelectItem>
              <SelectItem value="distance">Nearest</SelectItem>
              <SelectItem value="reviews">Most reviewed</SelectItem>
              <SelectItem value="price">Price (low→high)</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5">
            <Switch id="opennow" checked={openNowOnly} onCheckedChange={setOpenNowOnly} />
            <Label htmlFor="opennow" className="text-sm">Open now</Label>
          </div>

          <div className="flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 w-[190px]">
            <Filter className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground shrink-0">≥ {minRating.toFixed(1)}★</span>
            <Slider min={0} max={5} step={0.5} value={[minRating]} onValueChange={(v) => setMinRating(v[0])} />
          </div>

          <div className="ml-auto inline-flex rounded-full border border-border p-1">
            <button
              onClick={() => setView("list")}
              className={`px-3 py-1.5 rounded-full text-xs font-medium inline-flex items-center gap-1.5 ${view === "list" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
            >
              <LayoutGrid className="h-3.5 w-3.5" /> List
            </button>
            <button
              onClick={() => setView("map")}
              className={`px-3 py-1.5 rounded-full text-xs font-medium inline-flex items-center gap-1.5 ${view === "map" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
            >
              <MapIcon className="h-3.5 w-3.5" /> Map
            </button>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl w-full px-4 sm:px-6 py-6 flex-1">
        {!coords ? (
          <LocationPrompt onUse={request} onManual={setManual} loading={geoLoading} />
        ) : view === "map" ? (
          <div className="grid md:grid-cols-[1fr_380px] gap-4">
            <PlaceMap
              center={coords}
              places={filtered.map((f) => f.p)}
              activeId={activeId}
              onMarkerClick={(p) => setActiveId(p.id)}
              className="h-[calc(100vh-220px)] min-h-[500px]"
            />
            <div className="max-h-[calc(100vh-220px)] overflow-y-auto space-y-3 pr-1">
              {isLoading ? <ListSkeleton /> : filtered.map(({ p, d }, i) => (
                <div key={p.id} onMouseEnter={() => setActiveId(p.id)}>
                  <PlaceCard place={p} distanceKm={d} index={i} />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-muted-foreground">
                {isLoading ? "Searching…" : `${filtered.length} place${filtered.length === 1 ? "" : "s"} found`}
              </p>
              <Button variant="ghost" size="sm" onClick={() => refetch()} disabled={isFetching}>
                {isFetching && <Loader2 className="h-3.5 w-3.5 animate-spin mr-2" />} Refresh
              </Button>
            </div>
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                <ListSkeleton />
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-24">
                <p className="text-2xl">🍽️</p>
                <p className="mt-2 text-muted-foreground">No places match those filters.</p>
              </div>
            ) : (
              <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5" layout>
                {filtered.map(({ p, d }, i) => (
                  <PlaceCard key={p.id} place={p} distanceKm={d} index={i} />
                ))}
              </motion.div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}

function ListSkeleton() {
  return (
    <>
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="rounded-3xl border border-border bg-card overflow-hidden">
          <Skeleton className="aspect-[4/3] w-full" />
          <div className="p-4 space-y-2">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </>
  );
}

function LocationPrompt({
  onUse,
  onManual,
  loading,
}: {
  onUse: () => void;
  onManual: (c: { lat: number; lng: number }) => void;
  loading: boolean;
}) {
  const CITIES = [
    { name: "New York", lat: 40.7128, lng: -74.006 },
    { name: "London", lat: 51.5074, lng: -0.1278 },
    { name: "Paris", lat: 48.8566, lng: 2.3522 },
    { name: "Tokyo", lat: 35.6762, lng: 139.6503 },
    { name: "Barcelona", lat: 41.3851, lng: 2.1734 },
    { name: "Mumbai", lat: 19.076, lng: 72.8777 },
  ];
  return (
    <div className="mx-auto max-w-xl text-center py-20">
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-primary/15 text-primary">
        <MapPin className="h-6 w-6" />
      </div>
      <h2 className="mt-6 text-2xl font-bold">Where should we look?</h2>
      <p className="mt-2 text-muted-foreground">
        Share your location for the most relevant nearby places — or pick a city to preview.
      </p>
      <div className="mt-6">
        <Button size="lg" onClick={onUse} disabled={loading} className="rounded-full bg-primary text-primary-foreground hover:bg-[var(--color-primary-hover)]">
          {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <MapPin className="h-4 w-4 mr-2" />}
          Use my location
        </Button>
      </div>
      <div className="mt-8">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Or try a city</p>
        <div className="flex flex-wrap justify-center gap-2">
          {CITIES.map((c) => (
            <button
              key={c.name}
              onClick={() => onManual({ lat: c.lat, lng: c.lng })}
              className="rounded-full border border-border bg-card px-4 py-1.5 text-sm hover:border-primary hover:text-primary transition"
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Star,
  MapPin,
  Phone,
  Globe,
  Clock,
  ExternalLink,
  Share2,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { PlaceMap } from "@/components/place-map";
import { PlaceCard } from "@/components/place-card";
import { SaveButton } from "@/components/save-button";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { placeDetails, nearbyPlaces } from "@/lib/places.functions";
import { photoUrl, priceLevelLabel } from "@/lib/gobite";
import { toast } from "sonner";

export const Route = createFileRoute("/place/$placeId")({
  component: PlacePage,
});

function PlacePage() {
  const { placeId } = Route.useParams();
  const navigate = useNavigate();
  const [activePhoto, setActivePhoto] = useState(0);
  const details = useServerFn(placeDetails);
  const nearby = useServerFn(nearbyPlaces);

  const { data: place, isLoading, error } = useQuery({
    queryKey: ["place", placeId],
    queryFn: () => details({ data: { placeId } }),
  });

  const { data: similar } = useQuery({
    queryKey: ["similar", placeId, place?.location],
    enabled: !!place?.location,
    queryFn: () =>
      nearby({
        data: {
          lat: place!.location!.lat,
          lng: place!.location!.lng,
          radius: 2000,
          includedTypes: place!.types?.slice(0, 1),
          maxResultCount: 8,
        },
      }),
  });

  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({ title: place?.name, url });
      else {
        await navigator.clipboard.writeText(url);
        toast.success("Link copied");
      }
    } catch {}
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="mx-auto max-w-6xl px-6 py-8">
          <Skeleton className="h-96 w-full rounded-3xl" />
          <Skeleton className="mt-6 h-10 w-1/2" />
          <Skeleton className="mt-2 h-4 w-1/3" />
        </div>
      </div>
    );
  }

  if (error || !place) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="mx-auto max-w-6xl px-6 py-24 text-center">
          <p className="text-muted-foreground">Couldn't load this place.</p>
          <Button onClick={() => navigate({ to: "/explore" })} className="mt-4 rounded-full">Back to explore</Button>
        </div>
      </div>
    );
  }

  const photos = place.photos ?? [];
  const mainPhoto = photoUrl(photos[activePhoto], 1200);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-6">
        <button
          onClick={() => window.history.back()}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        {/* Gallery */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="grid md:grid-cols-[2fr_1fr] gap-3 h-[420px]">
            <div className="relative overflow-hidden rounded-3xl bg-muted">
              {mainPhoto ? (
                <img src={mainPhoto} alt={place.name} className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full gradient-warm grid place-items-center text-6xl">🍽️</div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              {photos.slice(1, 5).map((p, i) => {
                const url = photoUrl(p, 600);
                return (
                  <button
                    key={p}
                    onClick={() => setActivePhoto(i + 1)}
                    className="relative overflow-hidden rounded-2xl bg-muted h-full"
                  >
                    {url && <img src={url} alt="" className="h-full w-full object-cover hover:scale-105 transition" />}
                  </button>
                );
              })}
              {photos.length < 2 &&
                Array.from({ length: 4 - Math.max(photos.length - 1, 0) }).map((_, i) => (
                  <div key={i} className="rounded-2xl bg-muted" />
                ))}
            </div>
          </div>
        </motion.div>

        {/* Header */}
        <div className="mt-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              {place.primaryType && <Badge variant="secondary" className="rounded-full">{place.primaryType}</Badge>}
              {place.openNow != null && (
                <Badge className={place.openNow ? "bg-success text-success-foreground" : "bg-destructive text-destructive-foreground"}>
                  {place.openNow ? "Open now" : "Closed"}
                </Badge>
              )}
              {place.priceLevel != null && <Badge variant="outline" className="rounded-full">{priceLevelLabel(place.priceLevel)}</Badge>}
            </div>
            <h1 className="mt-3 text-3xl md:text-4xl font-bold tracking-tight">{place.name}</h1>
            {place.address && (
              <p className="mt-2 text-muted-foreground flex items-center gap-1.5"><MapPin className="h-4 w-4" /> {place.address}</p>
            )}
            {place.rating != null && (
              <div className="mt-2 flex items-center gap-1">
                <Star className="h-4 w-4 fill-primary text-primary" />
                <span className="font-semibold">{place.rating.toFixed(1)}</span>
                {place.userRatingCount != null && (
                  <span className="text-muted-foreground text-sm">({place.userRatingCount.toLocaleString()} ratings)</span>
                )}
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <SaveButton place={place} />
            <Button variant="outline" className="rounded-full" onClick={share}>
              <Share2 className="h-4 w-4 mr-2" /> Share
            </Button>
            {place.mapsUri && (
              <Button asChild className="rounded-full bg-primary text-primary-foreground hover:bg-[var(--color-primary-hover)]">
                <a href={place.mapsUri} target="_blank" rel="noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" /> Directions
                </a>
              </Button>
            )}
          </div>
        </div>

        {place.summary && (
          <p className="mt-6 text-lg leading-relaxed text-muted-foreground max-w-3xl">{place.summary}</p>
        )}

        {/* Grid: info + map */}
        <div className="mt-10 grid lg:grid-cols-[1fr_1.2fr] gap-8">
          <div className="space-y-6">
            {place.openingHours && place.openingHours.length > 0 && (
              <section className="rounded-2xl border border-border bg-card p-6">
                <h3 className="font-semibold text-lg flex items-center gap-2"><Clock className="h-4 w-4 text-primary" /> Hours</h3>
                <ul className="mt-3 space-y-1.5 text-sm">
                  {place.openingHours.map((h) => (
                    <li key={h} className="text-muted-foreground">{h}</li>
                  ))}
                </ul>
              </section>
            )}
            <section className="rounded-2xl border border-border bg-card p-6 space-y-3">
              <h3 className="font-semibold text-lg">Contact</h3>
              {place.phone && (
                <a href={`tel:${place.phone}`} className="flex items-center gap-2 text-sm hover:text-primary">
                  <Phone className="h-4 w-4" /> {place.phone}
                </a>
              )}
              {place.website && (
                <a href={place.website} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm hover:text-primary break-all">
                  <Globe className="h-4 w-4" /> {place.website}
                </a>
              )}
              {!place.phone && !place.website && (
                <p className="text-sm text-muted-foreground">No contact details available.</p>
              )}
            </section>
          </div>

          {place.location && (
            <PlaceMap
              center={place.location}
              places={[place]}
              className="h-[400px] lg:h-full min-h-[400px]"
              zoom={15}
            />
          )}
        </div>

        {/* Similar */}
        {similar && similar.length > 1 && (
          <section className="mt-14">
            <h2 className="text-2xl font-bold tracking-tight">Nearby similar places</h2>
            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {similar.filter((s) => s.id !== place.id).slice(0, 4).map((p, i) => (
                <PlaceCard key={p.id} place={p} index={i} />
              ))}
            </div>
          </section>
        )}
      </div>

      <Footer />
    </div>
  );
}

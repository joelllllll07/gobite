import { Link } from "@tanstack/react-router";
import { Star, MapPin, Clock } from "lucide-react";
import { motion } from "framer-motion";
import type { PlaceSummary } from "@/lib/google-maps.server";
import { photoUrl, priceLevelLabel, formatDistance } from "@/lib/gobite";
import { Badge } from "@/components/ui/badge";

export function PlaceCard({
  place,
  distanceKm,
  index = 0,
}: {
  place: PlaceSummary;
  distanceKm?: number;
  index?: number;
}) {
  const img = photoUrl(place.photo, 800);
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.03, 0.3) }}
    >
      <Link
        to="/place/$placeId"
        params={{ placeId: place.id }}
        className="group block overflow-hidden rounded-3xl border border-border bg-card card-hover"
      >
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          {img ? (
            <img
              src={img}
              alt={place.name}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="h-full w-full gradient-warm grid place-items-center text-4xl">🍽️</div>
          )}
          {place.openNow != null && (
            <div className="absolute top-3 left-3">
              <Badge
                className={
                  place.openNow
                    ? "bg-success text-success-foreground border-transparent"
                    : "bg-destructive text-destructive-foreground border-transparent"
                }
              >
                <Clock className="h-3 w-3 mr-1" />
                {place.openNow ? "Open now" : "Closed"}
              </Badge>
            </div>
          )}
          {place.priceLevel != null && (
            <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-background/90 text-xs font-semibold">
              {priceLevelLabel(place.priceLevel)}
            </div>
          )}
        </div>
        <div className="p-4">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold leading-tight line-clamp-1">{place.name}</h3>
            {place.rating != null && (
              <div className="flex items-center gap-1 text-sm shrink-0">
                <Star className="h-3.5 w-3.5 fill-primary text-primary" />
                <span className="font-semibold">{place.rating.toFixed(1)}</span>
                {place.userRatingCount != null && (
                  <span className="text-muted-foreground">({place.userRatingCount})</span>
                )}
              </div>
            )}
          </div>
          {place.primaryType && (
            <p className="mt-1 text-xs text-muted-foreground capitalize">{place.primaryType}</p>
          )}
          {place.address && (
            <p className="mt-2 flex items-start gap-1.5 text-xs text-muted-foreground line-clamp-2">
              <MapPin className="h-3.5 w-3.5 shrink-0 mt-0.5" />
              {place.address}
            </p>
          )}
          {distanceKm != null && (
            <p className="mt-2 text-xs font-medium text-primary">{formatDistance(distanceKm)} away</p>
          )}
        </div>
      </Link>
    </motion.div>
  );
}

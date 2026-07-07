import { useEffect, useState } from "react";
import { Bookmark, BookmarkCheck, Loader2 } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { useSession } from "@/hooks/use-session";
import { savePlace, unsavePlace, listSaved } from "@/lib/saved.functions";
import { Button } from "@/components/ui/button";
import type { PlaceSummary, PlaceDetails } from "@/lib/google-maps.server";

export function SaveButton({
  place,
  variant = "default",
}: {
  place: PlaceSummary | PlaceDetails;
  variant?: "default" | "icon";
}) {
  const { user } = useSession();
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const save = useServerFn(savePlace);
  const unsave = useServerFn(unsavePlace);
  const list = useServerFn(listSaved);

  useEffect(() => {
    if (!user) return;
    list()
      .then((rows) => {
        setSaved(rows.some((r) => r.place_id === place.id && r.list_type === "favorite"));
      })
      .catch(() => {});
  }, [user, place.id]);

  const onClick = async () => {
    if (!user) {
      toast.error("Sign in to save places");
      return;
    }
    setLoading(true);
    try {
      if (saved) {
        await unsave({ data: { place_id: place.id, list_type: "favorite" } });
        setSaved(false);
        toast.success("Removed from favorites");
      } else {
        await save({
          data: {
            place_id: place.id,
            name: place.name,
            address: place.address,
            photo_url: place.photo,
            rating: place.rating,
            user_ratings_total: place.userRatingCount,
            price_level: place.priceLevel,
            types: place.types,
            lat: place.location?.lat,
            lng: place.location?.lng,
            list_type: "favorite",
          },
        });
        setSaved(true);
        toast.success("Saved to favorites");
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(false);
    }
  };

  if (variant === "icon") {
    return (
      <Button variant="outline" size="icon" onClick={onClick} disabled={loading} className="rounded-full">
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : saved ? <BookmarkCheck className="h-4 w-4 fill-primary text-primary" /> : <Bookmark className="h-4 w-4" />}
      </Button>
    );
  }

  return (
    <Button variant="outline" onClick={onClick} disabled={loading} className="rounded-full">
      {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : saved ? <BookmarkCheck className="h-4 w-4 mr-2 fill-primary text-primary" /> : <Bookmark className="h-4 w-4 mr-2" />}
      {saved ? "Saved" : "Save"}
    </Button>
  );
}

export const CATEGORIES = [
  { id: "restaurant", label: "Restaurants", icon: "🍽️", type: "restaurant" },
  { id: "cafe", label: "Cafés", icon: "☕", type: "cafe" },
  { id: "bakery", label: "Bakeries", icon: "🥐", type: "bakery" },
  { id: "coffee_shop", label: "Coffee", icon: "☕", type: "coffee_shop" },
  { id: "dessert", label: "Desserts", icon: "🍰", type: "dessert_shop" },
  { id: "fast_food", label: "Fast Food", icon: "🍔", type: "fast_food_restaurant" },
  { id: "meal_takeaway", label: "Takeaway", icon: "🥡", type: "meal_takeaway" },
  { id: "meal_delivery", label: "Delivery", icon: "🛵", type: "meal_delivery" },
  { id: "vegetarian", label: "Vegetarian", icon: "🥗", type: "vegetarian_restaurant" },
  { id: "hotel", label: "Hotels", icon: "🏨", type: "hotel" },
  { id: "lodging", label: "Lodging", icon: "🛏️", type: "lodging" },
] as const;

export type Category = (typeof CATEGORIES)[number];

export function priceLevelLabel(pl?: number): string {
  if (pl == null) return "";
  return "$".repeat(Math.max(1, pl));
}

export function distanceKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) *
      Math.cos((b.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}

export function photoUrl(name?: string, width = 800): string | undefined {
  if (!name) return undefined;
  return `/api/photo?name=${encodeURIComponent(name)}&w=${width}`;
}

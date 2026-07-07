import { useEffect, useState } from "react";

export type Coords = { lat: number; lng: number } | null;

const KEY = "gobite:location";

export function useGeolocation() {
  const [coords, setCoords] = useState<Coords>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const cached = window.localStorage.getItem(KEY);
    if (cached) {
      try {
        setCoords(JSON.parse(cached));
      } catch {}
    }
  }, []);

  const request = () => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setError("Geolocation not supported");
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const c = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setCoords(c);
        window.localStorage.setItem(KEY, JSON.stringify(c));
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const setManual = (c: { lat: number; lng: number }) => {
    setCoords(c);
    window.localStorage.setItem(KEY, JSON.stringify(c));
  };

  return { coords, error, loading, request, setManual };
}

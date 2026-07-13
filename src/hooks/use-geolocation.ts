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
    return new Promise<{ lat: number; lng: number }>((resolve, reject) => {
      if (typeof navigator === "undefined" || !navigator.geolocation) {
        const msg = "Geolocation not supported";
        setError(msg);
        reject(new Error(msg));
        return;
      }
      setError(null);
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const c = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setCoords(c);
          window.localStorage.setItem(KEY, JSON.stringify(c));
          setLoading(false);
          resolve(c);
        },
        (err) => {
          setError(err.message);
          setLoading(false);
          reject(err);
        },
        { enableHighAccuracy: true, timeout: 10000 },
      );
    });
  };

  const setManual = (c: { lat: number; lng: number }) => {
    setCoords(c);
    window.localStorage.setItem(KEY, JSON.stringify(c));
  };

  return { coords, error, loading, request, setManual };
}

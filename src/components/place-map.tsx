import { useEffect, useRef, useState } from "react";
import type { PlaceSummary } from "@/lib/google-maps.server";

declare global {
  interface Window {
    google?: typeof google;
    __gobiteMapInit?: () => void;
  }
}

let scriptLoading: Promise<void> | null = null;

function loadMaps(): Promise<void> {
  if (typeof window === "undefined") return Promise.reject(new Error("SSR"));
  if (window.google?.maps) return Promise.resolve();
  if (scriptLoading) return scriptLoading;

  scriptLoading = new Promise<void>((resolve, reject) => {
    const key = import.meta.env.VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_BROWSER_KEY as string;
    const channel = import.meta.env.VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_TRACKING_ID as string;
    if (!key) return reject(new Error("Missing Google Maps browser key"));
    window.__gobiteMapInit = () => resolve();
    const s = document.createElement("script");
    s.async = true;
    s.src = `https://maps.googleapis.com/maps/api/js?key=${key}&loading=async&callback=__gobiteMapInit${channel ? `&channel=${channel}` : ""}`;
    s.onerror = () => reject(new Error("Failed to load Google Maps"));
    document.head.appendChild(s);
  });
  return scriptLoading;
}

export function PlaceMap({
  center,
  places,
  activeId,
  onMarkerClick,
  className,
  zoom = 14,
}: {
  center: { lat: number; lng: number };
  places?: PlaceSummary[];
  activeId?: string | null;
  onMarkerClick?: (p: PlaceSummary) => void;
  className?: string;
  zoom?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const userMarkerRef = useRef<google.maps.Marker | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadMaps().then(
      () => setReady(true),
      (e: Error) => setError(e.message),
    );
  }, []);

  useEffect(() => {
    if (!ready || !ref.current || mapRef.current) return;
    mapRef.current = new window.google!.maps.Map(ref.current, {
      center,
      zoom,
      disableDefaultUI: true,
      zoomControl: true,
      clickableIcons: false,
      styles: [
        { featureType: "poi", stylers: [{ visibility: "off" }] },
        { featureType: "transit", stylers: [{ visibility: "off" }] },
      ],
    });
    userMarkerRef.current = new window.google!.maps.Marker({
      map: mapRef.current,
      position: center,
      icon: {
        path: window.google!.maps.SymbolPath.CIRCLE,
        scale: 8,
        fillColor: "#2563eb",
        fillOpacity: 1,
        strokeColor: "#ffffff",
        strokeWeight: 3,
      },
      title: "You are here",
    });
  }, [ready, center, zoom]);

  useEffect(() => {
    if (mapRef.current) mapRef.current.panTo(center);
    if (userMarkerRef.current) userMarkerRef.current.setPosition(center);
  }, [center.lat, center.lng]);

  useEffect(() => {
    if (!ready || !mapRef.current) return;
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];
    (places ?? []).forEach((p) => {
      if (!p.location) return;
      const marker = new window.google!.maps.Marker({
        position: p.location,
        map: mapRef.current!,
        title: p.name,
        icon: {
          path: "M12 2C7.58 2 4 5.58 4 10c0 5.25 7.11 11.42 7.41 11.68a1 1 0 0 0 1.18 0C12.89 21.42 20 15.25 20 10c0-4.42-3.58-8-8-8z",
          fillColor: activeId === p.id ? "#FFB300" : "#FFC107",
          fillOpacity: 1,
          strokeColor: "#111111",
          strokeWeight: 1.5,
          scale: activeId === p.id ? 2 : 1.6,
          anchor: new window.google!.maps.Point(12, 22),
        },
      });
      marker.addListener("click", () => onMarkerClick?.(p));
      markersRef.current.push(marker);
    });
  }, [places, ready, activeId, onMarkerClick]);

  if (error) {
    return (
      <div className={"grid place-items-center rounded-3xl border border-border bg-muted p-6 text-sm text-muted-foreground " + (className ?? "")}>
        Map unavailable: {error}
      </div>
    );
  }

  return <div ref={ref} className={"rounded-3xl overflow-hidden " + (className ?? "")} />;
}

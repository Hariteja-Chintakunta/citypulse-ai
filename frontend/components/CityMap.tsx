"use client";

import { useEffect, useRef } from "react";
import type { Complaint } from "../lib/types";

/** City map (Blueprint: Leaflet + OpenStreetMap). Markers render at the
 * exact complaint coordinates; the map degrades gracefully if the tile
 * layer cannot load. */
export default function CityMap({
  complaints,
  height = 420,
}: {
  complaints: Complaint[];
  height?: number;
}) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<unknown>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const L = (await import("leaflet")).default;
      if (cancelled || !mapRef.current || mapInstance.current) return;
      await import("leaflet/dist/leaflet.css");
      const map = L.map(mapRef.current).setView([17.41, 78.46], 12);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);
      mapInstance.current = map;
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const L = (await import("leaflet")).default;
      const map = mapInstance.current as
        | { eachLayer: (fn: (l: unknown) => void) => void; removeLayer: (l: unknown) => void }
        | null;
      if (cancelled || !map) return;
      // Clear previous markers (keep the tile layer).
      map.eachLayer((layer: unknown) => {
        const marker = layer as { options?: { icon?: unknown } };
        if (marker.options?.icon) map.removeLayer(layer);
      });
      for (const c of complaints) {
        const marker = L.marker([c.latitude, c.longitude]);
        marker.bindPopup(
          `<strong>${c.ticket_no}</strong><br>${c.category} — ${c.status}<br>${c.ward}`,
        );
        (marker as unknown as { addTo: (m: unknown) => void }).addTo(map);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [complaints]);

  return (
    <div
      data-testid="map-container"
      ref={mapRef}
      role="application"
      aria-label="City map with issue markers"
      style={{ height }}
      className="w-full rounded-lg border bg-gray-100"
    />
  );
}

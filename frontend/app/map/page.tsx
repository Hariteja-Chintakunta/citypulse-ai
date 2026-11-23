"use client";

import { useState } from "react";
import CityMap from "../../components/CityMap";
import ComplaintCard from "../../components/ComplaintCard";
import { CATEGORIES } from "../../lib/demoData";
import { getComplaints } from "../../lib/store";

export default function MapPage() {
  const [category, setCategory] = useState<string>("All");
  const all = getComplaints();
  const shown = category === "All" ? all : all.filter((c) => c.category === category);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">City map</h1>
      <p className="text-sm text-gray-600">
        Every verified issue as a marker, with category filters. Markers show
        the exact reported coordinates. Demo data.
      </p>

      <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by category">
        {["All", ...CATEGORIES].map((c) => (
          <button
            key={c}
            type="button"
            data-testid={`filter-${c}`}
            onClick={() => setCategory(c)}
            aria-pressed={category === c}
            className={`rounded-full border px-3 py-1 text-sm ${category === c ? "bg-brand-teal font-semibold text-white" : "bg-white"}`}
          >
            {c}
          </button>
        ))}
      </div>

      <CityMap complaints={shown} />

      <p className="text-sm text-gray-600" data-testid="map-count">
        Showing {shown.length} of {all.length} reports.
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        {shown.map((c) => (
          <ComplaintCard key={c.id} complaint={c} />
        ))}
      </div>
    </div>
  );
}

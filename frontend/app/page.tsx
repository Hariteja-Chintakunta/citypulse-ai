"use client";

import { useEffect, useState } from "react";

import Link from "next/link";
import CityMap from "../components/CityMap";
import ComplaintCard from "../components/ComplaintCard";
import { DEMO_ALERTS } from "../lib/demoData";
import { getComplaints } from "../lib/store";
import { loadComplaints } from "../lib/api";
import type { Complaint } from "../lib/types";

export default function HomePage() {
  // Demo store first so the page never renders empty; replaced with live
  // data once loaded when the user is signed in.
  const [complaints, setComplaints] = useState<Complaint[]>(() => getComplaints());
  
  useEffect(() => {
    loadComplaints().then(setComplaints).catch(() => {});
  }, []);
  const total = complaints.length;
  const resolved = complaints.filter((c) => c.status === "RESOLVED").length;
  const open = complaints.filter(
    (c) => !["RESOLVED", "REJECTED", "DUPLICATE_MERGED"].includes(c.status),
  ).length;

  return (
    <div className="space-y-8">
      <section className="rounded-xl bg-brand-dark p-6 text-white sm:p-10">
        <h1 className="text-3xl font-bold sm:text-4xl">Your city. Your voice. Your impact.</h1>
        <p className="mt-3 max-w-2xl text-teal-100">
          Report a city problem with a photo. AI suggests what it is, the
          platform checks for duplicates, and you can track your ticket until
          it is resolved — no more reports that disappear.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/report" className="rounded bg-brand-accent px-5 py-3 font-bold text-black hover:bg-amber-400">
            Report an issue
          </Link>
          <Link href="/map" className="rounded border border-white px-5 py-3 font-semibold hover:bg-teal-800">
            View the city map
          </Link>
        </div>
      </section>

      <section aria-label="Community metrics" className="grid grid-cols-3 gap-3 text-center">
        <div className="rounded-lg border bg-white p-4"><p className="text-2xl font-bold" data-testid="metric-total">{total}</p><p className="text-sm text-gray-600">Report</p></div>
        <div className="rounded-lg border bg-white p-4"><p className="text-2xl font-bold" data-testid="metric-open">{open}</p><p className="text-sm text-gray-600">Open</p></div>
        <div className="rounded-lg border bg-white p-4"><p className="text-2xl font-bold" data-testid="metric-resolved">{resolved}</p><p className="text-sm text-gray-600">Resolved</p></div>
      </section>

      <section aria-label="How it works">
        <h2 className="text-xl font-bold">How it works</h2>
        <ol className="mt-3 grid gap-3 sm:grid-cols-3">
          {[
            ["1. Report", "Photo, category, description and location — a minute of your time."],
            ["2. AI checks", "The AI suggests a category with confidence; duplicates are flagged, not hidden."],
            ["3. Track", "Every report gets a unique ticket and a timeline you can follow."],
          ].map(([title, text]) => (
            <li key={title} className="rounded-lg border bg-white p-4">
              <p className="font-semibold">{title}</p>
              <p className="text-sm text-gray-700">{text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section aria-label="City map preview">
        <div className="flex items-baseline justify-between">
          <h2 className="text-xl font-bold">Issues on the map</h2>
          <Link href="/map" className="text-sm font-semibold text-brand-teal hover:underline">Open full map</Link>
        </div>
        <div className="mt-3"><CityMap complaints={complaints} height={320} /></div>
      </section>

      <section aria-label="Recent reports">
        <h2 className="text-xl font-bold">Recent reports</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {complaints.slice(0, 6).map((c) => (
            <ComplaintCard key={c.id} complaint={c} />
          ))}
        </div>
      </section>

      <section aria-label="Alerts">
        <h2 className="text-xl font-bold">Alerts</h2>
        <ul className="mt-3 space-y-2">
          {DEMO_ALERTS.length === 0 && (
      <li className="rounded-lg border bg-white p-3 text-sm text-gray-600">No alerts right now.</li>
      )}
          {DEMO_ALERTS.slice(0, 2).map((a) => (
            <li key={a.id} className="rounded-lg border bg-amber-50 p-3 text-sm">
              <strong>{a.title}</strong> — {a.detail}
            </li>
          ))}
        </ul>
        <Link href="/alerts" className="mt-2 inline-block text-sm font-semibold text-brand-teal hover:underline">
          All alerts
        </Link>
      </section>
    </div>
  );
}

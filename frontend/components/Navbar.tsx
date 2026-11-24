"use client";

import { useEffect, useState } from "react";

import Link from "next/link";
import { isDemoMode } from "../lib/api";

export default function Navbar() {
  const [live, setLive] = useState(false);

  useEffect(() => {
    setLive(!isDemoMode());
  }, []);
  
  return (
    <header className="bg-brand-dark text-white">
      <nav
        aria-label="Main navigation"
        className="mx-auto flex max-w-6xl flex-wrap items-center gap-4 px-4 py-3"
      >
        <Link href="/" className="text-xl font-bold tracking-tight">
          CityPulse AI
        </Link>
        <span className="hidden text-sm text-teal-200 sm:inline">
          Your city. Your voice. Your impact.
        </span>
        <div className="ml-auto flex flex-wrap gap-1 text-sm">
          <Link className="rounded px-3 py-2 hover:bg-teal-800" href="/">Home</Link>
          <Link className="rounded px-3 py-2 hover:bg-teal-800" href="/report">Report an issue</Link>
          <Link className="rounded px-3 py-2 hover:bg-teal-800" href="/map">City map</Link>
          <Link className="rounded px-3 py-2 hover:bg-teal-800" href="/alerts">Alerts</Link>
          <Link className="rounded px-3 py-2 hover:bg-teal-800" href="/leaderboard">Leaderboard</Link>
          <Link className="rounded bg-brand-accent px-3 py-2 font-semibold text-black hover:bg-amber-400" href="/admin">Admin</Link>
        </div>
      </nav>
      <p className="bg-amber-100 px-4 py-1 text-center text-xs text-amber-900">
        {live
            ? "Live data — reports are stored in the CityPulse database. No government affiliation is claimed."
          : "Demo data — all issues shown are clearly labelled demo data. No government affiliation is claimed."}
      </p>
    </header>
  );
}

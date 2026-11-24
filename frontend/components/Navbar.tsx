"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getRole, getToken, logout } from "../lib/api";

export default function Navbar() {
  const [signedIn, setSignedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    setSignedIn(Boolean(getToken()));
    setIsAdmin(getRole() === "admin");
  }, []);

  function handleSignOut() {
    logout();
    window.location.assign("/");
  }

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
          {signedIn && (
            <Link className="rounded px-3 py-2 hover:bg-teal-800" href="/rewards">My Rewards</Link>
          )}
          {isAdmin && (
            <Link className="rounded bg-brand-accent px-3 py-2 font-semibold text-black hover:bg-amber-400" href="/admin">Admin</Link>
          )}
          {signedIn ? (
            <button type="button" onClick={handleSignOut} className="rounded px-3 py-2 hover:bg-teal-800">Sign out</button>
          ) : (
            <Link className="rounded px-3 py-2 hover:bg-teal-800" href="/login">Sign in</Link>
          )}
        </div>
      </nav>
      <p className="bg-amber-100 px-4 py-1 text-center text-xs text-amber-900">
        Live data — reports are stored in the CityPulse database. No government affiliation is claimed.
      </p>
    </header>
  );
}

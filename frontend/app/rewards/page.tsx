"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getMyRewards, getRole } from "../../lib/api";
import type { Reward } from "../../lib/types";

export default function RewardsPage() {
  const [rewards, setRewards] = useState<Reward[] | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    setSignedIn(getRole() !== null);
    (async () => {
      setRewards(await getMyRewards());
    })();
  }, []);

  const totalPoints = (rewards ?? []).reduce((s, r) => s + r.reward_points, 0);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Rewards</h1>
        <p className="text-sm text-gray-600">
          Every report gets 3 days to be resolved. For every day we are late,
          you earn 1,000 points — and a promo code worth ₹100 off per 1,000
          points on government challan / bill payments.
        </p>
      </div>

      {rewards === null ? (
        <p>Loading…</p>
      ) : rewards.length === 0 ? (
        <section className="rounded-lg border bg-white p-4">
          <p className="text-sm text-gray-700">No rewards yet.</p>
          <p className="mt-1 text-sm text-gray-600">
            {signedIn
              ? "None of your reports has gone past its 3-day deadline. Report an issue and track it here."
              : "Sign in to see the rewards on your reports, or report an issue first."}
          </p>
          <div className="mt-3 flex gap-3">
            <Link href="/report" className="rounded bg-brand-teal px-4 py-2 font-semibold text-white">
              Report an issue
            </Link>
            {!signedIn && (
              <Link href="/login" className="rounded border px-4 py-2 font-semibold">
                Sign in
              </Link>
            )}
          </div>
        </section>
      ) : (
        <>
          <p className="text-sm font-semibold">
            Total overdue points: {totalPoints.toLocaleString("en-IN")}
          </p>
          <div className="space-y-4">
            {rewards.map((r) => (
              <section key={r.complaint_id} className="rounded-lg border border-amber-300 bg-amber-50 p-4">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <Link href={`/complaints/${r.complaint_id}`} className="font-bold hover:underline">
                    {r.ticket_no}
                  </Link>
                  <span className="text-sm text-gray-700">{r.status}</span>
                </div>
                <p className="text-sm text-gray-700">
                  {r.category} · overdue by {r.days_overdue} day{r.days_overdue === 1 ? "" : "s"} ·{" "}
                  {r.reward_points.toLocaleString("en-IN")} points
                </p>
                {r.promo_code && (
                  <div className="mt-2 rounded border bg-white p-3">
                    <p className="text-sm text-gray-600">Promo code</p>
                    <p className="text-lg font-bold tracking-wider">{r.promo_code}</p>
                    <p className="text-sm text-gray-800">
                      Worth ₹{r.promo_value_inr} off on government challan / bill payments.
                    </p>
                    <button
                      type="button"
                      className="mt-2 rounded border px-3 py-1 text-sm font-semibold"
                      onClick={() => {
                        navigator.clipboard?.writeText(r.promo_code ?? "").catch(() => {});
                        setCopied(r.promo_code);
                      }}
                    >
                      {copied === r.promo_code ? "Copied" : "Copy code"}
                    </button>
                  </div>
                )}
              </section>
            ))}
          </div>
          <p className="text-xs text-gray-500">
            Demo promo codes for the buildathon — they cannot be used on a real
            payment portal yet. Codes are emailed to you when your report goes
            overdue, if you gave an email address.
          </p>
        </>
      )}
    </div>
  );
}

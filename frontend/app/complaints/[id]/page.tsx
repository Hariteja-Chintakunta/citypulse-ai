"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import StatusTimeline from "../../../components/StatusTimeline";
import { getComplaint, getComplaintHistory, getReward, isDemoMode, sendPromoCodeEmail } from "../../../lib/api";
import type { Complaint, Reward, StatusHistoryItem } from "../../../lib/types";

export default function ComplaintDetailPage() {
  const params = useParams();
  const id = String(params.id ?? "");
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [history, setHistory] = useState<StatusHistoryItem[]>([]);
  const [reward, setReward] = useState<Reward | null>(null);
  const [copied, setCopied] = useState(false);
  const emailSentFor = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const found = await getComplaint(id);
      if (cancelled) return;
      setComplaint(found);
      if (found) {
        const h = await getComplaintHistory(id);
        if (cancelled) return;
        setHistory(
          h.length > 0
          ? h
          : [{ old_status: null, new_status: found.status, remarks: isDemoMode() ? "Report created by citizen. (Demo data)" : "Report created by citizen.", created_at: found.created_at }],
          );
        const r = await getReward(id);
        if (cancelled) return;
        setReward(r);
        // A brand-new promo code goes to the reporter's email once, if
        // they gave one. The code stays visible here either way.
        if (
          r && r.promo_code_new && r.promo_code && r.reporter_email &&
          emailSentFor.current !== r.promo_code
        ) {
          emailSentFor.current = r.promo_code;
          sendPromoCodeEmail({
            ticket_no: r.ticket_no,
            category: r.category,
            points: r.reward_points,
            promo_code: r.promo_code,
            value_inr: r.promo_value_inr,
            email: r.reporter_email,
            phone: r.reporter_phone,
          }).catch(() => {});
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (!complaint) {
    return (
      <div className="mx-auto max-w-2xl">
        <p>Loading…</p>
        <p className="text-sm text-gray-600">
          If this ticket does not appear, it may not exist, or log in to see
          live tickets.{" "}
          <Link href="/" className="font-semibold text-brand-teal">Back to home</Link>
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <p className="text-sm text-gray-500">
          <Link href="/" className="hover:underline">← All reports</Link>
        </p>
        <h1 className="mt-1 text-2xl font-bold" data-testid="ticket-number">{complaint.ticket_no}</h1>
        <p className="text-gray-700">{complaint.category} · {complaint.ward}</p>
        <p className="mt-1 text-sm">
          Status: <strong data-testid="complaint-status">{complaint.status}</strong>
          {" · "}Severity: {complaint.severity} (estimate)
          {complaint.is_demo ? " · Demo data" : ""}
        </p>
      </div>

      <section className="rounded-lg border bg-white p-4">
        <h2 className="font-semibold">What was reported</h2>
        <p className="mt-1 text-sm text-gray-800">{complaint.description}</p>
        <p className="mt-2 text-sm text-gray-600">
          {complaint.address} · {complaint.latitude}, {complaint.longitude}
        </p>
        <p className="text-xs text-gray-500">
          Reported {new Date(complaint.created_at).toLocaleString("en-IN")}. Reports are unverified until reviewed.
        </p>
      </section>

      <div className="rounded-lg border bg-white p-4">
        <StatusTimeline history={history} currentStatus={complaint.status} />
      </div>

      {reward && (
        <section className="rounded-lg border border-amber-300 bg-amber-50 p-4">
          <h2 className="font-semibold">Resolution promise &amp; reward</h2>
          <p className="mt-1 text-sm text-gray-800">
            We will resolve this within 3 days
            {reward.sla_deadline
              ? ` — by ${new Date(reward.sla_deadline).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}`
              : ""}
            .
          </p>
          {reward.days_overdue > 0 ? (
            <>
              <p className="mt-1 text-sm font-semibold text-amber-900">
                Overdue by {reward.days_overdue} day{reward.days_overdue === 1 ? "" : "s"} — you earned {reward.reward_points.toLocaleString("en-IN")} points.
              </p>
              {reward.promo_code && (
                <div className="mt-3 rounded border bg-white p-3">
                  <p className="text-sm text-gray-600">Your promo code</p>
                  <p className="text-xl font-bold tracking-wider">{reward.promo_code}</p>
                  <p className="text-sm text-gray-800">
                    Worth ₹{reward.promo_value_inr} off on government challan / bill payments.
                  </p>
                  <button
                    type="button"
                    className="mt-2 rounded border px-3 py-1 text-sm font-semibold"
                    onClick={() => {
                      navigator.clipboard?.writeText(reward.promo_code ?? "").catch(() => {});
                      setCopied(true);
                    }}
                  >
                    {copied ? "Copied" : "Copy code"}
                  </button>
                  <p className="mt-2 text-xs text-gray-500">
                    Demo promo code for the buildathon — it cannot be used on a
                    real payment portal yet. It was sent to your email
                    {reward.reporter_email ? ` (${reward.reporter_email})` : " if you gave one"}.
                  </p>
                </div>
              )}
            </>
          ) : (
            <p className="mt-1 text-sm text-gray-600">
              {complaint.status === "RESOLVED"
                ? "Resolved on time — no overdue points on this ticket."
                : "On track so far. If we miss the 3-day deadline, you earn 1,000 points for every day we are late, plus a promo code."}
            </p>
          )}
        </section>
      )}

      <section className="rounded-lg border bg-white p-4">
        <h2 className="font-semibold">Comments</h2>
        <p className="mt-1 text-sm text-gray-600">
          Comments are available in the full-stack version (POST /api/v1/complaints/{"{id}"}/comments). Demo comments are not stored.
        </p>
      </section>
    </div>
  );
}

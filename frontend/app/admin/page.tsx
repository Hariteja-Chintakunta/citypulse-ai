"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import CityMap from "../../components/CityMap";
import ComplaintCard from "../../components/ComplaintCard";
import { getComplaints } from "../../lib/store";
import { getMe, getRole, getToken, isDemoMode, loadComplaints, updateStatus } from "../../lib/api";
import { NEXT_STATUS } from "../../lib/types";
import type { Complaint, ComplaintStatus } from "../../lib/types";

export default function AdminPage() {
  const [complaints, setComplaints] = useState<Complaint[]>(() => getComplaints());
  const [live, setLive] = useState(false);
  // Admin portal is password-gated: only a signed-in admin may see it.
  const [allowed, setAllowed] = useState<boolean | null>(null);

    useEffect(() => {
      (async () => {
        if (!getToken()) {
          setAllowed(false);
          return;
        }
        let role = getRole();
        if (!role) {
          try {
            role = (await getMe()).role;
          } catch {
            role = null;
          }
        }
        setAllowed(role === "admin");
      })();
    }, []);

  useEffect(() => {
    if (allowed !== true) return;
    setLive(!isDemoMode());
    loadComplaints().then(setComplaints).catch(() => {});
  }, [allowed]);
  
  const [selectedId, setSelectedId] = useState<string>("");
  const [newStatus, setNewStatus] = useState<ComplaintStatus>("UNDER REVIEW");
  const [remarks, setRemarks] = useState("");
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const selected = complaints.find((c) => c.id === selectedId) ?? null;

  const stats = useMemo(() => {
    const total = complaints.length;
    const resolved = complaints.filter((c) => c.status === "RESOLVED").length;
    const open = complaints.filter(
      (c) => !["RESOLVED", "REJECTED", "DUPLICATE_MERGED"].includes(c.status),
    ).length;
    const needsReview = complaints.filter(
      (c) => c.status === "SUBMITTED" || c.status === "UNDER REVIEW",
    ).length;
    return { total, resolved, open, needsReview };
  }, [complaints]);

  const queue = complaints.filter((c) => c.status === "SUBMITTED" || c.status === "UNDER REVIEW");

  const byWard = useMemo(() => {
    const counts = new Map<string, number>();
    for (const c of complaints) counts.set(c.ward, (counts.get(c.ward) ?? 0) + 1);
    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  }, [complaints]);

  const byCategory = useMemo(() => {
    const counts = new Map<string, number>();
    for (const c of complaints) counts.set(c.category, (counts.get(c.category) ?? 0) + 1);
    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  }, [complaints]);

  async function applyUpdate() {
    setError("");
    setMessage("");
    if (!selected) {
      setError("Select a complaint from the review queue first.");
      return;
    }
    const allowed = NEXT_STATUS[selected.status] ?? [];
    if (!allowed.includes(newStatus)) {
      setError(`Invalid transition: ${selected.status} → ${newStatus}. Allowed: ${allowed.join(", ") || "none"}.`);
      return;
    }
    if ((newStatus === "REJECTED" || newStatus === "DUPLICATE_MERGED") && !reason.trim()) {
      setError(`A reason is required for ${newStatus}.`);
      return;
    }
    try {
      const updated = await updateStatus(
        selected.id,
        newStatus,
        remarks || undefined,
        reason || undefined,
        );
      setComplaints(await loadComplaints());
      setMessage(`${updated.ticket_no} moved to ${newStatus}. The citizen is notified.`);
      setRemarks("");
      setReason("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Status update failed.");
    }
  }

    if (allowed === null) {
      return (
        <div className="mx-auto max-w-2xl space-y-4">
        <p>Checking access…</p>
        </div>
        );
    }

    if (!allowed) {
      return (
        <div className="mx-auto max-w-2xl space-y-4">
          <h1 className="text-2xl font-bold">Admin portal</h1>
          <p className="text-sm text-gray-700">
          This area is for CityPulse admins only. Sign in with an admin
          account and its password to continue.
          </p>
          <Link href="/login" className="inline-block rounded bg-brand-teal px-4 py-2 font-semibold text-white">
            Sign in as admin
          </Link>
          <p className="text-sm">
          <Link href="/" className="font-semibold text-brand-teal">Back to the citizen portal</Link>
          </p>
        </div>
        );
    }
        
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Admin dashboard</h1>
      <p className="text-sm text-gray-600">
        Review queue, verification, status updates and quality metrics. Admin
        actions are enforced server-side in the full-stack version
        {live ? " — you are viewing live data." : "; this demo applies the same transition rules in the browser."}
      </p>

      <section aria-label="Overview" className="grid grid-cols-2 gap-3 text-center sm:grid-cols-4">
        {[
          ["Total", stats.total, "metric-total"],
          ["Open", stats.open, "metric-open"],
          ["Resolved", stats.resolved, "metric-resolved"],
          ["Needs review", stats.needsReview, "metric-review"],
        ].map(([label, value, testId]) => (
          <div key={label as string} className="rounded-lg border bg-white p-4">
            <p className="text-2xl font-bold" data-testid={testId as string}>{value as number}</p>
            <p className="text-sm text-gray-600">{label as string}</p>
          </div>
        ))}
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section aria-label="Review queue" className="space-y-3">
          <h2 className="text-lg font-bold">Review queue</h2>
          {queue.length === 0 && <p className="text-sm text-gray-600">Queue is clear — nothing awaiting review.</p>}
          <ul data-testid="admin-queue" className="space-y-2">
            {queue.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  data-testid={`queue-item-${c.ticket_no}`}
                  onClick={() => {
                    setSelectedId(c.id);
                    setNewStatus(NEXT_STATUS[c.status]?.[0] ?? "UNDER REVIEW");
                  }}
                  className={`w-full rounded-lg border p-3 text-left ${selectedId === c.id ? "border-brand-teal bg-teal-50" : "bg-white"}`}
                >
                  <span className="font-bold text-brand-teal">{c.ticket_no}</span>
                  {" — "}{c.category} · {c.ward} · {c.status}
                </button>
              </li>
            ))}
          </ul>

          {selected && (
            <div className="rounded-lg border bg-white p-4" data-testid="admin-manage-panel">
              <h3 className="font-bold">Manage {selected.ticket_no}</h3>
              <p className="text-sm text-gray-700">{selected.description}</p>
              <p className="text-sm">Current status: <strong>{selected.status}</strong></p>
              <label className="mt-3 block text-sm font-medium" htmlFor="admin-status-select">New status</label>
              <select
                id="admin-status-select"
                data-testid="admin-status-select"
                className="mt-1 w-full rounded border px-3 py-2"
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as ComplaintStatus)}
              >
                {(NEXT_STATUS[selected.status] ?? []).map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <label className="mt-3 block text-sm font-medium" htmlFor="admin-remarks">Remarks</label>
              <textarea
                id="admin-remarks"
                data-testid="admin-remarks"
                className="mt-1 w-full rounded border px-3 py-2"
                rows={2}
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="What was checked or done?"
              />
              {(newStatus === "REJECTED" || newStatus === "DUPLICATE_MERGED") && (
                <>
                  <label className="mt-3 block text-sm font-medium" htmlFor="admin-reason">Reason (required)</label>
                  <input
                    id="admin-reason"
                    data-testid="admin-reason"
                    className="mt-1 w-full rounded border px-3 py-2"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Why is this rejected / merged?"
                  />
                </>
              )}
              {error && <p role="alert" data-testid="admin-error" className="mt-2 text-sm text-red-700">{error}</p>}
              {message && <p role="status" data-testid="admin-message" className="mt-2 text-sm text-green-800">{message}</p>}
              <button
                type="button"
                data-testid="admin-update-status"
                onClick={applyUpdate}
                className="mt-3 rounded bg-brand-teal px-4 py-2 font-semibold text-white"
              >
                Update status
              </button>
            </div>
          )}
        </section>

        <section aria-label="Analytics" className="space-y-4">
          <h2 className="text-lg font-bold">Analytics</h2>
          <div className="rounded-lg border bg-white p-4">
            <h3 className="font-semibold">Reports by ward</h3>
            <ul className="mt-2 space-y-1 text-sm">
              {byWard.map(([ward, count]) => (
                <li key={ward} className="flex justify-between"><span>{ward}</span><strong>{count}</strong></li>
              ))}
            </ul>
          </div>
          <div className="rounded-lg border bg-white p-4">
            <h3 className="font-semibold">Reports by category</h3>
            <ul className="mt-2 space-y-1 text-sm">
              {byCategory.map(([cat, count]) => (
                <li key={cat} className="flex justify-between"><span>{cat}</span><strong>{count}</strong></li>
              ))}
            </ul>
          </div>
          <div className="rounded-lg border bg-white p-4">
            <h3 className="font-semibold">Quality — AI review</h3>
            <p className="mt-1 text-sm text-gray-700">
              Low-confidence AI outputs are routed to human review (threshold
              70). Reports the AI is unsure about appear in the review queue
              above until an admin verifies them.
            </p>
          </div>
        </section>
      </div>

      <section aria-label="Map hotspots">
        <h2 className="text-lg font-bold">Map hotspots</h2>
        <div className="mt-3"><CityMap complaints={complaints} height={320} /></div>
      </section>

      <section aria-label="All complaints">
        <h2 className="text-lg font-bold">All complaints</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {complaints.map((c) => (
            <ComplaintCard key={c.id} complaint={c} />
          ))}
        </div>
      </section>
    </div>
  );
}

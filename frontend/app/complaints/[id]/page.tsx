"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import StatusTimeline from "../../../components/StatusTimeline";
import { getComplaint, getComplaintHistory, isDemoMode } from "../../../lib/api";
import type { Complaint, StatusHistoryItem } from "../../../lib/types";

export default function ComplaintDetailPage() {
  const params = useParams();
  const id = String(params.id ?? "");
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [history, setHistory] = useState<StatusHistoryItem[]>([]);

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

      <section className="rounded-lg border bg-white p-4">
        <h2 className="font-semibold">Comments</h2>
        <p className="mt-1 text-sm text-gray-600">
          Comments are available in the full-stack version (POST /api/v1/complaints/{"{id}"}/comments). Demo comments are not stored.
        </p>
      </section>
    </div>
  );
}

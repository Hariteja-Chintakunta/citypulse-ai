import Link from "next/link";
import type { Complaint } from "../lib/types";

const STATUS_STYLES: Record<string, string> = {
  SUBMITTED: "bg-blue-100 text-blue-900",
  "UNDER REVIEW": "bg-amber-100 text-amber-900",
  VERIFIED: "bg-teal-100 text-teal-900",
  "IN PROGRESS": "bg-purple-100 text-purple-900",
  RESOLVED: "bg-green-100 text-green-900",
  REJECTED: "bg-red-100 text-red-900",
  DUPLICATE_MERGED: "bg-gray-200 text-gray-800",
};

export default function ComplaintCard({ complaint }: { complaint: Complaint }) {
  return (
    <article data-testid="complaint-card" className="rounded-lg border bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Link href={`/complaints/${complaint.id}`} className="font-bold text-brand-teal hover:underline">
          {complaint.ticket_no}
        </Link>
        <span className={`rounded-full px-2 py-1 text-xs font-semibold ${STATUS_STYLES[complaint.status] ?? "bg-gray-100"}`}>
          {complaint.status}
        </span>
      </div>
      <p className="mt-1 font-semibold">{complaint.category} · {complaint.ward}</p>
      <p className="text-sm text-gray-700">{complaint.description}</p>
      <p className="mt-1 text-xs text-gray-500">
        {complaint.address} · {new Date(complaint.created_at).toLocaleDateString("en-IN")}
        {complaint.is_demo ? " · Demo data" : ""}
      </p>
    </article>
  );
}

"use client";

import { useState } from "react";
import type { AlertItem } from "../../lib/types";

export default function AlertsPage() {
  // No seeded alerts: the list starts empty and only shows alerts
  // citizens report from this page.
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [kind, setKind] = useState<"rain" | "traffic">("rain");
  const [title, setTitle] = useState("");
  const [detail, setDetail] = useState("");
  const [ward, setWard] = useState("Jubilee Hills");
  const [message, setMessage] = useState("");

  function submitAlert(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !detail.trim()) return;
    const alert: AlertItem = {
      id: `local-${Date.now()}`,
      kind,
      title: title.trim(),
      detail: detail.trim(),
      ward,
      created_at: new Date().toISOString(),
    };
    setAlerts([alert, ...alerts]);
    setTitle("");
    setDetail("");
    setMessage("Alert reported. Alerts are citizen-reported and unverified until reviewed.");
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Rain &amp; traffic alerts</h1>
      <p className="text-sm text-gray-600">
        Citizen-reported flooding locations and congestion. Alerts are
        unverified reports, not official advisories.
      </p>

      <section aria-label="Current alerts">
      {alerts.length === 0 ? (
      <p className="text-sm text-gray-600">No alerts right now — be the first to report one below.</p>
      ) : (
          <ul className="space-y-2">
          {alerts.map((a) => (
            <li key={a.id} data-testid="alert-item" className="rounded-lg border bg-white p-4">
              <p className="font-semibold">
                <span className={`mr-2 rounded-full px-2 py-0.5 text-xs ${a.kind === "rain" ? "bg-blue-100 text-blue-900" : "bg-amber-100 text-amber-900"}`}>
                  {a.kind === "rain" ? "Rain / waterlogging" : "Traffic"}
                </span>
                {a.title}
              </p>
              <p className="mt-1 text-sm text-gray-700">{a.detail}</p>
              <p className="text-xs text-gray-500">{a.ward} · {new Date(a.created_at).toLocaleString("en-IN")}</p>
            </li>
          ))}
        </ul>
      )}
      </section>

      <section aria-label="Report an alert" className="rounded-lg border bg-white p-4">
        <h2 className="font-bold">Report an alert</h2>
        <form onSubmit={submitAlert} className="mt-3 space-y-3">
          <div>
            <label className="text-sm font-medium" htmlFor="alert-kind">Type</label>
            <select id="alert-kind" data-testid="alert-kind" className="mt-1 w-full rounded border px-3 py-2" value={kind} onChange={(e) => setKind(e.target.value as "rain" | "traffic")}>
              <option value="rain">Rain / waterlogging</option>
              <option value="traffic">Traffic congestion</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium" htmlFor="alert-title">Title</label>
            <input id="alert-title" data-testid="alert-title" className="mt-1 w-full rounded border px-3 py-2" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Waterlogging near the underpass" />
          </div>
          <div>
            <label className="text-sm font-medium" htmlFor="alert-detail">Details</label>
            <textarea id="alert-detail" data-testid="alert-detail" className="mt-1 w-full rounded border px-3 py-2" rows={2} value={detail} onChange={(e) => setDetail(e.target.value)} placeholder="What is happening, and where?" />
          </div>
          <button type="submit" data-testid="alert-submit" className="rounded bg-brand-teal px-4 py-2 font-semibold text-white">Report alert</button>
          {message && <p role="status" className="text-sm text-green-800">{message}</p>}
        </form>
      </section>
    </div>
  );
}
